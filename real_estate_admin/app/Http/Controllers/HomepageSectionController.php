<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\HomepageSection;
use Illuminate\Http\Request;
use App\Services\ResponseService;

class HomepageSectionController extends Controller
{
    /**
     * Display all homepage sections
     */
    public function index()
    {
        if (!has_permissions('read', 'homepage_sections')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('homepage-sections.index');
    }

    /**
     * Show create form
     */
    public function create()
    {
        if (!has_permissions('create', 'homepage_sections')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $sectionTypes = [
            'hero' => 'Hero Banner',
            'featured_properties' => 'Propiedades Destacadas',
            'categories' => 'Categorías',
            'testimonials' => 'Testimonios',
            'blog' => 'Blog',
            'call_to_action' => 'Llamada a la Acción',
            'partners' => 'Socios',
            'newsletter' => 'Newsletter',
        ];
        return view('homepage-sections.create', compact('sectionTypes'));
    }

    /**
     * Store homepage section
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'homepage_sections')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
            'order' => 'required|integer|min:0',
            'status' => 'boolean',
            'settings' => 'nullable|json',
        ]);

        try {
            $section = new HomepageSection($validated);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('homepage-sections', 'public');
                $section->image = $path;
            }

            $section->save();

            return ResponseService::successResponse(trans('Sección creada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al crear la sección'));
        }
    }

    /**
     * Show sections list (for datatables)
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'homepage_sections')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'order');
        $order = $request->input('order', 'ASC');

        $query = HomepageSection::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('title', 'LIKE', "%$search%")
                  ->orWhere('type', 'LIKE', "%$search%");
        }

        $total = $query->count();
        $sections = $query->orderBy($sort, $order)
                          ->skip($offset)
                          ->take($limit)
                          ->get();

        return response()->json([
            'total' => $total,
            'rows' => $sections
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(HomepageSection $homepageSection)
    {
        if (!has_permissions('update', 'homepage_sections')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $sectionTypes = [
            'hero' => 'Hero Banner',
            'featured_properties' => 'Propiedades Destacadas',
            'categories' => 'Categorías',
            'testimonials' => 'Testimonios',
            'blog' => 'Blog',
            'call_to_action' => 'Llamada a la Acción',
            'partners' => 'Socios',
            'newsletter' => 'Newsletter',
        ];
        return view('homepage-sections.edit', compact('homepageSection', 'sectionTypes'));
    }

    /**
     * Update section
     */
    public function update(Request $request, HomepageSection $homepageSection)
    {
        if (!has_permissions('update', 'homepage_sections')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:10240',
            'order' => 'required|integer|min:0',
            'status' => 'boolean',
            'settings' => 'nullable|json',
        ]);

        try {
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('homepage-sections', 'public');
                $validated['image'] = $path;
            }

            $homepageSection->update($validated);

            return ResponseService::successResponse(trans('Sección actualizada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al actualizar la sección'));
        }
    }

    /**
     * Delete section
     */
    public function destroy(HomepageSection $homepageSection)
    {
        if (!has_permissions('delete', 'homepage_sections')) {
            return ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }

        try {
            $homepageSection->delete();
            return ResponseService::successResponse(trans('Sección eliminada exitosamente'));
        } catch (Exception $e) {
            return ResponseService::errorResponse(trans('Error al eliminar la sección'));
        }
    }

    /**
     * Update order of sections
     */
    public function updateOrder(Request $request)
    {
        if (!has_permissions('update', 'homepage_sections')) {
            return response()->json(['success' => false, 'message' => PERMISSION_ERROR_MSG], 403);
        }

        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer',
            'sections.*.order' => 'required|integer',
        ]);

        try {
            foreach ($validated['sections'] as $section) {
                HomepageSection::where('id', $section['id'])
                    ->update(['order' => $section['order']]);
            }

            return response()->json(['success' => true, 'message' => trans('Orden actualizado')]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => trans('Error al actualizar el orden')], 500);
        }
    }
}

