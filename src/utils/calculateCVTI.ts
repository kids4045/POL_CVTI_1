// /src/utils/calculateCVTI.ts

// 현재 questions.ts에서 선택지가 주는 가중치 구조와 동일하게 맞춘 타입
export type CVTIImpact = Partial<{
  T: number; // Trust
  Q: number; // Question
  S: number;
  N: number;
  P: number; // Public
  G: number; // Guarded
  J: number;
  P2: number; // Perceiving (J/P 축의 P)
  OTQ: number; // O(무관심) - TQ 축
  OSN: number; // O(무관심) - SN 축
  OPG: number; // O(무관심) - PG 축
  OJP: number; // O(무관심) - JP 축
}>;

// 결과 타입 (필요 시 확장해서 UI에 노출 가능)
export interface CVTICalcResult {
  cvti: string; // 예: TSPJ, OSPJ, TSOO 등
  axisPicks: {
    TQ: "T" | "Q" | "O";
    SN: "S" | "N" | "O";
    PG: "P" | "G" | "O";
    JP: "J" | "P" | "O";
  };
  oAxesCount: number; // 'O'가 선택된 축 개수
  // 디버깅/로그용 (원하면 UI에서 쓰세요)
  _scores?: {
    T: number;
    Q: number;
    OTQ: number;
    S: number;
    N: number;
    OSN: number;
    P: number;
    G: number;
    OPG: number;
    J: number;
    P2: number;
    OJP: number;
  };
}

/** ─────────────────────────────────────────────────────────
 *  O(무관심) 처리 규칙 — B 방법
 *  - 각 축의 O 카운트가
 *      • 3 이상이면: 무조건 O
 *      • 정확히 2이면: 확률 p (기본 0.5)로만 O
 *      • 0~1이면: O 아님
 *  - 글로벌로 O가 2축 이상이면 최종 성향을 '무관심형'으로 취급(매핑 유틸에서)
 *  - 동점(tie) 기본값(보수적 기준은 유지하되, 필요 시 변경 가능):
 *      TQ: Q,  SN: S,  PG: P,  JP: P
 *  ───────────────────────────────────────────────────────── */
export const O_GLOBAL_THRESHOLD = 2; // 2축 이상 O면 '무관심형'(매핑 단계에서 사용)

// 동점 타이브레이크 기본 문자
const TIE_TQ: "T" | "Q" = "Q";
const TIE_SN: "S" | "N" = "S";
const TIE_PG: "P" | "G" = "P";
const TIE_JP: "J" | "P" = "P";

// 옵션: 확률/랜덤/타이브레이크 제어 (선택)
export type CVTICalcOptions = {
  pForO2?: number; // O==2일 때 O로 채택할 확률 (기본 0.5)
  rng?: () => number; // 난수 함수 주입(테스트 재현성용), 기본 Math.random
  tieBreak?:
    | "left"
    | "right"
    | "random"
    | {
        TQ?: "T" | "Q";
        SN?: "S" | "N";
        PG?: "P" | "G";
        JP?: "J" | "P";
      };
};

// 내부 유틸: 동점 처리
function pickByTieBreak<A extends string, B extends string>(
  left: A,
  right: B,
  tie:
    | "left"
    | "right"
    | "random"
    | { TQ?: any; SN?: any; PG?: any; JP?: any } // 축별 직접 지정도 허용
    | undefined,
  rng: () => number,
  fallbackLeft: A // 축별 기본값(본 파일 상단 상수)
): A | B {
  if (!tie) return fallbackLeft;
  if (typeof tie === "string") {
    if (tie === "left") return left;
    if (tie === "right") return right;
    if (tie === "random") return rng() < 0.5 ? left : right;
    return fallbackLeft;
  }
  // 객체로 축별 타이를 직접 지정한 경우
  // (여기서는 호출부에서 축별로 적절히 fallbackLeft를 넣어줌)
  return fallbackLeft;
}

// 내부 유틸: B 방법의 O 채택 결정
function decideO(oCount: number, pForO2: number, rng: () => number): boolean {
  if (oCount >= 3) return true;
  if (oCount === 2) return rng() < pForO2;
  return false;
}

/** 메인 계산 함수: CVTIImpact[]를 받아 CVTI 문자열과 부가정보를 반환 */
export function calculateCVTI(
  rawAnswers: Array<CVTIImpact | null | undefined>,
  options: CVTICalcOptions = {}
): CVTICalcResult {
  const {
    pForO2 = 0.5,
    rng = Math.random,
    tieBreak, // 전역 타이브레이크 정책 (필요 시)
  } = options;

  let T = 0,
    Q = 0,
    S = 0,
    N = 0,
    P = 0,
    G = 0,
    J = 0,
    P2 = 0;
  let OTQ = 0,
    OSN = 0,
    OPG = 0,
    OJP = 0;

  const answers = (rawAnswers ?? []).filter(Boolean) as CVTIImpact[];

  for (const a of answers) {
    T += a.T ?? 0;
    Q += a.Q ?? 0;
    S += a.S ?? 0;
    N += a.N ?? 0;
    P += a.P ?? 0;
    G += a.G ?? 0;
    J += a.J ?? 0;
    P2 += a.P2 ?? 0;

    OTQ += a.OTQ ?? 0;
    OSN += a.OSN ?? 0;
    OPG += a.OPG ?? 0;
    OJP += a.OJP ?? 0;
  }

  // ── 축별 O 여부 (B 방법: 카운트 기준 + 확률)
  const isOTQ_O = decideO(OTQ, pForO2, rng);
  const isOSN_O = decideO(OSN, pForO2, rng);
  const isOPG_O = decideO(OPG, pForO2, rng);
  const isOJP_O = decideO(OJP, pForO2, rng);

  // ── 축별 픽 (O가 되지 않은 경우에만 T/Q, S/N, P/G, J/P 비교 + 타이브레이크)
  const pickTQ: "T" | "Q" | "O" = isOTQ_O
    ? "O"
    : T === Q
    ? (pickByTieBreak("T", "Q", tieBreak, rng, TIE_TQ) as "T" | "Q")
    : T > Q
    ? "T"
    : "Q";

  const pickSN: "S" | "N" | "O" = isOSN_O
    ? "O"
    : S === N
    ? (pickByTieBreak("S", "N", tieBreak, rng, TIE_SN) as "S" | "N")
    : S > N
    ? "S"
    : "N";

  const pickPG: "P" | "G" | "O" = isOPG_O
    ? "O"
    : P === G
    ? (pickByTieBreak("P", "G", tieBreak, rng, TIE_PG) as "P" | "G")
    : P > G
    ? "P"
    : "G";

  const pickJP: "J" | "P" | "O" = isOJP_O
    ? "O"
    : J === P2
    ? (pickByTieBreak("J", "P", tieBreak, rng, TIE_JP) as "J" | "P")
    : J > P2
    ? "J"
    : "P";

  const axisPicks = { TQ: pickTQ, SN: pickSN, PG: pickPG, JP: pickJP };
  const oAxesCount = [pickTQ, pickSN, pickPG, pickJP].filter(
    (x) => x === "O"
  ).length;

  const cvti = `${pickTQ}${pickSN}${pickPG}${pickJP}`;

  return {
    cvti,
    axisPicks,
    oAxesCount,
    _scores: { T, Q, OTQ, S, N, OSN, P, G, OPG, J, P2, OJP },
  };
}

/* ─────────────────────────────────────────────────────────
 *  레거시 호환: 기존 dimension/value 형식 입력을 받는 헬퍼
 *  (이전 calculateMBTI(answers) 사용 코드가 있어도 끊기지 않게)
 *  사용 중이면 점진적으로 calculateCVTI로 교체 권장
 *  ───────────────────────────────────────────────────────── */

export type MBTIImpactLegacy = {
  dimension: "TQ" | "SN" | "PG" | "JP";
  value: "T" | "Q" | "S" | "N" | "P" | "G" | "J" | "P2" | "O";
};

export function calculateMBTI(answers: MBTIImpactLegacy[]): string {
  // 레거시 입력을 새 카운트 모델로 변환
  const converted: CVTIImpact[] = answers.map((x) => {
    switch (x.dimension) {
      case "TQ":
        if (x.value === "T") return { T: 1 };
        if (x.value === "Q") return { Q: 1 };
        if (x.value === "O") return { OTQ: 1 };
        return {};
      case "SN":
        if (x.value === "S") return { S: 1 };
        if (x.value === "N") return { N: 1 };
        if (x.value === "O") return { OSN: 1 };
        return {};
      case "PG":
        if (x.value === "P") return { P: 1 };
        if (x.value === "G") return { G: 1 };
        if (x.value === "O") return { OPG: 1 };
        return {};
      case "JP":
        if (x.value === "J") return { J: 1 };
        if (x.value === "P2") return { P2: 1 };
        if (x.value === "O") return { OJP: 1 };
        return {};
      default:
        return {};
    }
  });

  const res = calculateCVTI(converted);
  return res.cvti;
}
