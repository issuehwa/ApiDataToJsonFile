window.onload = () => {
  console.log('%c onload', 'background: #222; color: #bada55');
  addEventList();
}

const addEventList = () => {
  $('.btn_packaging').on('click', () => {
    packaging();
  });
}

const packaging = () => {
  // 서비스명
  const service = $('.service_select').val();
  // 회차코드
  const oriChapterList = $('.req_list').val().split("\n").filter(str => str != ""); // 빈문자열 제거
  const set = new Set(oriChapterList); // 중복 제거
  const chapterList = [...set];

  if (chapterList.length == 0) {
    alert('회차코드를 작성해 주세요.');
    return;
  }

  // API 호출
  post('/api/createJSON', {
    service: service,
    chapterList: chapterList
  }).then((res) => console.log(res))
}

// post
const post = async (url, params) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service: params.service,
      list: params.chapterList
    })
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw Error(data);
  }
}