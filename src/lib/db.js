import { supabase } from "./supabaseClient";

// Parse Base44-style sort string (e.g. "-created_date") into Supabase order args.
function parseSort(sort) {
  if (!sort) return null;
  const desc = sort.startsWith("-");
  const column = desc ? sort.slice(1) : sort;
  return { column, ascending: !desc };
}

// Generic entity wrapper that mimics the base44.entities.X API surface used across the app:
// list(sort, limit), filter(query, sort, limit), get(id), create(payload), update(id, payload), delete(id)
function makeEntity(table) {
  return {
    async list(sort, limit) {
      let q = supabase.from(table).select("*");
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async filter(query, sort, limit) {
      let q = supabase.from(table).select("*");
      if (query) {
        for (const [k, v] of Object.entries(query)) {
          if (v === null || v === undefined) continue;
          q = q.eq(k, v);
        }
      }
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export const db = {
  Obra: makeEntity("obras"),
  Ambiente: makeEntity("ambientes"),
  Tarefa: makeEntity("tarefas"),
  Foto: makeEntity("fotos"),
  Registro: makeEntity("registros"),
  MembroObra: makeEntity("membros_obra"),
  Historico: makeEntity("historico"),
  User: makeEntity("profiles"),
};

// Upload a photo to Supabase Storage (public bucket "fotos") and return its public URL.
export async function uploadPhoto(file) {
  const ext = (file.name || "").split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("fotos").upload(fileName, file, { contentType: file.type || "image/jpeg" });
  if (error) throw error;
  const { data } = supabase.storage.from("fotos").getPublicUrl(fileName);
  return { file_url: data.publicUrl };
}