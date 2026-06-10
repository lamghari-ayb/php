<?php
// Partie 3 - 4) Gestion des résultats
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'connexion.php';

try {
    $pdo = getConnection();

    // Calculer le nombre de votes obtenus par chaque candidat
    $stmt = $pdo->query("
        SELECT 
            c.id,
            c.nom,
            c.photo,
            COUNT(v.id) AS nb_votes
        FROM candidats c
        LEFT JOIN votes v ON c.id = v.id_candidat
        GROUP BY c.id, c.nom, c.photo
        ORDER BY nb_votes DESC
    ");
    $resultats = $stmt->fetchAll();

    $total = array_sum(array_column($resultats, 'nb_votes'));

    foreach ($resultats as &$r) {
        $r['pourcentage'] = $total > 0 ? round(($r['nb_votes'] / $total) * 100, 1) : 0;
    }

    echo json_encode([
        'success' => true,
        'total_votes' => $total,
        'resultats' => $resultats
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors du calcul des résultats.'
    ]);
}
?>
