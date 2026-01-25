<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class LanguageManager
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $locale = null;

        // 1. Check Accept-Language header (priority for API requests)
        if ($request->hasHeader('Accept-Language')) {
            $acceptLanguage = $request->header('Accept-Language');
            // Parse Accept-Language header (e.g., "es-ES,es;q=0.9" or "en-US")
            $languages = explode(',', $acceptLanguage);
            foreach ($languages as $lang) {
                $lang = trim(explode(';', $lang)[0]); // Remove quality factor and trim
                $lang = strtolower($lang);
                
                // Check for Spanish variations
                if (strpos($lang, 'es') === 0) {
                    $locale = 'es';
                    break;
                }
                // Check for English variations
                elseif (strpos($lang, 'en') === 0) {
                    $locale = 'en';
                    break;
                }
            }
        }

        // 2. Check session (priority for web requests)
        if (!$locale && Session::has('locale')) {
            $locale = Session::get('locale');
        }

        // 3. Check query parameter (?lang=es)
        if (!$locale && $request->has('lang')) {
            $locale = $request->query('lang');
        }

        // 4. Get default language from database settings
        if (!$locale) {
            try {
                $setting = Setting::where('type', 'default_language')->first();
                if ($setting && $setting->data) {
                    $locale = $setting->data;
                } else {
                    $locale = config('app.locale');
                }
            } catch (\Exception $e) {
                $locale = config('app.locale');
            }
        }

        // Set the locale
        if ($locale && in_array($locale, ['es', 'en'])) {
            app()->setLocale($locale);
            if (!Session::has('locale')) {
                Session::put('locale', $locale);
            }
        } else {
            app()->setLocale(config('app.locale'));
        }

        return $next($request);
    }
}
