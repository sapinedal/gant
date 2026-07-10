<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TaskDueSoonMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Task $task)
    {
    }

    public function build()
    {
        $projectUrl = rtrim(config('app.frontend_url'), '/').'/projects/'.$this->task->project_id;
        $daysLeft = (int) now()->startOfDay()->diffInDays($this->task->end_date->startOfDay(), false);

        return $this->subject('Vence pronto: '.$this->task->name)
            ->view('emails.task-due-soon')
            ->with([
                'taskName' => $this->task->name,
                'projectName' => $this->task->project->name,
                'endDate' => $this->task->end_date->format('d/m/Y'),
                'daysLeft' => $daysLeft,
                'projectUrl' => $projectUrl,
            ]);
    }
}
