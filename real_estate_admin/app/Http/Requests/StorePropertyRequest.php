<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'category_id' => 'required|integer|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'city_id' => 'required|integer',
            'location' => 'required|string',
            'bedrooms' => 'integer|min:0',
            'bathrooms' => 'integer|min:0',
            'area' => 'numeric|min:0',
            'property_images' => 'nullable|array',
            'property_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'facilities' => 'nullable|array',
            'parameters' => 'nullable|array',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'El título de la propiedad es requerido',
            'title.max' => 'El título no puede exceder 255 caracteres',
            'description.required' => 'La descripción es requerida',
            'description.min' => 'La descripción debe tener al menos 10 caracteres',
            'category_id.required' => 'La categoría es requerida',
            'category_id.exists' => 'La categoría seleccionada no existe',
            'price.required' => 'El precio es requerido',
            'price.numeric' => 'El precio debe ser un número',
            'price.min' => 'El precio no puede ser negativo',
            'city_id.required' => 'La ciudad es requerida',
            'location.required' => 'La ubicación es requerida',
        ];
    }
}
