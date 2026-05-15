<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'               => ['required', 'string', 'max:255'],
            'unit'               => ['required', 'in:kg,g,l,ml,un,tbsp,tsp,mg'],
            'quantity_purchased' => ['required', 'numeric', 'min:0.001'],
            'cost_purchased'     => ['required', 'numeric', 'min:0'],
            'notes'              => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'               => 'O nome do ingrediente é obrigatório.',
            'unit.required'               => 'A unidade de medida é obrigatória.',
            'unit.in'                     => 'Unidade de medida inválida.',
            'quantity_purchased.required' => 'A quantidade comprada é obrigatória.',
            'quantity_purchased.min'      => 'A quantidade deve ser maior que zero.',
            'cost_purchased.required'     => 'O custo de compra é obrigatório.',
            'cost_purchased.min'          => 'O custo não pode ser negativo.',
        ];
    }
}
