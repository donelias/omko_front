<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectView extends Model
{
    protected $table = 'project_views';

    protected $fillable = [
        'project_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the project
     */
    public function project()
    {
        return $this->belongsTo(Property::class, 'project_id');
    }

    /**
     * Get the user who viewed
     */
    public function user()
    {
        return $this->belongsTo(User::class)->nullable();
    }

    /**
     * Scope to get views by project
     */
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Scope to get views by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get unique views
     */
    public function scopeUnique($query)
    {
        return $query->distinct('user_id', 'ip_address');
    }
}
