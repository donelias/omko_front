<?php

namespace App\Http\Controllers\Api;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Property;
use App\Models\ProjectPlans;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Lista todas las citas (con filtros opcionales)
     * GET /api/appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::query();

        // Filtros
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('upcoming') && $request->upcoming == '1') {
            $query->upcoming();
        }

        if ($request->has('past') && $request->past == '1') {
            $query->past();
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'appointment_date');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 15);
        $appointments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'pagination' => [
                'total' => $appointments->total(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
            ]
        ]);
    }

    /**
     * Crear nueva cita
     * POST /api/appointments
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'agent_id' => 'nullable|exists:users,id',
            'property_id' => 'nullable|exists:properties,id',
            'project_id' => 'nullable|exists:project_plans,id',
            'title' => 'required|string|max:255',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'duration_minutes' => 'integer|min:15|max:480',
            'meeting_type' => 'required|in:property_viewing,consultation,document_review,payment_discussion,project_tour',
            'is_virtual' => 'boolean',
            'location' => 'nullable|string',
            'video_call_link' => 'nullable|url',
            'notes' => 'nullable|string',
            'contents' => 'nullable|array',
        ]);

        // Crear cita
        $appointment = Appointment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cita creada exitosamente',
            'data' => $appointment
        ], 201);
    }

    /**
     * Obtener una cita específica
     * GET /api/appointments/{id}
     */
    public function show($id)
    {
        $appointment = Appointment::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment
        ]);
    }

    /**
     * Actualizar una cita
     * PUT /api/appointments/{id}
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        // Si ya está completada o cancelada, no permitir edición
        if ($appointment->isCancelled() || $appointment->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede editar una cita cancelada o completada'
            ], 400);
        }

        $validated = $request->validate([
            'agent_id' => 'nullable|exists:users,id',
            'appointment_date' => 'sometimes|date|after_or_equal:today',
            'appointment_time' => 'sometimes|date_format:H:i',
            'duration_minutes' => 'integer|min:15|max:480',
            'meeting_type' => 'sometimes|in:property_viewing,consultation,document_review,payment_discussion,project_tour',
            'is_virtual' => 'boolean',
            'location' => 'nullable|string',
            'video_call_link' => 'nullable|url',
            'notes' => 'nullable|string',
            'contents' => 'nullable|array',
        ]);

        $appointment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cita actualizada exitosamente',
            'data' => $appointment
        ]);
    }

    /**
     * Confirmar una cita
     * PATCH /api/appointments/{id}/confirm
     */
    public function confirm($id)
    {
        $appointment = Appointment::findOrFail($id);

        if (!in_array($appointment->status, [Appointment::STATUS_SCHEDULED])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden confirmar citas agendadas'
            ], 400);
        }

        $appointment->confirm();

        return response()->json([
            'success' => true,
            'message' => 'Cita confirmada',
            'data' => $appointment
        ]);
    }

    /**
     * Marcar como completada
     * PATCH /api/appointments/{id}/complete
     */
    public function complete($id)
    {
        $appointment = Appointment::findOrFail($id);

        if (!in_array($appointment->status, [Appointment::STATUS_SCHEDULED, Appointment::STATUS_CONFIRMED])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden completar citas agendadas o confirmadas'
            ], 400);
        }

        $appointment->complete();

        return response()->json([
            'success' => true,
            'message' => 'Cita marcada como completada',
            'data' => $appointment
        ]);
    }

    /**
     * Cancelar una cita
     * DELETE /api/appointments/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cita no puede ser cancelada'
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'required|in:user_cancelled,agent_cancelled,admin_cancelled,property_unavailable,agent_unavailable,personal_reasons,other',
            'notes' => 'nullable|string',
            'cancelled_by' => 'nullable|integer|exists:users,id',
        ]);

        $appointment->cancel($validated['reason'] ?? null, $validated['cancelled_by'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Cita cancelada exitosamente',
            'data' => $appointment
        ]);
    }

    /**
     * Reprogramar una cita
     * PATCH /api/appointments/{id}/reschedule
     */
    public function reschedule(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        if (!$appointment->canBeRescheduled()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cita no puede ser reprogramada'
            ], 400);
        }

        $validated = $request->validate([
            'new_date' => 'required|date|after_or_equal:today',
            'new_time' => 'required|date_format:H:i',
            'reason' => 'required|in:user_request,agent_request,admin_request,conflict,unavailable,other',
            'rescheduled_by' => 'nullable|integer|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        // Crear registro de reprogramación
        $appointment->reschedules()->create([
            'original_date' => $appointment->appointment_date,
            'original_time' => $appointment->appointment_time,
            'new_date' => $validated['new_date'],
            'new_time' => $validated['new_time'],
            'reason' => $validated['reason'],
            'rescheduled_by' => $validated['rescheduled_by'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Actualizar la cita
        $appointment->update([
            'appointment_date' => $validated['new_date'],
            'appointment_time' => $validated['new_time'],
            'status' => Appointment::STATUS_RESCHEDULED,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cita reprogramada exitosamente',
            'data' => $appointment->load('reschedules')
        ]);
    }

    /**
     * Eliminar una cita
     * DELETE /api/appointments/{id}
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cita eliminada exitosamente'
        ]);
    }

    /**
     * Obtener citas de un usuario
     * GET /api/users/{userId}/appointments
     */
    public function getUserAppointments($userId)
    {
        $user = User::findOrFail($userId);
        $appointments = $user->appointments()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'pagination' => [
                'total' => $appointments->total(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
            ]
        ]);
    }

    /**
     * Obtener citas de una propiedad
     * GET /api/properties/{propertyId}/appointments
     */
    public function getPropertyAppointments($propertyId)
    {
        $property = Property::findOrFail($propertyId);
        $appointments = $property->appointments()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $appointments->items(),
            'pagination' => [
                'total' => $appointments->total(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
            ]
        ]);
    }

    /**
     * Estadísticas de citas
     * GET /api/appointments/stats
     */
    public function stats(Request $request)
    {
        $stats = [
            'total' => Appointment::count(),
            'scheduled' => Appointment::where('status', Appointment::STATUS_SCHEDULED)->count(),
            'confirmed' => Appointment::where('status', Appointment::STATUS_CONFIRMED)->count(),
            'completed' => Appointment::where('status', Appointment::STATUS_COMPLETED)->count(),
            'cancelled' => Appointment::where('status', Appointment::STATUS_CANCELLED)->count(),
            'upcoming' => Appointment::upcoming()->count(),
            'past' => Appointment::past()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
