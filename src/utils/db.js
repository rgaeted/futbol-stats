import { supabase } from "./supabase";

// Convierte fila de Supabase (snake_case) al objeto que usa la app (camelCase)
const fromRow = (row) => ({
  id:          row.id,
  name:        row.name,
  position:    row.position,
  nationality: row.nationality,
  club:        row.club,
  age:         row.age,
  number:      row.number,
  photoUrl:    row.photo_url,
  cardType:    row.card_type,
  stats:       row.stats,
  createdAt:   row.created_at,
  userId:      row.user_id,
});

// Convierte objeto de la app (camelCase) a fila de Supabase (snake_case)
const toRow = (player) => ({
  name:        player.name,
  position:    player.position,
  nationality: player.nationality,
  club:        player.club,
  age:         player.age,
  number:      player.number,
  photo_url:   player.photoUrl,
  card_type:   player.cardType,
  stats:       player.stats,
  user_id:     player.userId,
});

export const db = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(fromRow);
  },

  add: async (player) => {
    const { data, error } = await supabase
      .from("players")
      .insert(toRow(player))
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  update: async (id, player) => {
    const { error } = await supabase
      .from("players")
      .update(toRow(player))
      .eq("id", id);
    if (error) throw error;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
