
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text,
  visitor_contact text,
  escalated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone create conversation" ON public.chat_conversations
  FOR INSERT WITH CHECK (
    (visitor_name IS NULL OR length(visitor_name) <= 200) AND
    (visitor_contact IS NULL OR length(visitor_contact) <= 255)
  );

CREATE POLICY "Anyone read conversation" ON public.chat_conversations
  FOR SELECT USING (true);

CREATE POLICY "Anyone update own conversation flags" ON public.chat_conversations
  FOR UPDATE USING (true) WITH CHECK (
    (visitor_name IS NULL OR length(visitor_name) <= 200) AND
    (visitor_contact IS NULL OR length(visitor_contact) <= 255)
  );

CREATE POLICY "Admins delete conversations" ON public.chat_conversations
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (length(content) >= 1 AND length(content) <= 5000);

CREATE POLICY "Anyone read messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Admins delete messages" ON public.chat_messages
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_chat_conv_updated
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (key, value) VALUES
  ('chatbot_enabled', 'true'),
  ('chatbot_welcome_bn', 'হ্যালো! Ecomstation-এ স্বাগতম। আমি আপনাকে কীভাবে সাহায্য করতে পারি?'),
  ('chatbot_welcome_en', 'Hello! Welcome to Ecomstation. How can I help you today?'),
  ('chatbot_system_prompt', 'You are a friendly 24/7 customer support assistant for Ecomstation, a Bangladeshi e-commerce solutions company offering website development, hosting, domain, and digital marketing services. Always reply in the user''s language (Bengali or English). Be concise, helpful, and polite. If the user asks something you cannot answer or wants to talk to a human, suggest they request admin help and collect their name and contact (phone/email).'),
  ('chatbot_knowledge', 'Services: Website development, e-commerce setup, domain & hosting (coming soon), digital marketing. Contact: use the contact form on the site. Working hours: 24/7 chat support.')
ON CONFLICT (key) DO NOTHING;
