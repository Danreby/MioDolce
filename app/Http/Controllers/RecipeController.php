<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Models\Ingredient;
use App\Models\Recipe;
use App\Services\RecipeCostService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function __construct(private RecipeCostService $costService) {}

    public function index(): Response
    {
        $recipes = auth()->user()
            ->recipes()
            ->with('recipeIngredients.ingredient')
            ->orderBy('name')
            ->get()
            ->map(function ($recipe) {
                $cost = $this->costService->calculate($recipe);
                return [
                    ...$recipe->toArray(),
                    'total_cost'            => $cost['total_cost'],
                    'cost_per_unit'         => $cost['cost_per_unit'],
                    'profit_margin_percent' => $cost['profit_margin_percent'],
                    'ingredients_count'     => $recipe->recipeIngredients->count(),
                ];
            });

        return Inertia::render('Recipes/Index', [
            'recipes' => $recipes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Recipes/Form', [
            'recipe'      => null,
            'ingredients' => $this->getIngredientsForForm(),
        ]);
    }

    public function store(StoreRecipeRequest $request): RedirectResponse
    {
        $recipe = auth()->user()->recipes()->create(
            $request->safe()->except('ingredients')
        );

        $this->syncIngredients($recipe, $request->ingredients);

        return redirect()
            ->route('recipes.show', $recipe)
            ->with('success', 'Receita criada com sucesso!');
    }

    public function show(Recipe $recipe): Response
    {
        abort_unless($recipe->user_id === auth()->id(), 403);

        $recipe->load('recipeIngredients.ingredient');

        return Inertia::render('Recipes/Show', [
            'recipe' => $recipe,
            'cost'   => $this->costService->calculate($recipe),
        ]);
    }

    public function edit(Recipe $recipe): Response
    {
        abort_unless($recipe->user_id === auth()->id(), 403);

        $recipe->load('recipeIngredients');

        return Inertia::render('Recipes/Form', [
            'recipe'      => $recipe,
            'ingredients' => $this->getIngredientsForForm(),
        ]);
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe): RedirectResponse
    {
        abort_unless($recipe->user_id === auth()->id(), 403);

        $recipe->update($request->safe()->except('ingredients'));

        $recipe->recipeIngredients()->delete();
        $this->syncIngredients($recipe, $request->ingredients);

        return redirect()
            ->route('recipes.show', $recipe)
            ->with('success', 'Receita atualizada com sucesso!');
    }

    public function destroy(Recipe $recipe): RedirectResponse
    {
        abort_unless($recipe->user_id === auth()->id(), 403);

        $recipe->recipeIngredients()->delete();
        $recipe->delete();

        return redirect()
            ->route('recipes.index')
            ->with('success', 'Receita excluída com sucesso!');
    }

    private function syncIngredients(Recipe $recipe, array $ingredients): void
    {
        foreach ($ingredients as $item) {
            $recipe->recipeIngredients()->create([
                'ingredient_id' => $item['ingredient_id'],
                'quantity_used' => $item['quantity_used'],
            ]);
        }
    }

    private function getIngredientsForForm(): \Illuminate\Support\Collection
    {
        return auth()->user()
            ->ingredients()
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'quantity_purchased', 'cost_purchased']);
    }
}
