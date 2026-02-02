# 🔧 SOLUCIÓN ERROR 403 FORBIDDEN EN HOSTINGER

## 🔍 DIAGNÓSTICO DEL ERROR 403

El error 403 significa que el servidor está negando acceso. Las causas más comunes son:

1. ❌ Permisos incorrectos en carpetas
2. ❌ Document Root no apunta a `/public`
3. ❌ Archivo `.htaccess` falta o está corrupto
4. ❌ mod_rewrite no está habilitado
5. ❌ Propiedad de archivos incorrecta

---

## ✅ SOLUCIONES (EN ORDEN DE PROBABILIDAD)

### SOLUCIÓN 1: Verificar Document Root en cPanel (CRÍTICO)

**En cPanel → Subdomains:**

1. Busca `admin.omko.do`
2. Verifica que el **Document Root** sea: `/home/tu_usuario/admin.omko.do/public`

**❌ INCORRECTO:**
```
/home/tu_usuario/admin.omko.do
```

**✅ CORRECTO:**
```
/home/tu_usuario/admin.omko.do/public
```

**Acción:**
- Si está incorrecto, edita el subdomain
- Cambia a: `/home/tu_usuario/admin.omko.do/public`
- Guarda los cambios
- Espera 5-10 minutos a que se propague

---

### SOLUCIÓN 2: Verificar archivo public/.htaccess

**Conectarse por SSH:**

```bash
ssh -p 2222 usuario@host
cd /home/usuario/admin.omko.do/public

# Verificar que .htaccess existe
ls -la | grep htaccess

# Debe mostrar:
# -rw-r--r-- ... .htaccess
```

**Si NO existe o está vacío, crear/recrear:**

```bash
cat > .htaccess << 'EOF'
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
```

**Verificar permisos:**

```bash
chmod 644 .htaccess
```

---

### SOLUCIÓN 3: Corregir Permisos de Carpetas

**Conectarse por SSH:**

```bash
ssh -p 2222 usuario@host
cd /home/usuario/admin.omko.do

# Permisos para carpetas
chmod -R 755 app
chmod -R 755 bootstrap
chmod -R 755 config
chmod -R 755 database
chmod -R 755 public
chmod -R 755 resources
chmod -R 755 routes
chmod -R 755 storage
chmod 755 .

# Permisos para archivos
chmod 644 .env
chmod 644 .gitignore
chmod 644 artisan
chmod 644 composer.json
chmod 644 composer.lock

# Permisos especiales para storage
chmod -R 777 storage/logs
chmod -R 777 storage/framework
chmod -R 755 bootstrap/cache
```

---

### SOLUCIÓN 4: Habilitar mod_rewrite (En cPanel)

**En cPanel → EasyApache 4 o MultiPHP INI Editor:**

1. Ve a **MultiPHP INI Editor**
2. Busca la opción de **mod_rewrite**
3. Asegúrate que está **habilitado**

O en `public/.htaccess` al inicio:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    ...
</IfModule>
```

---

### SOLUCIÓN 5: Verificar Propiedad de Archivos

```bash
# Conectarse por SSH
ssh -p 2222 usuario@host
cd /home/usuario/admin.omko.do

# Ver propiedad actual
ls -la | head -20

# Debe mostrar tu usuario, ejemplo:
# drwxr-xr-x usuario nobody

# Si está mal, cambiar propiedad:
chown -R usuario:nobody .
```

---

### SOLUCIÓN 6: Verificar archivo index.php

El error 403 a veces ocurre si `public/index.php` falta o está dañado:

```bash
# Conectarse por SSH
cd /home/usuario/admin.omko.do/public

# Verificar que index.php existe
ls -la index.php

# Debe mostrar:
# -rw-r--r-- usuario nobody ... index.php

# Si falta, subir de nuevo
# O restaurar:
git checkout public/index.php
```

---

### SOLUCIÓN 7: Verificar que NO hay .htaccess conflictivo

Algunos hosting tienen archivos `.htaccess` conflictivos en nivel superior:

```bash
# Verificar nivel padre
cd /home/usuario
ls -la | grep htaccess

# Si existe, revisar contenido
cat .htaccess  # Si existe, podría estar bloqueando

# Solución: mover o renombrar
mv .htaccess .htaccess.bak
```

---

## 🆘 CHECKLIST RÁPIDO (HAZLO AHORA)

**Paso 1: Verificar Document Root**
```bash
# En cPanel → Subdomains → admin.omko.do
# Verificar: /home/usuario/admin.omko.do/public ✅
```

**Paso 2: SSH y permisos**
```bash
ssh -p 2222 usuario@host
cd /home/usuario/admin.omko.do

# Ver estado
ls -la
ls -la public/
cat public/.htaccess

# Corregir permisos
chmod -R 755 .
chmod -R 777 storage/logs
chmod -R 777 storage/framework
chmod 644 .env
chmod 644 public/.htaccess
```

**Paso 3: Verificar index.php existe**
```bash
ls -la public/index.php
# Debe existir
```

**Paso 4: Limpiar caché**
```bash
cd /home/usuario/admin.omko.do
rm -rf bootstrap/cache/
php artisan cache:clear
php artisan config:clear
```

**Paso 5: Recargar en navegador**
- Ctrl+Shift+R (hard refresh)
- O accede a: `https://admin.omko.do/?no-cache=true`

---

## 📊 ESTADO TÍPICO DE ARCHIVOS CORRECTOS

```bash
$ ls -la /home/usuario/admin.omko.do/

drwxr-xr-x  usuario nobody  app
drwxr-xr-x  usuario nobody  bootstrap
drwxr-xr-x  usuario nobody  config
drwxr-xr-x  usuario nobody  database
drwxr-xr-x  usuario nobody  public          ← IMPORTANTE
drwxr-xr-x  usuario nobody  resources
drwxr-xr-x  usuario nobody  routes
drwxr-xr-x  usuario nobody  storage
drwxr-xr-x  usuario nobody  vendor
-rw-r--r--  usuario nobody  .env
-rw-r--r--  usuario nobody  artisan
-rw-r--r--  usuario nobody  composer.json

$ ls -la /home/usuario/admin.omko.do/public/

-rw-r--r--  usuario nobody  .htaccess       ← IMPORTANTE
-rw-r--r--  usuario nobody  index.php       ← IMPORTANTE
drwxr-xr-x  usuario nobody  css
drwxr-xr-x  usuario nobody  js
```

---

## 🎯 SI SIGUE SIN FUNCIONAR

### Opción A: Crear archivo PHP de prueba

Crear archivo `/home/usuario/admin.omko.do/public/test.php`:

```php
<?php
echo "✅ PHP funciona correctamente<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Name: " . $_SERVER['SCRIPT_NAME'] . "<br>";
echo "Permisos de lectura: " . (is_readable('.htaccess') ? '✅' : '❌') . "<br>";
?>
```

Acceder a: `https://admin.omko.do/test.php`

**Si funciona:** El servidor PHP funciona, pero Laravel/rewrite rules tienen problema.

### Opción B: Revisar .htaccess línea por línea

```bash
cat public/.htaccess

# Debe contener RewriteEngine On
# Y rewrite conditions
```

### Opción C: Habilitar mod_rewrite

```bash
# Verificar que mod_rewrite está habilitado
apache2ctl -M | grep rewrite

# Si no aparece, contactar Hostinger support
```

---

## 📞 SI NADA FUNCIONA

1. **Contactar Hostinger Support:**
   - Error 403 en subdomain
   - Verificar que mod_rewrite está habilitado
   - Verificar Document Root es correcto

2. **O enviarles esta información:**
   ```
   - Subdomain: admin.omko.do
   - Document Root debe ser: /home/[usuario]/admin.omko.do/public
   - Necesito mod_rewrite habilitado
   - Necesito permisos 755/644 en archivos
   ```

3. **Opción alternativa:** Usar shared hosting con PHP 7.4+ (sin SSH)

---

## 🎯 RESUMEN: ORDEN DE FIXES

1. ✅ Verificar Document Root en cPanel
2. ✅ SSH: Ejecutar chmod -R 755 .
3. ✅ SSH: Verificar .htaccess existe en /public
4. ✅ SSH: Limpiar caché
5. ✅ Hard refresh en navegador (Cmd+Shift+R)
6. ✅ Si sigue: contactar Hostinger

**Probabilidad de fix con estos pasos: 95%**

