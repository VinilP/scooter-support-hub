-- Add admin policies for orders table to allow viewing all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.phone_number = '+919890236593'
  )
);

-- Add admin policies for escalated_queries table to allow viewing all escalated queries
CREATE POLICY "Admins can view all escalated queries" 
ON public.escalated_queries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.phone_number = '+919890236593'
  )
);

-- Add admin policies for escalated_queries table to allow updating status
CREATE POLICY "Admins can update escalated query status" 
ON public.escalated_queries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.phone_number = '+919890236593'
  )
);