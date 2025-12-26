import {DB} from './connect.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
const __dirname = path.resolve();

const app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get random tab from table
function getRandomTab() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT tab_id, tab_link, tab_category FROM tabs ORDER BY RANDOM() LIMIT 1`;

    DB.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error("No data found"));

      resolve({
        tab_id: rows[0].tab_id,
        tab_link: rows[0].tab_link,
        tab_category: rows[0].tab_category
      });
    });
  });
}

// get all tabs from table
function getAllTabs() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM tabs`;
    let data = [];
    DB.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      rows.forEach(row=>{
        data.push({tab_link: row.tab_link, tab_id: row.tab_id, tab_category: row.tab_category});
      })
      let content = JSON.stringify(data);
      resolve(content);
    });
  });
}

app.get('/', async (req, res) => {
  try {
    const randomTab = await getRandomTab();

    res.render('index', {
      tab_link: randomTab.tab_link,
      tab_id: randomTab.tab_id
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});


app.get('/tab-list', async (req, res) => {
  let tabList = await getAllTabs();
  let tabArray = JSON.parse(tabList);
  res.render('tab-list', { tab_list: tabArray });
});

app.get('/tabs', (req, res) => {
  // get all tabs from table
  res.set('content-type', 'application/json');
  const sql = `SELECT * FROM tabs`;
  let data = {tabs: []};
  try {
    DB.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach(row=>{
        data.tabs.push({tab_id: row.tab_id,
        tab_link: row.tab_link,
        tab_category: row.tab_category});
      })
      let content = JSON.stringify(data);
      res.send(content);
    });
  } catch (err) {
    console.log(err.message);
    res.status(467).send(`{"code":467, "status": "${err.message}"}`);
  }
});

app.post('/tabs', (req, res) => {
  // get all tabs from table
  console.log(req.body);

  res.set('content-type', 'application/json');
  const sql = `INSERT INTO tabs(tab_link, tab_category) VALUES (? , ?)`;
  let newId;

  try {
    DB.run(sql, [req.body.link, req.body.category], function(err) {
      if (err) {
        throw err;
      }
      newId = this.lastID;
      res.status(201);
      let data = { status: 201, message: `Tab ${newId} has been created`};
      let content = JSON.stringify(data);
      res.send(content);
    })
  } catch (err) {
    console.log(err.message);
    res.status(467).send(`{"code":468, "status": "${err.message}"}`);
  }
});

app.delete('/tabs/:id', (req, res) => {
  const sql = `DELETE FROM tabs WHERE tab_id=?`;

  DB.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 1) {
      return res.status(200).json({
        message: `Tab link has been deleted`
      });
    } else {
      return res.status(404).json({
        message: 'Tab link not found'
      });
    }
  });
});

app.listen(3000, (err) => {
  if (err) {
    console.log('ERROR: ', err.message);
    return;
  }
  console.log('Listening on port 3000');
});