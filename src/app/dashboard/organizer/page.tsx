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
        <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage event access by scanning tickets.
        </p>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Ticket Scanner</CardTitle>
          <CardDescription>
            Verify tickets to grant entry to your event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan">
                <QrCode className="mr-2 h-4 w-4" /> Scan
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
                  Ready to scan QR codes.
                </p>
                <Button>Open Camera</Button>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="mt-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the ticket code manually below.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="TICKET-CODE-12345" />
                  <Button>Verify</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="nfc" className="mt-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-12">
                <Nfc className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Tap NFC-enabled ticket or device to scan.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
