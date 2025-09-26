
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { event, ticketTypes } from '@/lib/placeholder-data';
import {
  Minus,
  Plus,
  Upload,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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


export default function EventPurchasePage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(ticketTypes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copiado",
        description: `${fieldName} copiado al portapapeles.`,
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            {event.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Asegurá tus boletos – transferencia bancaria con comprobante.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column: Purchase Form */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Comprar Entradas</h2>
            <p className="text-muted-foreground mb-6">
              Seleccioná cantidad, subí tu comprobante y finalizá.
            </p>
            <Card className="border-2">
              <CardContent className="pt-6 space-y-6">
                {/* Ticket Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de entrada</label>
                    <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                        <SelectTrigger className="w-full">
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
                    <div className="flex items-center w-32 justify-between rounded-md border p-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
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
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                  Enviar comprobante
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    Tras enviar, el equipo validará tu pago y te enviará las entradas al correo/WhatsApp.
                </p>

              </CardContent>
            </Card>
          </div>

          {/* Right Column: Transfer Details */}
          <div>
             <h2 className="text-3xl font-bold mb-2">Datos de transferencia</h2>
             <p className="text-muted-foreground mb-6">&nbsp;</p>
             <Card className="border-2">
                <CardContent className="pt-6 space-y-3">
                    {renderTransferDetail("Banco", "Banco Familiar SAECA")}
                    {renderTransferDetail("Titular", "CESAR ZARACHO")}
                    {renderTransferDetail("N° de Cedula", "5811557")}
                    {renderTransferDetail("N° de cuenta Desde Banco Familiar", "81-5394274", true)}
                    {renderTransferDetail("N° de cuenta Desde Otro Banco", "815394274", true)}
                    {renderTransferDetail("Alias / N° Telefono", "0991840873", true)}
                    <div className="flex justify-center pt-4">
                        <Image src="/qr-code.png" alt="QR Code" width={200} height={200} data-ai-hint="qr code payment" />
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );

  function renderTransferDetail(label: string, value: string, canCopy = false) {
    const copyToClipboard = (text: string) => {
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
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value)}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        )}
      </div>
    );
  }
}
