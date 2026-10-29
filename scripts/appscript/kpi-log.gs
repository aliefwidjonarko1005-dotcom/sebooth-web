/**
 * KPI Log receiver: GitHub Action (.github/workflows/kpi-log.yml) POSTs every
 * push to `main` here, and each commit becomes one row in the sheet.
 *
 * Setup: see scripts/appscript/README.md. The shared secret lives in
 * Script Properties (key KPI_SECRET), never in this file.
 */
var SHEET_NAME = 'KPI Log';
var HEADERS = ['Logged At', 'Commit Date', 'Author', 'Message', 'Files Changed', 'Branch', 'Repo', 'Hash', 'URL'];

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid json' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('KPI_SECRET');
  if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorized' });

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheet_();
    // Hash column (H) lets a re-run of the workflow skip commits already logged.
    var last = sheet.getLastRow();
    var seen = last > 1 ? sheet.getRange(2, 8, last - 1, 1).getValues().map(function (r) { return r[0]; }) : [];

    var now = new Date();
    var rows = (body.commits || [])
      .filter(function (c) { return c.hash && seen.indexOf(c.hash) === -1; })
      .map(function (c) {
        return [
          now,
          new Date(c.timestamp),
          c.author || '',
          String(c.message || '').split('\n')[0],
          Number(c.files) || 0,
          String(body.branch || '').replace('refs/heads/', ''),
          body.repo || '',
          c.hash,
          c.url || '',
        ];
      });

    if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return json_({ ok: true, added: rows.length });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
