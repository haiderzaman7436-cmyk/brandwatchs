import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh9XihusSix89erKfOTHZEeUq3qyp05rw",
  authDomain: "brandwatches.firebaseapp.com",
  databaseURL: "https://brandwatches-default-rtdb.firebaseio.com",
  projectId: "brandwatches",
  storageBucket: "brandwatches.firebasestorage.app",
  messagingSenderId: "86001107680",
  appId: "1:86001107680:web:e04cd3989823dee9080685",
  measurementId: "G-N5BBHPFDPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };

export default app;
