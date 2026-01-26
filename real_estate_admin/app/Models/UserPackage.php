<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPackage extends Model
{
    protected $table = 'user_packages';

    protected $fillable = [
        'user_id',
        'package_id',
        'purchased_at',
        'expires_at',
        'quantity_used',
        'quantity_remaining',
        'is_active',
        'auto_renew',
        'renewal_date',
        'price_paid',
        'payment_method',
        'transaction_id',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'expires_at' => 'datetime',
        'renewal_date' => 'datetime',
        'quantity_used' => 'integer',
        'quantity_remaining' => 'integer',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
        'price_paid' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the package
     */
    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Get bank receipt files
     */
    public function bankReceiptFiles()
    {
        return $this->hasMany(BankReceiptFile::class, 'user_package_id');
    }

    /**
     * Scope to get active packages
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
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
        return $query->where('is_active', false)
            ->orWhere('expires_at', '<', now());
    }

    /**
     * Scope to get by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get expiring soon (within 7 days)
     */
    public function scopeExpiringSoon($query)
    {
        return $query->whereBetween('expires_at', [now(), now()->addDays(7)]);
    }

    /**
     * Check if package has available quota
     */
    public function hasQuotaAvailable()
    {
        return $this->quantity_remaining > 0 && $this->is_active;
    }
}
