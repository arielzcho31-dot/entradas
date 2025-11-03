'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Calendar, MapPin, Image as ImageIcon, Save, Info, Plus, Trash2, Ticket } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

interface TicketType {
  name: string
  description: string
  price: number
  quantity: number
  is_free: boolean
}

export default function NewEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Música' as string,
    event_date: '',
    location: '',
    status: 'active' as 'active' | 'ended' | 'cancelled',
    image: null as File | null,
    is_informative: false,
  })

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: 'General', description: '', price: 0, quantity: 100, is_free: false }
  ])

  const categories = ['Música', 'Deportes', 'Arte', 'Tecnología', 'Comida', 'Otros']

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { 
      name: '', 
      description: '', 
      price: 0, 
      quantity: 0, 
      is_free: false 
    }])
  }

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }
  }

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      
      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.event_date || !formData.location) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      setLoading(true)

      // Verificar que el usuario esté autenticado
      if (!user?.id) {
        alert('No se encontró sesión de usuario')
        router.push('/login')
        return
      }

      let imageUrl = null

      // Subir imagen si existe
      if (formData.image) {
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
        } else {
          console.error('Error al subir imagen')
        }
      }

      // Crear evento
      const eventData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        event_date: new Date(formData.event_date).toISOString(),
        location: formData.location,
        image_url: imageUrl,
        status: formData.status,
        created_by: user.id,
        is_informative: formData.is_informative,
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear evento')
      }

      const newEvent = await response.json()

      // Crear tipos de entrada si hay alguno válido
      const validTicketTypes = ticketTypes.filter(tt => tt.name.trim() && tt.quantity > 0)
      if (validTicketTypes.length > 0) {
        for (const ticketType of validTicketTypes) {
          try {
            const ticketRes = await fetch('/api/ticket-types', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_id: newEvent.id,
                name: ticketType.name,
                description: ticketType.description || null,
                price: ticketType.price,
                quantity_available: ticketType.quantity,
              }),
            })
            if (!ticketRes.ok) {
              console.error('Error creando tipo de entrada:', await ticketRes.json())
            }
          } catch (error) {
            console.error('Error creando tipo de entrada:', error)
          }
        }
      }

      alert('Evento creado exitosamente')
      router.push(`/dashboard/admin/events/${newEvent.slug || newEvent.id}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al crear evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Link href="/dashboard/admin/events">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Eventos
        </Button>
      </Link>

      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Crear Nuevo Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                Nombre del Evento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: UNIDAFEST 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el evento..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="event_date" className="text-gray-700 dark:text-gray-300">
                Fecha y Hora <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="event_date"
                  type="datetime-local"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="location"
                  placeholder="Ej: Auditorio Central"
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="ended">Finalizado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Los eventos "Activos" serán visibles para los usuarios
              </p>
            </div>

            {/* Evento Informativo */}
            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox
                id="is_informative"
                checked={formData.is_informative}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_informative: checked as boolean })
                }
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

            {/* Tipos de Entrada */}
            {!formData.is_informative && (
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-green-600" />
                    <Label className="text-lg font-semibold">Tipos de Entrada</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketType}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Tipo
                  </Button>
                </div>

                <div className="space-y-4">
                  {ticketTypes.map((ticketType, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Tipo de Entrada #{index + 1}</h4>
                          {ticketTypes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTicketType(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Nombre *</Label>
                            <Input
                              placeholder="Ej: VIP, General"
                              value={ticketType.name}
                              onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>Cantidad *</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="100"
                              value={ticketType.quantity}
                              onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label>Descripción</Label>
                          <Textarea
                            placeholder="Descripción del tipo de entrada..."
                            rows={2}
                            value={ticketType.description}
                            onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                          <div className="space-y-1">
                            <Label>Precio (Gs.)</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="50000"
                              value={ticketType.price}
                              onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                              disabled={ticketType.is_free}
                            />
                          </div>

                          <div className="flex items-center space-x-2 pb-2">
                            <Checkbox
                              id={`is_free_${index}`}
                              checked={ticketType.is_free}
                              onCheckedChange={(checked) => {
                                updateTicketType(index, 'is_free', checked)
                                if (checked) updateTicketType(index, 'price', 0)
                              }}
                            />
                            <Label htmlFor={`is_free_${index}`} className="cursor-pointer">
                              Entrada Gratuita
                            </Label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  * Los tipos de entrada serán creados al guardar el evento. Puedes agregar o editar más tarde.
                </p>
              </div>
            )}

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">Imagen del Evento</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vista Previa:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/admin/events" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
