'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, Calendar, MapPin, Save, Plus, Edit, Trash2, DollarSign, Users, UserPlus, X, Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

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
  is_informative?: boolean
}

interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  quantity_available: number | null
  created_at: string
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

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [organizers, setOrganizers] = useState<any[]>([])
  const [availableOrganizers, setAvailableOrganizers] = useState<any[]>([])
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Música' as string,
    event_date: '',
    location: '',
    status: 'active' as 'active' | 'ended' | 'cancelled' | 'hidden',
    image: null as File | null,
    is_informative: false,
  })

  const categories = ['Música', 'Deportes', 'Arte', 'Tecnología', 'Comida', 'Otros']

  // Form para nuevo tipo de entrada
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false)
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null)
  const [ticketTypeForm, setTicketTypeForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity_available: '',
  })

  useEffect(() => {
    if (eventId) {
      loadEvent()
      loadOrganizers()
      loadAvailableOrganizers()
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) throw new Error('Error al cargar evento')
      
      const data = await response.json()
      setEvent(data)
      
      // Pre-llenar formulario (mantener hora local, no convertir a UTC)
      const eventDate = new Date(data.event_date);
      const localDateString = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        name: data.name,
        description: data.description || '',
        category: data.category || 'Música',
        event_date: localDateString,
        location: data.location,
        status: data.status,
        image: null,
        is_informative: data.is_informative || false,
      })
      
      if (data.image_url) {
        setImagePreview(data.image_url)
      }

      // Cargar tipos de entrada usando el ID real del evento
      loadTicketTypes(data.id)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar evento')
    } finally {
      setLoading(false)
    }
  }

  const loadTicketTypes = async (realEventId: string) => {
    try {
      const response = await fetch(`/api/ticket-types?eventId=${realEventId}`)
      if (!response.ok) throw new Error('Error al cargar tipos de entrada')
      
      const data = await response.json()
      setTicketTypes(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      let imageUrl = event?.image_url || null

      // Subir nueva imagen si existe
      if (formData.image) {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          alert('No se encontró sesión de usuario')
          return
        }
        const user = JSON.parse(userStr)

        const imageFormData = new FormData()
        imageFormData.append('image', formData.image)
        imageFormData.append('userId', user.id)

        const uploadRes = await fetch('/api/upload-event-image', {
          method: 'POST',
          body: imageFormData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.imageUrl
        }
      }

      const eventData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        event_date: new Date(formData.event_date).toISOString(),
        location: formData.location,
        image_url: imageUrl,
        status: formData.status,
        is_informative: formData.is_informative,
      }

      // Usar el ID real del evento, no el slug del URL
      const actualEventId = event?.id || eventId
      
      const response = await fetch(`/api/events/${actualEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar evento')
      }

      alert('Evento actualizado exitosamente')
      loadEvent()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar evento')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTicketType = async () => {
    if (!ticketTypeForm.name || !ticketTypeForm.price) {
      alert('Por favor completa el nombre y precio')
      return
    }

    if (!event?.id) {
      alert('Error: No se ha cargado el evento')
      return
    }

    try {
      const ticketTypeData = {
        event_id: event.id, // Usar el ID real del evento
        name: ticketTypeForm.name,
        description: ticketTypeForm.description || null,
        price: parseFloat(ticketTypeForm.price),
        quantity_available: ticketTypeForm.quantity_available 
          ? parseInt(ticketTypeForm.quantity_available) 
          : null,
      }

      if (editingTicketType) {
        // Actualizar
        const response = await fetch(`/api/ticket-types/${editingTicketType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketTypeData),
        })

        if (!response.ok) throw new Error('Error al actualizar tipo de entrada')
        alert('Tipo de entrada actualizado')
      } else {
        // Crear
        const response = await fetch('/api/ticket-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketTypeData),
        })

        if (!response.ok) throw new Error('Error al crear tipo de entrada')
        alert('Tipo de entrada creado')
      }

      setShowTicketTypeDialog(false)
      setEditingTicketType(null)
      setTicketTypeForm({ name: '', description: '', price: '', quantity_available: '' })
      loadTicketTypes(event.id)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  const handleEditTicketType = (ticketType: TicketType) => {
    setEditingTicketType(ticketType)
    setTicketTypeForm({
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price.toString(),
      quantity_available: ticketType.quantity_available?.toString() || '',
    })
    setShowTicketTypeDialog(true)
  }

  const handleDeleteTicketType = async (id: string) => {
    if (!confirm('¿Eliminar este tipo de entrada?')) return

    try {
      const response = await fetch(`/api/ticket-types/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')
      
      alert('Tipo de entrada eliminado')
      if (event?.id) loadTicketTypes(event.id)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  const loadOrganizers = async () => {
    if (!event?.id) return
    try {
      const res = await fetch(`/api/events/${event.id}/organizers`)
      if (res.ok) {
        const data = await res.json()
        setOrganizers(data)
      }
    } catch (error) {
      console.error('Error loading organizers:', error)
    }
  }

  const loadAvailableOrganizers = async () => {
    try {
      const res = await fetch('/api/users?role=organizer')
      if (res.ok) {
        const data = await res.json()
        setAvailableOrganizers(data)
      }
    } catch (error) {
      console.error('Error loading available organizers:', error)
    }
  }

  const handleAssignOrganizer = async () => {
    if (!selectedOrganizer || !event?.id) return

    try {
      const res = await fetch(`/api/events/${event.id}/organizers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedOrganizer }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al asignar organizador')
      }

      alert('Organizador asignado correctamente')
      setSelectedOrganizer('')
      loadOrganizers()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  const handleRemoveOrganizer = async (userId: string) => {
    if (!confirm('¿Eliminar este organizador del evento?')) return
    if (!event?.id) return

    try {
      const res = await fetch(`/api/events/${event.id}/organizers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar organizador')
      }

      alert('Organizador eliminado correctamente')
      loadOrganizers()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Cargando...</div>
  }

  if (!event) {
    return <div className="container mx-auto p-6">Evento no encontrado</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <Link href="/dashboard/admin/events">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Eventos
        </Button>
      </Link>

      {/* Header con estado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Editando información del evento' : 'Visualizando información del evento'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[event.status]}>
            {statusLabels[event.status]}
          </Badge>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Editar Evento
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditMode(false)
                loadEvent() // Recargar datos originales
              }} 
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar Edición
            </Button>
          )}
        </div>
      </div>

      {/* Formulario de edición */}
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Nombre del Evento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!isEditMode}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  disabled={!isEditMode}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditMode}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-gray-700 dark:text-gray-300">Fecha y Hora *</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  disabled={!isEditMode}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="ended">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="hidden">Oculto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox
                id="is_informative"
                checked={formData.is_informative}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_informative: checked as boolean })
                }
                disabled={!isEditMode}
              />
              <div className="flex-1">
                <Label
                  htmlFor="is_informative"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Evento Informativo
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  El evento se mostrará sin botón de compra. Ideal para eventos gratuitos o solo informativos.
                </p>
              </div>
            </div>

            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Cambiar Imagen</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}

            {imagePreview && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Imagen del Evento</Label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            {isEditMode && (
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Tipos de Entrada */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tipos de Entrada</CardTitle>
          <Dialog open={showTicketTypeDialog} onOpenChange={setShowTicketTypeDialog}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2" 
                onClick={() => {
                  setEditingTicketType(null)
                  setTicketTypeForm({ name: '', description: '', price: '', quantity_available: '' })
                }}
              >
                <Plus className="w-4 h-4" />
                Agregar Tipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTicketType ? 'Editar' : 'Nuevo'} Tipo de Entrada
                </DialogTitle>
                <DialogDescription>
                  Define el tipo de entrada, precio y cantidad disponible
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Nombre *</Label>
                  <Input
                    placeholder="Ej: General, VIP, Estudiante"
                    value={ticketTypeForm.name}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
                  <Textarea
                    placeholder="Descripción opcional"
                    rows={2}
                    value={ticketTypeForm.description}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, description: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Precio (Gs.) *</Label>
                  <Input
                    type="number"
                    placeholder="35000"
                    value={ticketTypeForm.price}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, price: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Cantidad Disponible</Label>
                  <Input
                    type="number"
                    placeholder="Dejar vacío para ilimitado"
                    value={ticketTypeForm.quantity_available}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, quantity_available: e.target.value })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Button onClick={handleSaveTicketType} className="w-full">
                  {editingTicketType ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay tipos de entrada. Agrega al menos uno.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Disponibles</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((tt) => (
                  <TableRow key={tt.id}>
                    <TableCell className="font-medium">{tt.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {tt.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      Gs. {tt.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {tt.quantity_available !== null ? tt.quantity_available : '∞'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTicketType(tt)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTicketType(tt.id)}
                          className="text-red-600"
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

      {/* Organizadores del Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Organizadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
              <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Selecciona un organizador" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {availableOrganizers.map((org) => (
                  <SelectItem
                    key={org.id}
                    value={org.id}
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {org.display_name || org.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignOrganizer} disabled={!selectedOrganizer}>
              <Plus className="w-4 h-4 mr-2" />
              Asignar
            </Button>
          </div>

          {organizers.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay organizadores asignados</p>
          ) : (
            <div className="space-y-2">
              {organizers.map((org) => (
                <div
                  key={org.user_id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {org.display_name || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500">{org.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOrganizer(org.user_id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
