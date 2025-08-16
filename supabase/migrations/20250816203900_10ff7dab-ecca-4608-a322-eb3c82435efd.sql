-- Fix storage policies for galleries bucket
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'galleries' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'galleries' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'galleries' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'galleries' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for public files
CREATE POLICY "Public files are viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'galleries' AND lower((storage.foldername(name))[1]) = 'public');