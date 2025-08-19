// scripts/dump-cvti-map.ts
import { writeFileSync } from "node:fs";
import { getScamTypeFromCVTI } from "../src/data/cvtiToScamType.js"; // ★ 확장자 .js 표기 필수(ESM+TS-Node 규칙)

const AXES = [
  ["T", "Q", "O"], // TQ
  ["S", "N", "O"], // SN
  ["P", "G", "O"], // PG
  ["J", "P", "O"], // JP
];

function* combos() {
  for (const a of AXES[0])
    for (const b of AXES[1])
      for (const c of AXES[2])
        for (const d of AXES[3]) yield `${a}${b}${c}${d}`;
}

const rows: Array<{ code: string; type: string }> = [];
for (const code of combos()) {
  const t = (getScamTypeFromCVTI(code) as string) || "알 수 없음";
  rows.push({ code, type: t });
}

// CSV & MD
const header = "code,scamType\n";
const csv = header + rows.map((r) => `${r.code},${r.type}`).join("\n");
const md =
  `| CVTI 코드 | 사기 성향 유형 |\n|---|---|\n` +
  rows.map((r) => `| \`${r.code}\` | ${r.type} |`).join("\n");

writeFileSync("public/cvti-mapping.csv", csv, "utf-8");
writeFileSync("public/cvti-mapping.md", md, "utf-8");

console.log(
  "✅ Generated:\n - public/cvti-mapping.csv\n - public/cvti-mapping.md"
);
