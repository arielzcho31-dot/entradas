"use client";

import { useState, useEffect } from 'react';

interface ClientDateProps {
  date: string | Date;
  locale?: string;
}

export function ClientDate({ date, locale = 'es-ES' }: ClientDateProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Renderiza un placeholder en el servidor y en la carga inicial del cliente
    return <span>...</span>;
  }

  // Una vez montado en el cliente, renderiza la fecha formateada
  return <>{new Date(date).toLocaleString(locale)}</>;
}
