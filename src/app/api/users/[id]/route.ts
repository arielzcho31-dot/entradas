import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { normalizeRole } from '@/lib/role-utils'

// GET /api/users/[id] - Obtener un usuario por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const result = await query(
      'SELECT id, email, role, display_name, ci, usuario, numero, universidad, created_at FROM users WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener el usuario' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Actualizar un usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Normalizar el rol si existe en el body
    if (body.role) {
      body.role = normalizeRole(body.role)
    }

    // Construir dinámicamente la consulta UPDATE
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Campos permitidos para actualizar
    const allowedFields = ['email', 'role', 'display_name', 'ci', 'usuario', 'numero', 'universidad', 'password']

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'password') {
          // Hash de la nueva contraseña
          const hashedPassword = await bcrypt.hash(value as string, 10)
          updates.push(`${key} = $${paramIndex}`)
          values.push(hashedPassword)
        } else {
          updates.push(`${key} = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      )
    }

    // Agregar el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, email, role, display_name, ci, usuario, numero, universidad, created_at, updated_at`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error('Error al actualizar usuario:', error)
    
    // Manejar error de email duplicado
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'El email o CI ya está registrado' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Eliminar un usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error: unknown) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
}