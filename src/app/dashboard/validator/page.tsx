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
        <h1 className="text-3xl font-bold tracking-tight">Validator Dashboard</h1>
        <p className="text-muted-foreground">
          Verify payments and manage ticket sales.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>
            Review the following transactions and verify their payment status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
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
                      ${sale.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:border-green-600 hover:bg-green-50 hover:text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:border-red-600 hover:bg-red-50 hover:text-red-600">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Reject</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No pending payments to verify.
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
