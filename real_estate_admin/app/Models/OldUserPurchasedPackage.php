<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OldUserPurchasedPackage extends Model
{
    protected $table = 'old_user_purchased_packages';

    protected $fillable = [
        'old_user_id',
        'old_package_id',
        'purchased_at',
        'expires_at',
        'quantity',
        'price_paid',
        'status',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'expires_at' => 'datetime',
        'quantity' => 'integer',
        'price_paid' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the old user
     */
    public function oldUser()
    {
        return $this->belongsTo(OldUserData::class, 'old_user_id');
    }

    /**
     * Get the old package
     */
    public function oldPackage()
    {
        return $this->belongsTo(OldPackage::class, 'old_package_id');
    }

    /**
     * Scope to get active packages
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            });
    }

    /**
     * Scope to get expired packages
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    /**
     * Scope to get by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('old_user_id', $userId);
    }
}
