# 🚀 GUÍA PASO A PASO: DEPLOY ADMIN A HOSTINGER

## 📋 REQUISITOS PREVIOS

- ✅ Acceso FTP/SFTP a Hostinger
- ✅ Acceso a cPanel de Hostinger
- ✅ Base de datos creada en Hostinger
- ✅ Dominio configurado
- ✅ PHP 8.0+ activado

---

## FASE 1: PREPARAR ARCHIVOS LOCALES

### Paso 1.1: Optimizar la aplicación
```bash
cd /Users/mac/Documents/Omko/omko/En\ produccion/real_estate_admin

# Limpiar cachés
php artisan cache:clear
php artisan config:clear
php artisan route:cache
php artisan view:cache

# Optimizar autoloader
composer install --optimize-autoloader --no-dev

# Cambiar a modo producción
sed -i '' 's/APP_DEBUG=true/APP_DEBUG=false/' .env
sed -i '' 's/APP_ENV=local/APP_ENV=production/' .env
```

### Paso 1.2: Crear archivo .env de producción
Edita `.env` en la raíz del proyecto:

```env
APP_NAME="OMKO Admin"
APP_ENV=production
APP_KEY=base64:... (mantener tu clave actual)
APP_DEBUG=false
APP_URL=https://tudominio.com/admin

DB_CONNECTION=mysql
DB_HOST=hostinger_host
DB_PORT=3306
DB_DATABASE=u776792054_omko_admin  (cambiar por tu BD)
DB_USERNAME=u776792054_admin       (cambiar por tu usuario)
DB_PASSWORD=tu_contraseña          (cambiar por tu contraseña)

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync

MAIL_MAILER=smtp
MAIL_HOST=hostinger_mail_host
MAIL_PORT=587
MAIL_USERNAME=tu_email
MAIL_PASSWORD=tu_contraseña
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=admin@omko.do
```

---

## FASE 2: CONECTAR A HOSTINGER VIA FTP

### Paso 2.1: Obtener credenciales FTP
1. Accede a cPanel de Hostinger
2. Ve a **Cuentas FTP** o **SFTP**
3. Copia: Host, Usuario, Contraseña, Puerto

### Paso 2.2: Conectarse por FTP
**Opción A: Con Finder (macOS)**
```
Cmd + K en Finder
sftp://usuario:contraseña@host:puerto
```

**Opción B: Con Terminal (recomendado)**
```bash
sftp -P 22 usuario@host
```

---

## FASE 3: ESTRUCTURA EN HOSTINGER

### Paso 3.1: Crear estructura de carpetas
Una vez conectado por FTP, navega a la raíz y crea:

```
/home/tu_usuario/
├── public_html/          (sitio público - NO tocar)
└── admin.omko.do/        ← Crear esta carpeta para el admin
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/
    ├── resources/
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── .env
    ├── .gitignore
    ├── artisan
    ├── composer.json
    └── composer.lock
```

### Paso 3.2: Subir archivos
Desde terminal, subir todos los archivos:

```bash
# Conectar a Hostinger
sftp -P 22 usuario@host

# Navegar a la carpeta admin
cd /home/tu_usuario/admin.omko.do

# Subir archivos (opción local)
# Desde otra terminal en tu Mac:
rsync -avz --exclude='node_modules' --exclude='.git' \
  /Users/mac/Documents/Omko/omko/En\ produccion/real_estate_admin/ \
  usuario@host:/home/tu_usuario/admin.omko.do/

# O manualmente con FTP:
# 1. Arrastra carpetas app, bootstrap, config, etc.
# 2. Arrastra archivos: .env, artisan, composer.json, etc.
# 3. NO subas: node_modules, .git, .env.example
```

---

## FASE 4: CONFIGURAR BASE DE DATOS EN HOSTINGER

### Paso 4.1: Crear base de datos
1. En cPanel → **MySQL Databases**
2. Crear nueva BD: `u776792054_omko_admin`
3. Crear usuario: `u776792054_admin`
4. Agregar usuario a la BD con todos los permisos

### Paso 4.2: Importar estructura de tablas
```bash
# Desde terminal local:
# 1. Exportar esquema local
mysqldump -u root -p omko_admin --no-data > schema.sql

# 2. Subir a Hostinger via cPanel → phpMyAdmin
# O via SSH/SFTP:
mysql -h hostinger_host -u usuario -p BD_name < schema.sql
```

---

## FASE 5: CONECTAR POR SSH (RECOMENDADO)

### Paso 5.1: Habilitar SSH en Hostinger
1. cPanel → **SSH/Shell Access**
2. Activar acceso SSH
3. Copiar datos de conexión

### Paso 5.2: Conectarse
```bash
ssh -p 2222 usuario@host  (puerto varía, verifica en Hostinger)

# Navegar a la carpeta
cd /home/tu_usuario/admin.omko.do
```

### Paso 5.3: Instalar dependencias PHP
```bash
# Una vez conectado por SSH:
composer install

# Si da error de permisos:
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Generar clave APP
php artisan key:generate

# Ejecutar migraciones
php artisan migrate --force
```

---

## FASE 6: CONFIGURAR DOMINIO EN HOSTINGER

### Paso 6.1: Crear subdominio admin.omko.do
1. cPanel → **Subdomains**
2. Crear: `admin.omko.do`
3. Document Root: `/home/tu_usuario/admin.omko.do/public`

### Paso 6.2: Verificar archivo public/.htaccess
Asegúrate que exista este archivo en `public/`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_friendlyurls.c>
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.php [L]
    </IfModule>
</IfModule>
```

---

## FASE 7: CONFIGURAR SSL

### Paso 7.1: Instalar certificado SSL
1. cPanel → **Auto SSL** o **Let's Encrypt SSL**
2. Seleccionar dominio: `admin.omko.do`
3. Instalar certificado (gratuito)

### Paso 7.2: Forzar HTTPS
En `.env`:
```env
APP_URL=https://admin.omko.do
```

En `config/app.php` o agregar a `.env`:
```php
// En routes/web.php agregar:
if (\App::environment('production')) {
    \URL::forceScheme('https');
}
```

---

## FASE 8: PERMISOS Y PERTENENCIA

Conectado por SSH, ejecutar:

```bash
cd /home/tu_usuario/admin.omko.do

# Permisos de carpetas
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env

# Pertenencia (si tienes acceso root)
chown -R usuario:grupo storage
chown -R usuario:grupo bootstrap/cache
```

---

## FASE 9: PRUEBAS INICIALES

### Paso 9.1: Verificar instalación
```bash
# Desde terminal conectado a Hostinger:
php artisan tinker

# Prueba rápida:
App\Models\User::count()  # Debe devolver número de usuarios
```

### Paso 9.2: Acceder al sitio
1. Abre navegador: `https://admin.omko.do`
2. Deberías ver pantalla de login
3. Prueba con: admin@omko.do / don#%E02

---

## FASE 10: CONFIGURACIÓN FINAL

### Paso 10.1: Optimizar en Hostinger
```bash
# Ejecutar comandos de optimización:
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Paso 10.2: Verificar logs
```bash
# Ver errores:
tail -f storage/logs/laravel.log
```

### Paso 10.3: Configurar Cron (opcional para tareas)
En cPanel → **Cron Jobs**, agregar:
```bash
0 0 * * * /usr/bin/php /home/tu_usuario/admin.omko.do/artisan schedule:run >> /dev/null 2>&1
```

---

## CHECKLIST FINAL

- [ ] Archivos subidos a Hostinger
- [ ] Base de datos creada y conectada
- [ ] Archivo .env configurado correctamente
- [ ] Composer dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Subdominio creado y apuntando a /public
- [ ] SSL instalado
- [ ] HTTPS forzado
- [ ] Permisos de carpetas correctos
- [ ] Sitio accesible en https://admin.omko.do
- [ ] Login funcional con admin@omko.do
- [ ] Rutas admin: /admin/ad-banners, /admin/appointments, etc.

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### Error 500: Internal Server Error
```bash
# Verificar logs:
tail -100 storage/logs/laravel.log

# Validar .env
php artisan env

# Regenerar key
php artisan key:generate
```

### Problema: "Class not found"
```bash
composer dump-autoload
```

### Problema: No encuentra BD
```bash
# Verificar conexión:
php artisan tinker
DB::connection()->getPDO()
```

### Problema: Permisos de carpeta
```bash
chmod -R 777 storage
chmod -R 777 bootstrap/cache
```

### Problema: Ruta 404 en admin
Asegurar que `public/.htaccess` existe y mod_rewrite está habilitado.

---

## 📞 DATOS DE CONTACTO HOSTINGER

- **Panel**: https://hpanel.hostinger.com
- **SSH Host**: Consultable en cPanel
- **phpMyAdmin**: cPanel → Databases → phpMyAdmin

---

## ✅ PRÓXIMOS PASOS

1. Una vez en producción, realizar monitoreo
2. Configurar backups automáticos
3. Habilitar logging y alertas
4. Documentar procesos de mantenimiento
5. Crear plan de rollback

