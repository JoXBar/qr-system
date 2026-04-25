<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "qr-system"; // tu base de datos

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>