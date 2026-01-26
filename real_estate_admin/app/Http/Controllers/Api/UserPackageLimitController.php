<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPackageLimit;
use Illuminate\Http\Request;

class UserPackageLimitController extends Controller
{
    /**
     * GET /api/user-package-limits
     * Lista todos los límites de paquetes de usuarios
     */
    public function index(Request $request)
    {
        $query = UserPackageLimit::query();

        if ($request->filled('user_id')) {
            $query->forUser($request->user_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool)$request->is_active);
        }

        if ($request->filled('exceeded')) {
            if ($request->exceeded) {
                $query->exceeded();
            } else {
                $query->whereRaw('quota_used < quota_limit');
            }
        }

        $limits = $query->with(['user', 'package'])
                       ->latest()
                       ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $limits,
        ]);
    }

    /**
     * GET /api/user-package-limits/{id}
     * Obtiene detalles de un límite
     */
    public function show(UserPackageLimit $limit)
    {
        $limit->load(['user', 'package']);

        return response()->json([
            'success' => true,
            'data' => $limit,
        ]);
    }

    /**
     * POST /api/user-package-limits
     * Crea un nuevo límite de paquete
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'package_id' => 'required|exists:packages,id|unique:user_package_limits,package_id,NULL,id,user_id,' . $request->user_id,
            'quota_limit' => 'required|integer|min:1',
            'reset_frequency' => 'required|in:monthly,quarterly,annually,never,custom',
            'notes' => 'nullable|string',
        ]);

        // Calcula la próxima fecha de reset
        $nextResetAt = match ($validated['reset_frequency']) {
            'monthly' => now()->addMonth(),
            'quarterly' => now()->addMonths(3),
            'annually' => now()->addYear(),
            default => null,
        };

        $validated['next_reset_at'] = $nextResetAt;
        $validated['last_reset_at'] = now();

        $limit = UserPackageLimit::create($validated);
        $limit->load(['user', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Límite de paquete creado exitosamente',
            'data' => $limit,
        ], 201);
    }

    /**
     * PUT /api/user-package-limits/{id}
     * Actualiza un límite de paquete
     */
    public function update(Request $request, UserPackageLimit $limit)
    {
        $validated = $request->validate([
            'quota_limit' => 'integer|min:1',
            'quota_used' => 'integer|min:0',
            'reset_frequency' => 'in:monthly,quarterly,annually,never,custom',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // Si cambia la frecuencia de reset, recalcula la próxima fecha
        if ($request->filled('reset_frequency') && $request->reset_frequency !== $limit->reset_frequency) {
            $nextResetAt = match ($request->reset_frequency) {
                'monthly' => now()->addMonth(),
                'quarterly' => now()->addMonths(3),
                'annually' => now()->addYear(),
                default => null,
            };

            $validated['next_reset_at'] = $nextResetAt;
        }

        $limit->update($validated);
        $limit->load(['user', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Límite de paquete actualizado exitosamente',
            'data' => $limit,
        ]);
    }

    /**
     * DELETE /api/user-package-limits/{id}
     * Elimina un límite de paquete
     */
    public function destroy(UserPackageLimit $limit)
    {
        $limit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Límite de paquete eliminado exitosamente',
        ]);
    }

    /**
     * GET /api/users/{userId}/package-limits
     * Obtiene límites de paquetes de un usuario específico
     */
    public function getUserLimits($userId, Request $request)
    {
        $query = UserPackageLimit::forUser($userId);

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool)$request->is_active);
        }

        $limits = $query->with('package')
                       ->latest()
                       ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $limits,
        ]);
    }

    /**
     * PATCH /api/user-package-limits/{id}/increment
     * Incrementa el uso de cuota
     */
    public function incrementUsage(Request $request, UserPackageLimit $limit)
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $newUsage = $limit->quota_used + $validated['amount'];

        if ($newUsage > $limit->quota_limit && $limit->reset_frequency !== 'never') {
            return response()->json([
                'success' => false,
                'message' => 'No hay cuota disponible',
                'data' => [
                    'quota_limit' => $limit->quota_limit,
                    'quota_used' => $limit->quota_used,
                    'available' => $limit->available_quota,
                ],
            ], 422);
        }

        $limit->incrementUsage($validated['amount']);

        return response()->json([
            'success' => true,
            'message' => 'Uso de cuota incrementado',
            'data' => $limit,
        ]);
    }

    /**
     * PATCH /api/user-package-limits/{id}/decrement
     * Decrementa el uso de cuota
     */
    public function decrementUsage(Request $request, UserPackageLimit $limit)
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $limit->decrementUsage($validated['amount']);

        return response()->json([
            'success' => true,
            'message' => 'Uso de cuota decrementado',
            'data' => $limit,
        ]);
    }

    /**
     * PATCH /api/user-package-limits/{id}/reset
     * Reinicia la cuota
     */
    public function resetQuota(UserPackageLimit $limit)
    {
        $limit->resetQuota();

        return response()->json([
            'success' => true,
            'message' => 'Cuota reiniciada exitosamente',
            'data' => $limit,
        ]);
    }

    /**
     * GET /api/user-package-limits/stats/usage
     * Estadísticas de uso general de cuotas
     */
    public function usageStats()
    {
        $stats = UserPackageLimit::usageStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/user-package-limits/exceeded
     * Usuarios que excedieron cuota
     */
    public function exceededLimits()
    {
        $limits = UserPackageLimit::exceeded()
                                  ->with(['user', 'package'])
                                  ->get();

        return response()->json([
            'success' => true,
            'data' => $limits,
        ]);
    }

    /**
     * GET /api/user-package-limits/near-limit
     * Usuarios cerca de alcanzar el límite
     */
    public function nearLimit(Request $request)
    {
        $percentage = $request->percentage ?? 80;

        $limits = UserPackageLimit::nearLimit($percentage)
                                  ->with(['user', 'package'])
                                  ->get();

        return response()->json([
            'success' => true,
            'percentage' => $percentage,
            'data' => $limits,
        ]);
    }

    /**
     * POST /api/user-package-limits/auto-reset
     * Ejecuta reseteo automático de cuotas vencidas
     */
    public function autoResetDue()
    {
        $limits = UserPackageLimit::needsReset()->get();

        $resetCount = 0;
        foreach ($limits as $limit) {
            $limit->resetQuota();
            $resetCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "$resetCount cuotas han sido reiniciadas",
            'data' => [
                'reset_count' => $resetCount,
                'limits_reset' => $limits,
            ],
        ]);
    }

    /**
     * PATCH /api/user-package-limits/{id}/check-availability
     * Verifica si hay cuota disponible
     */
    public function checkAvailability(Request $request, UserPackageLimit $limit)
    {
        $requestedAmount = $request->requested_amount ?? 1;

        $isAvailable = $limit->quota_used + $requestedAmount <= $limit->quota_limit;

        return response()->json([
            'success' => true,
            'data' => [
                'is_available' => $isAvailable,
                'quota_limit' => $limit->quota_limit,
                'quota_used' => $limit->quota_used,
                'available_quota' => $limit->available_quota,
                'requested_amount' => $requestedAmount,
                'remaining_after_request' => max(0, $limit->available_quota - $requestedAmount),
            ],
        ]);
    }
}
