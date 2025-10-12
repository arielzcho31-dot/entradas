import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { email, ci } = userData;
    // Verifica si ya existe un usuario con el mismo email o ci
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},ci.eq.${ci}`)
      .maybeSingle();
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico o CI ya está registrado.' },
        { status: 400 }
      );
    }

    if (!userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verifica si el email ya existe en la tabla users
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();
    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Verifica si el email ya existe en Supabase Auth
    const { data: authList, error: authListError } = await supabase.auth.admin.listUsers();
    if (authListError) {
      return NextResponse.json({ error: 'Error consultando Auth.' }, { status: 500 });
    }
    if (authList?.users?.some((u) => u.email?.toLowerCase() === userData.email.toLowerCase())) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado en Auth.' },
        { status: 409 }
      );
    }

    // Crea el usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        displayName: userData.displayName,
        role: userData.role || 'customer',
        ci: userData.ci,
        numero: userData.numero,
        usuario: userData.usuario,
        universidad: userData.universidad,
      },
    });
    if (authError || !authUser || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || 'No se pudo crear el usuario en Auth' },
        { status: 500 }
      );
    }

    // Inserta el usuario en la tabla users con el mismo ID
    const newUserPayload = {
      id: authUser.user.id,
      displayName: userData.displayName,
      email: userData.email,
      role: userData.role || 'customer',
      ci: userData.ci,
      numero: userData.numero,
      usuario: userData.usuario,
      universidad: userData.universidad,
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('users')
      .insert([newUserPayload])
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}