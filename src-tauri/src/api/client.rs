use reqwest::Client;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static RATE_LIMIT: Lazy<Mutex<RateLimit>> = Lazy::new(|| {
    Mutex::new(RateLimit {
        remaining: 40,
        reset_at: None,
    })
});

struct RateLimit {
    remaining: u32,
    reset_at: Option<std::time::Instant>,
}

pub async fn post(url: &str, api_key: &str) -> Result<reqwest::Response, reqwest::Error> {
    // Check rate limit - extract wait duration while holding lock, then release before await
    let wait_duration = {
        let mut limit = RATE_LIMIT.lock().unwrap();
        if let Some(reset_at) = limit.reset_at {
            if std::time::Instant::now() >= reset_at {
                limit.remaining = 40;
                limit.reset_at = None;
            }
        }
        if limit.remaining == 0 {
            limit.reset_at.map(|reset_at| {
                let now = std::time::Instant::now();
                if reset_at > now {
                    reset_at - now
                } else {
                    std::time::Duration::ZERO
                }
            })
        } else {
            None
        }
    };

    // Await outside of lock scope
    if let Some(wait) = wait_duration {
        tokio::time::sleep(wait).await;
        let mut limit = RATE_LIMIT.lock().unwrap();
        limit.remaining = 40;
        limit.reset_at = None;
    }

    let client = Client::new();
    let response = client
        .post(url)
        .form(&[("api_key", api_key)])
        .send()
        .await?;

    // Update rate limit from response headers
    {
        let mut limit = RATE_LIMIT.lock().unwrap();
        if let Some(remaining) = response.headers().get("X-RateLimit-Remaining") {
            if let Ok(val) = remaining.to_str().unwrap_or("40").parse::<u32>() {
                limit.remaining = val;
            }
        } else {
            limit.remaining = limit.remaining.saturating_sub(1);
        }
        if limit.remaining == 0 && limit.reset_at.is_none() {
            limit.reset_at = Some(std::time::Instant::now() + std::time::Duration::from_secs(60));
        }
    }

    Ok(response)
}
