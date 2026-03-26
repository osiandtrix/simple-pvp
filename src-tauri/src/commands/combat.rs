use crate::db;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn get_combat_url(app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window("combat") {
        window.url().map(|u| u.to_string()).map_err(|e| e.to_string())
    } else {
        Err("Combat window not found".into())
    }
}

#[tauri::command]
pub fn combat_overlay_action(app: AppHandle, action: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let js = match action.as_str() {
            "next" => "window.__overlayNext && window.__overlayNext()",
            "back" => "window.__overlayBack && window.__overlayBack()",
            _ => return Err(format!("Unknown action: {}", action)),
        };
        window.eval(js).map_err(|e| e.to_string())
    } else {
        Err("Main window not found".into())
    }
}

#[tauri::command]
pub fn navigate_combat(app: AppHandle, url: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("combat") {
        let parsed = url::Url::parse(&url).map_err(|e| e.to_string())?;
        window
            .navigate(parsed)
            .map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
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
