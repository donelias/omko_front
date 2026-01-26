<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminAppointmentReportController extends Controller
{
    /**
     * Display appointment reports
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Appointment::query();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $appointments = $query->with(['user', 'agent', 'property'])
                             ->latest()
                             ->paginate(20);

        $totalAppointments = $appointments->total();
        $completedCount = Appointment::where('status', 'completed')->count();
        $cancelledCount = Appointment::where('status', 'cancelled')->count();
        $pendingCount = Appointment::where('status', 'pending')->count();

        return view('appointment-reports.index', compact(
            'appointments',
            'totalAppointments',
            'completedCount',
            'cancelledCount',
            'pendingCount'
        ));
    }

    /**
     * Get appointment statistics
     */
    public function statistics(Request $request)
    {
        $period = $request->input('period', 'monthly'); // daily, weekly, monthly

        $data = [
            'total' => Appointment::count(),
            'completed' => Appointment::where('status', 'completed')->count(),
            'cancelled' => Appointment::where('status', 'cancelled')->count(),
            'pending' => Appointment::where('status', 'pending')->count(),
            'confirmed' => Appointment::where('status', 'confirmed')->count(),
        ];

        return view('appointment-reports.statistics', compact('data', 'period'));
    }

    /**
     * Export report as CSV
     */
    public function export(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Appointment::query();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $appointments = $query->with(['user', 'agent', 'property'])->get();

        $csv = "ID,Usuario,Agente,Propiedad,Fecha,Hora,Estado,Creado\n";

        foreach ($appointments as $apt) {
            $csv .= "\"{$apt->id}\",\"{$apt->user->name}\",\"{$apt->agent->name}\",\"{$apt->property->title}\",\"{$apt->date}\",\"{$apt->time}\",\"{$apt->status}\",\"{$apt->created_at}\"\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="appointment-report.csv"',
        ]);
    }
}
