// =============================================
// Système de Vote Électronique - app.js
// =============================================

const API_BASE = './';

// ---- Navigation entre sections ----
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    if (sectionId === 'section-candidats') loadCandidats();
    if (sectionId === 'section-resultats') loadResultats();
}

// ---- Chargement des candidats ----
async function loadCandidats() {
    const grid = document.getElementById('candidats-grid');
    grid.innerHTML = '<div class="loading">Chargement des candidats</div>';

    try {
        const res = await fetch(API_BASE + 'get_candidats.php');
        const data = await res.json();

        if (!data.success || data.candidats.length === 0) {
            grid.innerHTML = '<div class="empty-state">Aucun candidat disponible.</div>';
            return;
        }

        grid.innerHTML = data.candidats.map(c => `
            <div class="candidat-card" id="card-${c.id}">
                <img src="${escapeHtml(c.photo)}" alt="${escapeHtml(c.nom)}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Photo'">
                <div class="candidat-info">
                    <h3>${escapeHtml(c.nom)}</h3>
                    <div class="programme-label">Programme électoral</div>
                    <p>${escapeHtml(c.programme)}</p>
                    <button class="btn-voter" onclick="voterPourCandidat(${c.id}, '${escapeHtml(c.nom)}')">
                        🗳️ Voter
                    </button>
                </div>
            </div>
        `).join('');

        // Remplir aussi le select du formulaire
        populateCandidatSelect(data.candidats);

    } catch (err) {
        grid.innerHTML = '<div class="empty-state">Erreur de chargement. Vérifiez le serveur PHP.</div>';
        console.error(err);
    }
}

// ---- Remplir le <select> du formulaire de vote ----
function populateCandidatSelect(candidats) {
    const select = document.getElementById('select-candidat');
    const currentVal = select.value;
    // Garder l'option vide
    const options = candidats.map(c =>
        `<option value="${c.id}">${escapeHtml(c.nom)}</option>`
    ).join('');
    select.innerHTML = '<option value="">-- Choisir un candidat --</option>' + options;
    if (currentVal) select.value = currentVal;
}

// ---- Pré-sélectionner candidat depuis la carte ----
function voterPourCandidat(id, nom) {
    showSection('section-vote');
    const select = document.getElementById('select-candidat');
    // Attendre que les candidats soient chargés dans le select
    setTimeout(() => {
        select.value = id;
        document.getElementById('input-etudiant').focus();
    }, 100);
}

// ---- Soumission du formulaire de vote ----
async function soumettreVote() {
    const idEtudiant = document.getElementById('input-etudiant').value.trim();
    const idCandidat = document.getElementById('select-candidat').value;
    const msgDiv = document.getElementById('vote-message');

    // Reset message
    msgDiv.className = 'message';
    msgDiv.style.display = 'none';

    if (!idEtudiant) {
        showMessage(msgDiv, 'Veuillez saisir votre identifiant étudiant.', 'error');
        return;
    }
    if (!idCandidat) {
        showMessage(msgDiv, 'Veuillez choisir un candidat.', 'error');
        return;
    }

    const btn = document.getElementById('btn-soumettre');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';

    try {
        const res = await fetch(API_BASE + 'voter.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_etudiant: idEtudiant, id_candidat: parseInt(idCandidat) })
        });
        const data = await res.json();

        if (data.success) {
            showMessage(msgDiv, '✅ ' + data.message, 'success');
            document.getElementById('input-etudiant').value = '';
            document.getElementById('select-candidat').value = '';
        } else if (data.already_voted) {
            showMessage(msgDiv, '⚠️ ' + data.message, 'warning');
        } else {
            showMessage(msgDiv, '❌ ' + data.message, 'error');
        }
    } catch (err) {
        showMessage(msgDiv, '❌ Erreur de connexion au serveur.', 'error');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = '🗳️ Soumettre mon vote';
    }
}

// ---- Chargement des résultats ----
async function loadResultats() {
    const tbody = document.getElementById('resultats-tbody');
    const totalSpan = document.getElementById('total-votes');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Chargement des résultats</td></tr>';

    try {
        const res = await fetch(API_BASE + 'resultats.php');
        const data = await res.json();

        if (!data.success) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Erreur de chargement.</td></tr>';
            return;
        }

        totalSpan.textContent = data.total_votes + ' vote(s)';

        if (data.resultats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Aucun vote enregistré.</td></tr>';
            return;
        }

        tbody.innerHTML = data.resultats.map((r, idx) => `
            <tr>
                <td><span class="rang-badge ${idx === 0 ? 'first' : ''}">${idx + 1}</span></td>
                <td>
                    <div class="candidat-mini">
                        <img src="${escapeHtml(r.photo)}" alt="${escapeHtml(r.nom)}"
                             onerror="this.src='https://via.placeholder.com/42?text=?'">
                        <span>${escapeHtml(r.nom)}</span>
                    </div>
                </td>
                <td><strong>${r.nb_votes}</strong></td>
                <td>${r.pourcentage}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${r.pourcentage}%"></div>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Erreur de connexion.</td></tr>';
        console.error(err);
    }
}

// ---- Utilitaires ----
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'message ' + type;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    // Charger les candidats au démarrage
    loadCandidats();

    // Pré-charger le select dans le formulaire
    fetch(API_BASE + 'get_candidats.php')
        .then(r => r.json())
        .then(data => { if (data.success) populateCandidatSelect(data.candidats); })
        .catch(() => {});
});
