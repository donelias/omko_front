<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        $user = auth('api')->user();
        
        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'Unauthorized - Authentication required',
            ], 401);
        }

        // Check if user is admin
        // Admin users have type = 0 or is_admin flag = true
        if ($user->type != 0 && (!isset($user->is_admin) || !$user->is_admin)) {
            return response()->json([
                'error' => true,
                'message' => 'Forbidden - Admin access required',
            ], 403);
        }

        return $next($request);
    }
}
