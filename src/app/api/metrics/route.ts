import { NextRequest, NextResponse } from 'next/server';

// Métricas simples en memoria (para producción considera un store externo)
interface Metrics {
  http_requests_total: Map<string, number>;
  http_request_duration: Map<string, number[]>;
  active_users: number;
  orders_total: number;
  tickets_generated: number;
  errors_total: Map<string, number>;
  last_updated: number;
}

let metrics: Metrics = {
  http_requests_total: new Map(),
  http_request_duration: new Map(),
  active_users: 0,
  orders_total: 0,
  tickets_generated: 0,
  errors_total: new Map(),
  last_updated: Date.now(),
};

// Función para incrementar métricas
export function incrementMetric(name: string, labels: Record<string, string> = {}) {
  const key = `${name}${Object.entries(labels).map(([k, v]) => `_${k}_${v}`).join('')}`;
  
  switch (name) {
    case 'http_requests_total':
      metrics.http_requests_total.set(key, (metrics.http_requests_total.get(key) || 0) + 1);
      break;
    case 'errors_total':
      metrics.errors_total.set(key, (metrics.errors_total.get(key) || 0) + 1);
      break;
  }
  
  metrics.last_updated = Date.now();
}

// Función para registrar duración de requests
export function recordRequestDuration(route: string, duration: number) {
  const key = `http_request_duration_${route}`;
  const durations = metrics.http_request_duration.get(key) || [];
  durations.push(duration);
  
  // Mantener solo las últimas 1000 mediciones
  if (durations.length > 1000) {
    durations.shift();
  }
  
  metrics.http_request_duration.set(key, durations);
  metrics.last_updated = Date.now();
}

// Función para actualizar contadores de negocio
export function updateBusinessMetrics(metric: string, value: number) {
  switch (metric) {
    case 'active_users':
      metrics.active_users = value;
      break;
    case 'orders_total':
      metrics.orders_total = value;
      break;
    case 'tickets_generated':
      metrics.tickets_generated = value;
      break;
  }
  
  metrics.last_updated = Date.now();
}

// Convertir métricas a formato Prometheus
function formatPrometheusMetrics(): string {
  const lines: string[] = [];
  
  // HTTP requests total
  lines.push('# HELP http_requests_total Total number of HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  for (const [key, value] of metrics.http_requests_total.entries()) {
    lines.push(`http_requests_total{${key}} ${value}`);
  }
  
  // HTTP request duration
  lines.push('# HELP http_request_duration_seconds HTTP request duration in seconds');
  lines.push('# TYPE http_request_duration_seconds histogram');
  for (const [key, durations] of metrics.http_request_duration.entries()) {
    if (durations.length > 0) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95 = durations.sort()[Math.floor(durations.length * 0.95)];
      lines.push(`http_request_duration_seconds_avg{${key}} ${avg / 1000}`);
      lines.push(`http_request_duration_seconds_p95{${key}} ${p95 / 1000}`);
    }
  }
  
  // Business metrics
  lines.push('# HELP ticketwise_active_users Number of active users');
  lines.push('# TYPE ticketwise_active_users gauge');
  lines.push(`ticketwise_active_users ${metrics.active_users}`);
  
  lines.push('# HELP ticketwise_orders_total Total number of orders');
  lines.push('# TYPE ticketwise_orders_total counter');
  lines.push(`ticketwise_orders_total ${metrics.orders_total}`);
  
  lines.push('# HELP ticketwise_tickets_generated Total number of tickets generated');
  lines.push('# TYPE ticketwise_tickets_generated counter');
  lines.push(`ticketwise_tickets_generated ${metrics.tickets_generated}`);
  
  // Errors
  lines.push('# HELP error_total Total number of errors');
  lines.push('# TYPE error_total counter');
  for (const [key, value] of metrics.errors_total.entries()) {
    lines.push(`error_total{${key}} ${value}`);
  }
  
  // System metrics
  lines.push('# HELP ticketwise_last_updated Last time metrics were updated');
  lines.push('# TYPE ticketwise_last_updated gauge');
  lines.push(`ticketwise_last_updated ${metrics.last_updated}`);
  
  return lines.join('\n') + '\n';
}

export async function GET(request: NextRequest) {
  try {
    // Verificar si es una request interna (desde Prometheus)
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent.includes('Prometheus') && process.env.NODE_ENV === 'production') {
      // En producción, solo permitir acceso desde Prometheus
      return new NextResponse('Forbidden', { status: 403 });
    }

    const metricsText = formatPrometheusMetrics();
    
    return new NextResponse(metricsText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}