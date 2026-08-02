import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/auth/Field'
import { Plus } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  category: string
  priority: 'Baixa' | 'Média' | 'Alta'
  status: 'Aberto' | 'Em Atendimento' | 'Resolvido'
  date: string
}

const INITIAL_TICKETS: Ticket[] = [
  { id: 't-1', subject: 'Divergência na folha de ponto de Maio', category: 'Ponto Eletrônico', priority: 'Média', status: 'Em Atendimento', date: '04/06/2026' },
  { id: 't-2', subject: 'Problema no saldo do cartão de benefícios Caju', category: 'Benefícios', priority: 'Alta', status: 'Aberto', date: '05/06/2026' },
  { id: 't-3', subject: 'Dúvidas sobre o prazo de agendamento de férias', category: 'Departamento Pessoal', priority: 'Baixa', status: 'Resolvido', date: '28/05/2026' }
]

export default function SuportePage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Ponto Eletrônico')
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média')

  const handleOpenTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) return
    const newTicket: Ticket = {
      id: 't-' + Math.random().toString(36).substring(2),
      subject,
      category,
      priority,
      status: 'Aberto',
      date: new Date().toLocaleDateString('pt-BR')
    }
    setTickets([newTicket, ...tickets])
    setShowForm(false)
    setSubject('')
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="SUPORTE & CENTRAL DE AJUDA">
      <div className="space-y-6">
        <DemoDataBanner />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>SEUS CHAMADOS DE SUPORTE</CardTitle>
              <Button size="sm" onClick={() => setShowForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                ABRIR CHAMADO
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">CHAMADO / ASSUNTO</th>
                    <th className="p-3">CATEGORIA</th>
                    <th className="p-3">PRIORIDADE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">DATA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase">
                        <p>{ticket.subject}</p>
                        <span className="text-[10px] text-fg3 font-mono block">ID: {ticket.id}</span>
                      </td>
                      <td className="p-3 font-mono">{ticket.category}</td>
                      <td className="p-3">
                        <Badge variant={ticket.priority === 'Alta' ? 'danger' : ticket.priority === 'Média' ? 'warning' : 'collaborator'}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={ticket.status === 'Resolvido' ? 'success' : ticket.status === 'Em Atendimento' ? 'warning' : 'admin'}>
                          {ticket.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono">{ticket.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="border-b border-surface-border pb-3">
              <CardTitle>DÚVIDAS FREQUENTES (FAQ)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 font-sans text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-fg-on-dark uppercase">Como alterar minha conta de recebimento?</h5>
                <p className="text-fg3">Acesse Configurações &gt; Dados Bancários ou envie um chamado direto na categoria DP.</p>
              </div>

              <div className="space-y-1 border-t border-surface-border pt-3">
                <h5 className="font-bold text-fg-on-dark uppercase">Qual o prazo para agendar minhas férias?</h5>
                <p className="text-fg3">As solicitações de férias devem ser enviadas com pelo menos 60 dias de antecedência para aprovação da gestão.</p>
              </div>

              <div className="space-y-1 border-t border-surface-border pt-3">
                <h5 className="font-bold text-fg-on-dark uppercase">Como retificar marcação de ponto esquecida?</h5>
                <p className="text-fg3">Acesse o Meu Espaço &gt; Ajuste de Ponto, selecione o dia e envie a justificativa com anexo.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MODAL ABRIR CHAMADO */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                ABRIR CHAMADO DE SUPORTE
              </h3>
              
              <form onSubmit={handleOpenTicket} className="space-y-4">
                <Field
                  label="ASSUNTO / DÚVIDA"
                  placeholder="Ex: Divergência de saldo Caju"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">CATEGORIA</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Ponto Eletrônico">PONTO ELETRÔNICO</option>
                    <option value="Benefícios">BENEFÍCIOS</option>
                    <option value="Departamento Pessoal">DEPARTAMENTO PESSOAL</option>
                    <option value="Segurança / EPI">SEGURANÇA / EPI</option>
                    <option value="Sistemas / TI">SISTEMAS / TI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">PRIORIDADE</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                  >
                    <option value="Baixa">BAIXA</option>
                    <option value="Média">MÉDIA</option>
                    <option value="Alta">ALTA</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    ENVIAR CHAMADO →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
