<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewRating extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'review_ratings';

    protected $fillable = [
        'user_id',
        'agent_id',
        'property_id',
        'rating',
        'title',
        'review',
        'helpful_count',
        'unhelpful_count',
        'is_verified_purchase',
        'status',
        'featured',
        'metadata',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'helpful_count' => 'integer',
        'unhelpful_count' => 'integer',
        'is_verified_purchase' => 'boolean',
        'featured' => 'boolean',
        'metadata' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Estados de reseña
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_FLAGGED = 'flagged';

    // ============================================
    // RELACIONES
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id')->withTrashed();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function scopeForAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeFlagged($query)
    {
        return $query->where('status', self::STATUS_FLAGGED);
    }

    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    public function scopeRatingAbove($query, $rating)
    {
        return $query->where('rating', '>=', $rating);
    }

    public function scopeRatingBelow($query, $rating)
    {
        return $query->where('rating', '<=', $rating);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeMostHelpful($query)
    {
        return $query->orderByRaw('helpful_count DESC');
    }

    // ============================================
    // MÉTODOS ESTÁTICOS PARA ESTADÍSTICAS
    // ============================================

    /**
     * Promedio de calificación para una propiedad
     */
    public static function averageRatingForProperty($propertyId)
    {
        return self::approved()
                   ->forProperty($propertyId)
                   ->avg('rating') ?? 0;
    }

    /**
     * Promedio de calificación para un agente
     */
    public static function averageRatingForAgent($agentId)
    {
        return self::approved()
                   ->forAgent($agentId)
                   ->avg('rating') ?? 0;
    }

    /**
     * Cuenta de calificaciones para una propiedad
     */
    public static function countForProperty($propertyId)
    {
        return self::approved()
                   ->forProperty($propertyId)
                   ->count();
    }

    /**
     * Cuenta de calificaciones para un agente
     */
    public static function countForAgent($agentId)
    {
        return self::approved()
                   ->forAgent($agentId)
                   ->count();
    }

    /**
     * Distribución de calificaciones para una propiedad (por estrellas)
     */
    public static function ratingDistributionForProperty($propertyId)
    {
        return self::approved()
                   ->forProperty($propertyId)
                   ->selectRaw('ROUND(rating) as star, COUNT(*) as count')
                   ->groupBy('star')
                   ->orderBy('star', 'desc')
                   ->pluck('count', 'star');
    }

    /**
     * Distribución de calificaciones para un agente
     */
    public static function ratingDistributionForAgent($agentId)
    {
        return self::approved()
                   ->forAgent($agentId)
                   ->selectRaw('ROUND(rating) as star, COUNT(*) as count')
                   ->groupBy('star')
                   ->orderBy('star', 'desc')
                   ->pluck('count', 'star');
    }

    /**
     * Reseñas más útiles para una propiedad
     */
    public static function mostHelpfulForProperty($propertyId, $limit = 5)
    {
        return self::approved()
                   ->forProperty($propertyId)
                   ->mostHelpful()
                   ->limit($limit)
                   ->with('user')
                   ->get();
    }

    /**
     * Reseñas más útiles para un agente
     */
    public static function mostHelpfulForAgent($agentId, $limit = 5)
    {
        return self::approved()
                   ->forAgent($agentId)
                   ->mostHelpful()
                   ->limit($limit)
                   ->with('user')
                   ->get();
    }

    /**
     * Total de reseñas pendientes de aprobación
     */
    public static function pendingApprovalCount()
    {
        return self::pending()->count();
    }

    /**
     * Total de reseñas marcadas como problemas
     */
    public static function flaggedCount()
    {
        return self::flagged()->count();
    }

    /**
     * Porcentaje de reseñas verificadas
     */
    public static function verifiedPurchasePercentage()
    {
        $total = self::approved()->count();
        $verified = self::approved()->verifiedPurchase()->count();

        if ($total === 0) {
            return 0;
        }

        return ($verified / $total) * 100;
    }

    // ============================================
    // MÉTODOS DE INSTANCIA
    // ============================================

    /**
     * Obtiene el badge de calificación
     */
    public function getRatingBadgeAttribute()
    {
        $rating = (int)$this->rating;

        return match ($rating) {
            5 => '<span class="badge bg-success">⭐⭐⭐⭐⭐</span>',
            4 => '<span class="badge bg-success">⭐⭐⭐⭐</span>',
            3 => '<span class="badge bg-info">⭐⭐⭐</span>',
            2 => '<span class="badge bg-warning">⭐⭐</span>',
            default => '<span class="badge bg-danger">⭐</span>',
        };
    }

    /**
     * Verifica si la reseña está aprobada
     */
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Verifica si la reseña está pendiente
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verifica si la reseña está marcada
     */
    public function isFlagged()
    {
        return $this->status === self::STATUS_FLAGGED;
    }

    /**
     * Calcula el porcentaje de utilidad
     */
    public function getHelpfulnessPercentageAttribute()
    {
        $total = $this->helpful_count + $this->unhelpful_count;

        if ($total === 0) {
            return 0;
        }

        return ($this->helpful_count / $total) * 100;
    }

    /**
     * Incrementa contador de útil
     */
    public function markAsHelpful()
    {
        $this->increment('helpful_count');
        return $this;
    }

    /**
     * Incrementa contador de no útil
     */
    public function markAsUnhelpful()
    {
        $this->increment('unhelpful_count');
        return $this;
    }

    /**
     * Obtiene el estado en texto
     */
    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pendiente',
            self::STATUS_APPROVED => 'Aprobada',
            self::STATUS_REJECTED => 'Rechazada',
            self::STATUS_FLAGGED => 'Marcada',
            default => $this->status,
        };
    }

    /**
     * Aprueba la reseña
     */
    public function approve()
    {
        $this->update(['status' => self::STATUS_APPROVED]);
        return $this;
    }

    /**
     * Rechaza la reseña
     */
    public function reject()
    {
        $this->update(['status' => self::STATUS_REJECTED]);
        return $this;
    }

    /**
     * Marca como problema
     */
    public function flag($reason = null)
    {
        $this->update([
            'status' => self::STATUS_FLAGGED,
            'metadata' => array_merge($this->metadata ?? [], ['flag_reason' => $reason]),
        ]);
        return $this;
    }

    /**
     * Obtiene badge del estado
     */
    public function getStatusBadgeAttribute()
    {
        $colors = [
            self::STATUS_PENDING => 'warning',
            self::STATUS_APPROVED => 'success',
            self::STATUS_REJECTED => 'danger',
            self::STATUS_FLAGGED => 'danger',
        ];

        $color = $colors[$this->status] ?? 'secondary';
        return "<span class='badge bg-{$color}'>{$this->status_label}</span>";
    }

    public function toArray()
    {
        $array = parent::toArray();

        $array['rating_badge'] = $this->rating_badge;
        $array['status_label'] = $this->status_label;
        $array['status_badge'] = $this->status_badge;
        $array['helpfulness_percentage'] = $this->helpfulness_percentage;
        $array['is_approved'] = $this->isApproved();
        $array['is_verified_purchase_text'] = $this->is_verified_purchase ? '✓ Compra Verificada' : '';

        return $array;
    }
}
