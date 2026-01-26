<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportUserByAgent extends Model
{
    protected $table = 'report_user_by_agents';

    protected $fillable = [
        'agent_id',
        'reported_user_id',
        'reason',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the agent who reported
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get the user who was reported
     */
    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * Scope to get reports by agent
     */
    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    /**
     * Scope to get pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', false);
    }

    /**
     * Scope to get resolved reports
     */
    public function scopeResolved($query)
    {
        return $query->where('status', true);
    }
}
