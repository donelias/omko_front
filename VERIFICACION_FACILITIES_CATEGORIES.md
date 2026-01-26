# 🏢 VERIFICACIÓN: FACILITIES, CATEGORIES Y NEAR BY PLACES

**Fecha:** 25 de Enero, 2026  
**Estado:** ✅ Verificado

---

## 📊 Resumen General

| Módulo | Tabla | Registros | Estado | Tabla Existente |
|--------|-------|-----------|--------|-----------------|
| **Categories** | categories | 10 | ✅ OK | ✓ Sí |
| **Facilities** | outdoor_facilities | 12 | ✅ OK | ✓ Sí |
| **Near by Places** | near_by_places | N/A | ⚠️ NO EXISTE | ✗ No |

---

## 1️⃣ CATEGORIES (Categorías de Propiedades)

### Base de Datos

**Tabla:** `categories`  
**Registros:** 10  
**Última actualización:** Desde instalación

**Estructura:**
```
┌──────────────────┬─────────────────┬──────┬─────┐
│ Field            │ Type            │ Null │ Key │
├──────────────────┼─────────────────┼──────┼─────┤
│ id               │ bigint unsigned │ NO   │ PRI │
│ category         │ varchar(191)    │ NO   │     │
│ parameter_types  │ varchar(191)    │ NO   │     │
│ image            │ text            │ NO   │     │
│ status           │ tinyint         │ NO   │     │
│ sequence         │ tinyint         │ NO   │     │
│ slug_id          │ varchar(191)    │ UNI  │     │
│ meta_title       │ text            │ YES  │     │
│ meta_description │ text            │ YES  │     │
│ meta_keywords    │ text            │ YES  │     │
│ meta_image       │ varchar(191)    │ YES  │     │
│ created_at       │ timestamp       │ YES  │     │
│ updated_at       │ timestamp       │ YES  │     │
└──────────────────┴─────────────────┴──────┴─────┘
```

### Datos de Ejemplo

| ID | Categoría | Parameter Types | Status | Sequence |
|----|-----------|-----------------|--------|----------|
| 1 | Villa | 1,2,3,4,6,7,9,10,19,20,21,22,24,25,26 | Activo | 0 |
| 2 | Penthouse | 18,27,28,29,30,31,32 | Activo | 0 |
| 3 | Banglow | 1,2,3,7,9,10,11 | Activo | 0 |
| 4 | House | 1,2,3,4,7,9,10 | Activo | 0 |
| 5 | Land | 6,20 | Activo | 0 |

**Nota:** El campo `parameter_types` contiene IDs de parámetros separados por comas.

### Controlador

**Archivo:** `app/Http/Controllers/CategoryController.php`

**Funciones Principales:**
- `index()` - Ver lista de categorías
- `store()` - Crear nueva categoría
- `update()` - Editar categoría
- `destroy()` - Eliminar categoría

**Validaciones:**
```php
[
    'category'  => 'required',
    'slug'      => 'nullable|regex:/^[a-z0-9-]+$/|unique:categories,slug_id',
    'image'     => 'required|image|mimes:svg|max:2048'
]
```

**Campos Procesados:**
- 📝 Category: Nombre de la categoría
- 🏷️ Slug: URL amigable (auto-generado si no se proporciona)
- 🖼️ Image: Imagen SVG (obligatoria, max 2MB)
- 📋 Parameter Types: Seleccionar parámetros disponibles
- 🔍 SEO: Meta Title, Meta Description, Meta Keywords, Meta Image

### Rutas

```php
Route::resource('category', CategoryController::class);
```

**Endpoints disponibles:**
- GET `/category` - Listar categorías
- POST `/category` - Crear categoría
- POST `/category/{id}` - Actualizar categoría
- DELETE `/category/{id}` - Eliminar categoría

### Permisos Requeridos

| Acción | Permiso Requerido |
|--------|------------------|
| Ver | has_permissions('read', 'categories') |
| Crear | has_permissions('create', 'categories') |
| Editar | has_permissions('update', 'categories') |
| Eliminar | has_permissions('delete', 'categories') |

### ✅ Estado: FUNCIONANDO

- ✅ Tabla existe
- ✅ Controlador completo
- ✅ 10 categorías registradas
- ✅ Validaciones activas
- ✅ Permisos configurados
- ✅ SEO soportado

---

## 2️⃣ FACILITIES (Facilidades/Amenidades)

### Base de Datos

**Tabla:** `outdoor_facilities`  
**Registros:** 12  
**Última actualización:** Desde instalación

**Estructura:**
```
┌────────────┬─────────────────┬──────┬─────┐
│ Field      │ Type            │ Null │ Key │
├────────────┼─────────────────┼──────┼─────┤
│ id         │ bigint unsigned │ NO   │ PRI │
│ name       │ varchar(191)    │ NO   │     │
│ image      │ varchar(191)    │ NO   │     │
│ created_at │ timestamp       │ YES  │     │
│ updated_at │ timestamp       │ YES  │     │
└────────────┴─────────────────┴──────┴─────┘
```

### Datos de Ejemplo

| ID | Name | Image |
|----|------|-------|
| 1 | Hospital | hospital.png |
| 2 | School | school.png |
| 3 | Supermarket | supermarket.png |
| 4 | Bank ATM | atm.png |
| 5 | Bus Stop | bus.png |
| ... | ... | ... |

**Total:** 12 facilidades registradas

### Controlador

**Archivo:** `app/Http/Controllers/OutdoorFacilityController.php`

**Funciones Principales:**
- CRUD completo para facilidades
- Almacenamiento de imágenes
- Gestión de lista

### Permisos Requeridos

| Acción | Permiso Requerido |
|--------|------------------|
| Ver | has_permissions('read', 'facility') |
| Crear | has_permissions('create', 'facility') |
| Editar | has_permissions('update', 'facility') |
| Eliminar | ⚠️ NO DISPONIBLE |

**Nota:** Las facilidades actúan como amenidades que se asocian a las propiedades.

### Relaciones

- **Con Propiedades:** Las propiedades pueden tener múltiples facilidades
- **Con Parámetros:** Se usan como opciones en formularios de búsqueda

### ✅ Estado: FUNCIONANDO

- ✅ Tabla existe
- ✅ Controlador activo
- ✅ 12 facilidades predefinidas
- ✅ Asociación con propiedades
- ✅ Permisos configurados

---

## 3️⃣ NEAR BY PLACES (Lugares Cercanos)

### ⚠️ PROBLEMA ENCONTRADO

**Estado:** ❌ TABLA NO EXISTE

**Síntoma:**
```
ERROR 1146 (42S02): Table 'omko_pre_production.near_by_places' doesn't exist
```

**Análisis:**
1. ✅ El módulo está definido en `config/rolepermission.php`
2. ✅ El controlador existe: `app/Http/Controllers/NearbyPlaceController.php`
3. ✅ La ruta está definida
4. ❌ **LA TABLA NO EXISTE EN LA BASE DE DATOS**

### Qué Debería Hacer

**Según la configuración de permisos:**
```php
'near_by_places' => array('create', 'read', 'update','delete'),
```

**Propósito:** Gestionar lugares cercanos a las propiedades (hospitales, escuelas, tiendas, etc.)

### Soluciones

#### Opción 1: Crear la Tabla (Recomendado)

```bash
# Crear migración
php artisan make:migration create_near_by_places_table

# En la migración:
Schema::create('near_by_places', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('icon')->nullable();
    $table->text('description')->nullable();
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->tinyInteger('status')->default(1);
    $table->timestamps();
});

# Ejecutar
php artisan migrate
```

#### Opción 2: Usar `outdoor_facilities` en su lugar

Ya existe una tabla similar (`outdoor_facilities`) que podría usarse para este propósito.

#### Opción 3: Deshabilitar el Módulo Temporalmente

```php
// En config/rolepermission.php
// Comentar la línea:
// 'near_by_places' => array('create', 'read', 'update','delete'),
```

### Modelo Esperado

**Archivo:** `app/Models/NearbyPlace.php` (o similar)

```php
class NearbyPlace extends Model {
    protected $table = 'near_by_places';
    protected $fillable = ['name', 'icon', 'description', 'latitude', 'longitude', 'status'];
}
```

### ⚠️ RECOMENDACIÓN

**Crear la tabla de inmediato:**

```bash
# 1. Crear archivo de migración
php artisan make:migration create_near_by_places_table

# 2. Editar el archivo generado en database/migrations/
# 3. Ejecutar migración
php artisan migrate

# 4. Verificar
SELECT COUNT(*) FROM near_by_places;
```

---

## 📋 COMPARATIVA

| Aspecto | Categories | Facilities | Near by Places |
|---------|------------|-----------|-----------------|
| **Tabla existe** | ✅ Sí | ✅ Sí | ❌ No |
| **Controlador** | ✅ Completo | ✅ Completo | ✅ Existe |
| **Registros** | 10 | 12 | 0 |
| **SEO** | ✅ Soportado | ❌ No | ? |
| **Imagen** | ✅ SVG | ✅ PNG/JPG | ? |
| **Permisos** | ✅ 4 (CRUD) | ✅ 3 (CRU) | ✅ 4 (CRUD) |
| **Activo** | ✅ Sí | ✅ Sí | ❌ Requiere tabla |

---

## 🔧 ACCIONES NECESARIAS

### Inmediatas
- [ ] **Crear tabla `near_by_places`** con migración
- [ ] Verificar que la tabla se crea correctamente
- [ ] Probar CRUD en el admin

### A Corto Plazo
- [ ] Rellenar datos de lugares cercanos frecuentes
- [ ] Definir qué campos son obligatorios vs opcionales
- [ ] Documentar el uso

### A Largo Plazo
- [ ] Integrar con Google Places API (opcional)
- [ ] Geocodificación automática
- [ ] Búsqueda de lugares por proximidad

---

## 📝 Estructura Recomendada para `near_by_places`

```
┌──────────────────┬──────────────────┬───────┐
│ Field            │ Type             │ Null  │
├──────────────────┼──────────────────┼───────┤
│ id               │ bigint unsigned  │ NO    │
│ name             │ varchar(191)     │ NO    │
│ icon             │ varchar(191)     │ YES   │
│ description      │ text             │ YES   │
│ latitude         │ decimal(10,8)    │ YES   │
│ longitude        │ decimal(11,8)    │ YES   │
│ status           │ tinyint          │ NO    │
│ created_at       │ timestamp        │ YES   │
│ updated_at       │ timestamp        │ YES   │
└──────────────────┴──────────────────┴───────┘
```

---

## 🎯 Próximos Pasos

1. **Prioridad ALTA:** Crear tabla `near_by_places`
2. **Prioridad MEDIA:** Poblar datos básicos
3. **Prioridad BAJA:** Integrar con APIs externas

**Última actualización:** 25 de Enero, 2026

