"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { event, ticketTypes } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Minus,
  Plus,
  Upload,
  Copy,
  Loader2,
  File as FileIcon,
  X,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import RequireAuth from "@/components/auth/require-auth";
import { v4 as uuidv4 } from 'uuid';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EventData {
  id: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  status: string;
  is_informative?: boolean;
}

interface TicketTypeData {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity_available: number | null;
  description: string;
}

export default function EventPurchasePage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');
  const totalPrice = selectedTicketType ? selectedTicketType.price * quantity : 0;

  // Resetear cantidad a 1 cuando cambia el tipo de entrada
  useEffect(() => {
    if (selectedTicketType) {
      setQuantity(1);
    }
  }, [selectedTicketType?.id]);

  // Cargar datos del evento y tipos de ticket
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoadingData(true);
        
        // Si el ID no parece ser un UUID o slug, intentar obtener el primer evento disponible
        let actualEventId = eventId;
        if (!eventId || eventId === 'undefined' || eventId === 'null') {
          const eventsResponse = await fetch('/api/events');
          if (eventsResponse.ok) {
            const events = await eventsResponse.json();
            if (events.length > 0) {
              actualEventId = events[0].slug || events[0].id;
              router.replace(`/events/${actualEventId}`);
              return;
            } else {
              // No hay eventos disponibles
              toast({
                title: "No hay eventos actualmente",
                description: "Lo sentimos, no hay eventos disponibles en este momento. Vuelve pronto para ver nuevas opciones.",
              });
              setLoadingData(false);
              return;
            }
          }
        }
        
        // Cargar evento
        const eventResponse = await fetch(`/api/events/${actualEventId}`);
        if (!eventResponse.ok) {
          // Evento no encontrado, verificar si hay otros disponibles
          const eventsResponse = await fetch('/api/events');
          if (eventsResponse.ok) {
            const events = await eventsResponse.json();
            if (events.length > 0) {
              const firstEvent = events[0];
              toast({
                title: "Evento no encontrado",
                description: "El evento que buscas no está disponible. Te redirigimos a un evento disponible.",
              });
              router.replace(`/events/${firstEvent.slug || firstEvent.id}`);
              return;
            } else {
              toast({
                title: "No hay eventos actualmente",
                description: "Lo sentimos, no hay eventos disponibles en este momento. Vuelve pronto para ver nuevas opciones.",
              });
              setLoadingData(false);
              return;
            }
          }
          throw new Error('No se pudo cargar el evento');
        }
        const eventData = await eventResponse.json();
        setEventData(eventData);
        
        // Cargar tipos de ticket usando el ID real del evento
        const ticketTypesResponse = await fetch(`/api/ticket-types?eventId=${eventData.id}`);
        if (!ticketTypesResponse.ok) {
          throw new Error('No se pudieron cargar los tipos de entrada');
        }
        const ticketTypesData = await ticketTypesResponse.json();
        setTicketTypes(ticketTypesData);
        
        // Seleccionar el primer tipo de ticket por defecto
        if (ticketTypesData.length > 0) {
          setSelectedTicketType(ticketTypesData[0]);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        toast({
          variant: "destructive",
          title: "Error al cargar el evento",
          description: "No se pudieron cargar los datos del evento. Intenta de nuevo.",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, toast, router]);

  // Funciones optimizadas con useCallback
  const handleQuantityChange = useCallback((amount: number) => {
    setQuantity(prev => {
      const newQuantity = prev + amount;
      const maxQuantity = selectedTicketType?.quantity_available || 999;
      if (newQuantity < 1) return 1;
      if (selectedTicketType?.quantity_available !== null && newQuantity > maxQuantity) {
        toast({
          variant: "destructive",
          title: "Cantidad no disponible",
          description: `Solo quedan ${maxQuantity} entradas disponibles de este tipo.`,
        });
        return prev;
      }
      return newQuantity;
    });
  }, [selectedTicketType, toast]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Formato de archivo no válido",
          description: "Solo se permiten imágenes JPG, JPEG o PNG.",
        });
        event.target.value = '';
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "El tamaño máximo del archivo es de 2 MB.",
        });
        event.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        // Use FileReader with base64 instead of blob URL (more reliable in Next.js)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setPreview(result);
          }
        };
        reader.onerror = () => {
          toast({
            variant: "destructive",
            title: "Error al cargar la imagen",
            description: "No se pudo generar la vista previa.",
          });
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  }, [toast]);

  const clearFile = useCallback(() => {
    setPreview(null);
    setFile(null);
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "No autenticado",
        description: "Debes iniciar sesión para realizar una compra.",
      });
      router.push("/login");
      return;
    }
    if (!selectedTicketType) {
      toast({
        variant: "destructive",
        title: "No hay tipos de entrada",
        description: "No se encontraron tipos de entrada para este evento.",
      });
      return;
    }

    // Validar disponibilidad
    if (selectedTicketType.quantity_available !== null) {
      if (selectedTicketType.quantity_available === 0) {
        toast({
          variant: "destructive",
          title: "Entradas agotadas",
          description: "Este tipo de entrada ya no está disponible.",
        });
        return;
      }
      if (quantity > selectedTicketType.quantity_available) {
        toast({
          variant: "destructive",
          title: "Cantidad no disponible",
          description: `Solo quedan ${selectedTicketType.quantity_available} entradas disponibles de este tipo.`,
        });
        return;
      }
    }
    
    // Solo requerir comprobante si el precio es mayor a 0
    if (totalPrice > 0 && !file) {
      toast({
        variant: "destructive",
        title: "Falta el comprobante",
        description: "Por favor, sube el comprobante de tu transferencia.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      let receiptUrl = null;
      
      // Solo subir comprobante si hay archivo (eventos pagos)
      if (file) {
        // 1. Prepara los datos para enviar a la API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        // 2. Llama a la nueva API para subir el archivo
        const uploadResponse = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Error al subir el comprobante.');
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.receiptUrl;

        if (!receiptUrl) {
          throw new Error("No se recibió la URL del comprobante desde el servidor.");
        }
      }

      // 3. Crear la orden en la base de datos con la URL obtenida (o null para eventos gratis)
      const orderData = {
        eventId: eventData?.id || eventId, // Usar el ID real del evento, no el slug
        ticketTypeId: selectedTicketType!.id,
        userId: user.id,
        userName: user.user_metadata?.displayName || user.display_name,
        userEmail: user.email,
        ticketName: selectedTicketType!.name,
        quantity,
        totalPrice,
        receiptUrl,
        status: totalPrice === 0 ? "approved" : "pending", // Eventos gratis se aprueban automáticamente
      };

      // Crear la orden vía API
      const createOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Error al crear la orden.');
      }

      const createdOrder = await createOrderResponse.json();

      // Si es gratis, crear tickets automáticamente
      if (totalPrice === 0) {
        const ticketsResponse = await fetch(`/api/orders/${createdOrder.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });

        if (!ticketsResponse.ok) {
          console.error('Error al crear tickets automáticamente');
        }

        toast({
          title: "¡Entrada Confirmada!",
          description: "Tu entrada gratuita ha sido confirmada exitosamente. Revisá tu email.",
        });
      } else {
        toast({
          title: "¡Solicitud Enviada!",
          description: "Tu comprobante ha sido recibido y está pendiente de validación.",
        });
      }
      
      clearFile();
      setQuantity(1);
      router.push('/purchase-pending'); // Redirige a la nueva página de confirmación
    } catch (error: any) {
      console.error("Submit error:", error); // Añade un log más detallado
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: error.message || "No se pudo procesar tu solicitud. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventId, user, file, selectedTicketType, quantity, totalPrice, toast, clearFile, router]);

  const copyToClipboard = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${fieldName} copiado al portapapeles.`,
    });
  }, [toast]);

  // useEffect para limpiar el preview
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Loader mientras carga auth o datos
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si no hay datos del evento
  if (!eventData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No hay eventos actualmente
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Lo sentimos, no hay eventos disponibles en este momento. Vuelve pronto para ver nuevas opciones.
          </p>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Si el evento es informativo (no tiene compra de entradas)
  if (eventData.is_informative) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4 p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            {eventData.image_url && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={eventData.image_url}
                  alt={eventData.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {eventData.name}
            </h1>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold">Fecha:</span>{' '}
                {new Date(eventData.event_date).toLocaleDateString('es-PY', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div>
                <span className="font-semibold">Lugar:</span> {eventData.location}
              </div>
              {eventData.description && (
                <div>
                  <span className="font-semibold">Descripción:</span>
                  <p className="mt-2 whitespace-pre-wrap">{eventData.description}</p>
                </div>
              )}
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ℹ️ Este es un evento informativo. No requiere compra de entradas.
              </p>
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => router.push('/')} className="flex-1">
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedTicketType) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-muted-foreground">No hay tipos de entrada disponibles para este evento.</p>
      </div>
    );
  }

  // Mueve la función aquí, antes del return
  function renderTransferDetail(label: string, value: string, canCopy = false) {
    const copyToClipboardFunc = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: `${label} copiado al portapapeles.`,
      });
    };

    return (
      <div className="flex items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        {canCopy && (
          <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => copyToClipboardFunc(value)}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        )}
      </div>
    );
  }

  // Render principal (RequireAuth ya protege la ruta)
  return (
    <RequireAuth>
      <div className="bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold tracking-tight">
              {eventData.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Asegurá tus boletos – transferencia bancaria con comprobante.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column: Purchase Form */}
            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Comprar Entradas</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Seleccioná cantidad, subí tu comprobante y finalizá.
                </p>
                <div className="space-y-6">
                  {/* Ticket Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de entrada</label>
                    <div className="space-y-2">
                      {ticketTypes.map((ticketType) => {
                        const isSelected = selectedTicketType?.id === ticketType.id;
                        const isAvailable = ticketType.quantity_available === null || ticketType.quantity_available > 0;
                        const remainingTickets = ticketType.quantity_available;
                        
                        return (
                          <button
                            key={ticketType.id}
                            type="button"
                            onClick={() => isAvailable && setSelectedTicketType(ticketType)}
                            disabled={!isAvailable}
                            className={`w-full flex items-center justify-between rounded-md border p-3 transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : isAvailable
                                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{ticketType.name}</div>
                              {ticketType.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ticketType.description}</div>
                              )}
                              {remainingTickets !== null && (
                                <div className={`text-xs mt-1 font-medium ${
                                  remainingTickets === 0 
                                    ? 'text-red-600 dark:text-red-400'
                                    : remainingTickets <= 10
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {remainingTickets === 0 
                                    ? '¡Agotado!' 
                                    : `${remainingTickets} disponible${remainingTickets !== 1 ? 's' : ''}`
                                  }
                                </div>
                              )}
                            </div>
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                              {ticketType.price === 0 ? 'GRATIS' : `Gs. ${ticketType.price.toLocaleString('es-PY')}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Cantidad y Precio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad y Precio</label>
                    <div className="flex items-center gap-3">
                      {/* Selector de cantidad */}
                      <div className="flex items-center w-32 justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                          onClick={() => handleQuantityChange(1)}
                          disabled={selectedTicketType?.quantity_available !== null && quantity >= (selectedTicketType?.quantity_available || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Precio total */}
                      <div className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {totalPrice === 0 ? 'GRATIS' : `Gs. ${totalPrice.toLocaleString('es-PY')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de compra */}
                  <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      Resumen de tu compra
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estás comprando:</span>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {quantity} x {selectedTicketType?.name}
                          </div>
                          {selectedTicketType?.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {selectedTicketType.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-200 dark:border-blue-700">
                        <span className="text-gray-600 dark:text-gray-400">Precio unitario:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {selectedTicketType?.price === 0 ? 'GRATIS' : `Gs. ${selectedTicketType?.price.toLocaleString('es-PY')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* File Upload - Solo para eventos pagos */}
                  {totalPrice > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comprobante de transferencia (imagen)</label>
                    {preview ? (
                      <div className="relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={preview} 
                          alt="Vista previa del comprobante" 
                          className="w-full h-full object-contain"
                        />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 z-10" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              clearFile();
                            }}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                      <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {file ? (
                          <div className="text-center">
                            <FileIcon className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-2 mx-auto" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(file.size / 1024)} KB</p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-destructive" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearFile();
                              }}
                              type="button"
                            >
                              Quitar
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2 mx-auto" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Click</span> o arrastrá tu archivo aquí
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tamaño máx. 2 MB</p>
                          </div>
                        )}
                        <Input
                          id="file-upload"
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={handleFileChange}
                          disabled={isLoading || !!file}
                        />
                      </div>
                    )}
                  </div>
                  )}
                  {/* Submit Button */}
                  <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-black" onClick={handleSubmit} disabled={isLoading || authLoading || (totalPrice > 0 && !file)}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : totalPrice === 0 ? (
                      "Confirmar entrada gratuita"
                    ) : (
                      "Enviar comprobante"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {totalPrice === 0 
                      ? 'Tu entrada será confirmada inmediatamente.'
                      : 'Tras enviar, el equipo validará tu pago y te enviará las entradas al correo/WhatsApp.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Right Column: Payment Methods - Solo para eventos pagos */}
            {totalPrice > 0 ? (
            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Métodos de Pago</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Seleccioná tu método de pago preferido y seguí las instrucciones
                </p>
                
                <Accordion type="single" collapsible defaultValue="bank-transfer" className="w-full">
                  {/* Método 1: Transferencia Bancaria */}
                  <AccordionItem value="bank-transfer" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg mb-3 px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Transferencia Bancaria</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Enviá tu comprobante para validación</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          ℹ️ Realizá la transferencia y subí el comprobante en el formulario de la izquierda
                        </p>
                      </div>
                      {renderTransferDetail("Banco", "Banco Familiar SAECA")}
                      {renderTransferDetail("Titular", "CESAR ZARACHO")}
                      {renderTransferDetail("N° de Cédula", "5811557")}
                      {renderTransferDetail("N° de cuenta Desde Banco Familiar", "81-5394274", true)}
                      {renderTransferDetail("N° de cuenta Desde Otro Banco", "815394274", true)}
                      {renderTransferDetail("Alias / N° Teléfono", "0991840873", true)}
                      {qrCodeImage && (
                        <div className="flex justify-center pt-4">
                          <Image src={qrCodeImage.imageUrl} alt="QR Code" width={200} height={200} data-ai-hint={qrCodeImage.imageHint} />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Método 2: Pago con Tarjeta (Próximamente) */}
                  <AccordionItem value="card-payment" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg mb-3 px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            Pago con Tarjeta
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                              Próximamente
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Procesamiento instantáneo y seguro</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                        <svg className="w-12 h-12 mx-auto text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">
                          Pago con Tarjeta - En Desarrollo
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Estamos trabajando para integrar pagos con tarjeta de crédito/débito. 
                          Por ahora, utilizá transferencia bancaria.
                        </p>
                        <div className="space-y-2 text-left bg-white dark:bg-gray-900 rounded-lg p-3">
                          <p className="text-xs font-semibold">Próximas funcionalidades:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                            <li>Procesamiento instantáneo de pagos</li>
                            <li>Múltiples tarjetas (Visa, Mastercard, etc.)</li>
                            <li>Generación automática de tickets</li>
                            <li>Pasarela de pago 100% segura</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Método 3: Giros Tigo (Próximamente) */}
                  <AccordionItem value="tigo-money" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            Giros Tigo / Billeteras Móviles
                            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                              Próximamente
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pago móvil rápido y conveniente</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
                        <svg className="w-12 h-12 mx-auto text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
                          Billeteras Móviles - Próximamente
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Integraciones con Giros Tigo, Personal Pay y otras billeteras móviles están en desarrollo.
                        </p>
                        <div className="text-xs text-muted-foreground bg-white dark:bg-gray-900 rounded-lg p-3">
                          <p className="font-semibold mb-2">Proveedores planeados:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <span className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">Giros Tigo</span>
                            <span className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">Personal Pay</span>
                            <span className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">Zimple</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            ) : (
            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Entrada Gratuita</h2>
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">¡Este evento es gratis!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Simplemente confirmá tu asistencia y recibirás tu entrada inmediatamente.
                  </p>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

