/* =============================================================================
 * LUMEN — core.js
 * -----------------------------------------------------------------------------
 * Cœur logique PUR du jeu : aucune dépendance au DOM, au Canvas ou à l'audio.
 * Toutes les fonctions sont déterministes -> testables sous Node (voir
 * tests/core.test.js). Le jeu (player.js, level.js, game.js) appelle ces
 * fonctions : il n'y a donc qu'UNE seule source de vérité pour la logique,
 * et c'est exactement celle qui est couverte par les tests d'acceptation.
 *
 * Pattern UMD : exporté via module.exports sous Node, et exposé sur
 * window.LUMEN.Core dans le navigateur.
 * ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;                 // Node (tests)
  } else {
    root.LUMEN = root.LUMEN || {};
    root.LUMEN.Core = api;                // Navigateur
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- Constantes de phase ------------------------------------------------ */
  var PHASE = { LUMEN: 'LUMEN', UMBRA: 'UMBRA' };

  /* ---- Utilitaires mathématiques ----------------------------------------- */

  /** Borne une valeur dans l'intervalle [min, max]. */
  function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  /** Interpolation linéaire entre a et b (t dans [0,1], non borné). */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** Rapproche `current` de `target` d'au plus `maxDelta` (jamais de dépassement). */
  function approach(current, target, maxDelta) {
    if (current < target) return Math.min(current + maxDelta, target);
    if (current > target) return Math.max(current - maxDelta, target);
    return target;
  }

  /* ---- Collisions AABB (Axis-Aligned Bounding Box) ------------------------ */

  /**
   * Teste le chevauchement strict de deux rectangles alignés.
   * Les contacts bord-à-bord NE comptent PAS comme chevauchement (< / >),
   * ce qui évite de "coller" sur les plateformes adjacentes.
   */
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  /** Variante objet : a et b sont {x,y,w,h}. */
  function aabb(a, b) {
    return rectsOverlap(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h);
  }

  /* ---- Logique de phase ---------------------------------------------------- */

  /** Renvoie la phase opposée. */
  function togglePhase(phase) {
    return phase === PHASE.LUMEN ? PHASE.UMBRA : PHASE.LUMEN;
  }

  /**
   * Une plateforme est-elle solide dans la phase donnée ?
   *  - phase === null  -> plateforme commune (toujours solide)
   *  - sinon           -> solide uniquement si elle correspond à la phase active
   */
  function platformSolidIn(platform, phase) {
    return platform.phase == null || platform.phase === phase;
  }

  /**
   * Peut-on basculer vers `nextPhase` sans se retrouver coincé DANS une
   * plateforme qui deviendrait solide ? Renvoie false si le basculement
   * provoquerait un chevauchement (corrige le bug "clip en changeant de phase").
   * `player` = {x,y,w,h}, `platforms` = liste de {x,y,w,h,phase}.
   */
  function canTogglePhase(player, platforms, nextPhase) {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (platformSolidIn(p, nextPhase) && aabb(player, p)) {
        return false;
      }
    }
    return true;
  }

  /* ---- Physique du personnage (intégration pas-à-pas) -------------------- */

  /**
   * Met à jour la vitesse horizontale en fonction de l'entrée.
   *  dir : -1 (gauche), 0 (rien), +1 (droite)
   *  Quand dir == 0 on applique la friction ; sinon l'accélération, le tout
   *  borné par maxSpeed. dt en secondes.
   */
  function stepHorizontal(vx, dir, accel, friction, maxSpeed, dt) {
    if (dir !== 0) {
      vx = approach(vx, dir * maxSpeed, accel * dt);
    } else {
      vx = approach(vx, 0, friction * dt);
    }
    return clamp(vx, -maxSpeed, maxSpeed);
  }

  /** Applique la gravité (vitesse de chute bornée à maxFall). dt en secondes. */
  function stepGravity(vy, gravity, maxFall, dt) {
    return Math.min(vy + gravity * dt, maxFall);
  }

  /**
   * Vitesse de saut nécessaire pour atteindre une hauteur `height` sous une
   * gravité `gravity` : v = sqrt(2 * g * h). Renvoie une valeur positive
   * (à appliquer vers le haut, donc négative dans le repère écran).
   */
  function jumpVelocityForHeight(gravity, height) {
    return Math.sqrt(2 * gravity * height);
  }

  /* ---- Score & temps ------------------------------------------------------ */

  /** Pourcentage d'éclats collectés (0–100, arrondi). */
  function shardPercent(collected, total) {
    if (total <= 0) return 0;
    return Math.round((collected / total) * 100);
  }

  /**
   * Note finale (rang) selon temps, morts et éclats.
   * Critères mesurables et documentés (voir docs/METRICS.md).
   *   S : 0 mort, tous les éclats, < 90 s
   *   A : <= 1 mort et >= 80% éclats
   *   B : <= 3 morts
   *   C : sinon
   */
  function computeRank(timeMs, deaths, collected, total) {
    var pct = shardPercent(collected, total);
    if (deaths === 0 && pct === 100 && timeMs < 90000) return 'S';
    if (deaths <= 1 && pct >= 80) return 'A';
    if (deaths <= 3) return 'B';
    return 'C';
  }

  /** Formate une durée (ms) en "M:SS.cc" (centièmes). */
  function formatTime(ms) {
    ms = Math.max(0, Math.floor(ms));
    var m = Math.floor(ms / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var cs = Math.floor((ms % 1000) / 10);
    return m + ':' + String(s).padStart(2, '0') + '.' + String(cs).padStart(2, '0');
  }

  /* ---- Condition de victoire ---------------------------------------------- */

  /** Le niveau est terminé si le joueur a atteint le portail en étant vivant. */
  function isLevelComplete(state) {
    return !!state.reachedGoal && !!state.alive;
  }

  /* ---- Internationalisation (recherche pure, testable) ------------------- */

  /**
   * Recherche une clé "a.b.c" dans un dictionnaire imbriqué, avec repli sur
   * un dictionnaire secondaire, puis sur la clé elle-même si rien n'est trouvé.
   */
  function translate(dict, fallbackDict, key) {
    var v = _lookup(dict, key);
    if (v != null) return v;
    v = _lookup(fallbackDict, key);
    if (v != null) return v;
    return key;
  }

  function _lookup(dict, key) {
    if (!dict) return null;
    var parts = String(key).split('.');
    var cur = dict;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return null;
      cur = cur[parts[i]];
    }
    return (typeof cur === 'string') ? cur : null;
  }

  /* ---- API publique ------------------------------------------------------- */
  return {
    PHASE: PHASE,
    clamp: clamp,
    lerp: lerp,
    approach: approach,
    rectsOverlap: rectsOverlap,
    aabb: aabb,
    togglePhase: togglePhase,
    platformSolidIn: platformSolidIn,
    canTogglePhase: canTogglePhase,
    stepHorizontal: stepHorizontal,
    stepGravity: stepGravity,
    jumpVelocityForHeight: jumpVelocityForHeight,
    shardPercent: shardPercent,
    computeRank: computeRank,
    formatTime: formatTime,
    isLevelComplete: isLevelComplete,
    translate: translate
  };
});
