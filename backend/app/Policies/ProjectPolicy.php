<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();
    }

    public function manageTasks(User $user, Project $project): bool
    {
        if ($project->owner_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->wherePivotIn('role', ['owner', 'editor'])
            ->exists();
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    public function update(User $user, Project $project): bool
    {
        return $this->manageTasks($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }
}
