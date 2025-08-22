// src/pages/Stats.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";

// Firebase
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

// Chart
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// CVTI → ScamType 변환
import { ScamTypeKey, getScamTypeFromCVTI } from "../data/cvtiToScamType";

type ResultDoc = {
  cvti?: string;
  mbti?: string; // 레거시 호환
  scamType?: string;
  risk?: number;
  createdAt?: unknown; // Timestamp | Date | { seconds:number } | ...
  timestamp?: unknown; // 레거시 호환
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 9개 전 유형(무관심형 포함)
const ALL_TYPES: ScamTypeKey[] = [
  "감정공감형",
  "절차맹신형",
  "직진반응형",
  "실험과잉형",
  "신뢰우선형",
  "회피수동형",
  "정보과신형",
  "선한낙관형",
  "무관심형",
];

const TYPE_COLORS: Record<ScamTypeKey, string> = {
  감정공감형: "#f87171",
  절차맹신형: "#a78bfa",
  직진반응형: "#fb923c",
  실험과잉형: "#38bdf8",
  신뢰우선형: "#8b5cf6",
  회피수동형: "#9ca3af",
  정보과신형: "#60a5fa",
  선한낙관형: "#facc15",
  무관심형: "#94a3b8",
};

// Timestamp 다양한 형태 → 초(second)로 안전 변환
function toSeconds(ts: unknown): number | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.seconds;
  if (typeof (ts as any).seconds === "number") return (ts as any).seconds;
  if (typeof (ts as any).toDate === "function") {
    return Math.floor((ts as any).toDate().getTime() / 1000);
  }
  if (ts instanceof Date) return Math.floor(ts.getTime() / 1000);
  return null;
}

const fmtKST = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

// YYYY-MM-DD → Timestamp 범위(자정~23:59:59.999)
function toRangeTimestamps(startStr?: string, endStr?: string) {
  let from: Timestamp | undefined;
  let to: Timestamp | undefined;
  if (startStr) {
    const [y, m, d] = startStr.split("-").map(Number);
    from = Timestamp.fromDate(new Date(y!, m! - 1, d!, 0, 0, 0, 0));
  }
  if (endStr) {
    const [y, m, d] = endStr.split("-").map(Number);
    to = Timestamp.fromDate(new Date(y!, m! - 1, d!, 23, 59, 59, 999));
  }
  return { from, to };
}

// CSV 다운로드
function downloadCSV(currentRows: ResultDoc[], startStr?: string, endStr?: string) {
  const header = ["createdAt(KST)", "cvti", "scamType", "risk"];
  const lines = [header.join(",")];

  currentRows.forEach((r) => {
    const sec = toSeconds(r.createdAt) ?? toSeconds(r.timestamp);
    const dt = sec ? fmtKST.format(new Date(sec * 1000)) : "";
    const fields = [
      dt,
      String(r.cvti ?? r.mbti ?? ""),
      String(r.scamType ?? ""),
      typeof r.risk === "number" ? String(r.risk) : "",
    ].map((v) => `"${v.replace(/"/g, '""')}"`);
    lines.push(fields.join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cvti_results_${startStr || "all"}_${endStr || "all"}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const TOP_N_DEFAULT = 15;
const PAGE_SIZE_DEFAULT = 20;

const Stats: React.FC = () => {
  // 로딩/에러 상태
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 기간 필터 (기본: 캠페인 예정일 2025-08-20 ~ 2025-09-10)
  const [start, setStart] = useState<string>("2025-08-20");
  const [end, setEnd] = useState<string>("2025-09-10");

  // 원본 행(현재 필터) — CSV/집계 공통 사용
  const [rows, setRows] = useState<ResultDoc[]>([]);

  // 코드(CVTI/MBTI)별 카운트
  const [codeCounts, setCodeCounts] = useState<Record<string, number>>({});
  // 사기 성향 유형별 카운트(9개 고정)
  const [scamCounts, setScamCounts] = useState<Record<ScamTypeKey, number>>(
    Object.fromEntries(ALL_TYPES.map((t) => [t, 0])) as Record<ScamTypeKey, number>
  );
  const [total, setTotal] = useState(0);
  const [latest, setLatest] = useState<{
    code: string; // cvti or mbti (fallback)
    scamType: ScamTypeKey | "알 수 없음";
    timestamp: string;
  } | null>(null);

  // Top-N / 전체보기 + 페이지네이션 상태 (PVTI 코드 그래프용)
  const [showAllCodes, setShowAllCodes] = useState(false);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_DEFAULT);
  const [page, setPage] = useState<number>(1);

  // 데이터 로딩(기간 변경 시 재조회)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const ref = collection(db, "results");
        const { from, to } = toRangeTimestamps(start, end);

        const conds: any[] = [];
        if (from) conds.push(where("createdAt", ">=", from));
        if (to) conds.push(where("createdAt", "<=", to));
        // 범위조건 있으면 동일 필드 orderBy 필수
        conds.push(orderBy("createdAt", "desc"));
        conds.push(limit(5000));

        const snap = await getDocs(query(ref, ...conds));
        const list: ResultDoc[] = snap.docs.map((d) => d.data() as ResultDoc);
        setRows(list);

        // 집계
        const codeMap: Record<string, number> = {};
        const typeMap: Record<ScamTypeKey, number> = Object.fromEntries(
          ALL_TYPES.map((t) => [t, 0])
        ) as Record<ScamTypeKey, number>;

        for (const data of list) {
          const code = String(data.cvti ?? data.mbti ?? "");
          if (!code) continue;
          codeMap[code] = (codeMap[code] || 0) + 1;

          let t: ScamTypeKey | null = null;
          if (data.scamType && ALL_TYPES.includes(String(data.scamType) as ScamTypeKey)) {
            t = data.scamType as ScamTypeKey;
          } else {
            const calc = getScamTypeFromCVTI(code);
            if (calc && ALL_TYPES.includes(calc)) t = calc;
          }
          if (t) typeMap[t] = (typeMap[t] || 0) + 1;
        }

        setCodeCounts(codeMap);
        setScamCounts(typeMap);
        setTotal(list.length);

        // 최신 1건 표시
        const first = list[0];
        if (first) {
          const rawCode = String(first.cvti ?? first.mbti ?? "");
          const derived: ScamTypeKey | "알 수 없음" =
            (first.scamType && ALL_TYPES.includes(String(first.scamType) as ScamTypeKey)
              ? (first.scamType as ScamTypeKey)
              : getScamTypeFromCVTI(rawCode)) || "알 수 없음";

          const sec =
            toSeconds(first.createdAt) ??
            toSeconds(first.timestamp) ??
            Math.floor(Date.now() / 1000);
          const formatted = new Date(sec * 1000).toLocaleString("ko-KR");

          setLatest({ code: rawCode, scamType: derived, timestamp: formatted });
        } else {
          setLatest(null);
        }

        // 범위 변경 시 페이지 리셋
        setPage(1);
        setShowAllCodes(false);
      } catch (e: any) {
        console.error("stats load error:", e?.code, e?.message);
        setErr(`${e?.code || "error"}: ${e?.message || ""}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [start, end]);

  // === PVTI 코드(최대 81종)용 가공 ===
  // 1) 알파벳/사전순보다 "많은 순"이 관찰/운영에 유리 → count desc 정렬
  const sortedCodes = useMemo(() => {
    const entries = Object.entries(codeCounts);
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return entries;
  }, [codeCounts]);

  // 2) Top-N 또는 전체 + 페이지네이션
  const topN = TOP_N_DEFAULT;
  const totalCodes = sortedCodes.length;
  const totalPages = Math.max(1, Math.ceil(totalCodes / pageSize));

  const pagedEntries = useMemo(() => {
    if (!showAllCodes) return sortedCodes.slice(0, topN);
    const startIdx = (page - 1) * pageSize;
    return sortedCodes.slice(startIdx, startIdx + pageSize);
  }, [sortedCodes, showAllCodes, page, pageSize]);

  const codeLabels = pagedEntries.map(([label]) => label);
  const codeValues = pagedEntries.map(([, val]) => val);

  // 3) 그래프 높이(라벨 수에 따라 가변) — 항목당 34px + 여백
  const codeChartHeight = Math.min(
    900,
    Math.max(260, 34 * codeLabels.length + 140)
  );

  const codeChartData = {
    labels: codeLabels,
    datasets: [
      {
        label: "응답 수",
        data: codeValues,
        backgroundColor: "#4ade80",
        borderRadius: 8,
      },
    ],
  };

  // 사기 성향 차트 데이터 (9개 고정 순서)
  const scamLabels = ALL_TYPES;
  const scamValues = scamLabels.map((label) => scamCounts[label] || 0);
  const scamChartData = {
    labels: scamLabels,
    datasets: [
      {
        label: "응답 수",
        data: scamValues,
        backgroundColor: scamLabels.map((t) => TYPE_COLORS[t] || "#ccc"),
        borderRadius: 8,
      },
    ],
  };

  // Chart.js v4 옵션 (세로막대 유지, 컨테이너 높이로 대응)
  const chartOptions = useCallback(
    (title: string): ChartOptions<"bar"> => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title, font: { size: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}명` } },
      },
      scales: {
        x: { type: "category", ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
        y: {
          type: "linear",
          beginAtZero: true,
          ticks: { callback: ((v: unknown) => `${v}명`) as any, precision: 0 },
        },
      },
    }),
    []
  );

  const bgUrl = `${process.env.PUBLIC_URL}/assets/test-background.png`;

  return (
    <div
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "clamp(16px, 5vw, 40px)",
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* 상단 헤더(제목 + 로그아웃) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "clamp(20px, 5vw, 28px)" }}>📊 실시간 통계</h2>
          <button
            onClick={() => signOut(auth)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
            title="로그아웃"
          >
            로그아웃
          </button>
        </div>

        {/* 기간 필터 + CSV */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 13, color: "#475569" }}>시작일</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <label style={{ fontSize: 13, color: "#475569" }}>종료일</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setStart("2025-08-20");
                setEnd("2025-09-10");
              }}
              style={{ padding: "6px 10px" }}
              title="캠페인 기간으로 설정"
            >
              캠페인(8/20~9/10)
            </button>
            <button
              onClick={() => downloadCSV(rows, start, end)}
              style={{
                padding: "6px 10px",
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
              title="현재 범위의 원본 행을 CSV로 저장"
            >
              CSV 내보내기
            </button>
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", fontSize: 14 }}>통계 데이터를 불러오는 중입니다...</p>}

        {err && (
          <p style={{ textAlign: "center", fontSize: 14, color: "#b91c1c" }}>
            오류: {err}
          </p>
        )}

        {!loading && !err && (
          <>
            {/* 요약 */}
            <div
              style={{
                marginBottom: "40px",
                textAlign: "center",
                fontSize: "clamp(14px, 4vw, 16px)",
                color: "#444",
              }}
            >
              <p>
                <strong>총 응답 수:</strong> {total}명
              </p>
              {latest ? (
                <p>
                  <strong>최근 응답자:</strong> {latest.code} ({latest.scamType}){" / "}
                  {latest.timestamp}
                </p>
              ) : (
                <p>표시할 데이터가 없습니다.</p>
              )}
            </div>

            {/* 차트: PVTI(코드) 유형별 응답 수 — Top-N + 전체보기(페이지네이션) */}
            <div style={{ marginTop: 20, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong>PVTI 코드</strong>
              <span style={{ color: "#6b7280", fontSize: 13 }}>
                {showAllCodes ? `전체(${totalCodes}종) · 페이지 ${page}/${Math.max(1, totalPages)}` : `Top-${topN} (총 ${totalCodes}종 중)`}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {!showAllCodes ? (
                  <button
                    onClick={() => setShowAllCodes(true)}
                    style={{ padding: "6px 10px", border: "1px solid #e5e7eb", background: "#fff" }}
                    title="전체 보기 (페이지별)"
                  >
                    전체 보기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAllCodes(false)}
                      style={{ padding: "6px 10px" }}
                      title="Top-N으로 돌아가기"
                    >
                      Top-{topN} 보기
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      title="페이지 크기"
                    >
                      {[10, 15, 20, 30, 40, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} / 페이지
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      style={{ padding: "6px 10px" }}
                      title="이전 페이지"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      style={{ padding: "6px 10px" }}
                      title="다음 페이지"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ width: "100%", height: codeChartHeight, paddingBottom: "12px" }}>
              <Bar data={codeChartData} options={chartOptions("PVTI(코드) 유형별 응답 수")} />
            </div>

            {/* 차트: 사기 성향 분포 (9개 고정) */}
            <div style={{ width: "100%", minHeight: "320px", paddingBottom: "40px", marginTop: "60px" }}>
              <Bar data={scamChartData} options={chartOptions("사기 성향 유형별 응답 수")} />
            </div>
          </>
        )}

        <p
          style={{
            marginTop: "50px",
            textAlign: "center",
            color: "#6b7280",
            fontWeight: "bold",
            fontSize: "clamp(12px, 3.5vw, 14px)",
          }}
        >
          이 데이터는 👮‍♀️ 경남 경찰청 👮‍♂️ 캠페인과 함께 수집되었습니다.
        </p>
      </div>
    </div>
  );
};

export default Stats;
