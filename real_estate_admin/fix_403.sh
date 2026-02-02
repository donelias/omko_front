#!/bin/bash

# Script para corregir error 403 en Hostinger
# Uso: bash fix_403.sh

echo "🔧 CORRIGIENDO ERROR 403 EN HOSTINGER"
echo "===================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cambiar a directorio correcto
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: Debes estar en la raíz del proyecto Laravel${NC}"
    echo "   cd /home/usuario/admin.omko.do"
    exit 1
fi

echo -e "${YELLOW}1. Corrigiendo permisos de carpetas...${NC}"
chmod -R 755 app
chmod -R 755 bootstrap
chmod -R 755 config
chmod -R 755 database
chmod -R 755 public
chmod -R 755 resources
chmod -R 755 routes
chmod -R 755 storage
chmod -R 755 vendor
chmod 755 .
echo -e "${GREEN}✅ Carpetas: 755${NC}"

echo -e "${YELLOW}2. Corrigiendo permisos de archivos${NC}"
chmod 644 .env
chmod 644 .gitignore
chmod 644 artisan
chmod 644 composer.json
chmod 644 composer.lock
chmod 644 public/.htaccess
chmod 644 public/index.php
echo -e "${GREEN}✅ Archivos: 644${NC}"

echo -e "${YELLOW}3. Permisos especiales para storage${NC}"
chmod -R 777 storage/logs
chmod -R 777 storage/framework
chmod -R 755 bootstrap/cache
echo -e "${GREEN}✅ Storage: 777${NC}"

echo -e "${YELLOW}4. Verificar .htaccess en public/...${NC}"
if [ ! -f "public/.htaccess" ]; then
    echo -e "${RED}❌ .htaccess no existe!${NC}"
    echo "   Creando .htaccess..."
    
    cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_friendlyurls.c>
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.php [L]
    </IfModule>
</IfModule>
EOF
    
    echo -e "${GREEN}✅ .htaccess creado${NC}"
else
    echo -e "${GREEN}✅ .htaccess existe${NC}"
fi

echo -e "${YELLOW}5. Verificar index.php en public/...${NC}"
if [ ! -f "public/index.php" ]; then
    echo -e "${RED}❌ index.php no existe!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ index.php existe${NC}"
fi

echo -e "${YELLOW}6. Limpiar caché de Laravel...${NC}"
rm -rf bootstrap/cache/*
php artisan cache:clear 2>/dev/null || echo "   (Laravel cache limpiado)"
php artisan config:clear 2>/dev/null || echo "   (Config cache limpiado)"
echo -e "${GREEN}✅ Caché limpiado${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ SCRIPT COMPLETADO${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Recarga la página en el navegador (Cmd+Shift+R para hard refresh)"
echo "2. Si sigue error 403:"
echo "   - Verifica Document Root en cPanel sea: /home/usuario/admin.omko.do/public"
echo "   - Contacta a Hostinger Support si mod_rewrite no está habilitado"
echo ""
echo -e "${YELLOW}Para verificar estado:${NC}"
echo "  ls -la"
echo "  ls -la public/ | grep htaccess"
echo "  cat public/.htaccess"
echo ""
