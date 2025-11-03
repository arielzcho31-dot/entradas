"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Ticket, ShoppingCart, LogOut, LayoutDashboard, Home, QrCode, FileCheck } from "lucide-react";

function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Ticket className="h-6 w-6" />
          <span className="font-bold">TicketWise</span>
        </Link>
        <nav className="flex-1">
          {/* Puedes añadir más links de navegación aquí si es necesario */}
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.user_metadata?.displayName || "Usuario"} />
                    <AvatarFallback>{getInitials(user.user_metadata?.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.displayName || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/my-tickets')}>
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>Mis Entradas</span>
                </DropdownMenuItem>

                { user.role === 'organizer' ? (
                  <DropdownMenuItem onClick={() => router.push('/dashboard/organizer')}>
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Escanear Entradas</span>
                  </DropdownMenuItem>
                ) : user.role === 'validator' ? (
                  <DropdownMenuItem onClick={() => router.push('/dashboard/orders')}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    <span>Aprobar Órdenes</span>
                  </DropdownMenuItem>
                ) : ( // Rol de Admin
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Regístrate</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
