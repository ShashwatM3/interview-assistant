// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA40BmrR9otEztPJCHxlimIiDMiPAeZuaE",
  authDomain: "interviewerai-f7747.firebaseapp.com",
  projectId: "interviewerai-f7747",
  storageBucket: "interviewerai-f7747.firebasestorage.app",
  messagingSenderId: "6454972243",
  appId: "1:6454972243:web:96a85c6db85d3c5c1d1ba6",
  measurementId: "G-72NVXEVHKK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };