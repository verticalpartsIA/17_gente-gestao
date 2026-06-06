import { Link } from 'react-router-dom'
import {
  ArrowRight, Mail, Lock, User, TrendingUp, Users,
  Package, CheckSquare, DollarSign, AlertTriangle,
  ExternalLink, Palette, Type, MousePointerClick,
  Tag, LayoutTemplate, KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Field } from '@/components/auth/Field'
import { FormHead } from '@/components/auth/FormHead'
import { colors } from '@/tokens/tokens'

function Section({ id, icon: Icon, title, children }: { id: string; icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14">
      <div className="mb-6 flex items-center gap-3 border-b border-neutral-200 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary-dark" />
        </div>
        <h2 className="text-lg font-bold text-black">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="h-14" style={{ background: hex }} />
      <div className="bg-white px-3 py-2">
        <p className="text-xs font-semibold text-black">{name}</p>
        <p className="text-[11px] text-neutral-500 font-mono">{hex}</p>
      </div>
    </div>
  )
}

interface ShowcasePageProps {
  embedded?: boolean
}

export default function ShowcasePage({ embedded = false }: ShowcasePageProps) {
  const wrap = embedded
    ? 'max-w-5xl mx-auto'
    : 'min-h-screen bg-neutral-50 px-6 py-12'

  return (
    <div className={wrap}>

      {/* ── HEADER (só na versão standalone) ──────────────────────── */}
      {!embedded && (
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <img src="/logo-color.png" alt="VerticalParts" className="h-10 object-contain" />
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>Cadastrar</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-primary bg-white p-6 shadow-card">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark before:h-0.5 before:w-5 before:bg-primary before:content-['']">
              Design System
            </span>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-black">VP Design System</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
              Fundação visual unificada para todos os produtos internos da VerticalParts.
              Todos os projetos devem usar estes tokens, componentes e padrões de layout
              para garantir identidade visual consistente.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Tailwind CSS 3', 'Supabase Auth', 'SSO Pronto'].map((t) => (
                <Badge key={t} variant="info">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 1. CORES ──────────────────────────────────────────────── */}
      <Section id="cores" icon={Palette} title="Cores">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Marca</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <ColorSwatch name="primary"       hex={colors.primary}      />
            <ColorSwatch name="primary-dark"  hex={colors.primaryDark}  />
            <ColorSwatch name="primary-light" hex={colors.primaryLight} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Superfícies escuras</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <ColorSwatch name="surface"          hex={colors.surface}         />
            <ColorSwatch name="surface-card"     hex={colors.surfaceCard}     />
            <ColorSwatch name="surface-elevated" hex={colors.surfaceElevated} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            <ColorSwatch name="success" hex={colors.success} />
            <ColorSwatch name="warning" hex={colors.warning} />
            <ColorSwatch name="danger"  hex={colors.danger}  />
            <ColorSwatch name="info"    hex={colors.info}    />
          </div>
        </div>
      </Section>

      {/* ── 2. TIPOGRAFIA ─────────────────────────────────────────── */}
      <Section id="tipografia" icon={Type} title="Tipografia">
        <div className="space-y-3">
          {[
            { tag: 'h1', label: 'Heading 1', cls: 'text-4xl font-extrabold' },
            { tag: 'h2', label: 'Heading 2', cls: 'text-3xl font-extrabold' },
            { tag: 'h3', label: 'Heading 3', cls: 'text-2xl font-bold'      },
            { tag: 'h4', label: 'Heading 4', cls: 'text-xl font-bold'       },
            { tag: 'p',  label: 'Body',      cls: 'text-sm text-neutral-700'},
            { tag: 'p',  label: 'Small',     cls: 'text-xs text-neutral-500'},
            { tag: 'p',  label: 'Label',     cls: 'text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-700'},
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-baseline gap-4 border-b border-neutral-100 pb-3">
              <span className="w-24 shrink-0 text-[11px] text-neutral-400">{label}</span>
              <p className={cls}>VerticalParts — sistema interno</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. BOTÕES ─────────────────────────────────────────────── */}
      <Section id="botoes" icon={MousePointerClick} title="Botões">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Variantes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Tamanhos</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>Large + ícone</Button>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Estados</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Carregando...</Button>
              <Button disabled>Desativado</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. BADGES ─────────────────────────────────────────────── */}
      <Section id="badges" icon={Tag} title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Ativo</Badge>
          <Badge variant="warning">Atenção</Badge>
          <Badge variant="danger">Inativo</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="admin">Administrador</Badge>
          <Badge variant="leader">Lider</Badge>
          <Badge variant="collaborator">Colaborador</Badge>
          <Badge variant="active">Online</Badge>
          <Badge variant="inactive">Desativado</Badge>
        </div>
      </Section>

      {/* ── 5. CAMPOS DE FORMULÁRIO ───────────────────────────────── */}
      <Section id="campos" icon={KeyRound} title="Campos de Formulário">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8">
          <Field label="E-mail" type="email" placeholder="seu@verticalparts.com.br"
            icon={<Mail className="h-4 w-4" />} />
          <Field label="Senha" passwordToggle placeholder="••••••••••"
            icon={<Lock className="h-4 w-4" />} />
          <Field label="Nome (sucesso)" placeholder="João da Silva" state="success"
            icon={<User className="h-4 w-4" />} help="Nome válido." />
          <Field label="E-mail (erro)" type="email" placeholder="email inválido" state="error"
            icon={<Mail className="h-4 w-4" />} help="E-mail inválido ou já cadastrado." />
        </div>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
          <FormHead eyebrow="Exemplo" title="Cabeçalho de formulário"
            description="O FormHead é usado no topo de todos os formulários de autenticação." />
        </div>
      </Section>

      {/* ── 6. CARDS ──────────────────────────────────────────────── */}
      <Section id="cards" icon={LayoutTemplate} title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Card Claro</CardTitle></CardHeader>
            <p className="text-sm text-neutral-600">Usado na área de conteúdo (fundo branco).</p>
          </Card>
          <Card theme="dark">
            <CardHeader><CardTitle dark>Card Escuro</CardTitle></CardHeader>
            <p className="text-sm text-slate-400">Usado em painéis e dashboards escuros.</p>
          </Card>
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader><CardTitle>Card Destaque</CardTitle></CardHeader>
            <p className="text-sm text-neutral-600">Variante com borda da marca.</p>
          </Card>
        </div>
      </Section>

      {/* ── 7. KPI CARDS ──────────────────────────────────────────── */}
      <Section id="kpi" icon={TrendingUp} title="KPI Cards">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={DollarSign}    color="green"  label="Valor aprovado"   value="R$ 420k" sub="+12% este mês" />
          <KpiCard icon={TrendingUp}    color="blue"   label="Propostas"        value={38}       sub="6 aguardando"   />
          <KpiCard icon={Users}         color="purple" label="Clientes ativos"  value={214}                           />
          <KpiCard icon={Package}       color="brand"  label="SKUs em estoque"  value="4.218"   sub="98% disponível" />
          <KpiCard icon={CheckSquare}   color="green"  label="Tarefas"          value={57}       sub="sem atrasos"    />
          <KpiCard icon={AlertTriangle} color="red"    label="Alertas"          value={3}        sub="requer atenção" />
        </div>
      </Section>

      {/* ── 8. LINKS RÁPIDOS ──────────────────────────────────────── */}
      {!embedded && (
        <Section id="paginas" icon={ExternalLink} title="Páginas de Autenticação">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Login',         href: '/login'           },
              { label: 'Cadastro',      href: '/register'        },
              { label: 'Esqueci senha', href: '/forgot-password' },
              { label: 'Nova senha',    href: '/reset-password'  },
            ].map(({ label, href }) => (
              <Link key={href} to={href}>
                <Card className="cursor-pointer text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm">
                  <p className="text-sm font-semibold text-black">{label}</p>
                  <p className="mt-1 font-mono text-[11px] text-neutral-400">{href}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {!embedded && (
        <footer className="mt-12 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} VerticalParts — VP Design System v1.0
        </footer>
      )}
    </div>
  )
}
