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
        return view('ad-banners.index');
    }

    /**
     * Show form to create new ad banner
     */
    public function create()
    {
        if (!has_permissions('create', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $categories = Category::where('status', 1)->get();
        return view('ad-banners.create', compact('categories'));
    }

    /**
     * Store ad banner
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'ad_banners')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

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

            return ResponseService::successResponse(trans('Banner publicitario creado exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al crear el banner'));
        }
    }

    /**
     * Show ad banner
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'ad_banners')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'id');
        $order = $request->input('order', 'DESC');

        $query = AdBanner::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('placement', 'LIKE', "%$search%")
                  ->orWhere('page', 'LIKE', "%$search%");
        }

        $total = $query->count();
        $banners = $query->orderBy($sort, $order)
                         ->skip($offset)
                         ->take($limit)
                         ->get();

        return response()->json([
            'total' => $total,
            'rows' => $banners
        ]);
    }

    /**
     * Show form to edit ad banner
     */
    public function edit(AdBanner $adBanner)
    {
        if (!has_permissions('update', 'ad_banners')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $categories = Category::where('status', 1)->get();
        return view('ad-banners.edit', compact('adBanner', 'categories'));
    }

    /**
     * Update ad banner
     */
    public function update(Request $request, AdBanner $adBanner)
    {
        if (!has_permissions('update', 'ad_banners')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

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

            return ResponseService::successResponse(trans('Banner actualizado exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al actualizar el banner'));
        }
    }

    /**
     * Delete ad banner
     */
    public function destroy(AdBanner $adBanner)
    {
        if (!has_permissions('delete', 'ad_banners')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $adBanner->delete();
            return ResponseService::successResponse(trans('Banner eliminado exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al eliminar el banner'));
        }
    }
}

