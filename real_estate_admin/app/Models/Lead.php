<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $table = 'leads';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'country',
        'property_id',
        'agent_id',
        'meta_lead_id',
        'meta_campaign_id',
        'meta_ad_id',
        'meta_form_id',
        'status',
        'source',
        'notes',
        'contacted_at',
        'converted_at',
        'meta_data',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'contacted_at' => 'datetime',
        'converted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'updated_at',
    ];

    protected $appends = [
        'full_name',
        'status_badge',
    ];

    /**
     * Relación con Property
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'id');
    }

    /**
     * Relación con Agent (Customer)
     */
    public function agent()
    {
        return $this->belongsTo(Customer::class, 'agent_id', 'id');
    }

    /**
     * Scope: Leads sin procesar
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope: Leads contactados
     */
    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    /**
     * Scope: Leads convertidos
     */
    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }

    /**
     * Scope: Por propiedad
     */
    public function scopeByProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    /**
     * Scope: Por agente
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Scope: Por período
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Accessors
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . ($this->last_name ?? ''));
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'new' => '<span class="badge badge-info">Nuevo</span>',
            'contacted' => '<span class="badge badge-primary">Contactado</span>',
            'interested' => '<span class="badge badge-success">Interesado</span>',
            'rejected' => '<span class="badge badge-danger">Rechazado</span>',
            'converted' => '<span class="badge badge-success">Convertido</span>',
        ];
        
        return $badges[$this->status] ?? '<span class="badge badge-secondary">Desconocido</span>';
    }

    /**
     * Mutators
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = strtolower($value);
        
        // Actualizar timestamp automáticamente según el estado
        if ($value === 'contacted' && !$this->contacted_at) {
            $this->attributes['contacted_at'] = now();
        } elseif ($value === 'converted' && !$this->converted_at) {
            $this->attributes['converted_at'] = now();
        }
    }

    /**
     * Mark lead as contacted
     */
    public function markAsContacted()
    {
        $this->update([
            'status' => 'contacted',
            'contacted_at' => now(),
        ]);
    }

    /**
     * Mark lead as interested
     */
    public function markAsInterested()
    {
        $this->update([
            'status' => 'interested',
        ]);
    }

    /**
     * Mark lead as converted
     */
    public function markAsConverted()
    {
        $this->update([
            'status' => 'converted',
            'converted_at' => now(),
        ]);
    }

    /**
     * Mark lead as rejected
     */
    public function markAsRejected()
    {
        $this->update([
            'status' => 'rejected',
        ]);
    }

    /**
     * Get lead statistics
     */
    public static function getStatistics($agentId = null, $propertyId = null)
    {
        $query = self::query();

        if ($agentId) {
            $query->where('agent_id', $agentId);
        }

        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        return [
            'total' => $query->count(),
            'new' => (clone $query)->where('status', 'new')->count(),
            'contacted' => (clone $query)->where('status', 'contacted')->count(),
            'interested' => (clone $query)->where('status', 'interested')->count(),
            'converted' => (clone $query)->where('status', 'converted')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'conversion_rate' => $query->count() > 0 
                ? round(((clone $query)->where('status', 'converted')->count() / $query->count()) * 100, 2)
                : 0,
        ];
    }
}
