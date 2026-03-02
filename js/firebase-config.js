// ==========================================
// CONFIGURACIÓN FIREBASE - THE GLAM ROOM
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyBKBrOgkoJ1IDwcDkrAdFCjWAnm9J6bNKc",
    authDomain: "theglamroom-mx.firebaseapp.com",
    databaseURL: "https://theglamroom-mx-default-rtdb.firebaseio.com",
    projectId: "theglamroom-mx",
    storageBucket: "theglamroom-mx.firebasestorage.app",
    messagingSenderId: "57431429937",
    appId: "1:57431429937:web:4139ca4439dfac178a05610"
};

// Inicializar Firebase (versión compat)
firebase.initializeApp(firebaseConfig);

// Referencias a la base de datos
const database = firebase.database();
const clientsRef = database.ref('clients');
const visitsRef = database.ref('visits');
const codesRef = database.ref('codes');

console.log('✅ Firebase conectado correctamente');
