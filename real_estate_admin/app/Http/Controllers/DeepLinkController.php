<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Property;
use App\Models\User;
use App\Models\Category;
use App\Models\Article;
use App\Models\Appointment;
use App\Models\ProjectPlans;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeepLinkController extends Controller
{
    /**
     * Handle deep link for property
     * Redirect to property detail page or API response
     */
    public function property($propertyId)
    {
        try {
            $property = Property::findOrFail($propertyId);
            
            // If API request, return JSON
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'property',
                    'data' => $property->load(['category', 'views', 'reviews'])
                ]);
            }
            
            return redirect()->route('properties.show', $property->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Propiedad no encontrada')], 404);
            }
            return redirect('/')->with('error', trans('Propiedad no encontrada'));
        }
    }

    /**
     * Handle deep link for agent/user
     */
    public function agent($agentId)
    {
        try {
            $agent = User::where('id', $agentId)->where('type', 'agent')->firstOrFail();
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'agent',
                    'data' => $agent->load(['properties', 'agentAppointments'])
                ]);
            }
            
            return redirect()->route('users.profile', $agent->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Agente no encontrado')], 404);
            }
            return redirect('/')->with('error', trans('Agente no encontrado'));
        }
    }

    /**
     * Handle deep link for category
     */
    public function category($categoryId)
    {
        try {
            $category = Category::findOrFail($categoryId);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'category',
                    'data' => $category
                ]);
            }
            
            return redirect()->route('categories.show', $category->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Categoría no encontrada')], 404);
            }
            return redirect('/')->with('error', trans('Categoría no encontrada'));
        }
    }

    /**
     * Handle deep link for article/blog post
     */
    public function article($articleId)
    {
        try {
            $article = Article::findOrFail($articleId);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'article',
                    'data' => $article
                ]);
            }
            
            return redirect()->route('articles.show', $article->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Artículo no encontrado')], 404);
            }
            return redirect('/')->with('error', trans('Artículo no encontrado'));
        }
    }

    /**
     * Handle deep link for appointment
     */
    public function appointment($appointmentId)
    {
        try {
            $appointment = Appointment::findOrFail($appointmentId);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'appointment',
                    'data' => $appointment->load(['user', 'agent', 'property'])
                ]);
            }
            
            return redirect()->route('appointments.show', $appointment->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Cita no encontrada')], 404);
            }
            return redirect('/')->with('error', trans('Cita no encontrada'));
        }
    }

    /**
     * Handle deep link for project
     */
    public function project($projectId)
    {
        try {
            $project = ProjectPlans::findOrFail($projectId);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'type' => 'project',
                    'data' => $project->load(['projectViews'])
                ]);
            }
            
            return redirect()->route('projects.show', $project->id);
        } catch (Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => trans('Proyecto no encontrado')], 404);
            }
            return redirect('/')->with('error', trans('Proyecto no encontrado'));
        }
    }
}

