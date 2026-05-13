DROP POLICY "Anyone update own conversation flags" ON public.chat_conversations;
CREATE POLICY "Admins update conversations" ON public.chat_conversations
  FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));