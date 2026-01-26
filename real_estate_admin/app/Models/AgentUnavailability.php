<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentUnavailability extends Model
{
    use HasFactory;

    protected $table = 'agent_unavailabilities';

    protected $fillable = [
        'agent_id',
        'title',
        'reason',
        'start_date',
        'end_date',
        'is_blocked',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_blocked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const REASON_VACATION = 'vacation';
    const REASON_SICK_LEAVE = 'sick_leave';
    const REASON_PERSONAL = 'personal';
    const REASON_TRAINING = 'training';
    const REASON_OTHER = 'other';

    // ============================================
    // RELACIONES
    // ============================================

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_blocked', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_blocked', false);
    }

    public function scopeForReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    public function scopeCurrently($query)
    {
        return $query->where('start_date', '<=', now()->toDateString())
                     ->where('end_date', '>=', now()->toDateString());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now()->toDateString());
    }

    public function scopePast($query)
    {
        return $query->where('end_date', '<', now()->toDateString());
    }

    // ============================================
    // MÉTODOS
    // ============================================

    /**
     * Verifica si el agente está actualmente en un período de indisponibilidad
     */
    public function isCurrentlyUnavailable()
    {
        return $this->start_date <= now()->toDateString() &&
               $this->end_date >= now()->toDateString() &&
               $this->is_blocked;
    }

    /**
     * Verifica si el agente tendrá un período de indisponibilidad en una fecha específica
     */
    public function coversDate($date)
    {
        $dateStr = is_string($date) ? $date : $date->toDateString();
        return $this->start_date <= $dateStr && $this->end_date >= $dateStr && $this->is_blocked;
    }

    /**
     * Obtiene la duración en días
     */
    public function getDaysAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Obtiene etiqueta de la razón
     */
    public function getReasonLabel()
    {
        $labels = [
            self::REASON_VACATION => 'Vacaciones',
            self::REASON_SICK_LEAVE => 'Licencia por Enfermedad',
            self::REASON_PERSONAL => 'Razones Personales',
            self::REASON_TRAINING => 'Capacitación',
            self::REASON_OTHER => 'Otra Razón',
        ];

        return $labels[$this->reason] ?? $this->reason;
    }

    /**
     * Obtiene el estado
     */
    public function getStatusLabel()
    {
        if ($this->isCurrentlyUnavailable()) {
            return 'En Progreso';
        }

        if ($this->start_date > now()->toDateString()) {
            return 'Próximo';
        }

        return 'Completado';
    }

    /**
     * Verifica si es vacaciones
     */
    public function isVacation()
    {
        return $this->reason === self::REASON_VACATION;
    }

    /**
     * Verifica si es licencia por enfermedad
     */
    public function isSickLeave()
    {
        return $this->reason === self::REASON_SICK_LEAVE;
    }

    public function toArray()
    {
        $array = parent::toArray();
        
        $array['days'] = $this->getDaysAttribute();
        $array['reason_label'] = $this->getReasonLabel();
        $array['status'] = $this->getStatusLabel();
        $array['is_current'] = $this->isCurrentlyUnavailable();

        return $array;
    }
}
