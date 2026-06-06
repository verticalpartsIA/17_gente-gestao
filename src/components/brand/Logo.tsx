interface LogoProps {
  /** 'dark' = texto branco (para fundos escuros) | 'light' = texto preto */
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  /** Se fornecida, exibe imagem ao invés do mark SVG */
  src?: string
}

const sizes = {
  sm: { mark: 'h-6 w-6', text: 'text-base' },
  md: { mark: 'h-8 w-8', text: 'text-lg'   },
  lg: { mark: 'h-10 w-10','text': 'text-2xl' },
}

export function Logo({ variant = 'dark', size = 'md', src }: LogoProps) {
  const s = sizes[size]
  const textColor = variant === 'dark' ? 'text-white' : 'text-black'

  return (
    <div className="flex items-center gap-2.5">
      {src ? (
        <img src={src} alt="VerticalParts" className={`${s.mark} rounded-lg object-cover`} />
      ) : (
        /* Mark SVG: VP sobre fundo dourado */
        <div className={`${s.mark} flex shrink-0 items-center justify-center rounded-lg bg-primary`}>
          <span className="font-black text-black" style={{ fontSize: size === 'sm' ? 10 : size === 'md' ? 13 : 16 }}>
            VP
          </span>
        </div>
      )}
      <span className={`font-extrabold tracking-tight ${s.text} ${textColor}`}>
        VerticalParts
      </span>
    </div>
  )
}
