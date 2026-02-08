pub mod models;
pub mod migrations;

use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

static DB: once_cell::sync::Lazy<Mutex<Option<Connection>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(None));

pub fn init(path: &Path) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    migrations::run_all(&conn)?;
    *DB.lock().unwrap() = Some(conn);
    Ok(())
}

pub fn with_conn<F, T>(f: F) -> Result<T, String>
where
    F: FnOnce(&Connection) -> Result<T, rusqlite::Error>,
{
    let guard = DB.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Database not initialized")?;
    f(conn).map_err(|e| e.to_string())
}
