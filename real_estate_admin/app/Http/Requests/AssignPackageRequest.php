<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignPackageRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'package_id' => 'required|integer|exists:packages,id',
        ];
    }

    public function messages()
    {
        return [
            'package_id.required' => 'El ID del paquete es requerido',
            'package_id.exists' => 'El paquete no existe',
        ];
    }
}
