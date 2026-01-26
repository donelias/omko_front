<?php

namespace App\Http\Controllers\Api;

use App\Models\AgentUnavailability;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AgentUnavailabilityController extends Controller
{
    /**
     * Lista indisponibilidades de un agente
     * GET /api/agents/{agentId}/unavailabilities
     */
    public function index($agentId)
    {
        $agent = User::findOrFail($agentId);
        $unavailabilities = $agent->unavailabilities()
                                  ->orderBy('start_date', 'desc')
                                  ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $unavailabilities->items(),
            'pagination' => [
                'total' => $unavailabilities->total(),
                'per_page' => $unavailabilities->perPage(),
                'current_page' => $unavailabilities->currentPage(),
            ]
        ]);
    }

    /**
     * Crear indisponibilidad
     * POST /api/agents/{agentId}/unavailabilities
     */
    public function store(Request $request, $agentId)
    {
        $agent = User::findOrFail($agentId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|in:vacation,sick_leave,personal,training,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $unavailability = $agent->unavailabilities()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Indisponibilidad creada',
            'data' => $unavailability
        ], 201);
    }

    /**
     * Obtener indisponibilidad específica
     * GET /api/unavailabilities/{id}
     */
    public function show($id)
    {
        $unavailability = AgentUnavailability::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $unavailability
        ]);
    }

    /**
     * Actualizar indisponibilidad
     * PUT /api/unavailabilities/{id}
     */
    public function update(Request $request, $id)
    {
        $unavailability = AgentUnavailability::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'reason' => 'sometimes|in:vacation,sick_leave,personal,training,other',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'is_blocked' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ]);

        $unavailability->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Indisponibilidad actualizada',
            'data' => $unavailability
        ]);
    }

    /**
     * Eliminar indisponibilidad
     * DELETE /api/unavailabilities/{id}
     */
    public function destroy($id)
    {
        $unavailability = AgentUnavailability::findOrFail($id);
        $unavailability->delete();

        return response()->json([
            'success' => true,
            'message' => 'Indisponibilidad eliminada'
        ]);
    }

    /**
     * Obtener indisponibilidades actuales de un agente
     * GET /api/agents/{agentId}/unavailabilities/current
     */
    public function currentUnavailabilities($agentId)
    {
        $agent = User::findOrFail($agentId);
        $unavailabilities = $agent->unavailabilities()
                                  ->currently()
                                  ->get();

        return response()->json([
            'success' => true,
            'data' => $unavailabilities,
            'is_unavailable' => $unavailabilities->isNotEmpty()
        ]);
    }

    /**
     * Verificar si un agente está disponible en una fecha
     * GET /api/agents/{agentId}/check-availability/{date}
     */
    public function checkAvailability($agentId, $date)
    {
        $agent = User::findOrFail($agentId);
        
        $unavailability = $agent->unavailabilities()
                               ->where('start_date', '<=', $date)
                               ->where('end_date', '>=', $date)
                               ->where('is_blocked', true)
                               ->first();

        return response()->json([
            'success' => true,
            'agent_id' => $agentId,
            'date' => $date,
            'is_available' => !$unavailability,
            'blocking_reason' => $unavailability ? [
                'id' => $unavailability->id,
                'title' => $unavailability->title,
                'reason' => $unavailability->reason,
                'reason_label' => $unavailability->getReasonLabel(),
            ] : null,
        ]);
    }

    /**
     * Obtener estadísticas de indisponibilidades
     * GET /api/agents/{agentId}/unavailabilities/stats
     */
    public function stats($agentId)
    {
        $agent = User::findOrFail($agentId);

        $stats = [
            'total' => $agent->unavailabilities()->count(),
            'current' => $agent->unavailabilities()->currently()->count(),
            'upcoming' => $agent->unavailabilities()->upcoming()->count(),
            'past' => $agent->unavailabilities()->past()->count(),
            'by_reason' => $agent->unavailabilities()
                                 ->selectRaw('reason, COUNT(*) as count')
                                 ->groupBy('reason')
                                 ->pluck('count', 'reason'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
