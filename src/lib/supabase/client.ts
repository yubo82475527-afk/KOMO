import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in client.ts')
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: function() { return Promise.resolve({ data: [], error: null }) },
        insert: function() { return Promise.resolve({ data: null, error: new Error('Supabase not configured') }) },
        update: function() { return Promise.resolve({ data: null, error: new Error('Supabase not configured') }) },
        delete: function() { return Promise.resolve({ data: null, error: new Error('Supabase not configured') }) },
        eq: function() { return this },
        neq: function() { return this },
        in: function() { return this },
        single: function() { return Promise.resolve({ data: null, error: null }) },
        maybeSingle: function() { return Promise.resolve({ data: null, error: null }) },
        order: function() { return this },
        limit: function() { return this },
        gte: function() { return this },
        lte: function() { return this },
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
