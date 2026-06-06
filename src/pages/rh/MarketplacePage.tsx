import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, Gift, ShoppingBag, ShieldCheck } from 'lucide-react'

interface Partner {
  id: string
  name: string
  category: string
  desc: string
  status: 'Ativo' | 'Inativo'
  icon: any
}

const PARTNERS: Partner[] = [
  { id: 'p-1', name: 'VerticalParts Academy', category: 'Treinamento & Capacitação', desc: 'Mais de 300 cursos online integrados diretamente com o PDI dos colaboradores.', status: 'Ativo', icon: BookOpen },
  { id: 'p-2', name: 'Gympass / Wellhub', category: 'Saúde & Bem-estar', desc: 'Acesso a milhares de academias e programas de nutrição e meditação para o time.', status: 'Inativo', icon: Gift },
  { id: 'p-3', name: 'Creditas Benefícios', category: 'Crédito Consignado', desc: 'Empréstimo consignado privado, antecipação salarial e previdência privada corporativa.', status: 'Inativo', icon: ShoppingBag },
  { id: 'p-4', name: 'Caju Multi-benefícios', category: 'Flexibilização de Saldo', desc: 'Integre cartões Caju de bandeira Visa com saldos de alimentação, refeição e cultura.', status: 'Ativo', icon: ShieldCheck }
]

export default function MarketplacePage() {
  const [partners, setPartners] = useState<Partner[]>(PARTNERS)

  const handleToggleActive = (id: string) => {
    setPartners(partners.map(p => p.id === id ? { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' } : p))
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="MARKETPLACE DE SOLUÇÕES & CURSOS">
      <div className="space-y-6">
        
        <div className="p-5 border border-surface-border bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary font-display uppercase tracking-wider">ECOSSISTEMA INTEGRADO DE RH</h3>
            <p className="text-xs text-fg2 font-sans">
              Ative parceiros de saúde, seguros, treinamentos e benefícios com apenas um clique para sua equipe da VerticalParts.
            </p>
          </div>
          <Badge variant="admin">2 PARCEIROS ATIVOS</Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {partners.map(partner => (
            <Card key={partner.id} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-start justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <partner.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-sm leading-none">{partner.name}</h4>
                    <span className="text-[10px] text-fg3 font-mono mt-1 block">{partner.category.toUpperCase()}</span>
                  </div>
                </div>
                <Badge variant={partner.status === 'Ativo' ? 'success' : 'danger'}>
                  {partner.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 font-sans text-xs text-fg2 flex-1 flex flex-col justify-between gap-4">
                <p>{partner.desc}</p>
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant={partner.status === 'Ativo' ? 'outline' : 'primary'} 
                    onClick={() => handleToggleActive(partner.id)}
                    className="w-full sm:w-auto font-mono text-[10px] font-bold"
                  >
                    {partner.status === 'Ativo' ? 'DESATIVAR PARCEIRO' : 'SOLICITAR ATIVAÇÃO'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AppShell>
  )
}
