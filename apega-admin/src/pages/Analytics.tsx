import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Eye,
  Heart,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const userGrowthData = [
  { month: 'Jan', novos: 245, ativos: 1850, churned: 45 },
  { month: 'Fev', novos: 312, ativos: 2100, churned: 62 },
  { month: 'Mar', novos: 289, ativos: 2320, churned: 48 },
  { month: 'Abr', novos: 378, ativos: 2650, churned: 55 },
  { month: 'Mai', novos: 412, ativos: 2980, churned: 72 },
  { month: 'Jun', novos: 445, ativos: 3350, churned: 65 },
]

const conversionData = [
  { stage: 'Visitantes', value: 10000 },
  { stage: 'Visualizaram Produto', value: 4500 },
  { stage: 'Adicionaram ao Carrinho', value: 1200 },
  { stage: 'Iniciaram Checkout', value: 450 },
  { stage: 'Compraram', value: 320 },
]

const categoryPerformance = [
  { category: 'Vestidos', vendas: 450, receita: 40500, crescimento: 12 },
  { category: 'Blusas', vendas: 380, receita: 19000, crescimento: 8 },
  { category: 'Calças', vendas: 290, receita: 34800, crescimento: -3 },
  { category: 'Sapatos', vendas: 220, receita: 33000, crescimento: 15 },
  { category: 'Acessórios', vendas: 180, receita: 10800, crescimento: 22 },
]

const cohortData = [
  { cohort: 'Jan 24', m1: 100, m2: 68, m3: 52, m4: 45, m5: 42, m6: 40 },
  { cohort: 'Fev 24', m1: 100, m2: 72, m3: 58, m4: 48, m5: 44, m6: null },
  { cohort: 'Mar 24', m1: 100, m2: 75, m3: 62, m4: 52, m5: null, m6: null },
  { cohort: 'Abr 24', m1: 100, m2: 70, m3: 55, m4: null, m5: null, m6: null },
  { cohort: 'Mai 24', m1: 100, m2: 74, m3: null, m4: null, m5: null, m6: null },
  { cohort: 'Jun 24', m1: 100, m2: null, m3: null, m4: null, m5: null, m6: null },
]

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Métricas avançadas e análise de dados</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Taxa de Conversão" value="3.2%" change={0.4} icon={<TrendingUp className="h-6 w-6" />} />
        <MetricCard title="LTV Médio" value={formatCurrency(285.50)} change={8.2} icon={<Users className="h-6 w-6" />} />
        <MetricCard title="Taxa de Recompra" value="28%" change={5.1} icon={<RefreshCcw className="h-6 w-6" />} />
        <MetricCard title="Churn Rate" value="2.1%" change={-0.8} icon={<Users className="h-6 w-6" />} />
      </div>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="cohort">Coorte</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>Novos usuários, ativos e churn por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="ativos" name="Ativos" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="novos" name="Novos" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="churned" name="Churn" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <CardDescription>Jornada do usuário até a compra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={150} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Coorte</CardTitle>
              <CardDescription>Retenção por mês de aquisição (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Coorte</th>
                      <th className="p-2 text-center">Mês 1</th>
                      <th className="p-2 text-center">Mês 2</th>
                      <th className="p-2 text-center">Mês 3</th>
                      <th className="p-2 text-center">Mês 4</th>
                      <th className="p-2 text-center">Mês 5</th>
                      <th className="p-2 text-center">Mês 6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row) => (
                      <tr key={row.cohort}>
                        <td className="p-2 font-medium">{row.cohort}</td>
                        {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((val, i) => (
                          <td key={i} className="p-2 text-center">
                            {val !== null ? (
                              <span
                                className="inline-block rounded px-2 py-1 text-xs"
                                style={{
                                  backgroundColor: `rgba(236, 72, 153, ${val / 100})`,
                                  color: val > 50 ? 'white' : 'inherit',
                                }}
                              >
                                {val}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
              <CardDescription>Vendas e receita por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{cat.category}</p>
                      <p className="text-sm text-muted-foreground">{cat.vendas} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(cat.receita)}</p>
                      <p className={`text-sm ${cat.crescimento >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {cat.crescimento >= 0 ? '+' : ''}{cat.crescimento}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
