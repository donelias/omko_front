<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'ios_product_id',
        'name',
        'names',
        'duration',
        'price',
        'status',
        'property_limit',
        'advertisement_limit',
        'type',
        'is_default',
    ];

    protected $casts = [
        'names' => 'json',
    ];

    public function userPurchases()
    {
        return $this->hasMany(UserPurchasedPackage::class, 'package_id');
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
