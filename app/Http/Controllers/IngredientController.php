<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIngredientRequest;
use App\Http\Requests\UpdateIngredientRequest;
use App\Models\Ingredient;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IngredientController extends Controller
{
    public function index(): Response
    {
        $ingredients = auth()->user()
            ->ingredients()
            ->orderBy('name')
            ->get()
            ->map(fn ($ingredient) => [
                ...$ingredient->toArray(),
                'cost_per_unit' => round($ingredient->cost_per_unit, 6),
                'in_use'        => $ingredient->recipeIngredients()->exists(),
            ]);

        return Inertia::render('Ingredients/Index', [
            'ingredients' => $ingredients,
        ]);
    }

    public function store(StoreIngredientRequest $request): RedirectResponse
    {
        auth()->user()->ingredients()->create($request->validated());

        return back()->with('success', 'Ingrediente cadastrado com sucesso!');
    }

    public function update(UpdateIngredientRequest $request, Ingredient $ingredient): RedirectResponse
    {
        abort_unless($ingredient->user_id === auth()->id(), 403);

        $ingredient->update($request->validated());

        return back()->with('success', 'Ingrediente atualizado com sucesso!');
    }

    public function destroy(Ingredient $ingredient): RedirectResponse
    {
        abort_unless($ingredient->user_id === auth()->id(), 403);

        if ($ingredient->recipeIngredients()->exists()) {
            return back()->with('error', 'Este ingrediente está em uso em receitas e não pode ser excluído.');
        }

        $ingredient->delete();

        return back()->with('success', 'Ingrediente excluído com sucesso!');
    }
}
