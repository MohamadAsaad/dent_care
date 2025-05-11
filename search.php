
<?php
$host = "localhost";
$dbname = "your_database_name";
$username = "your_db_user";
$password = "your_db_password";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$search = $_POST['search'] ?? '';

if (!empty($search)) {
    $stmt = $conn->prepare("SELECT * FROM appointments WHERE full_name LIKE ? OR phone LIKE ? ORDER BY date DESC");
    $like = "%" . $search . "%";
    $stmt->bind_param("ss", $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
    $appointments = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($appointments);
} else {
    echo json_encode([]);
}
?>
