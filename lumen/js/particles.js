/* =============================================================================
 * LUMEN — particles.js
 * -----------------------------------------------------------------------------
 * Petit système de particules à pool borné (max 240) pour le "game feel" :
 * sauts, collectes, bascules de phase, morts. Chaque particule a une durée de
 * vie et un fondu. Borné pour garantir un FPS stable (voir docs/METRICS.md).
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var MAX = 240;

  function Particles() { this.list = []; }

  Particles.prototype.emit = function (x, y, opts) {
    opts = opts || {};
    var count = opts.count || 10;
    var speed = opts.speed || 160;
    var color = opts.color || '#ffffff';
    var life = opts.life || 0.6;
    var size = opts.size || 3;
    var spread = opts.spread != null ? opts.spread : Math.PI * 2;
    var dir = opts.dir != null ? opts.dir : 0;
    var gravity = opts.gravity != null ? opts.gravity : 600;

    for (var i = 0; i < count; i++) {
      if (this.list.length >= MAX) this.list.shift();
      var a = dir + (Math.random() - 0.5) * spread;
      var sp = speed * (0.4 + Math.random() * 0.6);
      this.list.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: life * (0.6 + Math.random() * 0.4),
        maxLife: life,
        size: size * (0.6 + Math.random() * 0.8),
        color: color,
        gravity: gravity
      });
    }
  };

  Particles.prototype.update = function (dt) {
    for (var i = this.list.length - 1; i >= 0; i--) {
      var p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  };

  Particles.prototype.draw = function (ctx, cam) {
    ctx.save();
    for (var i = 0; i < this.list.length; i++) {
      var p = this.list[i];
      var alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      var s = p.size * alpha;
      ctx.fillRect(p.x - cam.x - s / 2, p.y - cam.y - s / 2, s, s);
    }
    ctx.restore();
  };

  Particles.prototype.clear = function () { this.list.length = 0; };

  root.LUMEN.Particles = Particles;
})(typeof self !== 'undefined' ? self : this);
