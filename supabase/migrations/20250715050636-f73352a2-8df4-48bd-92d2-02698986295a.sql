-- Create escalated queries table
CREATE TABLE public.escalated_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  original_question TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  file_url TEXT,
  user_feedback TEXT,
  escalation_reason TEXT DEFAULT 'not_helpful',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.escalated_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escalated queries
CREATE POLICY "Users can view their own escalated queries" ON public.escalated_queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own escalated queries" ON public.escalated_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own escalated queries" ON public.escalated_queries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_escalated_queries_updated_at
  BEFORE UPDATE ON public.escalated_queries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();