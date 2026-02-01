<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignedOutdoorFacilities extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'facility_id',
        'property_id',
        'distance'
    ];
    
    public function outdoorfacilities()
    {
        return $this->belongsTo(OutdoorFacilities::class, 'facility_id');
    }
}
