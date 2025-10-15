// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXkVYnp3qAvOCeyLfbPnxYabIjZOSaKA8",
  authDomain: "ethio-freelance-bc5d2.firebaseapp.com",
  projectId: "ethio-freelance-bc5d2",
  storageBucket: "ethio-freelance-bc5d2.firebasestorage.app",
  messagingSenderId: "1020540637643",
  appId: "1:1020540637643:web:20041bd3a9a85b456d664e",
  measurementId: "G-VW2MRFSTLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
