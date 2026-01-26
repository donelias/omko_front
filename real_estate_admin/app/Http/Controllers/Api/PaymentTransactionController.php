<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;

class PaymentTransactionController extends Controller
{
    /**
     * GET /api/transactions
     * Lista todas las transacciones
     */
    public function index(Request $request)
    {
        $query = PaymentTransaction::query();

        // Filtros
        if ($request->filled('user_id')) {
            $query->forUser($request->user_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->forPaymentMethod($request->payment_method);
        }

        if ($request->filled('currency')) {
            $query->forCurrency($request->currency);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59',
            ]);
        }

        // Relaciones
        $transactions = $query->with(['user', 'payment', 'package', 'property'])
                              ->latest()
                              ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * GET /api/transactions/{id}
     * Obtiene detalles de una transacción
     */
    public function show(PaymentTransaction $transaction)
    {
        $transaction->load(['user', 'payment', 'package', 'property']);

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    /**
     * POST /api/transactions
     * Crea una nueva transacción
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'payment_id' => 'nullable|exists:payments,id',
            'package_id' => 'nullable|exists:packages,id',
            'property_id' => 'nullable|exists:properties,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|in:USD,EUR,DOP,MXN',
            'payment_method' => 'required|in:credit_card,debit_card,paypal,stripe,bank_transfer,wallet,other',
            'transaction_id' => 'nullable|unique:payment_transactions',
            'status' => 'required|in:pending,processing,completed,failed,cancelled,refunded,dispute',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $transaction = PaymentTransaction::create($validated);
        $transaction->load(['user', 'payment', 'package', 'property']);

        return response()->json([
            'success' => true,
            'message' => 'Transacción creada exitosamente',
            'data' => $transaction,
        ], 201);
    }

    /**
     * PUT /api/transactions/{id}
     * Actualiza una transacción
     */
    public function update(Request $request, PaymentTransaction $transaction)
    {
        $validated = $request->validate([
            'amount' => 'numeric|min:0.01',
            'currency' => 'in:USD,EUR,DOP,MXN',
            'payment_method' => 'in:credit_card,debit_card,paypal,stripe,bank_transfer,wallet,other',
            'status' => 'in:pending,processing,completed,failed,cancelled,refunded,dispute',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
            'failed_reason' => 'nullable|string',
        ]);

        // Si el status cambió a completed, registra la fecha de pago
        if ($request->filled('status') && $request->status === 'completed' && !$transaction->paid_at) {
            $validated['paid_at'] = now();
        }

        $transaction->update($validated);
        $transaction->load(['user', 'payment', 'package', 'property']);

        return response()->json([
            'success' => true,
            'message' => 'Transacción actualizada exitosamente',
            'data' => $transaction,
        ]);
    }

    /**
     * DELETE /api/transactions/{id}
     * Elimina una transacción (soft delete)
     */
    public function destroy(PaymentTransaction $transaction)
    {
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transacción eliminada exitosamente',
        ]);
    }

    /**
     * GET /api/transactions/user/{userId}
     * Obtiene transacciones de un usuario
     */
    public function getUserTransactions($userId, Request $request)
    {
        $query = PaymentTransaction::forUser($userId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->with(['payment', 'package', 'property'])
                              ->latest()
                              ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * POST /api/transactions/{id}/refund
     * Procesa un reembolso
     */
    public function refund(Request $request, PaymentTransaction $transaction)
    {
        if (!$transaction->canBeRefunded()) {
            return response()->json([
                'success' => false,
                'message' => 'Esta transacción no puede ser reembolsada',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
            'amount' => 'nullable|numeric|min:0.01',
        ]);

        $refundAmount = $validated['amount'] ?? $transaction->amount;

        if ($refundAmount > $transaction->amount) {
            return response()->json([
                'success' => false,
                'message' => 'El monto del reembolso no puede ser mayor al monto de la transacción',
            ], 422);
        }

        $transaction->update([
            'status' => PaymentTransaction::STATUS_REFUNDED,
            'metadata' => array_merge(
                $transaction->metadata ?? [],
                [
                    'refund_reason' => $validated['reason'],
                    'refund_amount' => $refundAmount,
                    'refunded_at' => now(),
                ]
            ),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reembolso procesado exitosamente',
            'data' => $transaction,
        ]);
    }

    /**
     * GET /api/transactions/stats/revenue
     * Estadísticas de ingresos
     */
    public function revenueStats(Request $request)
    {
        $stats = [
            'total_revenue' => PaymentTransaction::totalRevenue(),
            'average_transaction' => PaymentTransaction::averageTransaction(),
            'success_rate' => PaymentTransaction::successRate(),
            'failure_rate' => PaymentTransaction::failureRate(),
            'by_payment_method' => PaymentTransaction::revenueByPaymentMethod(),
            'by_currency' => PaymentTransaction::revenueByCurrency(),
            'total_transactions' => PaymentTransaction::count(),
            'completed_transactions' => PaymentTransaction::completed()->count(),
            'failed_transactions' => PaymentTransaction::failed()->count(),
            'pending_transactions' => PaymentTransaction::pending()->count(),
        ];

        if ($request->filled('days')) {
            $stats['daily_trend'] = PaymentTransaction::dailyRevenueTrend($request->days);
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/transactions/stats/top-spenders
     * Top usuarios por gasto
     */
    public function topSpenders(Request $request)
    {
        $limit = $request->limit ?? 10;
        $spenders = PaymentTransaction::topSpenders($limit);

        return response()->json([
            'success' => true,
            'data' => $spenders,
        ]);
    }

    /**
     * PATCH /api/transactions/{id}/mark-as-completed
     * Marca transacción como completada
     */
    public function markAsCompleted(PaymentTransaction $transaction)
    {
        if ($transaction->status === PaymentTransaction::STATUS_COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => 'Esta transacción ya está completada',
            ], 422);
        }

        $transaction->update([
            'status' => PaymentTransaction::STATUS_COMPLETED,
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transacción marcada como completada',
            'data' => $transaction,
        ]);
    }

    /**
     * PATCH /api/transactions/{id}/mark-as-failed
     * Marca transacción como fallida
     */
    public function markAsFailed(Request $request, PaymentTransaction $transaction)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $transaction->update([
            'status' => PaymentTransaction::STATUS_FAILED,
            'failed_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transacción marcada como fallida',
            'data' => $transaction,
        ]);
    }

    /**
     * POST /api/transactions/bulk-create
     * Crea múltiples transacciones
     */
    public function bulkCreate(Request $request)
    {
        $validated = $request->validate([
            'transactions' => 'required|array|min:1',
            'transactions.*.user_id' => 'required|exists:users,id',
            'transactions.*.amount' => 'required|numeric|min:0.01',
            'transactions.*.currency' => 'required|in:USD,EUR,DOP,MXN',
            'transactions.*.payment_method' => 'required|in:credit_card,debit_card,paypal,stripe,bank_transfer,wallet,other',
        ]);

        $created = [];
        foreach ($validated['transactions'] as $data) {
            $transaction = PaymentTransaction::create($data);
            $created[] = $transaction;
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' transacciones creadas exitosamente',
            'data' => $created,
        ], 201);
    }
}
