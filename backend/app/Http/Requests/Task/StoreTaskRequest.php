<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:pending,in_progress,completed'],
            'color' => ['nullable', 'string', 'max:7'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'depends_on_task_id' => ['nullable', 'integer', 'exists:tasks,id'],
        ];
    }
}
