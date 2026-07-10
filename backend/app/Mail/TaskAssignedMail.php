<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TaskAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Task $task)
    {
    }

    public function build()
    {
        $projectUrl = rtrim(config('app.frontend_url'), '/').'/projects/'.$this->task->project_id;

        return $this->subject('Nueva tarea asignada: '.$this->task->name)
            ->view('emails.task-assigned')
            ->with([
                'taskName' => $this->task->name,
                'projectName' => $this->task->project->name,
                'startDate' => $this->task->start_date->format('d/m/Y'),
                'endDate' => $this->task->end_date->format('d/m/Y'),
                'projectUrl' => $projectUrl,
            ]);
    }
}
