<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RemovePropertyImageRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'image_id' => 'required|integer|exists:property_images,id',
        ];
    }

    public function messages()
    {
        return [
            'image_id.required' => 'El ID de la imagen es requerido',
            'image_id.exists' => 'La imagen no existe',
        ];
    }
}
