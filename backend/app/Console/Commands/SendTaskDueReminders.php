<?php

namespace App\Console\Commands;

use App\Mail\TaskDueSoonMail;
use App\Models\Task;
use App\Support\SafeMail;
use Illuminate\Console\Command;

class SendTaskDueReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-task-due-reminders {--days=2 : Días de anticipación para avisar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía un recordatorio por correo de las tareas que vencen pronto y aún no están completadas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $daysAhead = (int) $this->option('days');

        $tasks = Task::query()
            ->whereNull('due_reminder_sent_at')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereDate('end_date', '<=', now()->addDays($daysAhead))
            ->with(['project.owner', 'assignee'])
            ->get();

        foreach ($tasks as $task) {
            $recipient = $task->assignee ?? $task->project->owner;

            SafeMail::send($recipient->email, new TaskDueSoonMail($task));
            $task->update(['due_reminder_sent_at' => now()]);

            $this->info("Recordatorio enviado: \"{$task->name}\" -> {$recipient->email}");
        }

        $this->info("Total de recordatorios enviados: {$tasks->count()}");

        return self::SUCCESS;
    }
}
