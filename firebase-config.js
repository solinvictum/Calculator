// Импортируем необходимые модули Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAJWjyW0xBgTzG-W4JIDmEhQaNXDN_YN5Q",
    authDomain: "calories-tracker-37361.firebaseapp.com",
    projectId: "calories-tracker-37361",
    storageBucket: "calories-tracker-37361.firebasestorage.app",
    messagingSenderId: "262358420064",
    appId: "1:262358420064:web:a54b6cb7cd0c8954ba5105",
    measurementId: "G-YC4EKZ772C"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Экспортируем необходимые функции
export { db, doc, setDoc, getDoc };

// Делаем доступным для глобального использования (на всякий случай)
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
