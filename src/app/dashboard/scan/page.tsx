"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CameraOff, QrCode, Type, Nfc, CheckCircle, XCircle, AlertTriangle, TicketCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface ScanResult {
  status: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  userName?: string;
  ticketStatus?: string;
  used_at?: string;
}

export default function ScanDashboard() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVerification = async (ticketId: string | null) => {
    if (!ticketId) return;
    setLoading(true);
    setShowScanner(false);
    try {
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (error || !ticketData) {
        setScanResult({
          status: 'error',
          title: 'Entrada Inválida',
          message: 'Este código de entrada no se encontró en la base de datos.',
        });
        return;
      }
      if (ticketData.status === 'verified') {
        await supabase.from('tickets').update({ status: 'used', used_at: new Date().toISOString() }).eq('id', ticketId);
        setScanResult({
          status: 'success',
          title: 'Acceso Permitido',
          message: '¡Bienvenido/a al evento!',
          userName: ticketData.userName || ticketData.user_name,
          ticketStatus: 'Habilitado',
        });
      } else if (ticketData.status === 'used') {
        setScanResult({
          status: 'warning',
          title: 'Entrada Ya Utilizada',
          message: `Esta entrada fue escaneada el `,
          userName: ticketData.userName || ticketData.user_name,
          ticketStatus: 'Ya utilizado',
          used_at: ticketData.used_at,
        });
      } else {
        setScanResult({
          status: 'error',
          title: 'Entrada Inválida',
          message: 'El estado de la entrada no es válido para acceso.',
        });
      }
    } catch (err) {
      console.error("Error verifying ticket:", err);
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span className="font-bold">Error de Verificación</span>
          </div>
        ) as any,
        description: "Ocurrió un error al verificar la entrada."
      });
    } finally {
      setLoading(false);
      setManualCode('');
    }
  };

  const getResultIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error': return <XCircle className="h-16 w-16 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default: return <TicketCheck className="h-16 w-16 text-muted-foreground" />;
    }
  };

  if (!user || (user.role !== 'organizador' && user.role !== 'admin' && user.role !== 'validador')) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-destructive">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Escanear Entradas</h1>
      <p className="text-muted-foreground">Escanea o carga manualmente las entradas de los asistentes.</p>
      <Tabs defaultValue="qr" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="qr"><QrCode className="mr-2 h-4 w-4" />Escanear QR</TabsTrigger>
          <TabsTrigger value="manual"><Type className="mr-2 h-4 w-4" />Carga Manual</TabsTrigger>
        </TabsList>
        <TabsContent value="qr">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              {showScanner ? (
                <Scanner
  onScan={(result) => {
    if (result && Array.isArray(result) && result.length > 0 && result[0].rawValue) {
      handleVerification(result[0].rawValue);
    }
  }}
  onError={(error) => {
    console.error(error);
    toast({
      variant: "destructive",
      title: "Error de cámara",
      description: "No se pudo acceder a la cámara."
    });
  }}
  constraints={{ facingMode: 'environment' }}
  classNames={{ container: "w-full max-w-xs rounded border" }}
/>

              ) : (
                <Button onClick={() => setShowScanner(true)} variant="secondary" className="w-full"><CameraOff className="mr-2 h-4 w-4" />Activar Cámara</Button>
              )}
              {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <Input
                placeholder="UUID de la entrada"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="w-full"
                disabled={loading}
              />
              <Button onClick={() => handleVerification(manualCode)} disabled={loading || !manualCode} className="w-full">
                <Nfc className="mr-2 h-4 w-4" />Verificar Manualmente
              </Button>
              {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {scanResult && (
        <Alert className="w-full max-w-md mt-4" variant={scanResult.status === 'success' ? 'default' : scanResult.status === 'warning' ? 'default' : 'destructive'}>
          <AlertTitle className="flex items-center gap-2">
            {getResultIcon(scanResult.status)}
            {scanResult.title}
          </AlertTitle>
          <AlertDescription>
            {scanResult.message}
            {scanResult.userName && <div className="mt-2 font-semibold">Usuario: {scanResult.userName}</div>}
            {scanResult.ticketStatus && <div className="mt-1">Estado: {scanResult.ticketStatus}</div>}
            {scanResult.used_at && <div className="mt-1 text-xs text-muted-foreground">Usado el: {new Date(scanResult.used_at).toLocaleString('es-ES')}</div>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
