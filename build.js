#!/usr/bin/env node
/* =============================================================================
 * LUMEN — build.js
 * -----------------------------------------------------------------------------
 * Étape de BUILD (Node, sans dépendance). Produit une distribution AUTONOME :
 * dist/LUMEN.html, dans laquelle la feuille de style et tous les modules JS
 * sont intégrés (inline). Le fichier obtenu se lance par simple double-clic,
 * sans serveur ni installation.
 *
 * Usage :  node build.js
 *
 * Le build est une simple substitution dans index.html : on remplace le lien
 * CSS et chaque <script src> par leur contenu. La source de vérité reste donc
 * les fichiers de /js et /css (aucune duplication manuelle).
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'LUMEN.html');

// Ordre des modules = ordre des dépendances.
const MODULES = [
  'js/core.js', 'js/i18n.js', 'js/audio.js', 'js/input.js', 'js/particles.js',
  'js/camera.js', 'js/level.js', 'js/player.js', 'js/ui.js', 'js/game.js', 'js/main.js'
];

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

function build() {
  let html = read('index.html');

  // 1) Intègre la CSS
  const css = read('css/style.css');
  html = html.replace(
    '<link rel="stylesheet" href="css/style.css" />',
    '<style>\n' + css + '\n</style>'
  );

  // 2) Intègre chaque module JS
  MODULES.forEach(function (m) {
    const tag = '<script src="' + m + '"></script>';
    const code = read(m);
    if (html.indexOf(tag) === -1) {
      throw new Error('Balise introuvable pour ' + m + ' (index.html a-t-il changé ?)');
    }
    html = html.replace(tag, '<script>\n' + code + '\n</script>');
  });

  // 3) Bannière
  const banner = '<!--\n  LUMEN — Le Passeur de Phase  (build autonome)\n' +
    '  Généré par build.js le ' + new Date().toISOString() + '\n' +
    '  Tout le code (CSS + JS) est intégré : ouvrez ce fichier dans un navigateur.\n-->\n';
  html = banner + html;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, html, 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log('✓ Build terminé : dist/LUMEN.html  (' + kb + ' Ko)');
  console.log('  Modules intégrés : ' + MODULES.length + ' fichiers JS + 1 feuille CSS');
}

build();
