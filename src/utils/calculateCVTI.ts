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
 *  O(무관심) 채택/타이브레이크 설정
 *  - 문항당 각 축 4개라면 보통 2 이상에서 O 채택을 고려
 *  - 글로벌로 O가 2축 이상이면 최종 성향을 '무관심형'으로 처리(매핑 유틸에서)
 *  - 동점 타이브레이크(보수적/안전 측) 기본값:
 *      TQ: Q,  SN: S,  PG: G,  JP: J
 *    → 필요 시 아래 상수를 바꾸면 됨
 *  ───────────────────────────────────────────────────────── */
export const O_AXIS_THRESHOLD = 2; // 축별 O 채택 기준 (>=)
export const O_GLOBAL_THRESHOLD = 2; // 2축 이상 O면 '무관심형'(매핑에서 사용)

const TIE_TQ: "T" | "Q" = "Q";
const TIE_SN: "S" | "N" = "S";
const TIE_PG: "P" | "G" = "P";
const TIE_JP: "J" | "P" = "P";

/** 메인 계산 함수: CVTIImpact[]를 받아 CVTI 문자열과 부가정보를 반환 */
export function calculateCVTI(
  rawAnswers: Array<CVTIImpact | null | undefined>
): CVTICalcResult {
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
    // a는 이제 CVTIImpact 형태라고 가정, 그래도 혹시 모르니 안전 연산자 사용
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

  // ── 축별 픽 (O 우선 규칙 → 임계치 이상이며 해당 축 내 최대인 경우 O)
  const pickTQ: "T" | "Q" | "O" =
    OTQ >= O_AXIS_THRESHOLD && OTQ >= Math.max(T, Q)
      ? "O"
      : T === Q
      ? TIE_TQ
      : T > Q
      ? "T"
      : "Q";

  const pickSN: "S" | "N" | "O" =
    OSN >= O_AXIS_THRESHOLD && OSN >= Math.max(S, N)
      ? "O"
      : S === N
      ? TIE_SN
      : S > N
      ? "S"
      : "N";

  const pickPG: "P" | "G" | "O" =
    OPG >= O_AXIS_THRESHOLD && OPG >= Math.max(P, G)
      ? "O"
      : P === G
      ? TIE_PG
      : P > G
      ? "P"
      : "G";

  const pickJP: "J" | "P" | "O" =
    OJP >= O_AXIS_THRESHOLD && OJP >= Math.max(J, P2)
      ? "O"
      : J === P2
      ? TIE_JP
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
