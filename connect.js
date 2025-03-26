import sqlite3 from 'sqlite3';
const sql3 = sqlite3.verbose();

// Different ways to create DB but results in the DB not being saved after shutting down the program

// const DB = new sql3.Database(':memory:', sqlite3.OPEN_READWRITE, connected);
// const DB = new sql3.Database('', sqlite3.OPEN_READWRITE, connected);

const DB = new sql3.Database('./mydata.db', sqlite3.OPEN_READWRITE, connected);

function connected(err) {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log('Created the DB or SQLite DB already exists.');
}

let sql = `CREATE TABLE IF NOT EXISTS tabs(
  tab_id INTEGER PRIMARY KEY,
  tab_link TEXT NOT NULL,
  tab_category TEXT NOT NULL
)`;

DB.run(sql, [], (err)=>{
  //callback function
  if (err) {
    console.log("Problem creating the table: ", err.message);
    return;
  }
  console.log("Created the table");
});

export { DB };