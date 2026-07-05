# Checklist de Despliegue a Producción (Vercel + Supabase)

Sigue estos pasos para desplegar tu aplicación exitosamente tras la migración.

## 1. Configuración de Base de Datos en Supabase
- Entra a Supabase y obtén tus credenciales de la base de datos Postgres.
- Obtén el Connection String modo **Pooler** (puerto 6543, suele terminar en `?pgbouncer=true`).
- Obtén el Connection String modo **Direct** (puerto 5432).

## 2. Configuración de Storage en Supabase
- Ve a la sección **Storage** en tu proyecto de Supabase.
- Crea un nuevo bucket llamado exactamente **`team-logos`**.
- **¡MUY IMPORTANTE!**: Marca el bucket como **Public**. Si no lo haces, las imágenes no cargarán en la plataforma web.

## 3. Variables de Entorno en Vercel
En tu panel de Vercel (Project -> Settings -> Environment Variables), agrega las siguientes:
- `DATABASE_URL`: La URL del Pooler (puerto 6543).
- `DIRECT_URL`: La URL Directa (puerto 5432).
- `JWT_SECRET`: Un secreto generado criptográficamente (ej. corre `openssl rand -base64 32` en tu terminal).
- `SUPABASE_URL`: La URL base de tu proyecto Supabase (ej. `https://xxx.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY`: Tu clave `service_role` (Settings -> API). **NO** le pongas prefijo `NEXT_PUBLIC_`.

## 4. Ejecutar Migraciones (¡Desde tu máquina!)
Vercel compilará la app, pero **NO** debe correr migraciones en cada build. Para sincronizar tu esquema de Prisma con Supabase, ejecuta esto en tu terminal local (asegúrate de que tu `.env` local tenga las URLs de Supabase):

```bash
npx prisma migrate deploy
```

*(Opcional)* Si quieres llenar la base de datos con los datos de prueba (categorías y usuarios admin):
```bash
npx prisma db seed
```

## 5. Verificación Post-Deploy
Una vez que Vercel termine el despliegue exitosamente:
1. Entra a `tusitio.com/login` e ingresa como administrador (`admin@ligasmenores.com`).
2. Ve a crear o editar un equipo.
3. Sube un logo de prueba.
4. Inspecciona la imagen subida en la web pública para confirmar que carga exitosamente desde Supabase Storage.
5. Revisa cualquier tabla de posiciones o el fixture para asegurar que los datos leen bien desde Postgres.
