'use client';

import React, { useEffect } from 'react';
import QRCode from 'qrcode.react';

export interface TicketDesignProps {
  key?: string;
  ticketId: string;
  eventName: string;
  ticketType: string;
  userName: string;
  onRendered: () => void;
}

export function TicketDesign({
  ticketId,
  eventName,
  ticketType,
  userName,
  onRendered,
}: TicketDesignProps) {
  useEffect(() => {
    // Llamar a onRendered cuando el componente esté listo
    const timer = setTimeout(() => {
      onRendered();
    }, 100);

    return () => clearTimeout(timer);
  }, [onRendered]);

  return (
    <div
      className="w-full max-w-2xl mx-auto p-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
      style={{ pageBreakAfter: 'always' }}
    >
      {/* Header Gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">{eventName}</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <p className="text-blue-100 text-lg font-semibold">{ticketType}</p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Lado izquierdo: Información */}
          <div className="col-span-2 space-y-6">
            {/* Ticket ID */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-xs text-blue-600 uppercase tracking-widest font-bold">
                🎫 Ticket ID
              </p>
              <p className="text-xl font-mono font-bold text-gray-900 mt-1 break-all">
                {ticketId}
              </p>
            </div>

            {/* Asistente */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-600">
              <p className="text-xs text-green-700 uppercase tracking-widest font-bold">
                👤 Asistente
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{userName}</p>
            </div>

            {/* Tipo de Entrada */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-600">
              <p className="text-xs text-purple-700 uppercase tracking-widest font-bold">
                🎟️ Tipo de Entrada
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">{ticketType}</p>
            </div>
          </div>

          {/* Lado derecho: QR */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <QRCode 
                value={ticketId} 
                size={180} 
                level="H" 
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center font-semibold">Escanear para validar</p>
          </div>
        </div>

        {/* Información de Validez */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-900 font-bold">
            ⚠️ Esta entrada es personal e intransferible
          </p>
          <p className="text-xs text-yellow-800 mt-1">
            Presentar este código QR en la entrada del evento
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">Válida solo para el evento mencionado</p>
          <p className="text-xs text-gray-400 mt-1">TicketWise © 2026</p>
        </div>
      </div>

      {/* Bottom Border Accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
    </div>
  );
}

export default TicketDesign;

