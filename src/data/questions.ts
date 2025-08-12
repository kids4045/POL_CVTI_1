export interface Question {
  id: number;
  situation: string;
  choices: {
    text: string;
    mbtiImpact: Partial<{
      T: number; // Trust
      Q: number; // Question
      S: number;
      N: number;
      P: number; // Public
      G: number; // Guarded
      J: number;
      P2: number; // Perceiving (J/P 축)
      OTQ: number; // O(무관심) - TQ 축
      OSN: number; // O(무관심) - SN 축
      OPG: number; // O(무관심) - PG 축
      OJP: number; // O(무관심) - JP 축
    }>;
  }[];
}

export const questions = [
  {
    id: 1,
    iconType: "warning",
    situation:
      "📩 검찰에서 온 것처럼 보이는 문자: \n'불법 거래 연루 혐의로 출석 요구합니다'라는 문자를 받았습니다.",
    // ✅ 1번은 '무시' 항목이 이미 포함되어 있으므로 4지 유지
    choices: [
      { text: "무서워서 바로 전화를 건다.", mbtiImpact: { P: 1 } },
      {
        text: "경찰청 공식 홈페이지에서 출석 요구 사실을 검색한다.",
        mbtiImpact: { G: 1 },
      },
      { text: "내용을 캡처해 가족 단톡방에 올린다.", mbtiImpact: { T: 1 } },
      { text: "의심되니 아무 반응 없이 무시한다.", mbtiImpact: { Q: 1 } },
    ],
  },
  {
    id: 2,
    iconType: "chat",
    situation:
      "📦 '배송 오류가 있어 확인이 필요합니다'라는 \n문구와 함께 택배 링크가 도착했습니다.",
    choices: [
      { text: "내 택배일 수도 있으니 눌러본다.", mbtiImpact: { P2: 1 } },
      { text: "링크 대신 택배사 앱에서 조회한다.", mbtiImpact: { J: 1 } },
      { text: "주소가 수상해서 링크 구조부터 분석한다.", mbtiImpact: { N: 1 } },
      { text: "판매자나 기사에게 직접 연락한다.", mbtiImpact: { S: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OJP: 1 } }, // JP 축 O
    ],
  },
  {
    id: 3,
    iconType: "chat",
    situation:
      "🎁 '이벤트에 당첨되셨습니다! 수수료 입금 시 경품 지급'\n이라는 DM을 받았습니다.",
    choices: [
      { text: "진짜인가 싶어 수수료를 입금한다.", mbtiImpact: { P: 1 } },
      { text: "이벤트 계정과 내용을 검색한다.", mbtiImpact: { G: 1 } },
      { text: "수상하니 DM을 삭제하고 차단한다.", mbtiImpact: { J: 1 } },
      { text: "친구에게 보여주며 진짜인지 묻는다.", mbtiImpact: { T: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OTQ: 1 } }, // TQ 축 O
    ],
  },
  {
    id: 4,
    iconType: "chat",
    situation:
      "📱 지인을 사칭한 메시지가 \n'급하게 도와줘'라며 계좌 이체를 요청합니다.",
    choices: [
      { text: "지인이니까 우선 도와준다.", mbtiImpact: { P: 1 } },
      { text: "직접 전화해 진짜인지 확인한다.", mbtiImpact: { G: 1 } },
      { text: "내용을 캡처해 가족 단톡방에 공유한다.", mbtiImpact: { T: 1 } },
      { text: "응답하지 않고 바로 차단한다.", mbtiImpact: { Q: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OPG: 1 } }, // PG 축 O
    ],
  },
  {
    id: 5,
    iconType: "bank",
    situation:
      "🏦 은행을 사칭한 문자로 \n'본인 인증을 위해 OTP 번호가 필요하다'는 요청을 받았습니다.",
    choices: [
      { text: "은행 요청이니 믿고 번호를 준다.", mbtiImpact: { P: 1 } },
      { text: "이런 요청은 있을 수 없다고 생각한다.", mbtiImpact: { G: 1 } },
      { text: "누구한테 물어봐야 할지 고민한다.", mbtiImpact: { P2: 1 } },
      { text: "해당 은행 공식 앱에서 확인한다.", mbtiImpact: { J: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OPG: 1 } }, // PG 축 O
    ],
  },
  {
    id: 6,
    iconType: "warning",
    situation:
      "📄 취업 지원 중 지나치게 좋은 조건의 \n채용 사이트가 개인정보를 요구합니다.",
    choices: [
      { text: "지원 마감이 걱정돼 빨리 제출한다.", mbtiImpact: { P2: 1 } },
      {
        text: "사이트 주소와 기업 정보를 먼저 확인한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "지원 전 후기나 피해 사례를 찾아본다.", mbtiImpact: { N: 1 } },
      { text: "수상해서 창을 바로 닫아버린다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OSN: 1 } }, // SN 축 O
    ],
  },
  {
    id: 7,
    iconType: "phone",
    situation: "📞 가족을 사칭해 급히 송금을 요청하는 전화를 받았습니다.",
    choices: [
      { text: "상황이 급해 보여서 일단 송금한다.", mbtiImpact: { P: 1 } },
      { text: "다른 가족에게 먼저 연락해본다.", mbtiImpact: { G: 1 } },
      { text: "신분 확인을 요구한다.", mbtiImpact: { J: 1 } },
      { text: "긴장해서 당황한 채 머뭇거린다.", mbtiImpact: { P2: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OJP: 1 } }, // JP 축 O
    ],
  },
  {
    id: 8,
    iconType: "bank",
    situation: "💸 중고거래 플랫폼에서 선입금을 요구받았습니다.",
    choices: [
      { text: "빠르게 거래하고 싶어 입금한다.", mbtiImpact: { P2: 1 } },
      { text: "직거래만 하겠다고 한다.", mbtiImpact: { G: 1 } },
      { text: "이 판매자의 후기를 검색한다.", mbtiImpact: { N: 1 } },
      { text: "가격이 너무 싸면 의심부터 한다.", mbtiImpact: { J: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OSN: 1 } }, // SN 축 O
    ],
  },
  {
    id: 9,
    iconType: "warning",
    situation: "🔗 학교 단톡방에 출처 불명의 링크가 공유됐습니다.",
    choices: [
      { text: "재밌어 보여서 눌러본다.", mbtiImpact: { T: 1 } },
      { text: "친구에게 먼저 이 링크 아냐고 물어본다.", mbtiImpact: { Q: 1 } },
      { text: "주소 구조를 분석해본다.", mbtiImpact: { N: 1 } },
      { text: "관리자에게 바로 신고한다.", mbtiImpact: { J: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OTQ: 1 } }, // TQ 축 O
    ],
  },
  {
    id: 10,
    iconType: "chat",
    situation: "🏠 '고수익 재택근무'를 제안하는 메시지를 받았습니다.",
    choices: [
      { text: "일단 설명 들으러 가본다.", mbtiImpact: { T: 1 } },
      { text: "너무 좋아 보이면 일단 의심한다.", mbtiImpact: { N: 1 } },
      { text: "지인 추천이라면 믿어보고 싶다.", mbtiImpact: { P: 1 } },
      { text: "사례나 후기부터 검색한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OTQ: 1 } }, // TQ 축 O
    ],
  },
  {
    id: 11,
    iconType: "chat",
    situation: "📲 '무료 체험' 문구가 담긴 광고 문자가 도착했습니다.",
    choices: [
      { text: "무료니까 해볼까 싶다.", mbtiImpact: { P2: 1 } },
      { text: "광고 차단 기능을 설정한다.", mbtiImpact: { J: 1 } },
      { text: "체험 조건을 꼼꼼히 확인한다.", mbtiImpact: { G: 1 } },
      { text: "발신번호를 블랙리스트에 등록한다.", mbtiImpact: { Q: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OJP: 1 } }, // JP 축 O
    ],
  },
  {
    id: 12,
    iconType: "chat",
    situation: "📉 비트코인 투자로 고수익을 보장한다는 \n메시지를 받았습니다.",
    choices: [
      { text: "수익률이 높아 솔깃하다.", mbtiImpact: { P2: 1 } },
      { text: "‘보장’이라는 말에 불신부터 든다.", mbtiImpact: { J: 1 } },
      { text: "지인의 실패 경험이 떠오른다.", mbtiImpact: { P: 1 } },
      { text: "사기 가능성이 높다고 판단한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OSN: 1 } }, // SN 축 O
    ],
  },
  {
    id: 13,
    iconType: "warning",
    situation: "🎭 AI로 조작된 영상 속 지인이 뉴스에 등장했습니다.",
    choices: [
      { text: "진짜인지 헷갈려서 친구에게 묻는다.", mbtiImpact: { P: 1 } },
      { text: "딥페이크 여부를 검색해본다.", mbtiImpact: { G: 1 } },
      {
        text: "영상의 디테일(눈동자, 배경 등)을 분석한다.",
        mbtiImpact: { N: 1 },
      },
      { text: "그럴듯해도 일단 의심한다.", mbtiImpact: { J: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OSN: 1 } }, // SN 축 O
    ],
  },
  {
    id: 14,
    iconType: "chat",
    situation: "🎮 채팅방에서 불법 도박 링크가 게임처럼 공유되고 있습니다.",
    choices: [
      { text: "심심하니 한 번 눌러본다.", mbtiImpact: { P2: 1 } },
      { text: "광고처럼 보여서 무시한다.", mbtiImpact: { J: 1 } },
      { text: "어디까지가 불법인지 검색한다.", mbtiImpact: { N: 1 } },
      { text: "운영자를 신고한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OPG: 1 } }, // PG 축 O
    ],
  },
  {
    id: 15,
    iconType: "warning",
    situation: "🎫 이벤트 당첨이라며 이름, 전화번호를 요구받았습니다.",
    choices: [
      { text: "이름 정도는 괜찮겠지 하고 입력한다.", mbtiImpact: { P: 1 } },
      { text: "계정이 공식인지부터 확인한다.", mbtiImpact: { G: 1 } },
      { text: "댓글에서 실제 당첨자인지 확인한다.", mbtiImpact: { N: 1 } },
      { text: "모르는 번호는 응답하지 않는다.", mbtiImpact: { Q: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OPG: 1 } }, // PG 축 O
    ],
  },
  {
    id: 16,
    iconType: "chat",
    situation: "📥 SNS DM으로 고수익 부업 제안이 도착했습니다.",
    choices: [
      { text: "시간 남는데 일단 해볼까?", mbtiImpact: { P2: 1 } },
      { text: "그럴듯하면 일단 의심부터 든다.", mbtiImpact: { J: 1 } },
      { text: "지인의 의견을 먼저 들어본다.", mbtiImpact: { P: 1 } },
      { text: "후기나 피해 사례를 찾아본다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 취하지 않는다.", mbtiImpact: { OTQ: 1 } }, // TQ 축 O
    ],
  },
];
