'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useParams, useRouter, redirect } from 'next/navigation'
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
import { ArrowLeft, Save, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  description: string | null
  event_date: string
  location: string
  image_url: string | null
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
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
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

const statusLabels = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

export default function EventDetailPageOrganizer() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  if (!user || user.role !== 'organizer') {
    redirect('/dashboard')
  }
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Música' as string,
    event_date: '',
    location: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    image: null as File | null,
  })

  const categories = ['Música', 'Deportes', 'Arte', 'Tecnología', 'Comida']

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
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) throw new Error('Error al cargar evento')
      
      const data = await response.json()

      // Verificar que sea el creador
      if (data.created_by !== user?.id) {
        alert('No tienes permiso para editar este evento')
        router.push('/dashboard/organizer')
        return
      }

      setEvent(data)
      
      setFormData({
        name: data.name,
        description: data.description || '',
        category: data.category || 'Música',
        event_date: new Date(data.event_date).toISOString().slice(0, 16),
        location: data.location,
        status: data.status,
        image: null,
      })
      
      if (data.image_url) {
        setImagePreview(data.image_url)
      }

      // Cargar tipos de entrada usando el ID real del evento
      loadTicketTypes(data.id)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar evento')
      router.push('/dashboard/organizer')
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

      if (formData.image) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.image)
        imageFormData.append('userId', user!.id)

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
      }

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
      alert('Error: evento no cargado')
      return
    }

    try {
      const ticketTypeData = {
        event_id: event.id,
        name: ticketTypeForm.name,
        description: ticketTypeForm.description || null,
        price: parseFloat(ticketTypeForm.price),
        quantity_available: ticketTypeForm.quantity_available 
          ? parseInt(ticketTypeForm.quantity_available) 
          : null,
      }

      if (editingTicketType) {
        const response = await fetch(`/api/ticket-types/${editingTicketType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketTypeData),
        })

        if (!response.ok) throw new Error('Error al actualizar tipo de entrada')
        alert('Tipo de entrada actualizado')
      } else {
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
      if (event?.id) loadTicketTypes(event.id)
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

  if (loading) {
    return <div className="container mx-auto p-6">Cargando...</div>
  }

  if (!event) {
    return <div className="container mx-auto p-6">Evento no encontrado</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <Link href="/dashboard/organizer">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Eventos
        </Button>
      </Link>

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
                loadEvent()
              }} 
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar Edición
            </Button>
          )}
        </div>
      </div>

      {/* Form similar al de admin */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Evento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditMode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Fecha y Hora *</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  disabled={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  disabled={!isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="image">Cambiar Imagen</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {imagePreview && (
              <div className="space-y-2">
                <Label>Imagen del Evento</Label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
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

      {/* Ticket Types - Same as admin */}
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
                  <Label>Nombre *</Label>
                  <Input
                    placeholder="Ej: General, VIP, Estudiante"
                    value={ticketTypeForm.name}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Descripción opcional"
                    rows={2}
                    value={ticketTypeForm.description}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio (Gs.) *</Label>
                  <Input
                    type="number"
                    placeholder="35000"
                    value={ticketTypeForm.price}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad Disponible</Label>
                  <Input
                    type="number"
                    placeholder="Dejar vacío para ilimitado"
                    value={ticketTypeForm.quantity_available}
                    onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, quantity_available: e.target.value })}
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
    </div>
  )
}
