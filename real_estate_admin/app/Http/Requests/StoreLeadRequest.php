<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'property_id' => 'nullable|integer|exists:propertys,id',
            'source' => 'required|in:meta,website,manual',
            'ip_address' => 'nullable|string|max:45',
            'user_agent' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'El nombre es obligatorio',
            'first_name.string' => 'El nombre debe ser texto',
            'first_name.max' => 'El nombre no puede exceder 100 caracteres',
            'email.email' => 'El email debe ser válido',
            'phone.max' => 'El teléfono no puede exceder 20 caracteres',
            'property_id.exists' => 'La propiedad seleccionada no existe',
            'source.in' => 'La fuente debe ser: meta, website o manual',
        ];
    }
}
