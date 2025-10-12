"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ShieldCheck, Users, QrCode, Ticket, User as UserIcon, LogOut, TicketPlus, FileCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { event } from '@/lib/placeholder-data'; // Importar datos del evento

const sidebarNavItems = [
	{ title: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin'] },
	{ title: 'Dashboard', href: '/dashboard/validator', icon: Home, roles: ['validador'] },
	{ title: 'Dashboard', href:  '/dashboard/scan',/*'/dashboard/organizer',*/ icon: Home, roles: ['organizador'] },
	{ title: 'Mi Perfil', href: '/dashboard/profile', icon: UserIcon, roles: ['customer', 'admin'] },
	{ title: 'Mis Entradas', href: '/dashboard/my-tickets', icon: Ticket, roles: ['customer', 'admin'] },
	{ title: 'Comprar Entradas', href: `/events/${event.id}`, icon: Ticket, roles: ['customer'] },
	{ title: 'Aprobar Órdenes', href: '/dashboard/validator', icon: FileCheck, roles: ['admin'] },
	{ title: 'Escanear Entradas', href: '/dashboard/scan', icon: QrCode, roles: ['admin', 'validador'] },
	{ title: 'Usuarios', href: '/dashboard/users', icon: Users, roles: ['admin'] },
	{ title: 'Generar Entradas', href: '/dashboard/ticket-generator', icon: TicketPlus, roles: ['admin'] },
	{ title: 'Entradas Generadas', href: '/dashboard/generated-tickets', icon: Ticket, roles: ['admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();

	useEffect(() => {
		// Redirección para clientes
		if (
			user?.role === 'customer' &&
			pathname.startsWith('/dashboard') &&
			!['/dashboard/profile', '/dashboard/my-tickets'].includes(pathname)
		) {
			router.replace('/dashboard/profile');
		}
		// Redirección para validadores (permitir /dashboard/validator y /dashboard/scan)
		if (
			user?.role === 'validador' &&
			pathname.startsWith('/dashboard') &&
			!['/dashboard/validator', '/dashboard/scan'].includes(pathname)
		) {
			router.replace('/dashboard/validator');
		}
	}, [pathname, user, router]);

	const availableNavItems = sidebarNavItems.filter(item => user && item.roles.includes(user.role));

	return (
		<div className="container mx-auto flex flex-col md:flex-row min-h-[calc(100vh-8rem)] py-10 gap-8">
			<aside className="w-full md:w-1/5 md:pr-8">
				<nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
					{availableNavItems.map((item) => (
						<Link key={item.href} href={item.href} className="flex-shrink-0">
							<Button
								variant={pathname === item.href ? 'secondary' : 'ghost'}
								className="w-full justify-start"
							>
								<item.icon className="mr-2 h-4 w-4" />
								{item.title}
							</Button>
						</Link>
					))}
					<Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 flex-shrink-0" onClick={logout}>
						<LogOut className="mr-2 h-4 w-4" />
						Cerrar Sesión
					</Button>
				</nav>
			</aside>
			<main className="flex-1">
				{children}
			</main>
		</div>
	);
}
