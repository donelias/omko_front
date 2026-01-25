<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'recipient_id' => 'required|integer|exists:customers,id',
            'message' => 'nullable|string|max:5000',
            'message_type' => 'nullable|in:text,audio,file,image',
            'file' => 'nullable|file|max:10240',
            'audio' => 'nullable|file|mimes:mp3,wav,aac|max:5120',
            'property_id' => 'nullable|integer|exists:properties,id',
        ];
    }

    public function messages()
    {
        return [
            'recipient_id.required' => 'El ID del destinatario es requerido',
            'recipient_id.exists' => 'El usuario destinatario no existe',
            'message.max' => 'El mensaje no puede exceder 5000 caracteres',
            'message_type.in' => 'El tipo de mensaje no es válido',
            'file.max' => 'El archivo no debe exceder 10MB',
            'audio.mimes' => 'El audio debe ser MP3, WAV o AAC',
            'property_id.exists' => 'La propiedad no existe',
        ];
    }
}
