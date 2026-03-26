use crate::db;
use crate::db::models::Settings;

#[tauri::command]
pub fn fetch_settings() -> Result<Settings, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT min_level, max_level, api_key, always_on_top, keybinds_enabled, embedded_combat FROM settings LIMIT 1")?;
        stmt.query_row([], |row| {
            Ok(Settings {
                min_level: row.get::<_, i64>(0).unwrap_or(0),
                max_level: row.get(1)?,
                api_key: row.get(2)?,
                always_on_top: row.get::<_, i64>(3).unwrap_or(0) != 0,
                keybinds_enabled: row.get::<_, i64>(4).unwrap_or(1) != 0,
                embedded_combat: row.get::<_, i64>(5).unwrap_or(0) != 0,
            })
        })
    })
}

#[tauri::command]
pub fn update_settings(min_level: Option<i64>, max_level: Option<i64>, api_key: Option<String>, keybinds_enabled: Option<bool>, embedded_combat: Option<bool>) -> Result<(), String> {
    db::with_conn(|conn| {
        if let Some(level) = min_level {
            conn.execute("UPDATE settings SET min_level = ?1", [level])?;
        }
        if let Some(level) = max_level {
            conn.execute("UPDATE settings SET max_level = ?1", [level])?;
        }
        if let Some(key) = api_key {
            conn.execute("UPDATE settings SET api_key = ?1", rusqlite::params![key])?;
        }
        if let Some(enabled) = keybinds_enabled {
            conn.execute("UPDATE settings SET keybinds_enabled = ?1", [enabled as i64])?;
        }
        if let Some(embedded) = embedded_combat {
            conn.execute("UPDATE settings SET embedded_combat = ?1", [embedded as i64])?;
        }
        Ok(())
    })
}
