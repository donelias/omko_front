#!/bin/bash

# 🔍 VERIFICACIÓN CONECTIVIDAD FRONTEND-BACKEND - OMKO Real Estate
echo "🔗 ANALIZANDO CONECTIVIDAD FRONTEND ↔ BACKEND"
echo "=============================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 1. ANÁLISIS DEL FRONTEND${NC}"
echo "----------------------------------------"

# Verificar si es sitio estático
echo -n "📱 Tipo de frontend: "
if [ -d "/Users/mac/Documents/Omko/omko/En produccion/realestate/_next" ]; then
    echo -e "${YELLOW}Next.js Static Export (SSG)${NC}"
    echo "   ℹ️  Sitio web estático generado, no hace llamadas API en tiempo real"
else
    echo -e "${RED}No identificado${NC}"
fi

# Buscar configuraciones de API
echo -n "🔧 Configuración API: "
if ls "/Users/mac/Documents/Omko/omko/En produccion/realestate/"*.js >/dev/null 2>&1; then
    echo -e "${GREEN}Archivos JS encontrados${NC}"
    
    # Buscar URLs de API en archivos JS
    echo "   🔍 Buscando URLs de API..."
    if grep -r "localhost\|127.0.0.1\|api\." "/Users/mac/Documents/Omko/omko/En produccion/realestate/" 2>/dev/null | head -3; then
        echo "   ✅ Referencias encontradas"
    else
        echo "   ⚠️  No se encontraron URLs de API explícitas"
    fi
else
    echo -e "${RED}No encontrados${NC}"
fi

echo -e "\n${BLUE}🔍 2. ANÁLISIS DEL BACKEND${NC}"
echo "----------------------------------------"

# Verificar Laravel backend
echo -n "⚙️  Backend Laravel: "
if [ -f "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin/artisan" ]; then
    echo -e "${GREEN}✅ Detectado${NC}"
    
    # Verificar configuración de CORS
    echo -n "🔒 CORS configurado: "
    if grep -q "allowed_origins.*\*" "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin/config/cors.php" 2>/dev/null; then
        echo -e "${GREEN}✅ Permitido para todos los orígenes${NC}"
    else
        echo -e "${YELLOW}⚠️  Configuración personalizada${NC}"
    fi
    
    # Verificar rutas API
    echo -n "🛣️  Rutas API: "
    if [ -f "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin/routes/api.php" ]; then
        route_count=$(grep -c "Route::" "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin/routes/api.php" 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ $route_count rutas definidas${NC}"
    else
        echo -e "${RED}❌ Archivo no encontrado${NC}"
    fi
else
    echo -e "${RED}❌ No encontrado${NC}"
fi

echo -e "\n${BLUE}🔍 3. VERIFICACIÓN DE CONECTIVIDAD${NC}"
echo "----------------------------------------"

# Verificar si el backend está corriendo
echo -n "🚀 Backend activo: "
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/api/get_system_settings" 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Respondiendo en localhost:8000${NC}"
elif curl -s -o /dev/null -w "%{http_code}" "http://localhost/api/get_system_settings" 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Respondiendo en localhost${NC}"
else
    echo -e "${RED}❌ No responde (backend no está corriendo)${NC}"
fi

# Verificar frontend
echo -n "🌐 Frontend accesible: "
if curl -s -o /dev/null -w "%{http_code}" "https://realestate.omko.do" | grep -q "200"; then
    echo -e "${GREEN}✅ https://realestate.omko.do${NC}"
else
    echo -e "${RED}❌ No accesible${NC}"
fi

echo -e "\n${BLUE}🔍 4. ANÁLISIS DE ARQUITECTURA${NC}"
echo "----------------------------------------"

echo "📊 Arquitectura detectada:"
echo "   ┌─ Frontend: Next.js Static (realestate.omko.do)"
echo "   └─ Backend: Laravel API (real_estate_admin/)"
echo ""
echo "🔄 Flujo de datos:"
echo "   1. Frontend es sitio estático (pre-generado)"
echo "   2. Datos cargados en tiempo de build o via JavaScript"
echo "   3. Backend expone API REST en /api/*"
echo ""

echo -e "\n${YELLOW}📋 RESUMEN DE CONECTIVIDAD${NC}"
echo "=============================================="

# Determinar estado de conexión
if [ -f "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin/artisan" ]; then
    if [ -d "/Users/mac/Documents/Omko/omko/En produccion/realestate/_next" ]; then
        echo -e "Estado: ${YELLOW}⚠️  CONFIGURADO PERO DESCONECTADO${NC}"
        echo ""
        echo "💡 Para conectar frontend y backend:"
        echo "   1. Iniciar backend Laravel: cd real_estate_admin && php artisan serve"
        echo "   2. Verificar URLs de API en el código JavaScript del frontend"
        echo "   3. Configurar CORS para permitir realestate.omko.do"
        echo "   4. Actualizar URLs de API de localhost a dominio de producción"
    else
        echo -e "Estado: ${RED}❌ FRONTEND NO IDENTIFICADO${NC}"
    fi
else
    echo -e "Estado: ${RED}❌ BACKEND NO ENCONTRADO${NC}"
fi

echo ""
echo -e "${BLUE}🔧 PRÓXIMOS PASOS RECOMENDADOS${NC}"
echo "1. Iniciar backend Laravel para testing"
echo "2. Revisar configuración de API URLs en frontend"
echo "3. Configurar CORS específico para producción"
echo "4. Verificar rutas API funcionando"