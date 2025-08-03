# Cerebro App - MRI Engine for Brain Insights

A modern dashboard application for visualizing and analyzing brain MRI data, powered by the cerebro-engine processing pipeline.

Dependency

- NextJS 14 + Typescript + Tailwind
- Shadcn UI (Radix UI) + TimePicker + TagInput
- react-hook-form + zod
- react-i18next + zod-i18n-map
- Redux Toolkit + Redux Persist
- Supabase OAuth with PKCE flow (@supabase/ssr)
- Supabase Email Auth with PKCE flow (@supabase/ssr)
- Supabase Role-based Access Control (RBAC)
- CKEditor 5 + Supabase Upload Adapter
- PWA (Progressive Web Apps)

## Table of Contents

- [NextJS Supabase Dashboard](#nextjs-supabase-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Screenshots](#screenshots)
  - [Folder and file Structure](#folder-and-file-structure)
  - [Getting Started](#getting-started)
  - [Generate Favicon](#generate-favicon)
  - [Docs](#docs)
  - [Define App URL](#define-app-url)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)
  - [Reference](#reference)

## Screenshots

![screenshot](./screenshot.png)

## Folder and file Structure

The folder and file structure is based on nextjs app router [next.js project structure](https://nextjs.org/docs/getting-started/project-structure).

```txt
.
├── app/                        # App Router
│   └── api/
│       ├── auth/               # Public API for authentication
│       └── v1/                 # APIs that require authentication
├── components/                 # React components
├── config/                     # Configuration for site
├── context/
│   └── app-provider.ts         # Register context provider
├── hooks/
├── docs/                       # Documents
├── lib/                        # Utility functions
├── public/                     # Static assets to be served
│   └── [locales]/              # Internationalization
├── queries/                    # SWR for API
├── screenshots/                # Screenshots
├── store/                      # Redux reducers
├── supabase/                   # Supabase CLI
├── types/
├── components.json             # Shadcn UI
├── i18next.config.ts           # Internationalization
└── package.json                # Project dependencies and scripts
```

Install all modules listed as dependencies.

```shell
npm install
```

Start the development server.

```shell
npm run dev
```

## Docs

- [INSTALLATION](./docs/INSTALLATION.md)
- [CONFIGURATION](./docs/CONFIGURATION.md)
- [DEPLOYING](./docs/DEPLOYING.md)
- [LINTER](./docs/LINTER.md)
- [EXAMPLES](./docs/EXAMPLES.md)

## Define App URL

- Environment: `NEXT_PUBLIC_APP_URL=`
- Supabase Auth: Authentication > URL Configuration > Redirect URLs
- Google cloud console: API > Credentials
- Google cloud console: API > OAuth

## Troubleshooting

- For eslint, check the [latest version](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin?activeTab=versions) of `@typescript-eslint/eslint-plugin` and upgrade.
- For ckeditor5, check the downloadable version in the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) and upgrade.
- If an error occurs in the pre-rendered `sitemap.xml`, access the page in development mode and run a rebuild.

## Reference

- [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
- [shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy)
- [nextjs-slack-clone](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone)
- [nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments)
