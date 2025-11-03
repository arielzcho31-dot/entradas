/**
 * Genera un slug amigable para URLs a partir del nombre del evento
 * Ejemplo: "UNIDAFEST 2025" -> "unidafest-2025"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
    .substring(0, 100); // Limitar longitud
}

/**
 * Genera un slug único agregando un sufijo numérico si ya existe
 */
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
