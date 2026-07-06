/* =============================================================================
 * LUMEN — i18n.js
 * -----------------------------------------------------------------------------
 * Internationalisation. Les dictionnaires sont intégrés ici (LOCALES) pour que
 * le jeu fonctionne en ouvrant simplement le fichier (file://), sans serveur.
 * Les mêmes contenus existent aussi en JSON dans /locales (livrable de
 * localisation, rechargeable via un serveur). La recherche de clé/repli est
 * déléguée à Core.translate (fonction PURE, couverte par les tests).
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var Core = root.LUMEN.Core;

  var LOCALES = {
    fr: {
      meta: { name: 'Français' },
      menu: {
        subtitle: 'Le Passeur de Phase',
        tagline: 'Un monde, deux réalités. Apprends à glisser entre la Lumière et l\u2019Ombre.',
        play: 'Jouer',
        howto: 'Comment jouer',
        quit: 'Quitter',
        lang: 'Langue',
        best: 'Meilleur temps'
      },
      howto: {
        title: 'Comment jouer',
        move: 'Se déplacer',
        jump: 'Sauter',
        phase: 'Changer de phase',
        pause: 'Pause',
        mute: 'Couper le son',
        goal: 'Objectif : rejoins le portail au bout du niveau. Les plateformes cyan n\u2019existent que dans la Lumière, les magenta que dans l\u2019Ombre. Bascule au bon moment pour traverser.',
        back: 'Retour'
      },
      hud: {
        shards: 'Éclats',
        time: 'Temps',
        deaths: 'Morts',
        phase: 'Phase',
        lumen: 'Lumière',
        umbra: 'Ombre'
      },
      pause: {
        title: 'Pause',
        resume: 'Reprendre',
        restart: 'Recommencer',
        menu: 'Menu principal'
      },
      win: {
        title: 'Niveau terminé !',
        subtitle: 'Tu as rejoint le portail.',
        time: 'Temps',
        shards: 'Éclats',
        deaths: 'Morts',
        rank: 'Rang',
        replay: 'Rejouer',
        menu: 'Menu principal'
      },
      hint: {
        move: 'Utilise les flèches ou Q/D pour avancer, Espace pour sauter.',
        phase: 'Appuie sur MAJ pour basculer entre Lumière et Ombre.',
        blocked: 'Bascule impossible ici : tu serais coincé dans un mur.',
        checkpoint: 'Point de contrôle atteint.'
      },
      quit: {
        title: 'Merci d\u2019avoir joué !',
        body: 'Tu peux fermer cet onglet en toute sécurité.'
      },
      start: { go: 'DÉPART', goal: 'PORTAIL' },
      level: {
        label: 'Niveau', select: 'Niveaux', next: 'Niveau suivant',
        name1: 'Premiers pas', name2: 'Cadence', name3: 'Le Vide',
        allComplete: 'Tous les niveaux terminés !',
        allCompleteMsg: 'Bravo, tu as traversé toutes les phases du monde fracturé.'
      }
    },

    en: {
      meta: { name: 'English' },
      menu: {
        subtitle: 'The Phase Walker',
        tagline: 'One world, two realities. Learn to slip between Light and Shadow.',
        play: 'Play',
        howto: 'How to play',
        quit: 'Quit',
        lang: 'Language',
        best: 'Best time'
      },
      howto: {
        title: 'How to play',
        move: 'Move',
        jump: 'Jump',
        phase: 'Shift phase',
        pause: 'Pause',
        mute: 'Mute',
        goal: 'Goal: reach the portal at the end. Cyan platforms exist only in the Light, magenta ones only in the Shadow. Shift at the right moment to cross.',
        back: 'Back'
      },
      hud: {
        shards: 'Shards',
        time: 'Time',
        deaths: 'Deaths',
        phase: 'Phase',
        lumen: 'Light',
        umbra: 'Shadow'
      },
      pause: {
        title: 'Paused',
        resume: 'Resume',
        restart: 'Restart',
        menu: 'Main menu'
      },
      win: {
        title: 'Level complete!',
        subtitle: 'You reached the portal.',
        time: 'Time',
        shards: 'Shards',
        deaths: 'Deaths',
        rank: 'Rank',
        replay: 'Play again',
        menu: 'Main menu'
      },
      hint: {
        move: 'Use arrows or A/D to move, Space to jump.',
        phase: 'Press SHIFT to switch between Light and Shadow.',
        blocked: 'Can\u2019t shift here: you would be stuck in a wall.',
        checkpoint: 'Checkpoint reached.'
      },
      quit: {
        title: 'Thanks for playing!',
        body: 'You can safely close this tab.'
      },
      start: { go: 'START', goal: 'PORTAL' },
      level: {
        label: 'Level', select: 'Levels', next: 'Next level',
        name1: 'First Steps', name2: 'Cadence', name3: 'The Void',
        allComplete: 'All levels complete!',
        allCompleteMsg: 'Well done — you crossed every phase of the fractured world.'
      }
    }
  };

  var I18n = {
    locale: 'fr',
    fallback: 'fr',
    available: ['fr', 'en'],
    LOCALES: LOCALES,

    setLocale: function (code) {
      if (LOCALES[code]) this.locale = code;
      return this.locale;
    },
    next: function () {
      var i = this.available.indexOf(this.locale);
      this.locale = this.available[(i + 1) % this.available.length];
      return this.locale;
    },
    /** Traduit une clé "a.b.c" avec repli automatique. */
    t: function (key) {
      return Core.translate(LOCALES[this.locale], LOCALES[this.fallback], key);
    },
    /** Permet de remplacer un dictionnaire (ex. JSON chargé via serveur). */
    load: function (code, dict) {
      LOCALES[code] = dict;
      if (this.available.indexOf(code) === -1) this.available.push(code);
    }
  };

  root.LUMEN.I18n = I18n;
})(typeof self !== 'undefined' ? self : this);
