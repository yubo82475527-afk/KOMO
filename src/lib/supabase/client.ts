import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
        eq: function() { return this },
        single: function() { return this },
        maybeSingle: function() { return this },
        order: function() { return this },
        limit: function() { return this },
        gte: function() { return this },
        lte: function() { return this },
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
