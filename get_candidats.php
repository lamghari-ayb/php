<?php

header('Content-Type: application/json');

require_once 'connexion.php';

try {

    $pdo = getConnection(); //

    $stmt = $pdo->query("SELECT id, nom, photo, programme FROM candidats");
    $data = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "candidats" => $data
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}