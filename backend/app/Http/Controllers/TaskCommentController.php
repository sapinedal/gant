<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function index(Request $request, Task $task)
    {
        $this->authorize('view', $task->project);

        return response()->json($task->comments()->with('user:id,name,email')->get());
    }

    public function store(Request $request, Task $task)
    {
        $this->authorize('view', $task->project);

        $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        $comment->load('user:id,name,email');

        return response()->json($comment, 201);
    }

    public function destroy(Request $request, Task $task, TaskComment $comment)
    {
        $this->authorize('view', $task->project);

        if ($comment->user_id !== $request->user()->id && $task->project->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminar este comentario.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comentario eliminado.']);
    }
}
