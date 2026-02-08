use crate::commands::api_client::GuildWarResponse;
use crate::db::models::GuildMember;

pub async fn fetch_wars(
    guild_id: i64,
    api_key: &str,
) -> Result<Vec<GuildWarResponse>, Box<dyn std::error::Error + Send + Sync>> {
    let url = format!("https://api.simple-mmo.com/v1/guilds/wars/{}/1", guild_id);
    let response = crate::api::client::post(&url, api_key).await?;
    let wars: Vec<GuildWarResponse> = response.json().await?;
    Ok(wars)
}

pub async fn fetch_members(
    guild_id: i64,
    api_key: &str,
) -> Result<Vec<GuildMember>, Box<dyn std::error::Error + Send + Sync>> {
    let url = format!("https://api.simple-mmo.com/v1/guilds/members/{}", guild_id);
    let response = crate::api::client::post(&url, api_key).await?;
    let members: Vec<GuildMember> = response.json().await?;
    Ok(members)
}
