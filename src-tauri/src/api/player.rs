use crate::commands::api_client::PlayerMeResponse;

pub async fn fetch_me(api_key: &str) -> Result<PlayerMeResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = crate::api::client::post(
        "https://api.simple-mmo.com/v1/player/me",
        api_key,
    ).await?;
    let data: PlayerMeResponse = response.json().await?;
    Ok(data)
}
