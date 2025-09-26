// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-2892211255-21eaa",
  "appId": "1:557929930511:web:4177dad4002f39751a687a",
  "apiKey": "AIzaSyBTmnAwo49pk3j5c6yplCgmU4dw2_e9yHg",
  "authDomain": "studio-2892211255-21eaa.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "557929930511"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
