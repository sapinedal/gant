# Trazalo Gantt

Aplicación de gestión de proyectos con cronogramas tipo Gantt: crea proyectos, agrega tareas con fechas/progreso arrastrando en el cronograma, invita miembros por correo electrónico y recibe notificaciones cuando te asignan una tarea.

Stack alineado al diseño y arquitectura de Trazalo:

- **Backend**: Laravel 12 + PostgreSQL + Sanctum (auth por token) + Mail
- **Frontend**: React 19 + Vite + TypeScript + Tailwind v4 (misma paleta/tipografía DM Sans de Trazalo)

## Base de datos

PostgreSQL, base `trazalo-gantt`, usuario `postgres`, password `root` (ver `backend/.env`).

## Backend

```bash
cd backend
composer install
php artisan migrate
php artisan serve --port=8001
```

Correos: por defecto `MAIL_MAILER=log` (los correos quedan en `backend/storage/logs/laravel.log`). Para enviar correos reales, edita `backend/.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicación
MAIL_FROM_ADDRESS=tu_correo@gmail.com
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 (el proxy de Vite reenvía `/api` a `http://127.0.0.1:8001`).

## Funcionalidades

- Registro / login (Sanctum, token Bearer)
- Proyectos: crear, editar, eliminar, roles (owner/editor/viewer)
- Invitaciones por correo con enlace de aceptación
- Tareas tipo Gantt: crear/editar/eliminar, arrastrar y redimensionar en el cronograma, progreso, dependencias (con flecha visual), responsable
- Tareas vencidas resaltadas, comentarios por tarea
- Notificaciones por correo: tarea asignada, tarea creada (al propietario), próxima a vencer (`php artisan app:send-task-due-reminders`, programado a diario)
- Mi perfil (editar datos, cambiar contraseña) y administración de usuarios (solo admins)

## Despliegue con Docker / Dokploy

El repo incluye `docker-compose.yml` en la raíz con 3 servicios: `postgres`, `backend` (Laravel servido por nginx + PHP-FPM en un mismo contenedor) y `frontend` (build estático de React servido por nginx, que además reenvía `/api/*` internamente al backend — así el navegador solo habla con un origen).

1. Copia `.env.example` a `.env` en la raíz y completa al menos `APP_KEY` y `DB_PASSWORD`.
   - Genera `APP_KEY` con: `php artisan key:generate --show` (requiere PHP local) o corriendo ese comando dentro del contenedor `backend` ya desplegado.
2. Define `APP_URL` y `FRONTEND_URL` con el dominio final (ambos deben apuntar al mismo dominio, ya que el frontend sirve todo).
3. En Dokploy, crea la aplicación apuntando a este repositorio (`https://github.com/sapinedal/gant.git`) usando el tipo **Docker Compose**, y carga las mismas variables del `.env` en la sección de variables de entorno de Dokploy.
4. Dokploy construirá las 3 imágenes y expondrá el puerto interno `80` del servicio `frontend` (mapeado a `HTTP_PORT`, 8080 por defecto) — configura ahí el dominio/proxy de Dokploy.

Las migraciones corren automáticamente al iniciar el contenedor `backend` (ver `backend/docker/entrypoint.sh`).

Como el repositorio es público, Dokploy puede clonarlo por HTTPS sin necesitar una llave SSH de despliegue.
