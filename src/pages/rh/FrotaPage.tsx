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
  Car, 
  AlertTriangle, 
  Plus, 
  ShieldCheck
} from 'lucide-react'

interface Vehicle {
  id: string
  plate: string
  model: string
  brand: string
  assignedTo: string
  licensingExpiry: string
  status: 'Disponível' | 'Em Uso' | 'Manutenção'
}

interface Fine {
  id: string
  plate: string
  driverName: string
  infraction: string
  amount: string
  points: number
  date: string
  status: 'Pendente' | 'Reconhecido' | 'Recurso'
}

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'veh-1', plate: 'VP-1234', model: 'Fiorino 1.4', brand: 'Fiat', assignedTo: 'Carlos Oliveira', licensingExpiry: '2026-08-30', status: 'Em Uso' },
  { id: 'veh-2', plate: 'VP-8980', model: 'Saveiro Trendline', brand: 'VW', assignedTo: 'Sem motorista', licensingExpiry: '2026-10-15', status: 'Disponível' },
  { id: 'veh-3', plate: 'VP-4490', model: 'Daily Cargo', brand: 'Iveco', assignedTo: 'Marcos Pontes', licensingExpiry: '2026-06-25', status: 'Em Uso' }
]

const INITIAL_FINES: Fine[] = [
  { id: 'fine-1', plate: 'VP-1234', driverName: 'Carlos Oliveira', infraction: 'Excesso de velocidade (até 20%)', amount: 'R$ 130,16', points: 4, date: '2026-05-22', status: 'Pendente' },
  { id: 'fine-2', plate: 'VP-4490', driverName: 'Marcos Pontes', infraction: 'Uso de celular ao conduzir', amount: 'R$ 293,47', points: 7, date: '2026-04-10', status: 'Reconhecido' }
]

export default function FrotaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'veiculos'
  
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

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES)
  
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showFineForm, setShowFineForm] = useState(false)
  const [recognizeModal, setRecognizeModal] = useState(false)
  const [activeFine, setActiveFine] = useState<Fine | null>(null)

  // Form states Veículo
  const [formPlate, setFormPlate] = useState('')
  const [formModel, setFormModel] = useState('')
  const [formBrand, setFormBrand] = useState('')

  // Form states Multa
  const [formFinePlate, setFormFinePlate] = useState('')
  const [formFineDriver, setFormFineDriver] = useState('')
  const [formFineDesc, setFormFineDesc] = useState('')
  const [formFineAmount, setFormFineAmount] = useState('')

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPlate || !formModel || !formBrand) return
    const newVeh: Vehicle = {
      id: 'veh-' + Math.random().toString(36).substring(2),
      plate: formPlate,
      model: formModel,
      brand: formBrand,
      assignedTo: 'Sem motorista',
      licensingExpiry: '2027-01-01',
      status: 'Disponível'
    }
    setVehicles([...vehicles, newVeh])
    setShowVehicleForm(false)
    setFormPlate('')
    setFormModel('')
    setFormBrand('')
  }

  const handleAddFine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFinePlate || !formFineDriver || !formFineDesc) return
    const newFine: Fine = {
      id: 'fine-' + Math.random().toString(36).substring(2),
      plate: formFinePlate,
      driverName: formFineDriver,
      infraction: formFineDesc,
      amount: formFineAmount || 'R$ 130,16',
      points: 4,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendente'
    }
    setFines([newFine, ...fines])
    setShowFineForm(false)
    setFormFinePlate('')
    setFormFineDriver('')
    setFormFineDesc('')
    setFormFineAmount('')
  }

  const openRecognize = (fine: Fine) => {
    setActiveFine(fine)
    setRecognizeModal(true)
  }

  const handleConfirmRecognition = () => {
    if (!activeFine) return
    setFines(fines.map(f => {
      if (f.id === activeFine.id) {
        return { ...f, status: 'Reconhecido' }
      }
      return f
    }))
    setRecognizeModal(false)
    setActiveFine(null)
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE FROTA E MULTAS">
      <div className="space-y-6">
        
        {/* TAB CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 gap-1">
          {[
            { id: 'veiculos', label: 'Cadastro de Veículos' },
            { id: 'multas', label: 'Infrações e Multas' }
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
            icon={Car}
            color="brand"
            label="FROTA DE VEÍCULOS"
            value={`${vehicles.length} Veículos`}
            sub="2 em uso, 1 disponível"
          />
          <KpiCard
            icon={AlertTriangle}
            color="red"
            label="INFRAÇÕES PENDENTES"
            value={`${fines.filter(f => f.status === 'Pendente').length} Multas`}
            sub="Aguardando assinatura de reconhecimento"
          />
          <KpiCard
            icon={ShieldCheck}
            color="green"
            label="VENCIMENTO DE CNHs"
            value="100% Válidos"
            sub="Nenhuma CNH vencida no banco"
          />
        </div>

        {/* TAB CONTENT: VEICULOS */}
        {activeTab === 'veiculos' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>VEÍCULOS DA FROTA</CardTitle>
              <Button size="sm" onClick={() => setShowVehicleForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                CADASTRAR VEÍCULO
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              {vehicles.map(veh => (
                <div key={veh.id} className="py-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">{veh.brand} {veh.model}</h4>
                    <p className="text-xs text-fg3 font-mono">PLACA: {veh.plate} | LICENCIAMENTO VENCE EM: {veh.licensingExpiry}</p>
                    <p className="text-xs text-fg3 font-mono mt-1">MOTORISTA RESPONSÁVEL: {veh.assignedTo}</p>
                  </div>
                  <Badge variant={veh.status === 'Disponível' ? 'success' : veh.status === 'Manutenção' ? 'danger' : 'collaborator'}>
                    {veh.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* TAB CONTENT: MULTAS */}
        {activeTab === 'multas' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>REGISTRO E AUTORIZAÇÃO DE MULTAS</CardTitle>
              <Button size="sm" onClick={() => setShowFineForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                REGISTRAR MULTA
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              {fines.map(fine => (
                <div key={fine.id} className="py-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">{fine.driverName} — PLACA {fine.plate}</h4>
                    <p className="text-xs text-fg3 font-mono">{fine.infraction}</p>
                    <div className="flex gap-2 mt-1 text-[11px] font-mono text-fg3">
                      <span>DATA INFRAÇÃO: {fine.date}</span>
                      <span>|</span>
                      <span>VALOR: {fine.amount} ({fine.points} Pontos)</span>
                    </div>
                  </div>
                  <div>
                    {fine.status === 'Pendente' ? (
                      <Button size="sm" variant="danger" onClick={() => openRecognize(fine)}>
                        ASSINAR RECONHECIMENTO →
                      </Button>
                    ) : (
                      <Badge variant="success">RECONHECIDO E ASSINADO</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CADASTRO DE VEÍCULO MODAL */}
        {showVehicleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                CADASTRAR NOVO VEÍCULO NA FROTA
              </h3>
              
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <Field
                  label="PLACA"
                  placeholder="Ex: VP-1234"
                  value={formPlate}
                  onChange={e => setFormPlate(e.target.value)}
                />
                <Field
                  label="MARCA"
                  placeholder="Ex: Fiat"
                  value={formBrand}
                  onChange={e => setFormBrand(e.target.value)}
                />
                <Field
                  label="MODELO"
                  placeholder="Ex: Fiorino"
                  value={formModel}
                  onChange={e => setFormModel(e.target.value)}
                />

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowVehicleForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    CONFIRMAR CADASTRO →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REGISTRAR MULTA MODAL */}
        {showFineForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                REGISTRAR MULTA DE TRÂNSITO
              </h3>
              
              <form onSubmit={handleAddFine} className="space-y-4">
                <Field
                  label="PLACA DO VEÍCULO"
                  placeholder="Ex: VP-1234"
                  value={formFinePlate}
                  onChange={e => setFormFinePlate(e.target.value)}
                />
                <Field
                  label="CONDUTOR (MOTORISTA)"
                  placeholder="Ex: Carlos Oliveira"
                  value={formFineDriver}
                  onChange={e => setFormFineDriver(e.target.value)}
                />
                <Field
                  label="DESCRIÇÃO DA INFRAÇÃO"
                  placeholder="Ex: Excesso de velocidade"
                  value={formFineDesc}
                  onChange={e => setFormFineDesc(e.target.value)}
                />
                <Field
                  label="VALOR DA MULTA"
                  placeholder="R$ 130,16"
                  value={formFineAmount}
                  onChange={e => setFormFineAmount(e.target.value)}
                />

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowFineForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    LANÇAR MULTA NO SISTEMA →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RECONHECIMENTO DE MULTA MODAL */}
        {recognizeModal && activeFine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4">
                TERMO DE RECONHECIMENTO E AUTORIZAÇÃO DE DESCONTO
              </h3>
              
              <div className="space-y-4 text-sm text-fg2">
                <p>
                  Eu, **{activeFine.driverName}**, reconheço ser o condutor do veículo placa **{activeFine.plate}** na data de **{activeFine.date}** e o único responsável pela infração de trânsito: **{activeFine.infraction}**.
                </p>
                <p>
                  Autorizo expressamente a empresa VerticalParts a realizar o desconto do valor da referida multa (**{activeFine.amount}**) em minha folha de pagamento, conforme previsto no Art. 462, § 1º da CLT.
                </p>
                <div className="bg-surface-card p-3 border border-surface-border font-mono text-xs text-fg3 space-y-1">
                  <p>IP: 189.120.33.4</p>
                  <p>Validação da Assinatura: ICP-Brasil MP 2.200-2/2001</p>
                  <p>Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                <Button variant="outline" onClick={() => { setRecognizeModal(false); setActiveFine(null) }}>
                  RECORRER DA MULTA
                </Button>
                <Button onClick={handleConfirmRecognition}>
                  RECONHECER E ASSINAR AUTORIZAÇÃO →
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
