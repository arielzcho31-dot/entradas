"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Shield, BarChart2, ScanLine, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">TicketWise</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {user?.role === 'admin' && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Admin Dashboard">
                    <Link href="/dashboard/admin">
                    <BarChart2 />
                    <span>Admin</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            {user?.role === 'validator' && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Validator Dashboard">
                    <Link href="/dashboard/validator">
                        <Shield />
                        <span>Validator</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            {user?.role === 'organizer' && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Organizer Dashboard">
                    <Link href="/dashboard/organizer">
                        <ScanLine />
                        <span>Organizer</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="md:hidden mb-4">
                 <SidebarTrigger />
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
