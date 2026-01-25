<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyStatusRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'property_id' => 'required|integer|exists:properties,id',
            'status' => 'required|in:active,inactive,sold,rented',
        ];
    }

    public function messages()
    {
        return [
            'property_id.required' => 'El ID de la propiedad es requerido',
            'property_id.exists' => 'La propiedad no existe',
            'status.required' => 'El estado es requerido',
            'status.in' => 'El estado seleccionado no es válido',
        ];
    }
}
