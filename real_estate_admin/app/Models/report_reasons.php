<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class report_reasons extends Model
{
    use HasFactory;

    protected $table = 'report_reasons';
    public $timestamps = false;

    protected $fillable = ['reason', 'names'];
    protected $casts = ['names' => 'json'];

    public function getLocalizedName($locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        if (!$this->names) {
            return $this->attributes['reason'] ?? '';
        }
        $key = "reason_" . $locale;
        return $this->names[$key] ?? $this->names['reason_en'] ?? $this->attributes['reason'] ?? '';
    }

    public function getReasonAttribute($value)
    {
        return $this->getLocalizedName();
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['reason'] = $this->getLocalizedName();
        return $array;
    }
}
