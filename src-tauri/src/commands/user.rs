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
