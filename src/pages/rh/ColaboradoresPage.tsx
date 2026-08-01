import React, { useState, useEffect } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/auth/Field'
import { Level } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
  Search,
  Filter,
  UserPlus,
  X,
  Briefcase,
  Star
} from 'lucide-react'

type Dept = 'Diretoria' | 'Logística' | 'Almoxarifado/PCP' | 'Produção' | 'Consultoria Técnica' | 'Inst. e Montagem' | 'Projetos/TI' | 'Operações'

interface Employee {
  id: string
  name: string
  role: string
  email: string
  avatar_url: string | null
  level: Level
  department: string
  status: 'Ativo' | 'Inativo'
  is_department_lead: boolean
}

export default function ColaboradoresPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('Todos')
  const [filterDept, setFilterDept] = useState<string>('Todos')
  const [showForm, setShowForm] = useState(false)

  // Formulário
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formLevel, setFormLevel] = useState<Level>('Colaborador')
  const [formDept, setFormDept] = useState<Dept>('Logística')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, name, email, avatar_url, level, department, is_active, is_department_lead')
        .eq('is_placeholder', false)
        .order('name')
      if (!error && data) setEmployees(data as Employee[])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formEmail) {
      alert('Preencha nome e e-mail!')
      return
    }
    const { error } = await (supabase as any).from('profiles').insert({
      name: formName,
      email: formEmail,
      level: formLevel,
      department: formDept,
      is_active: true,
      is_placeholder: false,
      is_department_lead: false,
    })
    if (error) { alert('Erro ao criar: ' + error.message); return }
    setShowForm(false)
    resetForm()
    // Recarrega lista
    const { data } = await (supabase as any)
      .from('profiles')
      .select('id, name, email, avatar_url, level, department, is_active, is_department_lead')
      .eq('is_placeholder', false)
      .order('name')
    if (data) setEmployees(data as Employee[])
  }

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormLevel('Colaborador')
    setFormDept('Logística')
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesLevel = filterLevel === 'Todos' || emp.level === filterLevel
    const matchesDept = filterDept === 'Todos' || emp.department === filterDept
    return matchesSearch && matchesLevel && matchesDept
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
              placeholder="Buscar por nome ou e-mail..."
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
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
              >
                <option value="Todos">NÍVEL: TODOS</option>
                <option value="Administrador">ADMINISTRADOR</option>
                <option value="Lider">LÍDER</option>
                <option value="Colaborador">COLABORADOR</option>
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
            <div className="w-full max-w-lg bg-surface border border-surface-border p-6 shadow-dark">
              <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
                <h3 className="text-xl font-display font-bold text-primary tracking-wider">ADMISSÃO DE COLABORADOR</h3>
                <button onClick={() => { setShowForm(false); resetForm() }} className="text-fg3 hover:text-fg-on-dark">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="NOME COMPLETO *"
                    placeholder="Nome do colaborador"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                  />
                  <Field
                    label="E-MAIL *"
                    placeholder="exemplo@verticalparts.com.br"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-sans text-fg-on-dark tracking-wider block">DEPARTAMENTO</label>
                    <select
                      className="w-full bg-surface-card border border-surface-border p-2.5 text-sm font-sans text-fg-on-dark focus:outline-none focus:border-primary"
                      value={formDept}
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
                      onChange={e => setFormLevel(e.target.value as Level)}
                    >
                      <option value="Colaborador">COLABORADOR (PADRÃO)</option>
                      <option value="Lider">LÍDER DE DEPARTAMENTO</option>
                      <option value="Administrador">ADMINISTRADOR (SISTEMA)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-fg3">A senha de acesso será definida pelo próprio colaborador via link enviado ao e-mail.</p>

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
            <CardTitle>COLABORADORES — VPSistema</CardTitle>
            <Badge variant="admin">{filteredEmployees.length} REGISTROS</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-surface-border">
            {loading && (
              <div className="py-10 text-center text-fg3 text-sm">Carregando colaboradores...</div>
            )}
            {!loading && filteredEmployees.map(emp => (
              <div key={emp.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {emp.avatar_url ? (
                    <img
                      src={emp.avatar_url}
                      alt={emp.name}
                      className="h-12 w-12 rounded-full object-cover border border-surface-border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated border border-surface-border">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-fg-on-dark tracking-wide uppercase">{emp.name}</h4>
                      {emp.is_department_lead && (
                        <Star className="h-3.5 w-3.5 text-primary fill-primary" title="Líder de departamento" />
                      )}
                    </div>
                    <p className="text-xs text-fg3 font-mono">{emp.email}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{emp.department ?? '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Badge variant={
                    emp.level === 'Administrador' ? 'admin' :
                    emp.level === 'Lider' ? 'leader' : 'collaborator'
                  }>
                    {emp.level}
                  </Badge>
                  <Badge variant={emp.is_active ? 'success' : 'danger'}>
                    {emp.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            ))}
            {!loading && filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-fg3">
                Nenhum colaborador localizado com os filtros selecionados.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppShell>
  )
}
