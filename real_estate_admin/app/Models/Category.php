<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'category',
        'names',
        'image',
        'status',
        'sequence',
        'parameter_types'
    ];

    /**
     * Castear names como JSON automáticamente
     */
    protected $casts = [
        'names' => 'json',
    ];

    protected $hidden = [
        'updated_at'
    ];

    /**
     * Obtener el nombre localizado según el idioma actual
     * 
     * @param string $locale - Código de idioma (ej: 'es', 'en'). Por defecto usa la locale actual
     * @return string
     */
    public function getLocalizedName($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        
        // Si names está vacío, retornar el campo 'category' original como fallback
        if (!$this->names) {
            return $this->attributes['category'] ?? '';
        }
        
        // Retornar la traducción solicitada, o fallback a 'en', o el nombre original
        return $this->names[$locale] ?? $this->names['en'] ?? $this->attributes['category'] ?? '';
    }

    /**
     * Accessor: Retorna el nombre traducido cuando accedes a category
     */
    public function getCategoryAttribute($value)
    {
        // $value es el valor original del campo 'category' en la BD
        // Retorna el nombre localizado
        return $this->getLocalizedName();
    }

    /**
     * Personalizar la serialización a array/JSON
     * Asegura que 'category' se serializa con el valor traducido
     */
    public function toArray()
    {
        $array = parent::toArray();
        // Sobrescribir el campo category con el valor traducido
        $locale = app()->getLocale();
        $translated = $this->getLocalizedName($locale);
        $array['category'] = $translated;
        return $array;
    }

    public function parameter()
    {
        return $this->hasMany(parameter::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function getImageAttribute($image)
    {
        return $image != "" ? url('') . config('global.IMG_PATH') . config('global.CATEGORY_IMG_PATH') . $image : '';
    }
}
