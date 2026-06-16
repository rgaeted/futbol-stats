import { supabase } from "./supabase";

const BUCKET = "player-photos";

export const uploadPhoto = async (blob, ext = "png") => {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: false, contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};
