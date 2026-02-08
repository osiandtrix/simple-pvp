use tauri::AppHandle;

pub async fn start(_app: AppHandle) {
    // Cleanup old player_logs every 60 seconds
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        if let Err(e) = cleanup_old_logs() {
            eprintln!("Failed to cleanup old logs: {}", e);
        }
    }
}

fn cleanup_old_logs() -> Result<(), String> {
    crate::db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp();
        conn.execute(
            "DELETE FROM player_logs WHERE CAST(first_hit AS INTEGER) < ?1",
            [now - 46800], // 13 hours
        )?;
        Ok(())
    })
}
