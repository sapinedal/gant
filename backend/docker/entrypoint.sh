#!/bin/sh
set -e

# Espera a que la base de datos esté disponible antes de migrar.
if [ -n "$DB_HOST" ]; then
  echo "Esperando la base de datos en $DB_HOST:${DB_PORT:-5432}..."
  for i in $(seq 1 30); do
    if php -r "exit(@fsockopen(getenv('DB_HOST'), getenv('DB_PORT') ?: 5432) ? 0 : 1);"; then
      break
    fi
    sleep 2
  done
fi

php artisan config:clear
php artisan migrate --force

exec "$@"
