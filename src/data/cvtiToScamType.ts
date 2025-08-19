// /src/data/cvtiToScamType.ts

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

// ✅ 새 CVTI 체계(T/Q, S/N, P/G, J/P) 기준 매핑 (16개 풀 매트릭스)
export const cvtiToScamType: Record<string, ScamTypeKey> = {
  // T* * * (8)
  TSPJ: "절차맹신형",
  TSPP: "절차맹신형",
  TSGJ: "절차맹신형",
  TSGP: "신뢰우선형",
  TNPJ: "신뢰우선형",
  TNPP: "회피수동형",
  TNGJ: "정보과신형",
  TNGP: "정보과신형",

  // Q* * * (8)
  QSPJ: "감정공감형",
  QSPP: "감정공감형",
  QSGJ: "선한낙관형",
  QSGP: "직진반응형",
  QNPJ: "실험과잉형",
  QNPP: "직진반응형",
  QNGJ: "정보과신형",
  QNGP: "절차맹신형",
};

// ──────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────
const countLetterO = (code: string) => (code.match(/O/g) || []).length;

/**
 * 단일 O 포함 코드 보수적 정규화
 * - 각 축에서 O가 등장하면 다음의 "안전치"로 치환:
 *   TQ: O -> Q,  SN: O -> S,  PG: O -> P,  JP: O -> P
 * - 결과적으로 16개 기본 코드 중 하나로 귀결되도록 보장
 */
function sanitizeSingleO(cvti: string): string {
  const up = (cvti || "").toUpperCase();
  if (up.length !== 4) return up;

  const [a, b, c, d] = up.split(""); // a:T/Q/O, b:S/N/O, c:P/G/O, d:J/P/O
  const a2 = a === "O" ? "Q" : a;
  const b2 = b === "O" ? "S" : b;
  const c2 = c === "O" ? "P" : c;
  const d2 = d === "O" ? "P" : d;
  return `${a2}${b2}${c2}${d2}`;
}

/**
 * 코드 정규화(방호용):
 * - 대문자화
 * - 길이 보정 실패 시 원본 유지
 * - 단일 O면 보수적 치환
 * - 2개 이상 O는 상위 로직(무관심형 판정)에서 이미 걸러짐
 */
function normalizeCVTI(cvti: string): string {
  const up = (cvti || "").toUpperCase();
  if (up.length !== 4) return up;

  const oCnt = countLetterO(up);
  if (oCnt === 1) return sanitizeSingleO(up);
  return up;
}

// ──────────────────────────────────────────────
// 메인: CVTI -> ScamType
// - 문자열 또는 { cvti, oAxesCount } 모두 지원
// - O가 2축 이상이거나 'OOOO'면 즉시 '무관심형'
// - 단일 O는 보수적 정규화 후 16매핑으로 매핑
// - 매핑 실패시(이례적) 보수적 폴백
// ──────────────────────────────────────────────

export function getScamTypeFromCVTI(
  input: string | { cvti: string; oAxesCount?: number }
): ScamTypeKey {
  const raw = typeof input === "string" ? input : input.cvti;
  const up = (raw || "").toUpperCase();

  const oAxes =
    typeof input === "string"
      ? countLetterO(up)
      : input.oAxesCount ?? countLetterO(up);

  // ✅ 전역 무관심형 처리
  if (up === "OOOO" || oAxes >= 2) {
    return "무관심형";
  }

  // 단일 O 보수적 정규화 → 16개 기본 코드 중 하나로 유도
  const normalized = normalizeCVTI(up);

  // 1차 매핑 시도
  const mapped = cvtiToScamType[normalized];
  if (mapped) return mapped;

  // 2차 방호: 혹시라도 남아있는 O가 있거나 오타가 섞였을 때
  // - 다시 한 번 O를 보수적으로 제거(이중 안전망)
  const hardSanitized = sanitizeSingleO(normalized);
  const mapped2 = cvtiToScamType[hardSanitized];
  if (mapped2) return mapped2;

  // 최종 폴백(매핑 실패는 이례적) — 가장 보수적 유형으로 귀속
  // 프로젝트 기준에 맞춰 조정 가능
  return "절차맹신형";
}

/* 
──────────────────────────────────────────────
📌 새 CVTI(T/Q, S/N, P/G, J/P) → 사기 성향 매핑 근거 (요약)
──────────────────────────────────────────────
| CVTI | 성향         | 이유(요약) |
|------|--------------|------------|
| TSPJ | 절차맹신형 | 신뢰+사실+개방+계획 → 절차/권위 신뢰 |
| TSPP | 절차맹신형 | 신뢰+사실+개방+유연 → 절차 의존 |
| TSGJ | 절차맹신형 | 신뢰+사실+방어+계획 → 규칙 신뢰 |
| TSGP | 신뢰우선형 | 신뢰+사실+방어+유연 |
| TNPJ | 신뢰우선형 | 신뢰+직관+개방+계획 |
| TNPP | 회피수동형 | 신뢰+직관+개방+유연 → 결정 지연 |
| TNGJ | 정보과신형 | 신뢰+직관+방어+계획 |
| TNGP | 정보과신형 | 신뢰+직관+방어+유연 |
| QSPJ | 감정공감형 | 의심+사실+개방+계획 → 감정 설득 취약 |
| QSPP | 감정공감형 | 의심+사실+개방+유연 |
| QSGJ | 선한낙관형 | 의심+사실+방어+계획 |
| QSGP | 직진반응형 | 의심+사실+방어+유연 → 즉흥 반응 |
| QNPJ | 실험과잉형 | 의심+직관+개방+계획 → 검증 부족 |
| QNPP | 직진반응형 | 의심+직관+개방+유연 |
| QNGJ | 정보과신형 | 의심+직관+방어+계획 → 빠른 결론 |
| QNGP | 절차맹신형 | 의심+직관+방어+유연 → 절차/권위 의존 |
──────────────────────────────────────────────
*/
