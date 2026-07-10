<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Mail\TaskAssignedMail;
use App\Mail\TaskCreatedMail;
use App\Models\Project;
use App\Models\Task;
use App\Support\SafeMail;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        return response()->json($project->tasks()->with('assignee:id,name,email')->get());
    }

    public function store(StoreTaskRequest $request, Project $project)
    {
        $this->authorize('manageTasks', $project);

        $maxOrder = $project->tasks()->max('sort_order');

        $task = $project->tasks()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'sort_order' => is_null($maxOrder) ? 0 : $maxOrder + 1,
        ]);

        $task->load(['project.owner', 'assignee', 'creator']);

        if ($task->assignee_id) {
            SafeMail::send($task->assignee->email, new TaskAssignedMail($task));
        }

        if ($task->project->owner_id !== $request->user()->id) {
            SafeMail::send($task->project->owner->email, new TaskCreatedMail($task));
        }

        return response()->json($task, 201);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorize('manageTasks', $task->project);

        $previousAssignee = $task->assignee_id;
        $previousEndDate = $task->end_date;

        $data = $request->validated();

        // Si la fecha de fin cambia, se reinicia el aviso de "próxima a vencer" para que se reevalúe.
        if (array_key_exists('end_date', $data) && $data['end_date'] !== $previousEndDate?->format('Y-m-d')) {
            $data['due_reminder_sent_at'] = null;
        }

        $task->update($data);

        if ($task->assignee_id && $task->assignee_id !== $previousAssignee) {
            $task->load(['project', 'assignee']);
            SafeMail::send($task->assignee->email, new TaskAssignedMail($task));
        }

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $this->authorize('manageTasks', $task->project);

        $task->delete();

        return response()->json(['message' => 'Tarea eliminada.']);
    }
}
