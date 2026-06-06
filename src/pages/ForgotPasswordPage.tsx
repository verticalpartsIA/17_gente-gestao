import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { CenteredShell, FormHead, Field } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError('Não foi possível enviar. Verifique o e-mail informado.'); return }
    setSent(true)
  }

  return (
    <CenteredShell>
      <FormHead
        eyebrow="Recuperar acesso"
        title="Esqueceu a senha?"
        description="Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha."
        centered
      />

      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="font-bold text-black">E-mail enviado!</p>
          <p className="text-sm text-neutral-600">
            Verifique <span className="font-semibold text-black">{email}</span> e clique no link nos próximos 30 minutos.
          </p>
          <Link to="/login" className="mt-2 text-[13px] font-semibold text-neutral-700 hover:text-black transition-colors">
            ← Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded border-l-[3px] border-red-600 bg-red-50 p-3.5 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <Field label="E-mail" type="email" placeholder="seu@verticalparts.com.br"
              autoComplete="email" required icon={<Mail className="h-4 w-4" />}
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" size="lg" loading={loading}
              rightIcon={<Send className="h-4 w-4" />} className="mt-1 w-full">
              Enviar link de redefinição
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-700 hover:text-black transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        </>
      )}
    </CenteredShell>
  )
}
