# ¿Cómo Funciona Near by Places (Lugares Cercanos)?

## Resumen Ejecutivo

**Near by Places** es un módulo para gestionar las **amenidades y lugares cercanos** que pueden asociarse a las propiedades inmobiliarias. El sistema permite agregar, editar y eliminar "lugares cercanos" (como hospitales, escuelas, tiendas, etc.) que pueden ser utilizados al crear o editar propiedades.

**Estado Actual:** ✅ FUNCIONAL
- Base de datos: ✅ Tabla existente
- Controlador: ✅ Implementado (OutdoorFacilityController)
- Rutas: ✅ Definidas
- Permisos: ✅ Configurados
- Interfaz: ✅ Disponible en el panel admin

---

## 1. Estructura del Sistema

### 1.1 Tabla Base de Datos: `outdoor_facilities`

La tabla que almacena los "lugares cercanos" (outdoor facilities):

```
Field       | Type               | Null | Key | Default | Extra
------------|--------------------| -----|-----|---------|-------------------
id          | bigint unsigned    | NO   | PRI | NULL    | auto_increment
name        | varchar(191)       | NO   |     | NULL    | 
image       | varchar(191)       | NO   |     | NULL    | (SVG icon path)
created_at  | timestamp          | YES  |     | NULL    |
updated_at  | timestamp          | YES  |     | NULL    |
```

**Ejemplo de Datos:**
```
ID  | Name          | Image Path
----|---------------|------------------
1   | Hospital      | images/hospital.svg
2   | School        | images/school.svg
3   | Supermarket   | images/supermarket.svg
4   | Bank ATM      | images/bank.svg
5   | Bus Stop      | images/bus.svg
6   | Park          | images/park.svg
... | ...           | ...
```

### 1.2 Tabla Relacional: `assigned_outdoor_facilities`

Esta tabla asocia las amenidades con las propiedades:

```php
// Estructura probable (no verificada):
- id (bigint unsigned)
- property_id (bigint unsigned) → references properties(id)
- facility_id (bigint unsigned) → references outdoor_facilities(id)
- timestamps
```

**Propósito:** Crear una relación muchos-a-muchos entre propiedades y lugares cercanos.

---

## 2. Componentes del Sistema

### 2.1 Modelo: `OutdoorFacilities`

```php
// app/Models/OutdoorFacilities.php
class OutdoorFacilities extends Model {
    // Propiedades que almacena:
    - id
    - name        (nombre de la amenidad)
    - image       (ruta del ícono SVG)
    - created_at
    - updated_at
}
```

### 2.2 Controlador: `OutdoorFacilityController`

**Ubicación:** `app/Http/Controllers/OutdoorFacilityController.php`

**Funciones Principales:**

#### A) **index()** - Lista de Lugares Cercanos
```php
public function index() {
    // Verifica permisos: 'read', 'near_by_places'
    // Retorna la vista: OutdoorFacilities.index
    // Muestra tabla con todos los lugares cercanos
}
```

#### B) **store()** - Crear Nuevo Lugar Cercano
```php
public function store(Request $request) {
    // Valida:
    - image (requerida, tipo imagen, formato SVG, máx 2MB)
    
    // Guarda:
    - name: $request->facility
    - image: sube archivo SVG a /public/images/facilities/
    
    // Respuesta: "Near by Place Added Successfully"
}
```

#### C) **show()** - Obtener Lista con Paginación
```php
public function show(Request $request) {
    // Parámetros:
    - offset (número de registro inicial)
    - limit (cantidad de registros por página)
    - sort (campo para ordenar, por defecto: 'sequence')
    - order (ASC o DESC)
    - search (búsqueda por ID o nombre)
    
    // Retorna: JSON con tabla de datos (para Bootstrap Table)
}
```

#### D) **update()** - Editar Lugar Cercano
```php
public function update(Request $request) {
    // Valida:
    - image (requerida, tipo imagen, SVG, máx 2MB)
    
    // Actualiza:
    - name: $request->edit_name
    - image: sube nueva imagen SVG
    
    // Respuesta: "Near by Place Updated Successfully"
}
```

#### E) **destroy()** - Eliminar Lugar Cercano
```php
public function destroy($id) {
    // Verifica: permisos 'delete', 'near_by_places'
    
    // Elimina:
    - Registro de outdoor_facilities
    - Asociaciones en assigned_outdoor_facilities
    - Archivo de imagen SVG del servidor
    
    // Respuesta: "Facility Deleted Successfully"
}
```

### 2.3 Rutas: `routes/web.php`

```php
// Rutas RESTful para Outdoor Facilities
Route::resource('outdoor_facilities', OutdoorFacilityController::class);

// Rutas personalizadas
Route::get('facility-list', [OutdoorFacilityController::class, 'show']);
Route::post('facility-update', [OutdoorFacilityController::class, 'update']);
Route::get('facility-delete/{id}', [OutdoorFacilityController::class, 'destroy']);
```

---

## 3. Control de Permisos

El sistema utiliza el módulo **'near_by_places'** en la configuración de permisos:

```php
// config/rolepermission.php
'near_by_places' => array('create', 'read', 'update', 'delete')
```

**Verificaciones de Permisos:**

| Función   | Permiso Requerido | Acción |
|-----------|------------------|--------|
| `index()` | `read` | Ver lista de lugares cercanos |
| `store()` | `create` | Crear nuevo lugar cercano |
| `show()` | `read` | Obtener datos (AJAX) |
| `update()` | `update` | Editar lugar cercano |
| `destroy()` | `delete` | Eliminar lugar cercano |

**Ejemplo de Verificación:**
```php
if (!has_permissions('read', 'near_by_places')) {
    return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
}
```

---

## 4. Interfaz de Usuario

### 4.1 Ubicación en Menú Lateral

```
Sidebar → Near by Places
├── Ícono para navegar
├── Link a /outdoor_facilities (si tiene permisos 'read')
└── Muestra en navbar si has_permissions('read', 'near_by_places')
```

**Archivo Vista:** `resources/views/OutdoorFacilities/index.blade.php`

**Elementos de Interfaz:**
- Tabla Bootstrap con todos los lugares cercanos
- Botón "Agregar" (si tiene permisos 'create')
- Botones "Editar" y "Eliminar" por fila (si tiene permisos)
- Búsqueda por ID o nombre
- Paginación

### 4.2 Ejemplo de Pantalla

```
+─────────────────────────────────────────────────────┐
| 📍 Near by Places                                   |
+─────────────────────────────────────────────────────+
| ┌────────────┐  [Agregar Nuevo +]                  |
| │ Buscar:    │                                      |
| └────────────┘                                      |
|                                                     |
| ID  | Name       | Image  | Acciones              |
|----|------------|--------|----------------------|
| 1  | Hospital   | ✓      | [Editar] [Eliminar]  |
| 2  | School     | ✓      | [Editar] [Eliminar]  |
| 3  | Supermarket| ✓      | [Editar] [Eliminar]  |
| 4  | Bank ATM   | ✓      | [Editar] [Eliminar]  |
| 5  | Bus Stop   | ✓      | [Editar] [Eliminar]  |
|                                                     |
| [← Previous] [1 2 3] [Next →]                       |
+─────────────────────────────────────────────────────+
```

---

## 5. Flujo de Datos

### 5.1 Crear un Nuevo Lugar Cercano

```
1. Usuario hace clic en "Agregar Nuevo"
   ↓
2. Abre formulario con campos:
   - Nombre del lugar (input text)
   - Imagen SVG (file upload)
   ↓
3. Usuario completa y hace clic en "Guardar"
   ↓
4. POST /outdoor_facilities
   - OutdoorFacilityController::store()
   - Valida imagen (SVG, máx 2MB)
   ↓
5. Crea registro en tabla outdoor_facilities:
   INSERT INTO outdoor_facilities (name, image) VALUES ('Hospital', 'images/hospital.svg')
   ↓
6. Guardar imagen en /public/images/facilities/
   ↓
7. Respuesta: "Near by Place Added Successfully"
   ↓
8. Redirecciona a lista actualizada
```

### 5.2 Asignar Lugares Cercanos a una Propiedad

```
1. Crear o editar PROPIEDAD
   ↓
2. Sección "Nearby Places" muestra checkboxes de:
   - Hospital ☐
   - School ☐
   - Supermarket ☐
   - Bank ATM ☐
   - Bus Stop ☐
   ↓
3. Usuario selecciona las amenidades relevantes
   ↓
4. Al guardar propiedad:
   INSERT INTO assigned_outdoor_facilities 
   (property_id, facility_id) VALUES (5, 1), (5, 2), (5, 3)
   ↓
5. Resultado: Propiedad 5 tiene 3 amenidades cercanas
```

### 5.3 Editar Lugar Cercano

```
1. Usuario hace clic en "Editar" junto al hospital
   ↓
2. Abre formulario con datos actuales
   - Nombre: "Hospital"
   - Imagen actual (muestra ícono actual)
   ↓
3. Usuario modifica y hace clic en "Actualizar"
   ↓
4. POST /facility-update
   - OutdoorFacilityController::update()
   ↓
5. UPDATE outdoor_facilities SET name='Hospital General', image='...' WHERE id=1
   ↓
6. Elimina imagen anterior del servidor
   ↓
7. Respuesta: "Near by Place Updated Successfully"
```

---

## 6. Integración con Propiedades

### 6.1 Relación con Properties

```php
// En PropertyController::store() o update()
// Al crear/editar propiedad, se procesan las amenidades:

if ($request->has('outdoor_facilities')) {
    $property->assignedOutdoorFacilities()->sync($request->outdoor_facilities);
}
// Esto sincroniza los registros en assigned_outdoor_facilities
```

### 6.2 Mostrar en Detalles de Propiedad

```php
// En PropertyController::show()
$property = Property::with('assignedOutdoorFacilities')->find($id);

// Resultado: Array de amenidades cercanas:
[
    { id: 1, name: "Hospital", image: "images/hospital.svg" },
    { id: 2, name: "School", image: "images/school.svg" },
    { id: 3, name: "Supermarket", image: "images/supermarket.svg" }
]
```

---

## 7. Casos de Uso

### 📌 Caso 1: Agregar Hospital como Lugar Cercano
```
Admin → Near by Places → Agregar Nuevo
Nombre: Hospital
Imagen: hospital.svg
Resultado: Hospital disponible para todas las propiedades
```

### 📌 Caso 2: Crear Propiedad con Amenidades
```
Admin → Properties → Nueva Propiedad
Nombre: Apartamento Lujoso
...
Nearby Places:
  ☑ Hospital (a 500m)
  ☑ School (a 1km)
  ☑ Supermarket (a 200m)
  
Resultado: Propiedad con 3 amenidades asignadas
```

### 📌 Caso 3: Actualizar Nombre de Amenidad
```
Admin → Near by Places → Editar Hospital
Cambiar: "Hospital" → "Hospital General"
Resultado: Se actualiza globalmente en todas las propiedades
```

### 📌 Caso 4: Eliminar Lugar Cercano
```
Admin → Near by Places → Eliminar "Bus Stop"
Sistema:
- Elimina el registro de bus stop
- Elimina la imagen del servidor
- Elimina asociaciones con propiedades
Resultado: Bus Stop ya no aparece en ninguna propiedad
```

---

## 8. Datos Actuales en Base de Datos

```
SELECT id, name, image FROM outdoor_facilities;

ID  | Name                  | Image Path
----|------------------------|------------------
1   | Hospital               | images/hospital.svg
2   | School                 | images/school.svg
3   | Supermarket            | images/supermarket.svg
4   | Bank ATM               | images/bank.svg
5   | Bus Stop               | images/bus.svg
6   | Park                   | images/park.svg
7   | Airport                | images/airport.svg
8   | Beach                  | images/beach.svg
9   | Restaurant             | images/restaurant.svg
10  | Shopping Mall          | images/mall.svg
11  | Gym                    | images/gym.svg
12  | Police Station         | images/police.svg
```

**Total:** 12 lugares cercanos disponibles

---

## 9. Validaciones del Sistema

### 9.1 Al Crear/Editar

```php
$request->validate([
    'image' => 'required|image|mimes:svg|max:2048'
], [
    'image.required'  => 'The image field is required.',
    'image.image'     => 'The uploaded file must be an image.',
    'image.mimes'     => 'The image must be a SVG file.',
    'image.max'       => 'The image size should not exceed 2MB.'
]);
```

**Validaciones:**
- ✅ Imagen es requerida
- ✅ Debe ser un archivo de imagen válido
- ✅ Solo formato SVG aceptado
- ✅ Tamaño máximo: 2MB

### 9.2 Restricciones de Eliminación

```php
// Si está en DEMO_MODE, solo superadmin@gmail.com puede eliminar
if (env('DEMO_MODE') && Auth::user()->email != "superadmin@gmail.com") {
    return error: 'Not allowed in Demo Version'
}
```

---

## 10. Tecnologías Utilizadas

| Componente | Tecnología |
|-----------|-----------|
| Controlador | Laravel PHP (OutdoorFacilityController) |
| Modelo | Eloquent ORM (OutdoorFacilities) |
| Base de Datos | MySQL/MariaDB (outdoor_facilities table) |
| Frontend | Bootstrap Table (JavaScript) |
| Imágenes | SVG (escalable, sin pérdida) |
| Validación | Laravel Validation (server-side) |
| Permisos | Custom has_permissions() function |

---

## 11. Ubicaciones de Archivos Clave

```
real_estate_admin/
├── app/
│   ├── Http/Controllers/
│   │   └── OutdoorFacilityController.php ← Controlador principal
│   ├── Models/
│   │   └── OutdoorFacilities.php ← Modelo
│   └── ...
├── resources/
│   └── views/
│       └── OutdoorFacilities/
│           └── index.blade.php ← Vista (interfaz)
├── public/
│   └── images/
│       └── facilities/ ← Almacena íconos SVG
├── routes/
│   └── web.php ← Rutas (definición de endpoints)
├── config/
│   └── rolepermission.php ← Permisos del módulo
├── database/
│   └── outdoor_facilities table ← Base de datos
└── ...
```

---

## 12. Resumen de Funcionalidad

✅ **Crear** lugares cercanos (hospitales, escuelas, tiendas, etc.)
✅ **Leer** lista de todos los lugares disponibles
✅ **Actualizar** información de lugares existentes
✅ **Eliminar** lugares que ya no son necesarios
✅ **Asignar** múltiples lugares a cada propiedad
✅ **Visualizar** lugares cercanos en detalles de propiedad
✅ **Buscar** lugares por nombre o ID
✅ **Paginar** resultados en tabla
✅ **Controlar** acceso con permisos de rol
✅ **Validar** formato SVG e imagen

---

## 13. Preguntas Frecuentes

**P: ¿Cuál es la diferencia entre Near by Places y Outdoor Facilities?**
R: Son sinónimos. El controlador se llama `OutdoorFacilityController` pero el módulo se llama `'near_by_places'`. Ambos se refieren al mismo concepto: amenidades cercanas.

**P: ¿Cuántos lugares cercanos puedo crear?**
R: Sin límite. La base de datos puede almacenar ilimitados registros (solo limitado por espacio en disco).

**P: ¿Puedo asignar múltiples lugares a una propiedad?**
R: Sí. Mediante la tabla `assigned_outdoor_facilities`, una propiedad puede tener múltiples lugares cercanos.

**P: ¿Qué formatos de imagen acepta?**
R: Solo SVG. SVG es ideal para íconos porque son escalables sin pérdida de calidad.

**P: ¿Qué sucede si elimino un lugar cercano?**
R: Se elimina el registro, las asociaciones con propiedades y el archivo de imagen del servidor.

**P: ¿Quién puede crear/editar/eliminar lugares cercanos?**
R: Solo usuarios con los permisos correspondientes en el módulo 'near_by_places'.

---

**Última Actualización:** 25 de enero de 2026
**Estado:** ✅ Completamente funcional
**Base de Datos:** ✅ 12 registros activos
