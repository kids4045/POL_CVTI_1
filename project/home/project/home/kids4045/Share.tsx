import React from "react";
import { useLocation } from "react-router-dom";
import { scamTypeProfiles } from "../data/scamTypeProfiles";
import { ScamTypeKey } from "../data/cvtiToScamType";

const Share: React.FC = () => {
  const location = useLocation();
  const mbti = location.state?.mbti;
  const scamType = location.state?.scamType;
  const profile = scamTypeProfiles[scamType as ScamTypeKey];

  if (!mbti || !scamType || !profile) {
    return <p>정보가 부족합니다. 결과 페이지로 다시 이동해 주세요.</p>;
  }

  return (
    <div>
      <h2>📤 공유 및 행동 안내</h2>

      <p>
        당신의 결과: {mbti} ({scamType}) – {profile.title}
      </p>
      <blockquote>{profile.slogan}</blockquote>

      {/* 복사 공유 블록 */}
      <textarea
        readOnly
        value={`🧠 나는 ${mbti} (${scamType}) – ${profile.title}
📌 "${profile.slogan}"

#사기1초전 #사기예방테스트 #${scamType.replace(/\s/g, "")} #경찰청`}
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            `🧠 나는 ${mbti} (${scamType}) – ${profile.title}
📌 "${profile.slogan}"

#사기1초전 #사기예방테스트 #${scamType.replace(/\s/g, "")} #경찰청`
          );
          alert("복사되었습니다! 인스타그램에 붙여넣어 공유해보세요.");
        }}
      >
        📋 공유 문구 복사하기
      </button>

      {/* 링크 버튼 */}
      <div style={{ marginTop: "30px" }}>
        <h4>📎 관련 링크</h4>
        <ul>
          <li>
            <a
              href="https://www.instagram.com/police_kor_official/"
              target="_blank"
              rel="noopener noreferrer"
            >
              📸 경찰청 인스타그램 📸
            </a>
          </li>
          <li>
            <a href="https://ecrm.police.go.kr/minwon/main" target="_blank">
              🚨 사이버범죄신고센터 🚨
            </a>
          </li>
          <li>
            <a href="https://www.police.go.kr" target="_blank">
              👮‍♀️ 경찰청 홈페이지 👮‍♂️
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Share;
