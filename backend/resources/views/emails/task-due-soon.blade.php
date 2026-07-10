<x-emails.layout>
<h1 style="font-size:18px;color:#223A7C;margin:0 0 16px;">⏰ Una tarea está por vencer</h1>
<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">
    La tarea <strong>{{ $taskName }}</strong> del proyecto <strong>{{ $projectName }}</strong>
    vence el <strong>{{ $endDate }}</strong>
    ({{ $daysLeft <= 0 ? 'hoy' : ($daysLeft === 1 ? 'mañana' : "en {$daysLeft} días") }}) y aún no se ha marcado como completada.
</p>
<p style="text-align:center;margin:24px 0;">
    <a href="{{ $projectUrl }}" style="background-color:#00A99D;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
        Ver tarea
    </a>
</p>
</x-emails.layout>
