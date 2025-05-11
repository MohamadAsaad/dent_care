<?php
require_once 'config.php';
require_once 'mail-config.php';

// إنشاء اتصال بقاعدة البيانات
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("فشل الاتصال بقاعدة البيانات: " . $conn->connect_error);
}

// إنشاء جدول المواعيد إذا لم يكن موجوداً
$createTableQuery = "CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    verification_code VARCHAR(10),
    confirmation_method VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

if (!$conn->query($createTableQuery)) {
    die("خطأ في إنشاء الجدول: " . $conn->error);
}

// معالجة بيانات الحجز
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // تنظيف وإعداد البيانات
    $fullName = $conn->real_escape_string($_POST['fullName'] ?? '');
    $phone = $conn->real_escape_string($_POST['phone'] ?? '');
    $email = $conn->real_escape_string($_POST['email'] ?? '');
    $service = $conn->real_escape_string($_POST['service'] ?? '');
    $date = $conn->real_escape_string($_POST['date'] ?? '');
    $time = $conn->real_escape_string($_POST['time'] ?? '');
    $confirmation_method = $conn->real_escape_string($_POST['confirmation_method'] ?? 'sms');

    // التحقق من البيانات المطلوبة
    if (empty($fullName) || empty($phone) || empty($service) || empty($date) || empty($time)) {
        die(json_encode(['status' => 'error', 'message' => 'بيانات الحجز المطلوبة غير مكتملة']));
    }

    // التحقق من صحة البريد الإلكتروني إذا تم اختياره
    if ($confirmation_method === 'email' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die(json_encode(['status' => 'error', 'message' => 'البريد الإلكتروني غير صالح']));
    }

    // توليد رمز تأكيد (6 أرقام)
    $verification_code = sprintf("%06d", mt_rand(0, 999999));

    // إدراج الحجز في قاعدة البيانات
    $stmt = $conn->prepare("INSERT INTO appointments (full_name, phone, email, service, date, time, verification_code, confirmation_method) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $fullName, $phone, $email, $service, $date, $time, $verification_code, $confirmation_method);

    if ($stmt->execute()) {
        $response = ['status' => 'success'];

        // إرسال التأكيد حسب الطريقة المختارة
        switch ($confirmation_method) {
            case 'whatsapp':
                $whatsapp_url = "https://wa.me/" . preg_replace('/[^0-9]/', '', $phone) . "?text=" . urlencode(
                    "تأكيد حجز عيادة الابتسامة المشرقة\n" .
                        "الاسم: $fullName\n" .
                        "الخدمة: $service\n" .
                        "التاريخ: $date\n" .
                        "الوقت: $time\n" .
                        "رمز التأكيد: $verification_code"
                );
                $response['redirect'] = $whatsapp_url;
                break;

            case 'email':
                if (!empty($email)) {
                    $emailSent = sendBookingConfirmationEmail(
                        $email,
                        $fullName,
                        $service,
                        $date,
                        $time,
                        $verification_code
                    );

                    if (!$emailSent) {
                        $response = ['status' => 'error', 'message' => 'فشل إرسال تأكيد البريد الإلكتروني'];
                    }
                } else {
                    $response = ['status' => 'error', 'message' => 'لم يتم تقديم بريد إلكتروني'];
                }
                break;

            case 'sms':
            default:
                // هنا يمكنك إضافة كود إرسال SMS الفعلي إذا كان متاحاً
                break;
        }

        echo json_encode($response);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'فشل في حفظ الحجز: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'طريقة طلب غير صالحة']);
}

$conn->close();
