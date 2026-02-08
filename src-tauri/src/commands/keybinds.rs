use crate::db;
use crate::db::models::Keybind;

const DEFAULT_KEYBINDS: &[(&str, &str)] = &[
    ("Space", "Next Target"),
    ("Control+Space", "Previous Target"),
];

#[tauri::command]
pub fn fetch_keybinds() -> Result<Vec<Keybind>, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT original_key, new_key FROM remaps")?;
        let remaps: std::collections::HashMap<String, String> = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?
            .collect::<Result<std::collections::HashMap<_, _>, _>>()?;

        let keybinds: Vec<Keybind> = DEFAULT_KEYBINDS
            .iter()
            .map(|(key, desc)| {
                let new_key = remaps
                    .get(*key)
                    .cloned()
                    .unwrap_or_else(|| key.to_string());
                Keybind {
                    original_key: key.to_string(),
                    new_key,
                    description: desc.to_string(),
                }
            })
            .collect();

        Ok(keybinds)
    })
}

#[tauri::command]
pub fn update_keybind(original_key: String, new_key: String) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute(
            "INSERT INTO remaps (original_key, new_key) VALUES (?1, ?2)
             ON CONFLICT(original_key) DO UPDATE SET new_key = ?2",
            rusqlite::params![original_key, new_key],
        )?;
        Ok(())
    })
}
