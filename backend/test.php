<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=vote_electronique_db;charset=utf8mb4",
        "root",
        ""
    );

    echo "Connexion OK";

} catch (PDOException $e) {
    echo $e->getMessage();
}