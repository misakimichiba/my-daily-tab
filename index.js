import {DB} from './connect.js';

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('Hello World');
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
  const sql = `INSERT INTO tabs(tab_link, tab_category) VALUES(?, ?)`;
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

app.delete('/tabs', (req, res) => {});

app.listen(3000, (err) => {
  if (err) {
    console.log('ERROR: ', err.message);
    return;
  }
  console.log('Listening on port 3000');
});