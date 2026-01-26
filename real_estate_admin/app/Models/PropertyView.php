<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyView extends Model
{
    use HasFactory;

    protected $table = 'property_views';

    protected $fillable = [
        'property_id',
        'user_id',
        'ip_address',
        'user_agent',
        'referer',
        'country',
        'city',
        'device_type',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const DEVICE_DESKTOP = 'desktop';
    const DEVICE_MOBILE = 'mobile';
    const DEVICE_TABLET = 'tablet';

    // ============================================
    // RELACIONES
    // ============================================

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeAuthenticatedUsers($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function scopeAnonymousUsers($query)
    {
        return $query->whereNull('user_id');
    }

    public function scopeForDevice($query, $device)
    {
        return $query->where('device_type', $device);
    }

    public function scopeDesktop($query)
    {
        return $query->where('device_type', self::DEVICE_DESKTOP);
    }

    public function scopeMobile($query)
    {
        return $query->where('device_type', self::DEVICE_MOBILE);
    }

    public function scopeTablet($query)
    {
        return $query->where('device_type', self::DEVICE_TABLET);
    }

    public function scopeForCountry($query, $country)
    {
        return $query->where('country', $country);
    }

    public function scopeForCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('viewed_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('viewed_at', [
            now()->startOfWeek(),
            now()->endOfWeek(),
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('viewed_at', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ]);
    }

    public function scopeLastDays($query, $days)
    {
        return $query->where('viewed_at', '>=', now()->subDays($days));
    }

    // ============================================
    // MÉTODOS ESTÁTICOS PARA ESTADÍSTICAS
    // ============================================

    /**
     * Obtiene total de vistas de una propiedad
     */
    public static function countForProperty($propertyId)
    {
        return self::forProperty($propertyId)->count();
    }

    /**
     * Obtiene vistas únicas (IPs únicas) de una propiedad
     */
    public static function uniqueIPsForProperty($propertyId)
    {
        return self::forProperty($propertyId)
                   ->distinct('ip_address')
                   ->count('ip_address');
    }

    /**
     * Obtiene vistas de usuarios autenticados de una propiedad
     */
    public static function authenticatedViewsForProperty($propertyId)
    {
        return self::forProperty($propertyId)->authenticatedUsers()->count();
    }

    /**
     * Obtiene vistas por dispositivo para una propiedad
     */
    public static function viewsByDeviceForProperty($propertyId)
    {
        return self::forProperty($propertyId)
                   ->selectRaw('device_type, COUNT(*) as count')
                   ->groupBy('device_type')
                   ->get()
                   ->pluck('count', 'device_type');
    }

    /**
     * Obtiene vistas por país para una propiedad
     */
    public static function viewsByCountryForProperty($propertyId)
    {
        return self::forProperty($propertyId)
                   ->selectRaw('country, COUNT(*) as count')
                   ->groupBy('country')
                   ->orderByRaw('count DESC')
                   ->limit(10)
                   ->get();
    }

    /**
     * Obtiene vistas en los últimos N días
     */
    public static function viewsLastDaysForProperty($propertyId, $days = 7)
    {
        return self::forProperty($propertyId)
                   ->lastDays($days)
                   ->selectRaw('DATE(viewed_at) as date, COUNT(*) as count')
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get();
    }

    /**
     * Obtiene propiedades más vistas
     */
    public static function mostViewedProperties($limit = 10, $days = null)
    {
        $query = self::selectRaw('property_id, COUNT(*) as view_count')
                    ->groupBy('property_id')
                    ->orderByRaw('view_count DESC')
                    ->limit($limit);

        if ($days) {
            $query->lastDays($days);
        }

        return $query->with('property')->get();
    }

    /**
     * Obtiene propiedades más vistas en el último mes
     */
    public static function mostViewedThisMonth($limit = 10)
    {
        return self::thisMonth()
                   ->selectRaw('property_id, COUNT(*) as view_count')
                   ->groupBy('property_id')
                   ->orderByRaw('view_count DESC')
                   ->limit($limit)
                   ->with('property')
                   ->get();
    }

    // ============================================
    // MÉTODOS DE INSTANCIA
    // ============================================

    public function getDeviceTypeLabel()
    {
        $labels = [
            self::DEVICE_DESKTOP => 'Escritorio',
            self::DEVICE_MOBILE => 'Móvil',
            self::DEVICE_TABLET => 'Tablet',
        ];

        return $labels[$this->device_type] ?? $this->device_type;
    }

    public function isMobileView()
    {
        return $this->device_type === self::DEVICE_MOBILE;
    }

    public function isDesktopView()
    {
        return $this->device_type === self::DEVICE_DESKTOP;
    }

    /**
     * Verifica si la vista es de un bot/crawler
     */
    public function isBot()
    {
        $botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
        $userAgent = strtolower($this->user_agent ?? '');

        foreach ($botPatterns as $pattern) {
            if (strpos($userAgent, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obtiene el navegador desde user_agent
     */
    public function getBrowser()
    {
        $userAgent = $this->user_agent ?? '';

        if (strpos($userAgent, 'Chrome') !== false) return 'Chrome';
        if (strpos($userAgent, 'Firefox') !== false) return 'Firefox';
        if (strpos($userAgent, 'Safari') !== false) return 'Safari';
        if (strpos($userAgent, 'Edge') !== false) return 'Edge';
        if (strpos($userAgent, 'MSIE') !== false || strpos($userAgent, 'Trident') !== false) return 'IE';

        return 'Otro';
    }
}
