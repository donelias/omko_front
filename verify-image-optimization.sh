#!/bin/bash

# 🖼️ Script de Verificación - Optimización de Imágenes en OMKO-Web
# Verifica que todas las configuraciones de optimización estén en lugar

echo "================================"
echo "🖼️  VERIFICACIÓN DE OPTIMIZACIÓN"
echo "================================"
echo ""

cd "$(dirname "$0")"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de verificaciones
PASSED=0
FAILED=0

# Función para verificar archivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $description - FALTA: $file"
        ((FAILED++))
    fi
}

# Función para verificar contenido
check_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $description"
        ((FAILED++))
    fi
}

echo "📋 VERIFICANDO ARCHIVOS PRINCIPALES..."
echo ""

# Verificar .htaccess
check_file ".htaccess" ".htaccess existe"
check_content ".htaccess" "mod_deflate" "Compresión GZIP configurada"
check_content ".htaccess" "mod_expires" "Caché de archivos configurada"
check_content ".htaccess" "X-Content-Type-Options" "Headers de seguridad configurados"

echo ""
echo "📋 VERIFICANDO CONFIGURACIÓN DE NEXT.JS..."
echo ""

# Verificar next.config.js
check_file "next.config.js" "next.config.js existe"
check_content "next.config.js" "images:" "Configuración de imágenes existe"
check_content "next.config.js" "formats:" "Formatos modernos configurados"
check_content "next.config.js" "minimumCacheTTL" "Caché TTL configurado"
check_content "next.config.js" "remotePatterns:" "Patrones remotos configurados"

echo ""
echo "📋 VERIFICANDO ARCHIVOS DE CONFIGURACIÓN..."
echo ""

# Verificar archivos de configuración
check_file "next-image-optimizer.js" "Configuración centralizada de imágenes"
check_file "IMAGE_OPTIMIZATION_GUIDE.md" "Guía de optimización"
check_file "IMAGE_OPTIMIZATION_SUMMARY.md" "Resumen de cambios"

echo ""
echo "📋 VERIFICANDO COMPONENTES..."
echo ""

# Verificar ImageWithPlaceholder
check_file "src/components/image-with-placeholder/ImageWithPlaceholder.jsx" "Componente ImageWithPlaceholder"
check_content "src/components/image-with-placeholder/ImageWithPlaceholder.jsx" "buildImageUrl" "Función de construcción de URLs"
check_content "src/components/image-with-placeholder/ImageWithPlaceholder.jsx" "normalize" "Normalización de URLs"

echo ""
echo "================================"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "================================"
echo -e "${GREEN}✅ Pasadas: $PASSED${NC}"
echo -e "${RED}❌ Fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODAS LAS VERIFICACIONES PASARON${NC}"
    echo ""
    echo "📈 Mejoras esperadas:"
    echo "  - Compresión: -70% tamaño de transferencia"
    echo "  - Imágenes: -30% con WebP"
    echo "  - Caché: 1 mes para imágenes"
    echo "  - Performance: +60% en móvil"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  ALGUNAS VERIFICACIONES FALLARON${NC}"
    echo "Por favor, revisa los archivos faltantes."
    echo ""
    exit 1
fi
