const express = require('express');
const app = express();
const mysql = require('mysql'); // mysql 모듈 로드
// const bcrypt = require('bcrypt');
// var jwt = require('jsonwebtoken');
const port = 3000;
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const conn = {
  // mysql 접속 설정
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'dudgus1670!',
  database: 'study',
};

let connection = mysql.createConnection(conn); // DB 커넥션 생성
connection.connect(); // DB 접속

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.html');
});

// app.get('/list', (req, res) => {
//   connection.query('SELECT * from board', function (error, results, fields) {
//     if (error) throw error;
//     res.render('list', { data: results });
//   });
// });

app.get('/api/list', (req, res) => {
  connection.query('SELECT * from board', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
    // res.render('list', { data: results });
  });
});

app.get('/list', (req, res) => {
  connection.query('SELECT * from board', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
    // res.render('list', { data: results });
  });
});

app.post('/post', (req, res) => {
  console.log(req.body.content);
  res.send(`message: SUCCESS`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
