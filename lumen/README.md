# LUMEN — Le Passeur de Phase

> Un platformer 2D où l'on glisse entre deux réalités — **Lumière** et **Ombre** —
> pour traverser un monde numérique fracturé. Chaque phase rend tangible un jeu de
> plateformes différent : il faut basculer au bon instant, souvent en plein saut.

Prototype jouable réalisé pour le **Guide de Projet — Mémoire Gaming** (suivi par
Seynabou Niang, Promo 10). Le jeu est codé **à la main** en HTML5 / Canvas /
JavaScript (aucun outil no-code/low-code), versionné sous Git, et accompagné de
l'ensemble des livrables demandés.

---

## ▶ Lancer le jeu

**Le plus simple** — ouvrir le build autonome :

```
dist/LUMEN.html      ← double-cliquer (s'ouvre dans le navigateur, aucun serveur requis)
```

**Depuis les sources** (développement) :

```
index.html           ← ouvrir dans un navigateur moderne
```

> 💡 Le son démarre au premier clic (politique « autoplay » des navigateurs).
> Cliquer sur **Jouer** suffit à l'activer.

### Commandes

| Touche | Action |
|---|---|
| `←` `→` ou `Q` `D` (ou `A` `D`) | Se déplacer |
| `Espace` ou `↑` | Sauter (hauteur variable) |
| `Maj` ou `E` | **Changer de phase** (Lumière ⇄ Ombre) |
| `Échap` ou `P` | Pause |
| `M` | Couper / rétablir le son |

**Objectif :** rejoindre le **portail** au bout du niveau. Les plateformes **cyan**
n'existent qu'en **Lumière**, les **magenta** qu'en **Ombre**. Récupère les éclats
dorés pour viser le rang **S**.

---

## 🗂 Arborescence

```
lumen/
├── index.html            Page de jeu (sources, charge css + js)
├── build.js              Script de build → dist/LUMEN.html (Node, sans dépendance)
├── README.md             Ce fichier
│
├── js/                   Code source modulaire (11 modules)
│   ├── core.js           Logique PURE (testée sous Node) — 1 seule source de vérité
│   ├── i18n.js           Localisation FR/EN
│   ├── audio.js          Audio 100% synthétisé (Web Audio API)
│   ├── input.js          Clavier (AZERTY + QWERTY + flèches)
│   ├── particles.js      Système de particules
│   ├── camera.js         Caméra (suivi, anticipation, screen-shake)
│   ├── level.js          Données + rendu des niveaux (3 niveaux)
│   ├── player.js         Personnage (physique, collisions, interactions)
│   ├── ui.js             Interface hors-canvas (menus, HUD, toasts)
│   ├── game.js           Machine à états + boucle + orchestration
│   └── main.js           Point d'entrée
│
├── css/
│   └── style.css         Identité visuelle (thème néon, responsive, a11y)
│
├── locales/              Fichiers de localisation (livrable)
│   ├── fr.json
│   └── en.json
│
├── tests/
│   └── core.test.js      40 tests d'acceptation (100% réussis) — `node tests/core.test.js`
│
├── dist/
│   └── LUMEN.html        ★ BUILD AUTONOME — le jeu en un seul fichier
│
└── docs/                 Tous les livrables documentaires
    ├── GDD.md            Document de conception (thème, mécaniques, niveau)
    ├── BUILD.md          Instructions de compilation / build
    ├── TEST-PLAN.md      Plan + cas de tests (manuels et automatisés)
    ├── CHANGELOG.md      Historique des versions
    ├── BUG-REPORT.md     Rapport de bugs structuré (ID, gravité, statut, repro)
    ├── ASSETS.md         Liste des ressources + licences
    ├── VIDEO-SCRIPT.md   Script/storyboard de la vidéo de démonstration
    ├── TASK-BREAKDOWN.md  Organisation d'équipe + outil de gestion (Trello)
    └── METRICS.md        Métriques mesurables (FPS, taille, tests, durée)
```

---

## ✅ Couverture des exigences du guide

| Exigence | Où |
|---|---|
| 3 niveaux jouables, début → fin clairs | `js/level.js` (registre de niveaux) ; voir `docs/GDD.md` |
| Menu principal (Jouer / Quitter) + UI complète | `index.html`, `js/ui.js`, `css/style.css` |
| Sons (musique + effets) | `js/audio.js` (synthèse temps réel) |
| Codé (pas de no-code/low-code) + Git | tout `js/`, `build.js` |
| Thème cohérent, ressources libres de droits | `docs/GDD.md`, `docs/ASSETS.md` |
| Code source organisé | `js/` modulaire + `core.js` isolé |
| Liste des assets | `docs/ASSETS.md` |
| Instructions de build | `docs/BUILD.md` + `build.js` |
| Plans + cas de tests | `docs/TEST-PLAN.md` + `tests/core.test.js` |
| Fichiers de localisation (FR min.) | `locales/fr.json`, `locales/en.json`, `js/i18n.js` |
| Changelog | `docs/CHANGELOG.md` |
| Vidéo de démo | `docs/VIDEO-SCRIPT.md` (script de captation prêt à filmer) |
| Métriques mesurables | `docs/METRICS.md` |
| Rapport de bugs structuré | `docs/BUG-REPORT.md` |
| Organisation équipe + outil de gestion | `docs/TASK-BREAKDOWN.md` |
| Plateforme cible PC (Windows) | navigateur de bureau ; voir `docs/BUILD.md` |

---

## 🔧 Recompiler

```bash
node build.js
```

Régénère `dist/LUMEN.html` à partir des sources (inline CSS + JS, dans l'ordre des
dépendances). Aucune dépendance npm.

## 🧪 Tester

```bash
node tests/core.test.js
```