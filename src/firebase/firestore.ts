// src/firebase/firestore.ts
export { db } from "."; // index.ts의 db 재수출 (경로 호환용)
export * from "firebase/firestore"; // 선택: SDK 함수도 함께 re-export (편의)
