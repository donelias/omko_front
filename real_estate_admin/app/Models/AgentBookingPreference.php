<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentBookingPreference extends Model
{
    protected $table = 'agent_booking_preferences';

    protected $fillable = [
        'agent_id',
        'allow_bookings',
        'booking_advance_days',
        'max_daily_bookings',
        'allow_weekend_bookings',
        'allow_evening_bookings',
        'preferred_booking_duration',
        'auto_accept_bookings',
        'booking_confirmation_message',
        'cancellation_policy',
        'settings',
    ];

    protected $casts = [
        'allow_bookings' => 'boolean',
        'booking_advance_days' => 'integer',
        'max_daily_bookings' => 'integer',
        'allow_weekend_bookings' => 'boolean',
        'allow_evening_bookings' => 'boolean',
        'preferred_booking_duration' => 'integer',
        'auto_accept_bookings' => 'boolean',
        'settings' => 'array',
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
     * Scope to get agents accepting bookings
     */
    public function scopeAcceptingBookings($query)
    {
        return $query->where('allow_bookings', true);
    }

    /**
     * Scope to get auto-accepting agents
     */
    public function scopeAutoAccepting($query)
    {
        return $query->where('auto_accept_bookings', true);
    }

    /**
     * Scope to get by agent
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Check if agent can accept more bookings today
     */
    public function canAcceptMoreBookingsToday()
    {
        $todayBookings = Appointment::where('agent_id', $this->agent_id)
            ->whereDate('appointment_date', today())
            ->count();

        return $todayBookings < $this->max_daily_bookings;
    }
}
