
-- 1. Add session_token to abandoned_checkouts and restrict UPDATE policy
ALTER TABLE public.abandoned_checkouts
  ADD COLUMN IF NOT EXISTS session_token text;

CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_session_token
  ON public.abandoned_checkouts(session_token);

DROP POLICY IF EXISTS "Anyone update recent abandoned checkout" ON public.abandoned_checkouts;
DROP POLICY IF EXISTS "Anyone create abandoned checkout" ON public.abandoned_checkouts;

-- INSERT: require a session_token of reasonable length, keep existing length validations
CREATE POLICY "Anyone create abandoned checkout"
ON public.abandoned_checkouts
FOR INSERT
TO public
WITH CHECK (
  session_token IS NOT NULL
  AND length(session_token) BETWEEN 16 AND 128
  AND ((customer_name IS NULL) OR (length(customer_name) <= 200))
  AND ((customer_phone IS NULL) OR (length(customer_phone) <= 30))
  AND ((customer_email IS NULL) OR (length(customer_email) <= 255))
  AND ((customer_address IS NULL) OR (length(customer_address) <= 1000))
  AND ((notes IS NULL) OR (length(notes) <= 2000))
);

-- UPDATE: must present matching session_token (sent via PostgREST header/setting),
-- OR be the authenticated owner. We use a request header `x-checkout-session` exposed
-- via current_setting('request.headers', true)::json to match the row's session_token.
CREATE POLICY "Owner update recent abandoned checkout"
ON public.abandoned_checkouts
FOR UPDATE
TO public
USING (
  created_at > (now() - interval '24 hours')
  AND (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      session_token IS NOT NULL
      AND session_token = current_setting('request.headers', true)::json->>'x-checkout-session'
    )
  )
)
WITH CHECK (
  ((customer_name IS NULL) OR (length(customer_name) <= 200))
  AND ((customer_phone IS NULL) OR (length(customer_phone) <= 30))
  AND ((customer_email IS NULL) OR (length(customer_email) <= 255))
  AND ((customer_address IS NULL) OR (length(customer_address) <= 1000))
  AND ((notes IS NULL) OR (length(notes) <= 2000))
  AND (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      session_token IS NOT NULL
      AND session_token = current_setting('request.headers', true)::json->>'x-checkout-session'
    )
  )
);

-- 2. Restrict claim_first_admin to authenticated users only (it already requires auth.uid())
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
