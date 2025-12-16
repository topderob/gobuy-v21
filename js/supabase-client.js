/* Supabase Client Init for Auth */
(function () {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      console.warn(
        "[Supabase] CDN not loaded, auth will fall back to localStorage"
      );
      return;
    }
    // Use the same project as products.js
    const SUPABASE_URL = "https://fuwpjhuusvegecvsqhvn.supabase.co";
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1d3BqaHV1c3ZlZ2VjdnNxaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDYwODEsImV4cCI6MjA4MTQ4MjA4MX0.4HbuTRP0DBBcP1_eimOqN5qehvXtEDb78phVtZ3ZwfU";
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
    window.getProfileFromSupabaseUser = function (user) {
      if (!user) return null;
      const name = (user.user_metadata && user.user_metadata.name) || "";
      return {
        id: user.id,
        email: user.email,
        name: name || user.email.split("@")[0],
        joinDate: new Date().toISOString(),
      };
    };
  } catch (e) {
    console.warn("[Supabase] init failed:", e.message);
  }
})();
