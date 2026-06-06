import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Field } from '@/components/auth/Field'
import { 
  ShieldAlert, 
  Plus, 
  HeartPulse, 
  Wrench,
  BookOpen
} from 'lucide-react'

interface AsoRecord {
  id: string
  employeeName: string
  examType: 'Admissional' | 'Periódico' | 'Demissional'
  examDate: string
  expiryDate: string
  clinic: string
  doctor: string
  status: 'Apto' | 'Pendente' | 'Vencido'
}

interface EpiItem {
  id: string
  name: string
  ca: string
  category: string
  deliveryDate: string
  expiryDate: string
  status: 'Válido' | 'Vencendo' | 'Expirado'
}

const INITIAL_ASOS: AsoRecord[] = [
  { id: 'aso-1', employeeName: 'Carlos Oliveira', examType: 'Periódico', examDate: '2025-06-02', expiryDate: '2026-06-02', clinic: 'MEDTRAB VP', doctor: 'Dr. Alencar (CRM 4589)', status: 'Vencido' },
  { id: 'aso-2', employeeName: 'Juliana Silva', examType: 'Periódico', examDate: '2025-10-15', expiryDate: '2026-10-15', clinic: 'MEDTRAB VP', doctor: 'Dra. Marina (CRM 9088)', status: 'Apto' },
  { id: 'aso-3', employeeName: 'Karla Souza', examType: 'Periódico', examDate: '2025-08-20', expiryDate: '2026-08-20', clinic: 'MEDTRAB VP', doctor: 'Dr. Alencar (CRM 4589)', status: 'Apto' }
]

const INITIAL_EPIS: EpiItem[] = [
  { id: 'epi-1', name: 'BOTA DE SEGURANÇA BIDENSIDADE', ca: '43280', category: 'Proteção dos Pés', deliveryDate: '2026-01-10', expiryDate: '2026-07-10', status: 'Válido' },
  { id: 'epi-2', name: 'CAPACETE DE SEGURANÇA CLASSE B', ca: '29792', category: 'Proteção da Cabeça', deliveryDate: '2025-06-15', expiryDate: '2026-06-15', status: 'Vencendo' },
  { id: 'epi-3', name: 'ÓCULOS DE PROTEÇÃO LENTE INCOLOR', ca: '35156', category: 'Proteção Visual', deliveryDate: '2026-03-01', expiryDate: '2026-09-01', status: 'Válido' }
]

export default function SSMAPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'aso'
  
  const [activeTab, setActiveTab] = useState<string>(tabParam)

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const [asos, setAsos] = useState<AsoRecord[]>(INITIAL_ASOS)
  const [epis, setEpis] = useState<EpiItem[]>(INITIAL_EPIS)
  
  const [showEpiForm, setShowEpiForm] = useState(false)
  const [showAsoForm, setShowAsoForm] = useState(false)
  const [signModal, setSignModal] = useState(false)
  const [pendingEpiName, setPendingEpiName] = useState('')

  // Form states EPI
  const [formEpiName, setFormEpiName] = useState('')
  const [formEpiCa, setFormEpiCa] = useState('')
  const [formEpiCategory, setFormEpiCategory] = useState('Proteção Visual')

  // Form states ASO
  const [formAsoName, setFormAsoName] = useState('')
  const [formAsoType, setFormAsoType] = useState<'Admissional' | 'Periódico' | 'Demissional'>('Periódico')
  const [formAsoDate, setFormAsoDate] = useState('')

  const handleDeliverEpi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEpiName || !formEpiCa) return
    setPendingEpiName(formEpiName)
    setSignModal(true)
  }

  const confirmEpiSignature = () => {
    const newEpi: EpiItem = {
      id: 'epi-' + Math.random().toString(36).substring(2),
      name: formEpiName,
      ca: formEpiCa,
      category: formEpiCategory,
      deliveryDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 meses
      status: 'Válido'
    }
    setEpis([newEpi, ...epis])
    setSignModal(false)
    setShowEpiForm(false)
    setFormEpiName('')
    setFormEpiCa('')
  }

  const handleScheduleAso = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formAsoName || !formAsoDate) return
    const newAso: AsoRecord = {
      id: 'aso-' + Math.random().toString(36).substring(2),
      employeeName: formAsoName,
      examType: formAsoType,
      examDate: formAsoDate,
      expiryDate: new Date(new Date(formAsoDate).setFullYear(new Date(formAsoDate).getFullYear() + 1)).toISOString().split('T')[0],
      clinic: 'MEDTRAB VP',
      doctor: 'A agendar clínico',
      status: 'Pendente'
    }
    setAsos([newAso, ...asos])
    setShowAsoForm(false)
    setFormAsoName('')
    setFormAsoDate('')
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="SSMA — SEGURANÇA E SAÚDE OCUPACIONAL">
      <div className="space-y-6">
        
        {/* TAB CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 gap-1">
          {[
            { id: 'aso', label: 'Exames ASO' },
            { id: 'epis', label: 'Fichas de EPI' },
            { id: 'nrs', label: 'Normas Regulamentadoras (NRs)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-t-primary bg-surface text-primary' 
                  : 'border-t-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KpiCard
            icon={HeartPulse}
            color="red"
            label="ASO EXPIRADOS / PENDENTES"
            value="1 vencido, 1 agendado"
            sub="Exames admissionais/periódicos"
          />
          <KpiCard
            icon={ShieldAlert}
            color="brand"
            label="EPIs VENCENDO"
            value="1 item pendente"
            sub="Capacete de proteção Classe B"
          />
          <KpiCard
            icon={BookOpen}
            color="green"
            label="CONFORMIDADE NRs"
            value="98.2%"
            sub="NR-1, NR-6, NR-10 e NR-35 assinadas"
          />
        </div>

        {/* TAB CONTENT: ASO */}
        {activeTab === 'aso' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>CONTROLE DE EXAMES MÉDICOS (ASO)</CardTitle>
              <Button size="sm" onClick={() => setShowAsoForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                AGENDAR ASO
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              {asos.map(aso => (
                <div key={aso.id} className="py-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">{aso.employeeName}</h4>
                    <p className="text-xs text-fg3 font-mono">TIPO: {aso.examType.toUpperCase()} | CLÍNICA: {aso.clinic}</p>
                    <p className="text-xs text-fg3 font-mono">MÉDICO: {aso.doctor}</p>
                    <div className="flex gap-2 mt-1 text-[11px] font-mono text-fg3">
                      <span>DATA EXAME: {aso.examDate}</span>
                      <span>|</span>
                      <span>VENCIMENTO: {aso.expiryDate}</span>
                    </div>
                  </div>
                  <Badge variant={aso.status === 'Apto' ? 'success' : aso.status === 'Vencido' ? 'danger' : 'warning'}>
                    {aso.status === 'Apto' ? 'APTO' : aso.status === 'Vencido' ? 'VENCIDO / RENOVAR' : 'AGENDADO'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* TAB CONTENT: EPIS */}
        {activeTab === 'epis' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>CONTROLE E FICHA DE EPIs</CardTitle>
              <Button size="sm" onClick={() => setShowEpiForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                ENTREGAR EPI
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              {epis.map(epi => (
                <div key={epi.id} className="py-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">{epi.name}</h4>
                    <p className="text-xs text-fg3 font-mono">CA: {epi.ca} | CATEGORIA: {epi.category.toUpperCase()}</p>
                    <div className="flex gap-2 mt-1 text-[11px] font-mono text-fg3">
                      <span>ENTREGUE: {epi.deliveryDate}</span>
                      <span>|</span>
                      <span>TROCA EXPIRADA: {epi.expiryDate}</span>
                    </div>
                  </div>
                  <Badge variant={epi.status === 'Válido' ? 'success' : 'warning'}>
                    {epi.status === 'Válido' ? 'CA VÁLIDO' : 'SOLICITAR TROCA'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* TAB CONTENT: NRs */}
        {activeTab === 'nrs' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>CONFORMIDADE COM NORMAS REGULAMENTADORAS (NRs)</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              <div className="py-3 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-fg-on-dark uppercase text-xs">NR-1 — DISPOSIÇÕES GERAIS E GERENCIAMENTO DE RISCO</p>
                    <p className="text-xs text-fg3 font-mono font-bold">Termo de ciência assinado por 100% da equipe</p>
                  </div>
                </div>
                <Badge variant="success">100% CONFORME</Badge>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-fg-on-dark uppercase text-xs">NR-6 — EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL (EPI)</p>
                    <p className="text-xs text-fg3 font-mono font-bold">Registro de entrega com assinatura eletrônica ICP-Brasil</p>
                  </div>
                </div>
                <Badge variant="success">100% CONFORME</Badge>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-fg-on-dark uppercase text-xs">NR-35 — TRABALHO EM ALTURA</p>
                    <p className="text-xs text-fg3 font-mono font-bold">Exigido para montadores de elevadores (3 pendentes de reciclagem anual)</p>
                  </div>
                </div>
                <Badge variant="warning">RENOVAÇÃO PENDENTE</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FORMULÁRIO DE ENTREGA DE EPI */}
        {showEpiForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                REGISTRAR NOVA ENTREGA DE EPI
              </h3>
              
              <form onSubmit={handleDeliverEpi} className="space-y-4">
                <Field
                  label="NOME DO EQUIPAMENTO"
                  placeholder="Ex: Óculos de Proteção"
                  value={formEpiName}
                  onChange={e => setFormEpiName(e.target.value)}
                />
                <Field
                  label="CERTIFICADO DE APROVAÇÃO (CA)"
                  placeholder="Ex: 35156"
                  value={formEpiCa}
                  onChange={e => setFormEpiCa(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">CATEGORIA</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={formEpiCategory}
                    onChange={e => setFormEpiCategory(e.target.value)}
                  >
                    <option value="Proteção Visual">PROTEÇÃO VISUAL</option>
                    <option value="Proteção Auditiva">PROTEÇÃO AUDITIVA</option>
                    <option value="Proteção Cabeça">PROTEÇÃO DA CABEÇA</option>
                    <option value="Proteção dos Pés">PROTEÇÃO DOS PÉS</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowEpiForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    AVANÇAR PARA ASSINATURA →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FORMULÁRIO DE AGENDAMENTO ASO */}
        {showAsoForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                AGENDAR EXAME CLÍNICO (ASO)
              </h3>
              
              <form onSubmit={handleScheduleAso} className="space-y-4">
                <Field
                  label="NOME DO COLABORADOR"
                  placeholder="Ex: Carlos Oliveira"
                  value={formAsoName}
                  onChange={e => setFormAsoName(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">TIPO DE EXAME</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={formAsoType}
                    onChange={e => setFormAsoType(e.target.value as any)}
                  >
                    <option value="Admissional">ADMISSIONAL</option>
                    <option value="Periódico">PERIÓDICO</option>
                    <option value="Demissional">DEMISSIONAL</option>
                  </select>
                </div>
                <Field
                  label="DATA DE AGENDAMENTO"
                  type="date"
                  value={formAsoDate}
                  onChange={e => setFormAsoDate(e.target.value)}
                />

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAsoForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    CONFIRMAR AGENDAMENTO →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE ASSINATURA DE EPI */}
        {signModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4">
                ASSINATURA DE TERMO DE RECEBIMENTO DE EPI
              </h3>
              
              <div className="space-y-4 text-sm text-fg2">
                <p>
                  Declaro que recebi o Equipamento de Proteção Individual (**{pendingEpiName}**) em perfeito estado de conservação e uso, comprometendo-me a utilizá-lo estritamente para as minhas funções e em conformidade com as normas de segurança (NR-6) da VerticalParts.
                </p>
                <div className="bg-surface-card p-3 border border-surface-border font-mono text-xs text-fg3 space-y-1">
                  <p>IP de Acesso: 189.120.33.4</p>
                  <p>Validação da Assinatura: ICP-Brasil MP 2.200-2/2001</p>
                  <p>Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                <Button variant="outline" onClick={() => setSignModal(false)}>
                  CANCELAR
                </Button>
                <Button onClick={confirmEpiSignature}>
                  ASSINAR TERMO DE RECEBIMENTO →
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
