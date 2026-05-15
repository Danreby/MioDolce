<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'quantity_purchased',
        'cost_purchased',
        'notes',
    ];

    protected $casts = [
        'quantity_purchased' => 'decimal:3',
        'cost_purchased'     => 'decimal:2',
    ];

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    /**
     * Custo por unidade de medida (R$ / unidade).
     */
    public function getCostPerUnitAttribute(): float
    {
        if ((float) $this->quantity_purchased <= 0) {
            return 0.0;
        }

        return (float) $this->cost_purchased / (float) $this->quantity_purchased;
    }
}
