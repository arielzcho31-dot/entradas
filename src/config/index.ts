// Este archivo se encarga de cargar y validar las variables de entorno PÚBLICAS.

const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Extraemos el ID del proyecto de la URL para buscar la cookie
    projectId: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0],
  },
};

// Validamos que las variables públicas existan
if (!config.supabase.url) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local");
}
if (!config.supabase.anonKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local");
}
if (!config.supabase.projectId) {
  console.error("Error: projectId is not set in .env.local");
}

export default config;
