<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Revisa a diario las tareas próximas a vencer y envía un recordatorio por correo.
Schedule::command('app:send-task-due-reminders')->dailyAt('08:00');
