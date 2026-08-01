import React, { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/auth/Field'
import { Level } from '@/lib/auth'
import {
  Search,
  Filter,
  UserPlus,
  Upload,
  CheckCircle,
  X,
  Briefcase
} from 'lucide-react'

type Dept = 'Diretoria' | 'Logística' | 'Almoxarifado/PCP' | 'Produção' | 'Consultoria Técnica' | 'Inst. e Montagem' | 'Projetos/TI' | 'Operações'

interface Employee {
  id: string
  name: string
  role: string
  email: string
  cpf: string
  level: Level
  department: Dept
  employmentType: 'CLT' | 'PJ' | 'Terceiro' | 'Aprendiz'
  admissionDate: string
  salary: string
  status: 'Ativo' | 'Inativo'
  docs: { rg: boolean; cpf: boolean; cnh: boolean; proof: boolean }
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'dm',  name: 'Diego Maeno',       role: 'CEO',                                  email: 'diego@verticalparts.com.br',     cpf: '—', level: 'Administrador', department: 'Diretoria',          employmentType: 'CLT',     admissionDate: '2015-01-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'do',  name: 'Danilo Oliveira',   role: 'Sup. de Logística',                    email: 'danilo@verticalparts.com.br',    cpf: '—', level: 'Lider',          department: 'Logística',          employmentType: 'CLT',     admissionDate: '2018-03-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'ac',  name: 'Aurélio Carvalho',  role: 'Técnico de Campo Sênior',              email: 'aurelio@verticalparts.com.br',   cpf: '—', level: 'Colaborador',    department: 'Logística',          employmentType: 'CLT',     admissionDate: '2019-06-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'jc',  name: 'Juciê Santos',      role: 'Aux. de Produção',                     email: 'jucie@verticalparts.com.br',     cpf: '—', level: 'Colaborador',    department: 'Produção',           employmentType: 'CLT',     admissionDate: '2021-02-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'gs',  name: 'Gustavo da Silva',  role: 'Aux. de Produção',                     email: 'gustavo@verticalparts.com.br',   cpf: '—', level: 'Colaborador',    department: 'Produção',           employmentType: 'CLT',     admissionDate: '2022-05-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'mn',  name: 'Marco Antonio',     role: 'Ajudante Geral',                       email: 'marco@verticalparts.com.br',     cpf: '—', level: 'Colaborador',    department: 'Logística',          employmentType: 'CLT',     admissionDate: '2022-08-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'fc',  name: 'Franklin Costa',    role: 'Analista Almoxarifado',                email: 'franklin@verticalparts.com.br',  cpf: '—', level: 'Lider',          department: 'Almoxarifado/PCP',   employmentType: 'CLT',     admissionDate: '2019-01-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'ta',  name: 'Tiago Acacio',      role: 'Assist. Almoxarifado',                 email: 'tiago@verticalparts.com.br',     cpf: '—', level: 'Colaborador',    department: 'Almoxarifado/PCP',   employmentType: 'CLT',     admissionDate: '2023-03-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'mr',  name: 'Matheus Rocha',     role: 'Assist. Expedição',                    email: 'matheus@verticalparts.com.br',   cpf: '—', level: 'Colaborador',    department: 'Logística',          employmentType: 'CLT',     admissionDate: '2023-07-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'mt',  name: 'Magda Torres',      role: 'Assist. PCP',                          email: 'magda@verticalparts.com.br',     cpf: '—', level: 'Lider',          department: 'Almoxarifado/PCP',   employmentType: 'CLT',     admissionDate: '2020-04-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'nc',  name: 'Nailson Cruz',      role: 'Serralheiro',                          email: 'nailson@verticalparts.com.br',   cpf: '—', level: 'Colaborador',    department: 'Produção',           employmentType: 'CLT',     admissionDate: '2021-09-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'ej',  name: 'Edmilson Jesus',    role: 'Motorista',                            email: 'edmilson@verticalparts.com.br',  cpf: '—', level: 'Colaborador',    department: 'Logística',          employmentType: 'CLT',     admissionDate: '2022-01-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'ge',  name: 'Gelson Simões',     role: 'Consultor Técnico Estratégico',        email: 'gelson@verticalparts.com.br',    cpf: '—', level: 'Lider',          department: 'Consultoria Técnica', employmentType: 'CLT',    admissionDate: '2017-06-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'gb',  name: 'Gesse Batista',     role: 'Motorista',                            email: 'gesse@verticalparts.com.br',     cpf: '—', level: 'Colaborador',    department: 'Logística',          employmentType: 'CLT',     admissionDate: '2023-11-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'ma',  name: 'Mauricio Araujo',   role: 'Supervisor de Inst. e Montagem',       email: 'mauricio@verticalparts.com.br',  cpf: '—', level: 'Lider',          department: 'Inst. e Montagem',   employmentType: 'CLT',     admissionDate: '2018-09-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'se',  name: 'Silvio Elias',      role: 'Tec. de Instalação e Manut. Sênior',  email: 'silvio@verticalparts.com.br',    cpf: '—', level: 'Colaborador',    department: 'Inst. e Montagem',   employmentType: 'CLT',     admissionDate: '2019-11-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'vl',  name: 'Vinicius Leite',    role: 'Analista de Projetos - BST Monarch',  email: 'vinicius@verticalparts.com.br',  cpf: '—', level: 'Lider',          department: 'Projetos/TI',        employmentType: 'CLT',     admissionDate: '2022-10-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
  { id: 'fb',  name: 'Felipe Barros',     role: 'Jovem Aprendiz',                       email: 'felipe@verticalparts.com.br',    cpf: '—', level: 'Colaborador',    department: 'Projetos/TI',        employmentType: 'Aprendiz', admissionDate: '2025-02-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: false } },
  { id: 'aa',  name: 'Arilene Avila',     role: 'Gestora de Operações',                 email: 'arilene@verticalparts.com.br',   cpf: '—', level: 'Lider',          department: 'Operações',          employmentType: 'CLT',     admissionDate: '2020-07-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'as',  name: 'Alexandre Schmidt', role: 'Engenheiro',                           email: 'alexandre@verticalparts.com.br', cpf: '—', level: 'Colaborador',    department: 'Operações',          employmentType: 'CLT',     admissionDate: '2023-05-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: true,  proof: true  } },
  { id: 'bs',  name: 'Brayan Souza',      role: 'Tec. Mecatrônico',                     email: 'brayan@verticalparts.com.br',    cpf: '—', level: 'Colaborador',    department: 'Operações',          employmentType: 'CLT',     admissionDate: '2024-03-01', salary: 'Confidencial', status: 'Ativo', docs: { rg: true,  cpf: true,  cnh: false, proof: true  } },
]

export default function ColaboradoresPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('Todos')
  const [filterDept, setFilterDept] = useState<string>('Todos')
  const [showForm, setShowForm] = useState(false)

  // Formulário State
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formCpf, setFormCpf] = useState('')
  const [formLevel, setFormLevel] = useState<Level>('Colaborador')
  const [formDept, setFormDept] = useState<Dept>('Logística')
  const [formType, setFormType] = useState<'CLT' | 'PJ' | 'Terceiro' | 'Aprendiz'>('CLT')
  const [formAdmission, setFormAdmission] = useState('')
  const [formSalary, setFormSalary] = useState('')

  // Upload simulado
  const [uploadedDocs, setUploadedDocs] = useState({
    rg: false,
    cpf: false,
    cnh: false,
    proof: false
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formCpf || !formAdmission) {
      alert('Preencha os campos obrigatórios!')
      return
    }

    const newEmployee: Employee = {
      id: 'usr-' + Math.random().toString(36).substring(2),
      name: formName,
      role: '',
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '')}@verticalparts.com.br`,
      cpf: formCpf || '—',
      level: formLevel,
      department: formDept,
      employmentType: formType,
      admissionDate: formAdmission,
      salary: formSalary || 'A definir',
      status: 'Ativo',
      docs: { ...uploadedDocs }
    }

    setEmployees([newEmployee, ...employees])
    setShowForm(false)
    resetForm()
  }

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormCpf('')
    setFormLevel('Colaborador')
    setFormDept('Logística')
    setFormType('CLT')
    setFormAdmission('')
    setFormSalary('')
    setUploadedDocs({ rg: false, cpf: false, cnh: false, proof: false })
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.cpf.includes(search) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase()))
    const matchesType = filterType === 'Todos' || emp.employmentType === filterType
    const matchesDept = filterDept === 'Todos' || emp.department === filterDept
    return matchesSearch && matchesType && matchesDept
  })

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE COLABORADORES">
      <div className="space-y-6">
        
        {/* FILTROS E BUSCA */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-surface-card p-4 border border-surface-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg3" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou e-mail..."
              className="w-full bg-surface-elevated border border-surface-border py-2 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-primary text-fg-on-dark rounded-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <select
                className="bg-surface-elevated border border-surface-border py-2 px-3 text-xs font-sans text-fg-on-dark focus:outline-none focus:border-primary"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="Todos">VÍNCULO: TODOS</option>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Terceiro">TERCEIRO</option>
                <option value="Aprendiz">APRENDIZ</option>
              </select>
            </div>

            <select
              className="bg-surface-elevated border border-surface-border py-2 px-3 text-xs font-sans text-fg-on-dark focus:outline-none focus:border-primary"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="Todos">DEPARTAMENTO: TODOS</option>
              <option value="Diretoria">DIRETORIA</option>
              <option value="Logística">LOGÍSTICA</option>
              <option value="Almoxarifado/PCP">ALMOXARIFADO / PCP</option>
              <option value="Produção">PRODUÇÃO</option>
              <option value="Consultoria Técnica">CONSULTORIA TÉCNICA</option>
              <option value="Inst. e Montagem">INST. E MONTAGEM</option>
              <option value="Projetos/TI">PROJETOS / TI</option>
              <option value="Operações">OPERAÇÕES</option>
            </select>

            <Button onClick={() => setShowForm(true)} rightIcon={<UserPlus className="h-4 w-4" />}>
              ADMITIR COLABORADOR →
            </Button>
          </div>
        </div>

        {/* MODAL / FORMULÁRIO DE ADMISSÃO */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-3xl bg-surface border border-surface-border p-6 shadow-dark max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
                <h3 className="text-xl font-display font-bold text-primary tracking-wider">ADMISSÃO DE COLABORADOR</h3>
                <button onClick={() => { setShowForm(false); resetForm() }} className="text-fg3 hover:text-fg-on-dark">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="NOME COMPLETO"
                    placeholder="Nome do colaborador"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                  />
                  <Field
                    label="E-MAIL"
                    placeholder="exemplo@verticalparts.com.br"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                  />
                  <Field
                    label="CPF / CNPJ"
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    value={formCpf}
                    onChange={e => setFormCpf(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-sans text-fg-on-dark tracking-wider block">VÍNCULO</label>
                    <select
                      className="w-full bg-surface-card border border-surface-border p-2.5 text-sm font-sans text-fg-on-dark focus:outline-none focus:border-primary"
                      value={formType}
                      onChange={e => setFormType(e.target.value as any)}
                    >
                      <option value="CLT">CLT (CONTRATO CLT)</option>
                      <option value="PJ">PJ (PRESTAÇÃO DE SERVIÇOS)</option>
                      <option value="Terceiro">TERCEIRO</option>
                      <option value="Aprendiz">JOVEM APRENDIZ</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-sans text-fg-on-dark tracking-wider block">DEPARTAMENTO</label>
                    <select
                      className="w-full bg-surface-card border border-surface-border p-2.5 text-sm font-sans text-fg-on-dark focus:outline-none focus:border-primary"
                      value={formDept || 'Logística'}
                      onChange={e => setFormDept(e.target.value as Dept)}
                    >
                      <option value="Diretoria">DIRETORIA</option>
                      <option value="Logística">LOGÍSTICA</option>
                      <option value="Almoxarifado/PCP">ALMOXARIFADO / PCP</option>
                      <option value="Produção">PRODUÇÃO</option>
                      <option value="Consultoria Técnica">CONSULTORIA TÉCNICA</option>
                      <option value="Inst. e Montagem">INST. E MONTAGEM</option>
                      <option value="Projetos/TI">PROJETOS / TI</option>
                      <option value="Operações">OPERAÇÕES</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-sans text-fg-on-dark tracking-wider block">PERFIL DE ACESSO</label>
                    <select
                      className="w-full bg-surface-card border border-surface-border p-2.5 text-sm font-sans text-fg-on-dark focus:outline-none focus:border-primary"
                      value={formLevel}
                      onChange={e => setFormLevel(e.target.value as any)}
                    >
                      <option value="Colaborador">COLABORADOR (PADRÃO)</option>
                      <option value="Lider">LÍDER DE DEPARTAMENTO</option>
                      <option value="Administrador">ADMINISTRADOR (SISTEMA)</option>
                    </select>
                  </div>
                  <Field
                    label="DATA DE ADMISSÃO"
                    type="date"
                    value={formAdmission}
                    onChange={e => setFormAdmission(e.target.value)}
                  />
                  <Field
                    label="SALÁRIO BASE"
                    placeholder="R$ 0.000,00"
                    value={formSalary}
                    onChange={e => setFormSalary(e.target.value)}
                  />
                </div>

                {/* UPLOAD DIGITAL DE DOCUMENTOS */}
                <div className="border-t border-surface-border pt-4">
                  <h4 className="text-xs font-bold text-fg-on-dark tracking-wider mb-3">CONFORMIDADE DOCUMENTAL (UPLOAD)</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => setUploadedDocs(prev => ({ ...prev, rg: !prev.rg }))}
                      className={`flex flex-col items-center justify-center border p-3 gap-2 ${
                        uploadedDocs.rg ? 'border-primary bg-primary/5 text-primary' : 'border-surface-border text-fg3'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px] font-bold">DOCUMENTO RG</span>
                      {uploadedDocs.rg && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadedDocs(prev => ({ ...prev, cpf: !prev.cpf }))}
                      className={`flex flex-col items-center justify-center border p-3 gap-2 ${
                        uploadedDocs.cpf ? 'border-primary bg-primary/5 text-primary' : 'border-surface-border text-fg3'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px] font-bold">DOCUMENTO CPF</span>
                      {uploadedDocs.cpf && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadedDocs(prev => ({ ...prev, cnh: !prev.cnh }))}
                      className={`flex flex-col items-center justify-center border p-3 gap-2 ${
                        uploadedDocs.cnh ? 'border-primary bg-primary/5 text-primary' : 'border-surface-border text-fg3'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px] font-bold">CNH VÁLIDA</span>
                      {uploadedDocs.cnh && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadedDocs(prev => ({ ...prev, proof: !prev.proof }))}
                      className={`flex flex-col items-center justify-center border p-3 gap-2 ${
                        uploadedDocs.proof ? 'border-primary bg-primary/5 text-primary' : 'border-surface-border text-fg3'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px] font-bold">COMPROVANTE RESID.</span>
                      {uploadedDocs.proof && <CheckCircle className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    CONFIRMAR ADMISSÃO →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LISTA DE COLABORADORES */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>LISTAGEM DE COLABORADORES ATIVOS</CardTitle>
              <Badge variant="admin">{filteredEmployees.length} REGISTROS</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-surface-elevated border border-surface-border">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-fg-on-dark tracking-wide uppercase">{emp.name}</h4>
                      <p className="text-xs text-neutral-500 font-sans">{emp.role}</p>
                      <p className="text-xs text-fg3 font-mono">{emp.email}</p>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <Badge variant="collaborator">{emp.employmentType}</Badge>
                        <span className="text-fg3 text-[11px] font-mono">| CPF: {emp.cpf}</span>
                        <span className="text-fg3 text-[11px] font-mono">| DEPT: {emp.department}</span>
                        <span className="text-fg3 text-[11px] font-mono">| ADMISÃO: {emp.admissionDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row gap-3 items-center self-end sm:self-center">
                    {/* INDICADORES DE DOCUMENTOS */}
                    <div className="flex items-center gap-1.5 mr-4">
                      <span className="text-[10px] text-fg3 font-mono mr-1">DOCS:</span>
                      <span className={`text-xs px-1.5 py-0.5 border ${emp.docs.rg ? 'border-primary text-primary' : 'border-surface-border text-fg3'}`}>RG</span>
                      <span className={`text-xs px-1.5 py-0.5 border ${emp.docs.cpf ? 'border-primary text-primary' : 'border-surface-border text-fg3'}`}>CPF</span>
                      <span className={`text-xs px-1.5 py-0.5 border ${emp.docs.cnh ? 'border-primary text-primary' : 'border-surface-border text-fg3'}`}>CNH</span>
                      <span className={`text-xs px-1.5 py-0.5 border ${emp.docs.proof ? 'border-primary text-primary' : 'border-surface-border text-fg3'}`}>RES</span>
                    </div>

                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs text-fg3 font-mono">SALÁRIO BASE</p>
                      <p className="text-sm font-semibold font-mono text-fg-on-dark">{emp.salary}</p>
                    </div>

                    <Badge variant={emp.status === 'Ativo' ? 'success' : 'danger'}>
                      {emp.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-fg3">
                  Nenhum colaborador localizado com os filtros selecionados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  )
}
