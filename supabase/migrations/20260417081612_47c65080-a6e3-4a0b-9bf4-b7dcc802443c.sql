-- Allow users to delete their own messages (sent or received)
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Ensure full row data is sent on changes (needed for DELETE payloads)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the realtime publication (no-op if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;