<?php

namespace App\Http\Controllers\Api;

use App\Models\NewsletterSubscription;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class NewsletterSubscriptionController extends Controller
{
    /**
     * Get all newsletter subscriptions (admin only)
     */
    public function index(Request $request)
    {
        $query = NewsletterSubscription::query();

        // Filters
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }
        if ($request->has('frequency')) {
            $query->byFrequency($request->frequency);
        }
        if ($request->has('is_verified')) {
            $query->where('is_verified', (bool)$request->is_verified);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                    ->orWhere('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%");
            });
        }

        $subscriptions = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $subscriptions->items(),
            'meta' => [
                'total' => $subscriptions->total(),
                'per_page' => $subscriptions->perPage(),
                'current_page' => $subscriptions->currentPage(),
            ]
        ]);
    }

    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletter_subscriptions',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'frequency' => 'nullable|in:daily,weekly,monthly,never',
            'categories' => 'nullable|array',
        ]);

        $subscription = NewsletterSubscription::create([
            'user_id' => auth('sanctum')->id(),
            'email' => $validated['email'],
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'frequency' => $validated['frequency'] ?? NewsletterSubscription::FREQUENCY_WEEKLY,
            'categories' => $validated['categories'] ?? [],
            'verification_token' => Str::random(60),
            'unsubscribe_token' => Str::random(60),
            'subscribed_at' => now(),
        ]);

        // TODO: Enviar email de verificación

        return response()->json([
            'success' => true,
            'message' => 'Suscripción creada. Por favor verifica tu email.',
            'data' => $subscription,
        ], 201);
    }

    /**
     * Get subscription details
     */
    public function show(NewsletterSubscription $subscription)
    {
        return response()->json([
            'success' => true,
            'data' => $subscription,
        ]);
    }

    /**
     * Update subscription
     */
    public function update(Request $request, NewsletterSubscription $subscription)
    {
        // Verify ownership
        if ($subscription->user_id && $subscription->user_id !== auth('sanctum')->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'frequency' => 'nullable|in:daily,weekly,monthly,never',
            'categories' => 'nullable|array',
        ]);

        $subscription->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Suscripción actualizada',
            'data' => $subscription,
        ]);
    }

    /**
     * Delete subscription
     */
    public function destroy(NewsletterSubscription $subscription)
    {
        // Verify ownership
        if ($subscription->user_id && $subscription->user_id !== auth('sanctum')->id()) {
            abort(403, 'Unauthorized');
        }

        $subscription->delete();

        return response()->json([
            'success' => true,
            'message' => 'Suscripción eliminada',
        ]);
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $subscription = NewsletterSubscription::where('verification_token', $validated['token'])->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Token de verificación inválido',
            ], 404);
        }

        $subscription->verify();

        return response()->json([
            'success' => true,
            'message' => 'Email verificado exitosamente',
            'data' => $subscription,
        ]);
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'reason' => 'nullable|string|max:500',
        ]);

        $subscription = NewsletterSubscription::where('unsubscribe_token', $validated['token'])->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Token de desuscripción inválido',
            ], 404);
        }

        $subscription->unsubscribe($validated['reason'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Desuscrito exitosamente',
        ]);
    }

    /**
     * Reactivate subscription
     */
    public function reactivate(NewsletterSubscription $subscription)
    {
        if ($subscription->user_id && $subscription->user_id !== auth('sanctum')->id()) {
            abort(403, 'Unauthorized');
        }

        $subscription->reactivate();

        return response()->json([
            'success' => true,
            'message' => 'Suscripción reactivada',
            'data' => $subscription,
        ]);
    }

    /**
     * Get subscription statistics
     */
    public function statistics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_subscribers' => NewsletterSubscription::totalSubscribers(),
                'verified_rate' => NewsletterSubscription::verificationRate(),
                'bounce_rate' => NewsletterSubscription::bounceRatePercentage(),
                'unsubscribe_rate' => NewsletterSubscription::unsubscribeRatePercentage(),
                'status_distribution' => NewsletterSubscription::statusDistribution(),
                'frequency_distribution' => NewsletterSubscription::frequencyDistribution(),
                'top_domains' => NewsletterSubscription::domainDistribution(5),
                'inactive_subscribers' => NewsletterSubscription::inactiveSubscribers(60),
                'problematic_subscribers' => NewsletterSubscription::problematicSubscribers(),
            ]
        ]);
    }

    /**
     * Get active subscribers (bulk export)
     */
    public function activeSubscribers(Request $request)
    {
        $frequency = $request->query('frequency');
        $category = $request->query('category');

        $query = NewsletterSubscription::active()->verified();

        if ($frequency) {
            $query->byFrequency($frequency);
        }
        if ($category) {
            $query->byCategory($category);
        }

        $subscriptions = $query->select('email', 'first_name', 'last_name', 'frequency', 'categories')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $subscriptions->count(),
            'data' => $subscriptions,
        ]);
    }

    /**
     * Mark email as bounced
     */
    public function markBounced(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'increment' => 'nullable|boolean',
        ]);

        $subscription = NewsletterSubscription::findByEmail($validated['email']);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Suscripción no encontrada',
            ], 404);
        }

        $subscription->markBounced($validated['increment'] ?? true);

        return response()->json([
            'success' => true,
            'message' => 'Email marcado como rebotado',
        ]);
    }

    /**
     * Register complaint
     */
    public function complaint(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $subscription = NewsletterSubscription::findByEmail($validated['email']);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Suscripción no encontrada',
            ], 404);
        }

        $subscription->addComplaint();

        return response()->json([
            'success' => true,
            'message' => 'Queja registrada',
        ]);
    }

    /**
     * Get problematic subscriptions
     */
    public function problematic(Request $request)
    {
        $subscriptions = NewsletterSubscription::where(function ($query) {
            $query->where('bounce_count', '>', 0)
                ->orWhere('complaint_count', '>', 0);
        })->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $subscriptions->items(),
            'meta' => [
                'total' => $subscriptions->total(),
                'per_page' => $subscriptions->perPage(),
            ]
        ]);
    }

    /**
     * Check email subscription status
     */
    public function checkEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $subscription = NewsletterSubscription::findByEmail($validated['email']);

        return response()->json([
            'success' => true,
            'exists' => (bool)$subscription,
            'data' => $subscription ? [
                'status' => $subscription->status,
                'frequency' => $subscription->frequency,
                'is_verified' => $subscription->is_verified,
            ] : null,
        ]);
    }
}
