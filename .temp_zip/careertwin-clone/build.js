const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = __dirname;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

async function bundle(entry) {
  const result = await esbuild.build({
    entryPoints: [path.join(SRC, entry)],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2019'],
    write: false,
    legalComments: 'none',
    loader: { '.splinecode': 'dataurl' }
  });
  return result.outputFiles[0].text;
}

async function main() {
  const robotJs = await bundle('robot.js');
  const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');
  const loginCss = fs.readFileSync(path.join(SRC, 'login.css'), 'utf8');
  const dashCss = fs.readFileSync(path.join(SRC, 'dashboard.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(SRC, 'app.js'), 'utf8');
  const loginJs = fs.readFileSync(path.join(SRC, 'login.js'), 'utf8');
  const dashJs = fs.readFileSync(path.join(SRC, 'dashboard.js'), 'utf8');

  /* ---- landing page ---- */
  const indexHtml = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const indexOut = indexHtml
    .replace('/*__CSS__*/', () => css)
    .replace('/*__JS__*/', () => appJs + '\n/* ---- 3D character ---- */\n' + robotJs);
  fs.writeFileSync(path.join(OUT, 'index.html'), indexOut);

  /* ---- login page ---- */
  const loginHtml = fs.readFileSync(path.join(SRC, 'login.html'), 'utf8');
  const loginOut = loginHtml
    .replace('/*__CSS__*/', () => css)
    .replace('/*__LOGIN_CSS__*/', () => loginCss)
    .replace('/*__JS__*/', () => loginJs + '\n/* ---- 3D character ---- */\n' + robotJs);
  fs.writeFileSync(path.join(OUT, 'login.html'), loginOut);

  /* ---- dashboard ---- */
  const dashHtml = fs.readFileSync(path.join(SRC, 'dashboard.html'), 'utf8');
  const dashOut = dashHtml
    .replace('/*__CSS__*/', () => css)
    .replace('/*__DASH_CSS__*/', () => dashCss)
    .replace('/*__JS__*/', () => dashJs + '\n/* ---- 3D character ---- */\n' + robotJs);
  fs.writeFileSync(path.join(OUT, 'dashboard.html'), dashOut);

  console.log('built index.html', kb(Buffer.byteLength(indexOut)));
  console.log('built login.html', kb(Buffer.byteLength(loginOut)), '(3d bundle', kb(robotJs.length) + ')');
  console.log('built dashboard.html', kb(Buffer.byteLength(dashOut)));
}

main().catch((e) => { console.error(e); process.exit(1); });
