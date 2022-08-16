const express = require('express');
const app = express();
const mysql = require('mysql'); // mysql 모듈 로드
var jwt = require('jsonwebtoken');
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

// app.get('/api/list', (req, res) => {
//   connection.query('SELECT * from board', function (error, results, fields) {
//     if (error) throw error;
//     res.send(results);
//     // res.render('list', { data: results });
//   });
// });

app.get('/list', (req, res) => {
  connection.query('SELECT * from board', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
    // res.render('list', { data: results });
  });
});

app.post('/post', (req, res) => {
  console.log(req.body);
  connection.connect(function (err) {
    // connection.connect() : DB접속
    if (err) throw err;
    console.log('Connected!');
    var sql = `INSERT INTO board (writer, title, content) VALUES ('','','${req.body.content.postContent}')`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log('1 record inserted');
      res.send({ message: 'SUCCESS' });
    });
  });
});

// app.post('/signUp', (req, res) => {
//   console.log(req);
//   connection.connect(function (err) {
//     //  connection.connect() : DB접속
//     if (err) throw err;
//     console.log('Connected!');
//     var sql = `INSERT INTO userInfo (user_id, user_pw, user_name) VALUES ('${req.body.user_id}', '${req.body.user_pw}', '${req.body.user_name}')`;
//     connection.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log('1 record inserted');
//       res.send({ message: 'SUCCESS' });
//     });
//   });
// });

app.post('/signUp', (req, res) => {
  console.log(req);
  connection.connect(function (err) {
    //  connection.connect() : DB접속
    if (err) throw err;
    console.log('Connected!');
    connection.query(
      {
        sql: `INSERT INTO userInfo (user_id, user_pw, user_name) VALUES = ?, ?, ?`,
      },
      ['req.body.user_id', 'req.body.user_pw', 'req.body.user_name'],
      function (err, result) {
        if (err) throw err;
        console.log('1 record inserted');
        res.send({ message: 'SUCCESS' });
      }
    );
  });
});

app.post('/signIn', (req, res) => {
  connection.connect(function (err) {
    //  connection.connect() : DB접속
    if (err) throw err;
    // console.log('Connected!');
    connection.query(
      { sql: `SELECT user_id FROM userInfo where user_id=? AND user_pw=?` },
      [req.body.user_id, req.body.user_pw],
      function (err, result) {
        console.log(result);
        if (err) throw err;
        let token = jwt.sign(
          {
            user_id: req.body.user_id,
            user_pw: req.body.user_pw, // payload, private claims : 로그인 정보
          },
          'secretkey', // 비밀키(서명을 만들 때 사용되는 암호 문자열) -> signature
          {
            subject: 'younghyun login jwtToken',
            expiresIn: '60m',
            issuer: 'younghyun',
          } // JWT생성할 때 사용되는 옵션. registered claims
        );
        console.log('토큰생성\n', token);
        res.send({ token: token });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
