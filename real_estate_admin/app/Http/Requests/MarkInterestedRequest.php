<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkInterestedRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'property_id' => 'required|integer|exists:properties,id',
            'interest_type' => 'nullable|in:viewing,inquiry,offer',
        ];
    }

    public function messages()
    {
        return [
            'property_id.required' => 'El ID de la propiedad es requerido',
            'property_id.exists' => 'La propiedad no existe',
            'interest_type.in' => 'El tipo de interés no es válido',
        ];
    }
}
