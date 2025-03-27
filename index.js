import {DB} from './connect.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import config from 'dotenv';
import path from 'path';
const __dirname = path.resolve();

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/tab-list', (req, res) => {
  res.sendFile(__dirname + '/tab-list.html');
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

app.delete('/tabs', (req, res) => {
  res.set('content-type', 'application/json');
  const sql = `DELETE FROM tabs WHERE tab_id=?`;
  try{
    DB.run(sql, [req.query.id], function(err) {
      if (err) {
        throw err;
      }
      if(this.changes === 1) {
        res.status(200);
        res.send(`{"message":"Tab ${req.query.id} has been deleted"}`);
      } else {
        res.status(200);
        res.send({"message":"Tab not found"});
      }
      res.status(200);
      let data = { status: 200, message: `Tab ${req.body.tab_id} has been deleted`};
      let content = JSON.stringify(data);
      res.send(content);
    });
  }catch(err) {
    console.log(err.message);
    res.status(467).send(`{"code":467, "status": "${err.message}"}`);
  }
});

app.listen(3000, (err) => {
  if (err) {
    console.log('ERROR: ', err.message);
    return;
  }
  console.log('Listening on port 3000');
});