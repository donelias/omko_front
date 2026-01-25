<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetPropertiesRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'category_id' => 'nullable|integer|exists:categories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'city_id' => 'nullable|integer',
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|in:newest,popular,price_low,price_high',
        ];
    }

    public function messages()
    {
        return [
            'category_id.exists' => 'La categoría seleccionada no existe',
            'min_price.numeric' => 'El precio mínimo debe ser un número',
            'max_price.numeric' => 'El precio máximo debe ser un número',
            'limit.max' => 'El límite no puede exceder 100 registros',
        ];
    }
}
