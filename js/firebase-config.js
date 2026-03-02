// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKBrQgkoJ1IDwcdkrAdfCjWANm9J6bNkc",
  authDomain: "theglamroom-mx.firebaseapp.com",
  projectId: "theglamroom-mx",
  storageBucket: "theglamroom-mx.firebasestorage.app",
  messagingSenderId: "57431429937",
  appId: "1:57431429937:web:4139ca449dfac178a05610"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const clientsRef = database.ref('clients');
const visitsRef = database.ref('visits');
const codesRef = database.ref('codes');
