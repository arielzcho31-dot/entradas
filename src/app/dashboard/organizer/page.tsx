
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
import { QrCode, Type, Nfc } from 'lucide-react';

export default function OrganizerDashboard() {
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
              <TabsTrigger value="scan">
                <QrCode className="mr-2 h-4 w-4" /> Escanear
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Type className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
              <TabsTrigger value="nfc">
                <Nfc className="mr-2 h-4 w-4" /> NFC
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="mt-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-12">
                <QrCode className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Listo para escanear códigos QR.
                </p>
                <Button>Abrir Cámara</Button>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de la entrada manualmente.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="TICKET-CODE-12345" className="bg-white text-black" />
                  <Button>Verificar</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="nfc" className="mt-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-12">
                <Nfc className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Toca la entrada o dispositivo con NFC para escanear.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
