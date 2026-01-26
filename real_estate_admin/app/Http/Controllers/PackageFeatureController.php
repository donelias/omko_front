<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Package;
use App\Models\Feature;
use Illuminate\Http\Request;

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
    }
}