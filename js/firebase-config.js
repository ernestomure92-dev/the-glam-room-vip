// REEMPLAZA CON TUS DATOS DE FIREBASE
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "the-glam-room.firebaseapp.com",
    databaseURL: "https://the-glam-room-default-rtdb.firebaseio.com",
    projectId: "the-glam-room",
    storageBucket: "the-glam-room.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const clientsRef = database.ref('clients');
const visitsRef = database.ref('visits');
const codesRef = database.ref('codes');
