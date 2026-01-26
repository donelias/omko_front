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
        $features = Feature::with('package')->paginate(15);
        return view('admin.package-features.index', compact('features'));
    }

    /**
     * Show create form
     */
    public function create()
    {
        if (!has_permissions('create', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $packages = Package::all();
        return view('admin.package-features.form', compact('packages'));
    }

    /**
     * Store feature for package
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_included' => 'boolean',
        ]);

        try {
            Feature::create($validated);
            return redirect()->route('package-features.index')->with('success', trans('Feature created successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error creating feature'));
        }
    }

    /**
     * Show feature
     */
    public function show(Feature $packageFeature)
    {
        if (!has_permissions('read', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('admin.package-features.show', ['feature' => $packageFeature]);
    }

    /**
     * Show edit form
     */
    public function edit(Feature $packageFeature)
    {
        if (!has_permissions('update', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $packages = Package::all();
        $feature = $packageFeature;
        return view('admin.package-features.form', compact('feature', 'packages'));
    }

    /**
     * Update feature
     */
    public function update(Request $request, Feature $packageFeature)
    {
        if (!has_permissions('update', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_included' => 'boolean',
        ]);

        try {
            $packageFeature->update($validated);
            return redirect()->route('package-features.index')->with('success', trans('Feature updated successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error updating feature'));
        }
    }

    /**
     * Delete feature
     */
    public function destroy(Feature $packageFeature)
    {
        if (!has_permissions('delete', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        try {
            $packageFeature->delete();
            return redirect()->route('package-features.index')->with('success', trans('Feature deleted successfully'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error deleting feature'));
        }
    }

    /**
     * Bulk action on features
     */
    public function bulkAction(Request $request)
    {
        if (!has_permissions('update', 'packages')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'action' => 'required|in:delete,activate,deactivate',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:features,id',
        ]);

        try {
            $query = Feature::whereIn('id', $validated['ids']);
            
            switch ($validated['action']) {
                case 'delete':
                    $query->delete();
                    $message = trans('Features deleted successfully');
                    break;
                case 'activate':
                    $query->update(['is_included' => true]);
                    $message = trans('Features activated successfully');
                    break;
                case 'deactivate':
                    $query->update(['is_included' => false]);
                    $message = trans('Features deactivated successfully');
                    break;
            }

            return redirect()->route('package-features.index')->with('success', $message);
        } catch (Exception $e) {
            return redirect()->back()->with('error', trans('Error performing bulk action'));
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
            return response()->json(['success' => false, 'message' => trans('Error al actualizar')], 500);        }
    }
}