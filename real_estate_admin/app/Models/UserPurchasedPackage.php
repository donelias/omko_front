<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPurchasedPackage extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'modal_id',
        'modal_type',
        'package_id',
        'start_date',
        'end_date',
        'used_limit_for_property',
        'used_limit_for_advertisement',
    ];
    
    public function modal()
    {
        return $this->morphTo();
    }
    
    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
