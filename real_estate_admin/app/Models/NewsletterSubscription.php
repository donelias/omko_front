<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class NewsletterSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'newsletter_subscriptions';

    // Status Constants
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_UNSUBSCRIBED = 'unsubscribed';
    const STATUS_BOUNCED = 'bounced';

    // Frequency Constants
    const FREQUENCY_DAILY = 'daily';
    const FREQUENCY_WEEKLY = 'weekly';
    const FREQUENCY_MONTHLY = 'monthly';
    const FREQUENCY_NEVER = 'never';

    protected $fillable = [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'status',
        'frequency',
        'categories',
        'is_verified',
        'verification_token',
        'verified_at',
        'unsubscribe_token',
        'last_sent_at',
        'bounce_count',
        'complaint_count',
        'metadata',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected $casts = [
        'categories' => 'array',
        'metadata' => 'array',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'last_sent_at' => 'datetime',
    ];

    protected $hidden = [
        'verification_token',
        'unsubscribe_token',
        'deleted_at',
    ];

    // ============ RELATIONSHIPS ============

    /**
     * Get the user associated with the subscription
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ============ SCOPES ============

    /**
     * Filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Get inactive subscriptions
     */
    public function scopeInactive($query)
    {
        return $query->where('status', self::STATUS_INACTIVE);
    }

    /**
     * Get unsubscribed subscriptions
     */
    public function scopeUnsubscribed($query)
    {
        return $query->where('status', self::STATUS_UNSUBSCRIBED);
    }

    /**
     * Get bounced email subscriptions
     */
    public function scopeBounced($query)
    {
        return $query->where('status', self::STATUS_BOUNCED);
    }

    /**
     * Filter by verification status
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Filter unverified subscriptions
     */
    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    /**
     * Filter by frequency
     */
    public function scopeByFrequency($query, $frequency)
    {
        return $query->where('frequency', $frequency);
    }

    /**
     * Get subscriptions by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->whereJsonContains('categories', $category);
    }

    /**
     * Get subscriptions that have bounced more than threshold
     */
    public function scopeHighBounce($query, $threshold = 3)
    {
        return $query->where('bounce_count', '>=', $threshold);
    }

    /**
     * Get subscriptions with complaints
     */
    public function scopeWithComplaints($query)
    {
        return $query->where('complaint_count', '>', 0);
    }

    /**
     * Filter by email domain
     */
    public function scopeByDomain($query, $domain)
    {
        return $query->whereRaw("SUBSTRING_INDEX(email, '@', -1) = ?", [$domain]);
    }

    /**
     * Get recently subscribed
     */
    public function scopeRecentlySubscribed($query, $days = 30)
    {
        return $query->where('subscribed_at', '>=', now()->subDays($days));
    }

    // ============ STATIC METHODS ============

    /**
     * Get total subscribers count
     */
    public static function totalSubscribers()
    {
        return self::active()->count();
    }

    /**
     * Get active subscribers by frequency
     */
    public static function subscribersByFrequency($frequency)
    {
        return self::active()->byFrequency($frequency)->count();
    }

    /**
     * Get subscribers by category
     */
    public static function subscribersByCategory($category)
    {
        return self::active()->byCategory($category)->count();
    }

    /**
     * Get frequency distribution
     */
    public static function frequencyDistribution()
    {
        return self::active()
            ->groupBy('frequency')
            ->selectRaw('frequency, COUNT(*) as count')
            ->pluck('count', 'frequency')
            ->toArray();
    }

    /**
     * Get status distribution
     */
    public static function statusDistribution()
    {
        return self::groupBy('status')
            ->selectRaw('status, COUNT(*) as count')
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get email domains distribution
     */
    public static function domainDistribution($limit = 10)
    {
        return self::selectRaw("SUBSTRING_INDEX(email, '@', -1) as domain, COUNT(*) as count")
            ->groupBy('domain')
            ->orderByDesc('count')
            ->limit($limit)
            ->pluck('count', 'domain')
            ->toArray();
    }

    /**
     * Find by email
     */
    public static function findByEmail($email)
    {
        return self::where('email', $email)->first();
    }

    /**
     * Check if email exists
     */
    public static function emailExists($email)
    {
        return self::where('email', $email)->exists();
    }

    /**
     * Get problematic subscribers (bounces or complaints)
     */
    public static function problematicSubscribers()
    {
        return self::where(function ($query) {
            $query->where('bounce_count', '>', 0)
                ->orWhere('complaint_count', '>', 0);
        })->count();
    }

    /**
     * Get bounce rate percentage
     */
    public static function bounceRatePercentage()
    {
        $total = self::count();
        if ($total == 0) return 0;
        
        $bounced = self::where('status', self::STATUS_BOUNCED)->count();
        return round(($bounced / $total) * 100, 2);
    }

    /**
     * Get unsubscribe rate percentage
     */
    public static function unsubscribeRatePercentage()
    {
        $total = self::count();
        if ($total == 0) return 0;
        
        $unsubscribed = self::where('status', self::STATUS_UNSUBSCRIBED)->count();
        return round(($unsubscribed / $total) * 100, 2);
    }

    /**
     * Get verification rate
     */
    public static function verificationRate()
    {
        $total = self::count();
        if ($total == 0) return 0;
        
        $verified = self::verified()->count();
        return round(($verified / $total) * 100, 2);
    }

    /**
     * Get subscribers who haven't been sent emails in X days
     */
    public static function inactiveSubscribers($days = 60)
    {
        return self::active()
            ->where(function ($query) use ($days) {
                $query->whereNull('last_sent_at')
                    ->orWhere('last_sent_at', '<', now()->subDays($days));
            })
            ->count();
    }

    // ============ INSTANCE METHODS ============

    /**
     * Verify subscription email
     */
    public function verify()
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verification_token' => null,
            'status' => self::STATUS_ACTIVE,
        ]);
        return $this;
    }

    /**
     * Mark as bounced
     */
    public function markBounced($incrementCount = true)
    {
        $this->update([
            'status' => self::STATUS_BOUNCED,
            'bounce_count' => $this->bounce_count + ($incrementCount ? 1 : 0),
        ]);
        return $this;
    }

    /**
     * Increment complaint count
     */
    public function addComplaint()
    {
        $this->increment('complaint_count');
        if ($this->complaint_count >= 3) {
            $this->update(['status' => self::STATUS_BOUNCED]);
        }
        return $this;
    }

    /**
     * Unsubscribe
     */
    public function unsubscribe($reason = null)
    {
        $this->update([
            'status' => self::STATUS_UNSUBSCRIBED,
            'unsubscribed_at' => now(),
            'metadata' => array_merge($this->metadata ?? [], [
                'unsubscribe_reason' => $reason,
                'unsubscribed_at' => now()->toDateTimeString(),
            ]),
        ]);
        return $this;
    }

    /**
     * Reactivate subscription
     */
    public function reactivate()
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'unsubscribed_at' => null,
        ]);
        return $this;
    }

    /**
     * Update categories
     */
    public function updateCategories($categories)
    {
        $this->update(['categories' => $categories]);
        return $this;
    }

    /**
     * Has category
     */
    public function hasCategory($category)
    {
        return in_array($category, $this->categories ?? []);
    }

    /**
     * Update last sent timestamp
     */
    public function recordSent()
    {
        $this->update(['last_sent_at' => now()]);
        return $this;
    }

    /**
     * Get status badge
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_ACTIVE => 'success',
            self::STATUS_INACTIVE => 'warning',
            self::STATUS_UNSUBSCRIBED => 'danger',
            self::STATUS_BOUNCED => 'error',
        ];
        return $badges[$this->status] ?? 'secondary';
    }

    /**
     * Get frequency label
     */
    public function getFrequencyLabelAttribute()
    {
        $labels = [
            self::FREQUENCY_DAILY => 'Diaria',
            self::FREQUENCY_WEEKLY => 'Semanal',
            self::FREQUENCY_MONTHLY => 'Mensual',
            self::FREQUENCY_NEVER => 'Nunca',
        ];
        return $labels[$this->frequency] ?? $this->frequency;
    }

    /**
     * Check if should receive email
     */
    public function canReceiveEmail()
    {
        return $this->status === self::STATUS_ACTIVE 
            && $this->is_verified 
            && $this->bounce_count < 5;
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
