<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Illuminate\Support\Facades\DB;

class AdminAppointmentReportController extends Controller
{
    /**
     * Display appointment reports dashboard
     */
    public function index()
    {
        if (!has_permissions('read', 'reports')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('appointment-reports.index');
    }

    /**
     * Get appointment statistics
     */
    public function statistics(Request $request)
    {
        if (!has_permissions('read', 'reports')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
            $endDate = $request->input('end_date', now()->toDateString());

            $stats = [
                'total_appointments' => Appointment::whereBetween('appointment_date', [$startDate, $endDate])->count(),
                'completed' => Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('status', 'completed')->count(),
                'cancelled' => Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('status', 'cancelled')->count(),
                'no_show' => Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('status', 'no_show')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al obtener estadísticas'));
        }
    }

    /**
     * Get daily appointments count
     */
    public function dailyReport(Request $request)
    {
        if (!has_permissions('read', 'reports')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
            $endDate = $request->input('end_date', now()->toDateString());

            $data = Appointment::select(
                DB::raw('DATE(appointment_date) as date'),
                DB::raw('COUNT(*) as count'),
                'status'
            )
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al generar reporte diario'));
        }
    }

    /**
     * Get agent performance report
     */
    public function agentPerformance(Request $request)
    {
        if (!has_permissions('read', 'reports')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
            $endDate = $request->input('end_date', now()->toDateString());

            $data = Appointment::select(
                'agent_id',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
                DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled")
            )
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->with('agent:id,name')
            ->groupBy('agent_id')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al generar reporte de agentes'));
        }
    }

    /**
     * Export report to CSV
     */
    public function export(Request $request)
    {
        if (!has_permissions('read', 'reports')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
            $endDate = $request->input('end_date', now()->toDateString());

            $appointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                ->with(['user', 'agent', 'property'])
                ->get();
            
            $csv = "ID,Usuario,Agente,Propiedad,Fecha,Hora,Estado\n";
            
            foreach ($appointments as $apt) {
                $csv .= "{$apt->id},{$apt->user->name},{$apt->agent->name},{$apt->property->title},{$apt->appointment_date},{$apt->appointment_time},{$apt->status}\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="appointment_report.csv"',
            ]);
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al exportar reporte'));
        }
    }
}

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
