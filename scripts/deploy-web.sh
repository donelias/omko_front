#!/usr/bin/env bash
# Deploy del frontend (Omko-Web) en el VPS.
#
# Uso:  ./scripts/deploy-web.sh [rama]
#
# Orden obligatorio: git pull -> validacion de entorno -> build -> pm2 restart.
# El build de Next.js hornea NEXT_PUBLIC_* en el bundle, asi que un .env de
# desarrollo en el servidor genera un frontend que llama a 127.0.0.1 y falla
# con 500 en el navegador del usuario. next.config.js aborta el build en ese
# caso; este script lo adelanta para dar un mensaje claro y no dejar el proceso
# a mitad de camino.
set -euo pipefail

BRANCH="${1:-v1.6.0}"
APP_DIR="${APP_DIR:-/var/www/omko_front}"
PM2_APP="${PM2_APP:-omko-web}"
EXPECTED_API_URL="${EXPECTED_API_URL:-https://adminrealestate.omko.do}"

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$1"; }
die() { printf '\033[1;31m[deploy] ERROR:\033[0m %s\n' "$1" >&2; exit 1; }

cd "$APP_DIR" || die "no existe $APP_DIR"

log "1/5 Actualizando codigo ($BRANCH)"
git fetch origin "$BRANCH" --quiet
git checkout "$BRANCH" --quiet
git pull origin "$BRANCH" --quiet
log "    HEAD: $(git log --oneline -1)"

# El .env de desarrollo nunca debe pisar la configuracion de produccion.
if [ -f .env.production ]; then
  log "2/5 .env.production presente (sobrescribe .env)"
else
  log "2/5 Creando .env.production"
  printf 'NEXT_PUBLIC_API_URL="%s"\n' "$EXPECTED_API_URL" > .env.production
  chmod 600 .env.production
fi

ACTUAL_API_URL="$(grep -E '^NEXT_PUBLIC_API_URL=' .env.production | head -1 | cut -d'"' -f2 || true)"
[ "$ACTUAL_API_URL" = "$EXPECTED_API_URL" ] \
  || die "NEXT_PUBLIC_API_URL='$ACTUAL_API_URL' en .env.production, se esperaba '$EXPECTED_API_URL'"
log "    API: $ACTUAL_API_URL"

log "3/5 Limpiando .next"
rm -rf .next

log "4/5 Compilando (NODE_ENV=production)"
NODE_ENV=production npm run build

grep -qF "$EXPECTED_API_URL" .next/static -r \
  || die "el bundle no contiene $EXPECTED_API_URL: revisa el .env antes de publicar"
log "    Bundle verificado: contiene $EXPECTED_API_URL"

log "5/5 Reiniciando pm2 ($PM2_APP)"
pm2 restart "$PM2_APP" --update-env
sleep 5
pm2 list | grep -q "$PM2_APP" || die "pm2 no reporta $PM2_APP online"

log "Deploy completado. HEAD: $(git log --oneline -1)"