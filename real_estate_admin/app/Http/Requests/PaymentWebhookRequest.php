<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentWebhookRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Webhooks don't require authentication
    }

    public function rules()
    {
        return [
            'id' => 'required|string',
            'object' => 'required|string',
            'type' => 'required|string',
            'data' => 'required|array',
        ];
    }

    public function messages()
    {
        return [
            'id.required' => 'El ID del evento es requerido',
            'type.required' => 'El tipo de evento es requerido',
            'data.required' => 'Los datos del evento son requeridos',
        ];
    }
}
