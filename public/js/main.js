window.onload = () => {
  console.log('%c ::: Google Sheet to JSON FIle onload :::', 'background: #222; color: #bada55');
  addEventList();
}

const addEventList = () => {
  $('.btn_packaging').on('click', () => {
    packaging();
  });
  console.log(`addEventList completed!`)
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
  })
  .then((data) => {
    if(data.isOk) {
      visibleResult(data);
    } else {
      alert('외부 구글시트 API 오류 발생');
      console.warn(data);
    }
  })
  .catch((err) => {
    alert('내부 서버 오류 발생');
    console.warn(err);
  })
}

// 성공 여부 표기
const visibleResult = (data) => {
  console.log(data)
  $('.result_list').children().remove();
  for (let i = 0; i < data.reqList.length; i++) {
    let reqChapter = data.reqList[i];
    let isSuccess = data.successList.includes(reqChapter);
    console.log(reqChapter, isSuccess)
    $('.result_list').append(`<li class="${isSuccess ? 'succ' : 'fail'}">${reqChapter}</li>`);
  }

  $('.total').text(`${data.successList.length}/${data.reqList.length}`);

  let timeoutId = setTimeout(() => {
    clearTimeout(timeoutId);
    alert('패키징 완료');
  }, 100);
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
      chapter_list: params.chapterList
    })
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw Error(data);
  }
}