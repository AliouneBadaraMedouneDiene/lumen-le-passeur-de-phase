/* =============================================================================
 * LUMEN — input.js
 * -----------------------------------------------------------------------------
 * Gestion clavier. Distingue :
 *   - down(action)        : touche maintenue (déplacement)
 *   - pressed(action)     : front montant consommé une seule fois (saut, phase)
 * Mapping AZERTY + QWERTY + flèches. Empêche le défilement de la page
 * (Espace, flèches) quand le jeu a le focus.
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};

  var MAP = {
    left:  ['ArrowLeft', 'KeyA', 'KeyQ'],
    right: ['ArrowRight', 'KeyD'],
    up:    ['ArrowUp', 'KeyW', 'KeyZ', 'Space'],
    jump:  ['ArrowUp', 'KeyW', 'KeyZ', 'Space'],
    phase: ['ShiftLeft', 'ShiftRight', 'KeyE'],
    pause: ['Escape', 'KeyP'],
    mute:  ['KeyM'],
    confirm: ['Enter', 'Space']
  };

  function Input() {
    this._down = {};       // code -> bool
    this._pressedQueue = {}; // action -> bool (consommable)
    this._virtualDown = {};  // action -> bool (boutons tactiles à l'écran)
    this._codeToActions = {};
    var self = this;

    Object.keys(MAP).forEach(function (action) {
      MAP[action].forEach(function (code) {
        (self._codeToActions[code] = self._codeToActions[code] || []).push(action);
      });
    });

    this._onDown = function (e) {
      if (self._isGameKey(e.code)) e.preventDefault();
      if (!self._down[e.code]) {
        self._down[e.code] = true;
        var actions = self._codeToActions[e.code] || [];
        actions.forEach(function (a) { self._pressedQueue[a] = true; });
      }
    };
    this._onUp = function (e) {
      if (self._isGameKey(e.code)) e.preventDefault();
      self._down[e.code] = false;
    };
    this._onBlur = function () { self._down = {}; }; // évite les touches "collées" si on perd le focus
  }

  Input.prototype._isGameKey = function (code) {
    return !!this._codeToActions[code];
  };

  Input.prototype.attach = function (target) {
    target = target || window;
    target.addEventListener('keydown', this._onDown);
    target.addEventListener('keyup', this._onUp);
    window.addEventListener('blur', this._onBlur);
  };

  /** Touche maintenue (clavier OU bouton tactile). */
  Input.prototype.down = function (action) {
    if (this._virtualDown[action]) return true;
    return (MAP[action] || []).some(function (c) { return this._down[c]; }, this);
  };

  /** Appui d'un bouton tactile à l'écran. */
  Input.prototype.virtualPress = function (action) {
    if (!this._virtualDown[action]) {
      this._virtualDown[action] = true;
      this._pressedQueue[action] = true;
    }
  };

  /** Relâchement d'un bouton tactile. */
  Input.prototype.virtualRelease = function (action) {
    this._virtualDown[action] = false;
  };

  /** Front montant : true une seule fois jusqu'au prochain appui. */
  Input.prototype.pressed = function (action) {
    if (this._pressedQueue[action]) {
      this._pressedQueue[action] = false;
      return true;
    }
    return false;
  };

  /** Axe horizontal : -1, 0 ou +1. */
  Input.prototype.axisX = function () {
    return (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0);
  };

  /** À appeler en fin de frame : purge les fronts non consommés. */
  Input.prototype.endFrame = function () {
    this._pressedQueue = {};
  };

  root.LUMEN.Input = Input;
})(typeof self !== 'undefined' ? self : this);
