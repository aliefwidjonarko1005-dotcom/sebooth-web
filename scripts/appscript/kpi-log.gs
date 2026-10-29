/**
 * KPI Log receiver: GitHub Action (.github/workflows/kpi-log.yml) POSTs every
 * push to `main` here.
 *
 * Paste as a NEW file (e.g. KpiLog.gs) into the Apps Script project bound to
 * "KPI — Sebooth", next to the KPI Native Sync engine: it reuses CFG.WEB_ID
 * from there, so no sheet ID lives in this repo.
 *
 * Per push:
 * 1. Each commit -> one row in Website & App > Release Log (deduped by hash).
 * 2. A commit message with "done DEV-202610-001" (or "closes"/"selesai") sets
 *    that Development Tracker row to Done and writes the push time (GitHub
 *    server clock) as the completion timestamp in KPI Evidence. The engine's
 *    transitionCompletedAt_ keeps an existing Done + Date row, so JON-03 /
 *    ADN-03 then score on-time vs Target Date on the next hourly sync.
 *
 * Setup: see scripts/appscript/README.md. Shared secret = Script Property KPI_SECRET.
 */
var KPI_LOG_DEV_RE = /DEV-\d{6}-\d{3}/gi;
var KPI_LOG_DONE_RE = /\b(?:done|closes?|selesai)\s*:?\s*(DEV-\d{6}-\d{3})/gi;
// Release Log PIC is a dropdown of team names, so a GitHub username would be rejected.
var KPI_LOG_DEFAULT_PIC = 'Jonar';
// Same eligibility as calcDevelopment_ in the engine.
var KPI_LOG_DEV_KPI = [
  {key: 'JON-03', name: 'Jonar', platforms: ['Website', 'Both']},
  {key: 'ADN-03', name: 'Adnan', platforms: ['App', 'Both']}
];

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return kpiLogJson_({ok: false, error: 'invalid json'});
  }

  var secret = PropertiesService.getScriptProperties().getProperty('KPI_SECRET');
  if (!secret || body.secret !== secret) return kpiLogJson_({ok: false, error: 'unauthorized'});

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var web = SpreadsheetApp.openById(CFG.WEB_ID);
    var pushedAt = typeof body.pushedAt === 'number' ? new Date(body.pushedAt * 1000) : new Date();
    var commits = body.commits || [];
    var tracker = kpiLogTracker_(web);
    // KPI evidence first: a Release Log problem must not cost the completion timestamp.
    var done = kpiLogMarkDone_(tracker, commits, pushedAt);
    var released = kpiLogRelease_(web, commits, tracker, body.branch);
    return kpiLogJson_({ok: true, released: released, done: done});
  } finally {
    lock.releaseLock();
  }
}

function kpiLogTracker_(web) {
  var sh = mustSheet_(web, 'Development Tracker');
  var vals = sh.getDataRange().getValues();
  var rows = {};
  for (var i = 1; i < vals.length; i++) {
    var id = String(vals[i][0] || '').trim().toUpperCase();
    if (id) rows[id] = {row: i + 1, values: vals[i]};
  }
  return {sheet: sh, h: headerMap_(vals[0]), rows: rows};
}

function kpiLogRelease_(web, commits, tracker, branch) {
  var sh = mustSheet_(web, 'Release Log');
  var last = sh.getLastRow();
  var seen = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];

  var rows = commits
    .filter(function (c) { return c.hash && seen.indexOf(c.hash.slice(0, 7)) === -1; })
    .map(function (c) {
      var ids = kpiLogUnique_(String(c.message || '').match(KPI_LOG_DEV_RE) || []);
      var dev = ids.length && tracker.rows[ids[0]];
      return [
        c.hash.slice(0, 7),
        dev ? dev.values[tracker.h['Platform']] : 'Website',
        String(branch || '').replace('refs/heads/', ''),
        new Date(c.timestamp),
        String(c.message || '').split('\n')[0],
        (dev && dev.values[tracker.h['PIC']]) || KPI_LOG_DEFAULT_PIC,
        'Released',
        ids.join(', '),
        '',
        c.url || ''
      ];
    });

  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return rows.length;
}

function kpiLogMarkDone_(tracker, commits, pushedAt) {
  var kpi = SpreadsheetApp.getActiveSpreadsheet();
  var evidence = loadEvidenceState_(kpi);
  var h = tracker.h;
  var marked = [];

  commits.forEach(function (c) {
    var m, re = new RegExp(KPI_LOG_DONE_RE.source, 'gi');
    while ((m = re.exec(String(c.message || '')))) {
      var devId = m[1].toUpperCase();
      var dev = tracker.rows[devId];
      if (!dev || marked.indexOf(devId) !== -1) continue;
      marked.push(devId);

      var v = dev.values;
      if (String(v[h['Status']]).toLowerCase() !== 'done') {
        tracker.sheet.getRange(dev.row, h['Status'] + 1).setValue('Done');
        tracker.sheet.getRange(dev.row, h['Last Update'] + 1).setValue(pushedAt);
        if (!String(v[h['Related Link']] || '').trim()) tracker.sheet.getRange(dev.row, h['Related Link'] + 1).setValue(c.url || '');
      }

      var pic = String(v[h['PIC']] || '').trim();
      var platform = String(v[h['Platform']] || '').trim();
      var deadline = v[h['Target Date']];
      KPI_LOG_DEV_KPI.forEach(function (spec) {
        if (pic !== spec.name || spec.platforms.indexOf(platform) === -1) return;
        var id = 'DEV|' + devId + '|' + spec.key;
        var old = evidence.map[id];
        // Never overwrite a completion time the engine (or an earlier push) already recorded.
        if (old && old.values[8] instanceof Date) return;
        var onTime = deadline instanceof Date ? pushedAt <= endOfDay_(deadline) : '';
        var month = deadline instanceof Date ? deadline : pushedAt;
        var row = [
          id, 'Website/App', devId, pic, spec.key, String(v[h['Title']] || devId),
          v[h['Start Date']] || v[h['Date Added']] || '', deadline || '', pushedAt, 'Done', '',
          c.url || '', onTime, CFG.MONTHS[month.getMonth()], month.getFullYear(),
          old ? old.values[15] : pushedAt, new Date(),
          'completion timestamp = GitHub push ' + String(c.hash || '').slice(0, 7)
        ];
        if (old) evidence.sheet.getRange(old.row, 1, 1, row.length).setValues([row]);
        else evidence.sheet.appendRow(row);
      });
    }
  });
  return marked;
}

function kpiLogUnique_(ids) {
  return ids.map(function (s) { return s.toUpperCase(); })
    .filter(function (s, i, a) { return a.indexOf(s) === i; });
}

function kpiLogJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
