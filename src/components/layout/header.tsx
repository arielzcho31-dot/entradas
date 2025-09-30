
"use client";

import Link from 'next/link';
import { Ticket, BarChart2, Shield, ScanLine, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function Header() {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return names[0][0];
    }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold">TicketWise</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-4">
          {user && user.role !== 'customer' && (
             <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center justify-end space-x-2">
            {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role !== 'customer' && (
                           <DropdownMenuGroup>
                             <DropdownMenuLabel>Paneles</DropdownMenuLabel>
                             {['admin'].includes(user.role) && (
                               <Link href="/dashboard/admin">
                                 <DropdownMenuItem>
                                   <BarChart2 className="mr-2 h-4 w-4" />
                                   <span>Admin</span>
                                 </DropdownMenuItem>
                               </Link>
                             )}
                              {['admin', 'validator'].includes(user.role) && (
                               <Link href="/dashboard/validator">
                                 <DropdownMenuItem>
                                   <Shield className="mr-2 h-4 w-4" />
                                   <span>Validador</span>
                                 </DropdownMenuItem>
                               </Link>
                             )}
                              {['admin', 'organizer'].includes(user.role) && (
                               <Link href="/dashboard/organizer">
                                 <DropdownMenuItem>
                                   <ScanLine className="mr-2 h-4 w-4" />
                                   <span>Organizador</span>
                                 </DropdownMenuItem>
                               </Link>
                             )}
                           </DropdownMenuGroup>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}
