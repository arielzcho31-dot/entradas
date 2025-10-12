"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export default function UserRoleAdminPage() {
	const { user, loading } = useAuth();
	const { toast } = useToast();
	const [userId, setUserId] = useState("");
	const [role, setRole] = useState("");
	const [updating, setUpdating] = useState(false);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
				<span className="text-muted-foreground">Cargando...</span>
			</div>
		);
	}
	if (!user) {
		return (
			<div className="text-center py-10">
				Acceso denegado
				<pre className="mt-4 bg-gray-100 text-xs p-2 rounded text-left max-w-lg mx-auto overflow-x-auto">
					{JSON.stringify(user, null, 2)}
				</pre>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setUpdating(true);
		try {
			const res = await fetch(`/api/users/${userId}/update-role`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role }),
			});
			const data = await res.json();
			if (res.ok) {
				toast({ title: "Rol actualizado", description: `Nuevo rol: ${role}` });
			} else {
				toast({ variant: "destructive", title: "Error", description: data.error });
			}
		} catch (err: any) {
			toast({ variant: "destructive", title: "Error", description: err.message });
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Cambiar Rol de Usuario</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<Input
							placeholder="ID de usuario"
							value={userId}
							onChange={e => setUserId(e.target.value)}
							required
						/>
						<Input
							placeholder="Nuevo rol (admin, organizador, validador, customer)"
							value={role}
							onChange={e => setRole(e.target.value)}
							required
						/>
						<Button type="submit" disabled={updating}>
							{updating ? "Actualizando..." : "Actualizar Rol"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}