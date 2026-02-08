use rusqlite::Connection;

pub fn run_all(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS version (
            v_number VARCHAR(5) PRIMARY KEY,
            date TEXT
        );
        CREATE TABLE IF NOT EXISTS userdata (
            userid INTEGER PRIMARY KEY,
            guildid INTEGER
        );
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1) DEFAULT 1,
            max_level INTEGER,
            api_key TEXT,
            always_on_top INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS wars (
            attacker VARCHAR(100),
            attacker_id INTEGER,
            attacker_kills INTEGER,
            defender VARCHAR(100),
            defender_id INTEGER,
            defender_kills INTEGER
        );
        CREATE TABLE IF NOT EXISTS remaps (
            original_key VARCHAR(25) PRIMARY KEY,
            new_key VARCHAR(25)
        );
        CREATE TABLE IF NOT EXISTS player_logs (
            user_id INTEGER PRIMARY KEY,
            hits INTEGER,
            first_hit TEXT
        );
        CREATE TABLE IF NOT EXISTS guild_logs (
            guild_id INTEGER PRIMARY KEY,
            timestamp TEXT
        );
        CREATE TABLE IF NOT EXISTS stats (
            session_id INTEGER PRIMARY KEY AUTOINCREMENT,
            start TEXT,
            end_time TEXT,
            kills INTEGER DEFAULT 0
        );"
    )?;

    // Migration: add min_level column if missing
    let has_min_level: bool = conn
        .prepare("SELECT min_level FROM settings LIMIT 1")
        .is_ok();
    if !has_min_level {
        conn.execute_batch("ALTER TABLE settings ADD COLUMN min_level INTEGER DEFAULT 0")?;
    }

    // Insert default settings row if not exists
    conn.execute(
        "INSERT OR IGNORE INTO settings (id, max_level, api_key, always_on_top, min_level) VALUES (1, NULL, NULL, 0, 0)",
        [],
    )?;

    Ok(())
}
