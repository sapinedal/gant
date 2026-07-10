<?php

namespace App\Support;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SafeMail
{
    /**
     * Envía un correo sin dejar que un fallo del proveedor SMTP (relay no
     * autorizado, timeout, etc.) tumbe la petición HTTP que lo dispara.
     * El error queda registrado en el log para poder diagnosticarlo.
     */
    public static function send(string $to, Mailable $mailable): void
    {
        try {
            Mail::to($to)->send($mailable);
        } catch (Throwable $e) {
            Log::warning("No se pudo enviar el correo a {$to}: ".$e->getMessage());
        }
    }
}
