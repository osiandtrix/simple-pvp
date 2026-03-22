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
        window
            .eval(&format!("window.location.href = '{}';", url.replace('\'', "\\'")))
            .map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn record_kill(user_id: i64) -> Result<(), String> {
    db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp();
        conn.execute(
            "INSERT INTO player_kills (user_id, killed_at) VALUES (?1, ?2)",
            rusqlite::params![user_id, now],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn check_kill_blocked(app: AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("combat") {
        // Detect "killed them X times" popups — check fresh each time, set hash immediately
        window
            .eval(
                r#"(function(){var b=document.body&&(document.body.innerText.includes('killed them 3 times')||document.body.innerText.includes('killed them 4 times'));if(b){window.location.hash='kill-blocked';}else if(window.location.hash==='#kill-blocked'){window.location.hash='';}})();"#,
            )
            .map_err(|e| e.to_string())?;

        // Small delay to let the eval execute before reading URL
        std::thread::sleep(std::time::Duration::from_millis(50));

        let url = window.url().map_err(|e| e.to_string())?.to_string();
        Ok(url.contains("#kill-blocked"))
    } else {
        Ok(false)
    }
}

/// Bulk check cooldowns for filtering targets during fetch.
/// Returns set of user_ids that are on cooldown.
pub fn get_cooled_down_users(conn: &rusqlite::Connection, user_ids: &[i64]) -> Result<std::collections::HashSet<i64>, rusqlite::Error> {
    if user_ids.is_empty() {
        return Ok(std::collections::HashSet::new());
    }

    let now = chrono::Utc::now().timestamp();
    let twenty_four_hours_ago = now - 24 * 3600;
    let twelve_hours = 12 * 3600;
    let twenty_four_hours = 24 * 3600;

    let placeholders: String = user_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let sql = format!(
        "SELECT user_id, killed_at FROM player_kills WHERE user_id IN ({}) AND killed_at > ?{} ORDER BY user_id, killed_at DESC",
        placeholders,
        user_ids.len() + 1
    );
    let mut stmt = conn.prepare(&sql)?;

    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = user_ids
        .iter()
        .map(|id| Box::new(*id) as Box<dyn rusqlite::types::ToSql>)
        .collect();
    params.push(Box::new(twenty_four_hours_ago));

    let refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let rows: Vec<(i64, i64)> = stmt
        .query_map(refs.as_slice(), |row| Ok((row.get(0)?, row.get(1)?)))?
        .collect::<Result<Vec<_>, _>>()?;

    // Group kills by user_id
    let mut kills_by_user: std::collections::HashMap<i64, Vec<i64>> = std::collections::HashMap::new();
    for (uid, killed_at) in rows {
        kills_by_user.entry(uid).or_default().push(killed_at);
    }

    let mut blocked = std::collections::HashSet::new();
    for (uid, kills) in &kills_by_user {
        // Already sorted DESC from query
        // Check 4x first — if both conditions are true, 4x takes priority
        if kills.len() >= 4 && (now - kills[3]) < twenty_four_hours {
            blocked.insert(*uid);
        } else if kills.len() >= 3 && (now - kills[2]) < twelve_hours {
            blocked.insert(*uid);
        }
    }

    Ok(blocked)
}

#[tauri::command]
pub fn fetch_cooldowns() -> Result<Vec<crate::db::models::PlayerCooldown>, String> {
    db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp();
        let twenty_four_hours_ago = now - 24 * 3600;
        let twelve_hours = 12 * 3600;
        let twenty_four_hours = 24 * 3600;

        // Get all kills within the last 24 hours, grouped by user
        let mut stmt = conn.prepare(
            "SELECT user_id, killed_at FROM player_kills WHERE killed_at > ?1 ORDER BY user_id, killed_at DESC"
        )?;
        let rows: Vec<(i64, i64)> = stmt
            .query_map([twenty_four_hours_ago], |row| Ok((row.get(0)?, row.get(1)?)))?
            .collect::<Result<Vec<_>, _>>()?;

        let mut kills_by_user: std::collections::HashMap<i64, Vec<i64>> = std::collections::HashMap::new();
        for (uid, killed_at) in rows {
            kills_by_user.entry(uid).or_default().push(killed_at);
        }

        let mut cooldowns = Vec::new();
        for (uid, kills) in &kills_by_user {
            let kill_count = kills.len() as i64;

            // Determine cooldown type and expiry
            // Check 4x first — if both conditions are true, 4x takes priority
            let (cooldown_type, expires_at) = if kills.len() >= 4 && (now - kills[3]) < twenty_four_hours {
                // 4x blocked: expires when 4th kill ages past 24h
                ("4x", kills[3] + twenty_four_hours)
            } else if kills.len() >= 3 && (now - kills[2]) < twelve_hours {
                // 3x blocked: expires when 3rd kill ages past 12h
                ("3x", kills[2] + twelve_hours)
            } else {
                // Not on cooldown, but has recent kills - show as trackable
                continue;
            };

            cooldowns.push(crate::db::models::PlayerCooldown {
                user_id: *uid,
                kill_count,
                cooldown_type: cooldown_type.to_string(),
                expires_at,
                kill_timestamps: kills.clone(),
            });
        }

        // Sort by expiry (soonest first)
        cooldowns.sort_by_key(|c| c.expires_at);
        Ok(cooldowns)
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
