# 🗄️ Checklist de Base de Datos para Producción - OMKO

**Estado Actual:** Pre-producción local
**Base de Datos:** omko_pre_production
**Usuario:** root
**Host:** localhost:3306

---

## 📊 Estadísticas de Base de Datos

### Tablas Principales (Total: 75 tablas)
| Tabla | Registros | Tamaño |
|-------|-----------|--------|
| appointments | 600 | 0.13 MB |
| assigned_outdoor_facilities | 360 | 0.05 MB |
| payment_transactions | 300 | 0.14 MB |
| review_ratings | 250 | 0.13 MB |
| assign_parameters | 208 | 0.06 MB |
| newsletter_subscriptions | 150 | 0.25 MB |
| settings | 85 | 0.02 MB |
| personal_access_tokens | 53 | 0.05 MB |
| propertys | 51 | 0.03 MB |

### Datos Críticos
- ✅ **Usuarios:** 1 (admin@omko.do)
- ✅ **Propiedades:** 51
- ✅ **Proyectos:** 0
- ✅ **Citas:** 600
- ✅ **Transacciones de Pago:** 300
- ✅ **Configuraciones:** 85 registros

---

## 🔧 Tareas de Preparación para Producción

### 1. Limpieza de Datos de Prueba
- [ ] Revisar y limpiar datos de prueba innecesarios
- [ ] Verificar que `settings` contiene valores válidos
- [ ] Revisar tabla `telescope_entries` (debugging - debe estar limpia en producción)
- [ ] Vaciar `failed_jobs` si hay registros obsoletos
- [ ] Limpiar `personal_access_tokens` expirados

**Comandos:**
```sql
-- Limpiar tokens de acceso personal
DELETE FROM personal_access_tokens WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Vaciar trabajos fallidos
DELETE FROM failed_jobs;

-- Limpiar Telescope (solo si está en modo debug)
DELETE FROM telescope_entries WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
DELETE FROM telescope_entries_tags;
DELETE FROM telescope_monitoring;
```

### 2. Optimización de Base de Datos
- [ ] Ejecutar `OPTIMIZE TABLE` en todas las tablas
- [ ] Verificar índices en tablas con muchos registros
- [ ] Analizar estadísticas de tablas

**Comandos:**
```sql
-- Optimizar todas las tablas
OPTIMIZE TABLE appointments, propertys, users, payment_transactions;

-- Analizar estadísticas
ANALYZE TABLE appointments, propertys, users, payment_transactions;
```

### 3. Seguridad y Permisos
- [ ] Verificar usuario root - cambiar contraseña en producción
- [ ] Crear usuario específico para aplicación (no usar root)
- [ ] Establecer permisos correctos en Hostinger

**Comando para Hostinger:**
```sql
-- Crear usuario específico para OMKO
CREATE USER 'omko_user'@'localhost' IDENTIFIED BY 'contraseña_fuerte_generada';
GRANT ALL PRIVILEGES ON omko_production.* TO 'omko_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configuración de Collation
- [ ] Verificar que todas las tablas usan `utf8mb4_unicode_ci`
- [ ] Actualizar collation si es necesario

```sql
-- Ver collation actual
SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'omko_pre_production';

-- Actualizar si es necesario
ALTER DATABASE omko_pre_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Migraciones y Esquema
- [ ] Verificar que todas las migraciones están ejecutadas
- [ ] Confirmar que tabla `migrations` tiene todos los registros

```sql
-- Ver migraciones ejecutadas
SELECT * FROM migrations ORDER BY batch DESC;
```

### 6. Integridad Referencial
- [ ] Verificar relaciones Foreign Key
- [ ] Limpiar huérfanos si existen

```sql
-- Buscar registros huérfanos en appointments
SELECT a.* FROM appointments a 
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = a.user_id);

-- Buscar propiedades sin categoría válida
SELECT p.* FROM propertys p 
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id);
```

### 7. Backup y Recuperación
- [ ] Crear backup completo antes de pasar a producción
- [ ] Guardar SQL en versión control o almacenamiento seguro
- [ ] Documentar proceso de recuperación

**Comando para crear backup:**
```bash
# Opción 1: Backup simple
mysqldump -u root -p omko_pre_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Opción 2: Backup con compresión
mysqldump -u root -p omko_pre_production | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 8. Configuración en .env Producción
- [ ] Cambiar `APP_ENV=production`
- [ ] Cambiar `APP_DEBUG=false`
- [ ] Actualizar `DB_HOST` (IP del servidor MySQL en Hostinger)
- [ ] Actualizar `DB_DATABASE=omko_production` (nombre final)
- [ ] Actualizar `DB_USERNAME` y `DB_PASSWORD` (usuario específico)
- [ ] Configurar `FORCE_HTTPS=true`

```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=servidor.hostinger.com  # o IP local si en mismo servidor
DB_DATABASE=omko_production
DB_USERNAME=omko_user
DB_PASSWORD=contraseña_fuerte
FORCE_HTTPS=true
```

### 9. Monitoreo y Logs
- [ ] Configurar rotación de logs
- [ ] Establecer alertas para tabla `failed_jobs`
- [ ] Revisar `storage/logs` regularmente

---

## ✅ Checklist Final Pre-Producción

- [ ] Backup completado y verificado
- [ ] Datos de prueba limpiados
- [ ] Índices optimizados
- [ ] Usuario específico creado en MySQL
- [ ] Migraciones verificadas
- [ ] Integridad referencial validada
- [ ] .env producción configurado
- [ ] Certificados SSL configurados
- [ ] Document Root correctamente establecido en Hostinger
- [ ] URLs del frontend actualizadas
- [ ] CORS configurado correctamente
- [ ] Logs monitoreados

---

## 🚀 Pasos Finales

1. **Hacer backup final de base de datos actual**
2. **Actualizar nombre BD en Hostinger** (crear `omko_production`)
3. **Importar backup en servidor Hostinger**
4. **Cambiar credenciales en .env producción**
5. **Ejecutar migraciones en Hostinger** (si es necesario)
6. **Probar conectividad** desde frontend
7. **Monitorear logs iniciales**

---

## 📝 Notas Importantes

- La base de datos actual está bien estructurada con 75 tablas
- Hay 600 citas de prueba que se pueden mantener o limpiar según necesidad
- Los indices en tabla `users` necesitan ser verificados en Hostinger
- El usuario actual es `root` con contraseña simple - **CAMBIAR EN PRODUCCIÓN**
- Se necesita verificar `FOREIGN KEYS` si está habilitado

