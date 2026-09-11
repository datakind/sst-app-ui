<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemoRequest extends Mailable
{
    use Queueable, SerializesModels;

    /** @var array<string, mixed> */
    public array $formData;

    /**
     * @param  array<string, mixed>  $formData
     */
    public function __construct(array $formData)
    {
        $this->formData = $formData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Demo Request from '.$this->formData['name'],
            to: ['education@datakind.org']
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'vendor.mail.demo-request',
            with: [
                'formData' => $this->formData,
            ],
        );
    }
}
