<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                     => ['required', 'string', 'max:255'],
            'description'              => ['nullable', 'string', 'max:2000'],
            'yield_quantity'           => ['required', 'numeric', 'min:0.01'],
            'yield_unit'               => ['required', 'string', 'max:50'],
            'selling_price_per_unit'   => ['nullable', 'numeric', 'min:0'],
            'notes'                    => ['nullable', 'string', 'max:1000'],
            'ingredients'              => ['required', 'array', 'min:1'],
            'ingredients.*.ingredient_id' => ['required', 'exists:ingredients,id'],
            'ingredients.*.quantity_used' => ['required', 'numeric', 'min:0.001'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                           => 'O nome da receita é obrigatório.',
            'yield_quantity.required'                 => 'A quantidade produzida é obrigatória.',
            'yield_quantity.min'                      => 'A quantidade produzida deve ser maior que zero.',
            'yield_unit.required'                     => 'A unidade de rendimento é obrigatória.',
            'ingredients.required'                    => 'Adicione ao menos um ingrediente.',
            'ingredients.min'                         => 'Adicione ao menos um ingrediente.',
            'ingredients.*.ingredient_id.required'    => 'Selecione um ingrediente.',
            'ingredients.*.ingredient_id.exists'      => 'Ingrediente inválido.',
            'ingredients.*.quantity_used.required'    => 'Informe a quantidade utilizada.',
            'ingredients.*.quantity_used.min'         => 'A quantidade deve ser maior que zero.',
        ];
    }
}
