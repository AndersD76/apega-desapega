import { Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from '@/components/layout'

// Pages
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Products from '@/pages/Products'
import Orders from '@/pages/Orders'
import Carts from '@/pages/Carts'
import Shipping from '@/pages/Shipping'
import Finance from '@/pages/Finance'
import Analytics from '@/pages/Analytics'
import Simulator from '@/pages/Simulator'
import Communications from '@/pages/Communications'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="produtos" element={<Products />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="carrinhos" element={<Carts />} />
          <Route path="envios" element={<Shipping />} />
          <Route path="financeiro" element={<Finance />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="simulador" element={<Simulator />} />
          <Route path="comunicacoes" element={<Communications />} />
          <Route path="denuncias" element={<Reports />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </TooltipProvider>
  )
}

export default App
