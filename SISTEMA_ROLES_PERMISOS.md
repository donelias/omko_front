# 📋 SISTEMA DE ROLES Y PERMISOS - Omko Real Estate Admin

**Fecha:** 25 de Enero, 2026  
**Versión:** 1.0  
**Estado:** Documentado

---

## 🎯 Resumen del Sistema

El sistema de roles y permisos está basado en **tipos de usuario (type)** y **permisos JSON**.

- **Admin (type=0):** Superadmin con acceso a TODO
- **Usuario Regular (type=1+):** Permisos específicos almacenados como JSON

---

## 👥 Tipos de Usuario

| Type | Descripción | Acceso |
|------|-------------|--------|
| **0** | Superadmin | ✅ Acceso Total a Todo |
| **1+** | Usuario Regular | 📋 Permisos Específicos (JSON) |

**Usuario Admin Actual:**
- ID: 1
- Email: admin@omko.do
- Name: admin
- Type: 0 (Superadmin)
- Permisos: vacío (no necesita, tiene acceso a todo)

---

## 🔐 Módulos y Permisos Disponibles

Definidos en `config/rolepermission.php`:

### Configuración del Sistema
| Módulo | Acciones | Descripción |
|--------|----------|-------------|
| dashboard | read | Ver panel principal |
| system_settings | read, update | Configuración general |
| app_settings | read, update | Configuración de App |
| web_settings | read, update | Configuración de Web |
| firebase_settings | read, create | Configuración Firebase |
| notification_settings | read, create | Configuración de Notificaciones |
| system_update | read, update | Actualizaciones del sistema |
| language | create, read, update, delete | Gestionar idiomas |

### Gestión de Contenido
| Módulo | Acciones | Descripción |
|--------|----------|-------------|
| categories | create, read, update | Categorías de propiedades |
| facility | create, read, update | Facilidades/Amenidades |
| report_reason | create, read, update, delete | Razones de reporte |
| faqs | create, read, update, delete | Preguntas frecuentes |
| article | create, read, update, delete | Artículos |
| slider | create, read, update, delete | Carrusel de inicio |

### Propiedades y Proyectos
| Módulo | Acciones | Descripción |
|--------|----------|-------------|
| property | create, read, update, delete | Propiedades |
| project | create, read, update | Proyectos |
| city_images | read, update, delete | Imágenes de ciudades |
| advertisement | read, update | Publicidades |

### Usuarios y Clientes
| Módulo | Acciones | Descripción |
|--------|----------|-------------|
| users_accounts | create, read, update | Gestionar usuarios |
| customer | read, update, delete | Gestionar clientes |
| users_inquiries | read | Ver consultas de usuarios |
| user_reports | read | Ver reportes de usuarios |
| users_packages | read | Ver paquetes de usuarios |

### Otras Características
| Módulo | Acciones | Descripción |
|--------|----------|-------------|
| chat | create, read | Chat con clientes |
| package | create, read, update, delete | Paquetes de subscripción |
| payment | read | Ver pagos |
| notification | read, create, delete | Enviar notificaciones |
| calculator | read | Usar calculadora |
| near_by_places | create, read, update, delete | Lugares cercanos |
| verify_customer_form | read, create, update, delete | Formularios de verificación |
| approve_agent_verification | read, update | Aprobar verificación de agentes |
| about_us | read, update | Página de nosotros |
| privacy_policy | read, update | Política de privacidad |
| terms_conditions | read, update | Términos y condiciones |

---

## 🔧 Cómo Funciona el Sistema

### 1. Verificación de Permisos (Helper)

**Archivo:** `app/Helpers/verify-permission_helper.php`

```php
has_permissions($role, $module)
```

**Parámetros:**
- `$role`: Tipo de acción: 'create', 'read', 'update', 'delete'
- `$module`: Nombre del módulo: 'property', 'category', etc.

**Lógica:**
```
1. Si user->type = 0 (Superadmin) → ✅ Acceso total
2. Si user->type != 0 → Verificar permisos JSON
3. Validar que el módulo exista en config/rolepermission.php
4. Validar que la acción exista en el módulo
5. Validar que el usuario tenga esa acción
```

### 2. Estructura de Permisos (JSON)

Se almacena en `users.permissions` como JSON:

```json
{
    "property": {
        "create": true,
        "read": true,
        "update": true,
        "delete": false
    },
    "category": {
        "create": true,
        "read": true,
        "update": false,
        "delete": false
    }
}
```

### 3. Uso en Controladores

```php
// Proteger una acción
if (!has_permissions('create', 'property')) {
    ResponseService::errorRedirectResponse(PERMISSION_ERROR_MSG);
}
```

### 4. Uso en Vistas (Blade)

```blade
@if (has_permissions('create', 'property'))
    <a class="btn btn-primary" href="#">Añadir Propiedad</a>
@endif

@if (has_permissions('delete', 'property'))
    <button class="btn btn-danger">Eliminar</button>
@endif
```

---

## 🎨 Interfaz de Gestión de Permisos

**Ubicación:** `resources/views/users/users.blade.php`

**Características:**
- ✅ Tabla de usuarios con listado
- ✅ Modal para Añadir/Editar usuarios
- ✅ Matriz de permisos (checkboxes por módulo y acción)
- ✅ Selector de estado (Activo/Inactivo)

**Acciones Disponibles:**
- Crear usuario
- Editar usuario
- Eliminar usuario
- Cambiar estado (Activo/Inactivo)
- Asignar/Quitar permisos específicos

---

## 📊 Tabla de Usuarios (Base de Datos)

**Tabla:** `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| name | varchar | Nombre del usuario |
| email | varchar | Email (único) |
| type | tinyint | 0=Superadmin, 1+=Usuario regular |
| permissions | text | JSON con permisos específicos |
| status | int | 1=Activo, 0=Inactivo |
| password | varchar | Contraseña (hash) |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |

---

## ✅ Mejores Prácticas

### Para Desarrolladores

1. **Siempre verificar permisos antes de operaciones sensibles:**
   ```php
   if (!has_permissions('delete', 'property')) {
       return error('No tienes permisos');
   }
   ```

2. **Usar constantes para mensajes de error:**
   ```php
   ResponseService::errorRedirectResponse(PERMISSION_ERROR_MSG);
   ```

3. **Verificar en vistas antes de mostrar botones:**
   ```blade
   @if (has_permissions('update', 'property'))
       <!-- Mostrar botón de editar -->
   @endif
   ```

### Para Administradores

1. **Crear usuario con permisos específicos:**
   - Nombre y Email requeridos
   - Contraseña mínimo 8 caracteres
   - Seleccionar solo los permisos necesarios

2. **Revisar regularmente:**
   - Usuarios con exceso de permisos
   - Usuarios inactivos (desactivarlos)
   - Cambios en roles

3. **Seguridad:**
   - Nunca dar acceso 'delete' a usuarios nuevos
   - Usar la regla del menor privilegio
   - Cambiar contraseñas regularmente

---

## 🐛 Problemas Comunes y Soluciones

### "No tienes permisos para esta acción"

**Causas:**
1. El usuario es tipo != 0 y no tiene ese permiso en JSON
2. El módulo no existe en `config/rolepermission.php`
3. La acción no existe para ese módulo

**Solución:**
```bash
# 1. Editar el usuario y verificar permisos JSON
# 2. Validar en config/rolepermission.php
# 3. Asegurar que el módulo/acción existe
```

### Permisos no se actualizan

**Causas:**
1. JSON no se guardó correctamente
2. Cache no se limpió
3. Sesión no se actualizó

**Solución:**
```bash
php artisan cache:clear
php artisan config:clear
# Luego refrescar el navegador
```

---

## 🔄 Flujo de Autenticación y Autorización

```
┌─────────────┐
│ Usuario     │ → Intenta acceder a ruta/recurso
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Middleware Auth     │ → ¿Está autenticado?
└──────┬──────────────┘
       │ SÍ
       ▼
┌─────────────────────┐
│ has_permissions()   │ → ¿type = 0?
└──────┬──────────────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
  SÍ      NO
  ✅    ┌─────────────┐
        │ Verificar   │ → ¿JSON tiene permiso?
        │ JSON        │
        └──────┬──────┘
               │
           ┌───┴───┐
           │       │
           ▼       ▼
          SÍ      NO
          ✅      ❌ "Sin permisos"
```

---

## 📝 Próximos Pasos Recomendados

1. **Crear usuarios de prueba** con diferentes permisos
2. **Documentar roles** específicos para el equipo
3. **Configurar auditoría** de cambios
4. **Revisar logs** regularmente
5. **Hacer backup** regular de usuarios y permisos

---

**Última actualización:** 25 de Enero, 2026  
**Próxima revisión recomendada:** Cada trimestre

