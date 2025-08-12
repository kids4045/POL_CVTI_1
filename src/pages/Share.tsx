// src/pages/Share.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import ThumbnailCaptureCard from "../components/ThumbnailCaptureCard";
import { scamTypeIcons } from "../data/scamTypeIcons";
import { getScamTypeFromCVTI, ScamTypeKey } from "../data/cvtiToScamType";
import { scamTypeProfiles } from "../data/scamTypeProfiles";

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

const clampSafe = (n: unknown, fallback = 60) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, num));
};

const Share: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const cvti = params.get("cvti") || params.get("mbti") || "";
  const scamTypeParam = params.get("scamType") as ScamTypeKey | null;
  const scamType = (scamTypeParam || getScamTypeFromCVTI(cvti)) as ScamTypeKey;
  const profile = scamType ? scamTypeProfiles[scamType] : undefined;
  const backgroundColor = (scamType && backgroundColors[scamType]) || "#fafafa";

  const risk = useMemo(() => {
    const fromQuery = params.get("risk");
    if (fromQuery !== null) return clampSafe(fromQuery, 60);
    const fromProfile = (profile?.riskLevel ?? 3) * 20;
    return clampSafe(fromProfile, 60);
  }, [params, profile]);

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.origin + "/share");
    url.searchParams.set("cvti", cvti);
    url.searchParams.set("scamType", scamType);
    url.searchParams.set("risk", String(risk));
    url.searchParams.set("utm_source", "cvti");
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "gnpol");
    return url.toString();
  }, [cvti, scamType, risk]);

  const applyUrl = useMemo(() => {
    const url = new URL(window.location.origin + "/apply");
    url.searchParams.set("cvti", cvti);
    url.searchParams.set("scamType", scamType);
    url.searchParams.set("risk", String(risk));
    url.searchParams.set("ts", String(Date.now()));
    return url.toString();
  }, [cvti, scamType, risk]);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [copied, setCopied] = useState(false);

  // 캡처: html-to-image → 실패 시 html2canvas 폴백
  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setSaving(true);

    // 1) 실제 카드 루트
    const src =
      (cardRef.current.querySelector("[data-card-root]") as HTMLElement) ||
      (cardRef.current as HTMLElement);

    // 2) 화면 밖에 복제본을 만들어 캡처(뷰포트/transform/스크롤 영향 제거)
    const clone = src.cloneNode(true) as HTMLElement;
    // 폭/높이 고정(원본 사이즈 유지)
    const rect = src.getBoundingClientRect();
    clone.style.width = `${Math.ceil(rect.width)}px`;
    clone.style.height = `${Math.ceil(rect.height)}px`;
    clone.style.transform = "none";

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-99999px";
    sandbox.style.top = "0";
    sandbox.style.background = "#ffffff";
    sandbox.style.zIndex = "-1";
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    // 폰트 로드 대기(가능한 브라우저)
    try {
      // @ts-ignore
      await document.fonts?.ready;
    } catch {}

    // 한 프레임 쉬고 렌더 안정화
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    try {
      // 3) html-to-image 시도
      let dataUrl: string | null = null;
      try {
        const hti = await import("html-to-image");
        dataUrl = await hti.toPng(clone, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#ffffff",
          style: { transform: "none" },
        });
      } catch {
        // 4) 폴백: html2canvas
        const canvas = await html2canvas(clone, {
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          width: clone.offsetWidth,
          height: clone.offsetHeight,
          windowWidth: clone.offsetWidth,
          windowHeight: clone.offsetHeight,
        });
        dataUrl = canvas.toDataURL("image/png");
      }

      // 저장
      const a = document.createElement("a");
      a.href = dataUrl!;
      a.download = `CVTI_${cvti}_${scamType}.png`;
      a.click();

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 1600);
    } catch (e) {
      console.error(e);
      alert("이미지 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      document.body.removeChild(sandbox);
      setTimeout(() => setSaving(false), 150);
    }
  }, [cvti, scamType]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("아래 링크를 복사하세요", shareUrl);
    }
  }, [shareUrl]);

  const handleRetry = useCallback(() => {
    navigate("/"); // ✅ 홈 화면으로 이동
  }, [navigate]);

  const reportUrl = "https://ecrm.police.go.kr/minwon/main";
  const policeUrl = "https://www.police.go.kr/index.do";

  if (!cvti || !scamType || !profile) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        정보를 불러올 수 없습니다. 결과 페이지에서 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor,
        padding:
          "max(16px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        boxSizing: "border-box",
        textAlign: "center", // ✅ 공유 섹션 텍스트도 중앙 정렬
      }}
    >
      {/* 캡처 카드 프리뷰 */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            margin: "0 auto",
            borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "18px 18px 20px",
            textAlign: "center",
            // 저장 시 폰트/렌더링 안정
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#f1f5f9",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <span>CVTI</span>
            <strong>{cvti}</strong>
          </div>

          <h2 style={{ fontSize: 22, marginBottom: 8 }}>
            사기 성향 유형: <strong>{scamType}</strong>{" "}
            <span style={{ fontSize: 22 }}>
              {scamTypeIcons[scamType as keyof typeof scamTypeIcons]}
            </span>
          </h2>

          {/* ✅ ThumbnailCaptureCard 루트에 data-card-root 속성 있어야 함 */}
          <ThumbnailCaptureCard
            mbti={cvti}
            scamType={scamType}
            shareUrl={shareUrl}
            risk={risk}
          />

          {/* 위험도 바 (표기 줄바꿈 방지) */}
          <div style={{ margin: "12px auto 0", maxWidth: 420 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 6,
                whiteSpace: "nowrap",
                wordBreak: "keep-all",
              }}
            >
              <strong>위험도</strong>
              <span>{risk}%</span>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${risk}%`,
                  height: "100%",
                  background:
                    risk >= 67 ? "#ef4444" : risk >= 34 ? "#f59e0b" : "#10b981",
                }}
              />
            </div>
          </div>

          {/* 하단 마크(로고는 캡처 제외 가능) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              marginTop: 12,
              whiteSpace: "nowrap",
              wordBreak: "keep-all",
            }}
          >
            <img
              src="/assets/police-logo.png"
              alt="경남경찰청 로고"
              style={{ height: 22 }}
            />
            <span style={{ fontSize: 13, color: "#475569" }}>
              경남경찰청과{"\u00A0"}함께하는{"\u00A0"}#사기1초전
            </span>
          </div>
        </div>
      </motion.div>

      {/* 주요 버튼: 썸네일 → 응모 → 다시하기 */}
      <div
        style={{
          width: "min(560px, 92vw)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginTop: 18,
          textAlign: "center",
        }}
      >
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "#f9a8d4",
            color: "#fff",
            padding: "12px 16px",
            border: "none",
            borderRadius: 10,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            cursor: "pointer",
            width: "100%",
          }}
        >
          📸 썸네일 이미지 저장
        </button>

        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: "100%" }}
        >
          <button
            className="neon-yellow is-pulsing"
            style={{
              backgroundColor: "#facc15", // 기존 색 유지
              padding: "12px 16px",
              border: "none",
              borderRadius: 10,
              fontSize: "clamp(13px, 3.5vw, 16px)",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            📩 추첨 이벤트 응모하기
          </button>
        </a>

        <button
          onClick={handleRetry}
          style={{
            backgroundColor: "#3b82f6",
            color: "#fff",
            padding: "12px 16px",
            border: "none",
            borderRadius: 10,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            cursor: "pointer",
            width: "100%",
          }}
        >
          🔁 다시하기
        </button>
      </div>

      {/* 공유 링크 및 관련 페이지 */}
      <div
        style={{
          width: "min(560px, 92vw)",
          marginTop: 24,
          textAlign: "center",
        }}
      >
        <h4 style={{ fontSize: "clamp(14px, 4vw, 16px)", marginBottom: 10 }}>
          📎 공유 링크 및 관련 페이지
        </h4>

        <button
          onClick={handleCopy}
          style={{
            backgroundColor: "#e5e7eb",
            color: "#111827",
            padding: "12px 16px",
            border: "none",
            borderRadius: 10,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            cursor: "pointer",
            width: "100%",
            marginBottom: 10,
          }}
        >
          {copied ? "✅ 링크가 복사되었습니다" : "🔗 테스트 결과 URL 복사"}
        </button>

        <a
          href={reportUrl}
          target="_blank"
          rel="noreferrer"
          style={{ display: "block" }}
        >
          <button
            style={{
              backgroundColor: "#e5e7eb",
              padding: "12px 16px",
              border: "none",
              borderRadius: 10,
              fontSize: "clamp(13px, 3.5vw, 16px)",
              cursor: "pointer",
              width: "100%",
              margin: "10px 0",
            }}
          >
            🚨 사이버범죄신고센터
          </button>
        </a>

        <a
          href={policeUrl}
          target="_blank"
          rel="noreferrer"
          style={{ display: "block" }}
        >
          <button
            style={{
              backgroundColor: "#e5e7eb",
              padding: "12px 16px",
              border: "none",
              borderRadius: 10,
              fontSize: "clamp(13px, 3.5vw, 16px)",
              cursor: "pointer",
              width: "100%",
              marginTop: 10,
            }}
          >
            🏛 경찰청 홈페이지
          </button>
        </a>
      </div>

      {/* 저장 로더 */}
      {saving && (
        <div
          aria-live="assertive"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#111827",
              color: "#fff",
              padding: "16px 18px",
              borderRadius: 12,
              minWidth: 180,
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,.25)",
                borderTopColor: "#fff",
                margin: "0 auto 10px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            이미지 생성 중…
          </div>
          <style>
            {`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}
          </style>
        </div>
      )}

      {/* 저장 완료 토스트 */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            background: "#111827",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,.35)",
            zIndex: 10000,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          저장이 완료되었어요. SNS에 공유해보세요!
        </div>
      )}
    </div>
  );
};

export default Share;
