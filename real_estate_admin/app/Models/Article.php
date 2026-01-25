<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Intervention\Image\ImageManagerStatic as Image;
use kornrunner\Blurhash\Blurhash;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'contents',
        'image',
        'category_id',
        'status'
    ];

    protected $casts = [
        'contents' => 'json',
    ];

    public function getimageAttribute($image)
    {
        return $image != '' ? url('') . config('global.IMG_PATH') . config('global.ARTICLE_IMG_PATH') . $image : '';
    }

    public function getLocalizedTitle($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->contents) {
            return $this->attributes['title'] ?? '';
        }
        $key = "title_" . $locale;
        return $this->contents[$key] ?? $this->contents['title_en'] ?? $this->attributes['title'] ?? '';
    }

    public function getLocalizedDescription($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->contents) {
            return $this->attributes['description'] ?? '';
        }
        $key = "description_" . $locale;
        return $this->contents[$key] ?? $this->contents['description_en'] ?? $this->attributes['description'] ?? '';
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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
