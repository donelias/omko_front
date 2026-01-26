<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OldUserData extends Model
{
    protected $table = 'old_user_data';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'original_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get purchased packages
     */
    public function purchasedPackages()
    {
        return $this->hasMany(OldUserPurchasedPackage::class, 'old_user_id');
    }
}
