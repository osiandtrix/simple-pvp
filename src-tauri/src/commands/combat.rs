use crate::db;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn navigate_combat(app: AppHandle, url: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("combat") {
        window
            .eval(&format!("window.location.href = '{}';", url.replace('\'', "\\'")))
            .map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn update_target_hit(user_id: i64, hit: i64) -> Result<(), String> {
    db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp().to_string();
        conn.execute(
            "INSERT INTO player_logs (user_id, hits, first_hit) VALUES (?1, ?2, ?3)
             ON CONFLICT(user_id) DO UPDATE SET hits = hits + ?2",
            rusqlite::params![user_id, hit, now],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn fetch_target_logs(user_ids: Vec<i64>) -> Result<Vec<crate::db::models::PlayerLog>, String> {
    db::with_conn(|conn| {
        if user_ids.is_empty() {
            return Ok(vec![]);
        }
        let placeholders: String = user_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let sql = format!(
            "SELECT user_id, hits, first_hit FROM player_logs WHERE user_id IN ({})",
            placeholders
        );
        let mut stmt = conn.prepare(&sql)?;
        let params: Vec<Box<dyn rusqlite::types::ToSql>> = user_ids
            .iter()
            .map(|id| Box::new(*id) as Box<dyn rusqlite::types::ToSql>)
            .collect();
        let refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        let logs = stmt.query_map(refs.as_slice(), |row| {
            Ok(crate::db::models::PlayerLog {
                user_id: row.get(0)?,
                hits: row.get(1)?,
                first_hit: row.get(2)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        Ok(logs)
    })
}
