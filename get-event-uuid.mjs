// Script para obtener el UUID del evento desde la API
const API_URL = 'http://localhost:9004/api/events';

async function getEventUUID() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const events = await response.json();
    
    console.log('\n📋 Eventos disponibles:');
    console.log('=====================================\n');
    
    if (events.length === 0) {
      console.log('❌ No hay eventos en la base de datos');
      console.log('\n💡 Solución: Crear un evento desde el dashboard de admin');
      console.log('   URL: http://localhost:9004/dashboard/admin\n');
      return;
    }
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   UUID: ${event.id}`);
      console.log(`   Estado: ${event.status}`);
      console.log(`   📍 URL correcta: http://localhost:9004/events/${event.id}\n`);
    });
    
    console.log('✅ Copia la URL correcta de arriba para acceder al evento\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor Next.js esté corriendo:');
    console.log('   npm run dev\n');
  }
}

getEventUUID();
