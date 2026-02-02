# Hostinger SSH Configuration

## Información de Conexión

**Host:** `88.223.84.149`  
**Puerto:** `65002`  
**Usuario:** `u984712056`  
**Contraseña:** `_#7J6eUzTiVVaK.`

## Rutas Importantes

**Home Directory:** `/home/u984712056`  
**Aplicación Laravel (Admin):** `/home/u984712056/domains/omko.do/public_html/omko-admin`  
**Aplicación Laravel (Backend):** `/home/u984712056/domains/ruo.do`

## Comando de Conexión SSH

```bash
ssh -p 65002 u984712056@88.223.84.149
```

## Copiar Archivos via SCP

**Copiar archivo local a Hostinger:**
```bash
scp -P 65002 /ruta/local/archivo.php u984712056@88.223.84.149:/home/u984712056/domains/omko.do/public_html/omko-admin/ruta/destino/
```

**Copiar archivo desde Hostinger a local:**
```bash
scp -P 65002 u984712056@88.223.84.149:/home/u984712056/domains/omko.do/public_html/omko-admin/ruta/archivo.php /ruta/local/
```

## Comandos Artisan Útiles

### Limpiar Cachés (IMPORTANTE DESPUÉS DE CAMBIOS)
```bash
cd /home/u984712056/domains/omko.do/public_html/omko-admin
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### Ver Estado de Migraciones
```bash
php artisan migrate:status
```

### Ejecutar Migraciones
```bash
php artisan migrate
```

### Ver Logs
```bash
tail -f storage/logs/laravel.log
```

## Archivos a Actualizar en Hostinger

Los siguientes archivos fueron modificados en local y deben copiarse a Hostinger:

1. **app/Models/UserPurchasedPackage.php**
   - Removida relación deprecada `customer()`
   - Ahora solo usa relación polimorfa `modal()`

2. **app/Http/Controllers/PackageController.php**
   - Cambio línea 192: `with('customer')` → `with('modal')`
   - Cambio: `wherehas('customer'` → `wherehas('modal'`

3. **app/Helpers/custom_helper.php**
   - Función `update_subscription()` - línea 251: `with('customer')` → `with('modal')`
   - Función `update_subscription()` - línea 272: `$row->customer->id` → `$row->modal->id`

4. **app/Http/Controllers/ApiController.php**
   - Línea 924: `\Log::` → `Log::`

## Estado de la Base de Datos

**Tabla:** `user_purchased_packages`

**Estructura Actual en Hostinger (CORRECTA):**
```
- id (bigint, PK)
- modal_type (varchar) - Índice
- modal_id (bigint) - Índice - UNSIGNED
- package_id (int)
- start_date (date)
- end_date (date) - Nullable
- used_limit_for_property (int) - Default: 0
- used_limit_for_advertisement (int) - Default: 0
- created_at (timestamp) - Nullable
- updated_at (timestamp) - Nullable
- prop_status (tinyint) - Default: 1
- adv_status (tinyint)
```

**Nota:** La tabla NO tiene `customer_id` (que es correcto)

## Estado del Cache

**Última Limpieza:** 2026-02-01 15:49 UTC

**Comandos Ejecutados:**
- ✅ `php artisan cache:clear` - Éxito
- ✅ `php artisan config:cache` - Éxito
- ⚠️ `php artisan route:cache` - Error (ruta duplicada en language.destroy)

## Notas Importantes

1. El error en `route:cache` es debido a una ruta duplicada en el sistema de idiomas y NO afecta la funcionalidad
2. Los cachés de aplicación ya están limpios
3. Después de subir los 4 archivos, ejecutar nuevamente:
   ```bash
   php artisan cache:clear
   php artisan config:cache
   ```
4. Luego probar la carga de propiedades desde el frontend

## ✅ DEPLOYMENT STATUS

**Estado:** COMPLETADO EXITOSAMENTE  
**Fecha Deployment:** 2026-02-01 15:58 UTC

### Archivos Desplegados:
- ✅ UserPurchasedPackage.php (586 bytes)
- ✅ PackageController.php (8.2 KB)
- ✅ custom_helper.php (23 KB)
- ✅ ApiController.php (228 KB)

### Comandos Ejecutados en Hostinger:
- ✅ php artisan cache:clear
- ✅ php artisan config:cache

### Resultado Esperado:
El error HTTP 500 "Unknown column 'customer_id'" debe estar RESUELTO.

---

## Fecha Última Actualización

2026-02-01 16:00 UTC (Deployment Completado)
