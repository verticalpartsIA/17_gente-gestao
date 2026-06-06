import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface SplitShellProps {
  /** Rótulo acima do título (ex.: "Plataforma B2B") */
  eyebrow: string
  title: ReactNode
  description: string
  features: string[]
  children: ReactNode
}

/**
 * Layout dividido: painel esquerdo escuro (marca) + painel direito branco (formulário).
 * Usado nas telas de Login e Cadastro.
 */
export function SplitShell({ eyebrow, title, description, features, children }: SplitShellProps) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_1.05fr]">

      {/* ── Painel esquerdo — marca ─────────────────────────── */}
      <div
        className="relative flex flex-col justify-between overflow-hidden bg-surface p-8 text-white lg:p-14"
        style={{ background: 'radial-gradient(circle at 30% 20%, #1c1c1c, #000 65%)' }}
      >
        {/* Grade sutil dourada */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245,196,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,0,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 30% 30%, #000 40%, transparent 80%)',
          }}
        />
        {/* Círculo decorativo */}
        <div className="pointer-events-none absolute right-[-120px] top-1/2 hidden h-[360px] w-[360px] -translate-y-1/2 rounded-full border-2 border-primary/20 lg:block" />

        <div className="relative z-10">
          <img src="/logo-white.png" alt="VerticalParts" className="h-9 object-contain" />
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary before:h-0.5 before:w-7 before:bg-primary before:content-['']">
            {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight md:text-4xl lg:text-[44px]">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">{description}</p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          © {new Date().getFullYear()} VerticalParts
        </div>
      </div>

      {/* ── Painel direito — formulário ─────────────────────── */}
      <div className="flex items-center justify-center bg-white p-8 lg:p-14">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  )
}
