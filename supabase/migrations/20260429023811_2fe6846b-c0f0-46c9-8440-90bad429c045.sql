CREATE POLICY "Providers can delete own receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment_receipts' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Providers can update own receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'payment_receipts' AND (storage.foldername(name))[1] = (auth.uid())::text);