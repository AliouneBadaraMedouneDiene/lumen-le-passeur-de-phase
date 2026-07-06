/* =============================================================================
 * LUMEN — player.js
 * -----------------------------------------------------------------------------
 * Le PERSONNAGE et toute sa logique de jeu. Points clés ("game feel") :
 *   - physique sous-échantillonnée (sous-pas <= 1/120 s) : aucun tunneling
 *     quel que soit le framerate ;
 *   - collisions AABB résolues axe par axe (X puis Y) via Core ;
 *   - coyote time + jump buffering + saut à hauteur variable ;
 *   - bascule de phase avec garde anti-blocage (Core.canTogglePhase) ;
 *   - portage par la plateforme mobile ;
 *   - collecte d'éclats, pics mortels, points de contrôle, portail de fin.
 * Toute la logique numérique délègue à js/core.js (couvert par les tests).
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var Core = root.LUMEN.Core;
  var P = Core.PHASE;

  // ---- Constantes de gameplay (réglage) ----
  var CFG = {
    W: 28, H: 34,
    GRAVITY: 1700,
    MAX_FALL: 1200,
    MOVE: 360,
    ACCEL: 3200,
    FRICTION: 2600,
    JUMP_HEIGHT: 150,
    COYOTE: 0.09,
    BUFFER: 0.10,
    JUMP_CUT: 0.45,
    SUBSTEP: 1 / 120
  };
  root.LUMEN.PLAYER_CFG = CFG;

  function Player(level, audio, particles, cam, game) {
    this.level = level;
    this.audio = audio;
    this.particles = particles;
    this.cam = cam;
    this.game = game;
    this.w = CFG.W; this.h = CFG.H;
    this.jumpV = Core.jumpVelocityForHeight(CFG.GRAVITY, CFG.JUMP_HEIGHT);
    this.checkpoint = { x: level.data.spawn.x, y: level.data.spawn.y };
    this.trail = [];
    this.respawn(true);
  }

  Player.prototype.respawn = function (full) {
    var sp = full ? this.level.data.spawn : this.checkpoint;
    if (full) this.checkpoint = { x: this.level.data.spawn.x, y: this.level.data.spawn.y };
    this.x = sp.x; this.y = sp.y;
    this.vx = 0; this.vy = 0;
    this.grounded = false;
    this.coyote = 0; this.buffer = 0;
    this.jumping = false; this.jumpCut = false;
    this.facing = 1;
    this.phase = this.level.data.startPhase;
    this.support = null;
    this.alive = true;
    this.reachedGoal = false;
    this.trail.length = 0;
    this.scaleX = 1; this.scaleY = 1;      // squash & stretch (visuel)
    if (this.audio) this.audio.setPhase(this.phase);
    if (full) { this.collected = 0; this.deaths = 0; }
  };

  /* ----------------------------------------------------------- Mise à jour */
  Player.prototype.update = function (dt, input) {
    // 1) Bascule de phase (une fois par frame, sur front montant)
    if (input.pressed('phase')) this._tryTogglePhase();

    // 2) Mémorise l'intention de saut (jump buffering)
    if (input.pressed('jump')) this.buffer = CFG.BUFFER;

    var dir = input.axisX();
    if (dir !== 0) this.facing = dir;
    var holdingJump = input.down('jump');

    // 3) Physique en sous-pas (anti-tunneling)
    this._frameDt = Math.max(dt, 1e-6);   // pour proratiser le portage mover
    var remaining = dt;
    while (remaining > 0) {
      var h = Math.min(CFG.SUBSTEP, remaining);
      this._physicsStep(h, dir, holdingJump);
      if (!this.alive) return;          // mort détectée dans le sous-pas
      remaining -= h;
    }

    // 4) Retour progressif du squash & stretch vers l'échelle neutre
    this.scaleX = Core.approach(this.scaleX, 1, 4.5 * dt);
    this.scaleY = Core.approach(this.scaleY, 1, 4.5 * dt);

    // 5) Trail visuel
    this.trail.unshift({ x: this.x + this.w / 2, y: this.y + this.h / 2 });
    if (this.trail.length > 10) this.trail.pop();
  };

  Player.prototype._physicsStep = function (h, dir, holdingJump) {
    // --- vitesses ---
    this.vx = Core.stepHorizontal(this.vx, dir, CFG.ACCEL, CFG.FRICTION, CFG.MOVE, h);
    this.vy = Core.stepGravity(this.vy, CFG.GRAVITY, CFG.MAX_FALL, h);

    // --- timers ---
    if (this.grounded) this.coyote = CFG.COYOTE; else this.coyote = Math.max(0, this.coyote - h);
    this.buffer = Math.max(0, this.buffer - h);

    // --- déclenchement du saut ---
    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = -this.jumpV;
      this.grounded = false;
      this.coyote = 0; this.buffer = 0;
      this.jumping = true; this.jumpCut = false;
      this.scaleX = 0.78; this.scaleY = 1.24;   // stretch au décollage
      this.audio && this.audio.jump();
      this.particles && this.particles.emit(this.x + this.w / 2, this.y + this.h,
        { count: 12, color: this._tint(), speed: 180, dir: -Math.PI / 2, spread: 1.2, life: 0.4, gravity: 500 });
    }
    // saut à hauteur variable : relâcher tôt coupe l'ascension
    if (this.jumping && !holdingJump && this.vy < 0 && !this.jumpCut) {
      this.vy *= CFG.JUMP_CUT; this.jumpCut = true;
    }
    if (this.vy >= 0) this.jumping = false;

    // --- collisions, axe par axe ---
    var solids = this.level.solidPlatforms(this.phase);

    // portage par la plateforme mobile, proratisé au sous-pas (le delta du
    // mover est calculé PAR FRAME ; on n'en applique ici que la fraction h/dt,
    // sinon le joueur dériverait à N× la vitesse de la plateforme)
    if (this.support) {
      var carry = h / this._frameDt;
      if (this.support._dx) this.x += this.support._dx * carry;
      if (this.support._dy) this.y += this.support._dy * carry;  // ascenseur
    }

    // X
    this.x += this.vx * h;
    this._resolveX(solids);

    // Y
    var prevVy = this.vy;
    this.y += this.vy * h;
    this._resolveY(solids);
    if (this.grounded && prevVy > 600) {
      // atterrissage appuyé : son + poussière + petit shake + squash
      this.scaleX = 1.28; this.scaleY = 0.72;
      this.audio && this.audio.land();
      this.cam && this.cam.addShake(3);
      this.particles && this.particles.emit(this.x + this.w / 2, this.y + this.h,
        { count: 8, color: this._tint(), speed: 120, dir: 0, spread: Math.PI, life: 0.3, gravity: 400 });
    }

    // murs latéraux du niveau
    this.x = Core.clamp(this.x, 0, this.level.data.width - this.w);

    // --- interactions ---
    this._checkShards();
    this._checkCheckpoints();
    if (this._hitSpikes(solids)) { this._die(); return; }
    if (this.y > this.level.data.deathY) { this._die(); return; }
    this._checkGoal();
  };

  Player.prototype._resolveX = function (solids) {
    var r = this._rect();
    for (var i = 0; i < solids.length; i++) {
      var p = solids[i];
      if (Core.aabb(r, p)) {
        if (this.vx > 0) this.x = p.x - this.w;
        else if (this.vx < 0) this.x = p.x + p.w;
        this.vx = 0;
        r = this._rect();
      }
    }
  };

  Player.prototype._resolveY = function (solids) {
    this.grounded = false;
    this.support = null;
    var r = this._rect();
    for (var i = 0; i < solids.length; i++) {
      var p = solids[i];
      if (Core.aabb(r, p)) {
        if (this.vy > 0) {            // chute -> atterrissage sur le dessus
          this.y = p.y - this.h;
          this.vy = 0;
          this.grounded = true;
          this.support = p;
        } else if (this.vy < 0) {     // montée -> choc plafond
          this.y = p.y + p.h;
          this.vy = 0;
        }
        r = this._rect();
      }
    }
  };

  /* --------------------------------------------------------- Bascule phase */
  Player.prototype._tryTogglePhase = function () {
    var next = Core.togglePhase(this.phase);
    var targets = this.level.solidPlatforms(next);
    if (Core.canTogglePhase(this._rect(), targets, next)) {
      this.phase = next;
      this.support = null;            // forcera une nouvelle détection de sol
      this.audio && this.audio.phase();
      this.audio && this.audio.setPhase(next);
      this.cam && this.cam.addShake(2);
      this.particles && this.particles.emit(this.x + this.w / 2, this.y + this.h / 2,
        { count: 18, color: this._tint(), speed: 220, life: 0.5, gravity: 0, spread: Math.PI * 2 });
      this.game && this.game.onPhaseChanged && this.game.onPhaseChanged(next);
    } else {
      this.audio && this.audio.blocked();
      this.game && this.game.flashHint && this.game.flashHint('hint.blocked');
    }
  };

  /* ------------------------------------------------------------- Interactions */
  Player.prototype._checkShards = function () {
    var r = this._rect();
    var list = this.level.shards;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s.taken) continue;
      if (Core.rectsOverlap(r.x, r.y, r.w, r.h, s.x - 10, s.y - 10, 20, 20)) {
        s.taken = true;
        this.collected++;
        this.audio && this.audio.collect();
        this.game && this.game.onShard && this.game.onShard();
        this.particles && this.particles.emit(s.x, s.y,
          { count: 14, color: '#ffe066', speed: 200, life: 0.5, gravity: 200, spread: Math.PI * 2 });
      }
    }
  };

  Player.prototype._checkCheckpoints = function () {
    var r = this._rect();
    var cps = this.level.data.checkpoints;
    for (var i = 0; i < cps.length; i++) {
      var cp = cps[i];
      if (Core.rectsOverlap(r.x, r.y, r.w, r.h, cp.x - 16, cp.y - 16, 32, 32)) {
        if (this.checkpoint.x !== cp.x || this.checkpoint.y !== cp.y) {
          this.checkpoint = { x: cp.x, y: cp.y };
          this.game && this.game.flashHint && this.game.flashHint('hint.checkpoint');
        }
      }
    }
  };

  Player.prototype._hitSpikes = function () {
    var r = this._rect();
    var sp = this.level.spikes();
    for (var i = 0; i < sp.length; i++) {
      var s = sp[i];
      if (Core.rectsOverlap(r.x, r.y, r.w, r.h, s.x, s.y, s.w, s.h)) return true;
    }
    return false;
  };

  Player.prototype._checkGoal = function () {
    var g = this.level.goal();
    if (Core.aabb(this._rect(), g)) {
      this.reachedGoal = true;
      this.game && this.game.win && this.game.win();
    }
  };

  Player.prototype._die = function () {
    if (!this.alive) return;
    this.alive = false;
    this.deaths++;
    this.audio && this.audio.death();
    this.cam && this.cam.addShake(14);
    this.particles && this.particles.emit(this.x + this.w / 2, this.y + this.h / 2,
      { count: 30, color: this._tint(), speed: 280, life: 0.7, gravity: 300, spread: Math.PI * 2 });
    var self = this;
    // courte pause avant réapparition (gérée par game via flag)
    this.game && this.game.onDeath && this.game.onDeath(function () { self.respawn(false); });
  };

  /* ------------------------------------------------------------- Utilitaires */
  Player.prototype._rect = function () { return { x: this.x, y: this.y, w: this.w, h: this.h }; };
  Player.prototype._tint = function () {
    return this.phase === P.LUMEN ? root.LUMEN.COLORS.lumen : root.LUMEN.COLORS.umbra;
  };

  /* ------------------------------------------------------------------ Rendu */
  Player.prototype.draw = function (ctx, cam, time) {
    var tint = this._tint();
    // trail
    ctx.save();
    for (var i = this.trail.length - 1; i >= 0; i--) {
      var t = this.trail[i];
      var a = (1 - i / this.trail.length) * 0.35;
      ctx.globalAlpha = a;
      ctx.fillStyle = tint;
      var s = (1 - i / this.trail.length) * this.w * 0.7;
      ctx.beginPath();
      ctx.arc(t.x - cam.x, t.y - cam.y, s / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    var cx = this.x - cam.x + this.w / 2;
    var cy = this.y - cam.y + this.h / 2;

    ctx.save();
    // squash & stretch : échelle locale ancrée sur les pieds
    ctx.translate(cx, cy + this.h / 2);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-cx, -(cy + this.h / 2));
    // halo
    ctx.shadowColor = tint; ctx.shadowBlur = 24;
    // corps (losange arrondi lumineux)
    var grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, this.w);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.5, tint);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, this.w * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // noyau
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // petit "regard" directionnel
    ctx.fillStyle = 'rgba(10,12,30,0.9)';
    ctx.beginPath();
    ctx.arc(cx + this.facing * 5, cy - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  root.LUMEN.Player = Player;
})(typeof self !== 'undefined' ? self : this);
