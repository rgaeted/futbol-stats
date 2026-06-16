ALTER TABLE public.players ADD COLUMN IF NOT EXISTS photo_offset_x numeric DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS photo_offset_y numeric DEFAULT 0;
