# ApiDataToJsonFile
### 구글 시트 내용 JSON 파일로 생성

#### flow
1. 프론트 - 서비스(학습 타입)과 회차코드를 넣고 백엔드 호출
- url '/api/createJSON'

2. 백엔드 - 구글 시트 정보 가져오는 API 서버에 호출
3. 백엔드 - 응답 받은 시트 정보를 바탕으로 JSON 파일 생성
4. 프론트 - 완료 여부 전달

### 프론트파일
- main.js

### 백엔드파일
- server.js

### 주요 스택
Node js - v16.13.2
express - v4.18.2
node-fetch - v3.3.1
dotenv - v16.0.3