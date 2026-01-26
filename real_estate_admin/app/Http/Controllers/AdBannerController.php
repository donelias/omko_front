<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\AdBanner;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Services\ResponseService;

class AdBannerController extends Controller
{
    /**
     * Display all ad banners
     */
    public function index()
    {
        if (!has_permissions('read', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $banners = AdBanner::paginate(15);
        return view('admin.ad-banners.index', compact('banners'));
    }

    /**
     * Show form to create new ad banner
     */
    public function create()
    {
        if (!has_permissions('create', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('admin.ad-banners.form');
    }

    /**
     * Store ad banner
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'platform' => 'required|in:web,mobile,email',
            'description' => 'nullable|string',
            'image_path' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
            'link_url' => 'nullable|url',
            'priority' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        try {
            $banner = new AdBanner($validated);
            
            if ($request->hasFile('image_path')) {
                $path = $request->file('image_path')->store('ad-banners', 'public');
                $banner->image_path = $path;
            }

            $banner->save();
            return redirect()->route('ad-banners.index')->with('success', trans('Ad banner created successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error creating ad banner'));
        }
    }

    /**
     * Show ad banner
     */
    public function show(AdBanner $adBanner)
    {
        if (!has_permissions('read', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('admin.ad-banners.show', compact('adBanner'));
    }

    /**
     * Show form to edit ad banner
     */
    public function edit(AdBanner $adBanner)
    {
        if (!has_permissions('update', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $banner = $adBanner;
        return view('admin.ad-banners.form', compact('banner'));
    }

    /**
     * Update ad banner
     */
    public function update(Request $request, AdBanner $adBanner)
    {
        if (!has_permissions('update', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'platform' => 'required|in:web,mobile,email',
            'description' => 'nullable|string',
            'image_path' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
            'link_url' => 'nullable|url',
            'priority' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        try {
            if ($request->hasFile('image_path')) {
                $path = $request->file('image_path')->store('ad-banners', 'public');
                $validated['image_path'] = $path;
            }

            $adBanner->update($validated);
            return redirect()->route('ad-banners.index')->with('success', trans('Ad banner updated successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error updating ad banner'));
        }
    }

    /**
     * Delete ad banner
     */
    public function destroy(AdBanner $adBanner)
    {
        if (!has_permissions('delete', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        try {
            $adBanner->delete();
            return redirect()->route('ad-banners.index')->with('success', trans('Ad banner deleted successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error deleting ad banner'));
        }
    }
}

