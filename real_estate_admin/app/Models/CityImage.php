<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CityImage extends Model
{
    use HasFactory;
    protected $table ='city_images';

    protected $fillable = [
        'city',
        'names',
        'image',
        'status'
    ];

    protected $casts = [
        'names' => 'json',
    ];

    public function getImageAttribute($image)
    {
        if($image){
            return $image != '' ? url('') . config('global.IMG_PATH') . config('global.CITY_IMAGE_PATH'). $image : '';
        }
        return null;
    }

    public function getLocalizedName($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->names) {
            return $this->attributes['city'] ?? '';
        }
        return $this->names[$locale] ?? $this->names['en'] ?? $this->attributes['city'] ?? '';
    }

    public function getCityAttribute($value)
    {
        return $this->getLocalizedName();
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['city'] = $this->getLocalizedName();
        return $array;
    }

    public function property(){
        return $this->hasMany(Property::class,'city','city');
    }
}
