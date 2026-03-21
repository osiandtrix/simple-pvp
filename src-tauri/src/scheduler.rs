use tauri::AppHandle;

pub async fn start(_app: AppHandle) {
    // Cleanup old kill records every 60 seconds
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        if let Err(e) = cleanup_old_kills() {
            eprintln!("Failed to cleanup old kills: {}", e);
        }
    }
}

fn cleanup_old_kills() -> Result<(), String> {
    crate::db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp();
        // Keep 25 hours of history (24h cooldown + 1h buffer)
        conn.execute(
            "DELETE FROM player_kills WHERE killed_at < ?1",
            [now - 90000],
        )?;
        // Also clean legacy player_logs
        conn.execute(
            "DELETE FROM player_logs WHERE CAST(first_hit AS INTEGER) < ?1",
            [now - 90000],
        )?;
        Ok(())
    })
}
