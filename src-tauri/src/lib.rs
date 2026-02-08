mod db;
mod commands;
mod api;
mod hotkeys;
mod scheduler;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Initialize database
            let db_path = app.path().app_data_dir().unwrap().join("data.db");
            std::fs::create_dir_all(db_path.parent().unwrap()).ok();
            db::init(&db_path).expect("Failed to initialize database");

            // Apply always-on-top from saved settings
            if let Ok(settings) = commands::settings::fetch_settings() {
                if settings.always_on_top {
                    if let Some(window) = app.get_webview_window("main") {
                        window.set_always_on_top(true).ok();
                    }
                }
            }

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
            commands::combat::navigate_combat,
            commands::combat::update_target_hit,
            commands::combat::fetch_target_logs,
            commands::keybinds::fetch_keybinds,
            commands::keybinds::update_keybind,
            commands::api_client::validate_api_key,
            commands::api_client::fetch_guild_wars,
            commands::api_client::fetch_guild_members,
            commands::settings::set_always_on_top,
            commands::version::fetch_version,
            commands::version::run_migrations,
            hotkeys::register_shortcuts,
            hotkeys::unregister_shortcuts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
