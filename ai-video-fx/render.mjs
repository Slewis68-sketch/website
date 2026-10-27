// Render the AI-usage effect videos from one base talking-head clip.
// usage: node render.mjs <base.mp4> <outDir> [fx,fx,...|all] [--seconds N]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // global install in this env
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync, createReadStream } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ALL = ['glass-widgets', 'documentary', 'orbit', 'split', 'spotlight', 'checklist', 'timeline'];
const [baseArg, outArg, fxArg = 'all'] = process.argv.slice(2);
const secIdx = process.argv.indexOf('--seconds');
if (!baseArg || !outArg) { console.error('usage: node render.mjs <base.mp4> <outDir> [fx,...|all] [--seconds N]'); process.exit(1); }
const BASE = resolve(baseArg), OUT = resolve(outArg), WORK = join(OUT, '.work');
const FPS = 30, WORKERS = 4;
const script = JSON.parse(readFileSync(join(HERE, 'script.json'), 'utf8'));
const fxList = fxArg === 'all' ? ALL : fxArg.split(',');
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
const hasAudio = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', BASE]).toString().trim() !== '';

mkdirSync(join(WORK, 'base'), { recursive: true });
const seconds = secIdx > 0 ? +process.argv[secIdx + 1] : script.duration;
if (!existsSync(join(WORK, 'base', '00001.jpg'))) {
  ff('-i', BASE, '-t', String(seconds), '-vf', `fps=${FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`, '-q:v', '2', join(WORK, 'base', '%05d.jpg'));
}
const frames = readdirSync(join(WORK, 'base')).filter(f => f.endsWith('.jpg')).sort();

const types = { '.html': 'text/html', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = url.startsWith('/work/') ? join(WORK, url.slice(6)) : join(HERE, url.slice(1));
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
async function renderFx(fx, query = '', frameList = frames, outName = fx) {
  const dir = join(WORK, outName);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const chunk = Math.ceil(frameList.length / WORKERS);
  await Promise.all([...Array(WORKERS).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(`http://127.0.0.1:${port}/fx.html`);
    await page.evaluate(([fx, s, q]) => window.setup(fx, s, q), [fx, script, query]);
    for (let i = w * chunk; i < Math.min(frameList.length, (w + 1) * chunk); i++) {
      await page.evaluate(([src, t]) => window.renderFrame(src, t), [`/work/base/${frameList[i]}`, i / FPS]);
      await page.screenshot({ path: join(dir, String(i + 1).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 });
    }
    await page.close();
  }));
  return dir;
}
function encode(dir, outFile, audioFrom = hasAudio ? BASE : null, audioStart = 0) {
  const args = ['-framerate', String(FPS), '-i', join(dir, '%05d.jpg')];
  if (audioFrom) args.push('-ss', String(audioStart), '-i', audioFrom, '-map', '0:v', '-map', '1:a?', '-c:a', 'aac', '-b:a', '160k', '-shortest');
  ff(...args, '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile);
}

mkdirSync(OUT, { recursive: true });
for (const fx of fxList) {
  const t0 = Date.now();
  encode(await renderFx(fx), join(OUT, `${fx}.mp4`));
  console.log(`✓ ${fx}.mp4  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

// Showreel: "/effects <name>" chat interstitial (1.6s) + 2.2s of each finished effect, like the reference reel.
if (process.argv.includes('--showreel')) {
  const parts = [];
  for (const [i, fx] of ALL.entries()) {
    const start = Math.floor((i * 2) % Math.max(1, frames.length / FPS - 3) * FPS);
    const chatDir = await renderFx('chat', `name=${fx}`, frames.slice(start, start + 48), `chat-${fx}`);
    const chatMp4 = join(WORK, `chat-${fx}.mp4`); encode(chatDir, chatMp4, null);
    const clip = join(WORK, `cut-${fx}.mp4`);
    ff('-ss', String(start / FPS + 1.6), '-t', '2.2', '-i', join(OUT, `${fx}.mp4`), '-an', '-c:v', 'libx264', '-crf', '21', '-pix_fmt', 'yuv420p', clip);
    parts.push(chatMp4, clip);
  }
  const list = join(WORK, 'reel.txt');
  execFileSync('bash', ['-c', `printf "file '%s'\\n" ${parts.map(p => `'${p}'`).join(' ')} > '${list}'`]);
  const silent = join(WORK, 'reel-silent.mp4');
  ff('-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent);
  if (hasAudio) ff('-i', silent, '-i', BASE, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', join(OUT, 'showreel.mp4'));
  else ff('-i', silent, '-c', 'copy', join(OUT, 'showreel.mp4'));
  console.log('✓ showreel.mp4');
}
await browser.close(); server.close();
