// Firebase Imports (Modular Syntax)
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { auth, db } from './firebase.js'; // Your firebase.js should export auth and db initialized properly

// Initialize Auth & Firestore
const authInstance = getAuth();
const dbInstance = getFirestore();

// Logout Function
function logout() {
    signOut(authInstance)
        .then(() => {
            alert("👋 You have been logged out!");
            window.location.href = "E_Vaccination_Login.html";
        })
        .catch(error => alert("❌ Error: " + error.message));
}

//  Logout Button Listener
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

//  Check if user is logged in or not
onAuthStateChanged(authInstance, user => {
    if (user) {
        console.log("✅ Logged in:", user.email);
    } else {
        console.log("🚪 Logged out");
    }
});

//  Toggle between Login and Register Forms
function toggleForms() {
    document.querySelector('.container').classList.toggle('active');
}

//  When the page loads
document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    if (registerBtn && loginBtn) {
        registerBtn.addEventListener('click', toggleForms);
        loginBtn.addEventListener('click', toggleForms);
    }

    const hash = window.location.hash;
    if (hash === '#register') {
        document.querySelector('.container').classList.add('active');
    } else if (hash === '#login') {
        document.querySelector('.container').classList.remove('active');
    }
});

//  User Registration
const registrationForm = document.getElementById("registration-form");
if (registrationForm) {
    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        createUserWithEmailAndPassword(authInstance, email, password)
            .then(() => {
                alert("🎉 Registration Successful! Redirecting...");
                window.location.href = "welcome.html";
            })
            .catch((error) => {
                console.error("❌ Firebase Error:", error.code, error.message);
                alert("Error: " + error.message);
            });
    });
}

//  User Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        signInWithEmailAndPassword(authInstance, email, password)
            .then(() => {
                alert("✅ Login Successful! Redirecting...");
                window.location.href = "home.html";
            })
            .catch(error => alert("❌ Error: " + error.message));
    });
}

//  Baby Info Form Handler
const babyInfoForm = document.getElementById("info-form");
if (babyInfoForm) {
    babyInfoForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const motherName = document.getElementById("mother-name").value;
        const fatherName = document.getElementById("father-name").value;
        const babyName = document.getElementById("baby-name").value;
        const birthDate = document.getElementById("birth-date").value;

        const currentUser = authInstance.currentUser;
        if (!currentUser) {
            alert("Please log in to submit data.");
            return;
        }

        try {
            const docRef = await addDoc(collection(dbInstance, "babies"), {
                uid: currentUser.uid,
                motherName,
                fatherName,
                babyName,
                birthDate,
                createdAt: new Date()
            });

            console.log("👶 Baby info saved with ID:", docRef.id);
            alert("✅ Baby details submitted successfully!");

            const vaccinations = generateVaccinationData(birthDate);

            const userRef = doc(dbInstance, "users", currentUser.uid);
            await setDoc(userRef, {
                babyName,
                birthDate,
                vaccinations
            });

            console.log("💉 Vaccination data saved successfully!");
            window.location.href = "VaccinationChart.html";

        } catch (error) {
            console.error("❌ Error saving data:", error);
            alert("Something went wrong while saving baby or vaccination info!");
        }
    });
}

//  Generate Vaccination Data Based on Birth Date
function generateVaccinationData(birthDate) {
    const schedule = [
        { name: "BCG", daysAfter: 0 },
        { name: "Hepatitis B1", daysAfter: 0 },
        { name: "OPV-0", daysAfter: 0 },

        { name: "DTP1", daysAfter: 42 },
        { name: "Hepatitis B2", daysAfter: 42 },
        { name: "OPV-1", daysAfter: 42 },
        { name: "Hib1", daysAfter: 42 },

        { name: "DTP2", daysAfter: 70 },
        { name: "OPV-2", daysAfter: 70 },
        { name: "Hib2", daysAfter: 70 },

        { name: "DTP3", daysAfter: 98 },
        { name: "Hepatitis B3", daysAfter: 98 },
        { name: "OPV-3", daysAfter: 98 },
        { name: "Hib3", daysAfter: 98 },

        { name: "Measles", daysAfter: 270 },
        { name: "MMR1", daysAfter: 365 },
        { name: "Typhoid Conjugate Vaccine", daysAfter: 365 },

        { name: "Hepatitis A1", daysAfter: 540 },
        { name: "DTP Booster 1", daysAfter: 540 },
        { name: "Hib Booster", daysAfter: 540 },
        { name: "OPV Booster", daysAfter: 540 },

        { name: "MMR2", daysAfter: 540 },
        { name: "Hepatitis A2", daysAfter: 720 },

        { name: "Typhoid Booster", daysAfter: 1825 },
        { name: "DTP Booster 2", daysAfter: 1825 },
        { name: "OPV Booster 2", daysAfter: 1825 },

        { name: "Tdap", daysAfter: 3650 },
        { name: "HPV (Girls only)", daysAfter: 4015 },
        { name: "Td Booster", daysAfter: 5840 }
    ];

    const baseDate = new Date(birthDate);
    return schedule.map((vaccine, index) => {
        const due = new Date(baseDate);
        due.setDate(due.getDate() + vaccine.daysAfter);

        return {
            id: `vaccine-${index}`,
            vaccine: vaccine.name,
            dueDate: due.toISOString().split("T")[0],
            status: "Pending",
            actualDate: null
        };
    });
}

//  Utility: Calculate future date from birth
function calculateDate(birthDate, months) {
    const date = new Date(birthDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
}

// Show current timestamp
function updateTimestamp() {
    const timestampElement = document.getElementById('timestamp');
    const now = new Date(); // Current date and time
    if (timestampElement) {
        timestampElement.textContent = `Last updated: ${now.toLocaleString()}`;
    } else {
        console.error("Timestamp element not found.");
    }
}

// Ensure DOM is loaded before updating the timestamp
document.addEventListener("DOMContentLoaded", () => {
    updateTimestamp();
});


//  Back Button Handler
const backButton = document.querySelector(".back-btn");
if (backButton) {
    backButton.addEventListener("click", () => {
        window.location.href = "welcome.html";
    });
}



