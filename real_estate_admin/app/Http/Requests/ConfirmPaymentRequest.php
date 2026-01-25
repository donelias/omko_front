<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmPaymentRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'payment_intent_id' => 'required|string',
            'payment_method_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
        ];
    }

    public function messages()
    {
        return [
            'payment_intent_id.required' => 'El ID del intent es requerido',
            'payment_method_id.required' => 'El ID del método de pago es requerido',
            'amount.required' => 'El monto es requerido',
            'amount.numeric' => 'El monto debe ser un número válido',
        ];
    }
}
