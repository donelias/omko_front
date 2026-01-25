<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyClickRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'property_id' => 'required|integer|exists:properties,id',
        ];
    }

    public function messages()
    {
        return [
            'property_id.required' => 'El ID de la propiedad es requerido',
            'property_id.exists' => 'La propiedad no existe',
        ];
    }
}
