# Répartition des tâches et gestion de projet — LUMEN

Le guide demande une **répartition claire des tâches** et l'usage d'un **outil
de gestion** (type Trello). Ce document décrit l'organisation type d'une petite
équipe (4 personnes) et le tableau Trello associé. Il est directement
transposable à un travail individuel (une seule personne tenant les quatre
rôles).

---

## 1. Rôles et responsabilités

| Rôle | Responsable | Périmètre | Livrables principaux |
|---|---|---|---|
| **Game design & level design** | *Membre A* | Mécanique de phase, réglages (game feel), tracé du niveau, équilibrage | `GDD.md`, données de `level.js`, valeurs de `player.js` |
| **Programmation moteur** | *Membre B* | Boucle, physique/collisions, caméra, entrées, build | `core.js`, `player.js`, `camera.js`, `input.js`, `game.js`, `build.js` |
| **Audio & UI/UX** | *Membre C* | Synthèse audio, interface, localisation, accessibilité | `audio.js`, `ui.js`, `i18n.js`, `style.css`, `locales/*.json` |
| **QA & documentation** | *Membre D* | Tests, rapport de bugs, métriques, vidéo, coordination Git | `tests/*`, `TEST-PLAN.md`, `BUG-REPORT.md`, `METRICS.md`, `VIDEO-SCRIPT.md` |

> En solo : une personne assume A→D ; le tableau Trello sert alors de
> checklist personnelle et de journal d'avancement.

## 2. Tableau Trello

**Nom du tableau :** `LUMEN — Prototype`

### Colonnes (listes)
`Backlog` → `À faire` → `En cours` → `En revue / Test` → `Terminé`

### Étiquettes (labels)
- 🟦 Moteur · 🟩 Design/Niveau · 🟪 Audio/UI · 🟨 QA/Docs · 🟥 Bug

### Cartes (exemples, avec étiquette et responsable)

**Backlog / À faire**
- 🟩 Concevoir la mécanique de phase et les règles de solidité — *A*
- 🟦 Mettre en place la boucle de jeu et le rendu Canvas — *B*
- 🟦 Physique : accélération, gravité, saut (coyote/buffer/variable) — *B*
- 🟦 Collisions AABB axe par axe + sous-pas (anti-tunneling) — *B*
- 🟩 Tracer le niveau (tutoriel, pont alterné, mobile, escalier) — *A*
- 🟪 Synthèse audio : musique + effets — *C*
- 🟪 Overlays UI (menu, pause, victoire, aide) — *C*
- 🟪 Localisation FR/EN + bascule de langue — *C*
- 🟨 Écrire les tests unitaires de la logique pure — *D*
- 🟨 Script de captation de la vidéo de démo — *D*

**En cours**
- 🟦 Portage du joueur par la plateforme mobile — *B*
- 🟩 Équilibrage des écarts de saut et placement des éclats — *A*

**En revue / Test**
- 🟥 BUG-003 : clip en changeant de phase → garde anti-blocage — *B/D*
- 🟨 Dérouler la grille de playtest CM-01 → CM-23 — *D*

**Terminé**
- 🟦 Build autonome `dist/LUMEN.html` reproductible — *B*
- 🟨 40 tests unitaires au vert (100 %) — *D*
- 🟪 Identité visuelle (titre, emblème, palette) — *C*

### Conventions de carte
Chaque carte porte : un **responsable**, une **étiquette**, une **checklist**
(sous-tâches), et un lien vers le **commit**/fichier concerné. Les bugs sont des
cartes 🟥 reliées à leur entrée dans `BUG-REPORT.md` (même identifiant).

## 3. Rituels (cadence légère)

- **Daily (async)** : court point d'avancement sur le canal d'équipe.
- **Revue de fin d'itération** : démonstration jouable + passage des tests +
  mise à jour du `CHANGELOG`.
- **Definition of Done** d'une carte : code intégré, tests verts, doc à jour,
  carte déplacée en `Terminé`.

## 4. Git (collaboration)

- Branches par fonctionnalité : `feat/phase-mechanic`, `feat/audio`,
  `fix/bug-003-phase-clip`, etc.
- Messages de commit explicites et reliés aux cartes/bugs.
- `main` toujours jouable ; fusion après revue et tests verts.

## 5. Planning indicatif (6 itérations)

| Itération | Objectif | Version |
|---|---|---|
| 1 | Socle jouable (boucle, déplacement, saut) | 0.1 |
| 2 | Mécanique de phase + solidité physique | 0.2 |
| 3 | Niveau complet + audio | 0.3 |
| 4 | Interface + localisation | 0.4 |
| 5 | Finition (visuel, particules, a11y) | 0.5 |
| 6 | Tests, build, docs, vidéo → livraison | 1.0 |
