#!/bin/bash

echo "🚀 INICIANDO CORRECCIÓN DE URLs PARA PRODUCCIÓN"
echo "Dominio objetivo: https://realestate.omko.do/"
echo "=============================================="

# Contador de archivos modificados
count=0

echo "📝 Actualizando archivos HTML..."
# Buscar y reemplazar en archivos HTML
find . -name "*.html" -type f | while read file; do
    if grep -q "http://localhost:3000" "$file"; then
        sed -i '' 's|http://localhost:3000|https://realestate.omko.do|g' "$file"
        echo "✅ Actualizado: $file"
        ((count++))
    fi
done

echo "📝 Actualizando archivos XML..."
# Buscar y reemplazar en archivos XML
find . -name "*.xml" -type f | while read file; do
    if grep -q "http://localhost:3000" "$file"; then
        sed -i '' 's|http://localhost:3000|https://realestate.omko.do|g' "$file"
        echo "✅ Actualizado: $file"
        ((count++))
    fi
done

echo "📝 Actualizando archivos JavaScript..."
# Buscar y reemplazar en archivos JS (cuidadosamente)
find . -name "*.js" -type f | while read file; do
    if grep -q "http://localhost:3000" "$file"; then
        sed -i '' 's|http://localhost:3000|https://realestate.omko.do|g' "$file"
        echo "✅ Actualizado: $file"
        ((count++))
    fi
done

echo "🧹 LIMPIEZA DE ARCHIVOS DUPLICADOS"
echo "=================================="

echo "🗑️  Eliminando carpetas duplicadas (1)..."
# Eliminar carpetas duplicadas con (1)
find . -type d -name "*\(1\)" | while read dir; do
    echo "🗑️  Eliminando: $dir"
    rm -rf "$dir"
done

echo "🗑️  Eliminando archivos ZIP de respaldo..."
# Eliminar archivos ZIP de la raíz
rm -f *.zip
rm -f out*.zip

echo "✅ PROCESO COMPLETADO"
echo "===================="
echo "🎉 Todos los archivos han sido actualizados a https://realestate.omko.do/"
echo "🧹 Archivos duplicados eliminados"
echo "📋 Revisa el archivo firebase-messaging-sw.js manualmente"
echo ""
echo "⚠️  SIGUIENTE PASO: Actualiza la configuración de Firebase"