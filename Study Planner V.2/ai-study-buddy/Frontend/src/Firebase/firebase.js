// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQZVBSOOes88qaAlyEUsEPcmF-_MnG6KQ",
  authDomain: "ai-study-buddy-ef77a.firebaseapp.com",
  databaseURL: "https://ai-study-buddy-ef77a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ai-study-buddy-ef77a",
  storageBucket: "ai-study-buddy-ef77a.firebasestorage.app",
  messagingSenderId: "151807604236",
  appId: "1:151807604236:web:2b5677da647b7ecb0ae029",
  measurementId: "G-BXDG3PGNNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
const database = getDatabase(app)

export {app, auth, database};
