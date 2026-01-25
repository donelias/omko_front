<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'phone' => 'required|string',
            'otp' => 'required|string|size:6|regex:/^[0-9]{6}$/',
        ];
    }

    public function messages()
    {
        return [
            'phone.required' => 'El teléfono es requerido',
            'otp.required' => 'El OTP es requerido',
            'otp.size' => 'El OTP debe tener 6 dígitos',
            'otp.regex' => 'El OTP debe contener solo números',
        ];
    }
}
