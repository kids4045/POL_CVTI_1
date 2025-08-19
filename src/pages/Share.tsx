// src/pages/Share.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import ThumbnailCaptureCard from "../components/ThumbnailCaptureCard";
import { scamTypeIcons } from "../data/scamTypeIcons";
import { getScamTypeFromCVTI, ScamTypeKey } from "../data/cvtiToScamType";
import { scamTypeProfiles } from "../data/scamTypeProfiles";
import { saveResult } from "../services/results";

const CANONICAL_ORIGIN =
  process.env.REACT_APP_CANONICAL_ORIGIN || window.location.origin;

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

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 420px)").matches;

const Share: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // ✅ 파라미터 파싱 (대문자화/숫자화 포함)
  const cvti = (params.get("cvti") || params.get("mbti") || "").toUpperCase();
  const oParam = params.get("o");
  const oAxesCount =
    oParam != null && oParam !== "" && !Number.isNaN(Number(oParam))
      ? Number(oParam)
      : undefined;

  // scamType 파라미터가 있으면 우선 사용(백워드 호환), 없으면 객체 형태 입력으로 산출
  const scamTypeParam = params.get("scamType") as ScamTypeKey | null;
  const scamType = useMemo<ScamTypeKey | "">(() => {
    if (scamTypeParam) return scamTypeParam;
    if (!cvti) return "";
    return (
      oAxesCount != null
        ? getScamTypeFromCVTI({ cvti, oAxesCount })
        : getScamTypeFromCVTI(cvti)
    ) as ScamTypeKey;
  }, [scamTypeParam, cvti, oAxesCount]);

  const profile = scamType ? scamTypeProfiles[scamType] : undefined;
  const backgroundColor = (scamType && backgroundColors[scamType]) || "#fafafa";

  // ✅ 위험도: 쿼리 risk(0~100) 우선, 없으면 profile.riskLevel(0~5) × 20
  const risk = useMemo(() => {
    const fromQuery = params.get("risk");
    if (fromQuery !== null) return clampSafe(fromQuery, 60);
    const fromProfile = (profile?.riskLevel ?? 3) * 20;
    return clampSafe(fromProfile, 60);
  }, [params, profile]);

  // ✅ 공유 URL: cvti + o(객체 형태 입력 보강) + risk
  const shareUrl = useMemo(() => {
    const url = new URL(CANONICAL_ORIGIN + "/share");
    url.searchParams.set("cvti", cvti);
    if (oAxesCount != null) url.searchParams.set("o", String(oAxesCount));
    url.searchParams.set("scamType", scamType || "");
    url.searchParams.set("risk", String(risk));
    url.searchParams.set("utm_source", "cvti");
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "gnpol");
    return url.toString();
  }, [cvti, oAxesCount, scamType, risk]);

  const frameRef = useRef<HTMLDivElement | null>(null); // 흰 카드 루트
  const mountRef = useRef<HTMLDivElement | null>(null); // 썸네일 마운트
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [copied, setCopied] = useState(false);

  // 썸네일 카드가 px 고정 폭을 갖고 있어도 강제로 100%에 맞추기
  const enforceChildWidth = (host: HTMLElement | null) => {
    if (!host) return;
    const child = host.firstElementChild as HTMLElement | null;
    if (!child) return;
    child.style.width = "100%";
    child.style.maxWidth = "100%";
    child.style.boxSizing = "border-box";
    // 내부 이미지가 있으면 안전망
    child.querySelectorAll("img").forEach((img) => {
      (img as HTMLImageElement).style.maxWidth = "100%";
      (img as HTMLImageElement).style.height = "auto";
      (img as HTMLImageElement).style.boxSizing = "border-box";
    });
  };

  useEffect(() => {
    enforceChildWidth(mountRef.current);
  }, [cvti, scamType, risk, shareUrl]);

  const handleSave = useCallback(async () => {
    if (!frameRef.current) return;
    setSaving(true);

    // 컬러 카드만 집기 (없으면 프레임 전체)
    const target = frameRef.current.querySelector(
      "[data-capture-card]"
    ) as HTMLElement | null;
    const src = target ?? frameRef.current;

    const rect = src.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);

    // 오프스크린 복제
    const clone = src.cloneNode(true) as HTMLElement;
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
    clone.style.boxSizing = "border-box";
    clone.style.transform = "none";
    clone.style.margin = "0";

    // 색 깨짐 완화: 불투명 배경 + 섀도우 제거
    const computedBg = getComputedStyle(src).backgroundColor || "#ffffff";
    clone.style.boxShadow = "none";

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-99999px";
    sandbox.style.top = "0";
    sandbox.style.background = computedBg;
    sandbox.style.zIndex = "-1";
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    try {
      // @ts-ignore
      await document.fonts?.ready;
    } catch {}

    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    try {
      let dataUrl: string | null = null;
      try {
        const hti = await import("html-to-image");
        dataUrl = await hti.toPng(clone, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: computedBg,
          style: { transform: "none" },
        });
      } catch {
        const canvas = await html2canvas(clone, {
          backgroundColor: computedBg,
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          width: w,
          height: h,
          windowWidth: w,
          windowHeight: h,
        });
        dataUrl = canvas.toDataURL("image/png");
      }

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
    navigate("/"); // 홈으로 이동
  }, [navigate]);

  // ✅ /share 진입 시 1회 저장 (cvti + oAxesCount + scamType + risk)
  useEffect(() => {
    if (!cvti || !scamType || !profile) return;

    const key = `saved_${cvti}_${oAxesCount ?? "na"}_${scamType}_${risk}`;
    if (localStorage.getItem(key) === "1") return;

    // saveResult가 추가 필드를 허용한다면 함께 기록됨(파이어스토어는 초과 필드 무시 X)
    saveResult({
      cvti,
      oAxesCount: oAxesCount ?? null,
      scamType,
      risk,
    })
      .then(() => localStorage.setItem(key, "1"))
      .catch((e: any) => {
        console.error("results write error:", e?.code, e?.message);
      });
  }, [cvti, oAxesCount, scamType, risk, profile]);

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
        textAlign: "center",
        overflowX: "hidden",
      }}
    >
      {/* 캡처 카드 프리뷰 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* ✅ 공통 래퍼: 프레임/썸네일 모두 이 폭을 공유 */}
        <div
          style={{
            width: "min(92vw, 480px)",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {/* ✅ 흰 프레임 카드 (캡처 루트) */}
          <div
            ref={frameRef}
            data-card-root
            style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: "18px 18px 20px",
              textAlign: "center",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: isMobile ? "5px 9px" : "6px 10px",
                borderRadius: 999,
                background: "#f1f5f9",
                fontSize: isMobile ? 11 : 12,
                marginBottom: 8,
                whiteSpace: "nowrap",
              }}
            >
              <span>CVTI</span>
              <strong>{cvti}</strong>
              {oAxesCount != null && (
                <span style={{ opacity: 0.7, marginLeft: 6 }}>
                  O축: {oAxesCount}
                </span>
              )}
            </div>

            <h2
              style={{
                fontSize: isMobile ? 18 : 22,
                marginBottom: 8,
                lineHeight: 1.25,
              }}
            >
              <span>사기 성향 유형:</span>
              {isMobile ? (
                <>
                  <br />
                  <strong
                    style={{ whiteSpace: "nowrap", wordBreak: "keep-all" }}
                  >
                    {scamType}
                  </strong>{" "}
                  <span style={{ fontSize: isMobile ? 18 : 22 }}>
                    {scamTypeIcons[scamType as keyof typeof scamTypeIcons]}
                  </span>
                </>
              ) : (
                <>
                  {" "}
                  <strong
                    style={{ whiteSpace: "nowrap", wordBreak: "keep-all" }}
                  >
                    {scamType}
                  </strong>{" "}
                  <span style={{ fontSize: isMobile ? 18 : 22 }}>
                    {scamTypeIcons[scamType as keyof typeof scamTypeIcons]}
                  </span>
                </>
              )}
            </h2>

            {/* ✅ 썸네일 카드 마운트 (폭 강제 대상) */}
            <div ref={mountRef} data-thumb-mount style={{ width: "100%" }}>
              <ThumbnailCaptureCard
                mbti={cvti}
                scamType={scamType}
                shareUrl={shareUrl}
                risk={risk}
              />
            </div>

            {/* 위험도 바 */}
            <div style={{ margin: "12px auto 0", width: "100%" }}>
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
                      risk >= 67
                        ? "#ef4444"
                        : risk >= 34
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                />
              </div>
            </div>

            {/* 하단 마크 */}
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

        <button
          className="neon-yellow is-pulsing"
          style={{
            backgroundColor: "#facc15",
            padding: "12px 16px",
            border: "none",
            borderRadius: 10,
            fontSize: "clamp(13px, 3.5vw, 16px)",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
          }}
          type="button"
          onClick={() =>
            window.open(
              "https://naver.me/F4LrWZ3U",
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          📩 추첨 이벤트 응모하기
        </button>

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
          href="https://ecrm.police.go.kr/minwon/main"
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
          href="https://www.police.go.kr/index.do"
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
