/* =============================================================================
 * LUMEN — ui.js
 * -----------------------------------------------------------------------------
 * Pilote toute l'interface HORS canvas : écrans (menu, aide, pause, victoire,
 * quitter), barre d'information (HUD) et messages d'aide (toasts). Les libellés
 * proviennent de i18n. Les boutons appellent les méthodes de l'objet `game`
 * fourni via bind(). Toute la mise en forme vit dans css/style.css.
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var I18n = null;

  function $(id) { return document.getElementById(id); }

  function UI(i18n) {
    I18n = i18n;
    this.game = null;
    this.el = {
      screens: {
        menu: $('screen-menu'),
        howto: $('screen-howto'),
        pause: $('screen-pause'),
        win: $('screen-win'),
        quit: $('screen-quit')
      },
      hud: $('hud'),
      hudShards: $('hud-shards'),
      hudTime: $('hud-time'),
      hudDeaths: $('hud-deaths'),
      hudPhase: $('hud-phase'),
      hudFps: $('hud-fps'),
      btnMute: $('btn-mute'),
      btnPause: $('btn-pause'),
      hint: $('hint'),
      menuBest: $('menu-best'),
      winTime: $('win-time'),
      winShards: $('win-shards'),
      winDeaths: $('win-deaths'),
      winRank: $('win-rank')
    };
    this._hintTimer = null;
  }

  UI.prototype.bind = function (game) {
    this.game = game;
    var g = game;
    // menu
    $('btn-play').onclick = function () { g.startGame(0); };
    $('btn-howto').onclick = function () { g.setState('HOWTO'); };
    $('btn-quit').onclick = function () { g.quitGame(); };
    $('btn-lang').onclick = function () { g.cycleLanguage(); };
    // sélection de niveau (boutons 1..N)
    for (var i = 1; i <= 9; i++) {
      (function (idx) {
        var el = $('btn-lvl-' + idx);
        if (el) el.onclick = function () { g.startGame(idx - 1); };
      })(i);
    }
    // howto
    $('btn-howto-back').onclick = function () { g.setState('MENU'); };
    // pause
    $('btn-resume').onclick = function () { g.resume(); };
    $('btn-restart').onclick = function () { g.startGame(g.levelIndex); };
    $('btn-pause-menu').onclick = function () { g.setState('MENU'); };
    // win
    $('btn-replay').onclick = function () { g.startGame(g.levelIndex); };
    $('btn-win-menu').onclick = function () { g.setState('MENU'); };
    var bnext = $('btn-next');
    if (bnext) bnext.onclick = function () { g.nextLevel(); };
    // quit (écran de repli web : retour possible au menu)
    var qm = $('btn-quit-menu');
    if (qm) qm.onclick = function () { g.setState('MENU'); };
    // HUD
    this.el.btnMute.onclick = function () { g.toggleMute(); };
    this.el.btnPause.onclick = function () { g.togglePause(); };
  };

  /** Remplit tous les textes statiques depuis i18n (appelé au changement de langue). */
  UI.prototype.applyTexts = function () {
    var t = function (k) { return I18n.t(k); };
    setText('m-tagline', t('menu.tagline'));
    setText('btn-play', t('menu.play'));
    setText('btn-howto', t('menu.howto'));
    setText('btn-quit', t('menu.quit'));
    setText('m-subtitle', t('menu.subtitle'));
    setText('m-best-label', t('menu.best'));
    setText('btn-lang', I18n.LOCALES[I18n.locale].meta.name);

    setText('h-title', t('howto.title'));
    setText('h-move-k', t('howto.move'));
    setText('h-jump-k', t('howto.jump'));
    setText('h-phase-k', t('howto.phase'));
    setText('h-pause-k', t('howto.pause'));
    setText('h-mute-k', t('howto.mute'));
    setText('h-goal', t('howto.goal'));
    setText('btn-howto-back', t('howto.back'));

    setText('p-title', t('pause.title'));
    setText('btn-resume', t('pause.resume'));
    setText('btn-restart', t('pause.restart'));
    setText('btn-pause-menu', t('pause.menu'));

    setText('w-title', t('win.title'));
    setText('w-subtitle', t('win.subtitle'));
    setText('w-time-label', t('win.time'));
    setText('w-shards-label', t('win.shards'));
    setText('w-deaths-label', t('win.deaths'));
    setText('w-rank-label', t('win.rank'));
    setText('btn-replay', t('win.replay'));
    setText('btn-win-menu', t('win.menu'));

    setText('q-title', t('quit.title'));
    setText('q-body', t('quit.body'));
    setText('btn-quit-menu', t('pause.menu'));

    setText('hud-shards-label', t('hud.shards'));
    setText('hud-time-label', t('hud.time'));
    setText('hud-deaths-label', t('hud.deaths'));
    setText('hud-level-label', t('level.label'));

    setText('m-levels-label', t('level.select'));
    setText('btn-next', t('level.next'));
    setText('win-allcomplete', t('level.allCompleteMsg'));
  };

  /** Affiche un écran (ou 'none' pour l'état de jeu). */
  UI.prototype.show = function (name) {
    var s = this.el.screens;
    Object.keys(s).forEach(function (k) {
      if (s[k]) s[k].classList.toggle('active', k === name);
    });
    var inGame = (name === 'none' || name === 'pause');
    this.el.hud.classList.toggle('visible', inGame);
  };

  UI.prototype.updateHud = function (state) {
    setText('hud-shards', state.collected + ' / ' + state.total);
    setText('hud-time', state.time);
    setText('hud-deaths', String(state.deaths));
    if (state.level) setText('hud-level', state.level + ' / ' + state.levelCount);
    var phaseTxt = state.phase === 'LUMEN' ? I18n.t('hud.lumen') : I18n.t('hud.umbra');
    this.el.hudPhase.textContent = phaseTxt;
    this.el.hudPhase.className = 'pill ' + (state.phase === 'LUMEN' ? 'lumen' : 'umbra');
    setText('hud-fps', state.fps + ' FPS');
  };

  UI.prototype.setBest = function (txt) { setText('menu-best', txt); };

  /** Petit "pop" du compteur d'éclats à la collecte. */
  UI.prototype.popShards = function () {
    var el = $('hud-shards');
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;              // relance l'animation
    el.classList.add('pop');
  };

  UI.prototype.setMuteLabel = function (muted) {
    this.el.btnMute.textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    this.el.btnMute.setAttribute('aria-pressed', String(muted));
  };

  UI.prototype.fillWin = function (state) {
    setText('win-level', state.levelName || '');
    setText('win-time', state.time);
    setText('win-shards', state.collected + ' / ' + state.total);
    setText('win-deaths', String(state.deaths));
    this.el.winRank.textContent = state.rank;
    this.el.winRank.className = 'rank rank-' + state.rank;

    var nextBtn = $('btn-next');
    var allMsg = $('win-allcomplete');
    if (state.isLast) {
      setText('w-title', I18n.t('level.allComplete'));
      if (nextBtn) nextBtn.style.display = 'none';
      if (allMsg) allMsg.style.display = '';
    } else {
      setText('w-title', I18n.t('win.title'));
      if (nextBtn) nextBtn.style.display = '';
      if (allMsg) allMsg.style.display = 'none';
    }
  };

  UI.prototype.showHint = function (key, ms) {
    var el = this.el.hint;
    el.textContent = I18n.t(key);
    el.classList.add('show');
    clearTimeout(this._hintTimer);
    var self = this;
    this._hintTimer = setTimeout(function () { el.classList.remove('show'); }, ms || 2200);
  };

  function setText(id, txt) { var e = $(id); if (e) e.textContent = txt; }

  root.LUMEN.UI = UI;
})(typeof self !== 'undefined' ? self : this);
