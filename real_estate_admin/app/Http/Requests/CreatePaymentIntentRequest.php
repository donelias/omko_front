<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'package_id' => 'required|integer|exists:packages,id',
            'payment_method' => 'required|in:stripe,paypal,razorpay,paystack',
            'amount' => 'required|numeric|min:0.01',
        ];
    }

    public function messages()
    {
        return [
            'package_id.required' => 'El ID del paquete es requerido',
            'package_id.exists' => 'El paquete no existe',
            'payment_method.required' => 'El método de pago es requerido',
            'payment_method.in' => 'El método de pago seleccionado no es válido',
            'amount.required' => 'El monto es requerido',
            'amount.numeric' => 'El monto debe ser un número',
            'amount.min' => 'El monto debe ser mayor a 0',
        ];
    }
}
