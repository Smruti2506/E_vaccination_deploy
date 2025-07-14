// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcBkUYe0nBQfytX1CdZzPN_RBXUVkWmZA",
  authDomain: "child-e-vaccination-webs-9bc14.firebaseapp.com",
  projectId: "child-e-vaccination-webs-9bc14",
  storageBucket: "child-e-vaccination-webs-9bc14.firebasestorage.app",
  messagingSenderId: "657795068442",
  appId: "1:657795068442:web:06c1814d0da9a3937b97a3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };