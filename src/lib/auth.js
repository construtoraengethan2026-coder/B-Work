import { supabase } from "./supabaseClient";

// Auth helper wrapping Supabase Auth with a clean API for the app's auth pages and context.
export const auth = {
  async me() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw { status: 401 };
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || "",
      role: profile?.role || "user",
      created_date: profile?.created_date || user.created_at,
    };
  },

  async isAuthenticated() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  async updateMe(data) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");
    if (data.full_name !== undefined) {
      const { error } = await supabase.from("profiles").update({ full_name: data.full_name }).eq("id", user.id);
      if (error) throw error;
    }
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async loginViaEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async loginWithProvider(provider, redirectTo) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) throw error;
  },

  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) throw error;
  },

  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};