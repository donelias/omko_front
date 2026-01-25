<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectPlans extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'translations',
        'document'
    ];

    protected $casts = [
        'translations' => 'json',
    ];

    public function getDocumentAttribute($name)
    {
        return $name != '' ? url('') . config('global.IMG_PATH') . config('global.PROJECT_DOCUMENT_PATH') . $name : '';
    }

    public function getLocalizedTitle($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->translations) {
            return $this->attributes['title'] ?? '';
        }
        $key = "title_" . $locale;
        return $this->translations[$key] ?? $this->translations['title_en'] ?? $this->attributes['title'] ?? '';
    }

    public function getLocalizedDescription($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->translations) {
            return $this->attributes['description'] ?? '';
        }
        $key = "description_" . $locale;
        return $this->translations[$key] ?? $this->translations['description_en'] ?? $this->attributes['description'] ?? '';
    }

    public function getTitleAttribute($value)
    {
        return $this->getLocalizedTitle();
    }

    public function getDescriptionAttribute($value)
    {
        return $this->getLocalizedDescription();
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['title'] = $this->getLocalizedTitle();
        $array['description'] = $this->getLocalizedDescription();
        return $array;
    }
}
