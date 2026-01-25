<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'property_id' => 'required|integer|exists:properties,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|min:10',
            'category_id' => 'nullable|integer|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'city_id' => 'nullable|integer',
            'location' => 'nullable|string',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'property_id.required' => 'El ID de la propiedad es requerido',
            'property_id.exists' => 'La propiedad no existe',
            'price.numeric' => 'El precio debe ser un número',
            'category_id.exists' => 'La categoría seleccionada no existe',
        ];
    }
}
