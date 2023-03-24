import express from 'express';
import livereload from 'livereload';
import livereloadMiddleware from 'connect-livereload';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// 초기화
const server = express();
const __dirname = path.resolve();
dotenv.config();

// 라이브 서버 설정
const liveServer = livereload.createServer({
  // 변경시 다시 로드할 파일 확장자들 설정
  exts: ['html', 'css', 'js'],
  debug: true
});

liveServer.watch(__dirname);

server.use(express.json());
server.use(livereloadMiddleware()); // 미들웨어 설정
server.use(express.static('public')); // 정적 파일 설정

// HOME
server.get('/', (req, res) => {
  res.sendFile(__dirname + "/views/index.html");

  // console.log(req)
});

// JSON 파일 생성 API
server.post('/api/createJSON', async (req, res) => {
  // var data = 'This is a test text'; // 파일에 쓸 내용
 
  // fs.writeFile('./json_list/text1.txt', data, 'utf8', (err) => {
  //   console.log('비동기적1파일 쓰기 완료');
  //   if (err) console.log(err);
  // });
  // fs.writeFile('/json_list/text2.txt', data, 'utf8', (err) => {
  //   console.log('비동기적2 파일 쓰기 완료');
  //   if (err) console.log(err);
  // });

  const body = req.body;
  const reqCnt = body.list.length;


  console.log(body)

  let res2 = await get(`${process.env.GOOGLE_DATA_API_URL}/getWordUp`, {
    chapter: 'w1',
    want_tab: 'META',
    where: 'H'
  })
  console.log("#>>>>>>>", res2)

  res.json({temp: res2})
})

server.listen(process.env.SERVER_PORT, () => {
  console.log(`API Data To JSON server listening on port ${process.env.SERVER_PORT}, url: http://localhost:${process.env.SERVER_PORT}`)
})

// var fs = require('fs');
 
// var data = 'This is a test text'; // 파일에 쓸 내용
 
// fs.writeFile('text1.txt', data, 'utf8', function(err) {
//     console.log('비동기적 파일 쓰기 완료');
// });
 
 
// fs.writeFileSync('text2.txt', data, 'utf8');
// console.log('동기적 파일 쓰기 완료');

// get
const get = async (url, params) => {
  let query = Object.keys(params)
              .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
              .join('&');
  const res = await fetch(`${url}?${query}`);
  // const data = await res.json();

  return res;


  // if (res.ok) {
  //   return data;
  // } else {
  //   throw Error(data);
  // }
}