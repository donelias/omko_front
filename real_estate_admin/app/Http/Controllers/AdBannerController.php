<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\AdBanner;
use App\Models\Category;
use Illuminate\Http\Request;

class AdBannerController extends Controller
{
    /**
     * Display all ad banners
     */
    public function index()
    {
        $banners = AdBanner::latest()->paginate(15);
        return view('ad-banners.index', compact('banners'));
    }

    /**
     * Show form to create new ad banner
     */
    public function create()
    {
        $categories = Category::where('status', 1)->get();
        return view('ad-banners.create', compact('categories'));
    }

    /**
     * Store ad banner
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'page' => 'required|in:homepage,property_listing,property_detail',
            'platform' => 'required|in:app,web',
            'placement' => 'required|string',
            'banner_image' => 'required|image|mimes:jpg,jpeg,png,gif|max:10240',
            'ad_type' => 'required|in:external_link,property,banner_only',
            'external_link_url' => 'nullable|url|max:255',
            'property_id' => 'nullable|integer|exists:propertys,id',
            'duration' => 'required|integer|min:1',
            'status' => 'boolean',
        ]);

        try {
            $banner = new AdBanner($validated);
            
            if ($request->hasFile('banner_image')) {
                $path = $request->file('banner_image')->store('ad-banners', 'public');
                $banner->banner_image = $path;
            }

            $banner->save();

            return redirect()->route('ad-banners.index')
                ->with('success', 'Banner publicitario creado exitosamente');
        } catch (Exception $e) {
            return back()->withError('Error al crear el banner: ' . $e->getMessage());
        }
    }

    /**
     * Show ad banner
     */
    public function show(AdBanner $adBanner)
    {
        return view('ad-banners.show', compact('adBanner'));
    }

    /**
     * Show form to edit ad banner
     */
    public function edit(AdBanner $adBanner)
    {
        $categories = Category::where('status', 1)->get();
        return view('ad-banners.edit', compact('adBanner', 'categories'));
    }

    /**
     * Update ad banner
     */
    public function update(Request $request, AdBanner $adBanner)
    {
        $validated = $request->validate([
            'page' => 'required|in:homepage,property_listing,property_detail',
            'platform' => 'required|in:app,web',
            'placement' => 'required|string',
            'banner_image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
            'ad_type' => 'required|in:external_link,property,banner_only',
            'external_link_url' => 'nullable|url|max:255',
            'property_id' => 'nullable|integer|exists:propertys,id',
            'duration' => 'required|integer|min:1',
            'status' => 'boolean',
        ]);

        try {
            if ($request->hasFile('banner_image')) {
                $path = $request->file('banner_image')->store('ad-banners', 'public');
                $validated['banner_image'] = $path;
            }

            $adBanner->update($validated);

            return redirect()->route('ad-banners.index')
                ->with('success', 'Banner actualizado exitosamente');
        } catch (Exception $e) {
            return back()->withError('Error al actualizar el banner: ' . $e->getMessage());
        }
    }

    /**
     * Delete ad banner
     */
    public function destroy(AdBanner $adBanner)
    {
        try {
            $adBanner->delete();
            return redirect()->route('ad-banners.index')
                ->with('success', 'Banner eliminado exitosamente');
        } catch (Exception $e) {
            return back()->withError('Error al eliminar el banner: ' . $e->getMessage());
        }
    }
}
