import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_YLvd9oRYM-QZuQ8vbEtLgJipcPQcnSM",
  authDomain: "ledger-3daf2.firebaseapp.com",
  projectId: "ledger-3daf2",
  storageBucket: "ledger-3daf2.firebasestorage.app",
  messagingSenderId: "344588483924",
  appId: "1:344588483924:web:4927d8f06dca483f15dcc1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);