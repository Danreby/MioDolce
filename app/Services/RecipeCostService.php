<?php

namespace App\Services;

use App\Models\Recipe;

class RecipeCostService
{
    /**
     * Calcula o custo detalhado de uma receita.
     *
     * @return array{
     *   total_cost: float,
     *   cost_per_unit: float,
     *   yield_quantity: float,
     *   selling_price_per_unit: float,
     *   profit_per_unit: float,
     *   profit_total: float,
     *   profit_margin_percent: float,
     *   ingredients: array
     * }
     */
    public function calculate(Recipe $recipe): array
    {
        $recipe->loadMissing('recipeIngredients.ingredient');

        $ingredients = $recipe->recipeIngredients->map(function ($ri) {
            $costPerUnit = $ri->ingredient->cost_per_unit;
            $totalCost   = round($costPerUnit * (float) $ri->quantity_used, 4);

            return [
                'id'            => $ri->ingredient->id,
                'name'          => $ri->ingredient->name,
                'unit'          => $ri->ingredient->unit,
                'quantity_used' => (float) $ri->quantity_used,
                'cost_per_unit' => $costPerUnit,
                'total_cost'    => $totalCost,
            ];
        });

        $totalCost    = round((float) $ingredients->sum('total_cost'), 2);
        $yieldQty     = max((float) $recipe->yield_quantity, 0.01);
        $costPerUnit  = round($totalCost / $yieldQty, 4);
        $sellingPrice = (float) ($recipe->selling_price_per_unit ?? 0);

        $profitPerUnit     = max(0.0, $sellingPrice - $costPerUnit);
        $profitTotal       = round($profitPerUnit * $yieldQty, 2);
        $profitMargin      = $sellingPrice > 0
            ? round(($profitPerUnit / $sellingPrice) * 100, 1)
            : 0.0;

        return [
            'total_cost'              => $totalCost,
            'cost_per_unit'           => $costPerUnit,
            'yield_quantity'          => $yieldQty,
            'selling_price_per_unit'  => $sellingPrice,
            'profit_per_unit'         => $profitPerUnit,
            'profit_total'            => $profitTotal,
            'profit_margin_percent'   => $profitMargin,
            'ingredients'             => $ingredients->values()->toArray(),
        ];
    }
}
