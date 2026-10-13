import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase project: vion-app-by-blaze (from google-services.json, package com.blaze.vion)
const firebaseConfig = {
  "apiKey": "AIzaSyAQ1YUA82TWL4U_DpDAtEg4OHFQOwOW7Ag",
  "authDomain": "vion-app-by-blaze.firebaseapp.com",
  "databaseURL": "https://vion-app-by-blaze-default-rtdb.firebaseio.com",
  "projectId": "vion-app-by-blaze",
  "storageBucket": "vion-app-by-blaze.firebasestorage.app",
  "messagingSenderId": "878784004163",
  "appId": "1:878784004163:android:41b6a6b1d0d7443d1054f6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
