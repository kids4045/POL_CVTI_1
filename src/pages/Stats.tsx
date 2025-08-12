import React, { useEffect, useState } from "react";
import { db } from "../firebase/firestore";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ScamTypeKey, getScamTypeFromCVTI } from "../data/cvtiToScamType";
import { useSearchParams } from "react-router-dom";

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
  감정공감형: "#f87171", // red-400
  절차맹신형: "#a78bfa", // violet-400
  직진반응형: "#fb923c", // orange-400
  실험과잉형: "#38bdf8", // sky-400
  신뢰우선형: "#ede7f6", // fallback? but keep consistent style—change to hex
  회피수동형: "#9ca3af", // gray-400
  정보과신형: "#60a5fa", // blue-400
  선한낙관형: "#facc15", // yellow-400
  무관심형: "#94a3b8", // slate-400
};

// 신뢰우선형 색 보정(위에서 연한색을 넣었으면 차트가 흐릴 수 있어 교체)
TYPE_COLORS["신뢰우선형"] = "#8b5cf6"; // violet-500

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
      const snapshot = await getDocs(collection(db, "results"));

      // 누적용 임시 객체
      const codeMap: Record<string, number> = {};
      const typeMap: Record<ScamTypeKey, number> = Object.fromEntries(
        ALL_TYPES.map((t) => [t, 0])
      ) as Record<ScamTypeKey, number>;

      // 최신 문서 추적
      let latestDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      let latestSeconds = -1;

      snapshot.forEach((doc) => {
        const data = doc.data();

        // 저장 필드: 신규(cvti), 레거시(mbti) 모두 수용
        const cvtiRaw: string = String(data.cvti ?? data.mbti ?? "");
        if (cvtiRaw) {
          codeMap[cvtiRaw] = (codeMap[cvtiRaw] || 0) + 1;

          // 저장된 scamType이 있으면 먼저 사용, 없으면 계산
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
          if (t) {
            typeMap[t] = (typeMap[t] || 0) + 1;
          }
        }

        // 최신 타임스탬프 계산 (Timestamp.now()로 저장된 구조 가정)
        const ts = data.timestamp;
        const sec: number =
          typeof ts?.seconds === "number"
            ? ts.seconds
            : typeof ts?.toDate === "function"
            ? Math.floor(ts.toDate().getTime() / 1000)
            : -1;

        if (sec > latestSeconds) {
          latestSeconds = sec;
          latestDoc = doc;
        }
      });

      setCodeCounts(codeMap);
      setScamCounts(typeMap);
      setTotal(snapshot.size);

      if (latestDoc) {
        const data = latestDoc.data();
        const rawCode: string = String(data.cvti ?? data.mbti ?? "");
        const derived =
          (data.scamType &&
          ALL_TYPES.includes(String(data.scamType) as ScamTypeKey)
            ? (data.scamType as ScamTypeKey)
            : getScamTypeFromCVTI(rawCode)) || "알 수 없음";
        const seconds =
          typeof data.timestamp?.seconds === "number"
            ? data.timestamp.seconds
            : Math.floor(
                (data.timestamp?.toDate?.() ?? new Date()).getTime() / 1000
              );
        const formatted = new Date(seconds * 1000).toLocaleString("ko-KR");

        setLatest({ code: rawCode, scamType: derived, timestamp: formatted });
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
        backgroundColor: "#4ade80", // green-400
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

  const chartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false as const,
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
      y: {
        ticks: { precision: 0, callback: (v: number) => `${v}명` },
      },
    },
  });

  return (
    <div
      style={{
        backgroundImage: `url("/assets/test-background.png")`, // ✅ 오타 수정 (urlurl → url)
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
