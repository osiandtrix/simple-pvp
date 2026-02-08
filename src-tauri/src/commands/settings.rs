use crate::db;
use crate::db::models::Settings;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn fetch_settings() -> Result<Settings, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT max_level, api_key, always_on_top FROM settings LIMIT 1")?;
        stmt.query_row([], |row| {
            Ok(Settings {
                max_level: row.get(0)?,
                api_key: row.get(1)?,
                always_on_top: row.get::<_, i64>(2).unwrap_or(0) != 0,
            })
        })
    })
}

#[tauri::command]
pub fn update_settings(max_level: Option<i64>, api_key: Option<String>) -> Result<(), String> {
    db::with_conn(|conn| {
        if let Some(level) = max_level {
            conn.execute("UPDATE settings SET max_level = ?1", [level])?;
        }
        if let Some(key) = api_key {
            conn.execute("UPDATE settings SET api_key = ?1", rusqlite::params![key])?;
        }
        Ok(())
    })
}

#[tauri::command]
pub fn set_always_on_top(app: AppHandle, enabled: bool) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute(
            "UPDATE settings SET always_on_top = ?1",
            [if enabled { 1i64 } else { 0 }],
        )?;
        Ok(())
    })?;

    if let Some(window) = app.get_webview_window("main") {
        window.set_always_on_top(enabled).map_err(|e| e.to_string())?;
    }

    Ok(())
}
