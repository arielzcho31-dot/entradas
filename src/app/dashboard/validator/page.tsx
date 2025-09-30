
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sales } from '@/lib/placeholder-data';
import { Check, X } from 'lucide-react';

export default function ValidatorDashboard() {
  const pendingSales = sales.filter((s) => s.paymentStatus === 'Pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Validador</h1>
        <p className="text-muted-foreground">
          Verifica pagos y gestiona la venta de entradas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verificaciones Pendientes</CardTitle>
          <CardDescription>
            Revisa las siguientes transacciones y verifica su estado de pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSales.length > 0 ? (
                pendingSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.customerName}
                    </TableCell>
                    <TableCell>{sale.eventName}</TableCell>
                    <TableCell className="text-right">
                      Gs. {sale.totalPrice.toLocaleString('es-PY')}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:border-green-600 hover:bg-green-50 hover:text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Aprobar</span>
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:border-red-600 hover:bg-red-50 hover:text-red-600">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Rechazar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hay pagos pendientes para verificar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
