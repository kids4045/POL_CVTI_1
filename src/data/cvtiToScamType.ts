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

// ✅ 새 MBTI 체계(T/Q, S/N, P/G, J/P) 기준 매핑
export const cvtiToScamType: Record<string, ScamTypeKey> = {
  // (이하는 이전에 드린 16개 매핑 그대로)
  TSPJ: "절차맹신형",
  TSPP: "절차맹신형",
  TSGJ: "절차맹신형",
  TSGP: "신뢰우선형",
  TNPJ: "신뢰우선형",
  TNPP: "회피수동형",
  TNGJ: "정보과신형",
  TNGP: "정보과신형",
  QSPJ: "감정공감형",
  QSPP: "감정공감형",
  QSGJ: "선한낙관형",
  QSGP: "직진반응형",
  QNPJ: "실험과잉형",
  QNPP: "직진반응형",
  QNGJ: "정보과신형",
  QNGP: "절차맹신형",
};

// O이 1개 포함되면 ‘보수적 안전치’로 정규화
function sanitizeCVTI(cvti: string): string {
  const [a, b, c, d] = cvti.split(""); // a:T/Q/O, b:S/N/O, c:P/G/O, d:J/P/O
  const a2 = a === "O" ? "Q" : a;
  const b2 = b === "O" ? "S" : b;
  const c2 = c === "O" ? "P" : c;
  const d2 = d === "O" ? "P" : d;
  return `${a2}${b2}${c2}${d2}`;
}

// 최종 스캠타입 계산: O 2축 이상이면 무관심형
export function getScamTypeFromCVTI(cvti: string): ScamTypeKey {
  const oAxes = cvti.split("").filter((x) => x === "O").length;
  if (oAxes >= 2) return "무관심형";
  const normalized = sanitizeCVTI(cvti);
  return cvtiToScamType[normalized];
}

/* 
──────────────────────────────────────────────
📌 새 CVTI(T/Q, S/N, P/G, J/P) → 사기 성향 매핑 근거
──────────────────────────────────────────────
| CVTI  | 성향         | 이유 |
|-------|--------------|------|
| TSPJ | 절차맹신형 | 신뢰 + 사실 + 개방 + 계획 → 절차·규칙 신뢰, 권위 의존 높음 |
| TSPP | 절차맹신형 | 신뢰 + 사실 + 개방 + 유연 → 정보 개방·신뢰로 절차 의존 |
| TSGJ | 절차맹신형 | 신뢰 + 사실 + 방어 + 계획 → 규칙 신뢰, 검증 부족 |
| TSGP | 신뢰우선형 | 신뢰 + 사실 + 방어 + 유연 → 방어하나 기본적으로 신뢰 우선 |

| TNPJ | 신뢰우선형 | 신뢰 + 직관 + 개방 + 계획 → 직관적이지만 신뢰 기반 |
| TNPP | 회피수동형 | 신뢰 + 직관 + 개방 + 유연 → 리스크 회피, 결정 지연 |
| TNGJ | 정보과신형 | 신뢰 + 직관 + 방어 + 계획 → 제한 정보 과신, 신뢰로 보완 |
| TNGP | 정보과신형 | 신뢰 + 직관 + 방어 + 유연 → 방어적이지만 일부 정보 과신 |

| QSPJ | 감정공감형 | 의심 + 사실 + 개방 + 계획 → 의심하나 인간관계 설득에 취약 |
| QSPP | 감정공감형 | 의심 + 사실 + 개방 + 유연 → 의심해도 친밀·감정 설득 약함 |
| QSGJ | 선한낙관형 | 의심 + 사실 + 방어 + 계획 → 분석적이지만 선의로 위험 무시 |
| QSGP | 직진반응형 | 의심 + 사실 + 방어 + 유연 → 경계심 있으나 즉흥 반응 잦음 |

| QNPJ | 실험과잉형 | 의심 + 직관 + 개방 + 계획 → 새로운 시도 선호, 검증 부족 |
| QNPP | 직진반응형 | 의심 + 직관 + 개방 + 유연 → 호기심·즉흥성으로 빠른 행동 |
| QNGJ | 정보과신형 | 의심 + 직관 + 방어 + 계획 → 일부 정보로 빠른 결론 |
| QNGP | 절차맹신형 | 의심 + 직관 + 방어 + 유연 → 의심하나 절차/권위에 기대는 경향 |
──────────────────────────────────────────────
*/
