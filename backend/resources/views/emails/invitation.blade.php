<x-emails.layout>
<h1 style="font-size:18px;color:#223A7C;margin:0 0 16px;">Has sido invitado a un proyecto</h1>
<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">
    <strong>{{ $inviterName }}</strong> te invitó a colaborar en el proyecto
    <strong>{{ $projectName }}</strong> como <strong>{{ $role }}</strong>.
</p>
<p style="text-align:center;margin:24px 0;">
    <a href="{{ $acceptUrl }}" style="background-color:#00A99D;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;display:inline-block;">
        Ver invitación
    </a>
</p>
<p style="font-size:12px;color:#737373;line-height:1.6;margin:0;">
    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
    <a href="{{ $acceptUrl }}" style="color:#577BDE;">{{ $acceptUrl }}</a>
</p>
</x-emails.layout>
