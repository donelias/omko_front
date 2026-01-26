<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdBanner extends Model
{
    protected $table = 'ad_banners';

    protected $fillable = [
        'page',
        'platform',
        'placement',
        'banner_image',
        'ad_type',
        'external_link_url',
        'property_id',
        'duration',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'duration' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the property associated with the banner
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    /**
     * Scope to get active banners
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope to get banners by page
     */
    public function scopeByPage($query, $page)
    {
        return $query->where('page', $page);
    }

    /**
     * Scope to get banners by platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }
}
