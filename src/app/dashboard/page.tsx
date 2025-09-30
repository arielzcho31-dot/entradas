
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart2, Shield, ScanLine } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Bienvenido a tu Dashboard</h1>
            <p className="text-muted-foreground mb-8">
                Selecciona un rol para ver tus herramientas y datos específicos.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/dashboard/admin">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="h-6 w-6 text-primary" />
                                <span>Administrador</span>
                            </CardTitle>
                            <CardDescription>Supervisa todas las operaciones, usuarios y datos de ventas.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/dashboard/validator">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                <span>Validador</span>
                            </CardTitle>
                            <CardDescription>Verifica pagos y confirma la venta de entradas.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/dashboard/organizer">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ScanLine className="h-6 w-6 text-primary" />
                                <span>Organizador</span>
                            </CardTitle>
                            <CardDescription>Gestiona el acceso al evento escaneando las entradas.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
