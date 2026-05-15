<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\RecipeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('ingredients', IngredientController::class)
    ->only(['index', 'store', 'update', 'destroy']);

Route::resource('recipes', RecipeController::class);
