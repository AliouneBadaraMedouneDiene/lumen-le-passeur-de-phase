/* =============================================================================
 * LUMEN — level.js
 * -----------------------------------------------------------------------------
 * Le NIVEAU (un seul, complet, du DÉPART au PORTAIL). Contient :
 *   - les données de level design (plateformes, pics, éclats, plateforme
 *     mobile, points de contrôle, portail) ;
 *   - la mise à jour de la plateforme mobile ;
 *   - les requêtes de collision (plateformes solides selon la phase active) ;
 *   - tout le rendu : fond en parallaxe, plateformes néon (avec "fantômes"
 *     des plateformes inactives), pics, éclats, portail, panneaux.
 *
 * Repère monde en pixels. Couleurs pilotées par la phase (Lumière = cyan,
 * Ombre = magenta). Toutes les ressources visuelles sont dessinées par code
 * (procédurales) -> originales et libres de droits.
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};
  var Core = root.LUMEN.Core;
  var P = Core.PHASE;

  var COLORS = {
    lumen: '#36e3ff',
    umbra: '#ff4fd8',
    common: '#9fb2ff',
    spike: '#ff5a6e',
    shard: '#ffe066',
    goal: '#7CFFB2',
    sign: '#aab6e8'
  };
  root.LUMEN.COLORS = COLORS;

  /* -------------------------------------------------------- Données niveau */
  /* ---------------------------------------- Niveau 1 : « Premiers pas » ----
   * Tutoriel étendu (~4,6k px). Chaque idée est introduite seule, sans piège :
   * déplacement -> saut simple -> révélation de phase -> pont alterné doux ->
   * plateforme mobile -> escalier final. 3 points de contrôle.
   * ------------------------------------------------------------------------ */
  function buildLevelData() {
    return {
      width: 4600,
      height: 860,
      deathY: 840,
      spawn: { x: 90, y: 540 },
      startPhase: P.LUMEN,

      platforms: [
        // -- A : sol de départ (déplacement) --
        { x: 0,    y: 620, w: 760, h: 240, phase: null },
        // -- B : tuile-tutoriel (révéler l'Ombre, sans danger mortel direct) --
        { x: 820,  y: 560, w: 120, h: 26,  phase: P.UMBRA },
        { x: 980,  y: 620, w: 320, h: 240, phase: null },
        // -- C : pratique du saut pur (plateformes communes) --
        { x: 1360, y: 560, w: 120, h: 26,  phase: null },
        { x: 1560, y: 560, w: 120, h: 26,  phase: null },
        { x: 1740, y: 620, w: 300, h: 240, phase: null },   // sol + checkpoint 1
        // -- D : pont à phase alternée (le cœur du jeu, version douce) --
        { x: 2100, y: 560, w: 110, h: 26,  phase: P.UMBRA },
        { x: 2300, y: 560, w: 110, h: 26,  phase: P.LUMEN },
        { x: 2500, y: 560, w: 110, h: 26,  phase: P.UMBRA },
        { x: 2660, y: 620, w: 340, h: 240, phase: null },   // sol + checkpoint 2
        // -- E : sol après la plateforme mobile --
        { x: 3400, y: 620, w: 320, h: 240, phase: null },   // sol + checkpoint 3
        // -- F : escalier final vers le portail --
        { x: 3780, y: 540, w: 120, h: 26,  phase: null },
        { x: 3940, y: 470, w: 120, h: 26,  phase: null },
        { x: 4100, y: 400, w: 120, h: 26,  phase: null },
        { x: 4260, y: 330, w: 220, h: 26,  phase: null }    // sommet (portail)
      ],

      movers: [
        { x: 3060, y: 560, w: 120, h: 26, phase: null,
          axis: 'x', min: 3060, max: 3220, speed: 70, dir: 1, _dx: 0, _dy: 0 }
      ],

      spikes: [
        { x: 760,  y: 720, w: 220, h: 140 },   // fosse tutoriel
        { x: 1300, y: 720, w: 440, h: 140 },   // fosse saut simple
        { x: 2040, y: 720, w: 620, h: 140 },   // fosse du pont alterné
        { x: 3000, y: 720, w: 400, h: 140 }    // fosse de la plateforme mobile
      ],

      shards: [
        { x: 300,  y: 540 }, { x: 520,  y: 500 },
        { x: 880,  y: 500 },
        { x: 1410, y: 500 }, { x: 1610, y: 500 },
        { x: 2155, y: 500 }, { x: 2355, y: 500 }, { x: 2555, y: 500 },
        { x: 3140, y: 500 },
        { x: 3840, y: 480 }, { x: 4000, y: 410 }, { x: 4315, y: 290 }
      ],

      checkpoints: [
        { x: 1800, y: 540 },
        { x: 2720, y: 540 },
        { x: 3460, y: 540 }
      ],

      goal: { x: 4360, y: 246, w: 60, h: 84 },

      signs: [
        { x: 150,  y: 560, key: 'start.go' },
        { x: 4310, y: 220, key: 'start.goal' }
      ]
    };
  }

  /* ------------------------------------------- Niveau 2 : « Cadence » -------
   * Intermédiaire (~5k px). Ponts alternés plus longs, plateforme mobile plus
   * rapide, et nouveauté : un ASCENSEUR (plateforme mobile verticale) qui
   * emmène vers une section en hauteur. Descente puis remontée finale.
   * ------------------------------------------------------------------------ */
  function buildLevelCadence() {
    return {
      width: 5000, height: 860, deathY: 840,
      spawn: { x: 90, y: 540 }, startPhase: P.LUMEN,
      platforms: [
        { x: 0,    y: 620, w: 560, h: 240, phase: null },
        // pont alterné (4 tuiles)
        { x: 620,  y: 560, w: 110, h: 26, phase: P.LUMEN },
        { x: 810,  y: 560, w: 110, h: 26, phase: P.UMBRA },
        { x: 1000, y: 560, w: 110, h: 26, phase: P.LUMEN },
        { x: 1190, y: 560, w: 110, h: 26, phase: P.UMBRA },
        { x: 1360, y: 620, w: 300, h: 240, phase: null },   // sol + checkpoint 1
        { x: 2100, y: 620, w: 280, h: 240, phase: null },   // sol + checkpoint 2
        // plateau en hauteur (desservi par l'ascenseur)
        { x: 2620, y: 400, w: 300, h: 26, phase: null },    // + checkpoint 3
        // pont alterné en hauteur (3 tuiles)
        { x: 2980, y: 400, w: 110, h: 26, phase: P.UMBRA },
        { x: 3170, y: 400, w: 110, h: 26, phase: P.LUMEN },
        { x: 3360, y: 400, w: 110, h: 26, phase: P.UMBRA },
        { x: 3530, y: 400, w: 280, h: 26, phase: null },    // plateau
        // descente
        { x: 3870, y: 470, w: 120, h: 26, phase: null },
        { x: 4030, y: 540, w: 120, h: 26, phase: null },
        { x: 4190, y: 620, w: 300, h: 240, phase: null },   // sol
        // remontée finale
        { x: 4550, y: 540, w: 120, h: 26, phase: null },
        { x: 4710, y: 470, w: 220, h: 26, phase: null }     // plateau final (portail)
      ],
      movers: [
        // plateforme mobile horizontale, plus rapide qu'au niveau 1
        { x: 1720, y: 560, w: 120, h: 26, phase: null,
          axis: 'x', min: 1720, max: 1920, speed: 90, dir: 1, _dx: 0, _dy: 0 },
        // ASCENSEUR : plateforme mobile VERTICALE (nouveauté du niveau 2)
        { x: 2440, y: 560, w: 120, h: 26, phase: null,
          axis: 'y', min: 400, max: 560, speed: 60, dir: -1, _dx: 0, _dy: 0 }
      ],
      spikes: [
        { x: 560,  y: 720, w: 800, h: 140 },   // fosse du pont alterné
        { x: 1660, y: 720, w: 440, h: 140 },   // fosse de la plateforme mobile
        { x: 2380, y: 720, w: 240, h: 140 },   // fosse de l'ascenseur
        { x: 2920, y: 720, w: 610, h: 140 }    // sous le pont en hauteur
      ],
      shards: [
        { x: 300,  y: 540 }, { x: 675,  y: 500 }, { x: 1055, y: 500 },
        { x: 1500, y: 540 }, { x: 1820, y: 500 }, { x: 2200, y: 540 },
        { x: 2495, y: 470 },
        { x: 3035, y: 360 }, { x: 3225, y: 340 }, { x: 3415, y: 360 },
        { x: 4250, y: 560 }, { x: 4770, y: 420 }
      ],
      checkpoints: [
        { x: 1420, y: 540 },
        { x: 2160, y: 540 },
        { x: 2680, y: 360 }
      ],
      goal: { x: 4790, y: 386, w: 60, h: 84 },
      signs: [
        { x: 150,  y: 560, key: 'start.go' },
        { x: 4740, y: 360, key: 'start.goal' }
      ]
    };
  }

  /* ------------------------------------------- Niveau 3 : « Le Vide » -------
   * Le plus exigeant (~5k px). Long pont alterné de 5 tuiles, DEUX plateformes
   * mobiles à synchroniser, un ascenseur plus rapide vers une longue section
   * en hauteur au-dessus du vide, et un dernier pont alterné serré.
   * ------------------------------------------------------------------------ */
  function buildLevelVide() {
    return {
      width: 5000, height: 860, deathY: 840,
      spawn: { x: 90, y: 540 }, startPhase: P.LUMEN,
      platforms: [
        { x: 0,    y: 620, w: 520, h: 240, phase: null },
        // long pont alterné (5 tuiles)
        { x: 580,  y: 560, w: 110, h: 26, phase: P.LUMEN },
        { x: 770,  y: 560, w: 110, h: 26, phase: P.UMBRA },
        { x: 960,  y: 560, w: 110, h: 26, phase: P.LUMEN },
        { x: 1150, y: 560, w: 110, h: 26, phase: P.UMBRA },
        { x: 1340, y: 560, w: 110, h: 26, phase: P.LUMEN },
        { x: 1510, y: 620, w: 280, h: 240, phase: null },   // sol + checkpoint 1
        { x: 2510, y: 620, w: 260, h: 240, phase: null },   // sol + checkpoint 2
        // section en hauteur (desservie par l'ascenseur)
        { x: 3000, y: 380, w: 240, h: 26, phase: null },    // + checkpoint 3
        { x: 3300, y: 380, w: 100, h: 26, phase: P.UMBRA },
        { x: 3480, y: 380, w: 100, h: 26, phase: P.LUMEN },
        { x: 3660, y: 380, w: 100, h: 26, phase: P.UMBRA },
        { x: 3820, y: 380, w: 240, h: 26, phase: null },    // plateau
        // dernier pont alterné serré
        { x: 4120, y: 380, w: 100, h: 26, phase: P.UMBRA },
        { x: 4300, y: 380, w: 100, h: 26, phase: P.LUMEN },
        { x: 4460, y: 380, w: 340, h: 26, phase: null }     // plateau final (portail)
      ],
      movers: [
        // deux plateformes mobiles à synchroniser
        { x: 1850, y: 560, w: 110, h: 26, phase: null,
          axis: 'x', min: 1850, max: 1990, speed: 95, dir: 1, _dx: 0, _dy: 0 },
        { x: 2350, y: 560, w: 110, h: 26, phase: null,
          axis: 'x', min: 2210, max: 2350, speed: 95, dir: -1, _dx: 0, _dy: 0 },
        // ascenseur rapide vers la section haute
        { x: 2830, y: 560, w: 110, h: 26, phase: null,
          axis: 'y', min: 380, max: 560, speed: 75, dir: -1, _dx: 0, _dy: 0 }
      ],
      spikes: [
        { x: 520,  y: 720, w: 990,  h: 140 },  // sous le long pont
        { x: 1790, y: 720, w: 720,  h: 140 },  // sous les deux mobiles
        { x: 2770, y: 720, w: 230,  h: 140 },  // sous l'ascenseur
        { x: 3240, y: 720, w: 1220, h: 140 }   // sous toute la section haute
      ],
      shards: [
        { x: 300,  y: 540 }, { x: 635,  y: 500 }, { x: 1015, y: 500 },
        { x: 1395, y: 500 }, { x: 1620, y: 540 }, { x: 1905, y: 500 },
        { x: 2265, y: 500 }, { x: 2620, y: 540 },
        { x: 3055, y: 340 }, { x: 3530, y: 340 }, { x: 4165, y: 340 },
        { x: 4520, y: 340 }
      ],
      checkpoints: [
        { x: 1570, y: 540 },
        { x: 2570, y: 540 },
        { x: 3060, y: 340 }
      ],
      goal: { x: 4620, y: 296, w: 60, h: 84 },
      signs: [
        { x: 150,  y: 560, key: 'start.go' },
        { x: 4570, y: 300, key: 'start.goal' }
      ]
    };
  }

  // Registre des niveaux (l'ordre définit la progression)
  var LEVELS = [buildLevelData, buildLevelCadence, buildLevelVide];

  /* --------------------------------------------------------------- Classe */
  function Level(i18n, index) {
    this.i18n = i18n;
    this.load(index || 0);
  }
  Level.count = LEVELS.length;
  Level.prototype.load = function (index) {
    this.index = index;
    this.data = LEVELS[index]();
    this.reset();
  };

  Level.prototype.reset = function () {
    var d = this.data;
    this.shards = d.shards.map(function (s) { return { x: s.x, y: s.y, taken: false }; });
    this.totalShards = this.shards.length;
    // remet les movers à leur position d'origine (selon leur axe)
    d.movers.forEach(function (m) {
      if (m.axis === 'y') { m.y = m.max; m.dir = -1; }   // ascenseur : part du bas
      else { m.x = m.min; m.dir = 1; }
      m._dx = 0; m._dy = 0;
    });
  };

  Level.prototype.update = function (dt) {
    // déplacement des plateformes mobiles (axe horizontal OU vertical)
    this.data.movers.forEach(function (m) {
      if (m.axis === 'y') {
        var prevY = m.y;
        m.y += m.dir * m.speed * dt;
        if (m.y <= m.min) { m.y = m.min; m.dir = 1; }
        if (m.y >= m.max) { m.y = m.max; m.dir = -1; }
        m._dy = m.y - prevY;   // delta vertical pour porter le joueur
        m._dx = 0;
      } else {
        var prev = m.x;
        m.x += m.dir * m.speed * dt;
        if (m.x <= m.min) { m.x = m.min; m.dir = 1; }
        if (m.x >= m.max) { m.x = m.max; m.dir = -1; }
        m._dx = m.x - prev;    // delta horizontal pour porter le joueur
        m._dy = 0;
      }
    });
  };

  /** Toutes les plateformes solides dans la phase donnée (statiques + movers). */
  Level.prototype.solidPlatforms = function (phase) {
    var out = [];
    this.data.platforms.forEach(function (p) {
      if (Core.platformSolidIn(p, phase)) out.push(p);
    });
    this.data.movers.forEach(function (m) {
      if (Core.platformSolidIn(m, phase)) out.push(m);
    });
    return out;
  };

  Level.prototype.spikes = function () { return this.data.spikes; };
  Level.prototype.goal = function () { return this.data.goal; };

  /* ------------------------------------------------------------- Rendu fond */
  Level.prototype.drawBackground = function (ctx, cam, phase, time) {
    var w = cam.viewW, h = cam.viewH;
    // dégradé vertical, légèrement teinté par la phase
    var g = ctx.createLinearGradient(0, 0, 0, h);
    if (phase === P.UMBRA) {
      g.addColorStop(0, '#140a1e'); g.addColorStop(1, '#070410');
    } else {
      g.addColorStop(0, '#081226'); g.addColorStop(1, '#04060f');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // grille de points en parallaxe (deux couches)
    this._dotLayer(ctx, cam, 0.25, 64, phase === P.UMBRA ? 'rgba(255,79,216,0.10)' : 'rgba(54,227,255,0.10)');
    this._dotLayer(ctx, cam, 0.5, 110, phase === P.UMBRA ? 'rgba(255,79,216,0.06)' : 'rgba(54,227,255,0.06)');

    // étoiles scintillantes (positions déterministes, très faible parallaxe)
    ctx.save();
    for (var si = 0; si < 42; si++) {
      var sx = ((si * 397 + 83) % 1200) / 1200 * (w + 80) - (cam.x * 0.08) % (w + 80);
      if (sx < -40) sx += w + 80;
      var sy = ((si * 641 + 217) % 900) / 900 * h * 0.75;
      var tw = 0.35 + 0.65 * Math.abs(Math.sin(time * (0.6 + (si % 5) * 0.25) + si));
      ctx.globalAlpha = tw * 0.5;
      ctx.fillStyle = (si % 7 === 0)
        ? (phase === P.UMBRA ? 'rgba(255,170,235,1)' : 'rgba(170,235,255,1)')
        : 'rgba(210,220,255,1)';
      var ss = (si % 9 === 0) ? 2.4 : 1.5;
      ctx.fillRect(sx, sy, ss, ss);
    }
    ctx.restore();

    // motes flottantes
    ctx.save();
    var col = phase === P.UMBRA ? 'rgba(255,150,230,' : 'rgba(150,230,255,';
    for (var i = 0; i < 18; i++) {
      var mx = (i * 211 + (time * 8) % 1000) % w;
      var my = (i * 137 + Math.sin(time * 0.6 + i) * 20 + 270) % h;
      ctx.fillStyle = col + (0.05 + (i % 3) * 0.03) + ')';
      ctx.fillRect(mx, my, 2, 2);
    }
    ctx.restore();
  };

  Level.prototype._dotLayer = function (ctx, cam, factor, gap, color) {
    ctx.save();
    ctx.fillStyle = color;
    var ox = -(cam.x * factor) % gap;
    var oy = -(cam.y * factor) % gap;
    for (var x = ox; x < cam.viewW + gap; x += gap) {
      for (var y = oy; y < cam.viewH + gap; y += gap) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();
  };

  /* --------------------------------------------------------- Rendu niveau */
  Level.prototype.draw = function (ctx, cam, phase, time) {
    var d = this.data;

    // 1) plateformes inactives -> "fantômes" (aide à anticiper)
    d.platforms.concat(d.movers).forEach(function (p) {
      if (p.phase != null && p.phase !== phase) {
        drawGhost(ctx, cam, p, p.phase === P.LUMEN ? COLORS.lumen : COLORS.umbra);
      }
    });

    // 2) pics
    d.spikes.forEach(function (s) { drawSpikes(ctx, cam, s); });

    // 3) plateformes solides (avec lueur néon)
    this.solidPlatforms(phase).forEach(function (p) {
      var c = p.phase == null ? COLORS.common
            : (p.phase === P.LUMEN ? COLORS.lumen : COLORS.umbra);
      drawPlatform(ctx, cam, p, c, p.phase != null);
    });

    // 4) éclats
    this.shards.forEach(function (s) {
      if (!s.taken) drawShard(ctx, cam, s, time);
    });

    // 5) points de contrôle
    d.checkpoints.forEach(function (cp) { drawCheckpoint(ctx, cam, cp, time); });

    // 6) portail de fin
    drawGoal(ctx, cam, d.goal, time);

    // 7) panneaux
    ctx.save();
    ctx.font = '700 22px "Chakra Petch", system-ui, sans-serif';
    ctx.fillStyle = COLORS.sign;
    ctx.textAlign = 'left';
    var self = this;
    d.signs.forEach(function (sg) {
      ctx.fillText(self.i18n.t(sg.key), sg.x - cam.x, sg.y - cam.y);
    });
    ctx.restore();
  };

  /* ----------------------------------------------------- Helpers de dessin */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPlatform(ctx, cam, p, color, glow) {
    var x = p.x - cam.x, y = p.y - cam.y;
    ctx.save();
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
    // corps
    ctx.fillStyle = 'rgba(20,26,48,0.92)';
    rr(ctx, x, y, p.w, p.h, 8); ctx.fill();
    // liseré supérieur lumineux
    ctx.shadowBlur = glow ? 14 : 0;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    rr(ctx, x + 1, y + 1, p.w - 2, p.h - 2, 7); ctx.stroke();
    // bande de surface
    ctx.shadowBlur = 0;
    ctx.fillStyle = color; ctx.globalAlpha = 0.9;
    ctx.fillRect(x + 6, y + 3, p.w - 12, 3);
    ctx.restore();
  }

  function drawGhost(ctx, cam, p, color) {
    var x = p.x - cam.x, y = p.y - cam.y;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    rr(ctx, x, y, p.w, p.h, 8); ctx.stroke();
    ctx.restore();
  }

  function drawSpikes(ctx, cam, s) {
    var x = s.x - cam.x, y = s.y - cam.y;
    ctx.save();
    ctx.fillStyle = COLORS.spike;
    ctx.shadowColor = COLORS.spike; ctx.shadowBlur = 10;
    var tw = 22, n = Math.max(1, Math.floor(s.w / tw));
    for (var i = 0; i < n; i++) {
      var px = x + i * (s.w / n);
      ctx.beginPath();
      ctx.moveTo(px, y + 26);
      ctx.lineTo(px + (s.w / n) / 2, y);
      ctx.lineTo(px + (s.w / n), y + 26);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(120,20,40,0.6)';
    ctx.fillRect(x, y + 24, s.w, s.h - 24);
    ctx.restore();
  }

  function drawShard(ctx, cam, s, time) {
    var x = s.x - cam.x, y = s.y - cam.y + Math.sin(time * 2 + s.x) * 4;
    var r = 9;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 1.5);
    ctx.shadowColor = COLORS.shard; ctx.shadowBlur = 16;
    ctx.fillStyle = COLORS.shard;
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0);
    ctx.lineTo(0, r); ctx.lineTo(-r * 0.7, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff8d0';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.5); ctx.lineTo(r * 0.3, 0);
    ctx.lineTo(0, r * 0.5); ctx.lineTo(-r * 0.3, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawCheckpoint(ctx, cam, cp, time) {
    var x = cp.x - cam.x, y = cp.y - cam.y;
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.strokeStyle = COLORS.goal; ctx.lineWidth = 2;
    ctx.shadowColor = COLORS.goal; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawGoal(ctx, cam, g, time) {
    var cx = g.x - cam.x + g.w / 2;
    var cy = g.y - cam.y + g.h / 2;
    ctx.save();
    // halo
    ctx.shadowColor = COLORS.goal; ctx.shadowBlur = 30;
    // anneaux pulsés
    for (var i = 0; i < 3; i++) {
      var rad = (g.w / 2) - i * 7 + Math.sin(time * 3 + i) * 3;
      ctx.globalAlpha = 0.8 - i * 0.2;
      ctx.strokeStyle = COLORS.goal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, rad * 0.7, rad, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // cœur lumineux
    ctx.globalAlpha = 0.9;
    var grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, g.w / 2);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.4, COLORS.goal);
    grd.addColorStop(1, 'rgba(124,255,178,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.ellipse(cx, cy, g.w / 3, g.h / 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  root.LUMEN.Level = Level;
})(typeof self !== 'undefined' ? self : this);
