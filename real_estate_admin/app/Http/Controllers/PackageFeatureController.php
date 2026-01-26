<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Feature;
use Illuminate\Http\Request;

class PackageFeatureController extends Controller
{
    /**
     * Display features for a package
     */
    public function index(Package $package)
    {
        $features = Feature::where('package_id', $package->id)->paginate(15);
        return view('package-features.index', compact('package', 'features'));
    }

    /**
     * Show create form
     */
    public function create(Package $package)
    {
        return view('package-features.create', compact('package'));
    }

    /**
     * Store feature for package
     */
    public function store(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'value' => 'nullable|string',
            'is_included' => 'boolean',
            'order' => 'required|integer|min:0',
        ]);

        try {
            $validated['package_id'] = $package->id;
            Feature::create($validated);

            return redirect()->route('packages.features.index', $package->id)
                ->with('success', 'Característica agregada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Show feature
     */
    public function show(Package $package, Feature $feature)
    {
        return view('package-features.show', compact('package', 'feature'));
    }

    /**
     * Show edit form
     */
    public function edit(Package $package, Feature $feature)
    {
        return view('package-features.edit', compact('package', 'feature'));
    }

    /**
     * Update feature
     */
    public function update(Request $request, Package $package, Feature $feature)
    {
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

            return redirect()->route('packages.features.index', $package->id)
                ->with('success', 'Característica actualizada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Delete feature
     */
    public function destroy(Package $package, Feature $feature)
    {
        try {
            $feature->delete();
            return redirect()->route('packages.features.index', $package->id)
                ->with('success', 'Característica eliminada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Bulk update feature status
     */
    public function bulkUpdate(Request $request, Package $package)
    {
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

            return response()->json(['success' => true, 'message' => 'Características actualizadas']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
