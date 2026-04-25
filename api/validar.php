<?php
// Mostrar errores (solo para pruebas)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

// conexión
include("../db/conexion.php");

// leer JSON
$data = json_decode(file_get_contents("php://input"), true);

// validar que venga código
if (!isset($data["codigo"])) {
    echo json_encode([
        "valido" => false,
        "error" => "Sin código"
    ]);
    exit;
}

// limpiar código (evita errores por espacios)
$codigo = trim($data["codigo"]);

// columna es "id"
$stmt = $conn->prepare("SELECT * FROM empleados WHERE id = ?");
$stmt->bind_param("s", $codigo);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $emp = $result->fetch_assoc();

    if ($emp["estado"] === "activo") {
        echo json_encode([
            "valido" => true,
            "nombre" => $emp["nombre"],
            "vehiculo" => $emp["vehiculo"],
            "placa" => $emp["placa"]
        ]);
    } else {
        echo json_encode([
            "valido" => false,
            "motivo" => "Empleado inactivo"
        ]);
    }

} else {
    echo json_encode([
        "valido" => false,
        "motivo" => "No existe"
    ]);
}
?>