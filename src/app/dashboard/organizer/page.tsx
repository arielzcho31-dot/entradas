'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Ticket,
  RefreshCw,
} from 'lucide-react'
import { RevenueStatsCard } from '@/components/dashboard/revenue-stats-card'

interface Event {
  id: string
  name: string
  description: string | null
  event_date: string
  location: string
  image_url: string | null
  status: 'active' | 'ended' | 'cancelled' | 'hidden'
  created_at: string
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

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  if (!user || user.role !== 'organizer') {
    redirect('/dashboard')
  }

  useEffect(() => {
    loadMyEvents()
  }, [user])

  const loadMyEvents = async () => {
    try {
      setLoading(true)
      // Cargar eventos creados por este organizador O donde está asignado
      // Pasamos userId y userRole para que el API filtre por empresa
      const [createdResponse, assignedResponse] = await Promise.all([
        fetch(`/api/events?createdBy=${user?.id}&userId=${user?.id}&userRole=${user?.role}`),
        fetch(`/api/events?userId=${user?.id}&userRole=${user?.role}`)
      ]);

      if (!createdResponse.ok) throw new Error('Error al cargar eventos')

      const createdData = await createdResponse.json()
      const allEvents = assignedResponse.ok ? await assignedResponse.json() : []
      
      // Filtrar eventos donde está asignado como organizador
      const assignedEvents = await Promise.all(
        allEvents.map(async (event: any) => {
          try {
            const orgRes = await fetch(`/api/events/${event.id}/organizers`)
            if (orgRes.ok) {
              const organizers = await orgRes.json()
              if (organizers.some((org: any) => org.user_id === user?.id)) {
                return event
              }
            }
          } catch (err) {
            console.error('Error checking organizer:', err)
          }
          return null
        })
      )

      // Combinar eventos creados y asignados (sin duplicados)
      const allMyEvents = [
        ...createdData,
        ...assignedEvents.filter((e: any) => e && !createdData.find((c: any) => c.id === e.id))
      ]
      const data = allMyEvents

      // Cargar stats para cada evento
      const eventsWithStats = await Promise.all(
        data.map(async (event: Event) => {
          try {
            const statsRes = await fetch(`/api/events/${event.id}/stats`)
            if (statsRes.ok) {
              const stats = await statsRes.json()
              return { ...event, ...stats }
            }
          } catch (err) {
            console.error('Error loading stats:', err)
          }
          return event
        })
      )

      setEvents(eventsWithStats)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar tus eventos')
    } finally {
      setLoading(false)
    }
  }

  const totalSales = events.reduce((sum, e) => sum + (e.total_sales || 0), 0)
  const totalRevenue = events.reduce((sum, e) => sum + (e.total_revenue || 0), 0)
  const activeEvents = events.filter((e) => e.status === 'active').length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Cargando tus eventos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Eventos</h1>
          <p className="text-gray-600 mt-1">Gestiona tus eventos y ventas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMyEvents} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Link href="/dashboard/organizer/events/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Crear Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas de Ingresos con Auto-Refresh */}
      <RevenueStatsCard 
        userId={user?.id} 
        eventId="all" 
        autoRefresh={true}
        refreshInterval={30000}
      />

      {/* Eventos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tus Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aún no has creado ningún evento</p>
              <Link href="/dashboard/organizer/events/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Mi Primer Evento
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow 
                    key={event.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => router.push(`/dashboard/organizer/events/${event.id}`)}
                  >
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Ver Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Analiza tus ventas y rendimiento
            </p>
            <Link href="/dashboard/stats">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ver Reportes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Mis Compradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Lista de personas que compraron
            </p>
            <Link href="/dashboard/organizer/orders">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ver Órdenes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-green-600" />
              Escanear Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Validar tickets en el evento
            </p>
            <Link href="/dashboard/scan">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ir a Scanner</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
