<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Invitation $invitation)
    {
    }

    public function build()
    {
        $acceptUrl = rtrim(config('app.frontend_url'), '/').'/invitations/'.$this->invitation->token;

        return $this->subject('Te han invitado a un proyecto en Trazalo Gantt')
            ->view('emails.invitation')
            ->with([
                'projectName' => $this->invitation->project->name,
                'inviterName' => $this->invitation->inviter->name,
                'role' => $this->invitation->role,
                'acceptUrl' => $acceptUrl,
            ]);
    }
}
