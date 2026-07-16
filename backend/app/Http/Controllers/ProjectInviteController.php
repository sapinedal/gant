<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectInviteController extends Controller
{
    public function preview(Request $request, string $inviteCode)
    {
        $project = Project::where('invite_code', $inviteCode)
            ->where('invite_enabled', true)
            ->with('owner:id,name')
            ->firstOrFail();

        $user = $request->user('sanctum');
        $isMember = false;

        if ($user) {
            $isMember = $project->owner_id === $user->id || $project->members()->where('user_id', $user->id)->exists();
        }

        return response()->json([
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description,
            'owner_name' => $project->owner->name,
            'status' => $project->status,
            'is_member' => $isMember,
        ]);
    }

    public function join(Request $request, string $inviteCode)
    {
        $project = Project::where('invite_code', $inviteCode)
            ->where('invite_enabled', true)
            ->firstOrFail();

        $user = $request->user();

        if ($project->owner_id === $user->id) {
            return response()->json([
                'message' => 'Eres el propietario de este proyecto.',
                'project_id' => $project->id,
            ]);
        }

        // Unirse como 'editor' por defecto para poder crear y asignarse tareas
        $project->members()->syncWithoutDetaching([
            $user->id => ['role' => 'editor'],
        ]);

        return response()->json([
            'message' => 'Te has unido al proyecto correctamente.',
            'project_id' => $project->id,
        ]);
    }
}
