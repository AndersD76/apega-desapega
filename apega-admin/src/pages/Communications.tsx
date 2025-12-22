import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import {
  Mail,
  Bell,
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react'

const campaigns = [
  { id: '1', name: 'Recuperação de Carrinho', type: 'email', sent: 342, opened: 156, clicked: 48, status: 'active' },
  { id: '2', name: 'Promoção Verão', type: 'push', sent: 1500, opened: 890, clicked: 234, status: 'completed' },
  { id: '3', name: 'Boas-vindas', type: 'email', sent: 127, opened: 98, clicked: 45, status: 'active' },
  { id: '4', name: 'Reativação', type: 'email', sent: 580, opened: 145, clicked: 32, status: 'scheduled' },
]

const notifications = [
  { id: '1', title: 'Nova venda realizada', type: 'sale', recipients: 1, sentAt: '2024-03-15T14:30:00' },
  { id: '2', title: 'Produto enviado', type: 'shipping', recipients: 1, sentAt: '2024-03-15T12:00:00' },
  { id: '3', title: 'Pagamento confirmado', type: 'payment', recipients: 1, sentAt: '2024-03-15T10:45:00' },
]

export default function Communications() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicações</h1>
          <p className="text-muted-foreground">Gerencie campanhas e notificações</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mails Enviados</p>
              <p className="text-2xl font-bold">12.5k</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Push Enviados</p>
              <p className="text-2xl font-bold">8.2k</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
              <p className="text-2xl font-bold">45.6%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Clique</p>
              <p className="text-2xl font-bold">12.3%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Campanhas de e-mail e push notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Enviados</TableHead>
                <TableHead>Abertos</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.type === 'email' ? <Mail className="mr-1 h-3 w-3" /> : <Bell className="mr-1 h-3 w-3" />}
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.sent}</TableCell>
                  <TableCell>{campaign.opened} ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)</TableCell>
                  <TableCell>{campaign.clicked} ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)</TableCell>
                  <TableCell>
                    {campaign.status === 'active' && <Badge variant="success">Ativa</Badge>}
                    {campaign.status === 'completed' && <Badge variant="secondary">Concluída</Badge>}
                    {campaign.status === 'scheduled' && <Badge variant="warning">Agendada</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
