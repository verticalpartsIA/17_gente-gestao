import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { SplitShell, FormHead, Field } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn, signInWithSSO } = useAuth()
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Detecta SSO injetado pelo vpsistema (?sso_token=...&sso_refresh=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token   = params.get('sso_token')
    const refresh = params.get('sso_refresh')
    if (token && refresh) {
      window.history.replaceState({}, '', window.location.pathname)
      setLoading(true)
      signInWithSSO(token, refresh)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch((e: Error) => { setError(e.message); setLoading(false) })
    }
  }, []) // eslint-disable-line

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard', { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar.')
      setLoading(false)
    }
  }

  return (
    <SplitShell
      eyebrow="Acesso corporativo"
      title={<>Bem-vindo<br />de volta à <span className="text-primary">VerticalParts.</span></>}
      description="Acesse dashboards, estoque e relatórios técnicos em um só lugar."
      features={[
        'Vendas, Compras, Engenharia, Financeiro e mais',
        'Integração com vpsistema — SSO automático',
        'Controle de acesso por cargo e departamento',
      ]}
    >
      <FormHead
        eyebrow="Acessar conta"
        title="Entrar na plataforma"
        description="Use seu e-mail corporativo e senha cadastrados."
      />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded border-l-[3px] border-red-600 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <Field
          label="E-mail"
          type="email"
          placeholder="seu@verticalparts.com.br"
          autoComplete="email"
          required
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          placeholder="••••••••••"
          autoComplete="current-password"
          required
          passwordToggle
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="-mt-1 mb-5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-neutral-700 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-primary rounded" />
            Lembrar de mim
          </label>
          <Link to="/forgot-password" className="text-[13px] font-semibold text-primary-dark hover:text-black transition-colors">
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />} className="w-full">
          Entrar
        </Button>

        <p className="mt-6 text-center text-[13px] text-neutral-700">
          Não tem uma conta?{' '}
          <Link to="/register" className="border-b-2 border-primary pb-px font-bold text-black hover:text-primary-dark transition-colors">
            Cadastrar
          </Link>
        </p>
      </form>
    </SplitShell>
  )
}
