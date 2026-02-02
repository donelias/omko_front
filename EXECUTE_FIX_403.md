# 🚀 EJECUTAR FIX 403 EN HOSTINGER

## Opción 1: Desde SSH (RECOMENDADO - 2 minutos)

```bash
# 1. Conectarse a Hostinger
ssh -p 2222 usuario@host

# 2. Navegar a carpeta admin
cd /home/usuario/admin.omko.do

# 3. Ejecutar script
bash fix_403.sh

# 4. Ver resultado
# Verás mensajes en verde indicando qué se corrigió
```

---

## Opción 2: Ejecutar comandos manualmente

Si SSH no funciona bien, ejecuta estos comandos uno por uno:

```bash
cd /home/usuario/admin.omko.do

# Permisos de carpetas
chmod -R 755 app bootstrap config database public resources routes storage vendor

# Permisos de archivos
chmod 644 .env artisan composer.json composer.lock public/.htaccess public/index.php

# Storage especial
chmod -R 777 storage/logs storage/framework

# Limpiar caché
rm -rf bootstrap/cache/*

# Verificar .htaccess
ls -la public/.htaccess
cat public/.htaccess
```

---

## Opción 3: Por cPanel File Manager

Si no tienes SSH:

1. cPanel → **File Manager**
2. Navega a `/home/usuario/admin.omko.do/public`
3. Busca `.htaccess`
4. Click derecho → **Change Permissions**
5. Cambia a: `644`

Repite para:
- `/home/usuario/admin.omko.do` → `755`
- `public/` → `755`
- `storage/` → `777`
- `bootstrap/cache/` → `777`

---

## ✅ DESPUÉS DE EJECUTAR

1. **Hard refresh en navegador:**
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + F5
   - O: `Ctrl + Shift + Del` para limpiar caché

2. **Intenta acceder a:**
   - https://admin.omko.do
   - https://admin.omko.do/admin/ad-banners

3. **Si sigue 403:**
   - Verifica en cPanel que Document Root sea: `/home/usuario/admin.omko.do/public`
   - Contacta Hostinger para verificar mod_rewrite está habilitado

---

## 🔍 VERIFICAR QUE FUNCIONÓ

Conectarse por SSH y ejecutar:

```bash
cd /home/usuario/admin.omko.do

# Verificar permisos
ls -la | head -20
# Debe mostrar: drwxr-xr-x

ls -la public/ | head -10
# Debe mostrar: -rw-r--r-- para .htaccess e index.php

# Verificar .htaccess contiene RewriteEngine
cat public/.htaccess | grep RewriteEngine
# Debe mostrar: RewriteEngine On
```

---

## 📊 ESTADO ESPERADO

Después de ejecutar `bash fix_403.sh`, verás:

```
🔧 CORRIGIENDO ERROR 403 EN HOSTINGER
====================================
1. Corrigiendo permisos de carpetas...
✅ Carpetas: 755

2. Corrigiendo permisos de archivos
✅ Archivos: 644

3. Permisos especiales para storage
✅ Storage: 777

4. Verificar .htaccess en public/...
✅ .htaccess existe

5. Verificar index.php en public/...
✅ index.php existe

6. Limpiar caché de Laravel...
✅ Caché limpiado

================================
✅ SCRIPT COMPLETADO
================================

Próximos pasos:
1. Recarga la página (Cmd+Shift+R)
2. Si sigue error 403:
   - Verifica Document Root...
```

---

## 🎯 SI NO FUNCIONA

**Problema 1: Permission denied al conectar SSH**
- Verifica que SSH está habilitado en cPanel
- Verifica puerto (típicamente 2222)
- Contacta Hostinger

**Problema 2: Comando no encontrado "bash"**
- Usa: `sh fix_403.sh` en lugar de `bash fix_403.sh`

**Problema 3: Sigue error 403 después**
- Contacta Hostinger: "Document Root apunta a `/public` pero sigue 403"
- Verifica que mod_rewrite está habilitado
- Prueba crear un `test.php` en public/ para verificar PHP funciona

---

**Tiempo estimado: 2-5 minutos** ⏱️

