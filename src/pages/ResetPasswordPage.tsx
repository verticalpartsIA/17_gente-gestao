import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Check, ArrowLeft, CheckCheck } from 'lucide-react'
import { CenteredShell, FormHead, Field } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

function score(pw: string) {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const barColor = ['bg-neutral-200','bg-red-500','bg-orange-500','bg-primary','bg-green-500']
const lvlLabel = ['—',            'Fraca',     'Razoável',     'Boa',       'Forte']
const lvlColor = ['text-neutral-500','text-red-600','text-orange-500','text-primary-dark','text-green-600']

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pw,      setPw]      = useState('')
  const [pw2,     setPw2]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const s       = useMemo(() => score(pw), [pw])
  const matches = pw.length > 0 && pw === pw2

  const rules = [
    { ok: pw.length >= 8,          label: 'Mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(pw),        label: 'Letra maiúscula' },
    { ok: /[0-9]/.test(pw),        label: 'Pelo menos um número' },
    { ok: /[^A-Za-z0-9]/.test(pw), label: 'Caractere especial' },
  ]

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!matches || s < 3) return
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: pw })
    setLoading(false)
    if (err) { setError('Não foi possível redefinir. Solicite um novo link.'); return }
    navigate('/login', { replace: true })
  }

  return (
    <CenteredShell>
      <FormHead
        eyebrow="Nova senha"
        title="Defina sua nova senha"
        description="Escolha uma senha forte. Você fará login com ela em seguida."
        centered
      />

      {error && (
        <div className="mb-4 rounded border-l-[3px] border-red-600 bg-red-50 p-3.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <Field label="Nova senha" passwordToggle required placeholder="••••••••••"
          icon={<Lock className="h-4 w-4" />} containerClassName="mb-3"
          value={pw} onChange={(e) => setPw(e.target.value)} />

        <div className="mb-3 flex gap-1">
          {[0,1,2,3].map((i) => (
            <span key={i} className={cn('h-1 flex-1 rounded-sm', i < s ? barColor[s] : 'bg-neutral-200')} />
          ))}
        </div>
        <div className="mb-3 flex justify-between text-[11px] font-bold uppercase tracking-[0.14em]">
          <span className="text-neutral-500">Força</span>
          <span className={lvlColor[s]}>{lvlLabel[s]}</span>
        </div>

        <ul className="mb-5 grid gap-1.5">
          {rules.map((r) => (
            <li key={r.label} className={cn('flex items-center gap-2 text-xs', r.ok ? 'text-green-600' : 'text-neutral-500')}>
              <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full border', r.ok ? 'border-green-600 bg-green-600 text-white' : 'border-neutral-300')}>
                {r.ok && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
              </span>
              {r.label}
            </li>
          ))}
        </ul>

        <Field label="Confirmar nova senha" passwordToggle required placeholder="••••••••••"
          icon={<Lock className="h-4 w-4" />}
          value={pw2} onChange={(e) => setPw2(e.target.value)}
          state={pw2.length > 0 ? (matches ? 'success' : 'error') : 'default'}
          help={pw2.length > 0 && matches
            ? <span className="flex items-center gap-1.5"><CheckCheck className="h-3.5 w-3.5" /> As senhas coincidem.</span>
            : null}
        />

        <Button type="submit" size="lg" loading={loading} disabled={!matches || s < 3}
          rightIcon={<Check className="h-4 w-4" strokeWidth={3} />} className="mt-1 w-full">
          Atualizar senha
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-700 hover:text-black transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
      </div>
    </CenteredShell>
  )
}
