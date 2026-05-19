<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    Route::post('/auth/google/token', [GoogleAuthController::class, 'handleToken'])
        ->middleware('throttle:10,1')
        ->name('google.token');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('ingredients', IngredientController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('recipes', RecipeController::class);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::post('/profile/password/set', [ProfileController::class, 'setPassword'])
        ->middleware('throttle:5,1')
        ->name('profile.password.set');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/auth/google/link', [GoogleAuthController::class, 'linkAccount'])
        ->middleware('throttle:10,1')
        ->name('google.link');
    Route::delete('/auth/google/unlink', [GoogleAuthController::class, 'unlinkAccount'])
        ->middleware('throttle:10,1')
        ->name('google.unlink');
});
