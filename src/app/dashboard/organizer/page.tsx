
"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Type,
  Nfc,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  TicketCheck,
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type ScanResult = {
  status: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  userName?: string;
  ticketStatus?: string;
};

export default function OrganizerDashboard() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    if (showScanner) {
        const checkCameraPermission = async () => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              console.error('Media Devices API not available.');
              setHasCameraPermission(false);
              return;
          }
          try {
            // This just checks for permission without activating the camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Important: stop the track immediately
            setHasCameraPermission(true);
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Acceso a la Cámara Denegado',
              description: 'Por favor, habilita los permisos de la cámara en tu navegador.',
            });
          }
        };
        checkCameraPermission();
    }
  }, [showScanner, toast]);

  const handleVerification = async (ticketCode: string) => {
    if (!ticketCode) return;
    setLoading(true);
    setScanResult(null);
    setShowScanner(false); // Close scanner after a scan

    try {
        const ticketsRef = collection(db, "tickets");
        const q = query(ticketsRef, where("ticketCode", "==", ticketCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setScanResult({
                status: 'error',
                title: 'Código Inválido',
                message: 'Esta entrada no existe en el sistema.',
            });
            return;
        }

        const ticketDoc = querySnapshot.docs[0];
        const ticketData = ticketDoc.data();
        const ticketId = ticketDoc.id;

        if (ticketData.status === 'enabled') {
            const ticketRef = doc(db, "tickets", ticketId);
            await updateDoc(ticketRef, { 
                status: 'used',
                usedAt: new Date(),
            });
            setScanResult({
                status: 'success',
                title: 'Acceso Permitido',
                message: '¡Bienvenido/a al evento!',
                userName: ticketData.userName,
                ticketStatus: 'Habilitado',
            });
        } else if (ticketData.status === 'used') {
            setScanResult({
                status: 'warning',
                title: 'Entrada Ya Utilizada',
                message: `Esta entrada fue escaneada el ${ticketData.usedAt.toDate().toLocaleString('es-ES')}.`,
                userName: ticketData.userName,
                ticketStatus: 'Ya utilizado',
            });
        } else if (ticketData.status === 'disabled') {
            setScanResult({
                status: 'error',
                title: 'Entrada No Habilitada',
                message: 'El pago de esta entrada aún no ha sido verificado.',
                userName: ticketData.userName,
                ticketStatus: 'Pendiente',
            });
        }

    } catch (error) {
        console.error("Error verifying ticket:", error);
        toast({
            variant: "destructive",
            title: "Error de Verificación",
            description: "Ocurrió un error al verificar la entrada. Inténtalo de nuevo."
        });
    } finally {
        setLoading(false);
        setManualCode('');
    }
  };

  const getResultIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <TicketCheck className="h-16 w-16 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Organizador</h1>
        <p className="text-muted-foreground">
          Gestiona el acceso al evento escaneando entradas.
        </p>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Escaner de Entradas</CardTitle>
          <CardDescription>
            Verifica las entradas para permitir el acceso a tu evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan" onClick={() => setShowScanner(true)}>
                <QrCode className="mr-2 h-4 w-4" /> Escanear
              </TabsTrigger>
              <TabsTrigger value="manual" onClick={() => setShowScanner(false)}>
                <Type className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
              <TabsTrigger value="nfc" onClick={() => setShowScanner(false)}>
                <Nfc className="mr-2 h-4 w-4" /> NFC
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="mt-6 text-center">
              {showScanner ? (
                <div className="relative space-y-4">
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {hasCameraPermission === null ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : hasCameraPermission === true ? (
                      <Scanner
                        onResult={(result) => handleVerification(result)}
                        onError={(error) => {
                            if (error.name === 'NotAllowedError') {
                                setHasCameraPermission(false);
                            }
                            console.error(error?.message)
                        }}
                      />
                    ) : null}
                  </div>
                  {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Cámara no disponible</AlertTitle>
                            <AlertDescription>
                                No se pudo acceder a la cámara. Revisa los permisos en tu navegador.
                            </AlertDescription>
                        </Alert>
                    )}
                   <Button onClick={() => setShowScanner(false)}>Cerrar Escáner</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-12">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">
                    Listo para escanear códigos QR.
                    </p>
                    <Button onClick={() => setShowScanner(true)}>Abrir Cámara</Button>
              </div>
              )}
            </TabsContent>
            <TabsContent value="manual" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de la entrada manualmente.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="TICKET-CODE-12345" 
                    className="bg-white text-black" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                  />
                  <Button onClick={() => handleVerification(manualCode)} disabled={loading || !manualCode}>
                    {loading ? <Loader2 className="animate-spin" /> : "Verificar"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="nfc" className="mt-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-12">
                <Nfc className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Funcionalidad NFC no disponible actualmente.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
       <AlertDialog open={!!scanResult} onOpenChange={() => setScanResult(null)}>
        <AlertDialogContent>
          {scanResult && (
            <>
              <AlertDialogHeader className="text-center items-center">
                {getResultIcon(scanResult.status)}
                <AlertDialogTitle className="text-2xl mt-4">{scanResult.title}</AlertDialogTitle>
                <AlertDialogDescription>{scanResult.message}</AlertDialogDescription>
              </AlertDialogHeader>
              {scanResult.userName && (
                <Card className="mt-4 bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cliente:</span>
                            <span className="font-medium">{scanResult.userName}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Estado:</span>
                             <span className="font-medium">{scanResult.ticketStatus}</span>
                        </div>
                    </CardContent>
                </Card>
              )}
              <AlertDialogFooter className="mt-4">
                <AlertDialogAction onClick={() => setScanResult(null)} className="w-full">
                  Cerrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
