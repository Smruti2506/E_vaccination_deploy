//  Firebase setup imports
import { auth, db } from './firebase.js';
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { sendVaccinationCompletionEmail } from './emailService.js';

//  Utility: Convert JS Date to YYYY-MM-DD
function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

//  Main function: Load user data and vaccinations
auth.onAuthStateChanged(async (user) => {
  try {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        //  Display baby details
        displayBabyDetails(userData);

        //  Process and update vaccination statuses
        const updatedVaccinations = userData.vaccinations.map(updateVaccinationStatus);

        // Render the updated vaccination table
        renderVaccinationTable(updatedVaccinations);
      } else {
        alert("No vaccination data found for this user.");
      }
    } else {
      alert("Please log in first.");
      window.location.href = "E_Vaccination_Login.html";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("An error occurred while loading data. Please try again.");
  }
});

//  Function to display baby details
function displayBabyDetails(userData) {
  document.getElementById("name-output").textContent = userData.babyName || "Unknown";
  document.getElementById("baby-birthdate").textContent = userData.birthDate || "Unknown";
}

//  Function to process and update vaccination statuses
function updateVaccinationStatus(vaccine) {
  // If actualDate exists, check if it's before, on, or after dueDate
  if (vaccine.actualDate) {
    const actualDate = new Date(vaccine.actualDate);
    const dueDate = new Date(vaccine.dueDate);

    if (actualDate < dueDate) {
      vaccine.status = "✅ Completed Earlier";
    } else if (actualDate > dueDate) {
      vaccine.status = " 🟥 Completed Late";
    } else {
      vaccine.status = "✅ Completed";
    }
  }
  // If today > dueDate and actualDate is missing, mark as Missed
  else if (new Date() > new Date(vaccine.dueDate)) {
    vaccine.status = "❌ Missed";
  }
  // Otherwise, mark as Pending
  else {
    vaccine.status = "🕒 Pending";
  }
  return vaccine; // Return the updated vaccine object
}

//  Render the vaccination table
function renderVaccinationTable(vaccinations) {
  const tbody = document.getElementById("schedule-body");
  tbody.innerHTML = ""; // Clear old rows

  vaccinations.forEach((vaccine) => {
    const tr = document.createElement("tr");

    // Ensure vaccine and dueDate have fallback values
    const vaccineName = vaccine.vaccine || "Unknown";
    const dueDate = vaccine.dueDate ? new Date(vaccine.dueDate) : null;
    const dueDateString = dueDate ? formatDate(dueDate) : "N/A";

    //  Construct table row
    tr.innerHTML = `
      <td>${getAgeLabel(dueDate ? Math.floor((dueDate - new Date(document.getElementById("baby-birthdate").textContent)) / (1000 * 60 * 60 * 24)) : 0)}</td>
      <td>${vaccineName}</td>
      <td>${vaccine.actualDate || "-"}</td>
      <td>${vaccine.status}</td>
      <td>${dueDateString}</td>
      <td>
        <input type="checkbox" id="checkbox-${vaccine.id}" ${vaccine.status === "✅ Completed" ? "checked" : ""}>
      </td>
    `;

    // Add event listener for checkbox change
    const checkbox = tr.querySelector(`#checkbox-${vaccine.id}`);
    checkbox.addEventListener('change', async (event) => {
      if (event.target.checked) {
        const currentDate = formatDate(new Date());
        
        try {
          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const updatedVaccinations = userData.vaccinations.map(v => {
                if (v.id === vaccine.id) {
                  const actualDate = new Date(currentDate);
                  const dueDate = new Date(v.dueDate);
                  let status = "✅ Completed";
                  
                  if (actualDate < dueDate) {
                    status = "✅ Completed Earlier";
                  } else if (actualDate > dueDate) {
                    status = " 🟥 Completed Late";
                  }
                  
                  return { ...v, actualDate: currentDate, status };
                }
                return v;
              });
              
              // Update the database first
              await updateDoc(userRef, { vaccinations: updatedVaccinations });
              
              // Try to send email notification
              try {
                const emailSent = await sendVaccinationCompletionEmail(
                  user.email,
                  userData.babyName,
                  vaccine.vaccine,
                  currentDate
                );
                
                if (!emailSent) {
                  console.warn("Email notification failed to send, but vaccination was updated successfully");
                }
              } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Continue with the update even if email fails
              }
              
              alert("Vaccination marked as completed!");
              renderVaccinationTable(updatedVaccinations);
            }
          }
        } catch (error) {
          console.error("Error updating vaccination:", error);
          alert("Failed to update vaccination. Please try again.");
        }
      }
    });

    tbody.appendChild(tr);
  });
}

//  Convert day difference to age label
function getAgeLabel(days) {
  const ageMapping = {
    0: "At Birth",
    42: "6 Weeks",
    70: "10 Weeks",
    98: "14 Weeks",
    180: "6 Months",
    270: "9 Months",
    365: "12 Months",
    456: "15 Months",
    540: "18 Months",
    720: "2 Years",
    1825: "5 Years",
    3650: "10 Years",
    4015: "11 Years",
    5840: "16 Years",
  };
  return ageMapping[days] || `${Math.floor(days / 30)} Months`;
}