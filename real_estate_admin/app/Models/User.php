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
