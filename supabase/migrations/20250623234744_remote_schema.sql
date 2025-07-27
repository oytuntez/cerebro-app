

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."assign_user_data"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r record;
  new_username text;
  new_has_set_password boolean;
begin
  for r in (select * from auth.users) loop
    if not exists (select 1 from users where id = r.id) then
      new_username := generate_username(r.email);
      new_username := substr(new_username, 1, 255);
      new_has_set_password := case when r.encrypted_password is null or r.encrypted_password = '' then false else true end;
      insert into users (id, has_set_password, username, full_name, avatar_url) values (r.id, new_has_set_password, new_username, new_username, r.raw_user_meta_data ->> 'avatar_url');
      insert into emails (user_id, email) values (r.id, r.email);
      insert into notifications (user_id) values (r.id);
    end if;
  end loop;
end;
$$;


ALTER FUNCTION "public"."assign_user_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_posts"("userid" "uuid", "posttype" "text" DEFAULT 'post'::"text", "q" "text" DEFAULT NULL::"text") RETURNS TABLE("status" "text", "count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if q is not null then
    return query
    select p.status, count(*)
    from posts p
    where p.user_id = userid and p.type = posttype and to_tsvector(title) @@ to_tsquery(q)
    group by p.status;
  else
    return query
    select p.status, count(*)
    from posts p
    where p.user_id = userid and p.type = posttype
    group by p.status;
  end if;
end;
$$;


ALTER FUNCTION "public"."count_posts"("userid" "uuid", "posttype" "text", "q" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_posts"("data" "json"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r json;
  postid bigint;
begin
  foreach r in array data loop
    insert into posts
    (created_at,updated_at,deleted_at,date,user_id,type,status,password,title,slug,description,keywords,content,thumbnail_url,permalink,is_ban,banned_until)
    values
    (
      coalesce((r ->> 'created_at')::timestamptz, now()),
      coalesce((r ->> 'updated_at')::timestamptz, now()),
      (r ->> 'deleted_at')::timestamptz,
      (r ->> 'date')::timestamptz,
      (r ->> 'user_id')::uuid,
      coalesce((r ->> 'type')::text, 'post'),
      coalesce((r ->> 'status')::text, 'draft'),
      (r ->> 'password')::varchar(255),
      (r ->> 'title')::text,
      (r ->> 'slug')::text,
      (r ->> 'description')::text,
      (r ->> 'keywords')::text,
      (r ->> 'content')::text,
      (r ->> 'thumbnail_url')::text,
      (r ->> 'permalink')::text,
      coalesce((r ->> 'is_ban')::boolean, false),
      (r ->> 'banned_until')::timestamptz
    );
  end loop;
end;
$$;


ALTER FUNCTION "public"."create_new_posts"("data" "json"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_user"("useremail" "text", "password" "text" DEFAULT NULL::"text", "metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  user_id uuid;
  encrypted_pw text;
  app_metadata jsonb;
begin
  select id into user_id from auth.users where email = useremail;

  if user_id is null then
    user_id := gen_random_uuid();
    encrypted_pw := crypt(password, gen_salt('bf'));
    app_metadata := '{"provider":"email","providers":["email"]}'::jsonb || metadata::jsonb;

    insert into auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    values
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', useremail, encrypted_pw, now(), now(), now(), now(), app_metadata, '{}', now(), now(), '', '', '', '');

    insert into auth.identities
    (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values
    (gen_random_uuid(), user_id, format('{"sub":"%s","email":"%s"}', user_id::text, useremail)::jsonb, 'email', now(), now(), now());
  end if;

  return user_id;
end;
$$;


ALTER FUNCTION "public"."create_new_user"("useremail" "text", "password" "text", "metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."daily_delete_old_cron_job_run_details"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from cron.job_run_details where start_time < now() - interval '30 days';
end;
$$;


ALTER FUNCTION "public"."daily_delete_old_cron_job_run_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user"("useremail" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  if exists (select 1 from auth.users where email = useremail) then
    delete from auth.users where email = useremail;
  end if;
end;
$$;


ALTER FUNCTION "public"."delete_user"("useremail" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_password"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return trim(both from (encode(decode(md5(random()::text || current_timestamp || random()),'hex'),'base64')), '=');
end;
$$;


ALTER FUNCTION "public"."generate_password"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_post_slug"("userid" "uuid", "postslug" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
begin
  old_slug := postslug;
  new_slug := old_slug;

  select exists(select 1 from posts where user_id = userid and slug = new_slug) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from posts where user_id = userid and slug = new_slug) into slug_exists;
  end loop;

  return new_slug;
end;
$$;


ALTER FUNCTION "public"."generate_post_slug"("userid" "uuid", "postslug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_tag_slug"("userid" "uuid", "tagslug" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
begin
  old_slug := tagslug;
  new_slug := old_slug;

  select exists(select 1 from tags where user_id = userid and slug = new_slug) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from tags where user_id = userid and slug = new_slug) into slug_exists;
  end loop;

  return new_slug;
end;
$$;


ALTER FUNCTION "public"."generate_tag_slug"("userid" "uuid", "tagslug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_username"("email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  new_username text;
  username_exists boolean;
begin
  new_username := lower(split_part(email, '@', 1));
  select exists(select 1 from users where username = new_username) into username_exists;

  while username_exists loop
    new_username := new_username || '_' || to_char(trunc(random()*1000000), 'fm000000');
    select exists(select 1 from users where username = new_username) into username_exists;
  end loop;

  return new_username;
end;
$$;


ALTER FUNCTION "public"."generate_username"("email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_adjacent_post_id"("postid" bigint, "userid" "uuid", "posttype" "text" DEFAULT 'post'::"text", "poststatus" "text" DEFAULT 'publish'::"text") RETURNS TABLE("previous_id" bigint, "next_id" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select max(case when id < postid then id end), min(case when id > postid then id end)
  from posts
  where user_id = userid and type = posttype and status = poststatus;
end;
$$;


ALTER FUNCTION "public"."get_adjacent_post_id"("postid" bigint, "userid" "uuid", "posttype" "text", "poststatus" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_atlas_sampled_nifti_file"("p_nifti_file_id" "uuid", "p_file_type" "text") RETURNS TABLE("id" "uuid", "file_type" "text", "user_id" "uuid", "parent_nitfi_file_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_file RECORD;
BEGIN
    -- First, select the current file by ID
    SELECT *
    INTO current_file
    FROM public.nifti_files
    WHERE id = p_nifti_file_id;

    -- Check if the current file exists and has the desired file_type
    IF current_file IS NOT NULL AND current_file.file_type = p_file_type THEN
        RETURN QUERY
        SELECT current_file.id, current_file.file_type, current_file.user_id, current_file.parent_nitfi_file_id;
    END IF;

    -- If not, check for children of the parent
    IF current_file IS NOT NULL THEN
        RETURN QUERY
        SELECT *
        FROM public.nifti_files
        WHERE parent_nitfi_file_id = current_file.parent_nitfi_file_id
          AND file_type = p_file_type
        LIMIT 1;  -- Return only one matching row
    ELSE
        -- If the current file does not exist, return NULL
        RETURN QUERY
        SELECT NULL::uuid, NULL::text, NULL::uuid, NULL::uuid
        WHERE FALSE;  -- This will return no rows
    END IF;

    -- If the current file is a parent, check its children
    RETURN QUERY
    SELECT *
    FROM public.nifti_files
    WHERE parent_nitfi_file_id = p_nifti_file_id
      AND file_type = p_file_type
    LIMIT 1;  -- Return only one matching row
END;
$$;


ALTER FUNCTION "public"."get_atlas_sampled_nifti_file"("p_nifti_file_id" "uuid", "p_file_type" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."nifti_files" (
    "id" "uuid" NOT NULL,
    "file_type" "text" DEFAULT '''nii.gz''::text'::"text" NOT NULL,
    "user_id" "uuid",
    "parent_nifti_file_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nifti_files" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_file_type_among_children"("p_nifti_file_id" "uuid", "p_file_type" "text") RETURNS SETOF "public"."nifti_files"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    current_file nifti_files%ROWTYPE;
BEGIN
SELECT *
INTO current_file
FROM public.nifti_files
WHERE id = p_nifti_file_id;

IF current_file IS NOT NULL AND current_file.file_type = p_file_type THEN
        RETURN QUERY
SELECT current_file.id, current_file.file_type, current_file.user_id, current_file.parent_nifti_file_id, current_file.created_at, current_file.created_at;
END IF;

    -- If not, check for children of the parent
IF current_file IS NOT NULL THEN
        RETURN QUERY
SELECT *
FROM public.nifti_files
WHERE (id = current_file.parent_nifti_file_id OR parent_nifti_file_id = current_file.parent_nifti_file_id)
  AND file_type = p_file_type
LIMIT 1;  -- Return only one matching row
ELSE
        -- If the current file does not exist, return NULL
        RETURN QUERY
SELECT NULL::uuid, NULL::text, NULL::uuid, NULL::uuid, NULL::timestamptz, NULL::timestamptz
WHERE FALSE;  -- This will return no rows
END IF;

    -- If the current file is a parent, check its children
RETURN QUERY
SELECT *
FROM public.nifti_files
WHERE file_type = p_file_type AND (id = p_nifti_file_id OR parent_nifti_file_id = p_nifti_file_id)
LIMIT 1;  -- Return only one matching row
END;
$$;


ALTER FUNCTION "public"."get_file_type_among_children"("p_nifti_file_id" "uuid", "p_file_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_post_rank_by_views"("username" "text", "q" "text" DEFAULT ''::"text", "order_by" "text" DEFAULT 'views'::"text", "ascending" boolean DEFAULT true, "per_page" integer DEFAULT 10, "page" integer DEFAULT 1, "head" boolean DEFAULT false) RETURNS TABLE("path" "text", "title" "text", "views" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  _command text;
  _order text;
  _offset integer;
begin
  _order := case when ascending is false then 'desc' else 'asc' end;
  _offset := (page - 1) * per_page;

  if q <> '' then
    if head then
      _command := 'select s.path, s.title, count(*) as views
      from statistics s
      where s.path like ''/'|| username ||'/%%''
        and s.path not like ''/'|| username ||'/favorites''
        and s.title ilike ''%%'|| q ||'%%''
      group by s.path, s.title ';
      return query execute format(_command) using username, q;
    else
      _command := 'select s.path, s.title, count(*) as views
      from statistics s
      where s.path like ''/'|| username ||'/%%''
        and s.path not like ''/'|| username ||'/favorites''
        and s.title ilike ''%%'|| q ||'%%''
      group by s.path, s.title
      order by %I %s limit %s offset %s ';
      return query execute format(_command, order_by, _order, per_page, _offset) using username, q;
    end if;
  else
    if head then
      _command := 'select s.path, s.title, count(*) as views
      from statistics s
      where s.path like ''/'|| username ||'/%%''
        and s.path not like ''/'|| username ||'/favorites''
      group by s.path, s.title ';
      return query execute format(_command) using username;
    else
      _command := 'select s.path, s.title, count(*) as views
      from statistics s
      where s.path like ''/'|| username ||'/%%''
        and s.path not like ''/'|| username ||'/favorites''
      group by s.path, s.title
      order by %I %s limit %s offset %s ';
      return query execute format(_command, order_by, _order, per_page, _offset) using username;
    end if;
  end if;

end;
$$;


ALTER FUNCTION "public"."get_post_rank_by_views"("username" "text", "q" "text", "order_by" "text", "ascending" boolean, "per_page" integer, "page" integer, "head" boolean) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "email" character varying(255),
    "full_name" "text",
    "first_name" "text",
    "last_name" "text",
    "age" integer,
    "avatar_url" "text",
    "website" "text",
    "bio" "text",
    "username" "text",
    "username_changed_at" timestamp with time zone,
    "has_set_password" boolean DEFAULT false NOT NULL,
    "is_ban" boolean DEFAULT false NOT NULL,
    "banned_until" timestamp with time zone,
    "role" "text" DEFAULT 'guest'::"text" NOT NULL,
    "role_changed_at" timestamp with time zone,
    "plan" "text" DEFAULT 'free'::"text" NOT NULL,
    "plan_changed_at" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."updated_at" IS 'on_updated_at';



COMMENT ON COLUMN "public"."users"."username_changed_at" IS 'on_username_updated';



COMMENT ON COLUMN "public"."users"."has_set_password" IS 'on_encrypted_password_updated';



COMMENT ON COLUMN "public"."users"."role" IS 'guest, user, admin, superadmin';



COMMENT ON COLUMN "public"."users"."role_changed_at" IS 'on_role_updated';



COMMENT ON COLUMN "public"."users"."plan" IS 'free, basic, standard, premium';



COMMENT ON COLUMN "public"."users"."plan_changed_at" IS 'on_plan_updated';



CREATE OR REPLACE FUNCTION "public"."get_users"("userrole" "text" DEFAULT NULL::"text", "userplan" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
	if userrole is not null and userplan is not null then
		return query
    select * from users where role = userrole and plan = userplan;
	elsif userrole is not null then
		return query
    select * from users where role = userrole;
	elsif userplan is not null then
    return query
    select * from users where plan = userplan;
	end if;
end;
$$;


ALTER FUNCTION "public"."get_users"("userrole" "text", "userplan" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote"("postid" bigint) RETURNS TABLE("id" bigint, "like_count" bigint, "dislike_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
	return query
	select v.post_id, sum(v.is_like), sum(v.is_dislike) from votes v where v.post_id = postid group by v.post_id;
end;
$$;


ALTER FUNCTION "public"."get_vote"("postid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_has_set_password"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  new_has_set_password boolean;
begin
  new_has_set_password := case when (new.encrypted_password is null or new.encrypted_password = '') then false else true end;
  update users set has_set_password = new_has_set_password where id = new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_has_set_password"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_post"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into postmeta (post_id, meta_key, meta_value) values (new.id, 'views', '0');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_post"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$declare
  new_username text;
  new_has_set_password boolean;
begin
  new_username := generate_username(new.email);
  new_username := substr(new_username, 1, 255);
  new_has_set_password := case when new.encrypted_password is null or new.encrypted_password = '' then false else true end;

  insert into users
  (id, has_set_password, username, full_name, avatar_url)
  values
  (new.id, new_has_set_password, new_username, new_username, new.raw_user_meta_data ->> 'avatar_url');
  
  -- Check if email is provided before inserting into emails table
  IF new.email IS NOT NULL AND new.email <> '' THEN
    insert into emails (user_id, email) values (new.id, new.email);
  END IF;

  insert into notifications (user_id) values (new.id);

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_plan_changed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update users set plan_changed_at = now() where id = new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_plan_changed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_role_changed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update users set role_changed_at = now() where id = new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_role_changed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_username_changed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update users set username_changed_at = now() where id = new.id;

  update posts
  set permalink = replace(permalink, old.username, new.username)
  where user_id = new.id and permalink like '%/'|| old.username ||'/%';

  update statistics
  set path = replace(path, old.username, new.username),
      location = replace(location, old.username, new.username),
      referrer = replace(referrer, old.username, new.username)
  where path like '/'|| old.username ||'/%';

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_username_changed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hourly_publish_future_posts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r record;
  visibility text;
begin
  for r in (select * from posts where status = 'future' and date < now()) loop
    select meta_value into visibility from postmeta where post_id = r.id and meta_key = 'visibility';

    if visibility = 'private' then
      update posts set status = 'private' where id = r.id;
    else
      update posts set status = 'publish' where id = r.id;
    end if;

    update postmeta set meta_value = null where post_id = r.id and meta_key = 'future_date';
  end loop;
end;
$$;


ALTER FUNCTION "public"."hourly_publish_future_posts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_favorite"("postid" bigint, "userid" "uuid", "isfavorite" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if exists (select 1 from favorites where post_id = postid and user_id = userid) then
    update favorites set is_favorite = isfavorite where post_id = postid and user_id = userid;
  else
    insert into favorites(post_id, user_id, is_favorite) values(postid, userid, isfavorite);
  end if;
end;
$$;


ALTER FUNCTION "public"."set_favorite"("postid" bigint, "userid" "uuid", "isfavorite" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_post_meta"("postid" bigint, "metakey" "text", "metavalue" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if exists (select 1 from postmeta where post_id = postid and meta_key = metakey) then
    update postmeta set meta_value = metavalue where post_id = postid and meta_key = metakey;
  else
    insert into postmeta(post_id, meta_key, meta_value) values(postid, metakey, metavalue);
  end if;
end;
$$;


ALTER FUNCTION "public"."set_post_meta"("postid" bigint, "metakey" "text", "metavalue" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_post_tags"("userid" "uuid", "postid" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  tagnames text[];
  tagid bigint;
  metavalue text;
  element jsonb;
begin

	select array_agg(names) into tagnames from (select jsonb_array_elements(meta_value::jsonb)->>'text'::text as names from postmeta where post_id = postid and meta_key = 'tags') t;

 	if array_length(tagnames, 1) > 0 then
		delete from post_tags pt using tags t where pt.user_id = userid and pt.post_id = postid and pt.tag_id = t.id and t.name != all(coalesce(tagnames, array[]::text[]));
  else
		delete from post_tags where user_id = userid and post_id = postid;
 	end if;

  select meta_value into metavalue from postmeta where post_id = postid and meta_key = 'tags';

 	for element in (select * from jsonb_array_elements(metavalue::jsonb)) loop
 		if not exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id where pt.user_id = userid and pt.post_id = postid and t.name = element->>'text') then
 			if exists (select 1 from tags where user_id = userid and name = element->>'text') then
 				select id into tagid from tags where user_id = userid and name = element->>'text';
 			else
	 			insert into tags(user_id, name, slug) values(userid, element->>'text', element->>'slug')
		    returning id into tagid;
	    end if;
 			insert into post_tags(user_id, post_id, tag_id) values(userid, postid, tagid);
 		end if;
 	end loop;

end;
$$;


ALTER FUNCTION "public"."set_post_tags"("userid" "uuid", "postid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_post_views"("postid" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if exists (select 1 from postmeta where post_id = postid and meta_key = 'views') then
    update postmeta set meta_value = meta_value::integer + 1 where post_id = postid and meta_key = 'views';
  else
    insert into postmeta(post_id, meta_key, meta_value) values(postid, 'views', '1');
  end if;
end;
$$;


ALTER FUNCTION "public"."set_post_views"("postid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_statistics"("data" "json") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into statistics
  (visitor_id,user_id,title,location,path,query,referrer,ip,browser,user_agent)
  values
  (
    (data ->> 'visitor_id')::uuid,
    coalesce((data ->> 'user_id')::uuid, null),
    (data ->> 'title')::text,
    (data ->> 'location')::text,
    (data ->> 'path')::text,
    (data ->> 'query')::text,
    (data ->> 'referrer')::text,
    (data ->> 'ip')::inet,
    (data ->> 'browser')::jsonb,
    (data ->> 'user_agent')::text
  );
end;
$$;


ALTER FUNCTION "public"."set_statistics"("data" "json") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "slug" "text",
    "description" "text"
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tags"."updated_at" IS 'on_updated_at';



CREATE OR REPLACE FUNCTION "public"."set_tag"("userid" "uuid", "tagname" "text", "tagslug" "text", "tagdescription" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."tags"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin

  if exists (select 1 from tags where user_id = userid and slug = tagslug) then
    update tags set name = tagname, slug = tagslug, description = tagdescription where user_id = userid and slug = tagslug;
  else
    insert into tags(user_id, name, slug, description) values(userid, tagname, tagslug, tagdescription);
  end if;

  return query
  select * from tags where user_id = userid and slug = tagslug;
end;
$$;


ALTER FUNCTION "public"."set_tag"("userid" "uuid", "tagname" "text", "tagslug" "text", "tagdescription" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tag_meta"("tagid" bigint, "metakey" "text", "metavalue" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if exists (select 1 from tagmeta where tag_id = tagid and meta_key = metakey) then
    update tagmeta set meta_value = metavalue where tag_id = tagid and meta_key = metakey;
  else
    insert into tagmeta(tag_id, meta_key, meta_value) values(tagid, metakey, metavalue);
  end if;
end;
$$;


ALTER FUNCTION "public"."set_tag_meta"("tagid" bigint, "metakey" "text", "metavalue" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usermeta" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "meta_key" character varying(255) NOT NULL,
    "meta_value" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usermeta" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_meta"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."usermeta"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    if exists (select 1 from usermeta where user_id = p_user_id and meta_key = p_meta_key) then
update usermeta set meta_value = p_meta_value, updated_at = now() where user_id = p_user_id and meta_key = p_meta_key;
else
insert into usermeta(user_id, meta_key, meta_value) values(p_user_id, p_meta_key, p_meta_value);
end if;
return QUERY SELECT * FROM usermeta WHERE user_id = p_user_id AND meta_key = p_meta_key;
end;
$$;


ALTER FUNCTION "public"."set_user_meta"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_plan"("userplan" "text", "userid" "uuid" DEFAULT NULL::"uuid", "useremail" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if userid is not null and useremail is not null then
    update users u set plan = userplan from auth.users au where au.id = u.id and au.id = userid and au.email = useremail;
  elsif userid is not null then
    update users u set plan = userplan from auth.users au where au.id = u.id and au.id = userid;
  elsif useremail is not null then
    update users u set plan = userplan from auth.users au where au.id = u.id and au.email = useremail;
  end if;
end;
$$;


ALTER FUNCTION "public"."set_user_plan"("userplan" "text", "userid" "uuid", "useremail" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_role"("userrole" "text", "userid" "uuid" DEFAULT NULL::"uuid", "useremail" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if userid is not null and useremail is not null then
    update users u set role = userrole from auth.users au where au.id = u.id and au.id = userid and au.email = useremail;
  elsif userid is not null then
    update users u set role = userrole from auth.users au where au.id = u.id and au.id = userid;
  elsif useremail is not null then
    update users u set role = userrole from auth.users au where au.id = u.id and au.email = useremail;
  end if;
end;
$$;


ALTER FUNCTION "public"."set_user_role"("userrole" "text", "userid" "uuid", "useremail" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "date" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "type" "text" DEFAULT 'post'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "password" character varying(255),
    "title" "text",
    "slug" "text",
    "description" "text",
    "keywords" "text",
    "content" "text",
    "thumbnail_url" "text",
    "permalink" "text",
    "is_ban" boolean DEFAULT false NOT NULL,
    "banned_until" timestamp with time zone
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."posts"."updated_at" IS 'on_updated_at';



COMMENT ON COLUMN "public"."posts"."type" IS 'post, page, revision';



COMMENT ON COLUMN "public"."posts"."status" IS 'publish, future, draft, pending, private, trash';



COMMENT ON COLUMN "public"."posts"."slug" IS 'on_slug_upsert';



CREATE OR REPLACE FUNCTION "public"."title_content"("public"."posts") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select $1.title || ' ' || $1.content;
$_$;


ALTER FUNCTION "public"."title_content"("public"."posts") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."title_description"("public"."posts") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select $1.title || ' ' || $1.description;
$_$;


ALTER FUNCTION "public"."title_description"("public"."posts") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."title_description_content"("public"."posts") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select $1.title || ' ' || $1.description || ' ' || $1.content;
$_$;


ALTER FUNCTION "public"."title_description_content"("public"."posts") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."title_description_keywords"("public"."posts") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select $1.title || ' ' || $1.description || ' ' || $1.keywords;
$_$;


ALTER FUNCTION "public"."title_description_keywords"("public"."posts") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."title_keywords"("public"."posts") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select $1.title || ' ' || $1.keywords;
$_$;


ALTER FUNCTION "public"."title_keywords"("public"."posts") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."truncate_posts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  truncate table posts restart identity cascade;
end;
$$;


ALTER FUNCTION "public"."truncate_posts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."truncate_statistics"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  truncate table statistics restart identity cascade;
end;
$$;


ALTER FUNCTION "public"."truncate_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unique_post_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
  old_permalink text;
begin
  old_slug := new.slug;
  new_slug := old_slug;
  old_permalink := new.permalink;

  select exists(select 1 from posts where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from posts where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;
  end loop;

  new.slug := new_slug;
  new.permalink := replace(old_permalink, old_slug, new_slug);
  return new;
end;
$$;


ALTER FUNCTION "public"."unique_post_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unique_tag_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  old_slug text;
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
begin
  old_slug := new.slug;
  new_slug := old_slug;

  select exists(select 1 from tags where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;

  while slug_exists loop
    new_slug := old_slug || '-' || counter;
    counter := counter + 1;
    select exists(select 1 from tags where user_id = new.user_id and slug = new_slug and id != coalesce(new.id, 0)) into slug_exists;
  end loop;

  new.slug := new_slug;
  return new;
end;
$$;


ALTER FUNCTION "public"."unique_tag_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."usermeta_upsert"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") RETURNS SETOF "public"."usermeta"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.usermeta WHERE user_id = p_user_id AND meta_key = p_meta_key) THEN
        UPDATE public.usermeta
        SET updated_at = now(),
            meta_value = p_meta_value
        WHERE user_id = p_user_id AND meta_key = p_meta_key;
    ELSE
        INSERT INTO public.usermeta (user_id, meta_key, meta_value)
        VALUES (p_user_id, p_meta_key, p_meta_value);
    END IF;
    RETURN QUERY SELECT * FROM public.usermeta WHERE user_id = p_user_id AND meta_key = p_meta_key;
END;
$$;


ALTER FUNCTION "public"."usermeta_upsert"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_user_password"("userid" "uuid", "password" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
begin
  return exists (
    select id
    from auth.users
    where id = userid
      and encrypted_password = crypt(password::text, auth.users.encrypted_password)
  );
end;
$$;


ALTER FUNCTION "public"."verify_user_password"("userid" "uuid", "password" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emails" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "email_confirmed_at" timestamp with time zone
);


ALTER TABLE "public"."emails" OWNER TO "postgres";


COMMENT ON COLUMN "public"."emails"."updated_at" IS 'on_updated_at';



ALTER TABLE "public"."emails" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."emails_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "is_favorite" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


COMMENT ON COLUMN "public"."favorites"."updated_at" IS 'on_updated_at';



ALTER TABLE "public"."favorites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."freesurfer_cortical_regions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nifti_file_id" "uuid" NOT NULL,
    "hemisphere" "text" NOT NULL,
    "structure_name" "text" NOT NULL,
    "atlas" "text" DEFAULT 'aparc'::"text" NOT NULL,
    "num_vertices" integer,
    "surface_area" double precision,
    "gray_vol" double precision,
    "thick_avg" double precision,
    "thick_std" double precision,
    "mean_curv" double precision,
    "gauss_curv" double precision,
    "fold_ind" integer,
    "curv_ind" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "freesurfer_cortical_regions_hemisphere_check" CHECK (("hemisphere" = ANY (ARRAY['lh'::"text", 'rh'::"text"])))
);


ALTER TABLE "public"."freesurfer_cortical_regions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."freesurfer_curvature_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nifti_file_id" "uuid" NOT NULL,
    "hemisphere" "text" NOT NULL,
    "curv_mean" double precision,
    "curv_std" double precision,
    "curv_min" double precision,
    "curv_min_vertex" integer,
    "curv_max" double precision,
    "curv_max_vertex" integer,
    "surface_area" double precision,
    "num_vertices" integer,
    "vertex_area" double precision,
    "vertex_separation_mean" double precision,
    "vertex_separation_std" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "freesurfer_curvature_stats_hemisphere_check" CHECK (("hemisphere" = ANY (ARRAY['lh'::"text", 'rh'::"text"])))
);


ALTER TABLE "public"."freesurfer_curvature_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."freesurfer_global_measures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nifti_file_id" "uuid" NOT NULL,
    "measure_name" "text" NOT NULL,
    "measure_field" "text" NOT NULL,
    "value" double precision NOT NULL,
    "unit" "text",
    "source_file" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."freesurfer_global_measures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."freesurfer_subcortical_segmentations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nifti_file_id" "uuid" NOT NULL,
    "seg_id" integer NOT NULL,
    "structure_name" "text" NOT NULL,
    "nvoxels" integer,
    "volume_mm3" double precision,
    "norm_mean" double precision,
    "norm_stddev" double precision,
    "norm_min" double precision,
    "norm_max" double precision,
    "norm_range" double precision,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."freesurfer_subcortical_segmentations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."freesurfer_summary_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nifti_file_id" "uuid" NOT NULL,
    "total_brain_volume" double precision,
    "total_cortex_volume" double precision,
    "total_white_matter" double precision,
    "estimated_total_intracranial_volume" double precision,
    "lh_cortex_volume" double precision,
    "lh_surface_area" double precision,
    "lh_mean_thickness" double precision,
    "rh_cortex_volume" double precision,
    "rh_surface_area" double precision,
    "rh_mean_thickness" double precision,
    "lh_mean_curvature" double precision,
    "lh_surface_area_from_curv" double precision,
    "rh_mean_curvature" double precision,
    "rh_surface_area_from_curv" double precision,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."freesurfer_summary_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insights" (
    "id" bigint NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."insights" OWNER TO "postgres";


COMMENT ON TABLE "public"."insights" IS 'Insight type definitions';



ALTER TABLE "public"."insights" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."insights_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."items" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying NOT NULL
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "marketing_emails" boolean DEFAULT false NOT NULL,
    "security_emails" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notifications"."updated_at" IS 'on_updated_at';



ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post_tags" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "public"."post_tags" OWNER TO "postgres";


ALTER TABLE "public"."post_tags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."postmeta" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "meta_key" character varying(255) NOT NULL,
    "meta_value" "text"
);


ALTER TABLE "public"."postmeta" OWNER TO "postgres";


ALTER TABLE "public"."postmeta" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."postmeta_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."private_items" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying NOT NULL
);


ALTER TABLE "public"."private_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_volumes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "nifti_file_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "volume" double precision NOT NULL,
    "atlas_type" "text"
);


ALTER TABLE "public"."roi_volumes" OWNER TO "postgres";


ALTER TABLE "public"."roi_volumes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."roi_volumes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "text" NOT NULL,
    "permission" "text" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."statistics" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visitor_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "location" "text",
    "path" "text",
    "query" "text",
    "referrer" "text",
    "ip" "inet",
    "browser" "jsonb",
    "user_agent" "text"
);


ALTER TABLE "public"."statistics" OWNER TO "postgres";


ALTER TABLE "public"."statistics" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."statistics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tagmeta" (
    "id" bigint NOT NULL,
    "tag_id" bigint NOT NULL,
    "meta_key" character varying(255) NOT NULL,
    "meta_value" "text"
);


ALTER TABLE "public"."tagmeta" OWNER TO "postgres";


ALTER TABLE "public"."tagmeta" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tagmeta_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."tags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_insight_outputs" (
    "id" bigint NOT NULL,
    "user_insight_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "value" "text" NOT NULL,
    "type" "text"
);


ALTER TABLE "public"."user_insight_outputs" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_insight_outputs" IS 'Freeform output storage for each insight generated';



ALTER TABLE "public"."user_insight_outputs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_insight_outputs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_insights" (
    "id" bigint NOT NULL,
    "insight_id" bigint NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archived_at" timestamp with time zone,
    "nifti_file_id" "uuid"
);


ALTER TABLE "public"."user_insights" OWNER TO "postgres";


ALTER TABLE "public"."user_insights" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_insights_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."usermeta" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."usermeta_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "is_like" smallint DEFAULT 0 NOT NULL,
    "is_dislike" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."votes"."updated_at" IS 'on_updated_at';



ALTER TABLE "public"."votes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_user_id_email_key" UNIQUE ("user_id", "email");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."freesurfer_cortical_regions"
    ADD CONSTRAINT "freesurfer_cortical_regions_nifti_file_id_hemisphere_struct_key" UNIQUE ("nifti_file_id", "hemisphere", "structure_name", "atlas");



ALTER TABLE ONLY "public"."freesurfer_cortical_regions"
    ADD CONSTRAINT "freesurfer_cortical_regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freesurfer_curvature_stats"
    ADD CONSTRAINT "freesurfer_curvature_stats_nifti_file_id_hemisphere_key" UNIQUE ("nifti_file_id", "hemisphere");



ALTER TABLE ONLY "public"."freesurfer_curvature_stats"
    ADD CONSTRAINT "freesurfer_curvature_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freesurfer_global_measures"
    ADD CONSTRAINT "freesurfer_global_measures_nifti_file_id_measure_name_key" UNIQUE ("nifti_file_id", "measure_name");



ALTER TABLE ONLY "public"."freesurfer_global_measures"
    ADD CONSTRAINT "freesurfer_global_measures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freesurfer_subcortical_segmentations"
    ADD CONSTRAINT "freesurfer_subcortical_segmentations_nifti_file_id_seg_id_key" UNIQUE ("nifti_file_id", "seg_id");



ALTER TABLE ONLY "public"."freesurfer_subcortical_segmentations"
    ADD CONSTRAINT "freesurfer_subcortical_segmentations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freesurfer_summary_stats"
    ADD CONSTRAINT "freesurfer_summary_stats_nifti_file_id_key" UNIQUE ("nifti_file_id");



ALTER TABLE ONLY "public"."freesurfer_summary_stats"
    ADD CONSTRAINT "freesurfer_summary_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nifti_files"
    ADD CONSTRAINT "nifti_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_tags"
    ADD CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_tags"
    ADD CONSTRAINT "post_tags_user_id_post_id_tag_id_key" UNIQUE ("user_id", "post_id", "tag_id");



ALTER TABLE ONLY "public"."postmeta"
    ADD CONSTRAINT "postmeta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."postmeta"
    ADD CONSTRAINT "postmeta_post_id_meta_key_key" UNIQUE ("post_id", "meta_key");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_volumes"
    ADD CONSTRAINT "roi_volumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."statistics"
    ADD CONSTRAINT "statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tagmeta"
    ADD CONSTRAINT "tagmeta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tagmeta"
    ADD CONSTRAINT "tagmeta_tag_id_meta_key_key" UNIQUE ("tag_id", "meta_key");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_insight_outputs"
    ADD CONSTRAINT "user_insight_outputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usermeta"
    ADD CONSTRAINT "usermeta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usermeta"
    ADD CONSTRAINT "usermeta_user_id_meta_key_key" UNIQUE ("user_id", "meta_key");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_post_id_key" UNIQUE ("user_id", "post_id");



CREATE INDEX "emails_email_idx" ON "public"."emails" USING "btree" ("email");



CREATE INDEX "emails_user_id_idx" ON "public"."emails" USING "btree" ("user_id");



CREATE INDEX "favorites_post_id_idx" ON "public"."favorites" USING "btree" ("post_id");



CREATE INDEX "favorites_user_id_idx" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_freesurfer_cortical_regions_atlas" ON "public"."freesurfer_cortical_regions" USING "btree" ("atlas");



CREATE INDEX "idx_freesurfer_cortical_regions_hemisphere" ON "public"."freesurfer_cortical_regions" USING "btree" ("hemisphere");



CREATE INDEX "idx_freesurfer_cortical_regions_nifti_file_id" ON "public"."freesurfer_cortical_regions" USING "btree" ("nifti_file_id");



CREATE INDEX "idx_freesurfer_cortical_regions_structure" ON "public"."freesurfer_cortical_regions" USING "btree" ("structure_name");



CREATE INDEX "idx_freesurfer_curvature_stats_hemisphere" ON "public"."freesurfer_curvature_stats" USING "btree" ("hemisphere");



CREATE INDEX "idx_freesurfer_curvature_stats_nifti_file_id" ON "public"."freesurfer_curvature_stats" USING "btree" ("nifti_file_id");



CREATE INDEX "idx_freesurfer_global_measures_measure_name" ON "public"."freesurfer_global_measures" USING "btree" ("measure_name");



CREATE INDEX "idx_freesurfer_global_measures_nifti_file_id" ON "public"."freesurfer_global_measures" USING "btree" ("nifti_file_id");



CREATE INDEX "idx_freesurfer_subcortical_segmentations_nifti_file_id" ON "public"."freesurfer_subcortical_segmentations" USING "btree" ("nifti_file_id");



CREATE INDEX "idx_freesurfer_subcortical_segmentations_structure" ON "public"."freesurfer_subcortical_segmentations" USING "btree" ("structure_name");



CREATE INDEX "idx_freesurfer_summary_stats_nifti_file_id" ON "public"."freesurfer_summary_stats" USING "btree" ("nifti_file_id");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "post_tags_post_id_idx" ON "public"."post_tags" USING "btree" ("post_id");



CREATE INDEX "post_tags_tag_id_idx" ON "public"."post_tags" USING "btree" ("tag_id");



CREATE INDEX "post_tags_user_id_idx" ON "public"."post_tags" USING "btree" ("user_id");



CREATE INDEX "post_tags_user_id_post_id_idx" ON "public"."post_tags" USING "btree" ("user_id", "post_id");



CREATE INDEX "postmeta_meta_key_idx" ON "public"."postmeta" USING "btree" ("meta_key");



CREATE INDEX "postmeta_post_id_idx" ON "public"."postmeta" USING "btree" ("post_id");



CREATE INDEX "posts_slug_idx" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "posts_type_status_date_idx" ON "public"."posts" USING "btree" ("type", "status", "date", "id");



CREATE INDEX "posts_user_id_idx" ON "public"."posts" USING "btree" ("user_id");



CREATE INDEX "posts_user_id_slug_idx" ON "public"."posts" USING "btree" ("user_id", "slug");



CREATE UNIQUE INDEX "roi_volumes_nifti_file_id_label_idx" ON "public"."roi_volumes" USING "btree" ("nifti_file_id", "label");



CREATE INDEX "statistics_user_id_idx" ON "public"."statistics" USING "btree" ("user_id");



CREATE INDEX "statistics_visitor_id_idx" ON "public"."statistics" USING "btree" ("visitor_id");



CREATE INDEX "tagmeta_meta_key_idx" ON "public"."tagmeta" USING "btree" ("meta_key");



CREATE INDEX "tagmeta_tag_id_idx" ON "public"."tagmeta" USING "btree" ("tag_id");



CREATE INDEX "tags_name_idx" ON "public"."tags" USING "btree" ("name");



CREATE INDEX "tags_slug_idx" ON "public"."tags" USING "btree" ("slug");



CREATE INDEX "tags_user_id_idx" ON "public"."tags" USING "btree" ("user_id");



CREATE INDEX "tags_user_id_name_idx" ON "public"."tags" USING "btree" ("user_id", "name");



CREATE INDEX "tags_user_id_slug_idx" ON "public"."tags" USING "btree" ("user_id", "slug");



CREATE UNIQUE INDEX "user_insight_outputs_user_insight_id_name_idx" ON "public"."user_insight_outputs" USING "btree" ("user_insight_id", "name");



CREATE UNIQUE INDEX "user_insights_insight_id_user_id_nifti_file_id_idx" ON "public"."user_insights" USING "btree" ("insight_id", "user_id", "nifti_file_id");



CREATE INDEX "usermeta_meta_key_idx" ON "public"."usermeta" USING "btree" ("meta_key");



CREATE INDEX "usermeta_user_id_idx" ON "public"."usermeta" USING "btree" ("user_id");



CREATE INDEX "users_plan_idx" ON "public"."users" USING "btree" ("plan");



CREATE INDEX "users_role_idx" ON "public"."users" USING "btree" ("role");



CREATE INDEX "users_username_idx" ON "public"."users" USING "btree" ("username");



CREATE INDEX "votes_post_id_idx" ON "public"."votes" USING "btree" ("post_id");



CREATE INDEX "votes_user_id_idx" ON "public"."votes" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_created" AFTER INSERT ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_post"();



CREATE OR REPLACE TRIGGER "on_plan_updated" AFTER UPDATE OF "plan" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_plan_changed_at"();



CREATE OR REPLACE TRIGGER "on_role_updated" AFTER UPDATE OF "role" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_role_changed_at"();



CREATE OR REPLACE TRIGGER "on_slug_upsert" BEFORE INSERT OR UPDATE OF "slug" ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."unique_post_slug"();



CREATE OR REPLACE TRIGGER "on_slug_upsert" BEFORE INSERT OR UPDATE OF "slug" ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."unique_tag_slug"();



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."emails" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."favorites" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_updated_at" BEFORE UPDATE ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_username_updated" AFTER UPDATE OF "username" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_username_changed_at"();



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."freesurfer_cortical_regions"
    ADD CONSTRAINT "freesurfer_cortical_regions_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id");



ALTER TABLE ONLY "public"."freesurfer_curvature_stats"
    ADD CONSTRAINT "freesurfer_curvature_stats_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id");



ALTER TABLE ONLY "public"."freesurfer_global_measures"
    ADD CONSTRAINT "freesurfer_global_measures_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id");



ALTER TABLE ONLY "public"."freesurfer_subcortical_segmentations"
    ADD CONSTRAINT "freesurfer_subcortical_segmentations_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id");



ALTER TABLE ONLY "public"."freesurfer_summary_stats"
    ADD CONSTRAINT "freesurfer_summary_stats_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id");



ALTER TABLE ONLY "public"."nifti_files"
    ADD CONSTRAINT "nifti_files_id_fkey" FOREIGN KEY ("id") REFERENCES "storage"."objects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nifti_files"
    ADD CONSTRAINT "nifti_files_parent_nitfi_file_id_fkey" FOREIGN KEY ("parent_nifti_file_id") REFERENCES "public"."nifti_files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nifti_files"
    ADD CONSTRAINT "nifti_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_tags"
    ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_tags"
    ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_tags"
    ADD CONSTRAINT "post_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."postmeta"
    ADD CONSTRAINT "postmeta_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roi_volumes"
    ADD CONSTRAINT "roi_volumes_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."statistics"
    ADD CONSTRAINT "statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tagmeta"
    ADD CONSTRAINT "tagmeta_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_insight_outputs"
    ADD CONSTRAINT "user_insight_outputs_user_insight_id_fkey" FOREIGN KEY ("user_insight_id") REFERENCES "public"."user_insights"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "public"."insights"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_nifti_file_id_fkey" FOREIGN KEY ("nifti_file_id") REFERENCES "public"."nifti_files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_insights"
    ADD CONSTRAINT "user_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usermeta"
    ADD CONSTRAINT "usermeta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey1" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable insert for users based on user_id" ON "public"."roi_volumes" USING (("nifti_file_id" IN ( SELECT "nifti_files"."id"
   FROM "public"."nifti_files"
  WHERE ("nifti_files"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("nifti_file_id" IN ( SELECT "nifti_files"."id"
   FROM "public"."nifti_files"
  WHERE ("nifti_files"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Policy with table joins" ON "public"."nifti_files" USING (("id" IN ( SELECT "objects"."id"
   FROM "storage"."objects"
  WHERE ("objects"."owner_id" = (( SELECT "auth"."uid"() AS "uid"))::"text")))) WITH CHECK (("id" IN ( SELECT "objects"."id"
   FROM "storage"."objects"
  WHERE ("objects"."owner_id" = (( SELECT "auth"."uid"() AS "uid"))::"text"))));



CREATE POLICY "Public access for all users" ON "public"."favorites" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."post_tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."postmeta" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."posts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."role_permissions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."statistics" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."tagmeta" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."usermeta" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."users" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public access for all users" ON "public"."votes" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "User can delete postmeta" ON "public"."postmeta" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "User can delete role_permissions" ON "public"."role_permissions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "User can delete statistics" ON "public"."statistics" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "User can delete tagmeta" ON "public"."tagmeta" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "User can delete their own emails" ON "public"."emails" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own favorites" ON "public"."favorites" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own post_tags" ON "public"."post_tags" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own posts" ON "public"."posts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own tags" ON "public"."tags" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own usermeta" ON "public"."usermeta" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can delete their own users" ON "public"."users" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "User can delete their own votes" ON "public"."votes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert postmeta" ON "public"."postmeta" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "User can insert role_permissions" ON "public"."role_permissions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "User can insert statistics" ON "public"."statistics" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "User can insert tagmeta" ON "public"."tagmeta" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "User can insert their own emails" ON "public"."emails" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own favorites" ON "public"."favorites" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own post_tags" ON "public"."post_tags" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own tags" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own usermeta" ON "public"."usermeta" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can insert their own users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "User can insert their own votes" ON "public"."votes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can select their own emails" ON "public"."emails" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can select their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update postmeta" ON "public"."postmeta" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "User can update role_permissions" ON "public"."role_permissions" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "User can update statistics" ON "public"."statistics" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "User can update tagmeta" ON "public"."tagmeta" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "User can update their own emails" ON "public"."emails" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own favorites" ON "public"."favorites" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own post_tags" ON "public"."post_tags" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own tags" ON "public"."tags" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own usermeta" ON "public"."usermeta" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User can update their own users" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "User can update their own votes" ON "public"."votes" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own FreeSurfer cortical regions" ON "public"."freesurfer_cortical_regions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_cortical_regions"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own FreeSurfer curvature stats" ON "public"."freesurfer_curvature_stats" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_curvature_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own FreeSurfer global measures" ON "public"."freesurfer_global_measures" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_global_measures"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own FreeSurfer subcortical segmentations" ON "public"."freesurfer_subcortical_segmentations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_subcortical_segmentations"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own FreeSurfer summary stats" ON "public"."freesurfer_summary_stats" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_summary_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own FreeSurfer cortical regions" ON "public"."freesurfer_cortical_regions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_cortical_regions"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own FreeSurfer curvature stats" ON "public"."freesurfer_curvature_stats" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_curvature_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own FreeSurfer global measures" ON "public"."freesurfer_global_measures" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_global_measures"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own FreeSurfer subcortical segmentations" ON "public"."freesurfer_subcortical_segmentations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_subcortical_segmentations"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own FreeSurfer summary stats" ON "public"."freesurfer_summary_stats" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_summary_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own FreeSurfer cortical regions" ON "public"."freesurfer_cortical_regions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_cortical_regions"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own FreeSurfer curvature stats" ON "public"."freesurfer_curvature_stats" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_curvature_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own FreeSurfer global measures" ON "public"."freesurfer_global_measures" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_global_measures"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own FreeSurfer subcortical segmentations" ON "public"."freesurfer_subcortical_segmentations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_subcortical_segmentations"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own FreeSurfer summary stats" ON "public"."freesurfer_summary_stats" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nifti_files"
  WHERE (("nifti_files"."id" = "freesurfer_summary_stats"."nifti_file_id") AND ("nifti_files"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."emails" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."freesurfer_cortical_regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."freesurfer_curvature_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."freesurfer_global_measures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."freesurfer_subcortical_segmentations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."freesurfer_summary_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_auth_policy" ON "public"."private_items" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nifti_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."postmeta" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."private_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roi_volumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_all_policy" ON "public"."private_items" FOR SELECT USING (true);



ALTER TABLE "public"."statistics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tagmeta" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_auth_policy" ON "public"."private_items" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."user_insight_outputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usermeta" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
























































































































































































































GRANT ALL ON FUNCTION "public"."assign_user_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_user_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_user_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."count_posts"("userid" "uuid", "posttype" "text", "q" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."count_posts"("userid" "uuid", "posttype" "text", "q" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_posts"("userid" "uuid", "posttype" "text", "q" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_posts"("data" "json"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_posts"("data" "json"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_posts"("data" "json"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_user"("useremail" "text", "password" "text", "metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_user"("useremail" "text", "password" "text", "metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_user"("useremail" "text", "password" "text", "metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."daily_delete_old_cron_job_run_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."daily_delete_old_cron_job_run_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."daily_delete_old_cron_job_run_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user"("useremail" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user"("useremail" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"("useremail" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_password"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_password"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_password"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_post_slug"("userid" "uuid", "postslug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_post_slug"("userid" "uuid", "postslug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_post_slug"("userid" "uuid", "postslug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tag_slug"("userid" "uuid", "tagslug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("userid" "uuid", "tagslug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("userid" "uuid", "tagslug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_username"("email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_adjacent_post_id"("postid" bigint, "userid" "uuid", "posttype" "text", "poststatus" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_adjacent_post_id"("postid" bigint, "userid" "uuid", "posttype" "text", "poststatus" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_adjacent_post_id"("postid" bigint, "userid" "uuid", "posttype" "text", "poststatus" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_atlas_sampled_nifti_file"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_atlas_sampled_nifti_file"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_atlas_sampled_nifti_file"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "service_role";



GRANT ALL ON TABLE "public"."nifti_files" TO "anon";
GRANT ALL ON TABLE "public"."nifti_files" TO "authenticated";
GRANT ALL ON TABLE "public"."nifti_files" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_file_type_among_children"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_file_type_among_children"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_file_type_among_children"("p_nifti_file_id" "uuid", "p_file_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_post_rank_by_views"("username" "text", "q" "text", "order_by" "text", "ascending" boolean, "per_page" integer, "page" integer, "head" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_rank_by_views"("username" "text", "q" "text", "order_by" "text", "ascending" boolean, "per_page" integer, "page" integer, "head" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_rank_by_views"("username" "text", "q" "text", "order_by" "text", "ascending" boolean, "per_page" integer, "page" integer, "head" boolean) TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_users"("userrole" "text", "userplan" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_users"("userrole" "text", "userplan" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users"("userrole" "text", "userplan" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vote"("postid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote"("postid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote"("postid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_has_set_password"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_has_set_password"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_has_set_password"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_post"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_post"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_post"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_plan_changed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_plan_changed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_plan_changed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_role_changed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_role_changed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_role_changed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_username_changed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_username_changed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_username_changed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hourly_publish_future_posts"() TO "anon";
GRANT ALL ON FUNCTION "public"."hourly_publish_future_posts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hourly_publish_future_posts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_favorite"("postid" bigint, "userid" "uuid", "isfavorite" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_favorite"("postid" bigint, "userid" "uuid", "isfavorite" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_favorite"("postid" bigint, "userid" "uuid", "isfavorite" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_post_meta"("postid" bigint, "metakey" "text", "metavalue" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_post_meta"("postid" bigint, "metakey" "text", "metavalue" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_post_meta"("postid" bigint, "metakey" "text", "metavalue" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_post_tags"("userid" "uuid", "postid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."set_post_tags"("userid" "uuid", "postid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_post_tags"("userid" "uuid", "postid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_post_views"("postid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."set_post_views"("postid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_post_views"("postid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_statistics"("data" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."set_statistics"("data" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_statistics"("data" "json") TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tag"("userid" "uuid", "tagname" "text", "tagslug" "text", "tagdescription" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_tag"("userid" "uuid", "tagname" "text", "tagslug" "text", "tagdescription" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tag"("userid" "uuid", "tagname" "text", "tagslug" "text", "tagdescription" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tag_meta"("tagid" bigint, "metakey" "text", "metavalue" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_tag_meta"("tagid" bigint, "metakey" "text", "metavalue" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tag_meta"("tagid" bigint, "metakey" "text", "metavalue" "text") TO "service_role";



GRANT ALL ON TABLE "public"."usermeta" TO "anon";
GRANT ALL ON TABLE "public"."usermeta" TO "authenticated";
GRANT ALL ON TABLE "public"."usermeta" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_meta"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_meta"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_meta"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_plan"("userplan" "text", "userid" "uuid", "useremail" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_plan"("userplan" "text", "userid" "uuid", "useremail" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_plan"("userplan" "text", "userid" "uuid", "useremail" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_role"("userrole" "text", "userid" "uuid", "useremail" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_role"("userrole" "text", "userid" "uuid", "useremail" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_role"("userrole" "text", "userid" "uuid", "useremail" "text") TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON FUNCTION "public"."title_content"("public"."posts") TO "anon";
GRANT ALL ON FUNCTION "public"."title_content"("public"."posts") TO "authenticated";
GRANT ALL ON FUNCTION "public"."title_content"("public"."posts") TO "service_role";



GRANT ALL ON FUNCTION "public"."title_description"("public"."posts") TO "anon";
GRANT ALL ON FUNCTION "public"."title_description"("public"."posts") TO "authenticated";
GRANT ALL ON FUNCTION "public"."title_description"("public"."posts") TO "service_role";



GRANT ALL ON FUNCTION "public"."title_description_content"("public"."posts") TO "anon";
GRANT ALL ON FUNCTION "public"."title_description_content"("public"."posts") TO "authenticated";
GRANT ALL ON FUNCTION "public"."title_description_content"("public"."posts") TO "service_role";



GRANT ALL ON FUNCTION "public"."title_description_keywords"("public"."posts") TO "anon";
GRANT ALL ON FUNCTION "public"."title_description_keywords"("public"."posts") TO "authenticated";
GRANT ALL ON FUNCTION "public"."title_description_keywords"("public"."posts") TO "service_role";



GRANT ALL ON FUNCTION "public"."title_keywords"("public"."posts") TO "anon";
GRANT ALL ON FUNCTION "public"."title_keywords"("public"."posts") TO "authenticated";
GRANT ALL ON FUNCTION "public"."title_keywords"("public"."posts") TO "service_role";



GRANT ALL ON FUNCTION "public"."truncate_posts"() TO "anon";
GRANT ALL ON FUNCTION "public"."truncate_posts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."truncate_posts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."truncate_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."truncate_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."truncate_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unique_post_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."unique_post_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unique_post_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unique_tag_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."unique_tag_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unique_tag_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."usermeta_upsert"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."usermeta_upsert"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."usermeta_upsert"("p_user_id" "uuid", "p_meta_key" "text", "p_meta_value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_user_password"("userid" "uuid", "password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_user_password"("userid" "uuid", "password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_user_password"("userid" "uuid", "password" "text") TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;





















GRANT ALL ON TABLE "public"."emails" TO "anon";
GRANT ALL ON TABLE "public"."emails" TO "authenticated";
GRANT ALL ON TABLE "public"."emails" TO "service_role";



GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."emails_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."freesurfer_cortical_regions" TO "anon";
GRANT ALL ON TABLE "public"."freesurfer_cortical_regions" TO "authenticated";
GRANT ALL ON TABLE "public"."freesurfer_cortical_regions" TO "service_role";



GRANT ALL ON TABLE "public"."freesurfer_curvature_stats" TO "anon";
GRANT ALL ON TABLE "public"."freesurfer_curvature_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."freesurfer_curvature_stats" TO "service_role";



GRANT ALL ON TABLE "public"."freesurfer_global_measures" TO "anon";
GRANT ALL ON TABLE "public"."freesurfer_global_measures" TO "authenticated";
GRANT ALL ON TABLE "public"."freesurfer_global_measures" TO "service_role";



GRANT ALL ON TABLE "public"."freesurfer_subcortical_segmentations" TO "anon";
GRANT ALL ON TABLE "public"."freesurfer_subcortical_segmentations" TO "authenticated";
GRANT ALL ON TABLE "public"."freesurfer_subcortical_segmentations" TO "service_role";



GRANT ALL ON TABLE "public"."freesurfer_summary_stats" TO "anon";
GRANT ALL ON TABLE "public"."freesurfer_summary_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."freesurfer_summary_stats" TO "service_role";



GRANT ALL ON TABLE "public"."insights" TO "anon";
GRANT ALL ON TABLE "public"."insights" TO "authenticated";
GRANT ALL ON TABLE "public"."insights" TO "service_role";



GRANT ALL ON SEQUENCE "public"."insights_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."insights_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."insights_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post_tags" TO "anon";
GRANT ALL ON TABLE "public"."post_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."post_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."postmeta" TO "anon";
GRANT ALL ON TABLE "public"."postmeta" TO "authenticated";
GRANT ALL ON TABLE "public"."postmeta" TO "service_role";



GRANT ALL ON SEQUENCE "public"."postmeta_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."postmeta_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."postmeta_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."private_items" TO "anon";
GRANT ALL ON TABLE "public"."private_items" TO "authenticated";
GRANT ALL ON TABLE "public"."private_items" TO "service_role";



GRANT ALL ON TABLE "public"."roi_volumes" TO "anon";
GRANT ALL ON TABLE "public"."roi_volumes" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_volumes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roi_volumes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roi_volumes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roi_volumes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."statistics" TO "anon";
GRANT ALL ON TABLE "public"."statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."statistics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."statistics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."statistics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."statistics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tagmeta" TO "anon";
GRANT ALL ON TABLE "public"."tagmeta" TO "authenticated";
GRANT ALL ON TABLE "public"."tagmeta" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tagmeta_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tagmeta_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tagmeta_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_insight_outputs" TO "anon";
GRANT ALL ON TABLE "public"."user_insight_outputs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_insight_outputs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_insight_outputs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_insight_outputs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_insight_outputs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_insights" TO "anon";
GRANT ALL ON TABLE "public"."user_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."user_insights" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_insights_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_insights_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_insights_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usermeta_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usermeta_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usermeta_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
