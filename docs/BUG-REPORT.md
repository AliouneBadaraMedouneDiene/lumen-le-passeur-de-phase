# Rapport de bugs — LUMEN

Suivi structuré des anomalies rencontrées **pendant le développement itératif**.
Chaque entrée : identifiant, description, gravité, statut, étapes de
reproduction, cause et correctif. Gravité : **Critique / Élevée / Moyenne /
Faible / Cosmétique**.

Récapitulatif : 11 anomalies suivies — **9 résolues**, **2 connues**
(limites de plateforme documentées, sans impact sur la jouabilité).

---

### BUG-001 — Aucun son au lancement
- **Gravité :** Moyenne · **Statut :** ✅ Résolu (v0.3)
- **Reproduction :** ouvrir le jeu, lancer une partie ; la musique ne démarre
  pas tant qu'aucune interaction n'a eu lieu.
- **Cause :** politique d'autoplay des navigateurs (un `AudioContext` créé sans
  geste utilisateur démarre en état `suspended`).
- **Correctif :** initialisation paresseuse `AudioEngine.ensure()` + `resume()`
  au premier `pointerdown` et au clic *Jouer*. La musique entre en fondu.

### BUG-002 — Traversée des plateformes fines à grande vitesse (tunneling)
- **Gravité :** Élevée · **Statut :** ✅ Résolu (v0.2)
- **Reproduction :** tomber de haut sur une plateforme de 26 px ; à framerate
  bas, le joueur la traverse.
- **Cause :** déplacement par image trop grand (`v·dt`) dépassant l'épaisseur de
  la plateforme entre deux tests de collision.
- **Correctif :** intégration physique en **sous-pas** (`SUBSTEP = 1/120 s`) ;
  la boucle borne aussi `dt` à 1/30 s.

### BUG-003 — Personnage coincé en basculant de phase (clip)
- **Gravité :** Élevée · **Statut :** ✅ Résolu (v0.2)
- **Reproduction :** se placer sous/contre une plateforme de la phase opposée,
  puis basculer ; le personnage se retrouve incrusté dans le bloc devenu solide.
- **Cause :** la bascule ne vérifiait pas les chevauchements avec les
  plateformes qui *deviennent* solides.
- **Correctif :** garde `Core.canTogglePhase()` — la bascule est refusée si elle
  provoquerait un chevauchement ; retour sonore « refusé » + indice à l'écran.

### BUG-004 — Double saut via le coyote time
- **Gravité :** Moyenne · **Statut :** ✅ Résolu (v0.2)
- **Reproduction :** sauter, puis re-sauter dans les ~90 ms suivantes ; un second
  saut sortait en l'air.
- **Cause :** le timer de coyote n'était pas remis à zéro au décollage.
- **Correctif :** `coyote = 0` au moment du saut ; le saut consomme le buffer.

### BUG-005 — Vibration sur la plateforme mobile (jitter)
- **Gravité :** Faible · **Statut :** ✅ Résolu (v0.3)
- **Reproduction :** rester debout sur la plateforme mobile ; le personnage
  tremblait par rapport à elle.
- **Cause :** le joueur n'était pas solidaire du déplacement de la plateforme,
  d'où une correction de collision chaque image.
- **Correctif :** portage explicite — le delta de la plateforme (`_dx`) est
  appliqué au joueur **avant** son déplacement propre.

### BUG-006 — Touches « collées » après perte de focus
- **Gravité :** Faible · **Statut :** ✅ Résolu (v0.4)
- **Reproduction :** maintenir une direction puis `Alt+Tab` ; au retour, le
  personnage continuait d'avancer.
- **Cause :** l'événement `keyup` est manqué quand la fenêtre perd le focus.
- **Correctif :** réinitialisation de l'état clavier sur l'événement `blur`.

### BUG-007 — À-coups du saut à hauteur variable
- **Gravité :** Faible · **Statut :** ✅ Résolu (v0.3)
- **Reproduction :** tapoter rapidement le saut ; l'ascension était coupée
  plusieurs fois, donnant un mouvement haché.
- **Cause :** la coupure d'ascension s'appliquait à chaque image où la touche
  était relâchée.
- **Correctif :** drapeau `jumpCut` — la coupure n'a lieu **qu'une fois** par
  saut.

### BUG-008 — La page défile avec Espace / flèches
- **Gravité :** Moyenne · **Statut :** ✅ Résolu (v0.4)
- **Reproduction :** appuyer sur `Espace` ou les flèches ; la page défilait sous
  le jeu.
- **Cause :** comportement par défaut du navigateur sur ces touches.
- **Correctif :** `preventDefault()` sur les touches utilisées par le jeu.

### BUG-009 — Polices génériques en ouverture hors-ligne *(connu)*
- **Gravité :** Cosmétique · **Statut :** ⚠️ Connu (limite plateforme)
- **Reproduction :** ouvrir `dist/LUMEN.html` en `file://` sans connexion ; les
  polices *Chakra Petch* / *Inter* ne se chargent pas.
- **Cause :** les polices proviennent de Google Fonts (réseau).
- **Contournement :** repli automatique sur les polices système (lisibilité
  préservée) ; servir le projet via un serveur local pour les charger. Une
  variante 100 % hors-ligne embarquerait les polices en base64.

### BUG-010 — « Quitter » ne ferme pas l'onglet *(connu)*
- **Gravité :** Faible · **Statut :** ⚠️ Connu (limite plateforme)
- **Reproduction :** cliquer *Quitter* ; l'onglet ne se ferme pas.
- **Cause :** `window.close()` est ignoré par les navigateurs pour les onglets
  non ouverts par script (sécurité).
- **Contournement :** un écran de repli « Merci d'avoir joué » s'affiche, avec
  retour au menu. Dans un portage Windows natif (ex. Electron / Tauri), l'action
  fermerait réellement l'application.

### BUG-011 — Dérive du joueur sur les plateformes mobiles (portage en sous-pas)
- **Gravité :** Moyenne · **Statut :** ✅ Résolu (v1.3)
- **Reproduction :** rester debout sur une plateforme mobile ; le joueur glisse
  progressivement vers l'avant de la plateforme et finit par en tomber.
- **Cause :** le delta de déplacement du mover est calculé **une fois par
  frame**, mais il était appliqué **à chaque sous-pas** physique (2 sous-pas à
  60 FPS) : le joueur avançait donc à N× la vitesse de la plateforme.
- **Correctif :** le portage est **proratisé au sous-pas** (fraction h/dt du
  delta de la frame). Corrige aussi le portage vertical des ascenseurs,
  introduits en v1.3. Couvert par un test dédié (le joueur reste 6 s sur
  l'ascenseur sans tomber).

---

## Processus

À chaque itération : reproduire → consigner ici → corriger → **rejouer les tests
automatisés** (`core.test.js`, `smoke.test.js`) et la grille de playtest
concernée → mettre à jour le statut et le `CHANGELOG`.
