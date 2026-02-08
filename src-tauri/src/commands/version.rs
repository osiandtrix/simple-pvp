#[tauri::command]
pub fn fetch_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
pub fn run_migrations() -> Result<(), String> {
    crate::db::with_conn(|conn| {
        crate::db::migrations::run_all(conn)
    })
}
