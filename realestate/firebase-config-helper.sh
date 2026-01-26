#!/bin/bash

echo "🔥 OMKO Real Estate - Configurador Firebase"
echo "============================================"
echo ""

# Función para validar configuración
validate_config() {
    local config="$1"
    if [[ $config == *"xxxxx"* ]]; then
        echo "❌ Error: Configuración contiene valores de ejemplo (xxxxx)"
        return 1
    fi
    
    if [[ $config == *"AIzaSy"* ]] && [[ $config == *".firebaseapp.com"* ]]; then
        echo "✅ Configuración parece válida"
        return 0
    else
        echo "❌ Error: Configuración no parece válida"
        return 1
    fi
}

# Menú principal
echo "¿Ya tienes un proyecto Firebase configurado?"
echo "1) SÍ - Tengo la configuración lista"
echo "2) NO - Necesito crear/configurar el proyecto"
echo "3) AYUDA - Mostrar guía paso a paso"
echo ""
read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        echo ""
        echo "📋 CONFIGURACIÓN FIREBASE"
        echo "Necesito que proporciones la configuración de Firebase."
        echo "Debe verse algo así:"
        echo ""
        echo "const firebaseConfig = {"
        echo '  apiKey: "AIzaSyC_tu_api_key_real",'
        echo '  authDomain: "tu-proyecto.firebaseapp.com",'
        echo '  projectId: "tu-proyecto-id",'
        echo '  storageBucket: "tu-proyecto.appspot.com",'
        echo '  messagingSenderId: "123456789",'
        echo '  appId: "1:123456789:web:abc123",'
        echo '  measurementId: "G-XXXXXXXX"'
        echo "};"
        echo ""
        echo "💡 Puedes obtenerla en:"
        echo "   Firebase Console → Tu Proyecto → ⚙️ Configuración → General → Tu app web"
        echo ""
        read -p "¿Tienes la configuración lista? (y/n): " ready
        
        if [[ $ready == "y" ]] || [[ $ready == "Y" ]]; then
            echo ""
            echo "📝 Por favor, proporciona tu configuración Firebase:"
            echo "   (Pega toda la configuración aquí y presiona Enter dos veces)"
            echo ""
        else
            echo "⏭️  Primero configura Firebase siguiendo la guía FIREBASE_SETUP_GUIDE.md"
        fi
        ;;
    
    2)
        echo ""
        echo "🚀 CREANDO PROYECTO FIREBASE"
        echo ""
        echo "Sigue estos pasos:"
        echo ""
        echo "1️⃣ Ir a: https://console.firebase.google.com/"
        echo ""
        echo "2️⃣ Crear proyecto:"
        echo "   - Nombre: 'omko-real-estate' o similar"
        echo "   - Habilitar Analytics: SÍ"
        echo ""
        echo "3️⃣ Agregar app web:"
        echo "   - Nombre: 'OMKO Real Estate Web'"
        echo "   - Dominio: realestate.omko.do"
        echo ""
        echo "4️⃣ Configurar servicios:"
        echo "   - Authentication → Authorized domains → Agregar: realestate.omko.do"
        echo "   - Cloud Messaging → Web configuration → Agregar dominio"
        echo ""
        echo "5️⃣ Volver a ejecutar este script con opción 1"
        echo ""
        echo "🔗 Abriendo Firebase Console..."
        
        # Abrir Firebase Console
        if command -v open &> /dev/null; then
            open "https://console.firebase.google.com/"
        else
            echo "Visita manualmente: https://console.firebase.google.com/"
        fi
        ;;
        
    3)
        echo ""
        echo "📖 GUÍA COMPLETA"
        echo ""
        echo "Lee el archivo: FIREBASE_SETUP_GUIDE.md"
        echo "Contiene instrucciones detalladas paso a paso."
        echo ""
        
        if [[ -f "FIREBASE_SETUP_GUIDE.md" ]]; then
            echo "📄 Abriendo guía..."
            if command -v code &> /dev/null; then
                code FIREBASE_SETUP_GUIDE.md
            elif command -v cat &> /dev/null; then
                echo "==========================================="
                cat FIREBASE_SETUP_GUIDE.md
                echo "==========================================="
            fi
        else
            echo "❌ No se encontró el archivo de guía."
        fi
        ;;
        
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "💡 RECORDATORIO IMPORTANTE:"
echo "   Después de configurar Firebase, actualiza estos archivos:"
echo "   - firebase-messaging-sw.js (configuración principal)"
echo "   - Verifica dominios autorizados: realestate.omko.do"
echo ""