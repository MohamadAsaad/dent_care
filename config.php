<?php
// بيانات اتصال قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'clinic_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// إعدادات البريد
define('SMTP_HOST', 'smtp.yourdomain.com');
define('SMTP_USER', 'no-reply@yourdomain.com');
define('SMTP_PASS', 'your-email-password');
define('SMTP_PORT', 465);
define('EMAIL_FROM', 'no-reply@yourdomain.com');
define('EMAIL_FROM_NAME', 'عيادة الابتسامة المشرقة');

// إعدادات الجلسة
session_start([
    'cookie_lifetime' => 86400,
    'cookie_secure' => false,
    'cookie_httponly' => true
]);
