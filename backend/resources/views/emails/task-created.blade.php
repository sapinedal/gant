<x-emails.layout>
<h1 style="font-size:18px;color:#223A7C;margin:0 0 16px;">Nueva tarea creada</h1>
<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">
    <strong>{{ $creatorName }}</strong> creó la tarea <strong>{{ $taskName }}</strong> en el proyecto
    <strong>{{ $projectName }}</strong>, del cual eres propietario.
</p>
<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">
    <strong>Inicio:</strong> {{ $startDate }}<br>
    <strong>Fin:</strong> {{ $endDate }}
</p>
<p style="text-align:center;margin:24px 0;">
    <a href="{{ $projectUrl }}" style="background-color:#00A99D;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
        Ver proyecto
    </a>
</p>
</x-emails.layout>
