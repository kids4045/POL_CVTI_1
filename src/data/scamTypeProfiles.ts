export type ScamTypeKey =
  | "감정공감형"
  | "절차맹신형"
  | "직진반응형"
  | "실험과잉형"
  | "신뢰우선형"
  | "회피수동형"
  | "정보과신형"
  | "선한낙관형"
  | "무관심형";

export interface ScamTypeProfile {
  title: string;
  summary: string;
  reactions: string[];
  vulnerabilities: string[];
  riskLevel: number; // ★ 변경됨
  slogan: React.ReactNode;
}

export const scamTypeProfiles: Record<ScamTypeKey, ScamTypeProfile> = {
  감정공감형: {
    title: "감정공감형 – 따뜻한 공감의 아이콘",
    summary: "정서적 유대에 민감하고, 도움을 주고 싶어하는 사람",
    reactions: [
      "지인의 어려움에 쉽게 마음이 움직임",
      "상대의 말투나 감정 톤에 공감함",
      "불쾌한 갈등 상황을 피하려는 경향",
    ],
    vulnerabilities: ["지인 사칭형 피싱", "감정 자극형 딥페이크 보이스피싱"],
    riskLevel: 3,
    slogan: "착한 마음, 확인 한 번으로 지킬 수 있습니다.",
  },

  절차맹신형: {
    title: "절차맹신형 – 공식 신뢰자",
    summary: "공식적 절차와 형식을 신뢰하며, 지시에 민감한 성향",
    reactions: [
      "공공기관, 금융기관에 대한 신뢰가 높음",
      "절차대로 따라야 안심함",
      "빠른 대응을 중시함",
    ],
    vulnerabilities: ["공공기관 사칭형 문자", "앱 설치 유도형 피싱"],
    riskLevel: 3,
    slogan: "빠른 대응보다 바른 확인이 먼저입니다.",
  },

  직진반응형: {
    title: "직진반응형 – 반응 속도 최우선",
    summary: "흥미나 긴급함에 즉각 반응하는 빠른 결정자",
    reactions: [
      "긴박한 말투에 반응함",
      "링크, 이벤트에 빠르게 클릭",
      "사후 확인보다 즉시 대응",
    ],
    vulnerabilities: ["광고성 링크형 스미싱", "가짜 이벤트 경품 메시지"],
    riskLevel: 4,
    slogan: "재미있어도 일단 한 번 확인하세요!",
  },

  실험과잉형: {
    title: "실험과잉형 – 새로운 걸 해봐야 직성이 풀리는 사람",
    summary: "호기심이 많고, 신기한 걸 바로 써보고 싶은 성향",
    reactions: [
      "무료 체험, 베타 서비스에 반응",
      "리뷰나 검증 없이 앱 설치 가능",
      "위험보다 ‘재미’를 먼저 느낌",
    ],
    vulnerabilities: ["QR코드/광고성 앱 피싱", "고수익 미끼형 스미싱"],
    riskLevel: 4,
    slogan: "당신의 실험정신, 클릭 전에 한 번 더 생각하세요.",
  },

  신뢰우선형: {
    title: "신뢰우선형 – 믿음을 행동으로 옮기는 사람",
    summary: "사람을 먼저 믿고 행동하는 공감 리더",
    reactions: [
      "요청에 응답하려는 책임감",
      "사회적 관계를 중시",
      "말보다 마음을 먼저 봄",
    ],
    vulnerabilities: ["지인 사칭 문자/영상", "딥페이크 음성/영상 피싱"],
    riskLevel: 3,
    slogan: "신뢰는 확인을 통해 더욱 단단해집니다.",
  },

  회피수동형: {
    title: "회피수동형 – 조용한 거리두기",
    summary: "불쾌하거나 복잡한 상황을 피하려는 경향",
    reactions: [
      "불편한 메시지를 일단 넘김",
      "직접 대면보다는 회피",
      "모호한 정보는 판단을 미룸",
    ],
    vulnerabilities: ["링크 열람형 피싱", "‘잠깐이면 돼요’식 절차 사칭"],
    riskLevel: 2,
    slogan: "모른 척보다 확실한 확인이 \n당신을 지켜줍니다.",
  },

  정보과신형: {
    title: "정보과신형 – 분석형 디지털 사용자",
    summary: "정보를 빠르게 해석하고 스스로 판단하려는 사람",
    reactions: [
      "구조적 설득에 잘 반응함",
      "텍스트 중심 사고",
      "전문적인 말투에 신뢰함",
    ],
    vulnerabilities: ["논리적 설명이 붙은 피싱", "전문기관·AI 사칭형 메시지"],
    riskLevel: 2,
    slogan: "정보가 많아도, \n진짜는 확인에서 시작됩니다.",
  },

  선한낙관형: {
    title: "선한낙관형 – 세상을 믿고 싶은 사람",
    summary: "악의보다 선의에 기반해 행동하는 성향",
    reactions: [
      "타인의 고충에 공감",
      "정황 판단보다 감정 우선",
      "나쁜 사람은 없을 거라 믿음",
    ],
    vulnerabilities: ["감성 후원 사칭 피싱", "사기 피해자 사칭형 접근"],
    riskLevel: 3,
    slogan: "착한 마음, 한 번의 확인으로 \n보호받을 수 있습니다.",
  },

  무관심형: {
    title: "주의력 저하 – 무관심형",
    summary: "위험 신호 대응 지연 성향",
    reactions: [
      "의심이 들어도 행동으로 옮기지 않음",
      "‘나중에’로 미루다가 대응 타이밍을 놓침",
      "피해 발생 후에야 상황을 인지하는 편",
    ],
    vulnerabilities: [
      "피싱 링크/의심 연락을 방치 → 계정 탈취로 확대",
      "본인인증·결제 알림 무시 → 자동 결제 피해",
      "중고거래/사칭 피해 발생 시 증거 보전·신고 지연",
    ],
    riskLevel: 3, // 1~5 중 선택
    slogan: "미루면 위험도 커집니다. \n‘지금’ 최소한의 확인부터.",
  },
};
