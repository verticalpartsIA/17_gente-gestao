import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  /** Rótulo do bloco (ex: "Entenda o critério"). */
  titulo: string
  children: ReactNode
  /** Ícone exibido no gatilho. */
  icone: ReactNode
  /** Texto para leitores de tela e para o atributo title. */
  ariaLabel: string
  variant?: 'guia' | 'nota5'
  className?: string
}

// Os painéis usam fundo opaco de propósito: o tooltip abre sobre a escala de
// notas, e qualquer transparência deixa os dois textos sobrepostos.
const variantClasses = {
  guia: {
    trigger: 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50',
    panel:   'border-blue-300 bg-blue-50',
    titulo:  'text-blue-700',
    texto:   'text-blue-900',
  },
  nota5: {
    trigger: 'text-neutral-400 hover:text-amber-700 hover:bg-amber-50',
    panel:   'border-amber-300 bg-amber-50',
    titulo:  'text-amber-800',
    texto:   'text-amber-950',
  },
}

/**
 * Tooltip de apoio ao avaliador.
 *
 * Abre no hover (desktop) e no clique/toque (mobile) — `title=` nativo não
 * funciona em toque, e o formulário de avaliação é usado também por quem está
 * em campo, no celular.
 */
export function InfoTooltip({
  titulo,
  children,
  icone,
  ariaLabel,
  variant = 'guia',
  className,
}: InfoTooltipProps) {
  const [aberto, setAberto] = useState(false)
  const [travado, setTravado] = useState(false) // aberto por clique
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const painelId = useId()
  const cls = variantClasses[variant]

  // Clique fora e Esc fecham o painel travado
  useEffect(() => {
    if (!travado) return

    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setTravado(false)
        setAberto(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setTravado(false)
        setAberto(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [travado])

  return (
    <span ref={wrapperRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={aberto}
        aria-describedby={aberto ? painelId : undefined}
        onClick={() => {
          setTravado(t => !t)
          setAberto(a => !travado || !a)
        }}
        onMouseEnter={() => setAberto(true)}
        onMouseLeave={() => !travado && setAberto(false)}
        onFocus={() => setAberto(true)}
        onBlur={() => !travado && setAberto(false)}
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          cls.trigger,
          aberto && 'bg-neutral-100',
        )}
      >
        {icone}
      </button>

      {aberto && (
        <span
          id={painelId}
          role="tooltip"
          className={cn(
            'absolute left-1/2 top-7 z-30 w-64 -translate-x-1/2 rounded-lg border p-3 shadow-xl',
            'sm:w-80',
            cls.panel,
          )}
        >
          <span className={cn('mb-1 block text-[10px] font-bold uppercase tracking-wider', cls.titulo)}>
            {titulo}
          </span>
          <span className={cn('block text-xs leading-relaxed', cls.texto)}>{children}</span>
        </span>
      )}
    </span>
  )
}
