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
  password: 'nodejs',
  database: 'study',
};

const connTwo = {
  host: '127.0.0.1',
  port: '3306',
  user: 'root2',
  password: 'express',
  database: 'userInfo',
};

let connection = mysql.createConnection(conn); // DB 커넥션 생성
let connectionTWo = mysql.createConnection(connTwo);

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
  connection.connect(function (err) {
    // connection.connect() : DB접속
    if (err) throw err;
    console.log('Connected!');
    var sql = `INSERT INTO board (writer, title, content) VALUES ('','','reackHook')`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log('1 record inserted');
      res.send({ message: 'SUCCESS' });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
