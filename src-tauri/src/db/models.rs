use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
    pub userid: i64,
    pub guildid: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub min_level: i64,
    pub max_level: Option<i64>,
    pub api_key: Option<String>,
    pub always_on_top: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct War {
    pub attacker: String,
    pub attacker_id: i64,
    pub attacker_kills: i64,
    pub defender: String,
    pub defender_id: i64,
    pub defender_kills: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Keybind {
    pub original_key: String,
    pub new_key: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlayerLog {
    pub user_id: i64,
    pub hits: i64,
    pub first_hit: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuildMember {
    pub user_id: i64,
    pub name: String,
    pub level: i64,
    pub safe_mode: i64,
    pub banned: i64,
    pub current_hp: i64,
    pub max_hp: i64,
    pub last_activity: Option<i64>,
    pub user_kills: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Target {
    pub user_id: i64,
    pub name: String,
    pub level: i64,
    pub current_hp: i64,
    pub max_hp: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(dead_code)]
pub struct BlockedGuild {
    pub guild_id: i64,
    pub guild_name: String,
}
