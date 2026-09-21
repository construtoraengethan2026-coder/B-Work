// Stub for standalone deployment (Supabase-only).
// The Base44 SDK was removed; auth is fully Supabase-driven.
// This no-op keeps AuthContext.jsx compatible without any external dependency.
export const base44 = {
  app: {
    getPublicSettings: async () => ({}),
  },
};