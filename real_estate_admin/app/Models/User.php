<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'permissions',
        'slug_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    // ============================================
    // RELACIONES
    // ============================================

    /**
     * Citas donde este usuario es el cliente
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    /**
     * Citas donde este usuario es el agente
     */
    public function agentAppointments()
    {
        return $this->hasMany(Appointment::class, 'agent_id');
    }

    /**
     * Disponibilidades del agente
     */
    public function availabilities()
    {
        return $this->hasMany(AgentAvailability::class, 'agent_id');
    }

    /**
     * Períodos de indisponibilidad del agente
     */
    public function unavailabilities()
    {
        return $this->hasMany(AgentUnavailability::class, 'agent_id');
    }

    /**
     * Transacciones de pago del usuario
     */
    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class, 'user_id');
    }

    /**
     * Límites de paquetes del usuario
     */
    public function packageLimits()
    {
        return $this->hasMany(UserPackageLimit::class, 'user_id');
    }

    /**
     * Reseñas escritas por el usuario
     */
    public function reviews()
    {
        return $this->hasMany(ReviewRating::class, 'user_id');
    }

    /**
     * Reseñas del usuario como agente
     */
    public function agentReviews()
    {
        return $this->hasMany(ReviewRating::class, 'agent_id');
    }

    /**
     * Suscripciones a newsletter
     */
    public function newsletterSubscriptions()
    {
        return $this->hasMany(NewsletterSubscription::class);
    }

    /**
     * Paquetes de usuario activos
     */
    public function userPackages()
    {
        return $this->hasMany(UserPackage::class, 'user_id');
    }

    /**
     * Usuarios bloqueados por este usuario en chat
     */
    public function blockedChatUsers()
    {
        return $this->hasMany(BlockedChatUser::class, 'user_id');
    }

    /**
     * Usuarios que han bloqueado a este usuario en chat
     */
    public function blockedByInChat()
    {
        return $this->hasMany(BlockedChatUser::class, 'blocked_user_id');
    }

    /**
     * Usuarios bloqueados por este usuario para citas
     */
    public function blockedUsersForAppointment()
    {
        return $this->hasMany(BlockedUserForAppointment::class, 'user_id');
    }

    /**
     * Usuarios que han bloqueado a este usuario para citas
     */
    public function blockedByForAppointment()
    {
        return $this->hasMany(BlockedUserForAppointment::class, 'blocked_user_id');
    }

    /**
     * Preferencias de reserva del agente
     */
    public function bookingPreference()
    {
        return $this->hasOne(AgentBookingPreference::class, 'agent_id');
    }

    /**
     * Horarios extra del agente
     */
    public function extraTimeSlots()
    {
        return $this->hasMany(AgentExtraTimeSlot::class, 'agent_id');
    }

    /**
     * Reportes hechos por este agente
     */
    public function reportsMade()
    {
        return $this->hasMany(ReportUserByAgent::class, 'agent_id');
    }

    // ============================================
    // MÉTODOS
    // ============================================

    public function isActive()
    {
        if ($this->status == 1) {
            return true;
        }
        return false;
    }

    /**
     * Verifica si el usuario es administrador
     */
    public function isAdmin()
    {
        return $this->type === 'admin';
    }

    /**
     * Verifica si el usuario es agente
     */
    public function isAgent()
    {
        return $this->type === 'agent';
    }
}
