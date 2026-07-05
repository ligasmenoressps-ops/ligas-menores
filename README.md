# Ligas Menores - Plataforma de Torneos

Plataforma de gestión de torneos de fútbol para ligas menores, construida con Next.js (App Router), Prisma, y Tailwind CSS.

## Características Principales
- **Páginas Públicas:** Visualización de posiciones, calendario de jornadas y llaves de fase final (bracket).
- **Panel de Administración:** Gestión de torneos, equipos, categorías, jornadas, partidos y delegados.
- **Roles de Usuario:**
  - `ADMIN`: Acceso total para crear y gestionar todo.
  - `DELEGATE`: Acceso restringido para editar únicamente la información de su equipo asignado.

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno (`.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ligas_menores?schema=public"
   SESSION_SECRET="tu_secreto_muy_seguro_y_largo"
   ```

3. Inicializar la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   # O si usas migraciones:
   # npx prisma migrate dev
   ```

4. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en Vercel

Para desplegar esta aplicación en Vercel, sigue estos pasos:

1. **Crear base de datos administrada**:
   Puedes usar Vercel Postgres, Supabase, Neon o cualquier proveedor de PostgreSQL compatible.
   Obtén la URL de conexión (connection string).

2. **Crear proyecto en Vercel**:
   Importa tu repositorio de GitHub desde el dashboard de Vercel.

3. **Configurar Variables de Entorno en Vercel**:
   Antes de hacer deploy, ve a "Environment Variables" y agrega:
   - `DATABASE_URL`: La URL de tu base de datos administrada (ej. de Supabase o Neon).
   - `SESSION_SECRET`: Una cadena larga y aleatoria (puedes generar una con `openssl rand -base64 32`).

4. **Comandos de Build y Migración**:
   Para asegurarte de que la base de datos se actualice en cada despliegue, Vercel debe ejecutar las migraciones de Prisma.
   - Si tienes una carpeta `prisma/migrations/`, puedes ajustar tu `Build Command` en Vercel o en el `package.json`:
     ```json
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && next build"
     }
     ```
   - Si no usas migraciones y solo usas `db push` (no recomendado para producción, pero válido para proyectos pequeños):
     ```json
     "scripts": {
       "build": "prisma generate && prisma db push && next build"
     }
     ```

5. **Subida de Imágenes (Logos)**:
   > **Nota importante:** Actualmente el proyecto sube las imágenes a la carpeta `public/uploads` en el sistema de archivos local. Vercel tiene un sistema de archivos *ephemeral* (read-only en ejecución). Las imágenes subidas desde el panel de admin en Vercel se perderán al reiniciar el servidor. 
   > Para producción real, se recomienda integrar un servicio como AWS S3, Cloudinary o Vercel Blob para almacenar los logos de los equipos.

## Mejoras Futuras
- **Almacenamiento Cloud:** Migrar la subida de imágenes a un servicio como Vercel Blob o AWS S3.
- **Animaciones de Sorteo:** Implementar interfaz visual tipo "bombo" para sortear grupos.
- **Gestión de Roster:** Permitir a los delegados añadir jugadores con foto y dorsal.
- **Estadísticas Avanzadas:** Control de goleadores, tarjetas, MVP.
- **Notificaciones:** Enviar emails o notificaciones push a delegados sobre cambios en el calendario.
