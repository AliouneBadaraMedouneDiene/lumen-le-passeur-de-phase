/* =============================================================================
 * LUMEN — tests/smoke.test.js
 * -----------------------------------------------------------------------------
 * Test d'INTÉGRATION sans navigateur. Charge TOUS les modules ensemble (vérifie
 * le chaînage des dépendances) puis simule plusieurs secondes de jeu avec un
 * "bot", afin de détecter toute erreur d'exécution dans la boucle physique :
 * collisions, mécanique de phase, plateforme mobile, pics, mort/réapparition.
 * Ne valide PAS la jouabilité fine (faite à la main / en vidéo), mais garantit
 * l'absence de plantage et un comportement cohérent.
 *
 * Exécution :  node tests/smoke.test.js
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

/* ---- Stubs d'environnement navigateur (suffisants pour la logique) ---- */
global.self = global;
global.window = global;
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;

/* ---- Chargement des modules dans l'ordre des dépendances ---- */
const JS = path.join(__dirname, '..', 'js');
global.LUMEN = { Core: require(path.join(JS, 'core.js')) };          // core via require
['i18n', 'audio', 'input', 'particles', 'camera', 'level', 'player', 'ui', 'game', 'main']
  .forEach(function (f) {
    const src = fs.readFileSync(path.join(JS, f + '.js'), 'utf8');
    (0, eval)(src);   // eval global -> la branche UMD "self" attache à global.LUMEN
  });

const L = global.LUMEN;
let pass = 0, fail = 0;
function ok(c, n) { if (c) { pass++; console.log('  \u2713 ' + n); } else { fail++; console.log('  \u2717 ' + n); } }

console.log('\u25B6 Chaînage des modules');
['Core', 'I18n', 'AudioEngine', 'Input', 'Particles', 'Camera', 'Level', 'Player', 'Game', 'UI']
  .forEach(function (k) { ok(typeof L[k] !== 'undefined', 'module ' + k + ' chargé'); });

console.log('\u25B6 Construction et simulation de chaque niveau (sans DOM)');
let crashed = null;
try {
  const fakeInput = (function () {
    let st = { right: true, jump: false, phase: false };
    return {
      _set: function (s) { st = s; },
      down: function (a) { return a === 'right' ? st.right : (a === 'jump' ? st.jump : false); },
      pressed: function (a) { return a === 'jump' ? st.jump : (a === 'phase' ? st.phase : false); },
      axisX: function () { return st.right ? 1 : 0; },
      endFrame: function () {}
    };
  })();

  ok(L.Level.count >= 1, 'registre des niveaux : ' + L.Level.count + ' niveau(x)');

  for (let li = 0; li < L.Level.count; li++) {
    const level = new L.Level(L.I18n, li);
    const cam = new L.Camera(960, 540);
    cam.setBounds(level.data.width, level.data.height);
    const particles = new L.Particles();
    const fakeGame = {
      won: false,
      win() { this.won = true; },
      onDeath(cb) { cb(); },
      onPhaseChanged() {},
      flashHint() {}
    };
    const player = new L.Player(level, null, particles, cam, fakeGame);

    // intégrité des données du niveau
    const d = level.data;
    const dataOk = d.width > 0 && d.height > 0 && d.platforms.length > 0 &&
                   d.goal && level.totalShards >= 0 && isFinite(d.spawn.x) && isFinite(d.spawn.y);
    ok(dataOk, 'niveau ' + (li + 1) + ' (' + L.I18n.t('level.name' + (li + 1)) + ') : données valides');

    // --- Jouabilité géométrique : chaque point clé doit avoir un appui ---
    // Un point (x, y) est "soutenu" s'il existe, sous lui (à <= maxDrop px),
    // une plateforme statique ou l'ENVELOPPE du trajet d'un mover.
    const supports = d.platforms.map(p => ({ x: p.x, y: p.y, w: p.w }));
    d.movers.forEach(m => {
      if (m.axis === 'y') supports.push({ x: m.x, w: m.w, yTop: m.min, yBottom: m.max }); // ascenseur : toute la course
      else supports.push({ x: m.min, y: m.y, w: (m.max - m.min) + m.w });     // horizontal : enveloppe
    });
    function supported(x, y, maxDrop) {
      return supports.some(s => {
        if (x < s.x - 4 || x > s.x + s.w + 4) return false;
        if (s.yTop != null) {  // ascenseur : une position du trajet convient-elle ?
          return y <= s.yBottom + 4 && (s.yTop - y) <= maxDrop;
        }
        return s.y - y >= -4 && s.y - y <= maxDrop;
      });
    }
    let geoOk = true; const geoFails = [];
    if (!supported(d.spawn.x + 14, d.spawn.y + 34, 220)) { geoOk = false; geoFails.push('spawn'); }
    d.checkpoints.forEach((cp, i) => {
      if (!supported(cp.x, cp.y + 16, 220)) { geoOk = false; geoFails.push('checkpoint ' + (i + 1)); }
    });
    if (!supported(d.goal.x + d.goal.w / 2, d.goal.y + d.goal.h, 60)) { geoOk = false; geoFails.push('portail'); }
    d.shards.forEach((s, i) => {
      if (!supported(s.x, s.y, 170)) { geoOk = false; geoFails.push('éclat ' + (i + 1) + ' (' + s.x + ',' + s.y + ')'); }
    });
    ok(geoOk, 'niveau ' + (li + 1) + ' : géométrie jouable (spawn, checkpoints, portail, ' + d.shards.length + ' éclats soutenus)' + (geoOk ? '' : ' — ÉCHECS: ' + geoFails.join(', ')));

    const dt = 1 / 60;
    let lastX = player.x, stuck = 0, maxX = player.x, frame = 0;
    const FRAMES = 60 * 30;
    for (frame = 0; frame < FRAMES && !fakeGame.won; frame++) {
      const grounded = player.grounded;
      if (player.x > lastX + 0.5) { stuck = 0; } else { stuck += dt; }
      lastX = player.x;
      maxX = Math.max(maxX, player.x);
      const doJump = grounded && (frame % 28 === 0);
      const doPhase = stuck > 0.5 && (frame % 9 === 0);
      if (doPhase) stuck = 0;
      fakeInput._set({ right: true, jump: doJump, phase: doPhase });
      level.update(dt);
      player.update(dt, fakeInput);
      if (!isFinite(player.x) || !isFinite(player.y)) throw new Error('position non finie au niveau ' + (li + 1));
    }
    ok(true, 'niveau ' + (li + 1) + ' : ' + frame + ' frames simulées sans exception (x max=' + Math.round(maxX) + ', morts=' + player.deaths + ')');
  }

  /* ---- Portage vertical : un joueur immobile sur l'ascenseur doit être
   * transporté vers le haut sans tomber (niveau 2, mover axis 'y'). ---- */
  {
    const level = new L.Level(L.I18n, 1);
    const cam = new L.Camera(960, 540);
    cam.setBounds(level.data.width, level.data.height);
    const fakeGame = { win() {}, onDeath(cb) { cb(); }, onPhaseChanged() {}, flashHint() {} };
    const player = new L.Player(level, null, new L.Particles(), cam, fakeGame);
    const lift = level.data.movers.find(m => m.axis === 'y');
    ok(!!lift, 'niveau 2 : un ascenseur (mover vertical) est présent');
    // pose le joueur sur l'ascenseur (en bas de course)
    player.x = lift.x + lift.w / 2 - player.w / 2;
    player.y = lift.y - player.h;
    player.vy = 0;
    const idle = { down: () => false, pressed: () => false, axisX: () => 0, endFrame() {} };
    let minY = player.y, fell = false;
    for (let f = 0; f < 60 * 6; f++) {
      level.update(1 / 60);
      player.update(1 / 60, idle);
      minY = Math.min(minY, player.y);
      if (player.y > 700 || !player.alive) { fell = true; break; }
    }
    ok(!fell, 'ascenseur : le joueur ne tombe pas pendant 6 s de trajet');
    ok(minY < 420, 'ascenseur : le joueur est bien porté vers le haut (y min=' + Math.round(minY) + ')');
  }
} catch (e) {
  crashed = e;
  ok(false, 'AUCUNE exception pendant la simulation');
  console.error(e);
}

console.log('\n' + '='.repeat(54));
console.log('  SMOKE : ' + pass + ' réussis, ' + fail + ' échoués');
console.log('='.repeat(54));
process.exit(fail > 0 ? 1 : 0);
