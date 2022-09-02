const express = require('express');
const app = express();
const mysql = require('mysql'); // mysql 모듈 로드
var jwt = require('jsonwebtoken');
const port = 3000;
const cors = require('cors');
const { resolveInclude } = require('ejs');

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

let connection = mysql.createConnection(conn); // DB 커넥션 생성

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
  const verify = jwt.verify(req.headers.authorization, 'secretkey');
  connection.query(
    { sql: `SELECT * FROM board where board.writer=?` },
    [`${verify.id}`],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

// app.get('/category', (req, res) => {
//   const verify = jwt.verify(req.headers.authorization, 'secretkey');
//   connection.query(
//     {
//       sql: `SELECT * FROM board left JOIN category ON board.product_id = category.product_id where board.writer=?`,
//     },
//     [`${verify.id}`],
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

app.get('/category', (req, res) => {
  const verify = jwt.verify(req.headers.authorization, 'secretkey');
  connection.query(
    {
      sql: `SELECT * FROM category where category.writer=?`,
    },
    [`${verify.id}`],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.get('/selectCategory', (req, res) => {
  const verify = jwt.verify(req.headers.authorization, 'secretkey');
  const selectedCategory = req.query.category;
  console.log(selectedCategory);

  connection.query(
    {
      sql: `SELECT * FROM board left JOIN category ON board.product_id = category.product_id  where board.writer=? AND category.category =? `,
    },
    [`${verify.id}`, `${selectedCategory}`],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.get('/searchData', (req, res) => {
  // console.log(req);
  const verify = jwt.verify(req.headers.authorization, 'secretkey');
  const searchData = req.query.searchData;
  // console.log(searchData);

  connection.query(
    {
      sql: `SELECT * FROM board left JOIN category ON board.product_id = category.product_id  where board.writer=? AND board.title =?`,
    },
    [`${verify.id}`, `${searchData}`],
    function (error, results, fields) {
      console.log(results);
      if (error) throw error;
      res.send(results);
    }
  );
});

app.post('/post', (req, res) => {
  // connection.connect(function (err) {
  // // connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');
  const verify = jwt.verify(req.headers.authorization, 'secretkey');
  connection.query(
    {
      sql: `INSERT INTO board  (writer, title, content) VALUES (?, ?, ?)`,
    },
    [
      `${verify.id}`,
      `${req.body.content.postTitle}`,
      `${req.body.content.postContent}`,
    ],

    function (err, result) {
      if (err) throw err;
      console.log('1 record inserted');
      res.send({ message: 'SUCCESS' });
    }
  );
  // });
});

app.post('/signUp', (req, res) => {
  // connection.connect(function (err) {
  //  connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');
  connection.query(
    {
      sql: `INSERT INTO userInfo (user_id, user_pw, user_name) VALUES(?, ?, ?)`,
    },
    [`${req.body.user_id}`, `${req.body.user_pw}`, `${req.body.user_name}`],
    function (err, result) {
      if (err) throw err;
      console.log('1 record inserted');
      res.send({ message: 'SUCCESS' });
    }
  );
  // });
});

app.post('/signIn', (req, res) => {
  // connection.connect(function (err) {
  //  connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');

  connection.query(
    { sql: `SELECT id FROM userInfo where user_id=? AND user_pw=?` },
    [req.body.user_id, req.body.user_pw],
    function (err, result) {
      if (err) throw err;
      if (result.length !== 0) {
        let token = jwt.sign(
          {
            id: result[0].id, // payload, private claims : 로그인 정보
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
      } else {
        res.send({ message: 'INVALID_USER' });
      }
    }
  );
  // });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
