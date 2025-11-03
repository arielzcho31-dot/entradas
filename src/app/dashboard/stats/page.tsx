'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, TrendingUp, ArrowLeft, Ticket } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  event_date: string
  location: string
  status: string
  image_url?: string
  min_price?: number
  is_informative?: boolean
}

interface EventStats {
  total_sales: number
  total_revenue: number
}

export default function StatsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  
  // Calculated stats
  const [totalSales, setTotalSales] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [activeEvents, setActiveEvents] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'organizer' && user.role !== 'admin') {
      if (user.role === 'user') {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
      return
    }
    loadMyEvents()
  }, [user])

  const loadMyEvents = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/events?userRole=${user.role}&userId=${user.id}`)
      if (!res.ok) throw new Error('Error cargando eventos')
      
      const data = await res.json()
      setEvents(data)
      
      // Calculate stats
      let sales = 0
      let revenue = 0
      let active = 0
      
      for (const event of data) {
        if (event.status === 'active') active++
        
        // Fetch individual event stats
        const statsRes = await fetch(`/api/events/${event.id}/stats`)
        if (statsRes.ok) {
          const stats: EventStats = await statsRes.json()
          sales += stats.total_sales || 0
          revenue += stats.total_revenue || 0
        }
      }
      
      setTotalSales(sales)
      setTotalRevenue(revenue)
      setActiveEvents(active)
    } catch (error) {
      console.error('Error cargando eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY').format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/organizer'}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
            <p className="text-gray-600">
              {user?.role === 'admin' ? 'Análisis global de todos los eventos' : 'Análisis de tus eventos y ventas'}
            </p>
          </div>
        </div>
        <Button onClick={loadMyEvents} className="bg-green-600 hover:bg-green-700 text-white">
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mis Eventos
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de eventos creados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Activos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              Eventos actualmente en venta
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas Vendidas
            </CardTitle>
            <Ticket className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Total de tickets generados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Gs. {formatPrice(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos de todos los eventos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Evento</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No has creado eventos aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Evento</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-right p-4 font-medium">Ventas</th>
                    <th className="text-right p-4 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <EventStatsRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EventStatsRow({ event }: { event: Event }) {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [event.id])

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/events/${event.id}/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error cargando stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      ended: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      hidden: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    const labels = {
      active: 'Activo',
      ended: 'Finalizado',
      cancelled: 'Cancelado',
      hidden: 'Oculto'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="p-4">
        <div className="font-medium">{event.name}</div>
        <div className="text-sm text-gray-500">{event.location}</div>
      </td>
      <td className="p-4 text-sm">{formatDate(event.event_date)}</td>
      <td className="p-4">{getStatusBadge(event.status)}</td>
      <td className="p-4 text-right">
        {loading ? (
          <span className="text-gray-400">...</span>
        ) : (
          <span className="font-medium">{stats?.total_sales || 0}</span>
        )}
      </td>
      <td className="p-4 text-right">
        {loading ? (
          <span className="text-gray-400">...</span>
        ) : (
          <span className="font-medium">Gs. {formatPrice(stats?.total_revenue || 0)}</span>
        )}
      </td>
    </tr>
  )
}
