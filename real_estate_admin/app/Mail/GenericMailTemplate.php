<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericMailTemplate extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @var array Mail data containing subject, body, etc.
     */
    public $data;

    /**
     * @var string Admin email address
     */
    public $adminMail;

    /**
     * @var string Company/Application name
     */
    public $companyName;

    /**
     * Create a new message instance.
     */
    public function __construct($data, $adminMail, $companyName)
    {
        $this->data = $data;
        $this->adminMail = $adminMail;
        $this->companyName = $companyName;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->from($this->adminMail, $this->companyName)
                    ->subject($this->data['title'] ?? 'Notificación')
                    ->view('mail-templates.mail-template')
                    ->with($this->data);
    }
}
