import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Receipt,
  Download,
  RefreshCcw,
  Clock,
  CheckCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Mock data
const revenueData = [
  { name: 'Jan', receita: 45000, comissao: 5400, custos: 2100 },
  { name: 'Fev', receita: 52000, comissao: 6240, custos: 2300 },
  { name: 'Mar', receita: 48000, comissao: 5760, custos: 2200 },
  { name: 'Abr', receita: 61000, comissao: 7320, custos: 2500 },
  { name: 'Mai', receita: 55000, comissao: 6600, custos: 2400 },
  { name: 'Jun', receita: 67000, comissao: 8040, custos: 2700 },
]

const paymentMethodData = [
  { name: 'PIX', value: 65, amount: 83750, color: '#22c55e' },
  { name: 'Cartão', value: 30, amount: 38654, color: '#3b82f6' },
  { name: 'Boleto', value: 5, amount: 6442, color: '#f59e0b' },
]

const withdrawals = [
  { id: '1', user: 'Maria Silva', amount: 450.90, status: 'pending', date: '2024-03-15' },
  { id: '2', user: 'Ana Costa', amount: 890.00, status: 'completed', date: '2024-03-14' },
  { id: '3', user: 'Julia Santos', amount: 1250.50, status: 'completed', date: '2024-03-13' },
  { id: '4', user: 'Carla Oliveira', amount: 320.00, status: 'pending', date: '2024-03-15' },
]

const transactions = [
  { id: '1', type: 'commission', description: 'Comissão #12345', amount: 10.79, date: '2024-03-15' },
  { id: '2', type: 'payment_fee', description: 'Taxa PIX', amount: -1.14, date: '2024-03-15' },
  { id: '3', type: 'commission', description: 'Comissão #12344', amount: 5.40, date: '2024-03-14' },
  { id: '4', type: 'withdrawal', description: 'Saque Maria Silva', amount: -450.90, date: '2024-03-14' },
  { id: '5', type: 'subscription', description: 'Assinatura Premium', amount: 29.90, date: '2024-03-14' },
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  description?: string
}

function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Finance() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão financeira do marketplace
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Receita Total (Mês)"
          value={formatCurrency(128750.90)}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Comissões Geradas"
          value={formatCurrency(15450.10)}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Saques Pendentes"
          value={formatCurrency(4580.00)}
          icon={<RefreshCcw className="h-6 w-6" />}
          description="12 solicitações"
        />
        <StatCard
          title="Saldo a Liberar"
          value={formatCurrency(28900.50)}
          icon={<Clock className="h-6 w-6" />}
          description="Aguardando entrega"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Receita vs Comissões vs Custos</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    name="Receita"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="comissao"
                    name="Comissão"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="custos"
                    name="Custos"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>Distribuição este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethodData.map((method) => (
                <div key={method.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: method.color }} />
                    <span>{method.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(method.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Withdrawals and Transactions */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="withdrawals">
            <TabsList>
              <TabsTrigger value="withdrawals">Saques Pendentes</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="withdrawals">
            <TabsContent value="withdrawals">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.user}</TableCell>
                      <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' ? (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="h-3 w-3" /> Pendente
                          </Badge>
                        ) : (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" /> Concluído
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(withdrawal.date)}</TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            Aprovar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="transactions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type}</Badge>
                      </TableCell>
                      <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                      </TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
