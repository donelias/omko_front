<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentReschedule extends Model
{
    use HasFactory;

    protected $table = 'appointment_reschedules';

    protected $fillable = [
        'appointment_id',
        'original_date',
        'original_time',
        'new_date',
        'new_time',
        'rescheduled_by',
        'reason',
        'notes',
    ];

    protected $casts = [
        'original_date' => 'date',
        'original_time' => 'datetime',
        'new_date' => 'date',
        'new_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const REASON_USER_REQUEST = 'user_request';
    const REASON_AGENT_REQUEST = 'agent_request';
    const REASON_ADMIN_REQUEST = 'admin_request';
    const REASON_CONFLICT = 'conflict';
    const REASON_UNAVAILABLE = 'unavailable';
    const REASON_OTHER = 'other';

    // ============================================
    // RELACIONES
    // ============================================

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function rescheduledBy()
    {
        return $this->belongsTo(User::class, 'rescheduled_by');
    }

    // ============================================
    // MÉTODOS
    // ============================================

    public function getReasonLabel()
    {
        $labels = [
            self::REASON_USER_REQUEST => 'Solicitud del Usuario',
            self::REASON_AGENT_REQUEST => 'Solicitud del Agente',
            self::REASON_ADMIN_REQUEST => 'Solicitud del Administrador',
            self::REASON_CONFLICT => 'Conflicto de Horario',
            self::REASON_UNAVAILABLE => 'No Disponible',
            self::REASON_OTHER => 'Otra Razón',
        ];

        return $labels[$this->reason] ?? $this->reason;
    }

    public function getTimeShiftAttribute()
    {
        $originalDateTime = $this->original_date->setTimeFromTimeString(
            $this->original_time->format('H:i:s')
        );
        
        $newDateTime = $this->new_date->setTimeFromTimeString(
            $this->new_time->format('H:i:s')
        );

        $diff = $newDateTime->diffInMinutes($originalDateTime);
        
        if ($diff == 0) {
            return 'Sin cambio de tiempo';
        }

        if ($diff > 0) {
            $hours = intval($diff / 60);
            $minutes = $diff % 60;
            return "Adelantado: {$hours}h {$minutes}m";
        }

        $diff = abs($diff);
        $hours = intval($diff / 60);
        $minutes = $diff % 60;
        return "Atrasado: {$hours}h {$minutes}m";
    }
}
