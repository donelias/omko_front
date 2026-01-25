<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeleteMessageRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'message_id' => 'required|integer|exists:chats,id',
        ];
    }

    public function messages()
    {
        return [
            'message_id.required' => 'El ID del mensaje es requerido',
            'message_id.exists' => 'El mensaje no existe',
        ];
    }
}
