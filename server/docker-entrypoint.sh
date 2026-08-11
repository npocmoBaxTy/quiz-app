#!/bin/sh
# Применяет миграции перед стартом приложения.
# Отключается переменной RUN_MIGRATIONS=false — например, если миграции
# накатываются отдельным шагом в CI.
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  # prisma.config.ts берёт для CLI прямое подключение: через пулер
  # (pgbouncer) migrate deploy зависает.
  if [ -z "$DIRECT_URL" ]; then
    echo "DIRECT_URL не задан — миграции применить нельзя." >&2
    echo "Задайте DIRECT_URL или отключите шаг через RUN_MIGRATIONS=false." >&2
    exit 1
  fi

  echo "Applying database migrations..."
  npx prisma migrate deploy
fi

exec "$@"
