/* =============================================================================
 * LUMEN — audio.js
 * -----------------------------------------------------------------------------
 * Audio 100% SYNTHÉTISÉ via la Web Audio API : aucun fichier son externe,
 * donc des ressources entièrement ORIGINALES et libres de droits.
 *  - Musique : boucle d'arpège pentatonique + nappe de basse (ordonnanceur
 *    "look-ahead", le motif d'accords évolue selon la phase active).
 *  - Effets : saut, collecte, bascule de phase, mort, atterrissage, victoire,
 *    bascule refusée.
 * La politique d'autoplay des navigateurs impose un geste utilisateur :
 * ensure() (re)démarre le contexte au premier clic/touche.
 * ========================================================================== */
(function (root) {
  'use strict';
  root.LUMEN = root.LUMEN || {};

  function AudioEngine() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.started = false;

    // Ordonnanceur musical
    this._timer = null;
    this._nextNote = 0;     // temps (s) de la prochaine note
    this._step = 0;         // index de pas dans la séquence
    this._tempo = 96;       // BPM
    this._phase = 'LUMEN';  // influence la couleur harmonique
  }

  AudioEngine.prototype.ensure = function () {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;                 // navigateur sans Web Audio : jeu jouable, sans son
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.0;       // fondu d'entrée au démarrage
      this.musicGain.connect(this.master);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.master);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  };

  AudioEngine.prototype.setPhase = function (phase) { this._phase = phase; };

  /* ----------------------------------------------------------- Musique */
  AudioEngine.prototype.startMusic = function () {
    if (!this.ensure() || this.started) return;
    this.started = true;
    this._nextNote = this.ctx.currentTime + 0.08;
    this._step = 0;
    var self = this;
    // fondu d'entrée
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.musicGain.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.22, this.ctx.currentTime + 2.0);
    this._timer = setInterval(function () { self._scheduler(); }, 25);
  };

  AudioEngine.prototype.stopMusic = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.started = false;
  };

  // Gammes pentatoniques (demi-tons relatifs) — ambiance différente par phase
  var SCALE_LUMEN = [0, 2, 4, 7, 9];   // majeure pentatonique : lumineux
  var SCALE_UMBRA = [0, 3, 5, 7, 10];  // mineure pentatonique : mystérieux
  var ROOT = 220;                       // La3

  AudioEngine.prototype._scheduler = function () {
    if (!this.ctx) return;
    var secPerStep = (60 / this._tempo) / 2; // doubles-croches -> croches
    while (this._nextNote < this.ctx.currentTime + 0.1) {
      this._playStep(this._step, this._nextNote);
      this._nextNote += secPerStep;
      this._step = (this._step + 1) % 16;
    }
  };

  AudioEngine.prototype._midiToFreq = function (semi) {
    return ROOT * Math.pow(2, semi / 12);
  };

  AudioEngine.prototype._playStep = function (step, when) {
    var scale = this._phase === 'UMBRA' ? SCALE_UMBRA : SCALE_LUMEN;

    // Arpège : monte/descend dans la gamme sur 2 octaves
    var pattern = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 2, 1, 3, 2, 0];
    var degree = pattern[step % pattern.length];
    var oct = (step % 8 < 4) ? 0 : 12;
    this._blip(this._midiToFreq(scale[degree] + 12 + oct), when, 0.16, 0.05, 'triangle');

    // Basse sur les temps forts
    if (step % 4 === 0) {
      var bassDeg = (step % 8 === 0) ? 0 : 3;
      this._blip(this._midiToFreq(scale[bassDeg % scale.length] - 12), when, 0.5, 0.12, 'sine');
    }
    // Petit grésillement rythmique discret
    if (step % 8 === 4) this._hat(when, 0.03);
  };

  AudioEngine.prototype._blip = function (freq, when, dur, gain, type) {
    var o = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(this.musicGain);
    o.start(when); o.stop(when + dur + 0.02);
  };

  AudioEngine.prototype._hat = function (when, gain) {
    var buf = this._noiseBuffer();
    var src = this.ctx.createBufferSource();
    src.buffer = buf;
    var hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    var g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    src.connect(hp); hp.connect(g); g.connect(this.musicGain);
    src.start(when); src.stop(when + 0.06);
  };

  AudioEngine.prototype._noiseBuffer = function () {
    if (this._nb) return this._nb;
    var n = this.ctx.sampleRate * 0.2;
    var buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this._nb = buf;
    return buf;
  };

  /* -------------------------------------------------------------- SFX */
  // Bip enveloppé générique (réglable) pour les effets mélodiques
  AudioEngine.prototype._sfxTone = function (f0, f1, dur, type, gain) {
    if (!this.ensure()) return;
    var t = this.ctx.currentTime;
    var o = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  };

  AudioEngine.prototype.jump    = function () { this._sfxTone(360, 720, 0.18, 'square', 0.18); };
  AudioEngine.prototype.land    = function () { this._sfxTone(180, 90, 0.12, 'sine', 0.16); };
  AudioEngine.prototype.collect = function () {
    this._sfxTone(880, 1320, 0.10, 'triangle', 0.18);
    var self = this; setTimeout(function () { self._sfxTone(1320, 1760, 0.10, 'triangle', 0.15); }, 60);
  };
  AudioEngine.prototype.phase = function () {
    // balayage de filtre sur du bruit -> "woosh"
    if (!this.ensure()) return;
    var t = this.ctx.currentTime;
    var src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer();
    var bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 6;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(3000, t + 0.22);
    var g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
    src.start(t); src.stop(t + 0.27);
  };
  AudioEngine.prototype.blocked = function () { this._sfxTone(220, 160, 0.12, 'sawtooth', 0.14); };
  AudioEngine.prototype.death = function () {
    this._sfxTone(440, 60, 0.5, 'sawtooth', 0.2);
  };
  AudioEngine.prototype.win = function () {
    // petit accord arpégé ascendant
    var notes = [523.25, 659.25, 783.99, 1046.5];
    var self = this;
    notes.forEach(function (f, i) {
      setTimeout(function () { self._sfxTone(f, f, 0.4, 'triangle', 0.18); }, i * 110);
    });
  };

  /* ------------------------------------------------------------- Mute */
  AudioEngine.prototype.toggleMute = function () {
    this.muted = !this.muted;
    if (this.master) {
      var t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0.0001 : 0.9, t + 0.15);
    }
    return this.muted;
  };

  root.LUMEN.AudioEngine = AudioEngine;
})(typeof self !== 'undefined' ? self : this);
