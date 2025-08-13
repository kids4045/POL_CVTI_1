// src/pages/Stats.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Firestore
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  DocumentData,
  Timestamp,
} from "firebase/firestore";

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
  mbti?: string;
  scamType?: string;
  timestamp?: unknown;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

// Timestamp 다양한 형태 안전 변환
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

const Stats: React.FC = () => {
  const [params] = useSearchParams();
  const key = params.get("key");

  if (key !== "4107") {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ff4d4f" }}>
        <h2>🚫 접근 권한이 없습니다.</h2>
        <p>정상적인 접근 경로로 접속해 주세요.</p>
      </div>
    );
  }

  // 코드(CVTI/MBTI)별 카운트
  const [codeCounts, setCodeCounts] = useState<Record<string, number>>({});
  // 사기 성향 유형별 카운트(9개 고정)
  const [scamCounts, setScamCounts] = useState<Record<ScamTypeKey, number>>(
    Object.fromEntries(ALL_TYPES.map((t) => [t, 0])) as Record<
      ScamTypeKey,
      number
    >
  );
  const [total, setTotal] = useState(0);
  const [latest, setLatest] = useState<{
    code: string; // cvti or mbti (fallback)
    scamType: ScamTypeKey | "알 수 없음";
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "results"));

      const codeMap: Record<string, number> = {};
      const typeMap: Record<ScamTypeKey, number> = Object.fromEntries(
        ALL_TYPES.map((t) => [t, 0])
      ) as Record<ScamTypeKey, number>;

      // 최신 데이터(스냅샷 아님, data만 보관)
      let latestSeconds = -1;
      let latestData: ResultDoc | null = null;

      snap.forEach((doc) => {
        const data = doc.data() as ResultDoc;

        // 코드 누적
        const cvtiRaw: string = String(data.cvti ?? data.mbti ?? "");
        if (cvtiRaw) {
          codeMap[cvtiRaw] = (codeMap[cvtiRaw] || 0) + 1;

          // 유형 결정(저장값 우선, 없으면 계산)
          let t: ScamTypeKey | null = null;
          if (
            data.scamType &&
            ALL_TYPES.includes(String(data.scamType) as ScamTypeKey)
          ) {
            t = data.scamType as ScamTypeKey;
          } else {
            const calc = getScamTypeFromCVTI(cvtiRaw);
            if (calc && ALL_TYPES.includes(calc)) t = calc;
          }
          if (t) typeMap[t] = (typeMap[t] || 0) + 1;
        }

        // 최신 타임스탬프 추적
        const secVal = toSeconds(data.timestamp);
        if (typeof secVal === "number" && secVal > latestSeconds) {
          latestSeconds = secVal;
          latestData = data;
        }
      });

      setCodeCounts(codeMap);
      setScamCounts(typeMap);
      setTotal(snap.size);

      if (latestData !== null) {
        const ld = latestData as ResultDoc; // ✅ 여기서 타입을 확정
        const rawCode: string = String(ld.cvti ?? ld.mbti ?? "");
        const derived: ScamTypeKey | "알 수 없음" =
          (ld.scamType && ALL_TYPES.includes(String(ld.scamType) as ScamTypeKey)
            ? (ld.scamType as ScamTypeKey)
            : getScamTypeFromCVTI(rawCode)) || "알 수 없음";

        const sec = toSeconds(ld.timestamp) ?? Math.floor(Date.now() / 1000);
        const formatted = new Date(sec * 1000).toLocaleString("ko-KR");

        setLatest({ code: rawCode, scamType: derived, timestamp: formatted });
      } else {
        setLatest(null);
      }
    };

    fetchData();
  }, []);

  // 코드(CVTI/MBTI) 차트 데이터 (알파벳순)
  const codeLabels = Object.keys(codeCounts).sort();
  const codeValues = codeLabels.map((label) => codeCounts[label]);
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

  // Chart.js v4 타입 호환 옵션
  const chartOptions = (title: string): ChartOptions<"bar"> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 20 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.raw}명`,
        },
      },
    },
    scales: {
      x: { type: "category" },
      y: {
        type: "linear",
        beginAtZero: true,
        ticks: {
          callback: ((v: unknown) => `${v}명`) as any,
          precision: 0,
        },
      },
    },
  });

  // public/assets 경로 사용
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
          maxWidth: "800px",
          margin: "0 auto",
          padding: "clamp(16px, 5vw, 40px)",
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          📊 실시간 통계
        </h2>

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
          {latest && (
            <p>
              <strong>최근 응답자:</strong> {latest.code} ({latest.scamType}) /{" "}
              {latest.timestamp}
            </p>
          )}
        </div>

        {codeLabels.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: "14px" }}>
            통계 데이터를 불러오는 중입니다...
          </p>
        ) : (
          <>
            <div
              style={{
                width: "100%",
                minHeight: "320px",
                overflowX: "auto",
                paddingBottom: "40px",
              }}
            >
              <Bar
                data={codeChartData}
                options={chartOptions("CVTI(코드) 유형별 응답 수")}
              />
            </div>

            <div
              style={{
                width: "100%",
                minHeight: "320px",
                overflowX: "auto",
                paddingBottom: "40px",
                marginTop: "60px",
              }}
            >
              <Bar
                data={scamChartData}
                options={chartOptions("사기 성향 유형별 응답 수")}
              />
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
