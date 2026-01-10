-- Create table for user preparedness task progress
CREATE TABLE public.user_preparedness_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_preparedness_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own preparedness progress" 
ON public.user_preparedness_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preparedness progress" 
ON public.user_preparedness_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preparedness progress" 
ON public.user_preparedness_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preparedness progress" 
ON public.user_preparedness_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_preparedness_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preparedness_progress_updated_at
BEFORE UPDATE ON public.user_preparedness_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_preparedness_progress_updated_at();

-- Create index for better query performance
CREATE INDEX idx_user_preparedness_progress_user_id ON public.user_preparedness_progress(user_id);
CREATE INDEX idx_user_preparedness_progress_task_id ON public.user_preparedness_progress(task_id);