// /src/firebase/firestore.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBE4D8zLNNRLgW307Lqz3Bd_kPlpVZzz60",
  authDomain: "mbti-scam-test.firebaseapp.com",
  projectId: "mbti-scam-test",
  storageBucket: "mbti-scam-test.firebasestorage.app",
  messagingSenderId: "127321747324",
  appId: "1:127321747324:web:b33ff2947d1eb5d64cbef9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
