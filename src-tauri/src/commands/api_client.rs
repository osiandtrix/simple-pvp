use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayerMeResponse {
    pub id: i64,
    pub name: String,
    pub level: i64,
    pub guild: Option<GuildInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildInfo {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildWarResponse {
    pub guild_1: GuildWarSide,
    pub guild_2: GuildWarSide,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildWarSide {
    pub id: i64,
    pub name: String,
    pub kills: i64,
}

#[tauri::command]
pub async fn validate_api_key(api_key: String) -> Result<PlayerMeResponse, String> {
    crate::api::player::fetch_me(&api_key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_guild_wars(guild_id: i64, api_key: String) -> Result<Vec<GuildWarResponse>, String> {
    crate::api::guild::fetch_wars(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_guild_members(
    guild_id: i64,
    api_key: String,
) -> Result<Vec<crate::db::models::GuildMember>, String> {
    crate::api::guild::fetch_members(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())
}
