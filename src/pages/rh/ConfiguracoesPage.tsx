import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/auth/Field'
import { 
  Save, 
  CheckSquare, 
  Square 
} from 'lucide-react'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'empresa' | 'permissoes'>('empresa')

  // RBAC permissions state
  const [permissions, setPermissions] = useState({
    admin: { readPonto: true, writePonto: true, readAso: true, writeAso: true, readFrota: true, writeFrota: true },
    lider: { readPonto: true, writePonto: false, readAso: true, writeAso: false, readFrota: true, writeFrota: false },
    colab: { readPonto: true, writePonto: false, readAso: false, writeAso: false, readFrota: false, writeFrota: false }
  })

  const togglePermission = (role: 'admin' | 'lider' | 'colab', key: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !(prev[role] as any)[key]
      }
    }))
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="CONFIGURAÇÕES GERAIS E POLÍTICAS">
      <div className="space-y-6">
        
        {/* TABS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'empresa' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            DADOS CORPORATIVOS
          </button>
          <button
            onClick={() => setActiveTab('permissoes')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'permissoes' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            CONTROLE DE ACESSO (RBAC)
          </button>
        </div>

        {/* TAB: EMPRESA */}
        {activeTab === 'empresa' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>CADASTRO DA VERTICALPARTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="RAZÃO SOCIAL" value="VerticalParts Indústria e Distribuição Ltda" readOnly />
                  <Field label="CNPJ" value="12.345.678/0001-90" readOnly />
                  <Field label="ENDEREÇO DA MATRIZ" value="Av. das Nações Unidas, 1420 - São Paulo/SP" readOnly />
                  <Field label="TELEFONE GERAL" value="(11) 4002-8922" readOnly />
                </div>
                <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
                  <Button rightIcon={<Save className="h-4 w-4" />}>SALVAR DADOS</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DIRETRIZES GERAIS</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-fg2 space-y-2">
                <p>
                  As regras corporativas e de conformidade do DP e de Saúde Ocupacional seguem a risca os decretos de segurança industrial da ABNT.
                </p>
                <p>
                  Para redefinir o logotipo do sistema, entre em contato com o suporte técnico VerticalParts.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB: PERMISSOES (RBAC) */}
        {activeTab === 'permissoes' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>MATRIZ DE CARGOS E PERMISSÕES DE ACESSO</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-surface-elevated text-[11px] font-bold text-fg-on-dark tracking-wider border-b border-surface-border uppercase font-mono">
                    <th className="p-4">CARGO/PERFIL</th>
                    <th className="p-4 text-center">PONTO (VER)</th>
                    <th className="p-4 text-center">PONTO (REGISTRAR/AJUSTAR)</th>
                    <th className="p-4 text-center">EXAMES ASO (VER)</th>
                    <th className="p-4 text-center">EXAMES ASO (AGENDAR)</th>
                    <th className="p-4 text-center">FROTA (VER/AJUSTAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  
                  {/* ADMINISTRADOR */}
                  <tr className="hover:bg-surface-card/20">
                    <td className="p-4 font-bold text-fg-on-dark uppercase">Administrador / RH</td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('admin', 'readPonto')}>
                        {permissions.admin.readPonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('admin', 'writePonto')}>
                        {permissions.admin.writePonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('admin', 'readAso')}>
                        {permissions.admin.readAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('admin', 'writeAso')}>
                        {permissions.admin.writeAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('admin', 'readFrota')}>
                        {permissions.admin.readFrota ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                  </tr>

                  {/* LIDER */}
                  <tr className="hover:bg-surface-card/20">
                    <td className="p-4 font-bold text-fg-on-dark uppercase">Líder de Departamento</td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('lider', 'readPonto')}>
                        {permissions.lider.readPonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('lider', 'writePonto')}>
                        {permissions.lider.writePonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('lider', 'readAso')}>
                        {permissions.lider.readAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('lider', 'writeAso')}>
                        {permissions.lider.writeAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('lider', 'readFrota')}>
                        {permissions.lider.readFrota ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                  </tr>

                  {/* COLABORADOR */}
                  <tr className="hover:bg-surface-card/20">
                    <td className="p-4 font-bold text-fg-on-dark uppercase">Colaborador Geral</td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('colab', 'readPonto')}>
                        {permissions.colab.readPonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('colab', 'writePonto')}>
                        {permissions.colab.writePonto ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('colab', 'readAso')}>
                        {permissions.colab.readAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('colab', 'writeAso')}>
                        {permissions.colab.writeAso ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => togglePermission('colab', 'readFrota')}>
                        {permissions.colab.readFrota ? <CheckSquare className="h-4.5 w-4.5 text-primary mx-auto" /> : <Square className="h-4.5 w-4.5 text-fg3 mx-auto" />}
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  )
}
