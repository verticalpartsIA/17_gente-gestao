import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Badge } from '@/components/ui/Badge'
import { 
  Network, 
  Users, 
  ArrowDown
} from 'lucide-react'

export default function OrganogramaPage() {
  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ESTRUTURA ORGANIZACIONAL & ORGANOGRAMA">
      <div className="space-y-6">
        
        {/* ORG CHART HEADER */}
        <div className="bg-surface-card p-6 border border-surface-border text-center space-y-2">
          <Network className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-xl font-display font-bold text-fg-on-dark tracking-wider uppercase">ORGANOGRAMA CORPORATIVO — VERTICALPARTS</h3>
          <p className="text-xs text-fg3 font-mono">Estrutura organizacional ativa baseada nas permissões de cargo e departamentos oficiais.</p>
        </div>

        {/* ORGANOGRAM GRAPHIC REPRESENTATION */}
        <div className="flex flex-col items-center gap-6 py-6 overflow-x-auto bg-surface-card border border-surface-border p-4">
          
          {/* LEVEL 1: SUPER ADMIN / DIREÇÃO */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-surface border-2 border-primary text-center w-64 shadow-yellow">
              <Badge variant="admin">ADMINISTRADOR / DIRETORIA</Badge>
              <h4 className="font-bold text-fg-on-dark mt-2 text-sm uppercase">JULIANA SILVA</h4>
              <p className="text-[10px] text-fg3 font-mono uppercase mt-0.5">Gestora Geral / Financeiro</p>
            </div>
            <ArrowDown className="h-8 w-8 text-primary mt-2" />
          </div>

          {/* LEVEL 2: LÍDERES DE DEPARTAMENTO */}
          <div className="w-full flex flex-col items-center">
            
            {/* Horizontal connection line */}
            <div className="hidden md:block w-3/4 h-0.5 bg-surface-border mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              
              {/* DEPT 1: ENGENHARIA */}
              <div className="flex flex-col items-center border border-surface-border p-4 bg-surface relative">
                <div className="absolute -top-3 left-4">
                  <Badge variant="leader">LÍDER</Badge>
                </div>
                <h4 className="font-bold text-fg-on-dark text-sm uppercase mt-1">KARLA SOUZA</h4>
                <p className="text-[10px] text-fg3 font-mono uppercase">Líder Engenharia</p>
                <div className="w-full h-0.5 bg-surface-border my-3"></div>
                <div className="space-y-2 w-full text-xs font-mono">
                  <div className="p-2 bg-surface-elevated flex justify-between items-center">
                    <span>Marcos Pontes</span>
                    <Badge variant="collaborator">CLT</Badge>
                  </div>
                  <div className="p-2 bg-surface-elevated flex justify-between items-center">
                    <span>Roberto Santos</span>
                    <Badge variant="collaborator">PJ</Badge>
                  </div>
                </div>
              </div>

              {/* DEPT 2: LOGÍSTICA / FROTA */}
              <div className="flex flex-col items-center border border-surface-border p-4 bg-surface relative">
                <div className="absolute -top-3 left-4">
                  <Badge variant="leader">LÍDER</Badge>
                </div>
                <h4 className="font-bold text-fg-on-dark text-sm uppercase mt-1">JULIANA SILVA</h4>
                <p className="text-[10px] text-fg3 font-mono uppercase">Gestora Frota (Acumulativo)</p>
                <div className="w-full h-0.5 bg-surface-border my-3"></div>
                <div className="space-y-2 w-full text-xs font-mono">
                  <div className="p-2 bg-surface-elevated flex justify-between items-center">
                    <span>Carlos Oliveira</span>
                    <Badge variant="collaborator">CLT</Badge>
                  </div>
                </div>
              </div>

              {/* DEPT 3: OUTROS DEPARTAMENTOS */}
              <div className="flex flex-col items-center border border-surface-border p-4 bg-surface justify-center text-center">
                <Users className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-bold text-fg-on-dark text-xs uppercase">COMPRAS · MKT · VENDAS</h4>
                <p className="text-[9px] text-fg3 font-mono mt-1">Lideranças compartilhadas pelo Financeiro/Administrativo.</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </AppShell>
  )
}
