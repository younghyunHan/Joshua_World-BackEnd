const express = require("express");
const app = express();
const port = 3000;

const mysql = require("mysql"); // mysql 모듈 로드

var jwt = require("jsonwebtoken");

const cors = require("cors");
const { resolveInclude } = require("ejs");

const multer = require("multer");
const path = require("path");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("uploads"));

const conn = {
  // mysql 접속 설정
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "0000",
  database: "study",
};

let connection = mysql.createConnection(conn); // DB 커넥션 생성

// app.engine("html", require("ejs").renderFile);
// app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   res.render("index.html");
// });

app.post("/signUp", (req, res) => {
  // connection.connect(function (err) {
  //  connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');
  connection.query(
    {
      sql: `INSERT INTO userInfo (user_id, user_pw, user_name) VALUES(?, MD5(?), ?)`,
    },
    [`${req.body.user_id}`, `${req.body.user_pw}`, `${req.body.user_name}`],
    function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      res.send({ message: "SUCCESS" });
    }
  );
  // });
});

app.post("/signIn", (req, res) => {
  // connection.connect(function (err) {
  //  connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');

  connection.query(
    { sql: `SELECT id FROM userInfo where user_id=? AND user_pw=MD5(?)` },
    [req.body.user_id, req.body.user_pw],
    function (err, result) {
      if (err) throw err;
      if (result.length !== 0) {
        let token = jwt.sign(
          {
            id: result[0].id, // payload, private claims : 로그인 정보
          },
          "secretkey", // 비밀키(서명을 만들 때 사용되는 암호 문자열) -> signature
          {
            subject: "younghyun login jwtToken",
            expiresIn: "60m",
            issuer: "younghyun",
          } // JWT 생성할 때 사용되는 옵션. registered claims
        );
        console.log("토큰생성\n", token);
        res.send({ token: token });
      } else {
        res.send({ message: "INVALID_USER" });
      }
    }
  );
  // });
});

// app.get("/list", (req, res) => {
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   connection.query(
//     { sql: `SELECT * FROM board where board.writer=?` },
//     [`${verify.id}`],
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

// app.get("/category", (req, res) => {
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   connection.query(
//     {
//       sql: `SELECT * FROM category where category.writer=?`,
//     },
//     [`${verify.id}`],
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

// app.get("/userName", (req, res) => {
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   connection.query(
//     {
//       sql: `SELECT userInfo.user_name FROM userInfo where userInfo.id=?`,
//     },
//     [`${verify.id}`],
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

// app.get("/selectCategory", (req, res) => {
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   const selectedCategory = req.query.category;
//   console.log(selectedCategory);

//   connection.query(
//     {
//       sql: `SELECT board.id, board.title FROM board left JOIN category ON board.product_id = category.product_id  where board.writer=? AND category.category =?`,
//     },
//     [`${verify.id}`, `${selectedCategory}`],
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

// app.get("/searchData", (req, res) => {
//   // console.log(req);
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   const searchData = req.query.searchData;
//   // console.log(searchData);

//   connection.query(
//     {
//       sql: `SELECT * FROM board left JOIN category ON board.product_id = category.product_id  where board.writer=? AND board.title =?`,
//     },
//     [`${verify.id}`, `${searchData}`],
//     function (error, results, fields) {
//       console.log(results);
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

const upload = multer({
  // storage : 어디에 저장할 것인지
  // 서버 디스크에 저장하거나 AWS S3와 같은 외부에 저장.
  // multer-s3나 multer-google-storage와 같은 모듈을 찾아서 활용.
  storage: multer.diskStorage({
    // destination은 저장할 경로. 동일 경로 내 uploads에 저장할 것임.
    // uploads 폴더를 생성해 둘 것.
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    // filename은 저장할 파일의 이름
    filename(req, file, cb) {
      // ext는 확장자 명을 말함.
      const ext = path.extname(file.originalname);
      // basename은 파일 이름. 파일 이름 + 현재 시간 + 확장자로 정함.
      // 날짜를 붙이는 건 중복을 피하기 위함.
      cb(
        null,
        path.basename(file.originalname, ext) + new Date().valueOf() + ext
      );
    },
  }),
  // limit : 파일 사이즈 제한 (byte 단위) 아래는 5mb 까지만 허용함을 의미
  // limit: { fileSize: 5 * 1024 * 2014 },
});

app.post("/userInfoUpdate", upload.single("user_img"), (req, res) => {
  const verify = jwt.verify(req.headers.authorization, "secretkey");
  console.log(verify);
  // console.log(req.file); // 이미지 파일
  // console.log(req.body); // 닉네임, 비밀번호

  connection.query(
    {
      sql: `UPDATE userInfo SET user_name=?, user_pw=MD5(?), user_img=? where userInfo.id=?`,
    },
    [
      `${req.body.user_name}`,
      `${req.body.user_pw}`,
      `${req.file.path}`,
      `${verify.id}`,
    ],
    function (error, results, fields) {
      if (error) throw error;
      res.send({
        message: "SUCCESS",
        user_img: req.file,
        user_name: req.body.user_name,
      });
    }
  );
});

// app.post("/postUpdate", (req, res) => {
//   // connection.connect(function (err) {
//   // // connection.connect() : DB접속
//   // if (err) throw err;
//   // console.log('Connected!');
//   const verify = jwt.verify(req.headers.authorization, "secretkey");
//   connection.query(
//     {
//       sql: `INSERT INTO board  (writer, title, content) VALUES (?, ?, ?)`,
//     },
//     [
//       `${verify.id}`,
//       `${req.body.content.postTitle}`,
//       `${req.body.content.postContent}`,
//     ],

//     function (err, result) {
//       if (err) throw err;
//       console.log("1 record inserted");
//       res.send({ message: "SUCCESS" });
//     }
//   );
//   // });
// });

app.post("/post", (req, res) => {
  // connection.connect(function (err) {
  // // connection.connect() : DB접속
  // if (err) throw err;
  // console.log('Connected!');
  const verify = jwt.verify(req.headers.authorization, "secretkey");
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
      console.log("1 record inserted");
      res.send({ message: "SUCCESS" });
    }
  );
  // });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
