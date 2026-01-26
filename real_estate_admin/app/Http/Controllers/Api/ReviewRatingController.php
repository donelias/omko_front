<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewRating;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewRatingController extends Controller
{
    /**
     * GET /api/reviews
     * Lista todas las reseñas
     */
    public function index(Request $request)
    {
        $query = ReviewRating::query();

        if ($request->filled('property_id')) {
            $query->forProperty($request->property_id);
        }

        if ($request->filled('agent_id')) {
            $query->forAgent($request->agent_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating_min')) {
            $query->ratingAbove($request->rating_min);
        }

        if ($request->filled('verified_only')) {
            $query->verifiedPurchase();
        }

        if ($request->filled('sort') && $request->sort === 'helpful') {
            $query->mostHelpful();
        } else {
            $query->latest();
        }

        $reviews = $query->with(['user', 'property', 'agent'])
                        ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * GET /api/reviews/{id}
     * Obtiene detalles de una reseña
     */
    public function show(ReviewRating $review)
    {
        $review->load(['user', 'property', 'agent']);

        return response()->json([
            'success' => true,
            'data' => $review,
        ]);
    }

    /**
     * POST /api/reviews
     * Crea una nueva reseña
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'agent_id' => 'nullable|exists:users,id',
            'rating' => 'required|numeric|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'review' => 'nullable|string',
            'is_verified_purchase' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = ReviewRating::STATUS_PENDING;

        $review = ReviewRating::create($validated);
        $review->load(['user', 'property', 'agent']);

        return response()->json([
            'success' => true,
            'message' => 'Reseña creada exitosamente y está pendiente de aprobación',
            'data' => $review,
        ], 201);
    }

    /**
     * PUT /api/reviews/{id}
     * Actualiza una reseña
     */
    public function update(Request $request, ReviewRating $review)
    {
        // Solo el autor puede actualizar
        if ($review->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para actualizar esta reseña',
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'numeric|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'review' => 'nullable|string',
        ]);

        $review->update($validated);
        $review->load(['user', 'property', 'agent']);

        return response()->json([
            'success' => true,
            'message' => 'Reseña actualizada exitosamente',
            'data' => $review,
        ]);
    }

    /**
     * DELETE /api/reviews/{id}
     * Elimina una reseña
     */
    public function destroy(ReviewRating $review)
    {
        // Solo el autor o admin pueden eliminar
        if ($review->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para eliminar esta reseña',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reseña eliminada exitosamente',
        ]);
    }

    /**
     * GET /api/properties/{propertyId}/reviews
     * Obtiene reseñas de una propiedad
     */
    public function getPropertyReviews($propertyId, Request $request)
    {
        $property = Property::findOrFail($propertyId);

        $query = ReviewRating::forProperty($propertyId)->approved();

        if ($request->filled('sort') && $request->sort === 'helpful') {
            $query->mostHelpful();
        } else {
            $query->latest();
        }

        $reviews = $query->with('user')
                        ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * GET /api/agents/{agentId}/reviews
     * Obtiene reseñas de un agente
     */
    public function getAgentReviews($agentId, Request $request)
    {
        $agent = User::findOrFail($agentId);

        $query = ReviewRating::forAgent($agentId)->approved();

        if ($request->filled('sort') && $request->sort === 'helpful') {
            $query->mostHelpful();
        } else {
            $query->latest();
        }

        $reviews = $query->with('user')
                        ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * GET /api/reviews/{id}/helpful
     * Marca reseña como útil
     */
    public function markHelpful(ReviewRating $review)
    {
        $review->markAsHelpful();

        return response()->json([
            'success' => true,
            'message' => 'Reseña marcada como útil',
            'helpful_count' => $review->helpful_count,
        ]);
    }

    /**
     * GET /api/reviews/{id}/unhelpful
     * Marca reseña como no útil
     */
    public function markUnhelpful(ReviewRating $review)
    {
        $review->markAsUnhelpful();

        return response()->json([
            'success' => true,
            'message' => 'Reseña marcada como no útil',
            'unhelpful_count' => $review->unhelpful_count,
        ]);
    }

    /**
     * GET /api/properties/{propertyId}/reviews/stats
     * Estadísticas de reseñas para una propiedad
     */
    public function propertyReviewStats($propertyId)
    {
        $avgRating = ReviewRating::averageRatingForProperty($propertyId);
        $reviewCount = ReviewRating::countForProperty($propertyId);
        $distribution = ReviewRating::ratingDistributionForProperty($propertyId);

        return response()->json([
            'success' => true,
            'data' => [
                'property_id' => $propertyId,
                'average_rating' => round($avgRating, 2),
                'total_reviews' => $reviewCount,
                'rating_distribution' => $distribution,
                'verified_percentage' => ReviewRating::verifiedPurchasePercentage(),
            ],
        ]);
    }

    /**
     * GET /api/agents/{agentId}/reviews/stats
     * Estadísticas de reseñas para un agente
     */
    public function agentReviewStats($agentId)
    {
        $avgRating = ReviewRating::averageRatingForAgent($agentId);
        $reviewCount = ReviewRating::countForAgent($agentId);
        $distribution = ReviewRating::ratingDistributionForAgent($agentId);

        return response()->json([
            'success' => true,
            'data' => [
                'agent_id' => $agentId,
                'average_rating' => round($avgRating, 2),
                'total_reviews' => $reviewCount,
                'rating_distribution' => $distribution,
                'verified_percentage' => ReviewRating::verifiedPurchasePercentage(),
            ],
        ]);
    }

    /**
     * PATCH /api/reviews/{id}/approve
     * Aprueba una reseña (admin)
     */
    public function approve(ReviewRating $review)
    {
        $review->approve();

        return response()->json([
            'success' => true,
            'message' => 'Reseña aprobada',
            'data' => $review,
        ]);
    }

    /**
     * PATCH /api/reviews/{id}/reject
     * Rechaza una reseña (admin)
     */
    public function reject(Request $request, ReviewRating $review)
    {
        $review->reject();

        return response()->json([
            'success' => true,
            'message' => 'Reseña rechazada',
            'data' => $review,
        ]);
    }

    /**
     * PATCH /api/reviews/{id}/flag
     * Marca como problema (admin)
     */
    public function flag(Request $request, ReviewRating $review)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $review->flag($validated['reason'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Reseña marcada como problema',
            'data' => $review,
        ]);
    }

    /**
     * GET /api/reviews/pending
     * Reseñas pendientes de aprobación
     */
    public function pending(Request $request)
    {
        $reviews = ReviewRating::pending()
                               ->with(['user', 'property', 'agent'])
                               ->latest()
                               ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * GET /api/reviews/flagged
     * Reseñas marcadas como problemas
     */
    public function flagged(Request $request)
    {
        $reviews = ReviewRating::flagged()
                               ->with(['user', 'property', 'agent'])
                               ->latest()
                               ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * PATCH /api/reviews/{id}/feature
     * Destaca una reseña
     */
    public function feature(ReviewRating $review)
    {
        $review->update(['featured' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Reseña destacada',
            'data' => $review,
        ]);
    }

    /**
     * PATCH /api/reviews/{id}/unfeature
     * Quita el destaque de una reseña
     */
    public function unfeature(ReviewRating $review)
    {
        $review->update(['featured' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Destaque de reseña removido',
            'data' => $review,
        ]);
    }
}
