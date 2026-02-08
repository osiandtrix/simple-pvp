# Simple PvP Companion

A lightweight desktop companion app for [SimpleMMO](https://web.simple-mmo.com) guild wars. It loads your active wars, queues up enemy targets, and lets you cycle through attacks with keyboard shortcuts - so you can focus on fighting instead of clicking around.

![Windows](https://img.shields.io/badge/Windows-0078D4?style=flat&logo=windows&logoColor=white)

---

## What It Does

- Shows all your active guild wars in one place
- Loads enemy guild members as targets automatically
- Opens an attack window and lets you move through targets with a single keypress
- Filters targets by level so you only fight who you want
- Tracks your attacks in a live combat log
- Block guilds from the war list so they're skipped during combat
- Floating overlay with Back/Next buttons when keybinds are off
- Handles API rate limits in the background so you don't have to worry about them

## Getting Started

### 1. Get Your API Key

You'll need a SimpleMMO API key. You can find this in your SimpleMMO account settings.

### 2. Install

Download the latest installer from [Releases](../../releases) and run it.

### 3. Set Up

1. Open the app and go to **Settings** (gear icon in the sidebar)
2. Paste your API key and click **Save**
3. The app will validate your key and log you in

### 4. Set Level Filters

On the **Combat** page, enter your preferred **Min Level** and **Max Level** to filter which enemies show up as targets, then click **Save**.

## How to Use

### Attacking All Wars

1. Go to the **Combat** page
2. Your active wars are listed in a table showing guild names and kill counts
3. Click **Enter Combat**
4. An attack window opens with your first target
5. Press **Space** to attack and move to the next target
6. The app automatically loads more targets as you go
7. Click **Exit** when you're done

### Attacking a Specific Guild

If you want to focus on one guild:

1. Hover over a guild in the war list
2. Click the crosshair icon on the right
3. The app loads only that guild's members as targets
4. When you've gone through all of them, combat ends automatically

### Keyboard Shortcuts

| Key       | Action      |
| --------- | ----------- |
| **Space** | Next target |

This keybind is locked and cannot be remapped.

You can toggle keybinds on/off during combat by clicking the keybind indicator. When keybinds are off, a floating overlay with Back/Next buttons appears over the combat window.

To set whether keybinds start on or off when entering combat, go to **Settings** > **Combat Preferences**.

## During Combat

While in combat, the main window shows a live log with:

- **Targets** - your position in the queue (e.g. 5/23)
- **Guilds** - which guild you're on
- **API Limit** - remaining API calls before the rate limit resets

The app handles rate limits automatically. If you hit the limit, it waits for the cooldown and resumes on its own.

## Tips

- **Sort the war list** by clicking column headers (guild name, your kills, their kills) to prioritize which guilds to attack
- **Shuffle** the war list to randomize your attack order
- **Update** the war list to refresh kill counts and pick up new wars
- **Block guilds** you don't want to fight by clicking the ban icon in the war list — unblock them from the **Blocked** page
- Use the **Food**, **Healer**, and **Energy** quick-nav buttons during combat to access those pages without leaving the combat window
- Keep an eye on the API counter during long sessions

## Building From Source

Requires [Node.js](https://nodejs.org/), [Rust](https://rustup.rs/), and the [Tauri CLI](https://v2.tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri build
```

The installer will be in `src-tauri/target/release/bundle/nsis/`.
