<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentExtraTimeSlot extends Model
{
    protected $table = 'agent_extra_time_slots';

    protected $fillable = [
        'agent_id',
        'appointment_id',
        'day_of_week',
        'start_time',
        'end_time',
        'max_appointments',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_appointments' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the agent
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get appointments for this slot
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'appointment_id');
    }

    /**
     * Scope to get active slots
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get by day of week
     */
    public function scopeByDay($query, $day)
    {
        return $query->where('day_of_week', $day);
    }

    /**
     * Scope to get by agent
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Check if slot is available
     */
    public function isAvailable()
    {
        $bookedCount = $this->appointments()->count();
        return $bookedCount < $this->max_appointments;
    }
}
