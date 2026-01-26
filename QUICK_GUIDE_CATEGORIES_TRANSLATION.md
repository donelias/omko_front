# 📋 Guía Rápida: Aplicar Traducción a Categories

## Patrón Establecido: Opción 2 (JSON en Tabla)

Ya probamos este patrón exitosamente con Facilities. Ahora vamos a replicarlo para Categories.

---

## 📊 Estructura Actual vs. Objetivo

### ACTUAL:
```sql
categories
├─ id
├─ category (varchar - solo inglés)
├─ parameter_types
├─ image
├─ slug_id
└─ ... (SEO fields)
```

### OBJETIVO:
```sql
categories
├─ id
├─ names (JSON - {en: "Villa", es: "Villa"})  ← NUEVO
├─ category (varchar - mantener por compatibilidad temporal)
├─ parameter_types
├─ image
├─ slug_id
└─ ... (SEO fields)
```

---

## 🔄 3 Pasos Simples (Copiando Patrón de Facilities)

### PASO 1: Crear Migración
```bash
php artisan make:migration update_categories_add_names_json --table=categories
```

**Contenido:**
```php
public function up(): void
{
    Schema::table('categories', function (Blueprint $table) {
        $table->json('names')->nullable()->after('id')
            ->comment('JSON with translations: {en: "...", es: "..."}');
    });
}

public function down(): void
{
    Schema::table('categories', function (Blueprint $table) {
        $table->dropColumn('names');
    });
}
```

---

### PASO 2: Data Migration con Traducciones

```bash
php artisan make:migration seed_categories_translations --create=false
```

**Mapeo de Traducciones:**

| Inglés | Español |
|--------|---------|
| Villa | Villa |
| Penthouse | Ático |
| Banglow | Bungaló |
| House | Casa |
| Land | Terreno |
| Apartment | Apartamento |
| Studio | Estudio |
| Commercial | Comercial |
| Industrial | Industrial |
| Agricultural | Agrícola |

**Contenido:**
```php
public function up(): void
{
    $translations = [
        'Villa' => 'Villa',
        'Penthouse' => 'Ático',
        'Banglow' => 'Bungaló',
        'House' => 'Casa',
        'Land' => 'Terreno',
        'Apartment' => 'Apartamento',
        'Studio' => 'Estudio',
        'Commercial' => 'Comercial',
        'Industrial' => 'Industrial',
        'Agricultural' => 'Agrícola',
    ];

    foreach ($translations as $en => $es) {
        DB::table('categories')
            ->where('category', $en)
            ->update([
                'names' => json_encode([
                    'en' => $en,
                    'es' => $es,
                ]),
            ]);
    }
}
```

---

### PASO 3: Actualizar Modelo

**Archivo:** `app/Models/Category.php`

```php
class Category extends Model
{
    use HasFactory;

    // Cast JSON automático
    protected $casts = [
        'names' => 'json',
    ];

    /**
     * Obtener nombre localizado
     */
    public function getLocalizedName($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        
        if (!$this->names) {
            return $this->category;
        }
        
        return $this->names[$locale] ?? $this->names['en'] ?? $this->category ?? '';
    }

    /**
     * Accessor: Automáticamente retorna nombre traducido
     */
    public function getCategoryAttribute($value)
    {
        return $this->getLocalizedName();
    }

    // ... resto del modelo ...
}
```

---

## ⚙️ Actualizar Controladores (si aplica)

Si el API retorna categorías, actualizar el controlador de la misma forma que **ApiController::get_facilities()**:

```php
// En ApiController.php (si existe método get_categories)
public function get_categories(Request $request)
{
    $categories = Category::all();

    // Mapear para asegurar traducción correcta
    $data = $categories->map(function ($category) {
        return [
            'id' => $category->id,
            'category' => $category->category,  // ← Automáticamente traducido
            'slug_id' => $category->slug_id,
            'image' => $category->image,
            // ... otros campos
        ];
    });

    return response()->json([
        'data' => $data,
        'message' => 'Categories fetched successfully'
    ]);
}
```

---

## 📋 Checklist para Categories

- [ ] Crear migración `update_categories_add_names_json`
- [ ] Crear data migration `seed_categories_translations`
- [ ] Ejecutar: `php artisan migrate --force`
- [ ] Actualizar modelo `Category.php`
- [ ] Actualizar API (si existe `get_categories`)
- [ ] Actualizar vistas Blade que usen `$category->category`
- [ ] Testear en tinker:
  ```php
  $c = Category::first();
  app()->setLocale('es');
  echo $c->category;  // Debería mostrar en español
  ```
- [ ] Testear en API

---

## 🔄 Misma Lógica para Otros Módulos

Una vez entiendes el patrón, puedes aplicarlo a:

```
✅ Facilities (COMPLETADO)
- [ ] Categories (PRÓXIMO)
- [ ] Property Types
- [ ] User Types
- [ ] Parameters
- [ ] Amenities
- [ ] Etc.
```

**Patrón:**
1. Crear migración: Agregar columna JSON `names`
2. Data migration: Poblar JSON con traducciones
3. Modelo: Agregar casts + accessor
4. API: Mapear resultados
5. Testear

---

## 💡 Comandos Útiles

```bash
# Ver estructura actual de categories
mysql> DESC categories;

# Ver datos actuales
mysql> SELECT id, category FROM categories;

# Verificar JSON después de data migration
mysql> SELECT id, names FROM categories LIMIT 3;

# Prueba en tinker
php artisan tinker
> Category::first()->category

# Ejecutar migraciones
php artisan migrate --force

# Rollback si hay error
php artisan migrate:rollback --force
```

---

## ⚡ Performance Esperado

**Categories con JSON:**
- 1 query (sin JOINs)
- 2-4ms por request
- 3-6x más rápido que tabla separada

---

## 📝 Notas Importantes

1. **Mantener compatibilidad:** Dejar el campo `category` por ahora (para fallback)
2. **Accessor automático:** El accessor garantiza que `$category->category` siempre retorna traducido
3. **Idioma actual:** El accessor respeta `app()->getLocale()`
4. **Fallback:** Si falta la traducción, usa inglés

---

## 🎯 Objetivo Final

Después de implementar Categories:
- ✅ Facilities traducidas dinámicamente
- ✅ Categories traducidas dinámicamente
- ✅ API retorna datos siempre en el idioma correcto
- ✅ Frontend ve cambios automáticamente al cambiar idioma

---

**¿Listo para implementar Categories?** 🚀

