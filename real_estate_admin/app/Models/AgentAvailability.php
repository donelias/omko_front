<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentAvailability extends Model
{
    use HasFactory;

    protected $table = 'agent_availabilities';

    protected $fillable = [
        'agent_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'break_start',
        'break_end',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const MONDAY = 0;
    const TUESDAY = 1;
    const WEDNESDAY = 2;
    const THURSDAY = 3;
    const FRIDAY = 4;
    const SATURDAY = 5;
    const SUNDAY = 6;

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

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeUnavailable($query)
    {
        return $query->where('is_available', false);
    }

    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    // ============================================
    // MÉTODOS
    // ============================================

    public function getDayNameAttribute()
    {
        $days = [
            self::MONDAY => 'Lunes',
            self::TUESDAY => 'Martes',
            self::WEDNESDAY => 'Miércoles',
            self::THURSDAY => 'Jueves',
            self::FRIDAY => 'Viernes',
            self::SATURDAY => 'Sábado',
            self::SUNDAY => 'Domingo',
        ];

        return $days[$this->day_of_week] ?? 'Desconocido';
    }

    public function getDayShortNameAttribute()
    {
        $days = [
            self::MONDAY => 'Lun',
            self::TUESDAY => 'Mar',
            self::WEDNESDAY => 'Mié',
            self::THURSDAY => 'Jue',
            self::FRIDAY => 'Vie',
            self::SATURDAY => 'Sáb',
            self::SUNDAY => 'Dom',
        ];

        return $days[$this->day_of_week] ?? '?';
    }

    /**
     * Verifica si el agente está disponible en una hora específica
     */
    public function isAvailableAt($time)
    {
        if (!$this->is_available) {
            return false;
        }

        // Convertir a minutos desde las 00:00
        $timeInMinutes = strtotime($time) % 86400 / 60;
        $startInMinutes = strtotime($this->start_time) % 86400 / 60;
        $endInMinutes = strtotime($this->end_time) % 86400 / 60;

        // Verificar si está dentro del rango de trabajo
        if ($timeInMinutes < $startInMinutes || $timeInMinutes > $endInMinutes) {
            return false;
        }

        // Verificar si está en un descanso
        if ($this->break_start && $this->break_end) {
            $breakStartInMinutes = strtotime($this->break_start) % 86400 / 60;
            $breakEndInMinutes = strtotime($this->break_end) % 86400 / 60;

            if ($timeInMinutes >= $breakStartInMinutes && $timeInMinutes <= $breakEndInMinutes) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene los slots disponibles para una fecha específica
     */
    public static function getAvailableSlotsForAgent($agentId, $date, $slotDuration = 30)
    {
        $dayOfWeek = date('w', strtotime($date)); // 0 = domingo, 1 = lunes, etc.
        
        // Convertir a nuestro formato (lunes = 0)
        $dayOfWeek = ($dayOfWeek === 0) ? 6 : $dayOfWeek - 1;

        $availability = self::where('agent_id', $agentId)
                            ->where('day_of_week', $dayOfWeek)
                            ->where('is_available', true)
                            ->first();

        if (!$availability) {
            return [];
        }

        $slots = [];
        $start = strtotime($availability->start_time);
        $end = strtotime($availability->end_time);
        $breakStart = $availability->break_start ? strtotime($availability->break_start) : null;
        $breakEnd = $availability->break_end ? strtotime($availability->break_end) : null;

        for ($time = $start; $time < $end; $time += ($slotDuration * 60)) {
            // Skip if in break
            if ($breakStart && $breakEnd && $time >= $breakStart && $time < $breakEnd) {
                continue;
            }

            // Check if appointment already exists
            $slotDateTime = date('Y-m-d H:i:s', $time);
            $hasAppointment = Appointment::where('agent_id', $agentId)
                                         ->where('appointment_date', $date)
                                         ->whereTime('appointment_time', date('H:i', $time))
                                         ->exists();

            if (!$hasAppointment) {
                $slots[] = date('H:i', $time);
            }
        }

        return $slots;
    }

    public function getWorkingHoursLabel()
    {
        return "{$this->start_time} - {$this->end_time}";
    }

    public function getBreakTimeLabel()
    {
        if (!$this->break_start || !$this->break_end) {
            return 'Sin descanso programado';
        }

        return "{$this->break_start} - {$this->break_end}";
    }
}
