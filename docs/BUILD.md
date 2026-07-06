# Instructions de compilation et de lancement — LUMEN

Ce document décrit comment **lancer**, **compiler (build)** et **tester** le
projet. Aucune dépendance externe n'est requise à l'exécution ; Node.js sert
uniquement au build et aux tests (aucun `npm install`).

---

## 1. Prérequis

| Outil | Version | Pour |
|---|---|---|
| Navigateur récent | Chrome / Edge / Firefox à jour | Jouer |
| Node.js | ≥ 14 | Build + tests (facultatif pour jouer) |
| Git | — | Suivi de version |

## 2. Lancer le jeu

### 2.1 Le plus simple — build autonome
Ouvrez **`dist/LUMEN.html`** par double-clic. Le fichier contient déjà tout le
CSS et le JavaScript : il fonctionne sans serveur ni connexion (les polices se
rabattent sur celles du système hors-ligne).

### 2.2 Depuis les sources
Les sources se chargent en *classic scripts* et fonctionnent aussi par
double-clic sur `index.html`. Pour un comportement identique à la production
(et le rechargement des `locales/*.json`), servez le dossier :

```bash
# Depuis la racine du projet
python -m http.server 8080        # Python 3
#   ou : npx serve .
#   ou : php -S localhost:8080
```

Puis ouvrez `http://localhost:8080`.

## 3. Compiler (build)

Le build produit la distribution autonome `dist/LUMEN.html` en intégrant la
feuille de style et les onze modules JS **dans l'ordre des dépendances**. La
source de vérité reste `js/` et `css/` : le build ne fait que les concaténer
(aucune duplication manuelle de code).

```bash
node build.js
```

Sortie attendue :

```
✓ Build terminé : dist/LUMEN.html  (~82 Ko)
  Modules intégrés : 11 fichiers JS + 1 feuille CSS
```

**Ordre d'intégration** (défini dans `build.js`) :
`core → i18n → audio → input → particles → camera → level → player → ui → game → main`.

## 4. Tester

### 4.1 Tests unitaires (logique pure)
```bash
node tests/core.test.js
```
40 assertions sur la physique, les collisions, la phase, le score/rang, le
chrono, la condition de victoire et la localisation.
**Attendu :** `40 réussis, 0 échoués (100% de réussite)` · code de sortie `0`.

### 4.2 Test d'intégration (headless)
```bash
node tests/smoke.test.js
```
Charge tous les modules ensemble (vérifie le chaînage des dépendances) puis
simule plusieurs secondes de jeu avec un bot pour détecter toute erreur
d'exécution dans la boucle physique. **Attendu :** `0 échoués`, code `0`.

### 4.3 Tout enchaîner
```bash
node tests/core.test.js && node tests/smoke.test.js && node build.js
```

## 5. Suivi de version (Git)

```bash
git init
git add .
git commit -m "LUMEN 1.0 — prototype jouable + dossier"
```

`.gitignore` suggéré :
```
# rien d'obligatoire : pas de node_modules.
# Le build dist/ peut être versionné (artefact de démo) ou ignoré :
# dist/
```

## 6. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Pas de son au lancement | Politique d'autoplay du navigateur | Cliquez / appuyez sur une touche : l'audio démarre au premier geste. |
| Polices « génériques » | Ouverture hors-ligne en `file://` | Normal : repli système. Servez via un serveur local pour charger *Chakra Petch* / *Inter*. |
| « Quitter » ne ferme pas l'onglet | `window.close()` bloqué par le navigateur pour les onglets non ouverts par script | Limite de plateforme : un écran de repli s'affiche. En portage Windows natif, le quitter fermerait réellement l'application. |
| Le build échoue (« Balise introuvable ») | `index.html` modifié (balises `<script src>`/`<link>`) | Rétablir les balises attendues par `build.js` (voir §3). |

## 7. Plateformes validées

PC Windows (Chrome, Edge, Firefox). Le jeu est responsive et dispose de
**contrôles tactiles** (boutons virtuels affichés automatiquement sur écran
tactile) : il est donc aussi confortable sur mobile. La **cible officielle du
prototype reste le PC** (clavier).
