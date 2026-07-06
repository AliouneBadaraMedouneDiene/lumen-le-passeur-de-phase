/* =============================================================================
 * LUMEN — game.js
 * -----------------------------------------------------------------------------
 * Chef d'orchestre. Tient la MACHINE À ÉTATS (MENU, HOWTO, PLAYING, PAUSE, WIN,
 * QUIT), la BOUCLE de jeu (requestAnimationFrame, dt borné), le RENDU du monde,
 * la mise à jour du HUD et les callbacks appelés par le joueur (victoire, mort,
 * changement de phase, messages d'aide).
 * Le "début" = menu -> lancement ; la "fin" = portail -> écran de victoire.
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var Core = root.LUMEN.Core;

  var STATE = { MENU: 'MENU', HOWTO: 'HOWTO', PLAYING: 'PLAYING', PAUSE: 'PAUSE', WIN: 'WIN', QUIT: 'QUIT' };
  var VIEW_W = 960, VIEW_H = 540;

  function Game(canvas, deps) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.i18n = deps.i18n;
    this.input = deps.input;
    this.audio = deps.audio;
    this.ui = deps.ui;

    this.particles = new root.LUMEN.Particles();
    this.camera = new root.LUMEN.Camera(VIEW_W, VIEW_H);
    this.level = new root.LUMEN.Level(this.i18n, 0);
    this.levelIndex = 0;
    this.camera.setBounds(this.level.data.width, this.level.data.height);
    this.player = new root.LUMEN.Player(this.level, this.audio, this.particles, this.camera, this);

    this.state = STATE.MENU;
    this.time = 0;            // chrono du run (ms)
    this.best = [];           // meilleurs temps PAR NIVEAU (ms) — session
    this.lastTs = 0;
    this.fps = 60; this._fpsAcc = 0; this._fpsCnt = 0; this._fpsT = 0;

    this._freeze = 0;         // pause à la mort (s)
    this._respawnFn = null;
    this._waves = [];         // ondes de choc (bascule de phase)
    this._phaseFlash = 0;     // flash plein écran (s restantes)
  }

  /* ----------------------------------------------------------- États */
  Game.prototype.setState = function (name) {
    this.state = name;
    if (name === STATE.MENU) {
      this.audio.stopMusic();
      this.levelIndex = 0;
      this.level.load(0);
      this.camera.setBounds(this.level.data.width, this.level.data.height);
      this.player.respawn(true);
      this.camera.x = 0; this.camera.y = 0;
      this.ui.show('menu');
      this.ui.setBest(this._bestLabel());
    } else if (name === STATE.HOWTO) {
      this.ui.show('howto');
    } else if (name === STATE.PAUSE) {
      this.ui.show('pause');
    } else if (name === STATE.WIN) {
      this.ui.show('win');
    } else if (name === STATE.QUIT) {
      this.ui.show('quit');
    } else {
      this.ui.show('none');
    }
  };

  Game.prototype.startGame = function (index) {
    if (typeof index !== 'number') index = 0;
    this.levelIndex = index;
    this.audio.ensure();
    this.level.load(index);
    this.camera.setBounds(this.level.data.width, this.level.data.height);
    this.player.respawn(true);
    this.camera.x = Core.clamp(this.player.x - VIEW_W / 2, 0, this.level.data.width - VIEW_W);
    this.camera.y = 0;
    this.time = 0;
    this._freeze = 0; this._respawnFn = null;
    this.state = STATE.PLAYING;
    this.ui.show('none');
    this.audio.startMusic();
    this.ui.showHint(index === 0 ? 'hint.move' : 'hint.phase', 2600);
  };

  Game.prototype.nextLevel = function () {
    if (this.levelIndex + 1 < root.LUMEN.Level.count) this.startGame(this.levelIndex + 1);
    else this.setState(STATE.MENU);
  };

  Game.prototype.togglePause = function () {
    if (this.state === STATE.PLAYING) this.setState(STATE.PAUSE);
    else if (this.state === STATE.PAUSE) this.resume();
  };
  Game.prototype.resume = function () {
    if (this.state === STATE.PAUSE) { this.state = STATE.PLAYING; this.ui.show('none'); }
  };

  Game.prototype.quitGame = function () {
    this.audio.stopMusic();
    this.setState(STATE.QUIT);
    // En contexte navigateur, window.close() ne fonctionne que pour les fenêtres
    // ouvertes par script ; on tente puis on affiche un écran de repli (documenté
    // comme limite de plateforme ; un portage Windows fermerait réellement le jeu).
    try { window.close(); } catch (e) {}
  };

  Game.prototype.toggleMute = function () {
    var m = this.audio.toggleMute();
    this.ui.setMuteLabel(m);
  };

  Game.prototype.cycleLanguage = function () {
    this.i18n.next();
    this.ui.applyTexts();
    this.ui.setBest(this._bestLabel());
  };

  /** Formate les meilleurs temps par niveau : « N1 0:45.20 · N2 — · N3 — ». */
  Game.prototype._bestLabel = function () {
    var out = [];
    for (var i = 0; i < root.LUMEN.Level.count; i++) {
      out.push('N' + (i + 1) + ' ' + (this.best[i] == null ? '—' : Core.formatTime(this.best[i])));
    }
    return out.join('  ·  ');
  };

  /* ------------------------------------------------- Callbacks du joueur */
  Game.prototype.win = function () {
    if (this.state === STATE.WIN) return;
    var rank = Core.computeRank(this.time, this.player.deaths, this.player.collected, this.level.totalShards);
    var li = this.levelIndex;
    if (this.best[li] == null || this.time < this.best[li]) this.best[li] = this.time;
    this.audio.win();
    this.ui.fillWin({
      levelName: this.i18n.t('level.name' + (li + 1)),
      isLast: (li + 1 >= root.LUMEN.Level.count),
      time: Core.formatTime(this.time),
      collected: this.player.collected,
      total: this.level.totalShards,
      deaths: this.player.deaths,
      rank: rank
    });
    this.setState(STATE.WIN);
  };

  Game.prototype.onShard = function () {
    this.ui.popShards && this.ui.popShards();
  };

  Game.prototype.onDeath = function (respawnFn) {
    this._freeze = 0.55;
    this._respawnFn = respawnFn;
    // retour haptique discret sur mobile (si supporté)
    try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
  };

  Game.prototype.onPhaseChanged = function (/* phase */) {
    // onde de choc centrée sur le joueur + bref flash plein écran
    this._waves.push({ x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h / 2, age: 0 });
    if (this._waves.length > 6) this._waves.shift();
    this._phaseFlash = 0.12;
  };

  Game.prototype.flashHint = function (key) { this.ui.showHint(key, 1800); };

  /* ----------------------------------------------------------- Boucle */
  Game.prototype.start = function () {
    var self = this;
    this.setState(STATE.MENU);
    requestAnimationFrame(function loop(ts) {
      self._frame(ts);
      requestAnimationFrame(loop);
    });
  };

  Game.prototype._frame = function (ts) {
    var dt = this.lastTs ? (ts - this.lastTs) / 1000 : 0;
    this.lastTs = ts;
    if (dt > 1 / 30) dt = 1 / 30;     // borne anti-"spirale" (onglet en arrière-plan)

    // FPS lissé
    this._fpsT += dt; this._fpsCnt++;
    if (this._fpsT >= 0.5) {
      this.fps = Math.round(this._fpsCnt / this._fpsT);
      this._fpsT = 0; this._fpsCnt = 0;
    }

    // entrées globales
    if (this.input.pressed('pause')) {
      if (this.state === STATE.PLAYING || this.state === STATE.PAUSE) this.togglePause();
    }
    if (this.input.pressed('mute')) this.toggleMute();

    this._update(dt);
    this._render();
    this.input.endFrame();
  };

  Game.prototype._update = function (dt) {
    // Le monde n'évolue qu'en jeu
    if (this.state === STATE.PLAYING) {
      if (this._freeze > 0) {
        // courte pause à la mort : la scène vit (particules) mais pas le joueur
        this._freeze -= dt;
        if (this._freeze <= 0 && this._respawnFn) {
          this._respawnFn(); this._respawnFn = null;
        }
      } else {
        this.time += dt * 1000;
        this.level.update(dt);
        this.player.update(dt, this.input);
      }
      this.particles.update(dt);
      this.camera.follow(this.player, dt);

      // ondes de choc + flash de phase
      for (var i = this._waves.length - 1; i >= 0; i--) {
        this._waves[i].age += dt;
        if (this._waves[i].age > 0.5) this._waves.splice(i, 1);
      }
      if (this._phaseFlash > 0) this._phaseFlash -= dt;

      this.ui.updateHud({
        collected: this.player.collected,
        total: this.level.totalShards,
        time: Core.formatTime(this.time),
        deaths: this.player.deaths,
        phase: this.player.phase,
        fps: this.fps,
        level: this.levelIndex + 1,
        levelCount: root.LUMEN.Level.count
      });
    } else {
      // états hors-jeu : on laisse vivre les particules et une caméra douce
      this.particles.update(dt);
      this.camera.follow(this.player, dt);
    }
  };

  Game.prototype._render = function () {
    var ctx = this.ctx;
    var time = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    var phase = this.player.phase;

    // tremblement d'écran
    var sh = this.camera.shakeOffset();
    ctx.setTransform(1, 0, 0, 1, Math.round(sh.x), Math.round(sh.y));

    this.level.drawBackground(ctx, this.camera, phase, time);
    this.level.draw(ctx, this.camera, phase, time);
    this.particles.draw(ctx, this.camera);

    // ondes de choc de bascule (anneaux expansifs)
    if (this._waves.length) {
      var tint = phase === 'LUMEN' ? root.LUMEN.COLORS.lumen : root.LUMEN.COLORS.umbra;
      ctx.save();
      for (var i = 0; i < this._waves.length; i++) {
        var wv = this._waves[i];
        var k = wv.age / 0.5;                       // 0 -> 1
        ctx.globalAlpha = (1 - k) * 0.55;
        ctx.strokeStyle = tint;
        ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.beginPath();
        ctx.arc(wv.x - this.camera.x, wv.y - this.camera.y, 10 + k * 130, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (this.player.alive) this.player.draw(ctx, this.camera, time);

    // flash plein écran très bref à la bascule
    if (this._phaseFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (this._phaseFlash / 0.12) * 0.14;
      ctx.fillStyle = phase === 'LUMEN' ? root.LUMEN.COLORS.lumen : root.LUMEN.COLORS.umbra;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.restore();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  root.LUMEN.Game = Game;
  root.LUMEN.STATE = STATE;
  root.LUMEN.VIEW = { W: VIEW_W, H: VIEW_H };
})(typeof self !== 'undefined' ? self : this);
