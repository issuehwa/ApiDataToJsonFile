import express from 'express';
import livereload from 'livereload';
import livereloadMiddleware from 'connect-livereload';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import {apiDetailPath} from './public/js/constant.js';

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
});

server.listen(process.env.SERVER_PORT, () => {
  console.log(`API Data To JSON server listening on port ${process.env.SERVER_PORT}, url: http://localhost:${process.env.SERVER_PORT}`)
});

// JSON 파일 생성 API
server.post('/api/createJSON', async (req, res) => {
  const body = req.body;
  const service = body.service.toLowerCase();
  const apiPath = apiDetailPath[service];
  const chapterList = body.chapter_list;

  let result = {};

  // 필터링
  let filterData = {};
  
  // 해당 학습(서비스) 전체 정보 API 호출
  let metaResponse = await get(`${process.env.GOOGLE_DATA_API_URL}${apiPath}`, {
    no_search: '1'
  });

  // 유효성 검사
  if (metaResponse.isOk) {
    // 조회 성공 
    // json 저장할 디렉토리
    const dir = process.env.JSON_DIR + "/" + service;

    // 디렉토리 체크 및 생성
    makeDirectory(dir);

    // 데이터 필터링
    for (let type in metaResponse.data) {
      const learnList = metaResponse.data[type];
      filterData[type] = learnList.filter(item => chapterList.includes(item.chapter));
    }
    
    // 파일생성
    let successList = await writeJSONFile(dir, filterData, chapterList);

    result = {
      isOk: true,
      successList: successList,
    }
  } else {
    // 조회 실패
    result = {
      isOk: false,
      msg: '구글 시트 API 에러발생'
    }
  }

  // 요청 리스트
  result.reqList = chapterList;

  // 결과 응답
  res.json(result);
});

// 폴더 생성
const makeDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 파일 생성
const writeJSONFile = async (dir, data, chapterList) => {
  console.log('========= 파일생성 시작 =========');

  let successList = [];

  await new Promise((resolve, reject) => {  
    let cnt = 0;
    for(let i = 0; i < chapterList.length; i++) {
      const chapter = chapterList[i];
      let jsonData = {};
      let jsonStr = "";
      console.log(`[${chapter}] 데이터 조합 시작`);

      // 데이터 존재 유무
      let isExist = true;
      for (let type in data) {
        const learnList = data[type];
        jsonData[type] = learnList.filter(item => item.chapter == chapter);

        if (jsonData[type].length === 0) {
          isExist = false;
          break;
        }
      }
      jsonStr = JSON.stringify(jsonData);

      if (isExist) {
        cnt++;  
        console.log(`[${chapter}] 파일 쓰기 시작`);
        fs.writeFile(`${dir}/${chapter}.json`, jsonStr, 'utf8', (err) => {
          if (err) {
            console.log(`[${chapter}] 파일 쓰기 실패`, err);
          } else {
            console.log(`[${chapter}] 파일 쓰기 완료`);
            successList.push(chapter);
          }
          cnt--;
          if (cnt === 0) resolve();
        });
      } else {
        console.log(`[${chapter}] 데이터 없음`);
      }
    }
    if (cnt === 0) resolve();
  })

  console.log('========= 파일생성 완료 =========');

  return successList;
}

// get
const get = async(url, params) => {
  let result = {};
  let query = Object.keys(params)
              .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
              .join('&');
  await fetch(`${url}?${query}`)
    .then(response => response.json())
    .then(resultJson => {
      result = {
        isOk: true,
        data: resultJson
      }
    })
    .catch(error => {
      result = {
        isOk: false,
        error: error
      }
    })

  return result;
}