import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { SplitShell, FormHead, Field } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function passwordScore(pw: string) {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const barColor = ['bg-neutral-200', 'bg-red-500', 'bg-orange-500', 'bg-primary', 'bg-green-500']
const lvlLabel = ['',               'Fraca',       'Razoável',       'Boa',        'Forte'      ]
const lvlColor = ['text-neutral-500','text-red-600','text-orange-500','text-primary-dark','text-green-600']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [nome,     setNome]     = useState('')
  const [email,    setEmail]    = useState('')
  const [pw,       setPw]       = useState('')
  const [pw2,      setPw2]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const score   = useMemo(() => passwordScore(pw), [pw])
  const matches = pw.length > 0 && pw === pw2

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!matches) return
    setError('')
    setLoading(true)
    try {
      // Substitua pelo supabase.auth.signUp() no projeto real
      await new Promise((r) => setTimeout(r, 400))
      navigate('/dashboard', { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar conta.')
      setLoading(false)
    }
  }

  return (
    <SplitShell
      eyebrow="Crie sua conta"
      title={<>Comece a operar com a <span className="text-primary">VerticalParts.</span></>}
      description="Cadastre sua empresa e tenha acesso a estoque, preços e relatórios."
      features={[
        'Aprovação de acesso em até 24h',
        'Dashboards segmentados por cargo',
        'SSO automático com todos os sistemas VP',
      ]}
    >
      <FormHead
        eyebrow="Novo cadastro"
        title="Criar sua conta"
        description="Preencha os dados para liberar o acesso à plataforma."
      />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded border-l-[3px] border-red-600 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <Field label="Nome completo" placeholder="João da Silva" required
          icon={<User className="h-4 w-4" />} value={nome} onChange={(e) => setNome(e.target.value)} />

        <Field label="E-mail corporativo" type="email" placeholder="joao@verticalparts.com.br"
          autoComplete="email" required icon={<Mail className="h-4 w-4" />}
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <div className="mb-4 grid grid-cols-2 gap-3.5">
          <Field label="Senha" passwordToggle required placeholder="••••••••••"
            icon={<Lock className="h-4 w-4" />} containerClassName="mb-0"
            value={pw} onChange={(e) => setPw(e.target.value)} />
          <Field label="Confirmar" passwordToggle required placeholder="••••••••••"
            icon={<Lock className="h-4 w-4" />} containerClassName="mb-0"
            value={pw2} onChange={(e) => setPw2(e.target.value)}
            state={pw2.length > 0 ? (matches ? 'success' : 'error') : 'default'} />
        </div>

        {pw.length > 0 && (
          <div className="mb-5">
            <div className="flex gap-1">
              {[0,1,2,3].map((i) => (
                <span key={i} className={cn('h-1 flex-1 rounded-sm', i < score ? barColor[score] : 'bg-neutral-200')} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="text-neutral-500">Força da senha</span>
              <span className={lvlColor[score]}>{lvlLabel[score] || '—'}</span>
            </div>
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} disabled={!matches}
          rightIcon={<ArrowRight className="h-4 w-4" />} className="w-full">
          Criar conta
        </Button>

        <p className="mt-6 text-center text-[13px] text-neutral-700">
          Já tem uma conta?{' '}
          <Link to="/login" className="border-b-2 border-primary pb-px font-bold text-black hover:text-primary-dark transition-colors">
            Entrar
          </Link>
        </p>
      </form>
    </SplitShell>
  )
}
