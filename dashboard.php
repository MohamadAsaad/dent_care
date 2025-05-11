<?php
require_once 'config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("فشل الاتصال: " . $conn->connect_error);
}

// البحث إذا كان هناك طلب بحث
$search = isset($_GET['search']) ? $_GET['search'] : '';
$query = "SELECT * FROM appointments";
$params = [];

if (!empty($search)) {
    $query .= " WHERE full_name LIKE ? OR phone LIKE ?";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$query .= " ORDER BY date DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param(str_repeat('s', count($params)), ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>لوحة تحكم الطبيب</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css" rel="stylesheet" />
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            padding-top: 20px;
        }

        .search-box {
            max-width: 400px;
            margin: 0 auto 20px;
        }
    </style>
</head>

<body class="bg-light">
    <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-primary">جميع الحجوزات</h3>
            <a href="logout.php" class="btn btn-danger">تسجيل الخروج</a>
        </div>

        <div class="search-box">
            <form method="get" class="d-flex">
                <input type="text" name="search" class="form-control me-2" placeholder="ابحث بالاسم أو الهاتف" value="<?= htmlspecialchars($search) ?>">
                <button type="submit" class="btn btn-primary">بحث</button>
            </form>
        </div>

        <div class="table-responsive">
            <table class="table table-bordered table-striped bg-white">
                <thead class="table-primary">
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الجوال</th>
                        <th>البريد الإلكتروني</th>
                        <th>الخدمة</th>
                        <th>التاريخ</th>
                        <th>الوقت</th>
                        <th>تاريخ الحجز</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($row = $result->fetch_assoc()): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['full_name']) ?></td>
                            <td><?= htmlspecialchars($row['phone']) ?></td>
                            <td><?= htmlspecialchars($row['email'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($row['service']) ?></td>
                            <td><?= htmlspecialchars($row['date']) ?></td>
                            <td><?= htmlspecialchars($row['time']) ?></td>
                            <td><?= htmlspecialchars($row['created_at']) ?></td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>

</html>