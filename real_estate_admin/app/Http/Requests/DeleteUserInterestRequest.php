<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeleteUserInterestRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'interest_id' => 'required|integer|exists:user_interests,id',
        ];
    }

    public function messages()
    {
        return [
            'interest_id.required' => 'El ID del interés es requerido',
            'interest_id.exists' => 'El interés no existe',
        ];
    }
}
