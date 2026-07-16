<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\InviteMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Project;
use App\Support\SafeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $projects = Project::withCount('tasks')
            ->where('owner_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->with('owner:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create([
            ...$request->validated(),
            'owner_id' => $request->user()->id,
        ]);

        $project->members()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        $project->load(['owner:id,name,email', 'members:id,name,email']);

        return response()->json($project);
    }

    public function update(StoreProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json($project);
    }

    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(['message' => 'Proyecto eliminado.']);
    }

    public function members(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        return response()->json($project->members()->get(['users.id', 'users.name', 'users.email']));
    }

    public function invite(InviteMemberRequest $request, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $invitation = Invitation::create([
            'project_id' => $project->id,
            'email' => $request->email,
            'role' => $request->role,
            'token' => Str::random(48),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        $invitation->load(['project', 'inviter']);

        SafeMail::send($invitation->email, new InvitationMail($invitation));

        return response()->json($invitation, 201);
    }

    public function removeMember(Request $request, Project $project, int $userId)
    {
        $this->authorize('manageMembers', $project);

        if ($userId === $project->owner_id) {
            return response()->json(['message' => 'No puedes remover al propietario.'], 422);
        }

        $project->members()->detach($userId);

        return response()->json(['message' => 'Miembro removido.']);
    }

    public function updateMemberRole(Request $request, Project $project, int $userId)
    {
        $this->authorize('manageMembers', $project);

        $request->validate(['role' => ['required', 'in:owner,editor,viewer']]);

        $project->members()->updateExistingPivot($userId, ['role' => $request->role]);

        return response()->json(['message' => 'Rol actualizado.']);
    }

    public function enableInviteLink(Request $request, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $project->update([
            'invite_enabled' => true,
            'invite_code' => $project->invite_code ?: Str::random(16),
        ]);

        return response()->json([
            'message' => 'Enlace de invitación activado.',
            'invite_code' => $project->invite_code,
            'invite_enabled' => true,
        ]);
    }

    public function disableInviteLink(Request $request, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $project->update(['invite_enabled' => false]);

        return response()->json([
            'message' => 'Enlace de invitación desactivado.',
            'invite_enabled' => false,
        ]);
    }

    public function resetInviteLink(Request $request, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $project->update([
            'invite_code' => Str::random(16),
            'invite_enabled' => true,
        ]);

        return response()->json([
            'message' => 'Enlace de invitación regenerado.',
            'invite_code' => $project->invite_code,
            'invite_enabled' => true,
        ]);
    }

    public function allProjectsForAdmin(Request $request)
    {
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return response()->json($projects);
    }
}
