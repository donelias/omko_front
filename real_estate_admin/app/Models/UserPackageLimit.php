<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class UserPackageLimit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'user_package_limits';

    protected $fillable = [
        'user_id',
        'package_id',
        'quota_limit',
        'quota_used',
        'reset_frequency',
        'last_reset_at',
        'next_reset_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'quota_limit' => 'integer',
        'quota_used' => 'integer',
        'is_active' => 'boolean',
        'last_reset_at' => 'datetime',
        'next_reset_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Frecuencias de reset
    const RESET_MONTHLY = 'monthly';
    const RESET_QUARTERLY = 'quarterly';
    const RESET_ANNUALLY = 'annually';
    const RESET_NEVER = 'never';
    const RESET_CUSTOM = 'custom';

    // ============================================
    // RELACIONES
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id')->withTrashed();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeExceeded($query)
    {
        return $query->whereRaw('quota_used >= quota_limit');
    }

    public function scopeNearLimit($query, $percentage = 80)
    {
        return $query->whereRaw('(quota_used / quota_limit * 100) >= ?', [$percentage]);
    }

    public function scopeForResetFrequency($query, $frequency)
    {
        return $query->where('reset_frequency', $frequency);
    }

    public function scopeNeedsReset($query)
    {
        return $query->where('next_reset_at', '<=', now());
    }

    // ============================================
    // MÉTODOS ESTÁTICOS
    // ============================================

    /**
     * Total de cuotas utilizadas por todos los usuarios
     */
    public static function totalQuotaUsed()
    {
        return self::active()->sum('quota_used');
    }

    /**
     * Total de cuota disponible
     */
    public static function totalQuotaAvailable()
    {
        return self::active()->sum('quota_limit');
    }

    /**
     * Usuarios que han excedido su límite
     */
    public static function usersExceededQuota()
    {
        return self::exceeded()->with('user')->get();
    }

    /**
     * Usuarios cerca de alcanzar el límite
     */
    public static function usersNearQuotaLimit($percentage = 80)
    {
        return self::nearLimit($percentage)->with('user')->get();
    }

    /**
     * Límites que necesitan reseteo
     */
    public static function limitsThatNeedReset()
    {
        return self::needsReset()->with('user', 'package')->get();
    }

    /**
     * Estadísticas de uso de cuotas
     */
    public static function usageStats()
    {
        $total = self::active()->count();
        $exceeded = self::exceeded()->count();
        $nearLimit = self::nearLimit(80)->count();
        $available = self::active()->sum(DB::raw('quota_limit - quota_used'));

        return [
            'total_limits' => $total,
            'exceeded' => $exceeded,
            'near_limit' => $nearLimit,
            'within_limit' => $total - $exceeded - $nearLimit,
            'total_quota_used' => self::totalQuotaUsed(),
            'total_quota_available' => self::totalQuotaAvailable(),
            'total_quota_remaining' => $available,
            'usage_percentage' => $total > 0 ? (self::totalQuotaUsed() / self::totalQuotaAvailable() * 100) : 0,
        ];
    }

    // ============================================
    // MÉTODOS DE INSTANCIA
    // ============================================

    /**
     * Obtiene la cuota disponible (no utilizada)
     */
    public function getAvailableQuotaAttribute()
    {
        return max(0, $this->quota_limit - $this->quota_used);
    }

    /**
     * Porcentaje de uso de cuota
     */
    public function getUsagePercentageAttribute()
    {
        if ($this->quota_limit === 0) {
            return 0;
        }

        return ($this->quota_used / $this->quota_limit) * 100;
    }

    /**
     * Verifica si la cuota ha sido excedida
     */
    public function isExceeded()
    {
        return $this->quota_used >= $this->quota_limit;
    }

    /**
     * Verifica si está cerca del límite (80%)
     */
    public function isNearLimit($percentage = 80)
    {
        return $this->usage_percentage >= $percentage;
    }

    /**
     * Verifica si tiene cuota disponible
     */
    public function hasAvailableQuota()
    {
        return $this->quota_used < $this->quota_limit;
    }

    /**
     * Incrementa el uso de cuota
     */
    public function incrementUsage($amount = 1)
    {
        $this->update([
            'quota_used' => $this->quota_used + $amount,
        ]);

        return $this;
    }

    /**
     * Decrementa el uso de cuota
     */
    public function decrementUsage($amount = 1)
    {
        $this->update([
            'quota_used' => max(0, $this->quota_used - $amount),
        ]);

        return $this;
    }

    /**
     * Establece el uso de cuota
     */
    public function setUsage($amount)
    {
        $this->update([
            'quota_used' => max(0, min($amount, $this->quota_limit)),
        ]);

        return $this;
    }

    /**
     * Reinicia la cuota según la frecuencia de reset
     */
    public function resetQuota()
    {
        $lastReset = now();
        $nextReset = $this->calculateNextResetDate($lastReset);

        $this->update([
            'quota_used' => 0,
            'last_reset_at' => $lastReset,
            'next_reset_at' => $nextReset,
        ]);

        return $this;
    }

    /**
     * Calcula la próxima fecha de reset basado en la frecuencia
     */
    private function calculateNextResetDate($from)
    {
        return match ($this->reset_frequency) {
            self::RESET_MONTHLY => $from->copy()->addMonth(),
            self::RESET_QUARTERLY => $from->copy()->addMonths(3),
            self::RESET_ANNUALLY => $from->copy()->addYear(),
            self::RESET_NEVER => null,
            default => null,
        };
    }

    /**
     * Verifica si necesita reseteo automático
     */
    public function needsAutomaticReset()
    {
        if ($this->reset_frequency === self::RESET_NEVER) {
            return false;
        }

        if (!$this->next_reset_at) {
            return false;
        }

        return $this->next_reset_at <= now();
    }

    /**
     * Obtiene la etiqueta de la frecuencia de reset
     */
    public function getResetFrequencyLabel()
    {
        $labels = [
            self::RESET_MONTHLY => 'Mensual',
            self::RESET_QUARTERLY => 'Trimestral',
            self::RESET_ANNUALLY => 'Anual',
            self::RESET_NEVER => 'Nunca',
            self::RESET_CUSTOM => 'Personalizado',
        ];

        return $labels[$this->reset_frequency] ?? $this->reset_frequency;
    }

    /**
     * Obtiene el badge del estado
     */
    public function getStatusBadgeAttribute()
    {
        if (!$this->is_active) {
            return "<span class='badge bg-secondary'>Inactivo</span>";
        }

        if ($this->isExceeded()) {
            return "<span class='badge bg-danger'>Excedido</span>";
        }

        if ($this->isNearLimit()) {
            return "<span class='badge bg-warning'>Próximo a Límite</span>";
        }

        return "<span class='badge bg-success'>Disponible</span>";
    }

    public function toArray()
    {
        $array = parent::toArray();

        $array['available_quota'] = $this->available_quota;
        $array['usage_percentage'] = $this->usage_percentage;
        $array['is_exceeded'] = $this->isExceeded();
        $array['is_near_limit'] = $this->isNearLimit();
        $array['reset_frequency_label'] = $this->getResetFrequencyLabel();
        $array['needs_reset'] = $this->needsAutomaticReset();

        return $array;
    }
}
