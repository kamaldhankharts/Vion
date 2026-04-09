import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDzkR2yOwEVvF9uAtKKILgYexsS23honWY",
  authDomain: "vion-watch.firebaseapp.com",
  databaseURL: "https://vion-watch-default-rtdb.firebaseio.com",
  projectId: "vion-watch",
  storageBucket: "vion-watch.firebasestorage.app",
  messagingSenderId: "726151076722",
  appId: "1:726151076722:web:939393ae8e1a5607639beb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
