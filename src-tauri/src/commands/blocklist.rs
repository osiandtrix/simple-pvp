use crate::db;
use crate::db::models::BlockedGuild;

#[tauri::command]
pub fn fetch_blocked_guilds() -> Result<Vec<BlockedGuild>, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT guild_id, guild_name FROM blocked_guilds")?;
        let guilds = stmt
            .query_map([], |row| {
                Ok(BlockedGuild {
                    guild_id: row.get(0)?,
                    guild_name: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(guilds)
    })
}

#[tauri::command]
pub fn block_guild(guild_id: i64, guild_name: String) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute(
            "INSERT OR IGNORE INTO blocked_guilds (guild_id, guild_name) VALUES (?1, ?2)",
            rusqlite::params![guild_id, guild_name],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn unblock_guild(guild_id: i64) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute(
            "DELETE FROM blocked_guilds WHERE guild_id = ?1",
            rusqlite::params![guild_id],
        )?;
        Ok(())
    })
}
