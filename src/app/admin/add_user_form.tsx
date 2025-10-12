"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddUserFormProps {
  onUserAdded: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    ci: '',
    numero: '',
    universidad: '',
    usuario: '',
    role: 'cliente'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validación básica antes de enviar
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email y contraseña son requeridos.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Lee la respuesta como texto crudo para depurar
      const responseText = await response.text();
      console.log('🔍 Respuesta cruda del servidor:', responseText);
      console.log('📊 Status HTTP:', response.status);
      console.log('📋 Headers de respuesta:', [...response.headers.entries()]);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.log('❌ Datos de error parseados:', errorData);
        } catch (parseError) {
          console.error('💥 Error al parsear JSON del servidor:', parseError);
          console.error('Texto crudo que falló:', responseText.substring(0, 200) + '...');
          throw new Error('La respuesta del servidor no es JSON válido. Verifica el backend (posible error en MongoDB).');
        }
        throw new Error(errorData.error || errorData.message || 'Error al crear usuario');
      }

      // Si llega aquí, es éxito: parsea el JSON
      let successData;
      try {
        successData = JSON.parse(responseText);
        console.log('✅ Datos de éxito:', successData);
      } catch (parseError) {
        console.error('💥 Error al parsear JSON de éxito:', parseError);
        throw new Error('Respuesta de éxito no es JSON válido.');
      }

      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        displayName: '',
        ci: '',
        numero: '',
        universidad: '',
        usuario: '',
        role: 'cliente'
      });

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });

      // Notificar al componente padre
      onUserAdded();
      
    } catch (error: any) {
      console.error('🚨 Error completo en handleSubmit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Error desconocido al crear usuario.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña*</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="displayName">Nombre Completo</Label>
          <Input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="ci">CI</Label>
          <Input
            id="ci"
            type="text"
            value={formData.ci}
            onChange={(e) => handleChange('ci', e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="numero">Teléfono</Label>
          <Input
            id="numero"
            type="text"
            value={formData.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="universidad">Universidad</Label>
          <Input
            id="universidad"
            type="text"
            value={formData.universidad}
            onChange={(e) => handleChange('universidad', e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="usuario">Usuario</Label>
          <Input
            id="usuario"
            type="text"
            value={formData.usuario}
            onChange={(e) => handleChange('usuario', e.target.value)}
            className="bg-white text-black"
          />
        </div>

        <div>
          <Label htmlFor="role">Rol</Label>
          <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
            <SelectTrigger className="bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="validador">Validador</SelectItem>
              <SelectItem value="organizador">Organizador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creando...' : 'Agregar Usuario'}
      </Button>
    </form>
  );
}



//ubicacion src/app/admin
/* error
 [{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "'{' expected.",
	"source": "ts",
	"startLineNumber": 16,
	"startColumn": 19,
	"endLineNumber": 16,
	"endColumn": 28,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'FormProps'.",
	"source": "ts",
	"startLineNumber": 16,
	"startColumn": 19,
	"endLineNumber": 16,
	"endColumn": 28,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1434",
	"severity": 8,
	"message": "Unexpected keyword or identifier.",
	"source": "ts",
	"startLineNumber": 17,
	"startColumn": 3,
	"endLineNumber": 17,
	"endColumn": 9,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'onUser'.",
	"source": "ts",
	"startLineNumber": 17,
	"startColumn": 3,
	"endLineNumber": 17,
	"endColumn": 9,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1109",
	"severity": 8,
	"message": "Expression expected.",
	"source": "ts",
	"startLineNumber": 17,
	"startColumn": 27,
	"endLineNumber": 17,
	"endColumn": 28,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "7010",
	"severity": 8,
	"message": "'AddUser', which lacks return-type annotation, implicitly has an 'any' return type.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 25,
	"endLineNumber": 20,
	"endColumn": 32,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "'(' expected.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 33,
	"endLineNumber": 20,
	"endColumn": 37,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'Form'.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 33,
	"endLineNumber": 20,
	"endColumn": 37,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "18004",
	"severity": 8,
	"message": "No value exists in scope for the shorthand property 'onUser'. Either declare one or provide an initializer.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 40,
	"endLineNumber": 20,
	"endColumn": 46,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "',' expected.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 47,
	"endLineNumber": 20,
	"endColumn": 52,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "18004",
	"severity": 8,
	"message": "No value exists in scope for the shorthand property 'Added'. Either declare one or provide an initializer.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 47,
	"endLineNumber": 20,
	"endColumn": 52,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "',' expected.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 54,
	"endLineNumber": 20,
	"endColumn": 55,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "',' expected.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 64,
	"endLineNumber": 20,
	"endColumn": 73,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'FormProps'.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 64,
	"endLineNumber": 20,
	"endColumn": 73,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "';' expected.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 75,
	"endLineNumber": 20,
	"endColumn": 76,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "1434",
	"severity": 8,
	"message": "Unexpected keyword or identifier.",
	"source": "ts",
	"startLineNumber": 105,
	"startColumn": 7,
	"endLineNumber": 105,
	"endColumn": 13,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'onUser'.",
	"source": "ts",
	"startLineNumber": 105,
	"startColumn": 7,
	"endLineNumber": 105,
	"endColumn": 13,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/admin/add_user_form.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'Added'.",
	"source": "ts",
	"startLineNumber": 105,
	"startColumn": 14,
	"endLineNumber": 105,
	"endColumn": 19,
	"origin": "extHost1"
}]
*/