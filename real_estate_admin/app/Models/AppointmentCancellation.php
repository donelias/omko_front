<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentCancellation extends Model
{
    use HasFactory;

    protected $table = 'appointment_cancellations';

    protected $fillable = [
        'appointment_id',
        'reason',
        'cancelled_by',
        'cancelled_at',
        'notes',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const REASON_USER_CANCELLED = 'user_cancelled';
    const REASON_AGENT_CANCELLED = 'agent_cancelled';
    const REASON_ADMIN_CANCELLED = 'admin_cancelled';
    const REASON_PROPERTY_UNAVAILABLE = 'property_unavailable';
    const REASON_AGENT_UNAVAILABLE = 'agent_unavailable';
    const REASON_PERSONAL_REASONS = 'personal_reasons';
    const REASON_OTHER = 'other';

    // ============================================
    // RELACIONES
    // ============================================

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // ============================================
    // MÉTODOS
    // ============================================

    public function getReasonLabel()
    {
        $labels = [
            self::REASON_USER_CANCELLED => 'Cancelada por Usuario',
            self::REASON_AGENT_CANCELLED => 'Cancelada por Agente',
            self::REASON_ADMIN_CANCELLED => 'Cancelada por Administrador',
            self::REASON_PROPERTY_UNAVAILABLE => 'Propiedad no Disponible',
            self::REASON_AGENT_UNAVAILABLE => 'Agente no Disponible',
            self::REASON_PERSONAL_REASONS => 'Razones Personales',
            self::REASON_OTHER => 'Otra Razón',
        ];

        return $labels[$this->reason] ?? $this->reason;
    }
}
