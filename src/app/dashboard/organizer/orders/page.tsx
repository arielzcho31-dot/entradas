'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Calendar, Check, X, Loader2, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { RevenueStatsCard } from '@/components/dashboard/revenue-stats-card'

interface Order {
  id: string
  user_id: string
  user_name: string
  user_email: string
  event_id: string
  event_name: string
  ticket_type_id: string
  ticket_name: string
  quantity: number
  total_price: number
  status: 'pending' | 'approved' | 'rejected'
  receipt_url: string | null
  created_at: string
}

interface Event {
  id: string
  name: string
}

export default function OrganizerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([])
  const [rejectedOrders, setRejectedOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'organizer') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Cargar eventos del organizador primero
      const eventsRes = await fetch(`/api/events?userRole=${user.role}&userId=${user.id}`)
      if (!eventsRes.ok) throw new Error('Error cargando eventos')
      const eventsData = await eventsRes.json()
      setEvents(eventsData)

      console.log('Eventos del organizador:', eventsData)

      // Obtener IDs de los eventos
      const eventsIds = eventsData.map((e: any) => e.id)
      
      console.log('Event IDs:', eventsIds)

      if (eventsIds.length === 0) {
        console.log('No hay eventos asignados al organizador')
        setPendingOrders([])
        setApprovedOrders([])
        setRejectedOrders([])
        setLoading(false)
        return
      }

      // Cargar todas las órdenes
      const ordersRes = await fetch('/api/orders')
      if (!ordersRes.ok) throw new Error('Error cargando órdenes')
      const ordersData = await ordersRes.json()

      console.log('Todas las órdenes:', ordersData)

      // Filtrar solo órdenes de los eventos del organizador
      const myOrders = ordersData.filter((o: Order) => eventsIds.includes(o.event_id))

      console.log('Órdenes filtradas del organizador:', myOrders)

      setPendingOrders(myOrders.filter((o: Order) => o.status === 'pending'))
      setApprovedOrders(myOrders.filter((o: Order) => o.status === 'approved'))
      setRejectedOrders(myOrders.filter((o: Order) => o.status === 'rejected'))
    } catch (error) {
      console.error('Error en loadData:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las órdenes.",
      })
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (order: Order, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(order.id)
    try {
      // Si se aprueba, crear tickets PRIMERO
      if (newStatus === 'approved') {
        const ticketsResponse = await fetch(`/api/orders/${order.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: order.quantity,
          }),
        })

        if (!ticketsResponse.ok) {
          const errorData = await ticketsResponse.json()
          throw new Error(errorData.error || 'Error creando tickets')
        }

        const ticketsData = await ticketsResponse.json()
        console.log('Tickets creados:', ticketsData)
      }

      // Luego actualizar el estado
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error actualizando estado')
      }

      toast({
        title: "Estado actualizado",
        description: `La orden ha sido ${newStatus === 'approved' ? 'aprobada y tickets generados' : 'rechazada'}.`,
      })

      await loadData()
    } catch (error: any) {
      console.error('Error en handleUpdateStatus:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el estado de la orden.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filterOrdersByEvent = (orders: Order[]) => {
    if (selectedEvent === 'all') return orders
    return orders.filter(o => o.event_id === selectedEvent)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizer">
            <Button variant="outline" size="icon" className="border-green-600 text-green-600 hover:bg-green-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
            <p className="text-gray-600">Aprobar o rechazar órdenes de compra</p>
          </div>
        </div>
        <Button onClick={loadData} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas de Ingresos con Auto-Refresh */}
      <RevenueStatsCard 
        userId={user?.id} 
        eventId={selectedEvent}
        autoRefresh={true}
        refreshInterval={30000}
      />

      {/* Filtro por evento */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Filtrar por evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los eventos</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de órdenes */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Pendientes ({filterOrdersByEvent(pendingOrders).length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Aprobadas ({filterOrdersByEvent(approvedOrders).length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Rechazadas ({filterOrdersByEvent(rejectedOrders).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <OrdersList 
            orders={filterOrdersByEvent(pendingOrders)} 
            showActions={true}
            onUpdateStatus={handleUpdateStatus}
            updatingId={updatingId}
          />
        </TabsContent>

        <TabsContent value="approved">
          <OrdersList 
            orders={filterOrdersByEvent(approvedOrders)} 
            showActions={false}
            onUpdateStatus={handleUpdateStatus}
            updatingId={updatingId}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <OrdersList 
            orders={filterOrdersByEvent(rejectedOrders)} 
            showActions={false}
            onUpdateStatus={handleUpdateStatus}
            updatingId={updatingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrdersList({ 
  orders, 
  showActions, 
  onUpdateStatus, 
  updatingId 
}: { 
  orders: Order[]
  showActions: boolean
  onUpdateStatus: (order: Order, status: 'approved' | 'rejected') => void
  updatingId: string | null
}) {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay órdenes en esta categoría
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {order.user_name || 'Usuario sin nombre'}
                    </h3>
                    <Badge variant={
                      order.status === 'approved' ? 'default' :
                      order.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {order.status === 'approved' ? 'Aprobada' :
                       order.status === 'rejected' ? 'Rechazada' :
                       'Pendiente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{order.user_email}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Evento:</span> {order.event_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Entrada:</span> {order.ticket_name || 'General'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Cantidad:</span> {order.quantity}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> Gs. {order.total_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(order.created_at).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  {order.receipt_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                          Ver Comprobante
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogTitle>Comprobante de Pago</DialogTitle>
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={order.receipt_url}
                            alt="Comprobante"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {showActions && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onUpdateStatus(order, 'approved')}
                        disabled={updatingId === order.id}
                        className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onUpdateStatus(order, 'rejected')}
                        disabled={updatingId === order.id}
                        className="gap-1"
                      >
                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
