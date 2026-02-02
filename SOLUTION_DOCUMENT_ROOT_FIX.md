# ✅ SOLUCIÓN: DOCUMENT ROOT INCORRECTO

## 🎯 DIAGNÓSTICO

El que `https://admin.omko.do/public/` funcione pero `https://admin.omko.do/` dé error 403 significa:

**❌ ACTUAL (INCORRECTO):**
```
Document Root: /home/usuario/admin.omko.do
            ↓
       Acceso a: https://admin.omko.do/
            ↓
       Busca: /home/usuario/admin.omko.do/index.php
            ↓
       ERROR 403 (porque index.php está en /public, no ahí)
            ↓
       Pero si pones /public/: 
       https://admin.omko.do/public/
            ↓
       Busca: /home/usuario/admin.omko.do/public/index.php
            ↓
       ✅ ENCONTRADO (por eso funciona)
```

---

## ✅ SOLUCIÓN (2 PASOS)

### PASO 1: En cPanel - Editar Document Root

**Acceder a cPanel:**
1. https://hpanel.hostinger.com
2. Ve a **Domains** → **Subdomains** (o búscula "Subdomains")
3. Busca `admin.omko.do`
4. Haz click en **Edit**

**Cambiar Document Root:**
- Campo: **Document Root**
- Valor ACTUAL: `/home/tu_usuario/admin.omko.do`
- Cambiar A: `/home/tu_usuario/admin.omko.do/public`

**Guardar cambios:**
- Click en **Save**

---

### PASO 2: Esperar propagación

- Espera **5-10 minutos** para que los cambios se apliquen
- Limpia caché del navegador: **Cmd + Shift + R**
- Intenta acceder a: `https://admin.omko.do`

---

## 🔍 VERIFICAR EN SSH (OPCIONAL)

Para confirmar que está correcto:

```bash
# Conectarse
ssh -p 2222 usuario@host

# Ver configuración de subdomains
grep -r "admin.omko.do" /etc/apache2/conf.d/
# O
grep -r "admin.omko.do" /var/cpanel/userdata/

# Debe mostrar DocumentRoot como: /home/usuario/admin.omko.do/public
```

---

## 📊 COMPARATIVA

| Acceso | Document Root Actual | Document Root Correcto |
|--------|---------------------|----------------------|
| `https://admin.omko.do/` | `/home/user/admin.omko.do` | `/home/user/admin.omko.do/public` |
| Resultado | ❌ 403 Forbidden | ✅ Funciona |
| Busca archivo en: | `/home/user/admin.omko.do/index.php` | `/home/user/admin.omko.do/public/index.php` |
| `https://admin.omko.do/public/` | ✅ Funciona | ❌ 404 (no existe `/public/public/`) |

---

## 🎯 INSTRUCCIONES PASO A PASO CON FOTOS MENTALES

### En cPanel:

1. **Login a cPanel**
   - URL: `https://hpanel.hostinger.com`
   - Usuario y contraseña de Hostinger

2. **Buscar Subdomains**
   - En panel lateral izquierdo
   - O usar búsqueda "Subdomains"

3. **Listar Subdomains**
   - Deberías ver `admin.omko.do` en la lista
   - Al lado habrá botón de **Edit** (lápiz)

4. **Editar admin.omko.do**
   - Haz click en Edit
   - Se abrirá formulario con campos

5. **Localizar Document Root**
   - Campo que dice "Document Root" o "Root Directory"
   - Valor actual: `/home/tu_usuario/admin.omko.do`
   - **Cambiar a:** `/home/tu_usuario/admin.omko.do/public`

6. **Guardar**
   - Click en botón "Save" o "Update"
   - Deberías ver mensaje de éxito

7. **Esperar**
   - 5-10 minutos máximo

8. **Probar**
   - Abre navegador
   - Va a: `https://admin.omko.do`
   - Debe cargar sin `/public/`
   - Deberías ver login de Laravel

---

## ✅ VALIDACIÓN POSTERIOR

Una vez aplicado, prueba estos URLs:

| URL | Resultado Esperado |
|-----|------------------|
| `https://admin.omko.do` | ✅ Página de login |
| `https://admin.omko.do/` | ✅ Página de login |
| `https://admin.omko.do/admin` | 🔄 Redirige a login (si no autenticado) |
| `https://admin.omko.do/public/` | ❌ 404 Not Found |
| `https://admin.omko.do/admin/ad-banners` | 🔄 Redirige a login (si no autenticado) |

---

## 📞 SI HOSTINGER NO TE DEJA EDITAR

Algunas cuentas compartidas en Hostinger tienen restricciones. En ese caso:

**Contactar Hostinger Support:**
```
Asunto: Cambiar Document Root del subdomain

Mensaje:
Hola,

Necesito cambiar el Document Root del subdomain admin.omko.do:
- De: /home/tu_usuario/admin.omko.do
- A: /home/tu_usuario/admin.omko.do/public

Esto es necesario para aplicación Laravel.

Gracias,
tu_email@dominio.com
```

---

## 🎉 RESULTADO FINAL

Después de estos cambios:

✅ `https://admin.omko.do` → Página de login de OMKO
✅ `https://admin.omko.do/admin/appointments` → Panel de citas
✅ `https://admin.omko.do/admin/ad-banners` → Panel de banners
✅ Acceso sin `/public/` en la URL

---

**Tiempo estimado: 15 minutos (incluyendo propagación de cambios)**

