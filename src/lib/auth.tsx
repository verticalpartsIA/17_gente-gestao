import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'

export type Level      = 'Administrador' | 'Lider' | 'Colaborador'
export type Department = 'Compras' | 'Engenharia' | 'Financeiro' | 'Logistica' | 'MKT' | 'Vendas' | null

export interface Profile {
  id:         string
  name:       string
  email:      string
  level:      Level
  department: Department
  is_active:  boolean
  avatar_url: string | null
}

interface AuthState {
  profile:        Profile | null
  loading:        boolean
  isAdmin:        boolean
  signIn:         (email: string, password: string) => Promise<void>
  signInWithSSO:  (accessToken: string, refreshToken: string) => Promise<void>
  signOut:        () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) throw new Error('Perfil não encontrado.')
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      if (session?.user) {
        try {
          const p = await fetchProfile(session.user.id)
          if (p.is_active !== false) setProfile(p)
          else await supabase.auth.signOut()
        } catch {
          await supabase.auth.signOut()
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'SIGNED_OUT') setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    profile,
    loading,
    isAdmin: profile?.level === 'Administrador',

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error('E-mail ou senha inválidos. Tente novamente.')
      const p = await fetchProfile(data.user.id)
      if (p.is_active === false) {
        await supabase.auth.signOut()
        throw new Error('Sua conta está desativada. Fale com o administrador.')
      }
      setProfile(p)
    },

    // SSO: chamado quando vpsistema injeta sso_token + sso_refresh na URL
    signInWithSSO: async (accessToken, refreshToken) => {
      const { data, error } = await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken,
      })
      if (error || !data.user) throw new Error('Token SSO inválido ou expirado.')
      const p = await fetchProfile(data.user.id)
      if (p.is_active === false) {
        await supabase.auth.signOut()
        throw new Error('Sua conta está desativada.')
      }
      setProfile(p)
    },

    signOut: async () => {
      await supabase.auth.signOut()
      setProfile(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
