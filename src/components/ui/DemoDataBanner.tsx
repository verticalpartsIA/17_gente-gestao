import { FlaskConical } from 'lucide-react'

// Módulo ainda não integrado ao Supabase — mostra isso explicitamente em vez
// de deixar dados fixos passarem por reais (issue #9, 17_gente-gestao).
export function DemoDataBanner() {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded border-l-[3px] border-primary bg-primary/10 p-3.5 text-sm text-neutral-800">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark" />
      <span>
        <strong>Dados de demonstração.</strong> Este módulo ainda não está integrado ao banco de dados —
        os números e registros abaixo são exemplos fixos, não refletem a operação real da empresa.
      </span>
    </div>
  )
}
