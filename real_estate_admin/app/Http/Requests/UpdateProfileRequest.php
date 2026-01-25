<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:customers,email,' . auth()->id() . ',id',
            'phone' => 'nullable|string|unique:customers,phone,' . auth()->id() . ',id',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'fcm_token' => 'nullable|string',
            'bio' => 'nullable|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'email.email' => 'El email debe ser válido',
            'email.unique' => 'El email ya está en uso',
            'phone.unique' => 'El teléfono ya está en uso',
            'profile_image.image' => 'El archivo debe ser una imagen',
            'profile_image.max' => 'La imagen no debe exceder 2MB',
        ];
    }
}
