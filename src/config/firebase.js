import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from "firebase/firestore";
// const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDoFRhXBcWg1zVO_5u36n0QUN8lgx8TDoA",
  authDomain: "monitoring-bike-bb734.firebaseapp.com",
  databaseURL: "https://monitoring-bike-bb734-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-bike-bb734",
  storageBucket: "monitoring-bike-bb734.appspot.com",
  messagingSenderId: "618514916334",
  appId: "1:618514916334:web:2570a094375891b3e0e4ff",
  measurementId: "G-RW1WLWVEJT"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app)
export const dbFirestore = getFirestore(app)

