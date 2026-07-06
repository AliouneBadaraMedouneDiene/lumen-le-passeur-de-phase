/* =============================================================================
 * LUMEN — main.js
 * -----------------------------------------------------------------------------
 * Point d'entrée. Attend le DOM, instancie les modules (i18n, input, audio, UI,
 * game), applique les textes localisés, branche le clavier et lance la boucle.
 * ========================================================================== */
(function (root) {
  'use strict';
  var L = root.LUMEN;

  function boot() {
    var canvas = document.getElementById('game');
    canvas.width = L.VIEW.W;
    canvas.height = L.VIEW.H;

    var i18n = L.I18n;
    var input = new L.Input();
    var audio = new L.AudioEngine();
    var ui = new L.UI(i18n);

    var game = new L.Game(canvas, { i18n: i18n, input: input, audio: audio, ui: ui });

    ui.bind(game);
    ui.applyTexts();
    ui.setMuteLabel(false);

    input.attach(window);

    // Contrôles tactiles : visibles seulement sur écran tactile, branchés sur
    // les entrées virtuelles (mêmes chemins de code que le clavier).
    var touchWrap = document.getElementById('touch');
    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (touchWrap && isTouch) {
      touchWrap.classList.add('enabled');
      [['t-left', 'left'], ['t-right', 'right'], ['t-jump', 'jump'], ['t-phase', 'phase']]
        .forEach(function (pair) {
          var el = document.getElementById(pair[0]);
          if (!el) return;
          var press = function (e) { e.preventDefault(); audio.ensure(); input.virtualPress(pair[1]); };
          var release = function (e) { e.preventDefault(); input.virtualRelease(pair[1]); };
          el.addEventListener('pointerdown', press);
          el.addEventListener('pointerup', release);
          el.addEventListener('pointercancel', release);
          el.addEventListener('pointerleave', release);
          el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        });
    }

    // Premier geste utilisateur -> autorise/relance le contexte audio
    var unlock = function () { audio.ensure(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);

    game.start();

    // Auto-pause si l'onglet passe en arrière-plan (confort + équité du chrono)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && game.state === 'PLAYING') game.setState('PAUSE');
    });

    // Expose pour le débogage manuel
    root.LUMEN.game = game;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof self !== 'undefined' ? self : this);
