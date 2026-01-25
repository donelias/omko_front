<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutdoorFacilities extends Model
{
    use HasFactory;

    /**
     * Castear names como JSON automáticamente
     */
    protected $casts = [
        'names' => 'json',
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
        
        // Si names está vacío, retornar el campo 'name' como fallback
        if (!$this->names) {
            return $this->name;
        }
        
        // Retornar la traducción solicitada, o fallback a 'en', o el nombre original
        return $this->names[$locale] ?? $this->names['en'] ?? $this->name ?? '';
    }

    /**
     * Accessor: Cuando accedes a $facility->name, retorna el nombre localizado
     */
    public function getNameAttribute($value)
    {
        // Retornar nombre traducido automáticamente
        return $this->getLocalizedName();
    }

    public function getImageAttribute($image)
    {
        return $image != "" ? url('') . config('global.IMG_PATH') . config('global.FACILITY_IMAGE_PATH')  . $image : "";
    }
    
    public function assign_facilities()
    {
        return $this->hasMany(AssignedOutdoorFacilities::class, 'facility_id');
    }
}
