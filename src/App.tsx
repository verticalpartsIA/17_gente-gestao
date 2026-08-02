import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage  from '@/pages/ResetPasswordPage'
import ShowcasePage       from '@/pages/ShowcasePage'
import DashboardPage      from '@/pages/DashboardPage'

// Novos Módulos de RH e DP
import ColaboradoresPage  from '@/pages/rh/ColaboradoresPage'
import PontoPage          from '@/pages/rh/PontoPage'
import SSMAPage           from '@/pages/rh/SSMAPage'
import PerformancePage    from '@/pages/rh/PerformancePage'
import FrotaPage          from '@/pages/rh/FrotaPage'
import OrganogramaPage    from '@/pages/rh/OrganogramaPage'
import ProfilerPage       from '@/pages/rh/ProfilerPage'
import AtracaoPage        from '@/pages/rh/AtracaoPage'
import BeneficiosPage     from '@/pages/rh/BeneficiosPage'
import HoleritesPage      from '@/pages/rh/HoleritesPage'
import ConfiguracoesPage  from '@/pages/rh/ConfiguracoesPage'
import GestaoTalentosPage from '@/pages/rh/GestaoTalentosPage'
import RetencaoEngajamentoPage from '@/pages/rh/RetencaoEngajamentoPage'
import MarketplacePage from '@/pages/rh/MarketplacePage'
import SuportePage from '@/pages/rh/SuportePage'
import MeuEspacoPage from '@/pages/rh/MeuEspacoPage'

// Único ponto de entrada suportado é o card do vpsistema.com, que injeta
// ?sso_token=&sso_refresh= (ver AuthProvider). Quem chegar aqui sem sessão
// válida e sem esse par de tokens é mandado de volta pro Portal Central —
// não existe login manual direto neste subdomínio.
const PORTAL_URL = 'https://vpsistema.com'

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

// Nome amigável do módulo por rota, só para a mensagem de transição — deixa
// claro que a pessoa não perdeu contexto, só precisa entrar pelo card.
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'o Painel Geral',
  '/colaboradores': 'Colaboradores',
  '/ponto': 'o Ponto Eletrônico',
  '/ssma': 'Saúde Ocupacional (SST)',
  '/desempenho': 'Desenvolvimento e Performance',
  '/frota': 'Gestão de Frota',
  '/organograma': 'o Organograma',
  '/profiler': 'o Profiler',
  '/atracao': 'Atração de Talentos',
  '/beneficios': 'Benefícios',
  '/holerites': 'a Folha Digital',
  '/configuracoes': 'Configurações',
  '/gestao-talentos': 'Gestão de Talentos',
  '/retencao-engajamento': 'Retenção e Engajamento',
  '/marketplace': 'o Marketplace',
  '/suporte': 'o Suporte',
  '/meu-espaco': 'o Meu Espaço',
  '/showcase': 'o Design System',
}

function RedirectToPortal() {
  const location = useLocation()
  const moduleLabel = ROUTE_LABELS[location.pathname]

  useEffect(() => {
    const timer = setTimeout(() => window.location.replace(PORTAL_URL), 1400)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div>
        <p className="font-bold text-black">Redirecionando para o Portal VerticalParts</p>
        <p className="mt-1 text-sm text-neutral-600">
          {moduleLabel
            ? <>Para acessar {moduleLabel} do Gente &amp; Gestão, entre pelo card no vpsistema.com. Você será levado para lá em instantes.</>
            : <>O Gente &amp; Gestão é acessado a partir do vpsistema.com. Você será levado para lá em instantes.</>}
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!profile) return <RedirectToPortal />
  return <>{children}</>
}

function GuestRoute(_props: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (profile) return <Navigate to="/dashboard" replace />
  return <RedirectToPortal />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/showcase"        element={<ProtectedRoute><ShowcasePage /></ProtectedRoute>} />
      
      {/* Rotas de RH Protegidas */}
      <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/colaboradores"   element={<ProtectedRoute><ColaboradoresPage /></ProtectedRoute>} />
      <Route path="/ponto"           element={<ProtectedRoute><PontoPage /></ProtectedRoute>} />
      <Route path="/ssma"            element={<ProtectedRoute><SSMAPage /></ProtectedRoute>} />
      {/* Alias intuitivo — o nome do módulo no menu é "Saúde Ocupacional (SST)",
          mas a rota real sempre foi /ssma. Sem isso, digitar a URL óbvia dava tela em branco. */}
      <Route path="/saude-ocupacional" element={<Navigate to="/ssma?tab=aso" replace />} />
      <Route path="/desempenho"      element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
      <Route path="/frota"           element={<ProtectedRoute><FrotaPage /></ProtectedRoute>} />
      <Route path="/organograma"     element={<ProtectedRoute><OrganogramaPage /></ProtectedRoute>} />
      <Route path="/profiler"        element={<ProtectedRoute><ProfilerPage /></ProtectedRoute>} />
      <Route path="/atracao"         element={<ProtectedRoute><AtracaoPage /></ProtectedRoute>} />
      <Route path="/beneficios"      element={<ProtectedRoute><BeneficiosPage /></ProtectedRoute>} />
      <Route path="/holerites"       element={<ProtectedRoute><HoleritesPage /></ProtectedRoute>} />
      <Route path="/configuracoes"   element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
      <Route path="/gestao-talentos" element={<ProtectedRoute><GestaoTalentosPage /></ProtectedRoute>} />
      <Route path="/retencao-engajamento" element={<ProtectedRoute><RetencaoEngajamentoPage /></ProtectedRoute>} />
      <Route path="/marketplace"     element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/suporte"         element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
      <Route path="/meu-espaco"      element={<ProtectedRoute><MeuEspacoPage /></ProtectedRoute>} />
      
      <Route path="/"                element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
