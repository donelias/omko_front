<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'user_id',
        'payment_id',
        'package_id',
        'property_id',
        'amount',
        'currency',
        'payment_method',
        'transaction_id',
        'status',
        'description',
        'metadata',
        'paid_at',
        'failed_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'json',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Estados de transacción
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_DISPUTE = 'dispute';

    // Métodos de pago
    const METHOD_CREDIT_CARD = 'credit_card';
    const METHOD_DEBIT_CARD = 'debit_card';
    const METHOD_PAYPAL = 'paypal';
    const METHOD_STRIPE = 'stripe';
    const METHOD_BANK_TRANSFER = 'bank_transfer';
    const METHOD_WALLET = 'wallet';
    const METHOD_OTHER = 'other';

    // Monedas
    const CURRENCY_USD = 'USD';
    const CURRENCY_EUR = 'EUR';
    const CURRENCY_DOP = 'DOP'; // Peso Dominicano
    const CURRENCY_MXN = 'MXN';

    // ============================================
    // RELACIONES
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id')->withTrashed();
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id')->withTrashed();
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id')->withTrashed();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeForPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeForCurrency($query, $currency)
    {
        return $query->where('currency', $currency);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('created_at', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ]);
    }

    public function scopeThisYear($query)
    {
        return $query->whereBetween('created_at', [
            now()->startOfYear(),
            now()->endOfYear(),
        ]);
    }

    public function scopeLastDays($query, $days)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUnsuccessful($query)
    {
        return $query->whereIn('status', [self::STATUS_FAILED, self::STATUS_CANCELLED]);
    }

    // ============================================
    // MÉTODOS ESTÁTICOS PARA ESTADÍSTICAS
    // ============================================

    /**
     * Total de ingresos (transacciones completadas)
     */
    public static function totalRevenue()
    {
        return self::completed()->sum('amount');
    }

    /**
     * Total de ingresos en un período
     */
    public static function revenueForPeriod($startDate, $endDate)
    {
        return self::completed()
                   ->whereBetween('paid_at', [$startDate, $endDate])
                   ->sum('amount');
    }

    /**
     * Ingresos por método de pago
     */
    public static function revenueByPaymentMethod()
    {
        return self::completed()
                   ->selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
                   ->groupBy('payment_method')
                   ->get();
    }

    /**
     * Ingresos por moneda
     */
    public static function revenueByCurrency()
    {
        return self::completed()
                   ->selectRaw('currency, SUM(amount) as total, COUNT(*) as count')
                   ->groupBy('currency')
                   ->get();
    }

    /**
     * Tasa de éxito de transacciones
     */
    public static function successRate()
    {
        $total = self::count();
        $successful = self::completed()->count();

        if ($total === 0) {
            return 0;
        }

        return ($successful / $total) * 100;
    }

    /**
     * Transacciones fallidas
     */
    public static function failureRate()
    {
        return 100 - self::successRate();
    }

    /**
     * Total de transacciones en período de tiempo
     */
    public static function countForPeriod($startDate, $endDate)
    {
        return self::whereBetween('created_at', [$startDate, $endDate])->count();
    }

    /**
     * Promedio de transacción
     */
    public static function averageTransaction()
    {
        return self::completed()->avg('amount');
    }

    /**
     * Top usuarios por gasto
     */
    public static function topSpenders($limit = 10)
    {
        return self::completed()
                   ->selectRaw('user_id, SUM(amount) as total_spent, COUNT(*) as transaction_count')
                   ->groupBy('user_id')
                   ->orderByRaw('total_spent DESC')
                   ->limit($limit)
                   ->with('user')
                   ->get();
    }

    /**
     * Ingresos por día (últimos N días)
     */
    public static function dailyRevenueTrend($days = 30)
    {
        return self::completed()
                   ->lastDays($days)
                   ->selectRaw('DATE(paid_at) as date, SUM(amount) as revenue, COUNT(*) as count')
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get();
    }

    // ============================================
    // MÉTODOS DE INSTANCIA
    // ============================================

    public function getStatusLabel()
    {
        $labels = [
            self::STATUS_PENDING => 'Pendiente',
            self::STATUS_PROCESSING => 'Procesando',
            self::STATUS_COMPLETED => 'Completada',
            self::STATUS_FAILED => 'Fallida',
            self::STATUS_CANCELLED => 'Cancelada',
            self::STATUS_REFUNDED => 'Reembolsada',
            self::STATUS_DISPUTE => 'En Disputa',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getPaymentMethodLabel()
    {
        $labels = [
            self::METHOD_CREDIT_CARD => 'Tarjeta de Crédito',
            self::METHOD_DEBIT_CARD => 'Tarjeta de Débito',
            self::METHOD_PAYPAL => 'PayPal',
            self::METHOD_STRIPE => 'Stripe',
            self::METHOD_BANK_TRANSFER => 'Transferencia Bancaria',
            self::METHOD_WALLET => 'Monedero Digital',
            self::METHOD_OTHER => 'Otro',
        ];

        return $labels[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Verifica si la transacción fue exitosa
     */
    public function isSuccessful()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Verifica si la transacción está pendiente
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verifica si la transacción falló
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Verifica si la transacción puede ser reembolsada
     */
    public function canBeRefunded()
    {
        return in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_DISPUTE,
        ]);
    }

    /**
     * Formatea el monto con moneda
     */
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2) . ' ' . $this->currency;
    }

    /**
     * Obtiene el badge HTML del estado
     */
    public function getStatusBadgeAttribute()
    {
        $colors = [
            self::STATUS_PENDING => 'warning',
            self::STATUS_PROCESSING => 'info',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_FAILED => 'danger',
            self::STATUS_CANCELLED => 'secondary',
            self::STATUS_REFUNDED => 'secondary',
            self::STATUS_DISPUTE => 'danger',
        ];

        $color = $colors[$this->status] ?? 'secondary';
        return "<span class='badge bg-{$color}'>{$this->getStatusLabel()}</span>";
    }

    public function toArray()
    {
        $array = parent::toArray();

        $array['status_label'] = $this->getStatusLabel();
        $array['payment_method_label'] = $this->getPaymentMethodLabel();
        $array['formatted_amount'] = $this->getFormattedAmountAttribute();
        $array['is_successful'] = $this->isSuccessful();
        $array['is_pending'] = $this->isPending();

        return $array;
    }
}
