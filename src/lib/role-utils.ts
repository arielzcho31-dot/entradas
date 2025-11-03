/**
 * Utilidades para el manejo de roles de usuario
 * Mapea roles en español a sus equivalentes en inglés (usados en la base de datos)
 */

export const VALID_ROLES = ['admin', 'organizer', 'validator', 'user'] as const;
export type ValidRole = typeof VALID_ROLES[number];

/**
 * Mapeo de roles en español/antiguos a inglés (base de datos)
 */
export const ROLE_MAPPING: { [key: string]: ValidRole } = {
  'customer': 'user',
  'validador': 'validator',
  'organizador': 'organizer',
  'admin': 'admin',
  'user': 'user',
  'validator': 'validator',
  'organizer': 'organizer',
};

/**
 * Mapeo de roles en inglés a español (para mostrar en UI)
 */
export const ROLE_LABELS: { [key in ValidRole]: string } = {
  'admin': 'Admin',
  'user': 'Cliente',
  'validator': 'Validador',
  'organizer': 'Organizador',
};

/**
 * Normaliza un rol a su equivalente en inglés válido para la base de datos
 * @param role - Rol en cualquier formato
 * @returns Rol normalizado en inglés o 'user' por defecto
 */
export function normalizeRole(role: string | null | undefined): ValidRole {
  if (!role) return 'user';
  const normalized = ROLE_MAPPING[role.toLowerCase()];
  return normalized || 'user';
}

/**
 * Obtiene la etiqueta en español de un rol
 * @param role - Rol en inglés
 * @returns Etiqueta en español
 */
export function getRoleLabel(role: string | null | undefined): string {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized];
}

/**
 * Verifica si un rol es válido
 * @param role - Rol a verificar
 * @returns true si el rol es válido
 */
export function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}
