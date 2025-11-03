import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const userId = formData.get('userId') as string

    if (!image) {
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'No se proporcionó userId' }, { status: 400 })
    }

    // Crear directorio si no existe (usar carpeta events_profile dentro de public)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'events_profile')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const ext = path.extname(image.name)
    const filename = `${userId}-${timestamp}${ext}`
    const filepath = path.join(uploadsDir, filename)

    // Guardar archivo
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // URL relativa
    const imageUrl = `/uploads/events_profile/${filename}`

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    )
  }
}
