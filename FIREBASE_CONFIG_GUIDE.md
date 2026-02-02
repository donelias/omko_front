# Firebase Configuration Guide

## Error: "auth/unauthorized-domain"

**Problema:** El dominio desde el cual intentas autenticarte no está autorizado en Firebase.

## Solución: Autorizar Dominios en Firebase

### Paso 1: Abre Firebase Console
- URL: https://console.firebase.google.com/
- Proyecto: **omko-d5887**

### Paso 2: Ve a Authentication Settings
1. Haz clic en **Authentication** (en el menú izquierdo)
2. Ve a la pestaña **Settings**
3. Scroll down hasta **"Authorized domains"**

### Paso 3: Añade los siguientes dominios

| Dominio | Propósito |
|---------|----------|
| `localhost:3000` | Desarrollo local (Next.js dev server) |
| `127.0.0.1:3000` | Desarrollo local (alternativa) |
| `localhost` | Desarrollo local (sin puerto especificado) |
| `omko.do` | Producción - Website |
| `realestate.omko.do` | Producción - Subdomain |
| `admin.omko.do` | Backend API (si es necesario) |

### Paso 4: Guarda los cambios

---

## Configuración de Firebase en el Código

### Credenciales Actuales (`.env`):
```
NEXT_PUBLIC_API_KEY=AIzaSyDkU5zv4QdT5Bge4gz9CAtlVE9IsLvNwqk
NEXT_PUBLIC_AUTH_DOMAIN=omko-d5887.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=omko-d5887
NEXT_PUBLIC_STORAGE_BUCKET=omko-d5887.firebasestorage.app
NEXT_PUBLIC_MESSAGING_SENDER_ID=202513047798
NEXT_PUBLIC_APP_ID=1:202513047798:web:44b69ae6dde7c996b08cd7
NEXT_PUBLIC_MEASUREMENT_ID=G-ZBV17RC50P
```

### Componentes que usan Firebase:
1. **LoginModal.jsx** - Google Sign-In y OTP via Firebase
2. **PushNotificationLayout.jsx** - Push notifications
3. **Firebase.js utility** - Inicialización de Firebase

---

## Testing después de autorizar dominios

1. **Reinicia el servidor Next.js**
   ```bash
   pkill -f "npm run dev"
   sleep 2
   npm run dev
   ```

2. **Abre el navegador en http://localhost:3000**

3. **Prueba Google Sign-In**
   - El error debería desaparecer
   - El popup de Google debería abrirse correctamente

4. **Verifica en Browser Console (F12)**
   - No debería haber errores de Firebase

---

## Dominios por Ambiente

### Desarrollo (localhost)
- ✅ `localhost:3000`
- ✅ `127.0.0.1:3000`
- ✅ `localhost`

### Staging (si aplica)
- `staging.omko.do`

### Producción
- ✅ `omko.do`
- ✅ `realestate.omko.do`

---

## Troubleshooting

### Si aún recibo el error después de autorizar:

1. **Limpia el cache del navegador**
   - Abre DevTools (F12)
   - Application → Clear site data

2. **Espera 5-10 minutos**
   - Firebase tarda en propagar los cambios

3. **Verifica que el dominio está exactamente correcto**
   - Sin espacios adicionales
   - Incluye el puerto si es localhost

4. **Usa incógnito/private window**
   - Para evitar cache del navegador

---

## Referencias
- [Firebase Auth - Authorized Domains](https://firebase.google.com/docs/auth/admin-sdk)
- [Configuración de dominio en Firebase Console](https://firebase.google.com/docs/authentication/get-started)

