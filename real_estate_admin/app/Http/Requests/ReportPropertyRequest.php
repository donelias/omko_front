<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportPropertyRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'property_id' => 'required|integer|exists:properties,id',
            'reason_id' => 'required|integer|exists:report_reasons,id',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'property_id.required' => 'El ID de la propiedad es requerido',
            'property_id.exists' => 'La propiedad no existe',
            'reason_id.required' => 'La razón del reporte es requerida',
            'reason_id.exists' => 'La razón seleccionada no existe',
            'description.max' => 'La descripción no puede exceder 1000 caracteres',
        ];
    }
}
