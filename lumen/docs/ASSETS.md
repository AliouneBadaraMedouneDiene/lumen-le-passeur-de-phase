# Liste des ressources (assets) — LUMEN

Principe : **aucun fichier média externe**. Tous les graphismes sont **dessinés
par code** (Canvas 2D) et tous les sons sont **synthétisés** en temps réel
(Web Audio API). Les ressources du jeu sont donc **originales** et **libres de
droits**. Seules les **polices** proviennent d'un tiers (licence libre, voir §4).

---

## 1. Graphismes (procéduraux — `js/level.js`, `js/player.js`, `js/particles.js`)

| Asset | Type | Génération | Source |
|---|---|---|---|
| Personnage (orbe lumineux) | Vectoriel | Dégradé radial + noyau + « regard » + trail | `player.js` |
| Plateformes néon | Vectoriel | Rectangle arrondi + liseré lumineux | `level.js` |
| Plateformes « fantômes » | Vectoriel | Contour pointillé translucide | `level.js` |
| Pics | Vectoriel | Triangles + lueur | `level.js` |
| Éclats | Vectoriel | Losange tournant + cœur clair | `level.js` |
| Portail (objectif) | Vectoriel | Anneaux pulsés + cœur radial | `level.js` |
| Points de contrôle | Vectoriel | Anneau pulsé | `level.js` |
| Panneaux DÉPART / PORTAIL | Texte | Police d'affichage | `level.js` |
| Fond (void + parallaxe) | Vectoriel | Dégradé + 2 couches de points + motes | `level.js` |
| Particules | Vectoriel | Pool de carrés avec fondu | `particles.js` |
| Emblème de phase, titre | CSS | `conic-gradient` + `text-shadow` | `style.css` |

## 2. Audio (synthétisé — `js/audio.js`)

| Asset | Type | Synthèse |
|---|---|---|
| Musique de fond | Boucle | Arpège pentatonique (triangle) + basse (sine), ordonnanceur look-ahead ; gamme **majeure** en Lumière, **mineure** en Ombre |
| Effet — saut | SFX | Oscillateur carré, montée 360→720 Hz |
| Effet — atterrissage | SFX | Sinus descendant 180→90 Hz |
| Effet — collecte | SFX | Deux triangles ascendants (880→1320→1760 Hz) |
| Effet — bascule de phase | SFX | Bruit filtré passe-bande balayé (woosh) |
| Effet — bascule refusée | SFX | Dent de scie descendante |
| Effet — mort | SFX | Dent de scie 440→60 Hz |
| Effet — victoire | SFX | Accord arpégé Do-Mi-Sol-Do |

> Aucune fréquence/échantillon n'est tiré d'une œuvre existante : timbres et
> motifs sont définis par les paramètres du code.

## 3. Couleurs (jetons de design — `style.css`, `level.js`)

| Rôle | Hex |
|---|---|
| Void (fond) | `#05070f` / `#0a0e1e` |
| Lumière (cyan) | `#36e3ff` |
| Ombre (magenta) | `#ff4fd8` |
| Objectif | `#7CFFB2` |
| Éclat | `#ffe066` |
| Danger (pics) | `#ff5a6e` |
| Texte | `#eaf0ff` · Atténué `#8b95c4` |

## 4. Polices (tierces, licence libre)

| Police | Usage | Licence | Source |
|---|---|---|---|
| **Chakra Petch** | Affichage / titres / HUD | SIL Open Font License 1.1 | Google Fonts |
| **Inter** | Interface / corps de texte | SIL Open Font License 1.1 | Google Fonts |

Chargées via Google Fonts (`<link>`). **Repli** sur polices système (`Segoe UI`,
`system-ui`, `sans-serif`) si le réseau est indisponible — le jeu reste
parfaitement lisible hors-ligne. La SIL OFL autorise un usage libre, y compris
l'intégration (une variante hors-ligne pourrait embarquer ces polices).

## 5. Bibliothèques d'exécution

**Aucune.** Pas de moteur tiers, pas de framework, pas de CDN de code. Node.js
n'est utilisé que pour le **build** et les **tests** (sans `npm install`).

## 6. Récapitulatif licences

- **Code & graphismes & sons :** produits pour ce projet.
- **Polices :** SIL OFL 1.1 (libre).
- **Aucune** ressource sous droits restrictifs n'est utilisée.
