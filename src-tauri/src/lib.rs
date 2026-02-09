mod db;
mod commands;
mod api;
mod hotkeys;
mod scheduler;

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;

use once_cell::sync::Lazy;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::ShortcutState;

// Debounce map: tracks last fire time per shortcut key to suppress
// Windows duplicate global shortcut events (fires twice without admin).
static SHORTCUT_DEBOUNCE: Lazy<Mutex<HashMap<String, Instant>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        let key_str = shortcut.to_string();

                        // Debounce: ignore duplicate fires within 300ms
                        {
                            let mut map = SHORTCUT_DEBOUNCE.lock().unwrap();
                            if let Some(last) = map.get(&key_str) {
                                if last.elapsed().as_millis() < 300 {
                                    return;
                                }
                            }
                            map.insert(key_str.clone(), Instant::now());
                        }

                        if let Ok(binds) = crate::commands::keybinds::fetch_keybinds() {
                            for bind in &binds {
                                if bind.new_key.eq_ignore_ascii_case(&key_str) || bind.original_key.eq_ignore_ascii_case(&key_str) {
                                    let _ = app.emit(&bind.original_key, ());
                                    break;
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Initialize database
            let db_path = app.path().app_data_dir().unwrap().join("data.db");
            std::fs::create_dir_all(db_path.parent().unwrap()).ok();
            db::init(&db_path).expect("Failed to initialize database");

            // Start background scheduler
            let handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                scheduler::start(handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::user::fetch_userdata,
            commands::user::update_userdata,
            commands::settings::fetch_settings,
            commands::settings::update_settings,
            commands::wars::fetch_war_entries,
            commands::wars::update_warlist,
            commands::wars::fetch_targets,
            commands::combat::get_combat_url,
            commands::combat::combat_overlay_action,
            commands::combat::navigate_combat,
            commands::combat::update_target_hit,
            commands::combat::fetch_target_logs,
            commands::keybinds::fetch_keybinds,
            commands::keybinds::update_keybind,
            commands::api_client::validate_api_key,
            commands::api_client::fetch_guild_wars,
            commands::api_client::fetch_guild_members,
            commands::api_client::get_rate_limit,
            commands::version::fetch_version,
            commands::version::run_migrations,
            commands::blocklist::fetch_blocked_guilds,
            commands::blocklist::block_guild,
            commands::blocklist::unblock_guild,
            hotkeys::register_shortcuts,
            hotkeys::unregister_shortcuts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
