/**
 * Writes a dark-theme HTML report for the v5 cascade matrix.
 * Pulls sample-image benchmarks from python/v5/samples/cascade_report/.
 *
 * Usage: npm run report:v5-cascade
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { V5_CASCADE_MANIFEST, V5_GLOBAL_DATASET } from './v5-cascade-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const V5_ASSETS = join(root, 'assets/tflite/v5');
const PYTHON_V5 = resolve(root, '../python/v5');
const SAMPLES_DIR = join(PYTHON_V5, 'samples');
const METRICS_PATH = join(SAMPLES_DIR, 'cascade_report', 'metrics.json');
const RESULTS_PATH = join(SAMPLES_DIR, 'cascade_report', 'results.json');
const IMAGES_DIR = join(SAMPLES_DIR, 'images');
const THUMB_SCRIPT = join(root, 'scripts/gen-cascade-thumb.py');
const PYTHON_MODELS = join(PYTHON_V5, 'models');

const REGION_ORDER = ['southeast', 'northeast', 'midwest', 'south'];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAcc(valAcc) {
  if (valAcc == null) return '—';
  return `${(valAcc * 100).toFixed(1)}%`;
}

function formatSamplePct(pct) {
  if (pct == null) return '—';
  return `${pct.toFixed(1)}%`;
}

function parsePctLabel(label) {
  if (!label || label === '—') return null;
  const match = String(label).match(/^([\d.]+)%/);
  return match ? parseFloat(match[1]) : null;
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function readValAccFromDir(tfliteDir) {
  const path = join(tfliteDir, 'model_info.json');
  if (!existsSync(path)) return null;
  try {
    const meta = JSON.parse(readFileSync(path, 'utf8'));
    return typeof meta.val_acc === 'number' ? meta.val_acc : null;
  } catch {
    return null;
  }
}

function readValAcc(relativePath) {
  const assetPath = join(V5_ASSETS, relativePath);
  const fromAssets = readValAccFromDir(assetPath);
  if (fromAssets != null) return fromAssets;

  const parts = relativePath.split('/');
  if (parts.length >= 3) {
    const [scopeOrRegion, folder] = parts;
    const pythonDir =
      scopeOrRegion === 'global'
        ? join(PYTHON_MODELS, 'global', folder, 'tflite')
        : join(PYTHON_MODELS, scopeOrRegion, folder, 'tflite');
    return readValAccFromDir(pythonDir);
  }
  return null;
}

function loadValAccMap() {
  const map = new Map();
  const entries = [
    ['kingdom', 'global/step01_kingdom/tflite'],
    ['common_mammals', 'global/common_mammals/tflite'],
    ['plant_router', 'southeast/step02_plant_router/tflite'],
    ['animal_router', 'southeast/step03_animal_router/tflite'],
    ['trees_shrubs', 'southeast/trees_shrubs/tflite'],
    ['wildflowers_herbs', 'southeast/wildflowers_herbs/tflite'],
    ['ferns_mosses', 'southeast/ferns_mosses/tflite'],
    ['birds', 'southeast/birds/tflite'],
    ['herps', 'southeast/herps/tflite'],
    ['insects', 'southeast/insects/tflite'],
    ['lepidoptera', 'southeast/lepidoptera/tflite'],
    ['arachnids', 'southeast/arachnids/tflite'],
  ];
  for (const [key, rel] of entries) {
    const acc = readValAcc(rel);
    if (acc != null) map.set(key, acc);
  }
  return map;
}

function loadSampleMetrics() {
  const metrics = readJson(METRICS_PATH);
  if (!metrics?.regions) return { byRegion: new Map(), kingdomAcc: null, globalMammalsAcc: null };

  const byRegion = new Map();
  let kingdomAcc = null;
  let globalMammalsAcc = null;

  for (const regionMetrics of metrics.regions) {
    const regionId = regionMetrics.accuracy.region;
    const kingdom = regionMetrics.accuracy.kingdom.accuracy;
    kingdomAcc ??= kingdom;

    const specialists = new Map();
    const routers = { plant: null, animal: null };

    for (const group of regionMetrics.per_group ?? []) {
      specialists.set(group.group, {
        specialist: parsePctLabel(group.specialist_label),
        router: parsePctLabel(group.router_label),
      });
      if (group.group === 'common_mammals') {
        globalMammalsAcc ??= parsePctLabel(group.specialist_label);
      }
    }

    for (const path of regionMetrics.path_breakdown ?? []) {
      if (path.kind === 'plant_router') {
        routers.plant = path.stage?.accuracy ?? null;
      }
      if (path.kind === 'animal_router') {
        routers.animal = path.stage?.accuracy ?? null;
      }
    }

    byRegion.set(regionId, { kingdom, routers, specialists, endToEnd: regionMetrics.accuracy.end_to_end.accuracy });
  }

  return { byRegion, kingdomAcc, globalMammalsAcc };
}

function specialistValAcc(valAccMap, slot) {
  if (!slot.folder) return null;
  return valAccMap.get(slot.folder) ?? valAccMap.get(slot.id) ?? null;
}

function specialistSampleAcc(sampleByRegion, regionId, slot) {
  const region = sampleByRegion.get(regionId);
  if (!region || !slot.folder) return null;
  const entry = region.specialists.get(slot.folder) ?? region.specialists.get(slot.id);
  return entry?.specialist ?? null;
}

function renderGlobalTable(valAccMap, sampleMetrics) {
  const kingdomVal = valAccMap.get('kingdom');
  const mammalsVal = valAccMap.get('common_mammals');
  const rows = V5_GLOBAL_DATASET.models
    .map((model) => {
      const val =
        model.id === 'kingdom' ? kingdomVal : model.id === 'common_mammals' ? mammalsVal : null;
      const sample =
        model.id === 'kingdom'
          ? sampleMetrics.kingdomAcc
          : model.id === 'common_mammals'
            ? sampleMetrics.globalMammalsAcc
            : null;
      return `<tr class="live">
  <td>${escapeHtml(V5_GLOBAL_DATASET.label)}</td>
  <td>${escapeHtml(model.id.replace(/_/g, ' '))}</td>
  <td class="accuracy">${formatAcc(val)}</td>
  <td class="sample">${formatSamplePct(sample)}</td>
</tr>`;
    })
    .join('\n');

  return `<h2>Global dataset</h2>
<p class="subtitle">Shared models used before regional routing — kingdom gate + common mammals adjunct.</p>
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Dataset</th>
        <th>Model</th>
        <th>Val accuracy</th>
        <th>Sample accuracy</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
}

function renderRegionBlock(regionId, region, valAccMap, sampleByRegion) {
  const slotsPerBranch = 5;
  const totalRows = slotsPerBranch * 2;
  const lines = [];
  const sampleRegion = sampleByRegion.get(regionId);
  const kingdomSample = sampleRegion?.kingdom ?? null;

  for (let branchIndex = 0; branchIndex < 2; branchIndex += 1) {
    const branch = branchIndex === 0 ? 'plant' : 'animal';
    const specialists = region.branches[branch].specialists;
    const routerSample =
      branch === 'plant' ? sampleRegion?.routers.plant : sampleRegion?.routers.animal;
    const routerVal =
      branch === 'plant' ? valAccMap.get('plant_router') : valAccMap.get('animal_router');

    for (let i = 0; i < slotsPerBranch; i += 1) {
      const slot = specialists[i];
      const label = slot.id.replace(/_/g, ' ');
      const val = specialistValAcc(valAccMap, slot);
      const sample = specialistSampleAcc(sampleByRegion, regionId, slot);
      const cls =
        slot.status === 'live'
          ? 'live'
          : slot.folder
            ? 'trained'
            : region.status === 'live'
              ? 'planned-live-region'
              : 'planned';

      let cells = '';

      if (branchIndex === 0 && i === 0) {
        cells += `<td class="region" rowspan="${totalRows}">${escapeHtml(region.label)}</td>`;
        cells += `<td class="kingdom" rowspan="${totalRows}">${formatSamplePct(kingdomSample)}<br><span class="meta">val ${formatAcc(valAccMap.get('kingdom'))}</span></td>`;
      }

      if (i === 0) {
        cells += `<td class="branch" rowspan="${slotsPerBranch}">
          <div class="branch-name">${escapeHtml(branch)}</div>
          <div class="branch-router">router val ${formatAcc(routerVal)}</div>
          <div class="branch-router">sample ${formatSamplePct(routerSample)}</div>
        </td>`;
      }

      cells += `<td class="specialist">${escapeHtml(label)}</td>`;
      cells += `<td class="accuracy">${formatAcc(val)}</td>`;
      cells += `<td class="sample">${formatSamplePct(sample)}</td>`;

      lines.push(`<tr class="${cls}">${cells}</tr>`);
    }
  }

  return lines.join('\n');
}

function ensureThumb(imageFile, thumbsDir) {
  const src = join(IMAGES_DIR, imageFile);
  const dest = join(thumbsDir, imageFile);
  if (!existsSync(src)) return null;
  if (!existsSync(dest)) {
    try {
      if (existsSync(THUMB_SCRIPT)) {
        execFileSync('py', ['-3', THUMB_SCRIPT, src, dest], { stdio: 'pipe' });
      } else {
        copyFileSync(src, dest);
      }
    } catch {
      try {
        copyFileSync(src, dest);
      } catch {
        return null;
      }
    }
  }
  return `v5-cascade-thumbs/${imageFile}`;
}

function formatGroundTruth(entry) {
  const parts = [];
  if (entry.kingdom_class) parts.push(entry.kingdom_class);
  if (entry.specialist_group) parts.push(entry.specialist_group);
  if (entry.family || entry.class_label) parts.push(entry.family || entry.class_label);
  return parts.join(' · ') || '—';
}

function formatStage(stage) {
  if (!stage) return '—';
  const conf = stage.top_conf != null ? `${(stage.top_conf * 100).toFixed(0)}%` : '';
  return `${escapeHtml(stage.decision || stage.top_label || '')}<br><span class="meta">${escapeHtml(stage.top_label || '')} ${conf}</span>`;
}

function kingdomPredLabel(cascade) {
  const kingdom = cascade?.kingdom;
  if (!kingdom) return '';
  const decision = kingdom.decision || '';
  if (decision === 'stop') return 'not_organism';
  if (decision === 'Not in our guide yet' || decision === 'not_in_guide') return 'not_in_guide';
  return decision;
}

function kingdomMatches(gtKingdom, cascade) {
  return kingdomPredLabel(cascade) === gtKingdom;
}

function routerMatches(gtGroup, cascade) {
  const router = cascade?.router;
  if (!router) return false;
  return router.decision === gtGroup;
}

function specialistMatches(gtLabel, cascade) {
  const specialist = cascade?.specialist;
  if (!specialist) return false;
  const pred = specialist.decision || specialist.top_label || '';
  return pred === gtLabel;
}

/** ok = correct vs ground truth, bad = wrong, na = stage not evaluated for this image. */
function stageCellStatus(entry, cascade, stage) {
  const gtKingdom = (entry.kingdom_class || '').trim();
  const gtGroup = (entry.specialist_group || '').trim();
  const gtLabel = (entry.family || entry.class_label || '').trim();

  if (stage === 'kingdom') {
    if (!gtKingdom) return 'na';
    return kingdomMatches(gtKingdom, cascade) ? 'ok' : 'bad';
  }
  if (stage === 'router') {
    if (gtKingdom === 'not_organism' || !gtGroup) return 'na';
    if (!cascade?.router) return 'bad';
    return routerMatches(gtGroup, cascade) ? 'ok' : 'bad';
  }
  if (stage === 'specialist') {
    if (gtKingdom === 'not_organism' || !gtLabel) return 'na';
    if (!cascade?.specialist) return 'bad';
    return specialistMatches(gtLabel, cascade) ? 'ok' : 'bad';
  }
  return 'na';
}

function formatStageCell(entry, cascade, stage) {
  const status = stageCellStatus(entry, cascade, stage);
  const stageData =
    stage === 'kingdom' ? cascade?.kingdom : stage === 'router' ? cascade?.router : cascade?.specialist;
  const html = stageData ? formatStage(stageData) : '—';
  return `<td class="cascade-cell ${status}">${html}</td>`;
}

function endToEndOk(entry, cascade) {
  const gtKingdom = (entry.kingdom_class || '').trim();
  if (gtKingdom === 'not_organism') {
    return cascade?.final_label === 'stop (not nature)';
  }
  const gtLabel = (entry.family || entry.class_label || '').trim();
  if (gtLabel) return specialistMatches(gtLabel, cascade);
  const gtGroup = (entry.specialist_group || '').trim();
  if (gtGroup) return routerMatches(gtGroup, cascade) && kingdomMatches(gtKingdom, cascade);
  return kingdomMatches(gtKingdom, cascade);
}

function formatCascadeSummary(entry, cascade) {
  if (!cascade) return '—';
  const parts = [];
  if (cascade.kingdom) {
    const status = stageCellStatus(entry, cascade, 'kingdom');
    parts.push(`<strong>K</strong> <span class="stage-${status}">${formatStage(cascade.kingdom)}</span>`);
  }
  if (cascade.router) {
    const status = stageCellStatus(entry, cascade, 'router');
    parts.push(`<strong>R</strong> <span class="stage-${status}">${formatStage(cascade.router)}</span>`);
  }
  if (cascade.specialist) {
    const status = stageCellStatus(entry, cascade, 'specialist');
    parts.push(`<strong>S</strong> <span class="stage-${status}">${formatStage(cascade.specialist)}</span>`);
  }
  parts.push(`<span class="final">→ ${escapeHtml(cascade.final_label || '')}</span>`);
  return parts.join('<br>');
}

function renderImageTable(results, thumbsDir, regions) {
  if (!results?.length) {
    return `<h2>Sample images</h2><p class="subtitle">No results at ${escapeHtml(RESULTS_PATH)} — run python v5/scripts/run_cascade_report.py first.</p>`;
  }

  const header = [
    '<th>Image</th>',
    '<th>Ground truth</th>',
    '<th>Summary</th>',
    ...regions.flatMap((regionId) => [
      `<th>${escapeHtml(regionId)}<br><span class="meta">kingdom</span></th>`,
      `<th>${escapeHtml(regionId)}<br><span class="meta">router</span></th>`,
      `<th>${escapeHtml(regionId)}<br><span class="meta">specialist</span></th>`,
    ]),
  ];

  const rows = results.map((entry) => {
    const thumb = ensureThumb(entry.file, thumbsDir);
    const imgCell = thumb
      ? `<img src="${escapeHtml(thumb)}" width="96" height="96" alt=""><div class="fname">${escapeHtml(entry.file)}</div>`
      : `<div class="fname">${escapeHtml(entry.file)}</div>`;

    const refRegion = regions[0];
    const refCascade = entry.cascades?.[refRegion];
    const rowClass = endToEndOk(entry, refCascade) ? 'row-ok' : 'row-bad';

    const gt = escapeHtml(formatGroundTruth(entry));
    const summaryParts = [];
    if (entry.source_region) summaryParts.push(`source: ${entry.source_region}`);
    if (entry.label_source) summaryParts.push(entry.label_source);
    const summary = summaryParts.length ? escapeHtml(summaryParts.join(' · ')) : '—';

    const regionCells = regions.flatMap((regionId) => {
      const cascade = entry.cascades?.[regionId];
      return [
        formatStageCell(entry, cascade, 'kingdom'),
        formatStageCell(entry, cascade, 'router'),
        formatStageCell(entry, cascade, 'specialist'),
      ];
    });

    return `<tr class="${rowClass}">
  <td class="imgcell">${imgCell}</td>
  <td>${gt}</td>
  <td class="summary-cell">${summary}<br>${formatCascadeSummary(entry, refCascade)}</td>
  ${regionCells.join('\n  ')}
</tr>`;
  });

  return `<h2>Sample images (${results.length})</h2>
<p class="subtitle">Each row is one image from the Global sample dataset ·
<span class="swatch ok">green</span> correct ·
<span class="swatch bad">red</span> wrong ·
<span class="swatch na">blue</span> not evaluated ·
row border = end-to-end (${escapeHtml(regions[0])})</p>
<div class="table-wrap wide">
  <table class="detail">
    <thead><tr>${header.join('')}</tr></thead>
    <tbody>${rows.join('\n')}</tbody>
  </table>
</div>`;
}

function renderHtml(valAccMap, sampleMetrics, results, thumbsDir) {
  const sampleByRegion = sampleMetrics.byRegion;
  const regionBlocks = REGION_ORDER.filter((id) => V5_CASCADE_MANIFEST.regions[id])
    .map((regionId) => {
      const region = V5_CASCADE_MANIFEST.regions[regionId];
      return renderRegionBlock(regionId, region, valAccMap, sampleByRegion);
    })
    .join('\n');

  const reportRegions = REGION_ORDER.filter((id) => sampleByRegion.has(id) || V5_CASCADE_MANIFEST.regions[id]);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Near Nature — v5 capture cascade</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #58a6ff;
      --live: #3fb950;
      --trained: #58a6ff;
      --planned: #d29922;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font: 14px/1.5 system-ui, sans-serif;
      padding: 32px 24px 48px;
      text-align: center;
    }
    h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px; }
    h2 { font-size: 18px; font-weight: 600; margin: 32px 0 12px; text-align: center; }
    .subtitle { color: var(--muted); margin: 0 auto 16px; max-width: 960px; }
    .callout {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      padding: 12px 16px;
      border-radius: 6px;
      margin: 0 auto 24px;
      max-width: 960px;
    }
    .table-wrap {
      margin: 0 auto 24px;
      max-width: 1100px;
      overflow-x: auto;
    }
    .table-wrap.wide { max-width: 100%; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 10px 12px;
      text-align: center;
      vertical-align: middle;
      border: 1px solid var(--border);
    }
    th {
      background: #21262d;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    th .meta { text-transform: none; letter-spacing: 0; font-size: 10px; }
    td.region { font-weight: 600; background: #1c2128; width: 100px; }
    td.kingdom { background: #1a2332; font-weight: 600; width: 90px; }
    td.branch { width: 120px; background: #1a1f26; }
    .branch-name { text-transform: lowercase; font-weight: 600; }
    .branch-router { font-size: 10px; color: var(--muted); margin-top: 3px; }
    td.specialist { text-transform: lowercase; }
    td.accuracy, td.sample { font-variant-numeric: tabular-nums; font-weight: 600; width: 88px; }
    tr.live td.accuracy, tr.live td.sample { color: var(--live); }
    tr.trained td.accuracy, tr.trained td.sample { color: var(--trained); }
    tr.planned-live-region td.accuracy, tr.planned-live-region td.sample { color: var(--planned); }
    tr.planned td.accuracy, tr.planned td.sample { color: var(--muted); font-weight: 400; }
    .meta { color: var(--muted); font-size: 11px; }
    .detail { font-size: 12px; }
    .detail td.imgcell { width: 110px; }
    .detail td.imgcell img { width: 96px; height: 96px; object-fit: cover; border-radius: 4px; }
    .detail .fname { font-size: 10px; color: var(--muted); word-break: break-all; margin-top: 4px; }
    .detail .summary-cell { text-align: left; max-width: 220px; font-size: 11px; }
    .detail .cascade-cell { text-align: left; min-width: 100px; font-size: 11px; }
    .detail .cascade-cell.ok { background: rgba(63, 185, 80, 0.2); }
    .detail .cascade-cell.bad { background: rgba(248, 81, 73, 0.2); }
    .detail .cascade-cell.na { background: rgba(88, 166, 255, 0.15); }
    .detail .summary-cell .stage-ok { display: inline-block; background: rgba(63, 185, 80, 0.15); padding: 2px 4px; border-radius: 3px; }
    .detail .summary-cell .stage-bad { display: inline-block; background: rgba(248, 81, 73, 0.15); padding: 2px 4px; border-radius: 3px; }
    .detail .summary-cell .stage-na { display: inline-block; background: rgba(88, 166, 255, 0.12); padding: 2px 4px; border-radius: 3px; }
    .detail .final { color: var(--accent); }
    .swatch { display: inline-block; padding: 1px 8px; border-radius: 3px; font-size: 12px; margin: 0 2px; }
    .swatch.ok { background: rgba(63, 185, 80, 0.35); }
    .swatch.bad { background: rgba(248, 81, 73, 0.35); }
    .swatch.na { background: rgba(88, 166, 255, 0.35); }
    tr.row-ok { border-left: 4px solid var(--live); }
    tr.row-bad { border-left: 4px solid #f85149; }
    .legend { margin: 20px auto 0; color: var(--muted); font-size: 12px; max-width: 960px; }
    .legend span { margin: 0 10px; }
    .legend .dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: middle;
    }
    .dot-live { background: var(--live); }
    .dot-trained { background: var(--trained); }
    .dot-planned { background: var(--planned); }
  </style>
</head>
<body>
  <h1>v5 capture cascade</h1>
  <p class="subtitle">Global dataset → region → branch → 5 specialists · val accuracy from model_info.json · sample accuracy from python/v5 sample images</p>
  <div class="callout">
    Step 0: <strong>Global kingdom</strong> → plantae / animalia routers → specialist genus head · adjunct <code>common_mammals</code>
  </div>

  ${renderGlobalTable(valAccMap, sampleMetrics)}

  <h2>Regional matrix</h2>
  <p class="subtitle">Kingdom column = sample accuracy on ${sampleMetrics.kingdomAcc != null ? '493' : '—'} global sample images (same global model for all regions)</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Region</th>
          <th>Kingdom</th>
          <th>Branch</th>
          <th>Specialist</th>
          <th>Val accuracy</th>
          <th>Sample accuracy</th>
        </tr>
      </thead>
      <tbody>
${regionBlocks}
      </tbody>
    </table>
  </div>

  ${renderImageTable(results, thumbsDir, reportRegions)}

  <p class="legend">
    <span><span class="dot dot-live"></span>Live in app</span>
    <span><span class="dot dot-trained"></span>Trained pack</span>
    <span><span class="dot dot-planned"></span>Planned slot</span>
  </p>
</body>
</html>`;
}

const valAccMap = loadValAccMap();
const sampleMetrics = loadSampleMetrics();
const results = readJson(RESULTS_PATH);
const distDir = resolve(root, 'dist');
const thumbsDir = join(distDir, 'v5-cascade-thumbs');
mkdirSync(thumbsDir, { recursive: true });
mkdirSync(distDir, { recursive: true });

const outPath = resolve(distDir, 'v5-cascade-report.html');
writeFileSync(outPath, renderHtml(valAccMap, sampleMetrics, results, thumbsDir));

writeFileSync(
  join(V5_ASSETS, 'cascade.json'),
  `${JSON.stringify(V5_CASCADE_MANIFEST, null, 2)}\n`,
);

console.log(`Wrote ${outPath}`);
if (results?.length) {
  console.log(`  ${results.length} sample image rows · thumbs in dist/v5-cascade-thumbs/`);
}
if (!existsSync(METRICS_PATH)) {
  console.warn(`  Missing ${METRICS_PATH} — sample accuracy columns will be empty`);
}
