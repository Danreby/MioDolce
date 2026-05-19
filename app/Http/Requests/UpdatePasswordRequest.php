<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'password' => ['required', 'confirmed', Password::defaults()],
        ];

        if (auth()->user()?->hasPasswordSet()) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'current_password.required'      => 'A senha atual é obrigatória.',
            'current_password.current_password' => 'A senha atual está incorreta.',
            'password.required'              => 'A nova senha é obrigatória.',
            'password.confirmed'             => 'As senhas não conferem.',
        ];
    }
}
