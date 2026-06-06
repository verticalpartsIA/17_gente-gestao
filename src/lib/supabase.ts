import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase.co') as string
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key') as string

// Se as chaves reais não forem providas, usaremos um cliente simulado/mock
export const isMockMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY

// Perfis mockados padrão
export const mockProfiles = [
  {
    id: 'usr-admin',
    name: 'Juliana Silva (Gestora RH)',
    email: 'rh@verticalparts.com.br',
    level: 'Administrador',
    department: 'Financeiro',
    is_active: true,
    avatar_url: null
  },
  {
    id: 'usr-lider',
    name: 'Karla Souza (Líder Engenharia)',
    email: 'lider@verticalparts.com.br',
    level: 'Lider',
    department: 'Engenharia',
    is_active: true,
    avatar_url: null
  },
  {
    id: 'usr-colab',
    name: 'Carlos Oliveira (Motorista)',
    email: 'colaborador@verticalparts.com.br',
    level: 'Colaborador',
    department: 'Logistica',
    is_active: true,
    avatar_url: null
  }
]

let currentSession: any = null

// Criação do mock ou do real
export const supabase = !isMockMode 
  ? createClient(url, key)
  : {
      auth: {
        async getSession() {
          const stored = localStorage.getItem('vp_session')
          if (stored) {
            currentSession = JSON.parse(stored)
          }
          return { data: { session: currentSession }, error: null }
        },
        async signInWithPassword({ email, password }: any) {
          // Aceita qualquer senha para os emails cadastrados na simulação
          void password
          const profile = mockProfiles.find(p => p.email === email)
          if (!profile) {
            return { data: { user: null }, error: { message: 'E-mail ou senha inválidos.' } }
          }
          currentSession = {
            user: { id: profile.id, email: profile.email },
            access_token: 'mock-access',
            refresh_token: 'mock-refresh'
          }
          localStorage.setItem('vp_session', JSON.stringify(currentSession))
          return { data: { user: currentSession.user }, error: null }
        },
        async signUp({ email, password, options }: any) {
          void password
          const name = options?.data?.name || 'Novo Colaborador'
          const level = options?.data?.level || 'Colaborador'
          const department = options?.data?.department || 'Logistica'
          const newProfile = {
            id: 'usr-' + Math.random().toString(36).substring(2),
            name,
            email,
            level,
            department,
            is_active: true,
            avatar_url: null
          }
          mockProfiles.push(newProfile)
          currentSession = {
            user: { id: newProfile.id, email: newProfile.email },
            access_token: 'mock-access',
            refresh_token: 'mock-refresh'
          }
          localStorage.setItem('vp_session', JSON.stringify(currentSession))
          return { data: { user: currentSession.user }, error: null }
        },
        async setSession({ access_token, refresh_token }: any) {
          // SSO simulado
          const profile = mockProfiles[0] // default admin
          currentSession = {
            user: { id: profile.id, email: profile.email },
            access_token,
            refresh_token
          }
          localStorage.setItem('vp_session', JSON.stringify(currentSession))
          return { data: { user: currentSession.user }, error: null }
        },
        async signOut() {
          currentSession = null
          localStorage.removeItem('vp_session')
          return { error: null }
        },
        onAuthStateChange(callback: any) {
          void callback
          // Retornar um listener vazio
          return {
            data: {
              subscription: {
                unsubscribe() {}
              }
            }
          }
        }
      },
      from(table: string) {
        return {
          select(columns: string) {
            void columns
            return {
              eq(field: string, value: any) {
                return {
                  async single() {
                    if (table === 'profiles') {
                      const profile = mockProfiles.find(p => (p as any)[field] === value)
                      if (profile) return { data: profile, error: null }
                    }
                    return { data: null, error: new Error('Não encontrado') }
                  }
                }
              }
            }
          }
        }
      }
    } as any
