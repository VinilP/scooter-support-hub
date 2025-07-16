-- Add "What is my order status?" FAQ
INSERT INTO public.faqs (question, answer, category, tags, display_order, is_active) 
VALUES (
  'What is my order status?',
  'Let me check your current order status for you.',
  'orders',
  ARRAY['order', 'status', 'tracking', 'delivery'],
  1,
  true
);