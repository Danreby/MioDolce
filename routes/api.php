<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rotas protegidas pelo Sanctum — disponíveis em /api/*
|
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Exemplo de rota pública
Route::get('/ping', function () {
    return response()->json(['message' => 'pong', 'app' => config('app.name')]);
});
