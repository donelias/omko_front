<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchasePackageRequest extends FormRequest
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
        ];
    }

    public function messages()
    {
        return [
            'package_id.required' => 'El ID del paquete es requerido',
            'package_id.exists' => 'El paquete no existe',
            'payment_method.required' => 'El método de pago es requerido',
            'payment_method.in' => 'El método de pago no es válido',
        ];
    }
}
