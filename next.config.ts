import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Para Hostinger Shared Hosting (descomenta la siguiente línea)
  // output: 'export',
  
  // Para VPS/Cloud con Docker (mantener esta línea)
  output: 'standalone',
  
  // Optimizaciones básicas (sin experimentales para desarrollo)
  poweredByHeader: false,
  
  // Optimización de imágenes simplificada
  images: {
    remotePatterns: [
      // Patrones existentes (manténlos para compatibilidad)
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',  // De Firebase; remuévelo después de la migración
        port: '',
        pathname: '/**',
      },
      // Nuevos patrones para migración (uploads locales y QR/emails)
      {
        protocol: 'http',  // Para desarrollo local (uploads de comprobantes)
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',  // Para testing en puerto específico (ej. 3000)
        hostname: 'localhost',
        port: '80',
        pathname: '/**',
      },
      {
        protocol: 'https',  // Para QR data URLs y hosts remotos (emails, producción)
        hostname: '**',     // Wildcard para cualquier hostname seguro
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
