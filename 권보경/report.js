'use strict';

//초기화면 목록 불러오기
list_r();

//등록 처리 함수
function confirmBtn_f(evt) {
  const data = {
    reviewContent: document.querySelector('.write-review').value,
    shopId: shopId.value,
    memberId: memberId.value,
  };

  fetch(`http://localhost:9080/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      document.querySelector('.write-review').value = null;
      list_r();
    })
    .catch((err) => console.log(err));
}

//등록된 리뷰 목록
function list_r(evt) {
  fetch(`http://localhost:9080/review/shop?shopId=${shopId.value}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      displayItemR(res.data);
    })
    .catch((err) => {
      console.error('Err:', err);
    });
}

//신고 처리
function reportBtn_f(reviewId) {
  const $radios = document.querySelectorAll('.repRadio');
  const checkedItem = [...$radios].find((ele) => ele.checked);

  if (checkedItem == undefined) {
    alert('신고 사유를 선택해주시기 바랍니다.');
    return;
  }
  if (!confirm('신고하시겠습니까?')) {
    console.log('신고 취소함!');
    return;
  }
  console.log('신고 처리 시작');
  const data = {
    reviewId: repReviewId.value,
    reportTypeCode: checkedItem.value,
  };
  const url = `http://localhost:9080/report`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.rtcd == '00') {
        list_r();
      } else {
        console.log(res.rtmsg);
      }
    })
    .catch((err) => console.log(err));

  reportForm.style.display = 'none';
  alert('신고처리가 완료되었습니다.');
}

//삭제 처리
function delBtn_f(reviewId) {
  if (!confirm('삭제하시겠습니까?')) {
    console.log('삭제 취소함!');
    return;
  }
  console.log('삭제 처리 시작');
  const data = {
    reviewId: reviewId,
    shopId: shopId.value,
  };
  const url = `http://localhost:9080/review/${reviewId}`;
  fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.rtcd == '00') {
        list_r();
      } else {
        console.log(res.rtmsg);
      }
    })
    .catch((err) => console.log(err));
}

//목록 표시하기
function displayItemR(data) {
  const header = `<div class="addReview">
      <div class="review-write-box">
        <input type="text" class="write-review"/>
        <button type="button" class="writeBtn">등록</button>
      </div>
    </div>`;

  let body = ``;
  let repDelBox = ``;
  //로그인을 했을 때 - 신고 버튼, 삭제버튼 출력
  if (root.dataset.hasOwnProperty('memberId')) {
    data.forEach((review) => {
      body += `
          <div class="review-header">
            <div class="review-writer-info">
              <div class="review-writer" id="reviewer"> ${review.memberName} </div>
              <div class="review-date">
                <span>${review.reviewCdate}</span>
              </div>
            </div>
            <div class="review-delete-btn" data-member-id="${review.memberId}">
              <a href="javascript:void(0)" class="rev-report-btn" data-review-id="${review.reviewId}">신고</a>
              <a href="javascript:void(0)" class="rev-del-btn delabc" data-review-id="${review.reviewId}" style="display: none;">삭제</a>
            </div>
          </div>
          <div class="review-content">
            <div class="review-text-box">
              <h1>${review.reviewContent}</h1>
            </div>
          </div>`;
    });
  } else {
    //로그인을 안 했을 때 - 신고/삭제 버튼 없이 리뷰 목록만 출력.
    data.forEach((review) => {
      body += `
          <div class="review-header">
            <div class="review-writer-info">
              <div class="review-writer" id="reviewer"> ${review.memberName} </div>
              <div class="review-date">
                <span>${review.reviewCdate}</span>
              </div>
            </div>
          </div>
          <div class="review-content">
            <div class="review-text-box">
              <h1>${review.reviewContent}</h1>
            </div>
          </div>`;
    });
  }

  const $reviewBox = document.querySelector('.review-box');
  $reviewBox.innerHTML = header + body;

  //작성자명 앞 두글자 제외 익명 표시
  const $reviewer = document.querySelectorAll('.review-writer');

  $reviewer.forEach((ele) => {
    const $NC = ele.textContent;
    const $textChange = $NC.replace($NC.substring(3), '***');
    ele.textContent = $textChange;
  });

  //1)세션 아이디와 리뷰의 memberId가 일치할 경우 삭제버튼 보이기
  //2)세션 아이디와 리뷰의 memberId가 일치할 경우 신고버튼 안 보이기
  let $delBtn = document.querySelectorAll('.delabc');
  let $repBtn = document.querySelectorAll('.rev-report-btn');
  let $repDelBtn = document.querySelectorAll('.review-delete-btn');
  for (let i = 0; i < $delBtn.length; i++) {
    if (memberId.value == $repDelBtn[i].dataset.memberId) {
      $delBtn[i].style.display = 'inline-block';
      $repBtn[i].style.display = 'none';
    }
  }
}

//리뷰 박스 버튼 타겟팅
document.querySelector('.review-box').addEventListener('click', (evt) => {
  const [...classValues] = evt.target.classList;

  const reviewId = evt.target.dataset.reviewId;

  //등록 버튼
  if (classValues.includes('writeBtn')) {
    console.log('리뷰 등록버튼!');
    const $reviewText = document.querySelector('.write-review');
    if (memberId.value.trim().length === 0) {
      alert('로그인 후 이용하시기 바랍니다.');
      return false;
    } else if ($reviewText.value.trim().length === 0) {
      alert('내용을 입력해주세요');
      $reviewText.focus();
      $reviewText.select();
      return false;
    }
    confirmBtn_f();
  }

  //신고 버튼
  if (classValues.includes('rev-report-btn')) {
    reportForm.style.display = 'flex';
    repReviewId.value = reviewId;
  }

  //삭제 버튼
  if (classValues.includes('rev-del-btn')) {
    delBtn_f(reviewId);
  }
});

//리뷰 박스 영역 클릭 이벤트
document.querySelector('.report-wrap').addEventListener('click', (evt) => {
  const [...classValues] = evt.target.classList;

  //신고하기 버튼
  if (classValues.includes('btn-y')) {
    reportBtn_f();
  }

  //돌아가기 버튼
  if (classValues.includes('btn-n')) {
    reportForm.style.display = 'none';
  }
});
