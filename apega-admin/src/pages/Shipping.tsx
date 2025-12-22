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
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
} from 'lucide-react'

const shipments = [
  {
    id: '1',
    orderId: '#12345',
    trackingCode: 'BR123456789',
    carrier: 'Correios',
    origin: 'Passo Fundo, RS',
    destination: 'Porto Alegre, RS',
    status: 'in_transit',
    estimatedDelivery: '2024-03-18',
    lastUpdate: '2024-03-15',
  },
  {
    id: '2',
    orderId: '#12344',
    trackingCode: 'BR987654321',
    carrier: 'Jadlog',
    origin: 'Carazinho, RS',
    destination: 'Caxias do Sul, RS',
    status: 'delivered',
    estimatedDelivery: '2024-03-14',
    lastUpdate: '2024-03-14',
  },
  {
    id: '3',
    orderId: '#12343',
    trackingCode: null,
    carrier: null,
    origin: 'Erechim, RS',
    destination: 'Passo Fundo, RS',
    status: 'pending',
    estimatedDelivery: null,
    lastUpdate: '2024-03-15',
  },
  {
    id: '4',
    orderId: '#12342',
    trackingCode: 'BR456789123',
    carrier: 'Correios',
    origin: 'Marau, RS',
    destination: 'São Paulo, SP',
    status: 'delayed',
    estimatedDelivery: '2024-03-13',
    lastUpdate: '2024-03-15',
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Aguardando Envio</Badge>
    case 'in_transit':
      return <Badge variant="info" className="gap-1"><Truck className="h-3 w-3" /> Em Trânsito</Badge>
    case 'delivered':
      return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Entregue</Badge>
    case 'delayed':
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Atrasado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function Shipping() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Envios</h1>
          <p className="text-muted-foreground">Acompanhe os envios do marketplace</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Envio</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Trânsito</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entregues Hoje</p>
              <p className="text-2xl font-bold">28</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atrasados</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="transit">Em Trânsito</TabsTrigger>
                <TabsTrigger value="delayed">Atrasados</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar código de rastreio..." className="w-64 pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Rastreio</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Previsão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.orderId}</TableCell>
                  <TableCell>{shipment.trackingCode || '-'}</TableCell>
                  <TableCell>{shipment.carrier || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {shipment.origin}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {shipment.destination}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell>
                    {shipment.estimatedDelivery ? formatDate(shipment.estimatedDelivery) : '-'}
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
