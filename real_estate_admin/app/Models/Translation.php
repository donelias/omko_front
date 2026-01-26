<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $table = 'translations';

    protected $fillable = [
        'translatable_type',
        'translatable_id',
        'key',
        'value',
        'locale',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the owning translatable model
     */
    public function translatable()
    {
        return $this->morphTo();
    }

    /**
     * Scope to get translations by locale
     */
    public function scopeByLocale($query, $locale)
    {
        return $query->where('locale', $locale);
    }

    /**
     * Scope to get translations by key
     */
    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Scope to get translations by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('translatable_type', $type);
    }
}
