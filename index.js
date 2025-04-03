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

app.get('/', (req, res) => {
  res.render('index', { tab_link: 'https://www.google.com.my/search?q=sorolla&client=safari&hl=en-my&prmd=inv&sxsrf=AJOqlzWCrC7w6YIhc8Bp_cummW-LqRwqnQ:1677049955850&source=lnms&sa=X&ved=2ahUKEwjx9433yaj9AhUS3XMBHVreCJIQ_AUoAXoECAIQAQ&biw=375&bih=635&dpr=3&udm=2' });
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