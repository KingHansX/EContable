# 🚀 Guía de Deployment - Sistema EContable

## Opciones de Deployment

El Sistema EContable es una aplicación 100% frontend (HTML, CSS, JavaScript) que **no requiere servidor backend**. Esto significa que tienes múltiples opciones de deployment, desde las más simples hasta las más profesionales.

---

## 📦 Opción 1: Uso Local (Más Simple)

### ✅ Ventajas
- ✅ Gratis
- ✅ Sin configuración
- ✅ Datos 100% privados
- ✅ Funciona offline

### ❌ Desventajas
- ❌ Solo en un computador
- ❌ No accesible desde otros dispositivos
- ❌ Requiere respaldos manuales

### 📝 Pasos

1. **Copiar la carpeta del proyecto** a una ubicación permanente:
   ```
   C:\EContable\
   ```

2. **Crear acceso directo** al `index.html`:
   - Clic derecho en `index.html`
   - "Crear acceso directo"
   - Mover al escritorio
   - Renombrar a "EContable"

3. **Configurar navegador predeterminado**:
   - Clic derecho en el acceso directo
   - Propiedades
   - Cambiar → Seleccionar Chrome o Edge

4. **¡Listo!** Doble clic para abrir

### 💾 Respaldos

**Importante:** Exporta tus datos regularmente

```
Cada módulo → Exportar → Guardar en:
C:\EContable\Respaldos\[Fecha]\
```

---

## 🌐 Opción 2: Hosting Gratuito (Recomendado)

### ✅ Ventajas
- ✅ Accesible desde cualquier lugar
- ✅ URL personalizada
- ✅ Gratis
- ✅ HTTPS automático
- ✅ Fácil de actualizar

### Servicios Recomendados

#### A. **GitHub Pages** (Más Popular)

**Pasos:**

1. **Crear cuenta en GitHub**
   - Ir a https://github.com
   - Sign up (gratis)

2. **Crear repositorio**
   ```
   Nombre: econtable
   ☑️ Public
   ☑️ Add README
   ```

3. **Subir archivos**
   - Opción 1: Usar GitHub Desktop
   - Opción 2: Arrastrar archivos al navegador

4. **Activar GitHub Pages**
   - Settings → Pages
   - Source: main branch
   - Folder: / (root)
   - Save

5. **Acceder**
   ```
   https://[tu-usuario].github.io/econtable
   ```

**Tiempo:** 10 minutos

#### B. **Netlify** (Más Fácil)

**Pasos:**

1. **Ir a Netlify**
   - https://www.netlify.com
   - Sign up (gratis)

2. **Deploy**
   - "Add new site" → "Deploy manually"
   - Arrastrar carpeta del proyecto
   - ¡Listo!

3. **URL automática**
   ```
   https://[nombre-aleatorio].netlify.app
   ```

4. **Personalizar dominio** (opcional)
   - Site settings → Domain management
   - Cambiar nombre

**Tiempo:** 5 minutos

#### C. **Vercel** (Más Rápido)

**Pasos:**

1. **Ir a Vercel**
   - https://vercel.com
   - Sign up (gratis)

2. **Import Project**
   - "Add New" → "Project"
   - Conectar GitHub o subir archivos

3. **Deploy**
   - Automático
   - URL: `https://[proyecto].vercel.app`

**Tiempo:** 3 minutos

---

## 🏢 Opción 3: Servidor Propio

### Para empresas que necesitan control total

#### A. **Servidor Windows**

**Requisitos:**
- Windows Server o Windows 10/11
- IIS (Internet Information Services)

**Pasos:**

1. **Instalar IIS**
   ```
   Panel de Control → Programas → Activar características de Windows
   ☑️ Internet Information Services
   ```

2. **Crear sitio web**
   - Abrir IIS Manager
   - Sites → Add Website
   - Nombre: EContable
   - Ruta física: C:\EContable
   - Puerto: 80 (o 8080)

3. **Configurar permisos**
   - Clic derecho en carpeta
   - Propiedades → Seguridad
   - Agregar → IIS_IUSRS → Lectura

4. **Acceder**
   ```
   http://localhost
   o
   http://[IP-del-servidor]
   ```

#### B. **Servidor Linux (Ubuntu)**

**Requisitos:**
- Ubuntu Server
- Nginx o Apache

**Pasos con Nginx:**

1. **Instalar Nginx**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copiar archivos**
   ```bash
   sudo mkdir /var/www/econtable
   sudo cp -r /ruta/proyecto/* /var/www/econtable/
   ```

3. **Configurar Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/econtable
   ```

   Contenido:
   ```nginx
   server {
       listen 80;
       server_name econtable.tuempresa.com;
       root /var/www/econtable;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Activar sitio**
   ```bash
   sudo ln -s /etc/nginx/sites-available/econtable /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Acceder**
   ```
   http://[IP-del-servidor]
   ```

---

## 🔒 Opción 4: Intranet Empresarial

### Para uso interno en red local

**Escenario:** Múltiples usuarios en la misma oficina

**Pasos:**

1. **Servidor compartido**
   - Usar un computador como servidor
   - Instalar IIS o Nginx (ver Opción 3)

2. **Configurar red**
   - IP estática al servidor
   - Ejemplo: 192.168.1.100

3. **Compartir en red**
   - Firewall → Permitir puerto 80
   - Usuarios acceden: `http://192.168.1.100`

4. **Crear acceso directo**
   - En cada computador
   - Acceso directo a la URL

---

## 📱 Opción 5: PWA (Progressive Web App)

### Convertir en app instalable

**Crear archivo `manifest.json`:**

```json
{
  "name": "Sistema EContable",
  "short_name": "EContable",
  "description": "Sistema Contable Profesional",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Agregar al `index.html`:**

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4F46E5">
```

**Crear `service-worker.js`:**

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('econtable-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/styles.css',
        '/js/app.js'
      ]);
    })
  );
});
```

**Resultado:** Los usuarios pueden "instalar" la app en su computador/móvil

---

## 🎯 Recomendaciones por Caso de Uso

### 👤 Persona Natural / Freelancer
**Recomendado:** Opción 1 (Local) o Opción 2B (Netlify)
- Simple
- Gratis
- Rápido

### 🏪 Pequeña Empresa (1-5 usuarios)
**Recomendado:** Opción 4 (Intranet)
- Todos acceden desde la oficina
- Datos centralizados
- Sin costos de hosting

### 🏢 Mediana Empresa (5-20 usuarios)
**Recomendado:** Opción 3 (Servidor Propio)
- Control total
- Respaldos automáticos
- Acceso remoto VPN

### 🌐 Múltiples Sucursales
**Recomendado:** Opción 2 (Hosting) + Opción 5 (PWA)
- Acceso desde cualquier lugar
- HTTPS seguro
- Instalable como app

---

## 🔐 Seguridad

### ⚠️ Importante

**El sistema usa localStorage**, lo que significa:
- ✅ Datos en el navegador del usuario
- ✅ No se envían a servidores
- ❌ Si se borra el caché, se pierden datos

### 🛡️ Mejores Prácticas

1. **Respaldos Regulares**
   ```
   Exportar datos semanalmente
   Guardar en múltiples ubicaciones
   ```

2. **HTTPS Obligatorio**
   - Usar Netlify/Vercel (HTTPS automático)
   - O configurar Let's Encrypt en servidor propio

3. **Acceso Controlado**
   - Usar sistema de usuarios del EContable
   - No compartir credenciales

4. **Navegador Actualizado**
   - Chrome, Edge o Firefox
   - Última versión

---

## 📋 Checklist de Deployment

### Antes de Deployar

- [ ] Probar todas las funcionalidades localmente
- [ ] Exportar datos de prueba
- [ ] Verificar que no hay errores en consola (F12)
- [ ] Revisar que todos los archivos están incluidos
- [ ] Crear respaldo completo

### Durante el Deployment

- [ ] Subir todos los archivos
- [ ] Verificar estructura de carpetas
- [ ] Probar en el navegador
- [ ] Verificar que carga correctamente
- [ ] Probar funcionalidades principales

### Después del Deployment

- [ ] Configurar empresa
- [ ] Crear usuarios
- [ ] Importar datos (si aplica)
- [ ] Capacitar usuarios
- [ ] Establecer rutina de respaldos

---

## 🚀 Deployment Rápido (5 Minutos)

### Usando Netlify (Recomendado)

```bash
# 1. Instalar Netlify CLI (opcional)
npm install -g netlify-cli

# 2. Ir a la carpeta del proyecto
cd "C:\Users\PC\Desktop\SISTEMA MONICA"

# 3. Deploy
netlify deploy --prod

# 4. Seguir instrucciones en pantalla
```

**O simplemente:**
1. Ir a https://app.netlify.com/drop
2. Arrastrar carpeta del proyecto
3. ¡Listo!

---

## 🔄 Actualizar el Sistema

### GitHub Pages / Netlify / Vercel

1. Modificar archivos localmente
2. Subir cambios al repositorio
3. Deploy automático

### Servidor Propio

1. Modificar archivos localmente
2. Copiar a servidor (FTP, RDP, etc.)
3. Reemplazar archivos

### Local

1. Modificar archivos
2. Guardar
3. Refrescar navegador (F5)

---

## 💾 Estrategia de Respaldos

### Automático (Recomendado)

**Crear script de respaldo:**

```batch
@echo off
REM Respaldo automático EContable
set FECHA=%date:~-4,4%%date:~-7,2%%date:~-10,2%
set DESTINO=C:\Respaldos\EContable\%FECHA%

mkdir "%DESTINO%"
xcopy "C:\EContable\*.*" "%DESTINO%" /E /I /Y

echo Respaldo completado: %DESTINO%
pause
```

**Programar tarea:**
- Ejecutar cada semana
- Windows Task Scheduler

### Manual

**Semanal:**
- Exportar todos los módulos a CSV
- Guardar en carpeta con fecha

**Mensual:**
- Copiar carpeta completa del proyecto
- Guardar en disco externo o nube

---

## 🌍 Dominios Personalizados

### Netlify

1. **Comprar dominio** (ej: miempresa.com)
2. **En Netlify:**
   - Domain settings
   - Add custom domain
   - Seguir instrucciones DNS

### GitHub Pages

1. **Comprar dominio**
2. **Configurar DNS:**
   ```
   A Record → 185.199.108.153
   A Record → 185.199.109.153
   A Record → 185.199.110.153
   A Record → 185.199.111.153
   ```
3. **En GitHub:**
   - Settings → Pages
   - Custom domain → miempresa.com

---

## ❓ Preguntas Frecuentes

### ¿Necesito pagar por hosting?

No, hay opciones 100% gratuitas (GitHub Pages, Netlify, Vercel).

### ¿Puedo usar en múltiples computadores?

Sí, pero cada uno tendrá sus propios datos. Para compartir datos, usa servidor propio.

### ¿Los datos están seguros?

Sí, se almacenan localmente en el navegador. Nadie más tiene acceso.

### ¿Funciona sin internet?

Sí, una vez cargado, funciona 100% offline.

### ¿Puedo usar mi propio dominio?

Sí, todos los servicios de hosting permiten dominios personalizados.

---

## 📞 Soporte de Deployment

Si necesitas ayuda con el deployment:

- 📧 Email: soporte@econtable.ec
- 📱 WhatsApp: +593 99 999 9999
- 📚 Documentación: Ver carpeta `docs/`

---

## ✅ Resumen

| Opción | Dificultad | Costo | Tiempo | Recomendado Para |
|--------|------------|-------|--------|------------------|
| **Local** | ⭐ Fácil | Gratis | 2 min | Uso personal |
| **Netlify** | ⭐⭐ Fácil | Gratis | 5 min | Pequeñas empresas |
| **GitHub Pages** | ⭐⭐ Medio | Gratis | 10 min | Desarrolladores |
| **Servidor Propio** | ⭐⭐⭐ Difícil | Medio | 30 min | Empresas grandes |
| **Intranet** | ⭐⭐⭐ Difícil | Bajo | 20 min | Oficinas |

---

**Recomendación Final:** 

Para la mayoría de usuarios, **Netlify** es la mejor opción:
- ✅ Gratis
- ✅ Fácil
- ✅ Rápido
- ✅ HTTPS automático
- ✅ Dominio personalizado

---

**Versión:** 1.0  
**Última actualización:** Enero 2026
