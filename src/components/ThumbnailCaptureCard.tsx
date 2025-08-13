import React from "react";
import QRCode from "react-qr-code";
import { ScamTypeKey } from "../data/cvtiToScamType";
import { scamTypeProfiles } from "../data/scamTypeProfiles";
import { scamTypeRecommendations } from "../data/scamTypeRecommendations";

const backgroundColors: Record<ScamTypeKey, string> = {
  감정공감형: "#fce4ec",
  절차맹신형: "#e0f7fa",
  직진반응형: "#fff3e0",
  실험과잉형: "#f3e5f5",
  신뢰우선형: "#ede7f6",
  회피수동형: "#e8f5e9",
  정보과신형: "#e0f2f1",
  선한낙관형: "#f9fbe7",
  무관심형: "#eeeeee",
};

const scamTypeIcons: Record<ScamTypeKey, string> = {
  감정공감형: "💓",
  절차맹신형: "📋",
  직진반응형: "🏃",
  실험과잉형: "🧪",
  신뢰우선형: "🤝",
  회피수동형: "🙈",
  정보과신형: "🔍",
  선한낙관형: "🌞",
  무관심형: "😐",
};

type Props = {
  mbti: string;
  scamType: ScamTypeKey;
  shareUrl: string;
  risk: number;
};

const ThumbnailCaptureCard: React.FC<Props> = ({
  mbti,
  scamType,
  shareUrl,
  risk,
}) => {
  const profile = scamTypeProfiles[scamType];
  const background = backgroundColors[scamType];
  const icon = scamTypeIcons[scamType];

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 420px)").matches;

  // 데스크톱/모바일 값 스위치 헬퍼
  const fs = (desktop: number, mobile: number) => (isMobile ? mobile : desktop);
  const pad = (desktop: string, mobile: string) =>
    isMobile ? mobile : desktop;

  return (
    <div
      data-capture-card
      style={{
        // 🔧 고정폭 600 → 반응형
        width: "100%",
        maxWidth: "100%",
        backgroundColor: background,
        borderRadius: 24,
        padding: pad("24px 22px 26px", "20px 16px 22px"),
        boxSizing: "border-box",
        fontFamily:
          "'Pretendard Variable','Pretendard','Noto Sans KR',system-ui,sans-serif",
        textAlign: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        color: "#111",
        overflow: "hidden", // 내부 요소가 넘칠 때 안전망
      }}
    >
      {/* 상단 소개 블록 */}
      <div
        style={{
          background: "rgba(255,255,255,0.7)",
          borderRadius: 20,
          padding: pad("18px 16px", "14px 12px"),
          marginBottom: fs(14, 10),
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <div style={{ fontSize: fs(28, 22), fontWeight: 900, marginBottom: 4 }}>
          사기 성향 유형: <span>{scamType}</span> <span>{icon}</span>
        </div>

        <div
          style={{
            fontSize: fs(20, 17),
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          ✏️ 이런 생각을 가져보는 건 어때요?
        </div>

        <div
          style={{
            fontSize: fs(15, 14),
            color: "#6b7280",
            whiteSpace: "pre-line",
            lineHeight: 1.6,
          }}
        >
          {scamTypeRecommendations[scamType]}
        </div>
      </div>

      {/* 중앙 타입/슬로건 */}
      <div style={{ margin: "12px 0 18px" }}>
        <div style={{ fontSize: fs(40, 32) }}>🧠 {mbti}</div>
        <div
          style={{
            marginTop: 10,
            fontSize: fs(22, 18),
            fontWeight: 900,
            whiteSpace: "nowrap",
            wordBreak: "keep-all",
          }}
        >
          🙂 주의력 저하 – {scamType}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: fs(18, 16),
            color: "#4b5563",
            fontStyle: "italic",
            whiteSpace: "pre-line",
            lineHeight: 1.65,
          }}
        >
          {`“${profile.slogan}”`}
        </div>
      </div>

      {/* 세로 스택: 위험도 ↓ QR ↓ 해시태그 */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 위험도 */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            fontSize: fs(20, 18),
            marginBottom: 12,
            whiteSpace: "nowrap",
            wordBreak: "keep-all",
          }}
        >
          <span>📊</span>
          <span>{"\u00A0"}위험도:</span>
          <strong style={{ color: "#e11d48" }}>
            {"\u00A0"}
            {risk}%
          </strong>
        </div>

        {/* QR */}
        <div style={{ display: "block" }}>
          <QRCode value={shareUrl} size={fs(126, 112)} />
          <div style={{ fontSize: fs(14, 13), color: "#555", marginTop: 10 }}>
            결과 공유용 QR
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: fs(14, 13),
              color: "#475569",
              // 한 줄 유지 + 말줄임 → 가로 넘침 방지
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            #사기예방 #CVTI테스트 #{scamType.replace(/\s/g, "")} #경찰청
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCaptureCard;
