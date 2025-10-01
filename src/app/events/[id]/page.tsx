
"use client";

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { db, storage } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';


export default function EventPurchasePage() {
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Debes iniciar sesión para comprar entradas.",
      });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const ticketType = ticketTypes[0];
  const totalPrice = ticketType.price * quantity;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) { // 2 MB limit
        toast({
          variant: "destructive",
          title: "Archivo muy grande",
          description: "El tamaño máximo del archivo es de 2 MB.",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  const handleSubmit = async () => {
    console.log("➡️ handleSubmit iniciado");

    if (!user) {
      console.log("🚫 Usuario no autenticado");
      toast({
        variant: "destructive",
        title: "No autenticado",
        description: "Debes iniciar sesión para realizar una compra.",
      });
      router.push("/login");
      return;
    }

    if (!file) {
      console.log("🚫 No hay archivo adjunto");
      toast({
        variant: "destructive",
        title: "Falta el comprobante",
        description: "Por favor, sube el comprobante de tu transferencia.",
      });
      return;
    }

    console.log("🕐 Iniciando carga...");
    setIsLoading(true);

    try {
      // 1. Subida de archivo
      const fileRef = ref(storage, `receipts/${user.id}_${Date.now()}_${file.name}`);
      console.log("📤 Subiendo archivo a Firebase Storage...");
      await uploadBytes(fileRef, file);
      console.log("✅ Archivo subido");

      // 2. URL del archivo
      const photoURL = await getDownloadURL(fileRef);
      console.log("🌐 URL del archivo:", photoURL);

      // 3. Registro en Firestore
      console.log("📝 Enviando datos a Firestore...");
      await addDoc(collection(db, "orders"), {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        ticketId: ticketType.id,
        ticketName: ticketType.name,
        quantity,
        totalPrice,
        receiptUrl: photoURL,
        status: "pending",
        createdAt: new Date(),
      });
      console.log("✅ Orden creada en Firestore");

      toast({
        title: "¡Solicitud Enviada!",
        description: "Tu comprobante ha sido recibido. Recibirás una confirmación pronto.",
      });

      clearFile();
      setQuantity(1);

    } catch (error) {
      console.error("💥 Error en el proceso:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar tu solicitud. Inténtalo de nuevo.",
      });
    } finally {
      console.log("🔚 Finalizando handleSubmit");
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

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                  <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                    <span className="font-semibold">{ticketType.name}</span>
                    <span className="font-bold text-primary">Gs. {ticketType.price.toLocaleString('es-PY')}</span>
                  </div>
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
                  <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    {preview ? (
                      <div className="relative w-full h-full">
                        <Image src={preview} alt="Vista previa" layout="fill" objectFit="contain" className="rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={clearFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : file ? (
                      <div className="text-center">
                        <FileIcon className="w-10 h-10 text-muted-foreground mb-2 mx-auto" />
                        <p className="text-sm font-semibold">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                        <Button variant="link" size="sm" className="text-destructive" onClick={clearFile}>Quitar</Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2 mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Click</span> o arrastrá tu archivo aquí
                        </p>
                        <p className="text-xs text-muted-foreground">Tamaño máx. 2 MB</p>
                      </div>
                    )}
                    <Input
                      id="file-upload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      disabled={isLoading || !!file}
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
                {qrCodeImage && (
                  <div className="flex justify-center pt-4">
                    <Image src={qrCodeImage.imageUrl} alt="QR Code" width={200} height={200} data-ai-hint={qrCodeImage.imageHint} />
                  </div>
                )}
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

