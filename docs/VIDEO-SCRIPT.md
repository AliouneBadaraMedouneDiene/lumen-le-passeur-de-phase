# Scénario de la vidéo de démonstration — LUMEN

La vidéo de démo se **capture** (le jeu étant interactif, elle ne peut pas être
« générée » : il faut filmer une vraie partie). Ce document est un **script de
captation** prêt à suivre : matériel, réglages, plan par plan et narration.

> Durée cible : **90 à 120 s**. Format : **1920×1080, 60 fps**, MP4 (H.264).

---

## 1. Matériel et réglages

- **Capture :** OBS Studio (gratuit) → *Source* = « Capture de fenêtre » sur
  l'onglet du jeu, ou « Capture d'écran » plein écran.
- **Résolution/FPS :** 1920×1080 à 60 fps (Réglages → Vidéo).
- **Audio :** activer « Audio du bureau » pour capter la musique et les effets ;
  désactiver le micro (ou enregistrer une voix off séparée).
- **Préparation :** ouvrir `dist/LUMEN.html` en plein écran, attendre que les
  polices/sons soient chargés, faire un essai pour ne pas mourir trop tôt.

## 2. Découpage plan par plan

| # | Durée | À l'écran | Action / capture | Narration (voix off ou sous-titre) |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Menu principal | Laisser voir le titre, l'emblème qui tourne ; survoler les boutons | « LUMEN — un platformer où une même scène existe en deux réalités. » |
| 2 | 0:08–0:14 | Écran *Comment jouer* | Cliquer *Comment jouer*, montrer les commandes | « Se déplacer, sauter… et surtout : changer de phase. » |
| 3 | 0:14–0:24 | Début du niveau | Cliquer *Jouer* ; montrer le panneau DÉPART, ramasser 2 éclats | « La Lumière, en cyan. Les éclats à collecter. » |
| 4 | 0:24–0:36 | Tuile-tutoriel | Appuyer sur Maj : la plateforme d'Ombre **apparaît**, puis la traverser | « En basculant vers l'Ombre, une nouvelle plateforme devient réelle. » |
| 5 | 0:36–0:52 | Pont à phase alternée | Sauter puis basculer **en l'air** à chaque tuile, au-dessus des pics | « Tout l'enjeu : alterner au bon moment, souvent en plein saut. » |
| 6 | 0:52–1:00 | Bascule refusée | Se coller à une plateforme de l'autre phase, tenter Maj → son « refusé » | « On ne peut pas se téléporter dans un mur : la bascule est protégée. » |
| 7 | 1:00–1:10 | Plateforme mobile | Monter dessus, se faire porter au-dessus de la fosse | « Une plateforme mobile, un point de contrôle… » |
| 8 | 1:10–1:14 | Mort + respawn | (Si naturel) toucher un pic → particules + shake → réapparition au checkpoint | « En cas d'échec, on repart au dernier point de contrôle. » |
| 9 | 1:14–1:24 | Escalier final | Monter les plateformes communes jusqu'au portail | « Dernière ascension vers le portail. » |
| 10 | 1:24–1:32 | Portail (fin) | Entrer dans le portail → **écran de victoire** (temps, éclats, morts, rang) | « Niveau terminé : temps, éclats, morts et un rang à battre. » |
| 11 | 1:32–1:40 | Bonus : langue + mute | Retour menu, basculer FR/EN, montrer le bouton son | « Interface localisée FR/EN, son coupable à tout moment. » |

## 3. Conseils de prise

- **Deux passes :** une passe « propre » (réussite fluide) et une passe où l'on
  montre volontairement une mort + respawn (plan 8). Monter la meilleure.
- **Lisibilité :** ralentir légèrement les bascules clés pour qu'on voie le
  changement de couleur du monde et l'apparition des plateformes.
- **HUD :** garder le compteur de FPS visible un instant (preuve des ~60 FPS).
- **Fin :** terminer sur l'écran de victoire (rang **S** idéalement) pour une
  conclusion nette.

## 4. Montage (facultatif)

- Outils gratuits : **DaVinci Resolve**, **Shotcut** ou **CapCut**.
- Ajouter un titre d'intro (« LUMEN — Le Passeur de Phase ») et un carton final
  (équipe + « Prototype — HTML5/Canvas/JS »).
- Conserver l'audio du jeu ; si voix off, baisser la musique à ~30 % pendant la
  parole.
- Export : MP4 H.264, 1080p60, ~10–15 Mbit/s.

## 5. Plan B (sans montage)

Une **prise unique** de 90 s suivant les plans 1→10 suffit à démontrer toutes
les exigences (menu, UI, sons, mécanique, début/fin). Enregistrer, exporter,
livrer.
