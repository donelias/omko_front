<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetOtpRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'phone' => 'required|string|regex:/^[0-9\+\-\s\(\)]+$/',
        ];
    }

    public function messages()
    {
        return [
            'phone.required' => 'El teléfono es requerido',
            'phone.regex' => 'El formato del teléfono no es válido',
        ];
    }
}
