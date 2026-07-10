<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:pending,in_progress,completed'],
            'color' => ['nullable', 'string', 'max:7'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'depends_on_task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
