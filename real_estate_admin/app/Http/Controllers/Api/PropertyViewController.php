<?php

namespace App\Http\Controllers\Api;

use App\Models\PropertyView;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PropertyViewController extends Controller
{
    /**
     * Registrar una vista de propiedad
     * POST /api/properties/{propertyId}/view
     */
    public function recordView(Request $request, $propertyId)
    {
        $property = Property::findOrFail($propertyId);

        // Obtener información del usuario
        $userId = auth()->id();
        $ipAddress = $request->ip();
        $userAgent = $request->header('User-Agent');
        $referer = $request->header('referer');
        $deviceType = $this->detectDeviceType($userAgent);

        // Evitar registrar múltiples vistas del mismo usuario en corto tiempo (últimas 5 minutos)
        if ($userId) {
            $recentView = PropertyView::where('property_id', $propertyId)
                                     ->where('user_id', $userId)
                                     ->where('viewed_at', '>=', now()->subMinutes(5))
                                     ->exists();

            if ($recentView) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vista registrada recientemente'
                ], 429);
            }
        }

        $view = PropertyView::create([
            'property_id' => $propertyId,
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'referer' => $referer,
            'device_type' => $deviceType,
            'viewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vista registrada',
            'data' => $view
        ], 201);
    }

    /**
     * Obtener vistas de una propiedad
     * GET /api/properties/{propertyId}/views
     */
    public function propertyViews($propertyId, Request $request)
    {
        $property = Property::findOrFail($propertyId);

        $query = $property->views();

        // Filtros opcionales
        if ($request->has('device_type')) {
            $query->where('device_type', $request->device_type);
        }

        if ($request->has('days')) {
            $query->lastDays($request->days);
        }

        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        $views = $query->orderBy('viewed_at', 'desc')
                      ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $views->items(),
            'pagination' => [
                'total' => $views->total(),
                'per_page' => $views->perPage(),
                'current_page' => $views->currentPage(),
            ]
        ]);
    }

    /**
     * Obtener estadísticas de vistas de una propiedad
     * GET /api/properties/{propertyId}/views/stats
     */
    public function propertyViewsStats($propertyId, Request $request)
    {
        $property = Property::findOrFail($propertyId);
        $days = $request->get('days', 30);

        $totalViews = PropertyView::countForProperty($propertyId);
        $recentViews = PropertyView::forProperty($propertyId)->lastDays($days)->count();
        $uniqueIPs = PropertyView::uniqueIPsForProperty($propertyId);
        $authenticatedViews = PropertyView::authenticatedViewsForProperty($propertyId);
        $viewsByDevice = PropertyView::viewsByDeviceForProperty($propertyId);
        $viewsByCountry = PropertyView::viewsByCountryForProperty($propertyId);
        $viewsTrend = PropertyView::viewsLastDaysForProperty($propertyId, 7);

        return response()->json([
            'success' => true,
            'data' => [
                'total_views' => $totalViews,
                'views_last_days' => [
                    'days' => $days,
                    'count' => $recentViews,
                    'average_per_day' => round($recentViews / $days, 2),
                ],
                'unique_ips' => $uniqueIPs,
                'authenticated_views' => $authenticatedViews,
                'anonymous_views' => $totalViews - $authenticatedViews,
                'views_by_device' => $viewsByDevice,
                'top_countries' => $viewsByCountry->toArray(),
                'trend_last_7_days' => $viewsTrend->toArray(),
            ]
        ]);
    }

    /**
     * Obtener propiedades más vistas
     * GET /api/properties/most-viewed
     */
    public function mostViewed(Request $request)
    {
        $limit = $request->get('limit', 10);
        $days = $request->get('days', null);

        $mostViewed = PropertyView::mostViewedProperties($limit, $days);

        return response()->json([
            'success' => true,
            'data' => $mostViewed->map(function($item) {
                return [
                    'property_id' => $item->property_id,
                    'property' => $item->property,
                    'view_count' => $item->view_count,
                ];
            })
        ]);
    }

    /**
     * Obtener propiedades más vistas este mes
     * GET /api/properties/most-viewed/month
     */
    public function mostViewedThisMonth(Request $request)
    {
        $limit = $request->get('limit', 10);
        $mostViewed = PropertyView::mostViewedThisMonth($limit);

        return response()->json([
            'success' => true,
            'data' => $mostViewed->map(function($item) {
                return [
                    'property_id' => $item->property_id,
                    'property' => $item->property,
                    'view_count' => $item->view_count,
                ];
            })
        ]);
    }

    /**
     * Obtener vistas de un usuario
     * GET /api/users/{userId}/property-views
     */
    public function userViews($userId, Request $request)
    {
        $views = PropertyView::where('user_id', $userId)
                            ->orderBy('viewed_at', 'desc')
                            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $views->items(),
            'pagination' => [
                'total' => $views->total(),
                'per_page' => $views->perPage(),
                'current_page' => $views->currentPage(),
            ]
        ]);
    }

    /**
     * Limpiar vistas antiguas (mantenimiento)
     * DELETE /api/properties/{propertyId}/views/cleanup
     */
    public function cleanup($propertyId, Request $request)
    {
        $days = $request->get('days', 90);

        $deleted = PropertyView::forProperty($propertyId)
                              ->where('viewed_at', '<', now()->subDays($days))
                              ->delete();

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron {$deleted} registros de vistas antiguas"
        ]);
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    /**
     * Detecta el tipo de dispositivo basado en User-Agent
     */
    private function detectDeviceType($userAgent)
    {
        $userAgent = strtolower($userAgent ?? '');

        if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false) {
            return PropertyView::DEVICE_MOBILE;
        }

        if (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
            return PropertyView::DEVICE_TABLET;
        }

        return PropertyView::DEVICE_DESKTOP;
    }
}
