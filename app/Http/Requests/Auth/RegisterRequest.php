<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:255'],
            'email'    => [
                'required',
                'string',
                'email',
                'max:255',
                function ($attribute, $value, $fail) {
                    $existing = User::where('email', strtolower(trim($value)))->first();

                    if (!$existing) {
                        return;
                    }

                    if (!empty($existing->google_id)) {
                        $fail('Este e-mail está vinculado a uma conta Google. Entre usando o botão "Entrar com Google".');
                    } else {
                        $fail('Este e-mail já está cadastrado.');
                    }
                },
            ],
            'phone'    => ['nullable', 'string', 'max:30', 'regex:/^[\d\s\(\)\-\+]+$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'O nome é obrigatório.',
            'name.min'           => 'O nome deve ter pelo menos 2 caracteres.',
            'email.required'     => 'O e-mail é obrigatório.',
            'email.email'        => 'Informe um e-mail válido.',
            'phone.regex'        => 'O telefone contém caracteres inválidos.',
            'password.required'  => 'A senha é obrigatória.',
            'password.confirmed' => 'As senhas não conferem.',
        ];
    }
}
