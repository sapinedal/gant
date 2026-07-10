<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function show(string $token)
    {
        $invitation = Invitation::where('token', $token)->with('project:id,name', 'inviter:id,name')->firstOrFail();

        return response()->json([
            'project_name' => $invitation->project->name,
            'inviter_name' => $invitation->inviter->name,
            'role' => $invitation->role,
            'email' => $invitation->email,
            'expired' => $invitation->expires_at->isPast(),
            'accepted' => ! is_null($invitation->accepted_at),
        ]);
    }

    public function accept(Request $request, string $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->accepted_at) {
            return response()->json(['message' => 'Esta invitación ya fue aceptada.'], 422);
        }

        if ($invitation->expires_at->isPast()) {
            return response()->json(['message' => 'Esta invitación ha expirado.'], 422);
        }

        $user = $request->user();

        if (strcasecmp($user->email, $invitation->email) !== 0) {
            return response()->json(['message' => 'Esta invitación fue enviada a otro correo electrónico.'], 403);
        }

        $invitation->project->members()->syncWithoutDetaching([
            $user->id => ['role' => $invitation->role],
        ]);

        $invitation->update(['accepted_at' => now()]);

        return response()->json(['message' => 'Te uniste al proyecto.', 'project_id' => $invitation->project_id]);
    }
}
