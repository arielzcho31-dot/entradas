import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart2, Shield, ScanLine } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to your Dashboard</h1>
            <p className="text-muted-foreground mb-8">
                Select a role from the sidebar to view your specific tools and data.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/dashboard/admin">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="h-6 w-6 text-primary" />
                                <span>Admin</span>
                            </CardTitle>
                            <CardDescription>Oversee all operations, users, and sales data.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/dashboard/validator">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                <span>Validator</span>
                            </CardTitle>
                            <CardDescription>Verify payments and confirm ticket sales.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/dashboard/organizer">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ScanLine className="h-6 w-6 text-primary" />
                                <span>Organizer</span>
                            </CardTitle>
                            <CardDescription>Manage event entry by scanning tickets.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}