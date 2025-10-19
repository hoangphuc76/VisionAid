import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.firebaseConfig_apikey,
  authDomain: "zact-13cef.firebaseapp.com",
  databaseURL: "https://zact-13cef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zact-13cef",
  storageBucket: "zact-13cef.firebasestorage.app",
  messagingSenderId: "995155259928",
  appId: "1:995155259928:web:116620db223555c316496d",
  measurementId: "G-CCHCHMMGE9"
};

// Init Firebase app
const app = initializeApp(firebaseConfig);

// Export Database
export const db = getDatabase(app);

// Export helpers
export { onValue, ref, remove, set };

