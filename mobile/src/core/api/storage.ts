import { supabase, isSupabaseConfigured } from '../supabase/client';

export async function uploadImage(
  bucket: 'canhotos-fotos' | 'procedimentos-fotos',
  path: string,
  localUri: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return localUri;

  const response = await fetch(localUri);
  const blob = await response.blob();
  const ext = localUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const filePath = `${path}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });

  if (error) throw new Error(error.message);
  return filePath;
}

export function getPublicImageUrl(
  bucket: 'canhotos-fotos' | 'procedimentos-fotos',
  path: string
): string | null {
  if (!isSupabaseConfigured) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedImageUrl(
  bucket: 'canhotos-fotos' | 'procedimentos-fotos',
  path: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
