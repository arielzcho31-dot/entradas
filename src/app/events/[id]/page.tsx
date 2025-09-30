
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { event, ticketTypes } from '@/lib/placeholder-data';
import {
  Minus,
  Plus,
  Upload,
  Copy,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { db, storage } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';


export default function EventPurchasePage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(ticketTypes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketId);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB limit
         toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "El tamaño máximo del archivo es de 10 MB.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "No autenticado",
            description: "Debes iniciar sesión para realizar una compra.",
        });
        router.push('/login');
        return;
    }
    if (!file) {
        toast({
            variant: "destructive",
            title: "Falta el comprobante",
            description: "Por favor, sube el comprobante de tu transferencia.",
        });
        return;
    }
    
    setIsLoading(true);

    try {
        // 1. Upload file to Firebase Storage
        const fileRef = ref(storage, `receipts/${user.id}_${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);

        // 2. Get download URL
        const photoURL = await getDownloadURL(fileRef);

        // 3. Create order document in Firestore
        await addDoc(collection(db, "orders"), {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            ticketId: selectedTicketId,
            ticketName: selectedTicket?.name,
            quantity,
            totalPrice,
            receiptUrl: photoURL,
            status: "pending", // pending, verified, rejected
            createdAt: new Date(),
        });

        toast({
            title: "¡Solicitud Enviada!",
            description: "Tu comprobante ha sido recibido. Recibirás una confirmación pronto.",
        });

        setFile(null);
        setQuantity(1);
        setSelectedTicketId(ticketTypes[0].id);

    } catch (error) {
        console.error("Error creating order:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar tu solicitud. Inténtalo de nuevo.",
        });
    } finally {
        setIsLoading(false);
    }
  };


  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copiado",
        description: `${fieldName} copiado al portapapeles.`,
    });
  };
  
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight">
            {event.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Asegurá tus boletos – transferencia bancaria con comprobante.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column: Purchase Form */}
          <Card>
              <CardContent className="pt-6">
                 <h2 className="text-3xl font-bold mb-2">Comprar Entradas</h2>
                <p className="text-muted-foreground mb-6">
                  Seleccioná cantidad, subí tu comprobante y finalizá.
                </p>
                <div className="space-y-6">
                    {/* Ticket Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de entrada</label>
                        <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                            <SelectTrigger className="w-full bg-white text-black">
                                <SelectValue placeholder="Selecciona un tipo de entrada" />
                            </SelectTrigger>
                            <SelectContent>
                                {ticketTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name} — Gs. {type.price.toLocaleString('es-PY')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Cantidad</label>
                        <div className="flex items-center w-32 justify-between rounded-md border bg-white p-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-black" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold text-black">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-black" onClick={() => handleQuantityChange(1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Total */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Total a pagar</label>
                        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                            <span className="text-lg font-bold text-primary">Gs. {totalPrice.toLocaleString('es-PY')}</span>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Comprobante de transferencia (imagen o PDF)</label>
                        <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-center text-muted-foreground">
                                {file ? file.name : 
                                (<>
                                    <span className="font-semibold text-primary">Click</span> o arrastrá tu archivo aquí
                                </>)}
                            </p>
                            <p className="text-xs text-muted-foreground">Tamaño máx. 10 MB — 1 archivo</p>
                            <Input 
                                id="file-upload" 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-black" onClick={handleSubmit} disabled={isLoading || authLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Enviar comprobante"
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Tras enviar, el equipo validará tu pago y te enviará las entradas al correo/WhatsApp.
                    </p>
                </div>
              </CardContent>
          </Card>

          {/* Right Column: Transfer Details */}
           <Card>
              <CardContent className="pt-6">
                <h2 className="text-3xl font-bold mb-6">Datos de transferencia</h2>
                <div className="space-y-3">
                    {renderTransferDetail("Banco", "Banco Familiar SAECA")}
                    {renderTransferDetail("Titular", "CESAR ZARACHO")}
                    {renderTransferDetail("N° de Cédula", "5811557")}
                    {renderTransferDetail("N° de cuenta Desde Banco Familiar", "81-5394274", true)}
                    {renderTransferDetail("N° de cuenta Desde Otro Banco", "815394274", true)}
                    {renderTransferDetail("Alias / N° Teléfono", "0991840873", true)}
                    <div className="flex justify-center pt-4">
                        <Image src="/qr-code.png" alt="QR Code" width={200} height={200} data-ai-hint="qr code payment" />
                    </div>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );

  function renderTransferDetail(label: string, value: string, canCopy = false) {
    const copyToClipboardFunc = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado",
            description: `${label} copiado al portapapeles.`,
        });
    };

    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
        {canCopy && (
          <Button variant="ghost" size="sm" onClick={() => copyToClipboardFunc(value)}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        )}
      </div>
    );
  }
}
