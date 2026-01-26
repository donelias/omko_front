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
        $appointments = Appointment::with(['user', 'property'])->paginate(15);
        return view('admin.appointments.index', compact('appointments'));
    }

    /**
     * Show single appointment
     */
    public function show(Appointment $appointment)
    {
        if (!has_permissions('read', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('admin.appointments.show', compact('appointment'));
    }

    /**
     * Show edit form
     */
    public function edit(Appointment $appointment)
    {
        if (!has_permissions('update', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('admin.appointments.edit', compact('appointment'));
    }

    /**
     * Update appointment
     */
    public function update(Request $request, Appointment $appointment)
    {
        if (!has_permissions('update', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        try {
            $appointment->update($validated);
            return redirect()->route('appointments.index')->with('success', trans('Appointment updated successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error updating appointment'));
        }
    }

    /**
     * Delete appointment
     */
    public function destroy(Appointment $appointment)
    {
        if (!has_permissions('delete', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        try {
            $appointment->delete();
            return redirect()->route('appointments.index')->with('success', trans('Appointment deleted successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error deleting appointment'));
        }
    }

    /**
     * Export appointments to CSV
     */
    public function exportCsv(Request $request)
    {
        if (!has_permissions('read', 'appointments')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        try {
            $appointments = Appointment::with(['user', 'property'])
                ->when($request->filled('status'), function ($q) use ($request) {
                    return $q->where('status', $request->status);
                })
                ->when($request->filled('date_from'), function ($q) use ($request) {
                    return $q->whereDate('appointment_date', '>=', $request->date_from);
                })
                ->when($request->filled('date_to'), function ($q) use ($request) {
                    return $q->whereDate('appointment_date', '<=', $request->date_to);
                })
                ->get();
            
            $csv = "ID,User,Property,Date,Time,Status,Created\n";
            
            foreach ($appointments as $apt) {
                $user = $apt->user ? $apt->user->first_name . ' ' . $apt->user->last_name : '-';
                $property = $apt->property ? $apt->property->name : '-';
                $csv .= "{$apt->id},\"{$user}\",\"{$property}\",{$apt->appointment_date},{$apt->appointment_time},{$apt->status},{$apt->created_at}\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="appointments-' . date('Y-m-d') . '.csv"',
            ]);
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error exporting appointments'));
        }
    }
}

