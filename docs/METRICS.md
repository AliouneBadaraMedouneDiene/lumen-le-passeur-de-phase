# Métriques et critères de succès — LUMEN

Le guide demande des métriques **mesurables**. Les voici, avec la méthode de
mesure et la cible.

---

## 1. Tableau de bord

| Métrique | Cible | Mesuré | Méthode | Statut |
|---|---|---|---|---|
| Tests unitaires réussis | 100 % | **40/40 (100 %)** | `node tests/core.test.js` | ✅ |
| Test d'intégration | 0 échec | **23/23, 0 exception** | `node tests/smoke.test.js` | ✅ |
| Taille du build autonome | < 1 Mo | **~100.0 Ko** (102405 octets) | `wc -c dist/LUMEN.html` | ✅ |
| Dépendances d'exécution | 0 | **0** | aucune lib chargée à l'exécution | ✅ |
| Images-par-seconde | ≥ 55 (cible 60) | **~60** (synchronisé rAF) | compteur FPS du HUD | ✅ |
| Temps de complétion par niveau | < 10 min | **~1 à 4 min** | chrono en jeu | ✅ |
| Démarrage jouable | < 2 s | quasi-instantané | ouverture du fichier | ✅ |
| Mémoire particules | bornée | **≤ 240** particules | constante `MAX` (`particles.js`) | ✅ |

> Les FPS dépendent de la machine. Le jeu vise 60 FPS (rendu calé sur
> `requestAnimationFrame`) ; la physique est en **sous-pas à pas de temps fixe
> (≤ 1/120 s)**, donc le comportement reste identique même si le framerate
> baisse (la boucle borne `dt` à 1/30 s pour éviter l'emballement).

## 2. Volumétrie du code

| Élément | Quantité |
|---|---|
| Modules JavaScript | 11 |
| Lignes de code JS (source) | ~1 893 |
| Lignes de CSS | ~310 |
| Tests (unitaires + intégration) | 2 fichiers, 63 assertions |
| Langues fournies | 2 (FR, EN) |
| Fichiers de projet | 23 |

## 3. Contenu jouable

| Élément | Quantité |
|---|---|
| Niveaux jouables (début → fin) | 3 |
| Éclats à collecter | 12 par niveau (36) |
| Fosses de pics | 12 (4 par niveau) |
| Plateformes mobiles (dont ascenseurs) | 6 |
| Points de contrôle | 3 par niveau |
| Plateformes liées à une phase | 20 |
| Plateformes communes / escalier | 8 |

## 4. Critères d'acceptation (Definition of Done)

Le prototype est considéré « terminé » lorsque **tous** ces points sont vrais —
ils le sont :

- [x] Trois niveaux **jouables de bout en bout** (DÉPART → PORTAIL), avec sélection et enchaînement.
- [x] **Menu principal** avec *Jouer* et *Quitter* fonctionnels.
- [x] **Interface complète** : HUD (éclats, temps, morts, phase, FPS), pause,
      victoire, aide.
- [x] **Sons** : musique **et** effets (synthétisés).
- [x] **Début et fin** clairement identifiables (panneaux + écran de victoire).
- [x] **Tout codé** (aucun no-code) ; **moteur courant** (HTML5/Canvas/JS) ; **Git**.
- [x] **Ressources originales / libres de droits** (procédurales).
- [x] **Build** reproductible (`node build.js`) et **tests** verts.
- [x] **Localisation** FR (+ EN) sous forme de fichiers.
- [x] **Cible PC/Windows** validée (navigateur, clavier).

## 5. Critères de succès (qualitatifs)

- **Lisibilité de la mécanique :** un joueur comprend la bascule en moins d'une
  minute (tuile-tutoriel + indices + fantômes + indicateur de phase).
- **Équité :** aucune mort « injuste » ; réapparition aux points de contrôle ;
  écarts de saut mesurés ; éclats risqués optionnels.
- **Sensation :** coyote time, jump buffering, saut variable, particules,
  screen-shake — le déplacement est réactif et satisfaisant.
- **Finition :** identité visuelle cohérente, audio réactif, interface complète,
  accessibilité de base (focus, reduced-motion, responsive).

## 6. Comment reproduire les mesures

```bash
node tests/core.test.js      # -> 40 réussis, 0 échoués
node tests/smoke.test.js     # -> 0 échoués
node build.js                # -> taille affichée en Ko
wc -c dist/LUMEN.html        # -> octets du build
# FPS : lire le compteur en haut à droite du HUD en jeu
# Durée : lire le chrono du HUD jusqu'au portail
```
