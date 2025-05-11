<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'path/to/PHPMailer/src/Exception.php';
require 'path/to/PHPMailer/src/PHPMailer.php';
require 'path/to/PHPMailer/src/SMTP.php';

function sendBookingConfirmationEmail($to, $name, $service, $date, $time, $code)
{
    $mail = new PHPMailer(true);

    try {
        // إعدادات السيرفر
        $mail->isSMTP();
        $mail->Host       = 'smtp.yourdomain.com'; // استبدل بمخدم SMTP الخاص بك
        $mail->SMTPAuth   = true;
        $mail->Username   = 'no-reply@yourdomain.com'; // استبدل ببريدك
        $mail->Password   = 'your-email-password';     // استبدل بكلمة المرور
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';

        // المرسل والمستلم
        $mail->setFrom('no-reply@yourdomain.com', 'عيادة الابتسامة المشرقة');
        $mail->addAddress($to, $name);

        // محتوى البريد
        $mail->isHTML(true);
        $mail->Subject = 'تأكيد حجز موعد العيادة';

        $emailBody = generateEmailTemplate($name, $service, $date, $time, $code);
        $mail->Body = $emailBody;
        $mail->AltBody = strip_tags($emailBody);

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("فشل إرسال البريد: {$mail->ErrorInfo}");
        return false;
    }
}

function generateEmailTemplate($name, $service, $date, $time, $code)
{
    return "
    <!DOCTYPE html>
    <html dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <title>تأكيد الحجز</title>
        <style>
            body { font-family: 'Cairo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0099cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #777; }
            .details { margin: 20px 0; }
            .detail-item { margin-bottom: 10px; }
            .verification-code { 
                background: #0099cc; 
                color: white; 
                padding: 10px 15px; 
                border-radius: 5px; 
                font-size: 18px;
                display: inline-block;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>عيادة الابتسامة المشرقة</h2>
            </div>
            <div class='content'>
                <p>عزيزي/عزيزتي $name،</p>
                <p>شكراً لحجزك في عيادتنا. إليك تفاصيل الموعد:</p>
                
                <div class='details'>
                    <div class='detail-item'><strong>الخدمة:</strong> $service</div>
                    <div class='detail-item'><strong>التاريخ:</strong> $date</div>
                    <div class='detail-item'><strong>الوقت:</strong> $time</div>
                </div>
                
                <p>رمز التأكيد الخاص بك:</p>
                <div class='verification-code'>$code</div>
                
                <p>يرجى الحضور قبل الموعد بـ 10 دقائق</p>
            </div>
            <div class='footer'>
                <p>هذه الرسالة مرسلة تلقائياً، الرجاء عدم الرد عليها</p>
                <p>© 2023 عيادة الابتسامة المشرقة. جميع الحقوق محفوظة</p>
            </div>
        </div>
    </body>
    </html>
    ";
}
