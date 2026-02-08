use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

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

    let app_handle = app.clone();

    app.global_shortcut().on_shortcuts(
        keybinds.iter().filter_map(|kb| {
            kb.new_key.parse::<Shortcut>().ok()
        }).collect::<Vec<_>>(),
        move |_app, shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let key_str = shortcut.to_string();
                // Find which original key this maps to
                if let Ok(binds) = crate::commands::keybinds::fetch_keybinds() {
                    for bind in &binds {
                        if bind.new_key == key_str || bind.original_key == key_str {
                            let _ = app_handle.emit(&bind.original_key, ());
                            break;
                        }
                    }
                }
            }
        },
    ).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn unregister_all(app: &AppHandle) -> Result<(), String> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| e.to_string())
}
