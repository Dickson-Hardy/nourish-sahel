import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const minute = 60_000;
const peerWindow = 10 * minute;
const siteWindow = 60 * minute;
let database: DatabaseSync | undefined;

function openDatabase() {
  if (database) return database;
  const path = resolve(process.env.NOURISH_FORM_LIMIT_DB?.trim() || '.data/form-limits.sqlite');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  try {
    db.exec('PRAGMA busy_timeout = 1000; CREATE TABLE IF NOT EXISTS form_sends (sent_at INTEGER NOT NULL, peer_hash TEXT)');
    database = db;
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

// The transaction reserves capacity before the network call across Node workers on this host.
export function reserveFormSend(peer: string | undefined) {
  const db = openDatabase();
  const client = peer ? createHash('sha256').update(peer).digest('hex') : null;
  db.exec('BEGIN IMMEDIATE');
  try {
    const now = Date.now();
    db.prepare('DELETE FROM form_sends WHERE sent_at <= ?').run(now - siteWindow);
    const site = db.prepare('SELECT COUNT(*) AS total, MIN(sent_at) AS oldest FROM form_sends').get() as { total: number; oldest: number | null };
    const recent = db.prepare('SELECT COUNT(*) AS total, MIN(sent_at) AS oldest FROM form_sends WHERE peer_hash = ? AND sent_at > ?')
      .get(client, now - peerWindow) as { total: number; oldest: number | null };
    const waitForSite = site.total >= 30 && site.oldest !== null ? site.oldest + siteWindow - now : 0;
    const waitForPeer = recent.total >= 12 && recent.oldest !== null ? recent.oldest + peerWindow - now : 0;
    const retryAfter = Math.ceil(Math.max(waitForSite, waitForPeer) / 1000);

    if (!retryAfter) db.prepare('INSERT INTO form_sends (sent_at, peer_hash) VALUES (?, ?)').run(now, client);
    db.exec('COMMIT');
    return retryAfter;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
