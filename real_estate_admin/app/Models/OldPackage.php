<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OldPackage extends Model
{
    protected $table = 'old_packages';

    protected $fillable = [
        'name',
        'description',
        'price',
        'listing_limit',
        'featured_limit',
        'prime_limit',
        'duration_days',
        'features',
        'status',
        'position',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'listing_limit' => 'integer',
        'featured_limit' => 'integer',
        'prime_limit' => 'integer',
        'duration_days' => 'integer',
        'features' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get purchased packages
     */
    public function purchasedPackages()
    {
        return $this->hasMany(OldUserPurchasedPackage::class, 'old_package_id');
    }

    /**
     * Scope to get active packages
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get ordered by position
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('position', 'asc');
    }

    /**
     * Scope to get by price range
     */
    public function scopeByPriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}
