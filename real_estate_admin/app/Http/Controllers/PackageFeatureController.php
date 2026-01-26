<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Package;
use App\Models\Feature;
use Illuminate\Http\Request;
use App\Services\ResponseService;

class PackageFeatureController extends Controller
{
    /**
     * Display features for a package
     */
    public function index(Request $request)
    {
        if (!has_permissions('read', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('package-features.index');
    }

    /**
     * Show create form
     */
    public function create(Package $package)
    {
        if (!has_permissions('create', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('package-features.create', compact('package'));
    }

    /**
     * Store feature for package
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'packages')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'value' => 'nullable|string',
            'is_included' => 'boolean',
            'order' => 'required|integer|min:0',
        ]);

        try {
            Feature::create($validated);
            return ResponseService::successResponse(trans('Característica agregada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al agregar la característica'));
        }
    }

    /**
     * Show features list (for datatables)
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'packages')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'order');
        $order = $request->input('order', 'ASC');

        $query = Feature::query();

        if ($request->filled('package_id')) {
            $query->where('package_id', $request->get('package_id'));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'LIKE', "%$search%");
        }

        $total = $query->count();
        $features = $query->with('package')
                          ->orderBy($sort, $order)
                          ->skip($offset)
                          ->take($limit)
                          ->get();

        return response()->json([
            'total' => $total,
            'rows' => $features
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Feature $feature)
    {
        if (!has_permissions('update', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $package = $feature->package;
        return view('package-features.edit', compact('package', 'feature'));
    }

    /**
     * Update feature
     */
    public function update(Request $request, Feature $feature)
    {
        if (!has_permissions('update', 'packages')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'value' => 'nullable|string',
            'is_included' => 'boolean',
            'order' => 'required|integer|min:0',
        ]);

        try {
            $feature->update($validated);
            return ResponseService::successResponse(trans('Característica actualizada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al actualizar la característica'));
        }
    }

    /**
     * Delete feature
     */
    public function destroy(Feature $feature)
    {
        if (!has_permissions('delete', 'packages')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $feature->delete();
            return ResponseService::successResponse(trans('Característica eliminada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al eliminar la característica'));
        }
    }

    /**
     * Bulk update feature status
     */
    public function bulkUpdate(Request $request)
    {
        if (!has_permissions('update', 'packages')) {
            return response()->json(['success' => false, 'message' => PERMISSION_ERROR_MSG], 403);
        }

        $validated = $request->validate([
            'features' => 'required|array',
            'features.*.id' => 'required|integer',
            'features.*.is_included' => 'boolean',
        ]);

        try {
            foreach ($validated['features'] as $feature) {
                Feature::where('id', $feature['id'])
                    ->update(['is_included' => $feature['is_included'] ?? false]);
            }

            return response()->json(['success' => true, 'message' => trans('Características actualizadas')]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => trans('Error al actualizar')], 500);
