# Game Design Document — LUMEN, Le Passeur de Phase

**Version :** 1.0 · **Plateforme cible :** PC (Windows, navigateur) · **Genre :** Platformer 2D de précision · **Joueurs :** 1

---

## 1. Pitch

Dans un monde numérique brisé, un fragment de lumière conscient cherche la
sortie. La réalité y existe en deux **phases** superposées : la **Lumière** et
l'**Ombre**. Ce qui est solide dans l'une est intangible dans l'autre. Le
passeur peut **basculer** d'une phase à l'autre à volonté — y compris en plein
saut — pour faire apparaître sous ses pieds les plateformes dont il a besoin et
franchir des gouffres hérissés de pics.

> Fantasme de jeu : « je vois deux mondes en même temps et je tisse mon chemin
> en alternant entre eux au bon rythme. »

## 2. Thème et cohérence

Tout sert une même idée : la **dualité**.

- **Visuel :** un fond « void » profond, traversé d'une double signalétique néon
  — cyan pour la Lumière, magenta pour l'Ombre. Les plateformes de la phase
  inactive restent visibles en « fantômes » pointillés, pour que le joueur
  planifie au lieu de deviner.
- **Audio :** la musique change de couleur harmonique selon la phase (gamme
  majeure en Lumière, mineure en Ombre).
- **Mécanique :** une seule action centrale (basculer) qui reconfigure le niveau.

## 3. Mécaniques

### 3.1 Déplacement (game feel)
Un platformer ne « sent » bon que par ses détails. LUMEN implémente :

- **Accélération / friction** : la vitesse n'est pas instantanée.
- **Coyote time** (~90 ms) : on peut encore sauter juste après avoir quitté une
  plateforme.
- **Jump buffering** (~100 ms) : un saut demandé juste avant l'atterrissage est
  mémorisé et exécuté à la réception.
- **Saut à hauteur variable** : relâcher tôt coupe l'ascension (sauts courts vs
  longs).
- **Sous-pas physique** (≤ 1/120 s) : pas de « tunneling » à travers les
  plateformes fines, quel que soit le framerate.

### 3.2 Bascule de phase (cœur du jeu)
- Une plateforme est **commune** (toujours solide) ou liée à **une** phase.
- Basculer échange Lumière ⇄ Ombre instantanément.
- **Garde anti-blocage** : on ne peut pas basculer si cela coince le personnage
  dans une plateforme qui deviendrait solide (retour sonore « refusé »).
- Lecture stratégique : basculer en l'air pour faire apparaître la plateforme
  d'arrivée *pendant* le saut.

### 3.3 Objets et dangers
- **Éclats** (12 par niveau) : collectibles, score et rang.
- **Pics** : mortels, au fond des fosses.
- **Plateformes mobiles** : transport horizontal au-dessus d'une fosse ; portent
  le joueur. **Ascenseurs** (variante verticale, introduite au niveau 2) :
  desservent les sections en hauteur.
- **Points de contrôle** (3 par niveau) : réapparition après une mort, sans
  relancer le niveau (zéro frustration, le compteur de morts reste la « pénalité »).
- **Portail** : la fin, clairement identifiable (anneaux pulsés).

## 4. Boucle de jeu

```
Menu principal ──Jouer──▶ Niveau (un seul, complet)
                              │
            ┌─────────────────┼──────────────────┐
            ▼                 ▼                  ▼
        Collecter         Mourir ──▶ respawn   Atteindre
         éclats          au point de contrôle  le portail
            └─────────────────┬──────────────────┘
                              ▼
                       Écran de victoire
                  (temps · éclats · morts · rang)
                              │
                   Rejouer ◀──┴──▶ Menu principal
```

- **Début fonctionnel :** Menu → bouton *Jouer* → apparition au panneau DÉPART.
- **Fin fonctionnelle :** contact avec le portail → écran de victoire avec bilan.

## 5. Level design (les niveaux)

Le jeu compte **trois niveaux** longs (~4 600 à 5 000 px) à difficulté
croissante, sélectionnables au menu et enchaînés automatiquement, avec chacun
**3 points de contrôle** et **12 éclats** :

- **« Premiers pas »** : tutoriel étendu — chaque idée est introduite seule
  (déplacement → saut simple → révélation de phase → pont alterné doux →
  plateforme mobile → escalier final).
- **« Cadence »** : ponts alternés plus longs, plateforme mobile plus rapide,
  et **ascenseur** (plateforme mobile verticale) vers une section en hauteur,
  suivie d'une descente puis d'une remontée finale.
- **« Le Vide »** : pont alterné de cinq tuiles, deux plateformes mobiles à
  synchroniser, ascenseur rapide et longue section au-dessus du vide avec un
  dernier pont serré.

Tous réutilisent le même vocabulaire d'éléments et des écarts de
saut éprouvés, pour rester franchissables — propriété désormais **vérifiée par
un test automatique de jouabilité géométrique** (chaque spawn, point de
contrôle, portail et éclat doit avoir un appui atteignable).

Le premier niveau, détaillé ci-dessous, sert de référence. Progression de gauche
à droite, en escalade d'intensité, conçue pour ~1 à 4 min :

1. **Sol de départ** — apprentissage du déplacement (panneau DÉPART, 2 éclats).
2. **Tuile-tutoriel** — une plateforme d'Ombre à *révéler* en basculant :
   enseigne la mécanique sans danger mortel immédiat.
3. **Pont à phase alternée** — trois tuiles alternant Ombre/Lumière au-dessus
   d'une fosse de pics : il faut sauter puis basculer en l'air à chaque tuile.
4. **Point de contrôle 1**, puis **plateforme mobile** au-dessus d'une fosse.
5. **Point de contrôle 2**, puis **escalier final** (plateformes communes) qui
   monte vers le **portail**.


Le tracé reste **franchissable** : sauts montants à faible décalage horizontal,
plateformes larges, écarts mesurés, réapparition aux points de contrôle. Les
éclats les plus risqués (au-dessus du pont) sont **optionnels**.

## 6. Direction artistique

- **Palette :** void `#05070f` ; Lumière `#36e3ff` ; Ombre `#ff4fd8` ;
  objectif `#7CFFB2` ; éclat `#ffe066` ; danger `#ff5a6e`.
- **Typographie :** *Chakra Petch* (affichage, techno) + *Inter* (interface).
- **Signature :** le **titre LUMEN** à double lueur cyan/magenta et l'**emblème
  de phase** (disque mi-cyan mi-magenta) repris au menu et à la victoire.
- **Effets :** halos néon, particules (saut/collecte/bascule/mort), parallaxe à
  deux couches, léger *screen-shake* aux impacts.

## 7. Audio

100 % **synthétisé** (Web Audio API) — donc original et libre de droits :

- **Musique :** arpège pentatonique + basse, ordonnanceur « look-ahead » ; la
  gamme suit la phase (majeure/mineure).
- **Effets :** saut, atterrissage, collecte, bascule (woosh filtré), bascule
  refusée, mort, victoire.
- **Confort :** coupure du son (touche `M` ou bouton HUD), fondu d'entrée,
  démarrage au premier geste (politique d'autoplay respectée).

## 8. Interface

- **Menu principal :** Jouer, Comment jouer, Quitter, sélecteur de langue,
  sélection de niveau (1 / 2 / 3) et meilleur temps de la session.
- **HUD :** niveau, éclats, chrono, morts, indicateur de phase, FPS, mute, pause.
- **Écrans :** Comment jouer, Pause (Reprendre/Recommencer/Menu), Victoire
  (bilan + rang + bouton « Niveau suivant »), Quitter.

## 9. Accessibilité et qualité

- Responsive jusqu'au mobile (mise en page fluide, HUD compacté).
- **Focus clavier visible** sur tous les boutons.
- `prefers-reduced-motion` respecté (animations d'ambiance désactivées).
- Double mapping clavier **AZERTY / QWERTY** + flèches.

## 10. Hors périmètre (prototype)

Trois niveaux (extensibles facilement via le registre de `level.js`) ; pas de
sauvegarde persistante (le meilleur temps vit le temps
de la session) ; pas de multijoueur. Ces points sont des extensions naturelles
documentées dans le CHANGELOG (section « Pistes »).
