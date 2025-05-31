// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs,
    query, where, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
    getAuth, signInWithEmailAndPassword,
    signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDbX-d03fsDDvBMGM3uPG_GYmvKab51Z24",
    authDomain: "clinic-project-5274b.firebaseapp.com",
    projectId: "clinic-project-5274b",
    storageBucket: "clinic-project-5274b.firebasestorage.app",
    messagingSenderId: "993749594536",
    appId: "1:993749594536:web:12d526f4c3f6f2d1a0ed9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
    db, auth, collection, addDoc, getDocs,
    query, where, deleteDoc, doc, onSnapshot,
    signInWithEmailAndPassword, signOut, onAuthStateChanged
};