# ⚡ CHECKLIST RÁPIDO: DEPLOY HOSTINGER (5 PASOS PRINCIPALES)

## 1️⃣ PREPARAR ARCHIVOS LOCALES (10 minutos)

```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/real_estate_admin

# Optimizar
composer install --optimize-autoloader --no-dev
php artisan cache:clear
php artisan config:clear

# Cambiar a producción en .env
APP_ENV=production
APP_DEBUG=false
```

**Archivos a subir:**
- ✅ app/, bootstrap/, config/, database/, resources/, routes/, storage/
- ✅ public/, vendor/
- ✅ .env (EDITADO CON CREDENCIALES DE HOSTINGER)
- ❌ NO: .git/, node_modules/, .env.example

---

## 2️⃣ PREPARAR HOSTINGER (15 minutos)

### En cPanel:
1. **MySQL Databases** → Crear BD: `u776792054_omko_admin`
2. **MySQL Users** → Crear usuario: `u776792054_admin` con contraseña
3. **User Privileges** → Agregar usuario a BD
4. **Subdomains** → Crear `admin.omko.do` → Document Root: `/home/user/admin.omko.do/public`
5. **AutoSSL** → Instalar certificado para `admin.omko.do`

---

## 3️⃣ SUBIR ARCHIVOS A HOSTINGER (15-30 minutos)

### Opción A: SFTP (desde Terminal)
```bash
# Subir archivos
rsync -avz --exclude='node_modules' --exclude='.git' \
  /Users/mac/Documents/Omko/omko/En\ produccion/real_estate_admin/ \
  usuario@host:/home/usuario/admin.omko.do/

# Conectar por SSH después
ssh -p 2222 usuario@host
cd /home/usuario/admin.omko.do
```

### Opción B: FTP (desde Finder)
- Cmd + K → `sftp://usuario:pass@host:22`
- Arrastra carpetas a `/home/usuario/admin.omko.do/`

---

## 4️⃣ INSTALAR Y CONFIGURAR (10 minutos)

**Via SSH en Hostinger:**

```bash
cd /home/usuario/admin.omko.do

# Instalar dependencias
composer install

# Permisos
chmod -R 755 storage bootstrap/cache
chmod 644 .env

# Generar key
php artisan key:generate

# Migraciones (PRIMERO: subir BD schema)
php artisan migrate --force

# Optimizar
php artisan config:cache
php artisan route:cache
```

---

## 5️⃣ VERIFICAR Y ACCEDER (5 minutos)

✅ **Abrir navegador:**
- https://admin.omko.do

✅ **Credenciales:**
- Email: `admin@omko.do`
- Contraseña: `don#%E02`

✅ **Verificar rutas:**
- https://admin.omko.do/admin/ad-banners
- https://admin.omko.do/admin/appointments
- https://admin.omko.do/admin/package-features

---

## 🔧 CONFIGURACIONES CRÍTICAS EN .env PARA HOSTINGER

```env
# PRODUCCIÓN
APP_ENV=production
APP_DEBUG=false
APP_URL=https://admin.omko.do

# BD (desde cPanel)
DB_HOST=hostinger_host_ip
DB_PORT=3306
DB_DATABASE=u776792054_omko_admin
DB_USERNAME=u776792054_admin
DB_PASSWORD=tu_contraseña_BD

# CACHÉ Y SESIONES
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync

# MAIL (opcional, para alertas)
MAIL_MAILER=smtp
MAIL_HOST=hostinger_smtp
MAIL_PORT=587
MAIL_FROM_ADDRESS=admin@omko.do
```

---

## ❌ ERRORES COMUNES Y SOLUCIONES

| Error | Solución |
|-------|----------|
| 500 Internal Server Error | `tail -f storage/logs/laravel.log` |
| Class not found | `composer dump-autoload` |
| Permission denied | `chmod -R 755 storage` |
| 404 en rutas admin | Verificar `public/.htaccess` |
| BD no conecta | Verificar `DB_HOST`, usuario y contraseña en cPanel |
| HTTPS fuerza HTTP | Agregar fuerce scheme en routes/web.php |

---

## 📊 TIEMPO TOTAL ESTIMADO: 45-60 MINUTOS

- Preparar archivos: 10 min
- Preparar Hostinger: 15 min  
- Subir archivos: 15-30 min
- Instalar/configurar: 10 min
- Verificar: 5 min

---

## 📞 REFERENCIA RÁPIDA

**Credenciales para tener a mano:**
```
HOSTINGER HOST: [TU_HOST]
HOSTINGER USER: [TU_USER]
HOSTINGER PASS: [TU_PASS]
SSH PORT: 2222 (típico)
FTP PORT: 21 o 2222 (SFTP)

DB HOST: [HOSTINGER_DB_HOST]
DB USER: u776792054_admin
DB PASS: [TU_CONTRASEÑA_BD]
DB NAME: u776792054_omko_admin

DOMINIO: admin.omko.do
DOCUMENT ROOT: /home/[usuario]/admin.omko.do/public
```

---

**¿LISTO? ¡Comienza con el paso 1!** 🚀

