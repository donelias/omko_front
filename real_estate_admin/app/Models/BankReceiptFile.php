<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankReceiptFile extends Model
{
    protected $table = 'bank_receipt_files';

    protected $fillable = [
        'user_package_id',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
        'status',
        'verified_at',
        'verified_by',
        'rejection_reason',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user package
     */
    public function userPackage()
    {
        return $this->belongsTo(UserPackage::class, 'user_package_id');
    }

    /**
     * Get the user who verified
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope to get pending verification
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get verified receipts
     */
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /**
     * Scope to get rejected receipts
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope to get by user package
     */
    public function scopeByUserPackage($query, $packageId)
    {
        return $query->where('user_package_id', $packageId);
    }
}
