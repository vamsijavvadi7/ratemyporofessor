




// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCSF5F6Ce0rsHC2mNe8KrcPBHMmWS6Zyqg",
  authDomain: "ratemyprofessor-dc983.firebaseapp.com",
  projectId: "ratemyprofessor-dc983",
  storageBucket: "ratemyprofessor-dc983.appspot.com",
  messagingSenderId: "72867237037",
  appId: "1:72867237037:web:27c8e88c8657ef056cca24"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);

export { auth, provider, signInWithPopup, db };