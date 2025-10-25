type SessionStats = {
  session_id?: number;
  start?: number | null;
  end?: number | null;
  kills?: number;
};

const normalizeToSeconds = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  // If accidentally stored in deciseconds (ms/100), convert to seconds
  // Typical epoch seconds ~ 1.7e9; deciseconds ~ 1.7e10
  return n > 10_000_000_000 ? Math.floor(n / 10) : n;
};

const fetchSessionStats = (event: any) => {
  let row: any;
  try {
    row = global.db
      .prepare(
        `SELECT session_id, start, end, kills FROM stats WHERE end is null ORDER BY session_id DESC LIMIT 1`
      )
      .get();
  } catch {}

  const payload: SessionStats = row
    ? {
        session_id: row.session_id,
        start: normalizeToSeconds(row.start),
        end: normalizeToSeconds(row.end),
        kills: Number(row.kills ?? 0),
      }
    : { start: null, end: null, kills: 0 };

  event.reply("resolveSessionStats", payload);
};

export default fetchSessionStats;

