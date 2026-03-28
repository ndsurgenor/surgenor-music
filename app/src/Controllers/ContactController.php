<?php

declare(strict_types=1);

namespace App\Controllers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class ContactController extends BaseController
{
    public function index(array $params = []): void
    {
        $this->render('contact.html.twig', ['sent' => false, 'error' => null, 'old' => []]);
    }

    public function submit(array $params = []): void
    {
        $this->validateCsrf();

        $name    = trim($_POST['name'] ?? '');
        $email   = trim($_POST['email'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$message) {
            $this->render('contact.html.twig', [
                'sent'  => false,
                'error' => 'Please fill in all fields with a valid email address.',
                'old'   => compact('name', 'email', 'message'),
            ]);
            return;
        }

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USERNAME'];
            $mail->Password   = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) ($_ENV['MAIL_PORT'] ?? 587);

            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($_ENV['MAIL_TO']);
            $mail->addReplyTo($email, $name);

            $mail->Subject = "Contact form submission from {$name}";
            $mail->Body    = "Name: {$name}\nEmail: {$email}\n\n{$message}";

            $mail->send();

            $this->render('contact.html.twig', ['sent' => true, 'error' => null, 'old' => []]);
        } catch (Exception) {
            $this->render('contact.html.twig', [
                'sent'  => false,
                'error' => 'Sorry, there was a problem sending your message. Please try again later.',
                'old'   => compact('name', 'email', 'message'),
            ]);
        }
    }
}
