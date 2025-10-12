import React, { useEffect } from 'react';
import QRCode from 'qrcode.react';

interface TicketDesignProps {
  ticketId: string;
  eventName: React.ReactNode; // Cambiado de string a React.ReactNode
  ticketName: string; // "Acceso General"
  userName?: string;
  onRendered: () => void; // <-- Añade esta prop de nuevo
}

export const TicketDesign: React.FC<TicketDesignProps> = ({ ticketId, eventName, ticketName, userName, onRendered }) => {
  
  // Llama a onRendered después de que el componente se haya montado/actualizado
  useEffect(() => {
    onRendered();
  }, [onRendered]);

  return (
    // Contenedor principal del boleto
    <div className="bg-gray-900 text-white rounded-lg shadow-lg w-[350px] h-[500px] flex flex-col p-6 font-sans break-inside-avoid mb-4">
      
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-600 pb-4">
        <h1 className="text-3xl font-bold tracking-wider uppercase">{eventName}</h1>
        <p className="text-amber-400 text-lg font-semibold">{ticketName}</p>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center py-6">
        <div className="bg-white p-3 rounded-md">
          <QRCode value={ticketId} size={180} />
        </div>
        <p className="text-xs text-gray-400 mt-4 tracking-widest">{ticketId}</p>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-dashed border-gray-600 pt-4">
        {userName && <p className="text-sm mb-1">Válido para: {userName}</p>}
        <p className="text-sm">Presenta este código en el acceso.</p>
        <p className="text-xs text-gray-500 mt-1">Boleto válido para una persona.</p>
      </div>
    </div>
  );
};

