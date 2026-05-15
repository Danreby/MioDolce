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
        $recipes = Recipe::with('recipeIngredients.ingredient')
            ->orderBy('name')
            ->get()
            ->map(fn ($recipe) => [
                ...$recipe->toArray(),
                'cost'              => $this->costService->calculate($recipe),
                'ingredients_count' => $recipe->recipeIngredients->count(),
            ]);

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
        $recipe = Recipe::create($request->safe()->except('ingredients'));

        $this->syncIngredients($recipe, $request->ingredients);

        return redirect()
            ->route('recipes.show', $recipe)
            ->with('success', 'Receita criada com sucesso!');
    }

    public function show(Recipe $recipe): Response
    {
        $recipe->load('recipeIngredients.ingredient');

        return Inertia::render('Recipes/Show', [
            'recipe' => $recipe,
            'cost'   => $this->costService->calculate($recipe),
        ]);
    }

    public function edit(Recipe $recipe): Response
    {
        $recipe->load('recipeIngredients');

        return Inertia::render('Recipes/Form', [
            'recipe'      => $recipe,
            'ingredients' => $this->getIngredientsForForm(),
        ]);
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe): RedirectResponse
    {
        $recipe->update($request->safe()->except('ingredients'));

        $recipe->recipeIngredients()->delete();
        $this->syncIngredients($recipe, $request->ingredients);

        return redirect()
            ->route('recipes.show', $recipe)
            ->with('success', 'Receita atualizada com sucesso!');
    }

    public function destroy(Recipe $recipe): RedirectResponse
    {
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
        return Ingredient::orderBy('name')
            ->get(['id', 'name', 'unit', 'quantity_purchased', 'cost_purchased']);
    }
}
