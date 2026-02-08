# SMMO Yaka Tauri Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Electron with Tauri v2, modernize the frontend with shadcn-vue + Pinia, optimize SimpleMMO API usage with a Rust backend, and remove all dead code.

**Architecture:** Tauri v2 Rust backend handles all database operations (rusqlite), API calls (reqwest with rate limiting), global shortcuts, and scheduled tasks (tokio). Vue 3 frontend uses shadcn-vue for UI, Pinia for state, and Tauri's invoke() for async IPC. Combat is embedded as an in-app WebView instead of a separate window.

**Tech Stack:** Tauri v2, Rust (rusqlite, reqwest, tokio, serde), Vue 3 (Composition API), shadcn-vue, Tailwind CSS, Pinia, Vite, TypeScript

---

## Prerequisites

- Rust toolchain installed (`rustup`)
- Node.js 18+
- Tauri CLI: `cargo install tauri-cli`

---

## Phase 1: Scaffold Tauri Project & Rust Backend Core

### Task 1: Initialize Tauri v2 project

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`
- Create: `src-tauri/icons/` (copy from existing `assets/`)

**Step 1: Initialize Tauri in the project root**

From the project root, run:
```bash
npm create tauri-app@latest -- --template vue-ts
```

However, since we have an existing project, instead manually scaffold:

```bash
cd D:\GitHub\simple-pvp
cargo init src-tauri --name smmo-yaka
```

**Step 2: Configure Cargo.toml**

Replace `src-tauri/Cargo.toml` with:

```toml
[package]
name = "smmo-yaka"
version = "1.1.4"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.31", features = ["bundled"] }
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }
chrono = "0.4"
log = "0.4"
env_logger = "0.11"
dirs = "5"
thiserror = "1"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[lib]
name = "smmo_yaka_lib"
crate-type = ["lib", "cdylib", "staticlib"]
```

**Step 3: Create build.rs**

Create `src-tauri/build.rs`:
```rust
fn main() {
    tauri_build::build()
}
```

**Step 4: Create tauri.conf.json**

Create `src-tauri/tauri.conf.json`:
```json
{
  "$schema": "https://raw.githubusercontent.com/nicerapp/tauri/refs/heads/dev/crates/tauri-cli/schema.json",
  "productName": "SMMO Yaka",
  "version": "1.1.4",
  "identifier": "com.smmo-yaka.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "SMMO Yaka",
        "width": 500,
        "height": 750,
        "minWidth": 500,
        "minHeight": 200,
        "resizable": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://api.simple-mmo.com; style-src 'self' 'unsafe-inline'"
    }
  },
  "plugins": {
    "global-shortcut": {
      "enabled": true
    }
  }
}
```

**Step 5: Create main.rs entry point**

Create `src-tauri/src/main.rs`:
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    smmo_yaka_lib::run();
}
```

**Step 6: Create lib.rs with Tauri app builder**

Create `src-tauri/src/lib.rs`:
```rust
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
            commands::combat::update_target_hit,
            commands::combat::fetch_target_logs,
            commands::keybinds::fetch_keybinds,
            commands::keybinds::update_keybind,
            commands::api_client::validate_api_key,
            commands::api_client::fetch_guild_wars,
            commands::api_client::fetch_guild_members,
            commands::version::fetch_version,
            commands::version::run_migrations,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Step 7: Create module stubs**

Create these stub files so the project compiles:

`src-tauri/src/db/mod.rs`:
```rust
pub mod models;
pub mod migrations;

use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

static DB: once_cell::sync::Lazy<Mutex<Option<Connection>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(None));

pub fn init(path: &Path) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    migrations::run_all(&conn)?;
    *DB.lock().unwrap() = Some(conn);
    Ok(())
}

pub fn with_conn<F, T>(f: F) -> Result<T, String>
where
    F: FnOnce(&Connection) -> Result<T, rusqlite::Error>,
{
    let guard = DB.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Database not initialized")?;
    f(conn).map_err(|e| e.to_string())
}
```

`src-tauri/src/db/models.rs`:
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserData {
    pub userid: i64,
    pub guildid: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub max_level: Option<i64>,
    pub api_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct War {
    pub attacker: String,
    pub attacker_id: i64,
    pub attacker_kills: i64,
    pub defender: String,
    pub defender_id: i64,
    pub defender_kills: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Keybind {
    pub original_key: String,
    pub new_key: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlayerLog {
    pub user_id: i64,
    pub hits: i64,
    pub first_hit: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuildMember {
    pub user_id: i64,
    pub name: String,
    pub level: i64,
    pub safe_mode: i64,
    pub banned: i64,
    pub current_hp: i64,
    pub max_hp: i64,
    pub last_activity: Option<i64>,
    pub user_kills: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Target {
    pub user_id: i64,
    pub name: String,
    pub level: i64,
    pub current_hp: i64,
    pub max_hp: i64,
}
```

`src-tauri/src/db/migrations.rs`:
```rust
use rusqlite::Connection;

pub fn run_all(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS version (
            v_number VARCHAR(5) PRIMARY KEY,
            date TEXT
        );
        CREATE TABLE IF NOT EXISTS userdata (
            userid INTEGER PRIMARY KEY,
            guildid INTEGER
        );
        CREATE TABLE IF NOT EXISTS settings (
            max_level INTEGER,
            api_key TEXT
        );
        CREATE TABLE IF NOT EXISTS wars (
            attacker VARCHAR(100),
            attacker_id INTEGER,
            attacker_kills INTEGER,
            defender VARCHAR(100),
            defender_id INTEGER,
            defender_kills INTEGER
        );
        CREATE TABLE IF NOT EXISTS remaps (
            original_key VARCHAR(25) PRIMARY KEY,
            new_key VARCHAR(25)
        );
        CREATE TABLE IF NOT EXISTS player_logs (
            user_id INTEGER PRIMARY KEY,
            hits INTEGER,
            first_hit TEXT
        );
        CREATE TABLE IF NOT EXISTS guild_logs (
            guild_id INTEGER PRIMARY KEY,
            timestamp TEXT
        );
        CREATE TABLE IF NOT EXISTS stats (
            session_id INTEGER PRIMARY KEY AUTOINCREMENT,
            start TEXT,
            end_time TEXT,
            kills INTEGER DEFAULT 0
        );"
    )?;

    // Insert default settings row if not exists
    conn.execute(
        "INSERT OR IGNORE INTO settings (max_level, api_key) VALUES (NULL, NULL)",
        [],
    )?;

    Ok(())
}
```

`src-tauri/src/commands/mod.rs`:
```rust
pub mod user;
pub mod settings;
pub mod wars;
pub mod combat;
pub mod keybinds;
pub mod api_client;
pub mod version;
```

`src-tauri/src/api/mod.rs`:
```rust
pub mod client;
pub mod player;
pub mod guild;
```

`src-tauri/src/hotkeys.rs`:
```rust
// Global shortcut management - implemented in Task 3
```

`src-tauri/src/scheduler.rs`:
```rust
use tauri::AppHandle;

pub async fn start(_app: AppHandle) {
    // Cleanup old player_logs every 60 seconds
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        if let Err(e) = cleanup_old_logs() {
            log::error!("Failed to cleanup old logs: {}", e);
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
```

**Step 8: Add once_cell dependency**

Add to `src-tauri/Cargo.toml` under `[dependencies]`:
```toml
once_cell = "1"
```

**Step 9: Commit**

```bash
git add src-tauri/
git commit -m "feat: scaffold Tauri v2 project with Rust backend structure"
```

---

### Task 2: Implement Rust Tauri Commands (IPC Handlers)

**Files:**
- Create: `src-tauri/src/commands/user.rs`
- Create: `src-tauri/src/commands/settings.rs`
- Create: `src-tauri/src/commands/wars.rs`
- Create: `src-tauri/src/commands/combat.rs`
- Create: `src-tauri/src/commands/keybinds.rs`
- Create: `src-tauri/src/commands/api_client.rs`
- Create: `src-tauri/src/commands/version.rs`

**Step 1: Implement user commands**

Create `src-tauri/src/commands/user.rs`:
```rust
use crate::db;
use crate::db::models::UserData;

#[tauri::command]
pub fn fetch_userdata() -> Result<Option<UserData>, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT userid, guildid FROM userdata LIMIT 1")?;
        let result = stmt.query_row([], |row| {
            Ok(UserData {
                userid: row.get(0)?,
                guildid: row.get(1)?,
            })
        });
        match result {
            Ok(data) => Ok(Some(data)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    })
}

#[tauri::command]
pub fn update_userdata(userid: i64, guildid: i64) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute("DELETE FROM userdata", [])?;
        conn.execute(
            "INSERT INTO userdata (userid, guildid) VALUES (?1, ?2)",
            [userid, guildid],
        )?;
        Ok(())
    })
}
```

**Step 2: Implement settings commands**

Create `src-tauri/src/commands/settings.rs`:
```rust
use crate::db;
use crate::db::models::Settings;

#[tauri::command]
pub fn fetch_settings() -> Result<Settings, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare("SELECT max_level, api_key FROM settings LIMIT 1")?;
        stmt.query_row([], |row| {
            Ok(Settings {
                max_level: row.get(0)?,
                api_key: row.get(1)?,
            })
        })
    })
}

#[tauri::command]
pub fn update_settings(max_level: Option<i64>, api_key: Option<String>) -> Result<(), String> {
    db::with_conn(|conn| {
        if let Some(level) = max_level {
            conn.execute("UPDATE settings SET max_level = ?1", [level])?;
        }
        if let Some(key) = api_key {
            conn.execute("UPDATE settings SET api_key = ?1", [key])?;
        }
        Ok(())
    })
}
```

**Step 3: Implement wars commands**

Create `src-tauri/src/commands/wars.rs`:
```rust
use crate::db;
use crate::db::models::War;

#[tauri::command]
pub fn fetch_war_entries() -> Result<Vec<War>, String> {
    db::with_conn(|conn| {
        let mut stmt = conn.prepare(
            "SELECT attacker, attacker_id, attacker_kills, defender, defender_id, defender_kills FROM wars"
        )?;
        let wars = stmt.query_map([], |row| {
            Ok(War {
                attacker: row.get(0)?,
                attacker_id: row.get(1)?,
                attacker_kills: row.get(2)?,
                defender: row.get(3)?,
                defender_id: row.get(4)?,
                defender_kills: row.get(5)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        Ok(wars)
    })
}

#[tauri::command]
pub fn update_warlist(wars: Vec<War>) -> Result<(), String> {
    db::with_conn(|conn| {
        conn.execute("DELETE FROM wars", [])?;
        let mut stmt = conn.prepare(
            "INSERT INTO wars (attacker, attacker_id, attacker_kills, defender, defender_id, defender_kills) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
        )?;
        for war in &wars {
            stmt.execute(rusqlite::params![
                war.attacker, war.attacker_id, war.attacker_kills,
                war.defender, war.defender_id, war.defender_kills,
            ])?;
        }
        Ok(())
    })
}

#[tauri::command]
pub async fn fetch_targets(
    guild_id: i64,
    api_key: String,
    max_level: Option<i64>,
) -> Result<Vec<crate::db::models::Target>, String> {
    // Fetch guild members from API
    let members = crate::api::guild::fetch_members(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())?;

    // Get existing hit logs
    let user_ids: Vec<i64> = members.iter().map(|m| m.user_id).collect();
    let logs = crate::db::with_conn(|conn| {
        let placeholders: String = user_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        if placeholders.is_empty() {
            return Ok(vec![]);
        }
        let sql = format!("SELECT user_id, hits FROM player_logs WHERE user_id IN ({})", placeholders);
        let mut stmt = conn.prepare(&sql)?;
        let params: Vec<Box<dyn rusqlite::types::ToSql>> = user_ids
            .iter()
            .map(|id| Box::new(*id) as Box<dyn rusqlite::types::ToSql>)
            .collect();
        let refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        let logs = stmt.query_map(refs.as_slice(), |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?))
        })?.collect::<Result<Vec<_>, _>>()?;
        Ok(logs)
    })?;

    let log_map: std::collections::HashMap<i64, i64> = logs.into_iter().collect();
    let now = chrono::Utc::now().timestamp();

    // Filter targets
    let targets: Vec<crate::db::models::Target> = members
        .into_iter()
        .filter(|m| {
            m.safe_mode == 0
                && m.banned == 0
                && (m.level > 200 || m.last_activity.map_or(false, |la| (now - la) < 600))
                && m.max_hp > 0
                && (m.current_hp as f64 / m.max_hp as f64) >= 0.5
                && max_level.map_or(true, |ml| m.level <= ml)
                && log_map.get(&m.user_id).map_or(true, |hits| *hits < 3)
        })
        .map(|m| crate::db::models::Target {
            user_id: m.user_id,
            name: m.name,
            level: m.level,
            current_hp: m.current_hp,
            max_hp: m.max_hp,
        })
        .collect();

    Ok(targets)
}
```

**Step 4: Implement combat commands**

Create `src-tauri/src/commands/combat.rs`:
```rust
use crate::db;

#[tauri::command]
pub fn update_target_hit(user_id: i64, hit: i64) -> Result<(), String> {
    db::with_conn(|conn| {
        let now = chrono::Utc::now().timestamp().to_string();
        conn.execute(
            "INSERT INTO player_logs (user_id, hits, first_hit) VALUES (?1, ?2, ?3)
             ON CONFLICT(user_id) DO UPDATE SET hits = hits + ?2",
            rusqlite::params![user_id, hit, now],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn fetch_target_logs(user_ids: Vec<i64>) -> Result<Vec<crate::db::models::PlayerLog>, String> {
    db::with_conn(|conn| {
        if user_ids.is_empty() {
            return Ok(vec![]);
        }
        let placeholders: String = user_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let sql = format!(
            "SELECT user_id, hits, first_hit FROM player_logs WHERE user_id IN ({})",
            placeholders
        );
        let mut stmt = conn.prepare(&sql)?;
        let params: Vec<Box<dyn rusqlite::types::ToSql>> = user_ids
            .iter()
            .map(|id| Box::new(*id) as Box<dyn rusqlite::types::ToSql>)
            .collect();
        let refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        let logs = stmt.query_map(refs.as_slice(), |row| {
            Ok(crate::db::models::PlayerLog {
                user_id: row.get(0)?,
                hits: row.get(1)?,
                first_hit: row.get(2)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;
        Ok(logs)
    })
}
```

**Step 5: Implement API client commands**

Create `src-tauri/src/commands/api_client.rs`:
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayerMeResponse {
    pub id: i64,
    pub name: String,
    pub level: i64,
    pub guild: Option<GuildInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildInfo {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildWarResponse {
    pub guild_1: GuildWarSide,
    pub guild_2: GuildWarSide,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GuildWarSide {
    pub id: i64,
    pub name: String,
    pub kills: i64,
}

#[tauri::command]
pub async fn validate_api_key(api_key: String) -> Result<PlayerMeResponse, String> {
    crate::api::player::fetch_me(&api_key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_guild_wars(guild_id: i64, api_key: String) -> Result<Vec<GuildWarResponse>, String> {
    crate::api::guild::fetch_wars(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_guild_members(
    guild_id: i64,
    api_key: String,
) -> Result<Vec<crate::db::models::GuildMember>, String> {
    crate::api::guild::fetch_members(guild_id, &api_key)
        .await
        .map_err(|e| e.to_string())
}
```

**Step 6: Implement keybind commands**

Create `src-tauri/src/commands/keybinds.rs`:
```rust
use crate::db;
use crate::db::models::Keybind;

const DEFAULT_KEYBINDS: &[(&str, &str)] = &[
    ("Space", "Next target"),
    ("Control+Space", "Previous target"),
    ("Shift+ArrowDown", "Mark current as hit"),
    ("Shift+ArrowLeft", "Mark prior as hit"),
    ("Control+ArrowDown", "Mark current as not hit"),
    ("Control+ArrowLeft", "Mark prior as not hit"),
    ("f", "Open food inventory"),
    ("h", "Open healer"),
    ("r", "Open energy refills"),
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
```

**Step 7: Implement version commands**

Create `src-tauri/src/commands/version.rs`:
```rust
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
```

**Step 8: Commit**

```bash
git add src-tauri/src/commands/
git commit -m "feat: implement all Tauri IPC command handlers"
```

---

### Task 3: Implement API Client Module

**Files:**
- Create: `src-tauri/src/api/client.rs`
- Create: `src-tauri/src/api/player.rs`
- Create: `src-tauri/src/api/guild.rs`

**Step 1: Implement rate-limited API client**

Create `src-tauri/src/api/client.rs`:
```rust
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
    // Check rate limit
    {
        let mut limit = RATE_LIMIT.lock().unwrap();
        if let Some(reset_at) = limit.reset_at {
            if std::time::Instant::now() >= reset_at {
                limit.remaining = 40;
                limit.reset_at = None;
            }
        }
        if limit.remaining == 0 {
            if let Some(reset_at) = limit.reset_at {
                let wait = reset_at - std::time::Instant::now();
                drop(limit);
                tokio::time::sleep(wait).await;
                let mut limit = RATE_LIMIT.lock().unwrap();
                limit.remaining = 40;
                limit.reset_at = None;
            }
        }
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

pub fn get_remaining() -> u32 {
    RATE_LIMIT.lock().unwrap().remaining
}

pub fn get_reset_in_secs() -> Option<u64> {
    let limit = RATE_LIMIT.lock().unwrap();
    limit.reset_at.map(|r| {
        let now = std::time::Instant::now();
        if r > now { (r - now).as_secs() } else { 0 }
    })
}
```

**Step 2: Implement player API**

Create `src-tauri/src/api/player.rs`:
```rust
use crate::commands::api_client::PlayerMeResponse;

pub async fn fetch_me(api_key: &str) -> Result<PlayerMeResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = crate::api::client::post(
        "https://api.simple-mmo.com/v1/player/me",
        api_key,
    ).await?;
    let data: PlayerMeResponse = response.json().await?;
    Ok(data)
}
```

**Step 3: Implement guild API**

Create `src-tauri/src/api/guild.rs`:
```rust
use crate::commands::api_client::{GuildWarResponse};
use crate::db::models::GuildMember;

pub async fn fetch_wars(
    guild_id: i64,
    api_key: &str,
) -> Result<Vec<GuildWarResponse>, Box<dyn std::error::Error + Send + Sync>> {
    let url = format!("https://api.simple-mmo.com/v1/guilds/wars/{}/1", guild_id);
    let response = crate::api::client::post(&url, api_key).await?;
    let wars: Vec<GuildWarResponse> = response.json().await?;
    Ok(wars)
}

pub async fn fetch_members(
    guild_id: i64,
    api_key: &str,
) -> Result<Vec<GuildMember>, Box<dyn std::error::Error + Send + Sync>> {
    let url = format!("https://api.simple-mmo.com/v1/guilds/members/{}", guild_id);
    let response = crate::api::client::post(&url, api_key).await?;
    let members: Vec<GuildMember> = response.json().await?;
    Ok(members)
}
```

**Step 4: Commit**

```bash
git add src-tauri/src/api/
git commit -m "feat: implement rate-limited SimpleMMO API client in Rust"
```

---

### Task 4: Implement Global Shortcuts

**Files:**
- Modify: `src-tauri/src/hotkeys.rs`
- Modify: `src-tauri/src/lib.rs`

**Step 1: Implement global shortcut registration**

Replace `src-tauri/src/hotkeys.rs`:
```rust
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

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
```

**Step 2: Commit**

```bash
git add src-tauri/src/hotkeys.rs
git commit -m "feat: implement global shortcut system for Tauri"
```

---

## Phase 2: Scaffold Vue Frontend with shadcn-vue + Pinia

### Task 5: Set Up Vue 3 Frontend with shadcn-vue

**Files:**
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/index.html`
- Create: `package.json` (root - new)
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `src/assets/index.css`
- Create: `src/lib/utils.ts`

**Step 1: Create root package.json**

```json
{
  "name": "smmo-yaka",
  "version": "1.1.4",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "pinia": "^2.2.0",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-global-shortcut": "^2",
    "@tauri-apps/plugin-shell": "^2",
    "radix-vue": "^1.9.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-vue-next": "^0.460.0",
    "vue-sonner": "^1.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@tauri-apps/cli": "^2"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
});
```

**Step 3: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
```

**Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 5: Create src/assets/index.css with dark theme**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
  }
}
```

**Step 6: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 7: Create src/index.html**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SMMO Yaka</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Note: Move `index.html` to project root (Vite expects it there):
The actual file should be at `./index.html` with the script src pointing to `src/main.ts`.

**Step 8: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 9: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 10: Commit**

```bash
git add src/ package.json vite.config.ts tailwind.config.js postcss.config.js tsconfig.json tsconfig.node.json index.html
git commit -m "feat: scaffold Vue 3 frontend with shadcn-vue and Tailwind"
```

---

### Task 6: Create shadcn-vue UI Components

**Files:**
- Create: `src/components/ui/button.vue`
- Create: `src/components/ui/card.vue`
- Create: `src/components/ui/input.vue`
- Create: `src/components/ui/switch.vue`
- Create: `src/components/ui/tooltip.vue`
- Create: `src/components/ui/sheet.vue`
- Create: `src/components/ui/scroll-area.vue`
- Create: `src/components/ui/table.vue`
- Create: `src/components/ui/dropdown-menu.vue`
- Create: `src/components/ui/badge.vue`
- Create: `src/components/ui/separator.vue`

**Step 1: Install shadcn-vue components**

Run the shadcn-vue CLI to add components:
```bash
npx shadcn-vue@latest init
npx shadcn-vue@latest add button card input switch tooltip sheet scroll-area table dropdown-menu badge separator sonner
```

This auto-generates all the UI primitives into `src/components/ui/`.

**Step 2: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shadcn-vue UI components"
```

---

### Task 7: Create Pinia Stores

**Files:**
- Create: `src/stores/user.ts`
- Create: `src/stores/settings.ts`
- Create: `src/stores/wars.ts`
- Create: `src/stores/process.ts`
- Create: `src/stores/events.ts`

**Step 1: Create user store**

Create `src/stores/user.ts`:
```typescript
import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

interface UserData {
  userid: number;
  guildid: number;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: null as number | null,
    guildId: null as number | null,
  }),

  actions: {
    async init() {
      const data = await invoke<UserData | null>("fetch_userdata");
      if (data) {
        this.userId = data.userid;
        this.guildId = data.guildid;
      }
    },

    async setUser(userId: number, guildId: number) {
      await invoke("update_userdata", { userid: userId, guildid: guildId });
      this.userId = userId;
      this.guildId = guildId;
    },
  },
});
```

**Step 2: Create settings store**

Create `src/stores/settings.ts`:
```typescript
import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

interface Settings {
  max_level: number | null;
  api_key: string | null;
}

interface Keybind {
  original_key: string;
  new_key: string;
  description: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    maxLevel: null as number | null,
    apiKey: null as string | null,
    keybinds: [] as Keybind[],
    appVersion: "",
  }),

  actions: {
    async init() {
      const [settings, version] = await Promise.all([
        invoke<Settings>("fetch_settings"),
        invoke<string>("fetch_version"),
      ]);
      this.maxLevel = settings.max_level;
      this.apiKey = settings.api_key;
      this.appVersion = version;
    },

    async saveApiKey(apiKey: string) {
      await invoke("update_settings", { maxLevel: null, apiKey });
      this.apiKey = apiKey;
    },

    async saveMaxLevel(maxLevel: number) {
      await invoke("update_settings", { maxLevel, apiKey: null });
      this.maxLevel = maxLevel;
    },

    async fetchKeybinds() {
      this.keybinds = await invoke<Keybind[]>("fetch_keybinds");
    },

    async updateKeybind(originalKey: string, newKey: string) {
      await invoke("update_keybind", { originalKey, newKey });
      await this.fetchKeybinds();
    },
  },
});
```

**Step 3: Create wars store**

Create `src/stores/wars.ts`:
```typescript
import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

export interface War {
  attacker: string;
  attacker_id: number;
  attacker_kills: number;
  defender: string;
  defender_id: number;
  defender_kills: number;
}

export interface Target {
  user_id: number;
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
}

export const useWarsStore = defineStore("wars", {
  state: () => ({
    warlist: [] as War[],
    activeGuildIndex: 0,
    targets: [] as Target[],
    targetIndex: 0,
  }),

  getters: {
    currentWar: (state) => state.warlist[state.activeGuildIndex] ?? null,
    currentTarget: (state) => state.targets[state.targetIndex] ?? null,
  },

  actions: {
    async init() {
      this.warlist = await invoke<War[]>("fetch_war_entries");
    },

    async updateWars(guildId: number, apiKey: string) {
      const wars = await invoke<any[]>("fetch_guild_wars", { guildId, apiKey });
      this.warlist = wars.map((w) => ({
        attacker: w.guild_1.name,
        attacker_id: w.guild_1.id,
        attacker_kills: w.guild_1.kills,
        defender: w.guild_2.name,
        defender_id: w.guild_2.id,
        defender_kills: w.guild_2.kills,
      }));
      await invoke("update_warlist", { wars: this.warlist });
    },

    shuffleWars() {
      for (let i = this.warlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.warlist[i], this.warlist[j]] = [this.warlist[j], this.warlist[i]];
      }
    },

    async fetchTargets(guildId: number, apiKey: string, maxLevel: number | null) {
      const newTargets = await invoke<Target[]>("fetch_targets", {
        guildId,
        apiKey,
        maxLevel,
      });
      this.targets.push(...newTargets);
    },

    nextTarget() {
      if (this.targetIndex < this.targets.length - 1) {
        this.targetIndex++;
      }
    },

    previousTarget() {
      if (this.targetIndex > 0) {
        this.targetIndex--;
      }
    },

    setTargetIndex(index: number) {
      this.targetIndex = index;
    },

    nextGuild() {
      if (this.activeGuildIndex < this.warlist.length - 1) {
        this.activeGuildIndex++;
      } else {
        this.activeGuildIndex = 0;
      }
    },

    reset() {
      this.warlist = [];
      this.activeGuildIndex = 0;
      this.targets = [];
      this.targetIndex = 0;
    },
  },
});
```

**Step 4: Create process store**

Create `src/stores/process.ts`:
```typescript
import { defineStore } from "pinia";
import { listen } from "@tauri-apps/api/event";

export const useProcessStore = defineStore("process", {
  state: () => ({
    inCombat: false,
    apiRemaining: 40,
    apiResetAt: null as number | null,
  }),

  getters: {
    apiLimitReached: (state) => state.apiRemaining <= 0,
    resetInSeconds: (state) => {
      if (!state.apiResetAt) return 0;
      return Math.max(0, Math.ceil((state.apiResetAt - Date.now()) / 1000));
    },
  },

  actions: {
    async init() {
      // Listen for combat state changes from Tauri backend
      await listen<boolean>("combat-state-changed", (event) => {
        this.inCombat = event.payload;
      });
    },

    trackApiCall() {
      this.apiRemaining = Math.max(0, this.apiRemaining - 1);
      if (this.apiRemaining === 0 && !this.apiResetAt) {
        this.apiResetAt = Date.now() + 60_000;
      }
    },

    checkApiReset() {
      if (this.apiResetAt && Date.now() >= this.apiResetAt) {
        this.apiRemaining = 40;
        this.apiResetAt = null;
      }
    },

    setInCombat(val: boolean) {
      this.inCombat = val;
    },
  },
});
```

**Step 5: Create events store**

Create `src/stores/events.ts`:
```typescript
import { defineStore } from "pinia";

export interface CombatEvent {
  text: string;
  userId: number;
  userName: string;
  type: "attack" | "hit" | "nothit";
}

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [] as CombatEvent[],
  }),

  actions: {
    push(event: Omit<CombatEvent, "text">) {
      let text = "";
      switch (event.type) {
        case "attack":
          text = `[${event.userId}] ${event.userName} attacked.`;
          break;
        case "hit":
          text = `[${event.userId}] ${event.userName} marked as 'hit'`;
          break;
        case "nothit":
          text = `[${event.userId}] ${event.userName} marked as 'not hit'`;
          break;
      }
      this.events.push({ ...event, text });
    },

    clear() {
      this.events = [];
    },
  },
});
```

**Step 6: Create main.ts entry point**

Create `src/main.ts`:
```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/index.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
```

**Step 7: Commit**

```bash
git add src/stores/ src/main.ts
git commit -m "feat: create Pinia stores replacing Vuex modules"
```

---

### Task 8: Build App Layout Component

**Files:**
- Create: `src/App.vue`
- Create: `src/components/AppHeader.vue`
- Create: `src/components/AppSidebar.vue`

**Step 1: Create AppHeader**

Create `src/components/AppHeader.vue`:
```vue
<script setup lang="ts">
import { Menu, User, HelpCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

defineEmits<{
  toggleSidebar: [];
}>();
</script>

<template>
  <header class="flex h-12 items-center justify-between border-b px-4">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="$emit('toggleSidebar')">
        <Menu class="h-5 w-5" />
      </Button>
      <h1 class="text-lg font-semibold">SMMO Yaka</h1>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon">
          <User class="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <HelpCircle class="mr-2 h-4 w-4" />
          Help
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
```

**Step 2: Create AppSidebar**

Create `src/components/AppSidebar.vue`:
```vue
<script setup lang="ts">
import { Swords, Settings } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useProcessStore } from "@/stores/process";

const process = useProcessStore();

const props = defineProps<{
  open: boolean;
  activePage: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  navigate: [page: string];
}>();

const navItems = [
  { id: "main", label: "Combat", icon: Swords },
  { id: "settings", label: "Settings", icon: Settings },
];

function navigateTo(page: string) {
  if (process.inCombat && page !== "main") return;
  emit("navigate", page);
  emit("update:open", false);
}
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="left" class="w-64 p-0">
      <nav class="flex flex-col gap-1 p-4 pt-12">
        <Button
          v-for="item in navItems"
          :key="item.id"
          :variant="activePage === item.id ? 'secondary' : 'ghost'"
          class="justify-start gap-3"
          :disabled="process.inCombat && item.id !== 'main'"
          @click="navigateTo(item.id)"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </Button>
      </nav>
    </SheetContent>
  </Sheet>
</template>
```

**Step 3: Create App.vue**

Create `src/App.vue`:
```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
import MainView from "./components/MainView.vue";
import SettingsView from "./components/SettingsView.vue";
import { Toaster } from "vue-sonner";
import { useUserStore } from "./stores/user";
import { useSettingsStore } from "./stores/settings";
import { useWarsStore } from "./stores/wars";
import { useProcessStore } from "./stores/process";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();

const sidebarOpen = ref(false);
const activePage = ref("main");

onMounted(async () => {
  await Promise.all([
    user.init(),
    settings.init(),
    wars.init(),
    process.init(),
  ]);
});

const pages: Record<string, any> = {
  main: MainView,
  settings: SettingsView,
};
</script>

<template>
  <div class="flex h-screen flex-col">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar
      v-model:open="sidebarOpen"
      :active-page="activePage"
      @navigate="activePage = $event"
    />
    <main class="flex-1 overflow-auto p-4">
      <component :is="pages[activePage]" />
    </main>
    <Toaster position="bottom-right" theme="dark" />
  </div>
</template>
```

**Step 4: Commit**

```bash
git add src/App.vue src/components/AppHeader.vue src/components/AppSidebar.vue
git commit -m "feat: build app layout with header and sidebar navigation"
```

---

### Task 9: Build Main Combat View

**Files:**
- Create: `src/components/MainView.vue`
- Create: `src/components/WarlistTable.vue`
- Create: `src/components/EventLog.vue`

**Step 1: Create WarlistTable**

Create `src/components/WarlistTable.vue`:
```vue
<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shuffle, RefreshCw } from "lucide-vue-next";
import { useWarsStore } from "@/stores/wars";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { toast } from "vue-sonner";

const wars = useWarsStore();
const user = useUserStore();
const settings = useSettingsStore();

async function updateWars() {
  if (!user.guildId || !settings.apiKey) {
    toast.error("API key and guild ID required");
    return;
  }
  try {
    await wars.updateWars(user.guildId, settings.apiKey);
    toast.success("Wars updated");
  } catch (e) {
    toast.error("Failed to update wars");
  }
}

function shuffleWars() {
  wars.shuffleWars();
}

function getOpponent(war: any) {
  if (war.attacker_id === user.guildId) {
    return { name: war.defender, you: war.attacker_kills, them: war.defender_kills };
  }
  return { name: war.attacker, you: war.defender_kills, them: war.attacker_kills };
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-sm font-medium">Active Wars</CardTitle>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="shuffleWars">
            <Shuffle class="mr-2 h-3 w-3" /> Shuffle
          </Button>
          <Button variant="outline" size="sm" @click="updateWars">
            <RefreshCw class="mr-2 h-3 w-3" /> Update
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="h-[40vh]">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-muted-foreground">
              <th class="pb-2 text-left font-medium">Guild</th>
              <th class="pb-2 text-right font-medium">You</th>
              <th class="pb-2 text-right font-medium">Them</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(war, i) in wars.warlist"
              :key="i"
              class="border-b border-border/50 hover:bg-muted/50"
            >
              <td class="py-2">{{ getOpponent(war).name }}</td>
              <td class="py-2 text-right text-green-400">
                {{ getOpponent(war).you }}
              </td>
              <td class="py-2 text-right text-red-400">
                {{ getOpponent(war).them }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="wars.warlist.length === 0" class="py-8 text-center text-muted-foreground">
          No active wars. Set your API key and update.
        </p>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
```

**Step 2: Create EventLog**

Create `src/components/EventLog.vue`:
```vue
<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Eye, EyeOff, Activity } from "lucide-vue-next";
import { useEventsStore } from "@/stores/events";
import { useWarsStore } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";

const events = useEventsStore();
const wars = useWarsStore();
const process = useProcessStore();

const recentEvents = computed(() =>
  [...events.events].reverse().slice(0, 15)
);

const iconMap = {
  attack: Swords,
  hit: Eye,
  nothit: EyeOff,
};

const colorMap = {
  attack: "text-blue-400",
  hit: "text-green-400",
  nothit: "text-red-400",
};
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-sm font-medium">Combat Log</CardTitle>
        <div class="flex gap-2">
          <Badge variant="secondary">
            Target {{ wars.targetIndex + 1 }}/{{ wars.targets.length }}
          </Badge>
          <Badge variant="secondary">
            Guild {{ wars.activeGuildIndex + 1 }}/{{ wars.warlist.length }}
          </Badge>
          <Badge variant="secondary" :class="process.apiLimitReached ? 'text-red-400' : ''">
            <Activity class="mr-1 h-3 w-3" />
            {{ process.apiRemaining }}/40
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea class="h-[50vh]">
        <div class="space-y-1">
          <div
            v-for="(event, i) in recentEvents"
            :key="i"
            class="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50"
          >
            <component
              :is="iconMap[event.type]"
              class="h-4 w-4 shrink-0"
              :class="colorMap[event.type]"
            />
            <span class="truncate">{{ event.text }}</span>
          </div>
          <p v-if="events.events.length === 0" class="py-4 text-center text-muted-foreground">
            Waiting for combat actions...
          </p>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
```

**Step 3: Create MainView**

Create `src/components/MainView.vue`:
```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Swords, Save } from "lucide-vue-next";
import { toast } from "vue-sonner";
import WarlistTable from "./WarlistTable.vue";
import EventLog from "./EventLog.vue";

import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { useWarsStore } from "@/stores/wars";
import { useProcessStore } from "@/stores/process";
import { useEventsStore } from "@/stores/events";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();
const events = useEventsStore();

const maxLevel = ref(settings.maxLevel ?? 0);
const keybindsActive = ref(true);
const initiatingCombat = ref(false);

const unlisteners: UnlistenFn[] = [];

onMounted(async () => {
  maxLevel.value = settings.maxLevel ?? 0;

  // Listen for keybind events from Tauri backend
  unlisteners.push(
    await listen("Space", handleSpaceBar),
    await listen("Control+Space", handleCtrlSpace),
    await listen("Control+ArrowLeft", handleCtrlArrowLeft),
    await listen("Shift+ArrowLeft", handleShiftArrowLeft),
    await listen("Shift+ArrowDown", handleShiftArrowDown),
    await listen("Control+ArrowDown", handleCtrlArrowDown),
  );

  // API rate limit reset interval
  const interval = setInterval(() => process.checkApiReset(), 100);
  unlisteners.push(() => clearInterval(interval));
});

onUnmounted(() => {
  unlisteners.forEach((fn) => fn());
});

watch(() => settings.maxLevel, (val) => {
  maxLevel.value = val ?? 0;
});

async function saveMaxLevel() {
  await settings.saveMaxLevel(maxLevel.value);
  toast.success("Max level saved");
}

async function enterCombat() {
  if (!settings.apiKey || wars.warlist.length === 0) return;
  initiatingCombat.value = true;

  try {
    await fetchTargets();
    process.setInCombat(true);
    events.clear();
  } catch (e) {
    toast.error("Failed to enter combat");
  } finally {
    initiatingCombat.value = false;
  }
}

async function fetchTargets() {
  const initialCount = wars.targets.length === 0 ? -1 : wars.targets.length;

  while (wars.targets.length <= initialCount || !wars.currentTarget) {
    process.checkApiReset();
    if (process.apiLimitReached) {
      const resetIn = process.resetInSeconds;
      toast.warning(`API limit reached. Retrying in ${resetIn}s`);
      await sleep(resetIn * 1000);
    }

    const currentWar = wars.currentWar;
    if (!currentWar) break;

    const guildId =
      currentWar.attacker_id === user.guildId
        ? currentWar.defender_id
        : currentWar.attacker_id;

    try {
      process.trackApiCall();
      await wars.fetchTargets(guildId, settings.apiKey!, settings.maxLevel);
      wars.nextGuild();
    } catch {
      process.trackApiCall();
    }
  }
}

async function handleSpaceBar() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;

  await invoke("update_target_hit", { userId: target.user_id, hit: 1 });
  events.push({
    userId: target.user_id,
    userName: target.name,
    type: "attack",
  });

  wars.nextTarget();

  // Pre-fetch more targets if running low
  if (wars.targets.length - wars.targetIndex < 5) {
    fetchTargets();
  }
}

function handleCtrlSpace() {
  if (!process.inCombat) return;
  wars.previousTarget();
}

async function handleShiftArrowLeft() {
  if (!process.inCombat || wars.targetIndex === 0) return;
  const prev = wars.targets[wars.targetIndex - 1];
  if (!prev) return;
  await invoke("update_target_hit", { userId: prev.user_id, hit: 1 });
  events.push({ userId: prev.user_id, userName: prev.name, type: "hit" });
}

async function handleCtrlArrowLeft() {
  if (!process.inCombat || wars.targetIndex === 0) return;
  const prev = wars.targets[wars.targetIndex - 1];
  if (!prev) return;
  await invoke("update_target_hit", { userId: prev.user_id, hit: -1 });
  events.push({ userId: prev.user_id, userName: prev.name, type: "nothit" });
}

async function handleShiftArrowDown() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;
  await invoke("update_target_hit", { userId: target.user_id, hit: 1 });
  events.push({ userId: target.user_id, userName: target.name, type: "hit" });
}

async function handleCtrlArrowDown() {
  if (!process.inCombat || !wars.currentTarget) return;
  const target = wars.currentTarget;
  await invoke("update_target_hit", { userId: target.user_id, hit: -1 });
  events.push({ userId: target.user_id, userName: target.name, type: "nothit" });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exitCombat() {
  process.setInCombat(false);
  wars.reset();
  wars.init();
  events.clear();
}
</script>

<template>
  <div class="space-y-4">
    <!-- Setup Card -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium">Combat Setup</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs text-muted-foreground">Max Level</label>
            <Input v-model.number="maxLevel" type="number" placeholder="Max target level" />
          </div>
          <Button variant="outline" size="sm" :disabled="!maxLevel" @click="saveMaxLevel">
            <Save class="mr-2 h-3 w-3" /> Save
          </Button>
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Switch
              v-model:checked="keybindsActive"
              :disabled="!process.inCombat"
            />
            <span class="text-sm">Keybinds</span>
          </div>

          <div class="flex gap-2">
            <Button
              v-if="process.inCombat"
              variant="outline"
              size="sm"
              @click="exitCombat"
            >
              Exit Combat
            </Button>
            <Button
              variant="destructive"
              size="sm"
              :disabled="!maxLevel || !settings.apiKey || wars.warlist.length === 0 || process.inCombat || initiatingCombat"
              @click="enterCombat"
            >
              <Swords class="mr-2 h-3 w-3" />
              {{ initiatingCombat ? "Loading..." : "Enter Combat" }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Content: EventLog during combat, Warlist otherwise -->
    <EventLog v-if="process.inCombat" />
    <WarlistTable v-else />
  </div>
</template>
```

**Step 4: Commit**

```bash
git add src/components/MainView.vue src/components/WarlistTable.vue src/components/EventLog.vue
git commit -m "feat: build main combat view with warlist and event log"
```

---

### Task 10: Build Settings View

**Files:**
- Create: `src/components/SettingsView.vue`
- Create: `src/components/KeybindsList.vue`
- Create: `src/components/KeyboardKey.vue`

**Step 1: Create KeyboardKey display component**

Create `src/components/KeyboardKey.vue`:
```vue
<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{ keys: string }>();

const keyParts = computed(() =>
  props.keys.split("+").map((k) => {
    const map: Record<string, string> = {
      ArrowUp: "\u2191", ArrowDown: "\u2193",
      ArrowLeft: "\u2190", ArrowRight: "\u2192",
      Control: "Ctrl", " ": "Space",
    };
    return map[k] ?? k;
  })
);
</script>

<template>
  <span class="inline-flex items-center gap-0.5">
    <template v-for="(key, i) in keyParts" :key="i">
      <span v-if="i > 0" class="text-xs text-muted-foreground">+</span>
      <Badge variant="outline" class="px-1.5 py-0.5 font-mono text-xs">
        {{ key }}
      </Badge>
    </template>
  </span>
</template>
```

**Step 2: Create KeybindsList**

Create `src/components/KeybindsList.vue`:
```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KeyboardKey from "./KeyboardKey.vue";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const remapping = ref<string | null>(null);
const pressedKeys = ref<string[]>([]);

onMounted(() => {
  settings.fetchKeybinds();
});

function startRemap(originalKey: string) {
  remapping.value = originalKey;
  pressedKeys.value = [];
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

function onKeyDown(e: KeyboardEvent) {
  e.preventDefault();
  const key = e.key === " " ? "Space" : e.key;
  if (!pressedKeys.value.includes(key)) {
    pressedKeys.value.push(key);
  }
}

function onKeyUp() {
  if (pressedKeys.value.length === 0 || !remapping.value) return;
  const combo = pressedKeys.value.join("+");
  settings.updateKeybind(remapping.value, combo);
  cancelRemap();
}

function cancelRemap() {
  remapping.value = null;
  pressedKeys.value = [];
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-sm font-medium">Keybinds</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Remap overlay -->
      <div
        v-if="remapping"
        class="mb-4 rounded-lg border bg-muted p-4 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Press new key combination for:
          <strong>{{ remapping }}</strong>
        </p>
        <p v-if="pressedKeys.length" class="mt-2 text-lg font-mono">
          {{ pressedKeys.join(" + ") }}
        </p>
        <Button variant="ghost" size="sm" class="mt-2" @click="cancelRemap">
          Cancel
        </Button>
      </div>

      <div class="space-y-2">
        <div
          v-for="kb in settings.keybinds"
          :key="kb.original_key"
          class="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50"
        >
          <span class="text-sm">{{ kb.description }}</span>
          <Button
            variant="outline"
            size="sm"
            :disabled="!!remapping"
            @click="startRemap(kb.original_key)"
          >
            <KeyboardKey :keys="kb.new_key" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
```

**Step 3: Create SettingsView**

Create `src/components/SettingsView.vue`:
```vue
<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save, Check, AlertCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";
import KeybindsList from "./KeybindsList.vue";
import { useSettingsStore } from "@/stores/settings";
import { useUserStore } from "@/stores/user";

const settings = useSettingsStore();
const user = useUserStore();

const apiKeyInput = ref(settings.apiKey ?? "");
const saving = ref(false);

async function saveApiKey() {
  if (!apiKeyInput.value.trim()) return;
  saving.value = true;

  try {
    const player = await invoke<{
      id: number;
      name: string;
      guild?: { id: number; name: string };
    }>("validate_api_key", { apiKey: apiKeyInput.value });

    await settings.saveApiKey(apiKeyInput.value);
    await user.setUser(player.id, player.guild?.id ?? 0);

    toast.success(`Logged in as ${player.name}`);
  } catch {
    toast.error("Invalid API key");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium">API Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs text-muted-foreground">API Key</label>
            <Input
              v-model="apiKeyInput"
              type="password"
              placeholder="Enter your SimpleMMO API key"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="!apiKeyInput.trim() || saving"
            @click="saveApiKey"
          >
            <Save class="mr-2 h-3 w-3" />
            {{ saving ? "Validating..." : "Save" }}
          </Button>
        </div>
        <p v-if="settings.apiKey" class="mt-2 flex items-center gap-1 text-xs text-green-400">
          <Check class="h-3 w-3" /> API key configured
        </p>
      </CardContent>
    </Card>

    <Separator />

    <KeybindsList />
  </div>
</template>
```

**Step 4: Commit**

```bash
git add src/components/SettingsView.vue src/components/KeybindsList.vue src/components/KeyboardKey.vue
git commit -m "feat: build settings view with API key input and keybind remapping"
```

---

## Phase 3: Cleanup & Deletion

### Task 11: Remove All Electron & Legacy Code

**Files to delete:**
- Delete entire: `electron/` directory
- Delete: `electron-builder.yml`
- Delete entire: `frontend/` directory
- Delete: `yarn-error.log`
- Delete: Root-level `yarn.lock`
- Delete: Root-level old `package.json` (replaced by new one)
- Delete: Root-level old `tsconfig.json` (replaced by new one)
- Delete: `simplemmo-api.txt` (reference doc, no longer needed in repo)

**Step 1: Remove electron directory**

```bash
rm -rf electron/
```

**Step 2: Remove frontend directory**

```bash
rm -rf frontend/
```

**Step 3: Remove legacy config files**

```bash
rm -f electron-builder.yml yarn-error.log yarn.lock simplemmo-api.txt
```

**Step 4: Verify only new structure remains**

```bash
ls -la
# Should show: src-tauri/, src/, package.json, vite.config.ts, tailwind.config.js, etc.
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove all Electron and legacy frontend code"
```

---

### Task 12: Install Dependencies & Verify Build

**Step 1: Install frontend dependencies**

```bash
npm install
```

**Step 2: Verify frontend builds**

```bash
npm run build
```

Expected: Vite builds successfully to `dist/`.

**Step 3: Verify Rust backend compiles**

```bash
cd src-tauri && cargo build
```

Expected: Compiles without errors.

**Step 4: Run the full Tauri app in dev mode**

```bash
npm run tauri dev
```

Expected: App window opens with shadcn-vue dark theme, header, sidebar, combat setup, and warlist.

**Step 5: Commit final state**

```bash
git add -A
git commit -m "chore: verify full Tauri build and clean project state"
```

---

## Summary of Changes

| Before | After |
|--------|-------|
| Electron (Node.js) | Tauri v2 (Rust) |
| better-sqlite3 | rusqlite |
| electron-store | Tauri app data dir + rusqlite |
| Vuetify 3 (beta) | shadcn-vue + Tailwind CSS |
| Vuex 4 | Pinia |
| IPC callbacks (send/receive) | Tauri invoke() (async/await) |
| Axios (frontend API calls) | reqwest (Rust backend API calls) |
| Client-side rate limit counter | Server-side rate limiter reading X-RateLimit headers |
| Separate combat BrowserWindow | In-app combat view |
| cron (Node.js) | tokio timer (Rust) |
| ~95 files | ~40 files |

### Files Deleted (Cleanup)
- `electron/` (57 files) - entire Electron backend
- `frontend/` (29 files) - entire old frontend
- `electron-builder.yml`
- `yarn-error.log` (x2)
- `yarn.lock`
- `simplemmo-api.txt`
