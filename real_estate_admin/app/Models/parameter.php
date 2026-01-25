<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class parameter extends Model
{
    use HasFactory;

    protected $table = 'parameters';

    protected $fillable = [
        'name',
        'names',
        'category_id',
        'is_required',
        'options'
    ];
    protected $hidden = ["created_at", "updated_at"];

    protected $casts = [
        'names' => 'json',
    ];

    public function getTypeValuesAttribute($value)
    {
        $a = json_decode($value, true);
        if ($a == NULL) {
            return $value;
        } else {
            return (json_decode($value, true));
        }
    }
    public function getImageAttribute($image)
    {
        return $image != "" ? url('') . config('global.IMG_PATH') . config('global.PARAMETER_IMAGE_PATH')  . $image : "";
    }
    public function assigned_parameter()
    {
        return $this->hasOne(AssignParameters::class, 'parameter_id');
    }

    public function getLocalizedName($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->names) {
            return $this->attributes['name'] ?? '';
        }
        return $this->names[$locale] ?? $this->names['en'] ?? $this->attributes['name'] ?? '';
    }

    public function getNameAttribute($value)
    {
        return $this->getLocalizedName();
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['name'] = $this->getLocalizedName();
        return $array;
    }
}
