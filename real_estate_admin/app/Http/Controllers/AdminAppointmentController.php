<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Services\ResponseService;

class AdminAppointmentController extends Controller
{
    /**
     * Display all appointments for admin
     */
    public function index()
    {
        if (!has_permissions('read', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('appointments.index');
    }

    /**
     * Get appointments list (for datatables)
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'appointments')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 15);
        $sort = $request->input('sort', 'appointment_date');
        $order = $request->input('order', 'DESC');

        $query = Appointment::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('agent', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $total = $query->count();

        $appointments = $query->with(['user', 'agent', 'property'])
                             ->orderBy($sort, $order)
                             ->skip($offset)
                             ->take($limit)
                             ->get();

        return response()->json([
            'total' => $total,
            'rows' => $appointments
        ]);
    }

    /**
     * Update appointment status (admin)
     */
    public function updateStatus(Request $request)
    {
        if (!has_permissions('update', 'appointments')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'appointment_id' => 'required|integer|exists:appointments,id',
            'status' => 'required|in:scheduled,confirmed,completed,cancelled,no_show,rescheduled',
        ]);

        try {
            Appointment::where('id', $validated['appointment_id'])
                ->update(['status' => $validated['status']]);

            return ResponseService::successResponse(trans('Estado de cita actualizado exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al actualizar la cita'));
        }
    }

    /**
     * Cancel appointment (admin)
     */
    public function cancel(Request $request)
    {
        if (!has_permissions('update', 'appointments')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'appointment_id' => 'required|integer|exists:appointments,id',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            Appointment::where('id', $validated['appointment_id'])
                ->update([
                    'status' => 'cancelled',
                ]);

            return ResponseService::successResponse(trans('Cita cancelada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al cancelar la cita'));
        }
    }

    /**
     * Export appointments to CSV
     */
    public function export(Request $request)
    {
        if (!has_permissions('read', 'appointments')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $appointments = Appointment::with(['user', 'agent', 'property'])
                ->when($request->filled('status'), function ($q) use ($request) {
                    return $q->where('status', $request->status);
                })
                ->when($request->filled('agent_id'), function ($q) use ($request) {
                    return $q->where('agent_id', $request->agent_id);
                })
                ->get();
            
            $csv = "ID,Usuario,Agente,Propiedad,Fecha,Hora,Estado\n";
            
            foreach ($appointments as $apt) {
                $csv .= "{$apt->id},{$apt->user->name},{$apt->agent->name},{$apt->property->title},{$apt->appointment_date},{$apt->appointment_time},{$apt->status}\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="appointments.csv"',
            ]);
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al exportar citas'));
        }
    }
}

