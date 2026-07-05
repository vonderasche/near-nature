/**
 * ML telemetry report from Supabase views (console + dark HTML).
 * Usage: npm run report:ml-telemetry
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { loadProjectEnv, requireSupabaseSeedEnv } from './loadSupabaseSeedEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function isMissingRelation(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('schema cache') || error?.code === 'PGRST205';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function printSection(title, rows) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  if (!rows?.length) {
    console.log('  (no rows)');
    return;
  }
  for (const row of rows) {
    console.log(' ', JSON.stringify(row));
  }
}

function renderTable(title, rows, columns) {
  if (!rows?.length) {
    return `<section><h2>${escapeHtml(title)}</h2><p class="empty">No rows</p></section>`;
  }
  const head = columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = columns.map((col) => `<td>${escapeHtml(col.format(row))}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('\n');
  return `<section><h2>${escapeHtml(title)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></section>`;
}

function renderHtml(sections, generatedAt) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Near Nature — ML telemetry report</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #58a6ff;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.5 system-ui, sans-serif; padding: 32px 24px 48px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    .meta { color: var(--muted); margin-bottom: 28px; }
    section { margin-bottom: 32px; max-width: 1100px; }
    h2 { font-size: 16px; margin: 0 0 12px; color: var(--accent); }
    table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
    th { background: #21262d; color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    tr:last-child td { border-bottom: none; }
    td { font-family: ui-monospace, monospace; font-size: 12px; }
    .empty { color: var(--muted); }
  </style>
</head>
<body>
  <h1>ML telemetry report</h1>
  <p class="meta">Last 30 days · Generated ${escapeHtml(generatedAt)}</p>
  ${sections.join('\n')}
</body>
</html>`;
}

const env = loadProjectEnv();
const { url, serviceKey } = requireSupabaseSeedEnv(env);
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('\nML telemetry report (last 30 days)\n');

const { data: refreshCount, error: refreshError } = await supabase.rpc(
  'refresh_ml_telemetry_daily_rollups',
  { p_days: 30 },
);
if (refreshError && !isMissingRelation(refreshError)) {
  console.warn(`  Rollup refresh note: ${refreshError.message}`);
} else if (typeof refreshCount === 'number') {
  console.log(`  Refreshed daily rollups: ${refreshCount} row(s)`);
}

const { data: flags, error: flagsError } = await supabase
  .from('ml_telemetry_flag_counts_30d')
  .select('domain, event_name, pipeline, region_id, flag, event_count')
  .order('event_count', { ascending: false })
  .limit(15);

if (flagsError) {
  if (isMissingRelation(flagsError)) {
    console.error('Missing views — run sql/ml_telemetry_reports.sql in Supabase Studio.');
    process.exit(1);
  }
  throw flagsError;
}

printSection('Top flags (30d)', flags);

const { data: routing, error: routingError } = await supabase
  .from('ml_telemetry_routing_misses_30d')
  .select('routing_label, region_id, empty_count, no_organism_count, total_events, avg_top_confidence')
  .order('empty_count', { ascending: false })
  .limit(10);

if (routingError) throw routingError;
printSection('Routing misses', routing);

const { data: reclassify, error: reclassifyError } = await supabase
  .from('ml_telemetry_reclassify_rate_30d')
  .select('region_id, session_count, reclassified_sessions, reclassify_pct')
  .order('reclassify_pct', { ascending: false });

if (reclassifyError) throw reclassifyError;
printSection('Reclassify rate by region', reclassify);

const { data: mismatches, error: mismatchError } = await supabase
  .from('ml_telemetry_reclassify_mismatches_30d')
  .select('created_at, region_id, routing_label, tflite_top_latin, gemini_top_latin, comparison')
  .limit(10);

if (mismatchError) throw mismatchError;
printSection('Recent reclassify mismatches', mismatches);

const generatedAt = new Date().toISOString();
const html = renderHtml(
  [
    renderTable('Top flags (30d)', flags, [
      { label: 'Flag', format: (r) => r.flag },
      { label: 'Count', format: (r) => r.event_count },
      { label: 'Pipeline', format: (r) => r.pipeline },
      { label: 'Region', format: (r) => r.region_id },
      { label: 'Event', format: (r) => r.event_name },
    ]),
    renderTable('Routing misses', routing, [
      { label: 'Label', format: (r) => r.routing_label },
      { label: 'Region', format: (r) => r.region_id },
      { label: 'Empty', format: (r) => r.empty_count },
      { label: 'No organism', format: (r) => r.no_organism_count },
      { label: 'Total', format: (r) => r.total_events },
      { label: 'Avg conf', format: (r) => r.avg_top_confidence },
    ]),
    renderTable('Reclassify rate by region', reclassify, [
      { label: 'Region', format: (r) => r.region_id },
      { label: 'Sessions', format: (r) => r.session_count },
      { label: 'Reclassified', format: (r) => r.reclassified_sessions },
      { label: 'Rate %', format: (r) => r.reclassify_pct },
    ]),
    renderTable('Recent reclassify mismatches', mismatches, [
      { label: 'When', format: (r) => r.created_at },
      { label: 'Region', format: (r) => r.region_id },
      { label: 'Route', format: (r) => r.routing_label },
      { label: 'TFLite', format: (r) => r.tflite_top_latin },
      { label: 'Gemini', format: (r) => r.gemini_top_latin },
    ]),
  ],
  generatedAt,
);

const distDir = resolve(root, 'dist');
mkdirSync(distDir, { recursive: true });
const htmlPath = resolve(distDir, 'ml-telemetry-report.html');
writeFileSync(htmlPath, html);

console.log(`\nDark HTML report: ${htmlPath}`);
console.log('\nDone.\n');
