<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    public $timestamps = false;
    protected $table = 'password_resets';

    protected $fillable = [
        'email',
        'token',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the user associated with this reset
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }

    /**
     * Scope to get valid tokens (not expired)
     */
    public function scopeValid($query, $expiryHours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($expiryHours));
    }

    /**
     * Scope to find by email
     */
    public function scopeByEmail($query, $email)
    {
        return $query->where('email', $email);
    }

    /**
     * Scope to find by token
     */
    public function scopeByToken($query, $token)
    {
        return $query->where('token', $token);
    }
}
