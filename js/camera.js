/* =============================================================================
 * LUMEN — camera.js
 * -----------------------------------------------------------------------------
 * Caméra 2D : suit le joueur avec lissage (lerp) et une légère anticipation
 * dans le sens du déplacement. Bornée aux limites du niveau. Gère un
 * tremblement d'écran (screen-shake) déclenché aux impacts (mort, atterrissage).
 * S'appuie sur Core.clamp / Core.lerp (fonctions pures testées).
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var Core = root.LUMEN.Core;

  function Camera(viewW, viewH) {
    this.x = 0; this.y = 0;        // coin haut-gauche en coordonnées monde
    this.viewW = viewW;
    this.viewH = viewH;
    this.shake = 0;
    this.bounds = { w: viewW, h: viewH };
  }

  Camera.prototype.setBounds = function (w, h) { this.bounds = { w: w, h: h }; };

  Camera.prototype.addShake = function (amount) {
    this.shake = Math.min(this.shake + amount, 24);
  };

  Camera.prototype.follow = function (target, dt) {
    // cible centrée, avec anticipation selon la vitesse
    var lookAhead = Core.clamp(target.vx * 0.18, -120, 120);
    var tx = target.x + target.w / 2 - this.viewW / 2 + lookAhead;
    var ty = target.y + target.h / 2 - this.viewH / 2 - 40;

    var k = 1 - Math.pow(0.0008, dt); // lissage indépendant du framerate
    this.x = Core.lerp(this.x, tx, k);
    this.y = Core.lerp(this.y, ty, k);

    // bornage au niveau
    this.x = Core.clamp(this.x, 0, Math.max(0, this.bounds.w - this.viewW));
    this.y = Core.clamp(this.y, 0, Math.max(0, this.bounds.h - this.viewH));

    // amortissement du tremblement
    this.shake *= Math.pow(0.0004, dt);
    if (this.shake < 0.2) this.shake = 0;
  };

  /** Décalage aléatoire courant dû au tremblement (à ajouter au rendu). */
  Camera.prototype.shakeOffset = function () {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shake,
      y: (Math.random() - 0.5) * this.shake
    };
  };

  root.LUMEN.Camera = Camera;
})(typeof self !== 'undefined' ? self : this);
