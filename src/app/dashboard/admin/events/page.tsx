'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Calendar, MapPin, Users, DollarSign, Edit, Trash2, Eye } from 'lucide-react'

interface Event {
  id: string
  slug: string
  name: string
  description: string | null
  event_date: string
  location: string
  image_url: string | null
  status: 'active' | 'ended' | 'cancelled' | 'hidden'
  created_at: string
  created_by: string
  organizer_name?: string
  total_sales?: number
  total_revenue?: number
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

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const url = statusFilter !== 'all' 
        ? `/api/events?status=${statusFilter}`
        : '/api/events'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al cargar eventos')
      
      const data = await response.json()
      
      // Enriquecer con estadísticas
      const eventsWithStats = await Promise.all(
        data.map(async (event: Event) => {
          try {
            const statsRes = await fetch(`/api/events/${event.id}/stats`)
            if (statsRes.ok) {
              const stats = await statsRes.json()
              return { 
                ...event, 
                total_revenue: stats.approvedRevenue || 0,  // Mapear approvedRevenue a total_revenue
                total_sales: stats.ticketsSold || 0         // Mapear ticketsSold a total_sales
              }
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
      alert('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar evento')
      }

      alert('Evento eliminado exitosamente')
      loadEvents()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al eliminar evento')
    }
  }

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular estadísticas basadas en eventos FILTRADOS (no todos)
  const totalRevenue = filteredEvents.reduce((sum, event) => sum + (event.total_revenue || 0), 0)
  const totalSales = filteredEvents.reduce((sum, event) => sum + (event.total_sales || 0), 0)
  const activeEvents = filteredEvents.filter((e) => e.status === 'active').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Eventos</h1>
          <p className="text-gray-600 mt-1">Administra todos los eventos del sistema</p>
        </div>
        <Link href="/dashboard/admin/events/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Crear Evento
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Se actualizan según el filtro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={searchTerm || statusFilter !== 'all' ? 'border-2 border-blue-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {searchTerm || statusFilter !== 'all' ? 'Eventos Filtrados' : 'Total Eventos'}
            </CardTitle>
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-xs text-gray-500 mt-1">de {events.length} totales</p>
            )}
          </CardContent>
        </Card>

        <Card className={searchTerm || statusFilter !== 'all' ? 'border-2 border-blue-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Eventos Activos
            </CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEvents}</div>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-xs text-gray-500 mt-1">en selección</p>
            )}
          </CardContent>
        </Card>

        <Card className={searchTerm || statusFilter !== 'all' ? 'border-2 border-blue-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entradas Vendidas
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-xs text-gray-500 mt-1">en selección</p>
            )}
          </CardContent>
        </Card>

        <Card className={searchTerm || statusFilter !== 'all' ? 'border-2 border-blue-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos Aprobados
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Gs. {totalRevenue.toLocaleString()}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-xs text-gray-500 mt-1">en selección</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 text-base font-medium"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium text-base">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="ended">Finalizado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="hidden">Oculto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Cargando eventos...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron eventos
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
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.name}</div>
                      {event.organizer_name && (
                        <div className="text-sm text-gray-500">
                          por {event.organizer_name}
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
                      {event.total_sales || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      Gs. {(event.total_revenue || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/events/${event.slug || event.id}`)}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/events/${event.slug || event.id}`)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
