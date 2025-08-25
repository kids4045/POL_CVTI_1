// src/data/cvtiToScamType.ts
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

// 16 기본 매핑 (+ 안전망 약간 추가)
export const cvtiToScamType: Record<string, ScamTypeKey> = {
  // T*
  TSPJ: "절차맹신형",
  TSPP: "절차맹신형",
  TSGJ: "절차맹신형",
  TSGP: "신뢰우선형",
  TNPJ: "신뢰우선형",
  TNPP: "회피수동형",
  TNGJ: "정보과신형",
  TNGP: "정보과신형",

  // Q*
  QSPJ: "감정공감형",
  QSPP: "감정공감형",
  QSGJ: "선한낙관형",
  QSGP: "직진반응형",
  QNPJ: "실험과잉형",
  QNPP: "직진반응형",
  QNGJ: "정보과신형",
  QNGP: "절차맹신형",

  // 🔒 안전망(정규화 전에 직접 들어오는 경우 방어)
  TNPO: "회피수동형",
  TNOP: "회피수동형",
};

// ──────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────
const countLetterO = (code: string) => (code.match(/O/g) || []).length;

/**
 * 단일 O 포함 코드 보수적 정규화.
 * 기존: TQ에서 O -> 'Q' (의심 우선치)만 적용되어 T* 유형이 과소 발생.
 * 수정: TQ에서 O -> 'T' 로 변경하여 편향 완화.
 * (SN/PG/JP는 기존과 동일: S/P/P)
 */
function sanitizeSingleO(cvti: string): string {
  const up = (cvti || "").toUpperCase();
  if (up.length !== 4) return up;

  const [a, b, c, d] = up.split(""); // a:T/Q/O, b:S/N/O, c:P/G/O, d:J/P/O
  const a2 = a === "O" ? "T" : a; // 🔄 changed: O -> T (이전엔 'Q')
  const b2 = b === "O" ? "S" : b;
  const c2 = c === "O" ? "P" : c;
  const d2 = d === "O" ? "P" : d;
  return `${a2}${b2}${c2}${d2}`;
}

/**
 * 외부에서 문자열 또는 { cvti, oAxesCount }를 받을 수 있게 지원.
 * - oAxesCount가 2 이상이거나 cvti === 'OOOO'면 즉시 '무관심형'
 * - 단일 O는 sanitizeSingleO로 정규화 뒤 16매핑으로 귀결
 * - 매핑 실패 시 보수적 폴백: '절차맹신형'
 */
export function getScamTypeFromCVTI(
  input: string | { cvti: string; oAxesCount?: number }
): ScamTypeKey {
  const raw = typeof input === "string" ? input : input.cvti;
  const up = (raw || "").toUpperCase();

  const oAxes =
    typeof input === "string"
      ? countLetterO(up)
      : input.oAxesCount ?? countLetterO(up);

  // 전역 무관심형 처리
  if (up === "OOOO" || oAxes >= 2) return "무관심형";

  // 단일 O → 보수 정규화
  const normalized = oAxes === 1 ? sanitizeSingleO(up) : up;

  // 1차 매핑
  const mapped = cvtiToScamType[normalized];
  if (mapped) return mapped;

  // 2차 안전망: 혹시 여전히 O가 남아있다면 한 번 더 정규화
  const hard = sanitizeSingleO(normalized);
  const mapped2 = cvtiToScamType[hard];
  if (mapped2) return mapped2;

  // 최종 폴백(매우 예외적)
  return "절차맹신형";
}

/*
──────────────────────────────────────────────
참고
- 회피수동형 부족 이슈는 "TQ축 단일 O의 Q 치환" 편향 + tie-break(Q 선호) 결합으로
  T* 계열이 과소 샘플링될 수 있어 발생했습니다.
- 본 수정은 TQ 단일 O를 'T'로 치환해 균형을 보정합니다.
- 더 중립적으로 하려면, TQ 단일 O를 50:50 랜덤(T/Q)으로 치환해도 됩니다.
──────────────────────────────────────────────
*/
