<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Recipe;
use App\Services\RecipeCostService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private RecipeCostService $costService) {}

    public function index(): Response
    {
        $recipes     = Recipe::with('recipeIngredients.ingredient')->latest()->get();
        $ingredients = Ingredient::all();

        $recipeCosts = $recipes->map(fn ($recipe) => [
            'id'   => $recipe->id,
            'name' => $recipe->name,
            'cost' => $this->costService->calculate($recipe)['total_cost'],
        ])->sortByDesc('cost')->values();

        $totalCosts = $recipeCosts->sum('cost');

        $stats = [
            'total_ingredients' => $ingredients->count(),
            'total_recipes'     => $recipes->count(),
            'avg_recipe_cost'   => $recipes->count() > 0
                ? round($recipeCosts->avg('cost'), 2)
                : 0.0,
            'most_expensive'    => $recipeCosts->first(),
            'total_costs'       => round($totalCosts, 2),
        ];

        $recentRecipes = $recipes->take(5)->map(fn ($recipe) => [
            'id'   => $recipe->id,
            'name' => $recipe->name,
            'cost' => $this->costService->calculate($recipe),
        ]);

        return Inertia::render('Dashboard', [
            'stats'          => $stats,
            'recipe_costs'   => $recipeCosts->take(8)->values(),
            'recent_recipes' => $recentRecipes->values(),
        ]);
    }
}
