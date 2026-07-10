<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('ownedProjects')->orderBy('name')->get();

        return response()->json($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'is_admin' => $request->boolean('is_admin'),
        ]);

        return response()->json($user, 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        if ($user->id === $request->user()->id && $user->is_admin && ! $request->boolean('is_admin')) {
            $remainingAdmins = User::where('is_admin', true)->where('id', '!=', $user->id)->count();
            if ($remainingAdmins === 0) {
                return response()->json(['message' => 'No puedes quitarte el rol de administrador: eres el único administrador.'], 422);
            }
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'is_admin' => $request->boolean('is_admin'),
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        if ($user->is_admin && User::where('is_admin', true)->count() <= 1) {
            return response()->json(['message' => 'No puedes eliminar al único administrador.'], 422);
        }

        if ($user->ownedProjects()->exists()) {
            return response()->json(['message' => 'Este usuario es propietario de proyectos. Reasigna o elimina esos proyectos antes de borrarlo.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }
}
