// /src/data/questions.ts
export interface Question {
  id: number;
  situation: string;
  iconType?: string;
  choices: {
    text: string;
    mbtiImpact: Partial<{
      T: number; // Trust
      Q: number; // Question
      S: number;
      N: number;
      P: number; // Public (개방/충동)
      G: number; // Guarded (방어)
      J: number;
      P2: number; // Perceiving (J/P 축의 P)
      OTQ: number; // O(무관심) - TQ 축
      OSN: number; // O(무관심) - SN 축
      OPG: number; // O(무관심) - PG 축
      OJP: number; // O(무관심) - JP 축
    }>;
  }[];
}

export const questions: Question[] = [
  // ───────────── T / Q (4) ─────────────
  {
    id: 1,
    iconType: "warning",
    situation:
      "📩 검찰을 사칭한 문자: '출석 요구서가 발송되었습니다. 확인 링크 접속 요망.'",
    choices: [
      {
        text: "문자에 적힌 번호로 바로 전화해 사실 여부를 묻는다.",
        mbtiImpact: { T: 1 },
      },
      {
        text: "사건번호·발신번호를 포털에서 검색해 진위부터 확인한다.",
        mbtiImpact: { Q: 1 },
      },
      {
        text: "링크는 열지 않고 110(정부민원)·경찰청 공식번호로 재문의한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "해당 발신을 차단하고 스팸/피싱으로 신고한다.",
        mbtiImpact: { G: 1 },
      },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OTQ: 1 } },
    ],
  },
  {
    id: 3,
    iconType: "chat",
    situation:
      "🎁 SNS 당첨 고지: '경품 수령 수수료 9,900원을 입금하면 발송합니다.'",
    choices: [
      { text: "소액이므로 먼저 입금하고 진행한다.", mbtiImpact: { T: 1 } },
      {
        text: "주최 계정의 인증·과거 이벤트·수령 후기를 확인한다.",
        mbtiImpact: { Q: 1 },
      },
      {
        text: "공식 채널(홈페이지/대표번호)로 재확인 후 응답한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "계정을 신고하고 관련 메시지를 차단한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OTQ: 1 } },
    ],
  },
  {
    id: 4,
    iconType: "chat",
    situation: "📱 지인 사칭 메시지: '급한 송금 부탁, 지금 이 계좌로 보내줘.'",
    choices: [
      { text: "평소 지인이 맞다고 보고 즉시 송금한다.", mbtiImpact: { T: 1 } },
      {
        text: "통화로 본인 확인(목소리/추가 질문) 후 판단한다.",
        mbtiImpact: { Q: 1 },
      },
      {
        text: "메신저는 유지하고, 다른 연락처(직통/영상통화)로 교차 확인한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "대화를 중단하고 해당 계정을 차단·신고한다.",
        mbtiImpact: { G: 1 },
      },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OTQ: 1 } },
    ],
  },
  {
    id: 7,
    iconType: "phone",
    situation:
      "📞 보이스피싱 통화: '자녀가 사고를 냈습니다. 합의금이 필요합니다.'",
    choices: [
      { text: "긴급 상황이니 요구대로 바로 송금한다.", mbtiImpact: { T: 1 } },
      {
        text: "통화를 끊고 가족 본인·학교·경찰에 각각 확인한다.",
        mbtiImpact: { Q: 1 },
      },
      {
        text: "시간을 벌며 통화를 종료하고 공식 번호로 역추적 문의한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "추가 대화를 중단하고 번호를 차단한다.", mbtiImpact: { G: 1 } },
      // 고위험 통화형: O 미배치
    ],
  },

  // ───────────── S / N (4) ─────────────
  {
    id: 2,
    iconType: "chat",
    situation:
      "📦 택배 오배송 안내 문자: '주소 착오, 아래 링크에서 수정하세요.'",
    choices: [
      {
        text: "택배사 공식 앱/마이페이지에서 송장 상세를 확인한다.",
        mbtiImpact: { S: 1 },
      },
      {
        text: "링크의 도메인·SSL·단축주소 여부를 확인 후 판단한다.",
        mbtiImpact: { N: 1 },
      },
      {
        text: "발신처 고객센터 공식번호로 배송 상태를 문의한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "문자를 스팸 신고하고 동일 유형 재수신을 차단한다.",
        mbtiImpact: { G: 1 },
      },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OSN: 1 } },
    ],
  },
  {
    id: 12,
    iconType: "chat",
    situation: "📉 코인 투자 초대: '수익 보장 커뮤니티 입장 링크.'",
    choices: [
      { text: "설명이 명확하니 우선 입장해 본다.", mbtiImpact: { S: 1 } },
      {
        text: "과거 피해 사례·금융당국 경고 공지를 찾아본다.",
        mbtiImpact: { N: 1 },
      },
      {
        text: "제공처·운영자 실체를 사업자/도메인 정보로 확인한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "관련 채널을 차단하고 기록을 보관한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OSN: 1 } },
    ],
  },
  {
    id: 13,
    iconType: "warning",
    situation:
      "🌙 새벽 시간 본인확인 링크: '로그인 시도 감지, 즉시 확인 필요.'",
    choices: [
      { text: "문자 링크로 접속해 비밀번호를 변경한다.", mbtiImpact: { S: 1 } },
      {
        text: "서비스 공식 앱/웹에서 직접 로그인 기록을 확인한다.",
        mbtiImpact: { N: 1 },
      },
      {
        text: "고객센터 공지/보안 알림 정책을 확인한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "발신을 차단하고 동일 유형을 신고한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OSN: 1 } },
    ],
  },
  {
    id: 15,
    iconType: "warning",
    situation:
      "🎫 이벤트 당첨 안내: '경품 배송을 위해 개인정보 입력 링크로 이동.'",
    choices: [
      {
        text: "정상 절차라고 보고 정보 입력을 진행한다.",
        mbtiImpact: { S: 1 },
      },
      {
        text: "링크가 공식 도메인인지와 개인정보 처리 방침을 확인한다.",
        mbtiImpact: { N: 1 },
      },
      { text: "공식 채널에서 당첨 여부를 재확인한다.", mbtiImpact: { J: 1 } },
      { text: "요청을 거절하고 계정을 차단한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OSN: 1 } },
    ],
  },

  // ───────────── P / G (4) ─────────────
  {
    id: 8,
    iconType: "bank",
    situation: "💸 중고거래: '선입금 먼저 부탁, 택배는 내일 바로 보냄.'",
    choices: [
      { text: "가격이 좋아서 우선 선입금한다.", mbtiImpact: { P: 1 } },
      {
        text: "직거래/안전결제 등 안전한 방식으로 전환한다.",
        mbtiImpact: { G: 1 },
      },
      {
        text: "판매자 후기·신원·거래 이력 확인 후 판단한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "요청을 거절하고 거래를 종료한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OPG: 1 } },
    ],
  },
  {
    id: 9,
    iconType: "warning",
    situation: "🔗 단체 채팅방에 공유된 외부 링크: '밈/이벤트 보러가기.'",
    choices: [
      { text: "호기심으로 바로 연다.", mbtiImpact: { P: 1 } },
      { text: "보낸 사람에게 출처를 묻고 확인 후 연다.", mbtiImpact: { G: 1 } },
      {
        text: "브라우저 시크릿/샌드박스에서 제한적으로 확인한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "열지 않고 링크를 숨김/신고 처리한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OPG: 1 } },
    ],
  },
  {
    id: 10, // 치환: 큐싱(오프라인 QR)
    iconType: "chat",
    situation: "🏠 카페 테이블에 붙은 '무료 와이파이 등록' QR 코드.",
    choices: [
      { text: "바로 스캔해 등록 페이지로 들어간다.", mbtiImpact: { P: 1 } },
      { text: "매장 직원에게 안내 QR의 진위를 묻는다.", mbtiImpact: { G: 1 } },
      {
        text: "SSID를 수동 입력하거나 공식 홈페이지로 직접 접속한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "스캔하지 않고 무시한다(의심 시 촬영·보관).",
        mbtiImpact: { G: 1 },
      },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OPG: 1 } },
    ],
  },
  {
    id: 14,
    iconType: "chat",
    situation: "🎮 DM으로 불법 도박 링크가 도착했다.",
    choices: [
      { text: "어떤 사이트인지 먼저 접속해 본다.", mbtiImpact: { P: 1 } },
      {
        text: "플랫폼 정책 위반으로 신고하고 대화를 종료한다.",
        mbtiImpact: { G: 1 },
      },
      {
        text: "도메인·사업자 정보를 확인해 불법 가능성을 점검한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "링크 미리보기·보안 도구로 위험도만 점검 후 차단한다.",
        mbtiImpact: { G: 1 },
      },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OPG: 1 } },
    ],
  },

  // ───────────── J / P2 (4) ─────────────
  {
    id: 5,
    iconType: "bank",
    situation:
      "🏦 은행 보안 알림: 'OTP 번호를 알려주시면 즉시 해결 가능합니다.'",
    choices: [
      { text: "안내에 따라 OTP를 제공한다.", mbtiImpact: { P2: 1 } },
      {
        text: "은행 공식 앱에서 이상 거래/공지부터 확인한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "전화를 끊고 은행 대표번호로 재통화한다.", mbtiImpact: { J: 1 } },
      { text: "요청을 거절하고 발신을 차단한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OJP: 1 } },
    ],
  },
  {
    id: 6,
    iconType: "warning",
    situation:
      "📄 아르바이트 지원: '주민등록증·통장사본·공인인증 사본 제출 요청.'",
    choices: [
      { text: "채용 절차상 필요하니 즉시 제출한다.", mbtiImpact: { P2: 1 } },
      {
        text: "채용 공고의 필요 서류 공지·법정 요구사항을 확인한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "서류 제출은 면접·계약 단계에서만 가능하다고 답한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "요청을 거절하고 공고를 신고한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OJP: 1 } },
    ],
  },
  {
    id: 11, // 치환: 원격제어/보안앱 설치 유도
    iconType: "chat",
    situation:
      "📲 은행/수사기관 사칭: '보호를 위해 보안앱 설치가 필요합니다. 이 링크로 설치하세요.'",
    choices: [
      { text: "안내에 따라 보안앱을 설치한다.", mbtiImpact: { P2: 1 } },
      {
        text: "설치·접속 없이 공식 고객센터로 사실 여부를 재확인한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "앱 권한 요구(접근성/관리자 권한)를 확인 후 즉시 차단한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "대화를 종료하고 발신/링크를 신고한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OJP: 1 } },
    ],
  },
  {
    id: 16, // 치환: 소액결제 환불 콜백
    iconType: "chat",
    situation:
      "📥 문자: '소액결제가 완료되었습니다. 환불 원하면 고객센터(0XX-XXXX)로 연락.'",
    choices: [
      { text: "문자에 적힌 번호로 바로 전화한다.", mbtiImpact: { P2: 1 } },
      {
        text: "통신사/결제사 공식 앱·대표번호로 결제 내역을 확인한다.",
        mbtiImpact: { J: 1 },
      },
      {
        text: "유출 의심 시 결제 차단/번호 변경 절차를 진행한다.",
        mbtiImpact: { J: 1 },
      },
      { text: "발신을 차단하고 스미싱으로 신고한다.", mbtiImpact: { G: 1 } },
      { text: "아무런 행동도 하지 않는다.", mbtiImpact: { OJP: 1 } },
    ],
  },
];
