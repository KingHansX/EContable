# Guía de Despliegue en la Nube (Cloud)

Tu sistema ahora tiene un **Backend (Servidor)** y una **Base de Datos**. Ya no es solo una página web estática, por lo que necesita un servidor real para funcionar en la nube.

Recomendamos **Railway** o **Render** porque son gratuitos/baratos y soportan este tipo de proyectos fácilmente.

## Opción Recomendada: Railway (Más fácil)

1.  **Sube tu código a GitHub**
    *   Crea un repositorio en GitHub.com
    *   Sube todos los archivos de esta carpeta.

2.  **Crea el proyecto en Railway**
    *   Ve a [railway.app](https://railway.app) y regístrate.
    *   Click en "New Project" -> "Deploy from GitHub repo".
    *   Selecciona tu repositorio.
    *   Railway detectará automáticamente el archivo `Dockerfile`.

3.  **Configura el almacenamiento (Importante)**
    *   Para que tu base de datos no se borre cada vez que actualizas, necesitas un "Volumen".
    *   En Railway, ve a la configuración de tu servicio -> "Volumes".
    *   Añade un volumen montado en `/app/database`.

4.  **¡Listo!**
    *   Railway te dará una URL (ej: `https://sistema-monica-production.up.railway.app`).
    *   Abre esa URL y verás tu sistema funcionando.

## Opción Alternativa: Render

1.  Sube tu código a GitHub.
2.  Ve a [render.com](https://render.com).
3.  Crea un "Web Service".
4.  Conecta tu repositorio.
5.  Render detectará Node.js. Asegúrate que el comando de inicio sea `npm start`.
6.  Necesitarás añadir un "Disk" en la configuración de Render montado en `/app/database` para persistir los datos (esto suele ser de pago en Render).

---
**Nota sobre la Base de Datos:**
Tu sistema usa SQLite (`monica.db`). Es excelente para empezar. Si tu empresa crece mucho, en el futuro podrías cambiar a PostgreSQL o MySQL sin cambiar mucho código, solo ajustando la configuración en `server.js`.
