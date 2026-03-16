import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, deleteDoc, updateDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyBytVuTMsf9Ehg9i6gPjk2DsRe1RmBQJlM",
	authDomain: "wedding-website-yr.firebaseapp.com",
	projectId: "wedding-website-yr",
	storageBucket: "wedding-website-yr.firebasestorage.app",
	messagingSenderId: "753295915424",
	appId: "1:753295915424:web:03c75b0e494001b53c8cc5",
	measurementId: "G-3ZM6SCGY9Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.firebaseDB = db;
window.firebaseFunctions = {
	collection,
	addDoc,
	doc,
	deleteDoc,
	updateDoc, // Add this
	query,
	orderBy,
	getDocs,
};
