<?php
// Partie 3 - 3) Gestion du vote
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'connexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id_etudiant = isset($input['id_etudiant']) ? trim($input['id_etudiant']) : '';
$id_candidat = isset($input['id_candidat']) ? (int)$input['id_candidat'] : 0;

// Validation des données
if (empty($id_etudiant) || $id_candidat <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données invalides. Veuillez remplir tous les champs.']);
    exit;
}

try {
    $pdo = getConnection();

    // Vérifier si l'identifiant étudiant existe déjà dans la table des votes
    $stmtCheck = $pdo->prepare("SELECT id FROM votes WHERE id_etudiant = :id_etudiant");
    $stmtCheck->execute([':id_etudiant' => $id_etudiant]);

    if ($stmtCheck->fetch()) {
        // Empêcher un second vote
        echo json_encode([
            'success' => false,
            'already_voted' => true,
            'message' => "L'étudiant $id_etudiant a déjà voté. Un seul vote est autorisé."
        ]);
        exit;
    }

    // Vérifier que le candidat existe
    $stmtCandidat = $pdo->prepare("SELECT id FROM candidats WHERE id = :id");
    $stmtCandidat->execute([':id' => $id_candidat]);
    if (!$stmtCandidat->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Candidat introuvable.']);
        exit;
    }

    // Enregistrer le vote dans la base de données
    $stmtVote = $pdo->prepare(
        "INSERT INTO votes (id_etudiant, id_candidat, date_vote) VALUES (:id_etudiant, :id_candidat, NOW())"
    );
    $stmtVote->execute([
        ':id_etudiant' => $id_etudiant,
        ':id_candidat' => $id_candidat
    ]);

    echo json_encode([
        'success' => true,
        'message' => "Votre vote a été enregistré avec succès ! Merci de votre participation."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement du vote.']);
}
?>
