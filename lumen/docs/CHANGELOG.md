# Changelog — LUMEN

Format inspiré de *Keep a Changelog*. Le développement a suivi une démarche
**itérative** : un prototype jouable très tôt, puis des incréments testés.

---

## [1.3.0] — 2026-07-04
### Ajouté — refonte du contenu (longueur & difficulté)
- **Niveaux redessinés et allongés** (~4 600 à 5 000 px chacun, contre ~3 600–4 100)
  avec une vraie courbe de difficulté :
  - **Niveau 1 « Premiers pas »** : tutoriel étendu — chaque idée est introduite
    seule (déplacement → saut simple → révélation de phase → pont alterné doux
    → plateforme mobile → escalier). 
  - **Niveau 2 « Cadence »** : ponts plus longs, plateforme mobile plus rapide,
    et **ascenseur** vers une section en hauteur, descente puis remontée finale.
  - **Niveau 3 « Le Vide »** : pont alterné de 5 tuiles, deux plateformes
    mobiles à synchroniser, ascenseur rapide et longue section au-dessus du
    vide avec un dernier pont serré.
- **Nouvel élément de gameplay : l'ascenseur** (plateforme mobile VERTICALE),
  introduit au niveau 2 et accéléré au niveau 3.
- **3 points de contrôle par niveau** (au lieu de 2) et **12 éclats par niveau**.
- **Test de « jouabilité géométrique »** : le test d'intégration vérifie
  désormais que le spawn, chaque point de contrôle, le portail et chaque éclat
  ont un appui atteignable (plateforme ou trajet complet d'un mover), plus un
  test dédié du portage vertical — **23 vérifications** au total.
### Corrigé
- **BUG-011** — dérive du portage sur plateforme mobile : le delta (calculé par
  frame) était appliqué à chaque sous-pas physique, faisant glisser le joueur à
  N× la vitesse de la plateforme. Le portage est maintenant proratisé au
  sous-pas (corrige aussi le portage vertical de l'ascenseur).

## [1.2.0] — 2026-07-04
### Ajouté — « polish pass » (game feel & confort)
- **Squash & stretch** du personnage : étirement au décollage, écrasement à
  l'atterrissage (ancré sur les pieds), retour progressif à l'échelle neutre.
- **Onde de choc** (anneau expansif) + **bref flash** teinté à chaque bascule de
  phase : la mécanique centrale devient spectaculaire et encore plus lisible.
- **Contrôles tactiles** : boutons virtuels ◀ ▶ / saut / phase, affichés
  uniquement sur écrans tactiles ; branchés sur les mêmes chemins de code que
  le clavier (entrées virtuelles). Le jeu devient confortable sur mobile.
- **Meilleurs temps par niveau** (N1 · N2 · N3) affichés au menu.
- **Pop animé** du compteur d'éclats à chaque collecte.
- **Étoiles scintillantes** en très faible parallaxe dans le fond.
- **Auto-pause** quand l'onglet passe en arrière-plan (équité du chrono).
- **Retour haptique** discret à la mort sur mobile (si le navigateur le permet).
### Technique
- Nouvelles entrées virtuelles dans `input.js` (virtualPress/virtualRelease),
  utilisées par les boutons tactiles — aucun chemin de code dupliqué.
- Effets (ondes, flash) gérés dans `game.js`, purement visuels : la logique
  testée n'a pas changé (40/40 unitaires, 17/17 intégration).

## [1.1.0] — 2026-06-24
### Ajouté — contenu multi-niveaux
- Deux niveaux supplémentaires : « Cadence » (niveau 2) et « Le Vide » (niveau 3),
  soit **3 niveaux** au total, à difficulté croissante.
- Sélection de niveau au menu principal (boutons 1 / 2 / 3).
- Enchaînement automatique : bouton « Niveau suivant » sur l’écran de victoire,
  et message de fin après le dernier niveau.
- Indicateur de niveau dans le HUD (Niveau X / N).
- Localisation FR/EN des nouveaux libellés ; noms de niveaux traduits.
### Technique
- `level.js` : passage à un registre de niveaux (chargement par index) sans
  changer le moteur ni les autres modules — l’architecture data-driven a permis
  l’ajout sans refonte.
- Tests d’intégration étendus : chaque niveau est désormais chargé et simulé
  (données validées, aucune exception) — 17 vérifications.

## [1.0.0] — 2026-06-23
### Première version complète du prototype
- Niveau unique jouable **de bout en bout** (DÉPART → PORTAIL).
- Menu principal (Jouer / Comment jouer / Quitter) + sélecteur de langue.
- HUD complet (éclats, temps, morts, indicateur de phase, FPS, mute, pause).
- Écrans Pause et Victoire (bilan temps / éclats / morts / **rang** S-A-B-C).
- Audio synthétisé : musique réactive à la phase + 7 effets.
- Localisation FR + EN (intégrée et en fichiers `locales/*.json`).
- Build autonome `dist/LUMEN.html` via `node build.js`.
- Dossier complet (GDD, BUILD, TEST-PLAN, METRICS, BUG-REPORT, ASSETS,
  VIDEO-SCRIPT, TASK-BREAKDOWN).
### Corrigé
- BUG-009 / BUG-010 documentés comme limites de plateforme (repli en place).

## [0.5.0] — 2026-06-22
### Finition (« polish »)
- Identité visuelle : titre à double lueur, emblème de phase, palette néon.
- Plateformes « fantômes » de la phase inactive (aide à la planification).
- Particules (saut / collecte / bascule / mort), screen-shake, parallaxe.
- Accessibilité : focus clavier visible, `prefers-reduced-motion`, responsive.
### Corrigé
- BUG-005 (jitter plateforme mobile), BUG-007 (à-coups saut variable).

## [0.4.0] — 2026-06-21
### Interface et localisation
- Système d'overlays DOM (menu, aide, pause, victoire, quitter).
- Internationalisation : dictionnaires FR/EN + bascule de langue à chaud.
- Indicateur de phase et compteurs dans le HUD.
### Corrigé
- BUG-006 (touches collées au `blur`), BUG-008 (défilement page).

## [0.3.0] — 2026-06-20
### Contenu et audio
- Level design complet : tutoriel de phase, pont alterné, plateforme mobile,
  escalier final, points de contrôle, éclats, pics, portail.
- Moteur audio (Web Audio) : musique procédurale + effets ; gammes par phase.
- Mort / réapparition aux points de contrôle ; condition de victoire.
### Corrigé
- BUG-001 (autoplay audio).

## [0.2.0] — 2026-06-19
### Mécanique de phase et solidité de la physique
- Bascule Lumière ⇄ Ombre ; plateformes liées à une phase.
- Garde anti-blocage à la bascule.
- Collisions AABB axe par axe ; sous-pas physique (anti-tunneling).
### Corrigé
- BUG-002 (tunneling), BUG-003 (clip de phase), BUG-004 (double saut coyote).

## [0.1.0] — 2026-06-18
### Socle jouable
- Boucle de jeu (rAF), caméra suiveuse, rendu Canvas.
- Déplacement : accélération/friction, gravité, saut.
- Game feel initial : coyote time, jump buffering, saut à hauteur variable.
- Cœur logique `core.js` extrait et **couvert par des tests unitaires**.

---

## Pistes (hors périmètre du prototype)
- Plusieurs niveaux + sélecteur ; sauvegarde persistante des records.
- Manette / tactile ; nouveaux dangers (lasers, blocs mobiles par phase).
- Variante 100 % hors-ligne (polices embarquées) ; portage natif (Tauri).
