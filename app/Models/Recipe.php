<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Recipe extends Model
{
    protected $fillable = [
        'name',
        'description',
        'yield_quantity',
        'yield_unit',
        'selling_price_per_unit',
        'notes',
    ];

    protected $casts = [
        'yield_quantity'          => 'decimal:2',
        'selling_price_per_unit'  => 'decimal:2',
    ];

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'recipe_ingredients')
            ->withPivot('quantity_used')
            ->withTimestamps();
    }
}
