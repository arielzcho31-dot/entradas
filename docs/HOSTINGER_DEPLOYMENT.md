# Guía de Deploy para Hostinger - TicketWise

## 🎯 Opciones de Hosting en Hostinger

### VPS Hosting (Recomendado para Docker)
- **Plan mínimo:** VPS 1 ($7/mes)
- **Recursos:** 1 CPU, 4GB RAM, 20GB SSD
- **Docker:** ✅ Compatible
- **SSL:** ✅ Gratuito automático
- **Panel:** hPanel + SSH

### Cloud Hosting (Premium)
- **Plan mínimo:** Cloud Startup ($9/mes)  
- **Recursos:** 2 CPU, 3GB RAM, 20GB SSD
- **Docker:** ✅ Compatible
- **Performance:** ✅ Superior
- **Auto-scaling:** ✅ Incluido

### Shared Hosting (Económico)
- **Plan mínimo:** Premium ($3/mes)
- **Limitaciones:** ❌ Sin Docker, ❌ Sin Node.js servidor
- **Solo para:** Sitios estáticos exportados

---

## 🚀 Deploy en Hostinger VPS/Cloud

### 1. Configurar VPS
```bash
# En panel de Hostinger:
1. Crear VPS con Ubuntu 22.04
2. Configurar SSH key o password
3. Anotar IP pública asignada
4. Configurar dominio en DNS
```

### 2. Conectar por SSH
```bash
# Desde tu Windows
ssh root@TU_IP_HOSTINGER

# O usando PuTTY si prefieres GUI
```

### 3. Setup Automático
```bash
# Subir archivos (usar script transfer)
# Luego en el servidor:
cd /root/ticketwise
./setup-ubuntu.sh

# Configurar variables
nano .env.local

# Iniciar aplicación
./docker.sh prod
```

### 4. Configurar Dominio
```bash
# En panel de Hostinger:
1. DNS Zone Editor
2. A Record: tu-dominio.com → IP_VPS
3. CNAME: www.tu-dominio.com → tu-dominio.com

# SSL automático se configura solo
```

---

## 🔧 Deploy en Shared Hosting

### 1. Modificar para Export Estático
```bash
# En next.config.ts cambiar:
output: 'export'

# Build estático
npm run build
npm run export
```

### 2. Subir Archivos
```bash
# En hPanel:
1. File Manager
2. Subir carpeta 'out/' a public_html/
3. Configurar dominio
```

### 3. Limitaciones
```bash
❌ Sin APIs dinámicas
❌ Sin autenticación server-side  
❌ Sin uploads de archivos
❌ Sin base de datos server-side
```

---

## 💰 Comparación de Costos

| Plan | Precio/mes | Docker | Performance | Recomendado |
|------|------------|---------|-------------|-------------|
| Shared Premium | $3 | ❌ | Básico | 🟡 Solo estático |
| VPS 1 | $7 | ✅ | Bueno | 🟢 Ideal |
| VPS 2 | $13 | ✅ | Muy bueno | 🟢 Si necesitas más recursos |
| Cloud Startup | $9 | ✅ | Excelente | 🟢 Mejor performance |

---

## 🎯 Mi Recomendación

**Para TicketWise: Hostinger VPS 1 ($7/mes)**

✅ **Ventajas:**
- Docker completo
- Todos los scripts funcionan
- SSL gratuito automático
- Panel web + SSH
- Soporte técnico
- Backups automáticos

✅ **Proceso idéntico a Ubuntu:**
```bash
# MISMO flujo de trabajo
./setup-ubuntu.sh
./docker.sh prod
```

✅ **URLs finales:**
- https://tu-dominio.com
- Panel: https://hpanel.hostinger.com
- SSH: ssh root@IP_HOSTINGER

---

## 📞 Soporte

**Hostinger tiene:**
- ✅ Chat 24/7 en español
- ✅ Documentación extensa
- ✅ Video tutoriales
- ✅ Community forum

**Vs Ubuntu self-managed:**
- ❌ Solo documentación online
- ❌ Sin soporte directo
- ❌ Troubleshooting por tu cuenta