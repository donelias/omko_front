<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminAppointmentController extends Controller
{
    /**
     * Display all appointments for admin
     */
    public function index(Request $request)
    {
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
            });
        }

        $appointments = $query->with(['user', 'agent', 'property'])
                             ->latest()
                             ->paginate(15);

        return view('appointments.index', compact('appointments'));
    }

    /**
     * Show appointment details
     */
    public function show(Appointment $appointment)
    {
        $appointment->load(['user', 'agent', 'property']);
        return view('appointments.show', compact('appointment'));
    }

    /**
     * Update appointment status (admin)
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,rescheduled',
        ]);

        $appointment->update($validated);

        return redirect()->back()
            ->with('success', 'Estado de cita actualizado exitosamente');
    }

    /**
     * Cancel appointment (admin)
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['reason'] ?? null,
        ]);

        return redirect()->back()
            ->with('success', 'Cita cancelada exitosamente');
    }

    /**
     * Export appointments to CSV
     */
    public function export(Request $request)
    {
        $appointments = Appointment::with(['user', 'agent', 'property'])->get();
        
        $csv = "ID,Usuario,Agente,Propiedad,Fecha,Hora,Estado\n";
        
        foreach ($appointments as $apt) {
            $csv .= "{$apt->id},{$apt->user->name},{$apt->agent->name},{$apt->property->title},{$apt->date},{$apt->time},{$apt->status}\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="appointments.csv"',
        ]);
    }
}
