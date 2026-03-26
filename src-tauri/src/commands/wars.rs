use crate::db;
use crate::db::models::War;

#[tauri::command]
pub fn fetch_war_entries() -> Result<Vec<War>, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare(
            "SELECT attacker, attacker_id, attacker_kills, defender, defender_id, defender_kills FROM wars"
        )?;
        let wars = stmt.query_map([], |row| {
            Ok(War {
                attacker: row.get(0)?,
                attacker_id: row.get(1)?,
                attacker_kills: row.get(2)?,
                defender: row.get(3)?,
                defender_id: row.get(4)?,
                defender_kills: row.get(5)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        Ok(wars)
    })
}

#[tauri::command]
pub fn update_warlist(wars: Vec<War>) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute("DELETE FROM wars", [])?;
        let mut stmt = conn.prepare(
            "INSERT INTO wars (attacker, attacker_id, attacker_kills, defender, defender_id, defender_kills) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
        )?;
        for war in &wars {
            stmt.execute(rusqlite::params![
                war.attacker, war.attacker_id, war.attacker_kills,
                war.defender, war.defender_id, war.defender_kills,
            ])?;
        }
        Ok(())
    })
}

#[tauri::command]
pub async fn fetch_targets(
    guild_id: i64,
    api_key: String,
    min_level: Option<i64>,
    max_level: Option<i64>,
) -> Result<Vec<crate::db::models::Target>, String> {
    // Fetch guild members from API
    let members = crate::api::guild::fetch_members(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())?;

    let now = chrono::Utc::now().timestamp();

    // Filter targets
    let targets: Vec<crate::db::models::Target> = members
        .into_iter()
        .filter(|m| {
            m.safe_mode == 0
                && m.banned == 0
                && (m.level > 200 || m.last_activity.map_or(false, |la| (now - la) < 600))
                && m.max_hp > 0
                && (m.current_hp as f64 / m.max_hp as f64) >= 0.5
                && min_level.map_or(true, |ml| m.level >= ml)
                && max_level.map_or(true, |ml| m.level <= ml)
        })
        .map(|m| crate::db::models::Target {
            user_id: m.user_id,
            name: m.name,
            level: m.level,
            current_hp: m.current_hp,
            max_hp: m.max_hp,
        })
        .collect();

    Ok(targets)
}
