'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Ticket, 
  DollarSign, 
  TrendingUp,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Edit,
  RefreshCw,
  Building2,
  UserCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalUsers: number
  totalEvents: number
  activeEvents: number
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  rejectedOrders: number
  totalRevenue: number
  totalTickets: number
}

interface Event {
  id: string
  name: string
  description: string | null
  event_date: string
  location: string
  image_url: string | null
  status: 'active' | 'ended' | 'cancelled' | 'hidden'
  created_at: string
  created_by?: string
  total_sales?: number
  total_revenue?: number
  ticket_types_count?: number
}

const statusColors = {
  active: 'bg-green-500',
  ended: 'bg-blue-500',
  cancelled: 'bg-red-500',
  hidden: 'bg-gray-500',
}

const statusLabels = {
  active: 'Activo',
  ended: 'Finalizado',
  cancelled: 'Cancelado',
  hidden: 'Oculto',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalRevenue: 0,
    totalTickets: 0,
  })
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Cargar usuarios
      const usersRes = await fetch('/api/users')
      const users = usersRes.ok ? await usersRes.json() : []

      // Cargar eventos (admin ve todos los eventos de todas las empresas)
      const eventsRes = await fetch(`/api/events?userRole=admin`)
      const eventsData = eventsRes.ok ? await eventsRes.json() : []
      const activeEvents = eventsData.filter((e: any) => e.status === 'active')

      // Cargar stats para cada evento
      const eventsWithStats = await Promise.all(
        eventsData.map(async (event: Event) => {
          try {
            const statsRes = await fetch(`/api/events/${event.id}/stats`)
            if (statsRes.ok) {
              const eventStats = await statsRes.json()
              return { ...event, ...eventStats }
            }
          } catch (err) {
            console.error('Error loading event stats:', err)
          }
          return event
        })
      )
      setEvents(eventsWithStats)

      // Calcular totales de ventas e ingresos desde los eventos
      const totalSales = eventsWithStats.reduce((sum, e) => sum + (e.total_sales || 0), 0)
      const totalRevenue = eventsWithStats.reduce((sum, e) => sum + (e.total_revenue || 0), 0)

      // Cargar órdenes
      const ordersRes = await fetch('/api/orders')
      const orders = ordersRes.ok ? await ordersRes.json() : []
      
      const pending = orders.filter((o: any) => o.status === 'pending')
      const approved = orders.filter((o: any) => o.status === 'approved')
      const rejected = orders.filter((o: any) => o.status === 'rejected')

      // Cargar tickets
      const ticketsRes = await fetch('/api/tickets')
      const tickets = ticketsRes.ok ? await ticketsRes.json() : []

      setStats({
        totalUsers: users.length,
        totalEvents: eventsData.length,
        activeEvents: activeEvents.length,
        totalOrders: orders.length,
        pendingOrders: pending.length,
        approvedOrders: approved.length,
        rejectedOrders: rejected.length,
        totalRevenue,
        totalTickets: totalSales, // Usamos total_sales de eventos
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-gray-600 mt-1">Vista general de todos los eventos y ventas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadStats} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Link href="/dashboard/admin/events">
            <Button className="gap-2">
              <Building2 className="w-4 h-4" />
              Gestionar Eventos
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usuarios
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Eventos Activos
            </CardTitle>
            <Calendar className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              de {stats.totalEvents} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entradas Vendidas
            </CardTitle>
            <Ticket className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTickets}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.approvedOrders} órdenes aprobadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Gs. {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ventas confirmadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Órdenes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Estado de Órdenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">
                  {stats.pendingOrders}
                </p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {stats.approvedOrders}
                </p>
                <p className="text-sm text-gray-600">Aprobadas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-red-50">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {stats.rejectedOrders}
                </p>
                <p className="text-sm text-gray-600">Rechazadas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay eventos en la plataforma</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Vendidas</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.name}</div>
                      {event.ticket_types_count && (
                        <div className="text-sm text-gray-500">
                          {event.ticket_types_count} tipos de entrada
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(event.event_date).toLocaleDateString('es-PY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[event.status]}>
                        {statusLabels[event.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        {event.total_sales || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {(event.total_revenue || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/events/${event.id}`)}
                          title="Ver y editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Secciones de Gestión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gestión de Eventos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Gestión de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Crea, edita y administra eventos. Define tipos de entrada y precios.
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/admin/events" className="flex-1">
                <Button className="w-full gap-2">
                  Ver Eventos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/admin/events/new">
                <Button variant="outline">Crear Evento</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Usuarios */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Administra usuarios, roles y permisos del sistema.
            </p>
            <Link href="/dashboard/users" className="block">
              <Button className="w-full gap-2">
                Ver Usuarios
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Validación de Compras */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Validación de Compras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Revisa y aprueba comprobantes de pago de usuarios.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {stats.pendingOrders} pendientes
              </span>
              <Link href="/dashboard/validator">
                <Button variant="outline" className="gap-2">
                  Ir a Validación
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Reportes y Estadísticas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Reportes y Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Visualiza gráficos y reportes detallados de ventas.
            </p>
            <Link href="/dashboard/stats" className="block">
              <Button className="w-full gap-2">
                Ver Reportes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/admin/events/new">
              <Button variant="outline" size="sm">Crear Evento</Button>
            </Link>
            <Link href="/dashboard/validator">
              <Button variant="outline" size="sm">Validar Compras</Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">Ver Todas las Órdenes</Button>
            </Link>
            <Link href="/dashboard/generated-tickets">
              <Button variant="outline" size="sm">Tickets Generados</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={loadStats}>
              Actualizar Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
