<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RejectReason extends Model
{
    protected $table = 'reject_reasons';

    protected $fillable = [
        'reason_type',
        'reason',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to get active reasons
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope to get reasons by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('reason_type', $type);
    }
}
