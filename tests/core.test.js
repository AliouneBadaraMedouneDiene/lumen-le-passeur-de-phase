/* =============================================================================
 * LUMEN — tests/core.test.js
 * -----------------------------------------------------------------------------
 * Tests d'acceptation AUTOMATISÉS de la logique pure (js/core.js).
 * Exécution :  node tests/core.test.js
 * Aucune dépendance externe (zéro npm install) : runner d'assertions maison.
 * Sortie : liste verte/rouge + code de sortie 1 si un test échoue (CI-friendly).
 *
 * Chaque bloc référence l'exigence couverte (voir docs/TEST-PLAN.md).
 * ========================================================================== */
'use strict';

var C = require('../js/core.js');

var passed = 0, failed = 0;
var failures = [];

function ok(cond, name) {
  if (cond) { passed++; console.log('  \u2713 ' + name); }
  else { failed++; failures.push(name); console.log('  \u2717 ' + name); }
}
function eq(a, b, name) { ok(a === b, name + '  (attendu ' + JSON.stringify(b) + ', obtenu ' + JSON.stringify(a) + ')'); }
function near(a, b, eps, name) { ok(Math.abs(a - b) <= eps, name + '  (~' + b + ', obtenu ' + a + ')'); }
function group(t) { console.log('\n\u25B6 ' + t); }

/* ------------------------------------------------------------------ Maths */
group('Utilitaires mathématiques');
eq(C.clamp(5, 0, 10), 5, 'clamp dans l\'intervalle');
eq(C.clamp(-3, 0, 10), 0, 'clamp borne basse');
eq(C.clamp(42, 0, 10), 10, 'clamp borne haute');
eq(C.lerp(0, 100, 0.5), 50, 'lerp milieu');
eq(C.lerp(10, 20, 0), 10, 'lerp t=0');
eq(C.approach(0, 10, 3), 3, 'approach monte sans dépasser');
eq(C.approach(0, 2, 5), 2, 'approach n\'overshoot pas');
eq(C.approach(10, 0, 4), 6, 'approach descend');

/* -------------------------------------------------------------- Collisions */
group('Collisions AABB (exigence : plateformes & hasards)');
ok(C.rectsOverlap(0, 0, 10, 10, 5, 5, 10, 10), 'rectangles qui se chevauchent');
ok(!C.rectsOverlap(0, 0, 10, 10, 20, 20, 5, 5), 'rectangles éloignés');
ok(!C.rectsOverlap(0, 0, 10, 10, 10, 0, 10, 10), 'contact bord-à-bord = pas de chevauchement');
ok(C.aabb({ x: 0, y: 0, w: 4, h: 4 }, { x: 2, y: 2, w: 4, h: 4 }), 'aabb objets');

/* ------------------------------------------------------------------- Phase */
group('Mécanique de phase (exigence : mécanique cœur du jeu)');
eq(C.togglePhase(C.PHASE.LUMEN), C.PHASE.UMBRA, 'bascule LUMEN -> UMBRA');
eq(C.togglePhase(C.PHASE.UMBRA), C.PHASE.LUMEN, 'bascule UMBRA -> LUMEN');
ok(C.platformSolidIn({ phase: null }, C.PHASE.LUMEN), 'plateforme commune solide partout');
ok(C.platformSolidIn({ phase: 'LUMEN' }, C.PHASE.LUMEN), 'plateforme LUMEN solide en LUMEN');
ok(!C.platformSolidIn({ phase: 'LUMEN' }, C.PHASE.UMBRA), 'plateforme LUMEN intangible en UMBRA');

(function () {
  var player = { x: 100, y: 100, w: 20, h: 20 };
  var plats = [{ x: 90, y: 90, w: 60, h: 60, phase: 'UMBRA' }]; // recouvre le joueur
  ok(!C.canTogglePhase(player, plats, 'UMBRA'), 'bascule REFUSÉE si on se retrouve coincé (anti-clip)');
  var plats2 = [{ x: 400, y: 400, w: 60, h: 60, phase: 'UMBRA' }]; // loin
  ok(C.canTogglePhase(player, plats2, 'UMBRA'), 'bascule AUTORISÉE si dégagé');
})();

/* ---------------------------------------------------------------- Physique */
group('Physique du personnage (exigence : prototype jouable codé)');
near(C.stepHorizontal(0, 1, 4000, 3000, 320, 0.016), 64, 0.001, 'accélération horizontale');
near(C.stepHorizontal(320, 0, 4000, 3000, 320, 0.016), 272, 0.001, 'friction quand aucune entrée');
eq(C.stepHorizontal(1000, 1, 4000, 3000, 320, 0.016), 320, 'vitesse bornée à maxSpeed');
near(C.stepGravity(0, 2400, 1500, 0.016), 38.4, 0.001, 'gravité accumulée');
eq(C.stepGravity(2000, 2400, 1500, 0.5), 1500, 'chute bornée (vitesse terminale)');
near(C.jumpVelocityForHeight(2400, 150), 848.5, 0.5, 'v de saut pour 150px de haut');

/* ---------------------------------------------------------- Score & temps */
group('Score, rang et chronomètre (exigence : HUD & métriques)');
eq(C.shardPercent(5, 10), 50, 'pourcentage éclats');
eq(C.shardPercent(0, 0), 0, 'pourcentage sans éclats (pas de division par 0)');
eq(C.computeRank(60000, 0, 10, 10), 'S', 'rang S (sans faute & rapide)');
eq(C.computeRank(120000, 1, 8, 10), 'A', 'rang A');
eq(C.computeRank(200000, 3, 4, 10), 'B', 'rang B');
eq(C.computeRank(200000, 9, 0, 10), 'C', 'rang C');
eq(C.formatTime(0), '0:00.00', 'chrono à zéro');
eq(C.formatTime(65432), '1:05.43', 'chrono 1:05.43');
eq(C.formatTime(-50), '0:00.00', 'chrono négatif borné');

/* --------------------------------------------------------------- Victoire */
group('Condition de victoire (exigence : début & fin identifiables)');
ok(C.isLevelComplete({ reachedGoal: true, alive: true }), 'niveau terminé si portail atteint vivant');
ok(!C.isLevelComplete({ reachedGoal: false, alive: true }), 'pas terminé sans portail');
ok(!C.isLevelComplete({ reachedGoal: true, alive: false }), 'pas terminé si mort sur le portail');

/* ----------------------------------------------------------------- i18n */
group('Localisation (exigence : fichiers de localisation FR/EN)');
var fr = { menu: { play: 'Jouer' } };
var en = { menu: { play: 'Play', quit: 'Quit' } };
eq(C.translate(fr, en, 'menu.play'), 'Jouer', 'clé trouvée en FR');
eq(C.translate(fr, en, 'menu.quit'), 'Quit', 'repli sur EN si absente en FR');
eq(C.translate(fr, en, 'menu.unknown'), 'menu.unknown', 'repli sur la clé si introuvable');

/* ------------------------------------------------------------------ Bilan */
console.log('\n' + '='.repeat(54));
console.log('  RÉSULTAT : ' + passed + ' réussis, ' + failed + ' échoués (' +
            C.shardPercent(passed, passed + failed) + '% de réussite)');
console.log('='.repeat(54));
if (failed > 0) {
  console.log('\nÉchecs :');
  failures.forEach(function (f) { console.log('  - ' + f); });
  process.exit(1);
}
process.exit(0);
