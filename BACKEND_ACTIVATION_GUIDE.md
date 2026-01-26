# 🚀 Guía de Activación Backend OMKO

## 📋 Paso 1: Iniciar Backend Laravel

```bash
cd "/Users/mac/Documents/Omko/omko/En produccion/real_estate_admin"

# Verificar dependencias
composer install

# Configurar base de datos
php artisan migrate

# Iniciar servidor
php artisan serve --host=0.0.0.0 --port=8000
```

## 📡 Paso 2: Verificar Conectividad

```bash
# Verificar que el backend responde
curl http://localhost:8000/api/health
curl http://localhost:8000/api/properties
```

## 🔧 Paso 3: Configuración de Producción

### Actualizar URLs en Frontend
Los archivos del frontend deben apuntar a la URL de producción del backend:
- Cambiar `localhost:8000` por la URL real del servidor de producción
- Verificar configuración de API en archivos JavaScript

### Configurar CORS específico
En `config/cors.php`:
```php
'allowed_origins' => [
    'https://realestate.omko.do',
    // otras URLs permitidas
],
```

## 🔄 Próximos Pasos
1. **Inmediato**: Iniciar backend para testing local
2. **Producción**: Desplegar backend en servidor web
3. **Configuración**: Actualizar URLs en frontend
4. **Testing**: Verificar funcionamiento end-to-end

## 🛠️ Resolución de Problemas Comunes

### Backend no inicia
```bash
# Verificar PHP
php -v

# Verificar permisos
chmod -R 755 storage/ bootstrap/cache/

# Limpiar caché
php artisan cache:clear
php artisan config:clear
```

### Errores CORS
- Verificar configuración en `config/cors.php`
- Asegurar que el dominio frontend esté permitido
- Revisar headers de respuesta

### Base de Datos
```bash
# Verificar conexión BD
php artisan tinker
# > DB::connection()->getPdo();
```

---
**Estado Actual**: Backend configurado ✅ | Ejecutándose ❌ | Frontend conectado ⚠️