<?php

namespace App\Http\Controllers;

use App\Models\HomepageSection;
use Illuminate\Http\Request;

class HomepageSectionController extends Controller
{
    /**
     * Display all homepage sections
     */
    public function index()
    {
        $sections = HomepageSection::orderBy('order')->paginate(15);
        return view('homepage-sections.index', compact('sections'));
    }

    /**
     * Show create form
     */
    public function create()
    {
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

            return redirect()->route('homepage-sections.index')
                ->with('success', 'Sección creada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Show section
     */
    public function show(HomepageSection $homepageSection)
    {
        return view('homepage-sections.show', compact('homepageSection'));
    }

    /**
     * Show edit form
     */
    public function edit(HomepageSection $homepageSection)
    {
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

            return redirect()->route('homepage-sections.index')
                ->with('success', 'Sección actualizada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Delete section
     */
    public function destroy(HomepageSection $homepageSection)
    {
        try {
            $homepageSection->delete();
            return redirect()->route('homepage-sections.index')
                ->with('success', 'Sección eliminada exitosamente');
        } catch (\Exception $e) {
            return back()->withError('Error: ' . $e->getMessage());
        }
    }

    /**
     * Update order of sections
     */
    public function updateOrder(Request $request)
    {
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

            return response()->json(['success' => true, 'message' => 'Orden actualizado']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
