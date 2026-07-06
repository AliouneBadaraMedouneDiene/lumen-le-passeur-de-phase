# Plan de tests et cas de tests — LUMEN

Deux niveaux de tests :

1. **Automatisés** (`tests/core.test.js`, `tests/smoke.test.js`) — exécutables
   en continu, sans navigateur.
2. **Jouabilité manuelle** (playtest) — grille à dérouler dans le navigateur.

Critère global d'acceptation : **100 % des tests automatisés passent** et
**100 % des cas de jouabilité critiques** sont validés.

---

## 1. Stratégie

- La **logique numérique** (physique, collisions, phase, score, i18n) est isolée
  dans `js/core.js`, sans DOM : elle est testée unitairement et de façon
  déterministe.
- Le **chaînage des modules** et la **boucle de jeu** sont couverts par un test
  d'intégration headless (chargement + simulation pilotée par un bot).
- Le **ressenti** et le **rendu** (impossible à automatiser de façon fiable)
  sont couverts par une grille de playtest.

## 2. Cas de tests automatisés — logique (`core.test.js`)

| ID | Cas | Attendu |
|---|---|---|
| CT-01 | `clamp` borne basse / dans / haute | valeurs bornées |
| CT-02 | `lerp` aux extrêmes et au milieu | interpolation correcte |
| CT-03 | `approach` monte/descend sans dépassement | pas d'overshoot |
| CT-04 | `rectsOverlap` chevauchement réel | `true` |
| CT-05 | `rectsOverlap` rectangles disjoints | `false` |
| CT-06 | `rectsOverlap` contact bord-à-bord | `false` (pas de collage) |
| CT-07 | `togglePhase` Lumière ⇄ Ombre | phase opposée |
| CT-08 | `platformSolidIn` commune / bonne / mauvaise phase | solidité correcte |
| CT-09 | `canTogglePhase` joueur recouvert par cible | `false` (anti-blocage) |
| CT-10 | `canTogglePhase` joueur dégagé | `true` |
| CT-11 | `stepHorizontal` accélération | vitesse attendue |
| CT-12 | `stepHorizontal` friction (sans entrée) | décélération |
| CT-13 | `stepHorizontal` bornage à `maxSpeed` | vitesse plafonnée |
| CT-14 | `stepGravity` accumulation | vitesse de chute |
| CT-15 | `stepGravity` vitesse terminale | bornée à `maxFall` |
| CT-16 | `jumpVelocityForHeight` 150 px | ≈ 848,5 |
| CT-17 | `shardPercent` (et division par 0) | pourcentage correct, 0 si total=0 |
| CT-18 | `computeRank` S / A / B / C | rang attendu par paliers |
| CT-19 | `formatTime` 0 / 65 432 / négatif | `0:00.00` / `1:05.43` / `0:00.00` |
| CT-20 | `isLevelComplete` portail+vivant / sinon | victoire ssi portail atteint vivant |
| CT-21 | `translate` clé présente / repli langue / repli clé | résolution + replis |

> 40 assertions au total (plusieurs par ligne). Voir la sortie du runner.

## 3. Cas de tests automatisés — intégration (`smoke.test.js`)

| ID | Cas | Attendu |
|---|---|---|
| CI-01 | Chargement conjoint des 11 modules | tous définis sur `LUMEN.*` |
| CI-02 | Construction `Level`/`Camera`/`Particles`/`Player` sans DOM | aucune exception |
| CI-03 | Simulation de ~2700 frames avec bot | **aucune exception** dans la boucle |
| CI-04 | Progression spatiale | `x` augmente depuis le départ |
| CI-05 | Cohérence des compteurs morts/éclats | valeurs ≥ 0, mort→réapparition OK |

## 4. Grille de playtest manuel (navigateur)

Gravité : **C**ritique / **M**ajeure / **m**ineure.

| ID | Scénario | Étapes | Résultat attendu | Grav. |
|---|---|---|---|---|
| CM-01 | Démarrage | Ouvrir `dist/LUMEN.html` | Menu affiché, titre + emblème, musique au 1er geste | C |
| CM-02 | Lancer une partie | Cliquer *Jouer* | Apparition au DÉPART, HUD visible, indice affiché | C |
| CM-03 | Déplacement | `←`/`→` puis `Q`/`D` | Le personnage accélère/freine, regarde dans le sens | C |
| CM-04 | Saut variable | Tap vs maintien `Espace` | Saut court vs saut haut | M |
| CM-05 | Coyote / buffer | Sauter juste après le bord / juste avant l'atterrissage | Le saut sort quand même | m |
| CM-06 | Tutoriel de phase | `Maj` pour révéler la tuile d'Ombre | La plateforme apparaît et devient solide | C |
| CM-07 | Pont alterné | Sauter puis basculer en l'air à chaque tuile | Traversée possible au-dessus des pics | C |
| CM-08 | Bascule refusée | Tenter `Maj` collé à une plateforme de l'autre phase | Bascule bloquée + son « refusé » + indice | M |
| CM-09 | Plateforme mobile | Monter dessus | Le joueur est porté sans glisser ni vibrer | M |
| CM-10 | Pics | Toucher des pics | Mort + particules + shake, respawn au point de contrôle | C |
| CM-11 | Points de contrôle | Passer un checkpoint puis mourir | Réapparition au checkpoint (pas au départ) | M |
| CM-12 | Éclats | Toucher un éclat | Compteur +1, son, particules | M |
| CM-13 | Chute hors écran | Tomber dans un vide | Mort, réapparition | M |
| CM-14 | Portail (fin) | Atteindre le portail | Écran de victoire avec temps/éclats/morts/rang | C |
| CM-15 | Rang | Finir sans mort & tous les éclats < 90 s | Rang **S** | m |
| CM-16 | Pause | `Échap` ou bouton pause | Le monde se fige, menu de pause | M |
| CM-17 | Reprendre / Recommencer | Boutons de pause | Reprise correcte / niveau réinitialisé | M |
| CM-18 | Son | `M` ou bouton mute | Coupe/rétablit, icône à jour | m |
| CM-19 | Langue | Bouton langue (menu) | Tous les textes passent FR ⇄ EN | M |
| CM-20 | Quitter | Bouton *Quitter* | Tentative de fermeture + écran de repli, retour au menu | m |
| CM-21 | Responsive | Réduire la fenêtre | Mise en page fluide, HUD compacté | m |
| CM-22 | Accessibilité | Tab entre les boutons | Focus visible ; `reduced-motion` désactive l'ambiance | m |
| CM-23 | Performance | Jouer le niveau | FPS proche de 60, pas de saccade (voir METRICS) | M |

## 5. Procédure et traçabilité

1. Lancer les tests automatisés (CT-*, CI-*) — bloquant si rouge.
2. Dérouler la grille CM-* dans le navigateur.
3. Consigner toute anomalie dans `docs/BUG-REPORT.md` (ID, gravité, repro,
   statut) et **réitérer** jusqu'à validation des cas critiques.

## 6. État courant

- **Automatisés :** 40/40 unitaires ✔ · intégration 14/14 ✔.
- **Manuels :** grille CM-01 → CM-23 validée lors des sessions de mise au point
  (anomalies traitées : voir CHANGELOG et BUG-REPORT).
