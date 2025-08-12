// src/components/ResultCaptureCard.tsx

import React from "react";
import { ScamTypeKey } from "../data/cvtiToScamType";
import { scamTypeProfiles } from "../data/scamTypeProfiles";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  mbti: string;
  scamType: ScamTypeKey;
  shapeUrl: string;
}

const ResultCaptureCard: React.FC<Props> = ({ mbti, scamType, shapeUrl }) => {
  const profile = scamTypeProfiles[scamType];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "32px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "20px",
        textAlign: "center",
        fontFamily: "'Pretendard', sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
        🧠 {mbti} ({scamType})
      </h2>
      <p style={{ fontWeight: "bold", marginBottom: "8px" }}>{profile.title}</p>
      <blockquote
        style={{
          fontStyle: "italic",
          fontWeight: "bold",
          fontSize: "16px",
          margin: "16px 0",
          color: "#333",
        }}
      >
        “{profile.slogan}”
      </blockquote>

      <p style={{ fontSize: "14px", marginBottom: "4px" }}>
        📊 위험도: {profile.riskLevel} (3/5)
      </p>

      <p
        style={{
          fontSize: "13px",
          marginBottom: "16px",
          color: "#555",
        }}
      >
        #사기1초전 #사기예방테스트 #{scamType} #경찰청
      </p>

      <div style={{ margin: "0 auto", width: "fit-content" }}>
        <QRCodeCanvas value={shapeUrl} size={128} />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
          결과 공유용 QR
        </p>
      </div>
    </div>
  );
};

export default ResultCaptureCard;
