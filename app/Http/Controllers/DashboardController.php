<?php

namespace App\Http\Controllers;

use App\Services\RecipeCostService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private RecipeCostService $costService) {}

    public function index(): Response
    {
        $user        = auth()->user();
        $recipes     = $user->recipes()->with('recipeIngredients.ingredient')->latest()->get();
        $ingredients = $user->ingredients()->get();

        $recipeCosts = $recipes->map(function ($recipe) {
            return [
                'id'         => $recipe->id,
                'name'       => $recipe->name,
                'total_cost' => $this->costService->calculate($recipe)['total_cost'],
            ];
        })->sortByDesc('total_cost')->values();

        $totalCosts = $recipeCosts->sum('total_cost');

        $stats = [
            'total_ingredients' => $ingredients->count(),
            'total_recipes'     => $recipes->count(),
            'avg_recipe_cost'   => $recipes->count() > 0
                ? round($recipeCosts->avg('total_cost'), 2)
                : 0.0,
            'most_expensive'    => $recipeCosts->first(),
            'total_costs'       => round($totalCosts, 2),
        ];

        $recentRecipes = $recipes->take(5)->map(function ($recipe) {
            $cost = $this->costService->calculate($recipe);
            return [
                'id'                    => $recipe->id,
                'name'                  => $recipe->name,
                'total_cost'            => $cost['total_cost'],
                'profit_margin_percent' => $cost['profit_margin_percent'],
            ];
        });

        return Inertia::render('Dashboard', [
            'stats'          => $stats,
            'recipe_costs'   => $recipeCosts->take(8)->values(),
            'recent_recipes' => $recentRecipes->values(),
        ]);
    }
}
