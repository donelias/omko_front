<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedChatUser extends Model
{
    protected $table = 'blocked_chat_users';

    protected $fillable = [
        'user_id',
        'blocked_user_id',
        'reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who blocked
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who was blocked
     */
    public function blockedUser()
    {
        return $this->belongsTo(User::class, 'blocked_user_id');
    }

    /**
     * Scope to get blocks by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
