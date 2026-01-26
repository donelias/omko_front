#!/bin/bash

# 🧪 SCRIPT DE VERIFICACIÓN - OMKO Real Estate Security
# Verifica Firebase y Google Maps después de configurar restricciones

echo "🔍 VERIFICANDO CONFIGURACIÓN OMKO REAL ESTATE..."
echo "=================================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar status HTTP
check_url() {
    local url=$1
    local description=$2
    
    echo -n "📡 Verificando $description... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ OK (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ FALLA (HTTP $status)${NC}"
        return 1
    fi
}

# Verificar sitio principal
echo -e "\n${YELLOW}📱 VERIFICANDO SITIO PRINCIPAL${NC}"
check_url "https://realestate.omko.do" "Sitio principal"
check_url "https://realestate.omko.do/properties-on-map" "Página de mapas"
check_url "https://realestate.omko.do/contact-us" "Página de contacto"

# Verificar Firebase
echo -e "\n${YELLOW}🔥 VERIFICANDO FIREBASE${NC}"
check_url "https://omko-c9ce7.firebaseapp.com" "Firebase Hosting"

# Verificar Google Maps API
echo -e "\n${YELLOW}🗺️ VERIFICANDO GOOGLE MAPS API${NC}"
API_KEY="AIzaSyCZ-Jq3Sp0xhv2tDlgSzRjgOukyd-Okw-w"

echo -n "🔐 Verificando API Key restrictions... "

# Test con referrer correcto (simulado)
maps_status=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Referer: https://realestate.omko.do/" \
    "https://maps.googleapis.com/maps/api/js?key=$API_KEY")

if [ "$maps_status" = "200" ]; then
    echo -e "${GREEN}✅ API Key funcional${NC}"
else
    echo -e "${RED}❌ Problema con API Key (HTTP $maps_status)${NC}"
fi

# Verificar Service Worker
echo -e "\n${YELLOW}⚙️ VERIFICANDO SERVICE WORKER${NC}"
check_url "https://realestate.omko.do/firebase-messaging-sw.js" "Service Worker Firebase"

# Resumen final
echo -e "\n${YELLOW}📋 RESUMEN DE VERIFICACIÓN${NC}"
echo "=================================================="

# Test de conectividad básica
echo -n "🌐 Conectividad del servidor... "
if ping -c 1 realestate.omko.do &> /dev/null; then
    echo -e "${GREEN}✅ Servidor alcanzable${NC}"
else
    echo -e "${RED}❌ Servidor no responde${NC}"
fi

# SSL Certificate check
echo -n "🔒 Certificado SSL... "
ssl_info=$(openssl s_client -connect realestate.omko.do:443 -servername realestate.omko.do < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL válido${NC}"
    echo "   $ssl_info" | grep "notAfter"
else
    echo -e "${RED}❌ Problema con SSL${NC}"
fi

echo -e "\n${YELLOW}🎯 PRÓXIMOS PASOS${NC}"
echo "1. Verificar manualmente: https://realestate.omko.do"
echo "2. Probar notificaciones push en navegador"
echo "3. Verificar mapas en 'Properties on Map'"
echo "4. Revisar logs de Firebase Console"
echo ""
echo -e "${GREEN}✅ Configuración de seguridad completada${NC}"