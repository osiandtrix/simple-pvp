use crate::commands::api_client::PlayerMeResponse;

pub async fn fetch_me(api_key: &str) -> Result<PlayerMeResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = crate::api::client::post(
        "https://api.simple-mmo.com/v1/player/me",
        api_key,
    ).await?;

    let status = response.status();
    let body = response.text().await?;

    if !status.is_success() {
        return Err(format!("API returned {}: {}", status, body).into());
    }

    let data: PlayerMeResponse = serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse response: {} - body: {}", e, body))?;
    Ok(data)
}
