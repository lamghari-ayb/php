<?php

function getConnection() {
    $host = "localhost";
    $dbname = "vote_electronique_db";
    $user = "root";
    $pass = "";

    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $user,
            $pass
        );

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;

    } catch (PDOException $e) {
        die("Erreur connexion DB : " . $e->getMessage());
    }
}