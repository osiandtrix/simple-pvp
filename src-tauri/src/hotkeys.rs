use tauri::AppHandle;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

#[tauri::command]
pub fn register_shortcuts(app: AppHandle) -> Result<(), String> {
    unregister_all(&app)?;
    register_all(&app)
}

#[tauri::command]
pub fn unregister_shortcuts(app: AppHandle) -> Result<(), String> {
    unregister_all(&app)
}

pub fn register_all(app: &AppHandle) -> Result<(), String> {
    let keybinds = crate::commands::keybinds::fetch_keybinds()?;

    for kb in &keybinds {
        if let Ok(shortcut) = kb.new_key.parse::<Shortcut>() {
            app.global_shortcut()
                .register(shortcut)
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

pub fn unregister_all(app: &AppHandle) -> Result<(), String> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| e.to_string())
}
