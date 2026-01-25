<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserInterestsRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'interests' => 'required|array|min:1',
            'interests.*' => 'integer|exists:categories,id',
        ];
    }

    public function messages()
    {
        return [
            'interests.required' => 'Los intereses son requeridos',
            'interests.array' => 'Los intereses deben ser un array',
            'interests.min' => 'Debe seleccionar al menos un interés',
            'interests.*.exists' => 'Una o más categorías seleccionadas no existen',
        ];
    }
}
