<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetMessagesRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'other_user_id' => 'required|integer|exists:customers,id',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
        ];
    }

    public function messages()
    {
        return [
            'other_user_id.required' => 'El ID del otro usuario es requerido',
            'other_user_id.exists' => 'El usuario no existe',
            'limit.max' => 'El límite no puede exceder 100 mensajes',
        ];
    }
}
