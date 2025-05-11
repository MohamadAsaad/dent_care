<?php
require_once 'config.php';

$error = '';
$booking = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $phone = trim($_POST['phone']);

    if (empty($phone)) {
        $error = 'يجب إدخال رقم الهاتف';
    } else {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            die("فشل الاتصال: " . $conn->connect_error);
        }

        $stmt = $conn->prepare("SELECT * FROM appointments WHERE phone = ? ORDER BY date DESC LIMIT 1");
        $stmt->bind_param("s", $phone);
        $stmt->execute();
        $result = $stmt->get_result();
        $booking = $result->fetch_assoc();

        if (!$booking) {
            $error = 'لا يوجد حجز مسجل بهذا الرقم';
        }

        $stmt->close();
        $conn->close();
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>مراجعة الحجز - عيادة الابتسامة المشرقة</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            padding-top: 60px;
            background-color: #f4fafe;
        }

        .lookup-container {
            max-width: 500px;
            margin: 30px auto;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background: white;
        }

        @media (max-width: 576px) {
            .lookup-container {
                margin: 20px 15px;
                padding: 20px;
            }
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold text-primary" href="index.html">الابتسامة المشرقة</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">العودة للرئيسية</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="lookup-container">
            <h4 class="mb-4 text-center text-primary">مراجعة الحجز</h4>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger"><?= $error ?></div>
            <?php endif; ?>

            <form method="post">
                <div class="mb-3">
                    <label for="phone" class="form-label">رقم الجوال المسجل</label>
                    <input type="tel" name="phone" class="form-control" required placeholder="أدخل رقم الجوال الذي حجزت به" />
                </div>
                <button type="submit" class="btn btn-primary w-100">بحث عن الحجز</button>
            </form>

            <?php if ($booking): ?>
                <div class="booking-details mt-4 p-3 bg-light rounded">
                    <h5 class="text-center mb-3 text-success">تفاصيل الحجز</h5>
                    <p><strong>الاسم:</strong> <?= htmlspecialchars($booking['full_name']) ?></p>
                    <p><strong>الخدمة:</strong> <?= htmlspecialchars($booking['service']) ?></p>
                    <p><strong>التاريخ:</strong> <?= htmlspecialchars($booking['date']) ?></p>
                    <p><strong>الوقت:</strong> <?= htmlspecialchars($booking['time']) ?></p>
                    <p><strong>حالة التأكيد:</strong> <?= $booking['verification_code'] ? 'تم التأكيد' : 'بانتظار التأكيد' ?></p>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>