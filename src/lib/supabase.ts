import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build/prerender env vars aren't available — return a no-op stub
    if (!url || !key) {
      return new Proxy({} as SupabaseClient, {
        get() {
          const noop = () => ({ data: null, error: null });
          return Object.assign(noop, {
            then: undefined,
            select: () => noop(),
            eq: () => noop(),
          });
        },
      });
    }

    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Lazy proxy — defers client creation until first property access at runtime
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
