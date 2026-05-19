<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetPasswordRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(): \Inertia\Response
    {
        $user = auth()->user();

        return Inertia::render('Profile/Index', [
            'stats' => [
                'total_recipes'     => $user->recipes()->count(),
                'total_ingredients' => $user->ingredients()->count(),
                'member_since'      => $user->created_at->format('d/m/Y'),
                'member_days'       => (int) $user->created_at->diffInDays(now()),
            ],
            'googleLinked'  => $user->hasGoogleLinked(),
            'hasPassword'   => $user->hasPasswordSet(),
        ]);
    }

    public function update(UpdateProfileRequest $request): \Illuminate\Http\RedirectResponse
    {
        auth()->user()->update($request->validated());

        return back()->with('flash', ['success' => 'Perfil atualizado com sucesso!']);
    }

    public function updateAvatar(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = auth()->user();

        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return back()->with('flash', ['success' => 'Foto de perfil atualizada!']);
    }

    public function updatePassword(UpdatePasswordRequest $request): \Illuminate\Http\RedirectResponse
    {
        auth()->user()->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return back()->with('flash', ['success' => 'Senha alterada com sucesso!']);
    }

    public function setPassword(SetPasswordRequest $request): \Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();

        if ($user->hasPasswordSet()) {
            return back()->with('flash', ['error' => 'Você já possui uma senha definida. Use a opção de alterar senha.']);
        }

        $user->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return back()->with('flash', ['success' => 'Senha definida com sucesso!']);
    }

    public function destroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();

        Auth::logout();

        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('flash', ['success' => 'Conta excluída com sucesso.']);
    }
}
