-- Create async_tasks table for tracking async function execution
CREATE TABLE IF NOT EXISTS public.async_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ecs_task_arn TEXT,
    logs_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_status ON public.async_tasks(status);
CREATE INDEX idx_tasks_created_at ON public.async_tasks(created_at DESC);
CREATE INDEX idx_tasks_user_id ON public.async_tasks(user_id);
CREATE INDEX idx_tasks_function_name ON public.async_tasks(function_name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.async_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for async_tasks table
-- Users can only see their own async_tasks
CREATE POLICY "Users can view own async_tasks" ON public.async_tasks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own async_tasks
CREATE POLICY "Users can create own async_tasks" ON public.async_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role has full access" ON public.async_tasks
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.async_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for task statistics
CREATE OR REPLACE VIEW public.task_statistics AS
SELECT
    user_id,
    function_name,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
    COUNT(*) FILTER (WHERE status = 'running') as running_tasks,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE status = 'completed') as avg_execution_time_seconds
FROM public.async_tasks
GROUP BY user_id, function_name;

-- Grant permissions
GRANT ALL ON public.async_tasks TO service_role;
GRANT SELECT, INSERT ON public.async_tasks TO authenticated;
GRANT SELECT ON public.task_statistics TO authenticated;
