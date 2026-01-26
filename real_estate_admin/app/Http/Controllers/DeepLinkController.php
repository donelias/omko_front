<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DeepLinkController extends Controller
{
    /**
     * Handle deep link for property
     */
    public function property($propertyId)
    {
        $property = \App\Models\Property::findOrFail($propertyId);
        return redirect()->route('properties.show', $property->id);
    }

    /**
     * Handle deep link for agent
     */
    public function agent($agentId)
    {
        $agent = \App\Models\User::findOrFail($agentId);
        return redirect()->route('users.profile', $agent->id);
    }

    /**
     * Handle deep link for category
     */
    public function category($categoryId)
    {
        $category = \App\Models\Category::findOrFail($categoryId);
        return redirect()->route('categories.show', $category->id);
    }

    /**
     * Handle deep link for article/blog post
     */
    public function article($articleId)
    {
        $article = \App\Models\Article::findOrFail($articleId);
        return redirect()->route('articles.show', $article->id);
    }

    /**
     * Handle deep link for appointment
     */
    public function appointment($appointmentId)
    {
        $appointment = \App\Models\Appointment::findOrFail($appointmentId);
        return redirect()->route('appointments.show', $appointment->id);
    }

    /**
     * Handle deep link for project
     */
    public function project($projectId)
    {
        $project = \App\Models\Projects::findOrFail($projectId);
        return redirect()->route('projects.show', $project->id);
    }
}
