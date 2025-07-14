// // Import EmailJS
// //import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
// import * as emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';


// // EmailJS Configuration
// const EMAILJS_CONFIG = {
//     serviceId: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
//     templateId: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
//     userId: 'YOUR_USER_ID' // Replace with your EmailJS user ID
// };

// // Initialize EmailJS
// emailjs.init(EMAILJS_CONFIG.userId);

// // Function to send vaccination completion email
// export async function sendVaccinationCompletionEmail(userEmail, babyName, vaccineName, completionDate) {
//     try {
//         const templateParams = {
//             to_email: userEmail,
//             baby_name: babyName,
//             vaccine_name: vaccineName,
//             completion_date: completionDate,
//             subject: 'Vaccination Completed Successfully',
//             message: `
//                 <h2>Vaccination Completed</h2>
//                 <p>Dear Parent,</p>
//                 <p>We are pleased to inform you that ${babyName}'s vaccination has been completed successfully.</p>
//                 <p><strong>Vaccine:</strong> ${vaccineName}</p>
//                 <p><strong>Completion Date:</strong> ${completionDate}</p>
//                 <p>Thank you for keeping your child's vaccinations up to date.</p>
//                 <p>Best regards,<br>BabyShield Team</p>
//             `
//         };

//         const response = await emailjs.send(
//             EMAILJS_CONFIG.serviceId,
//             EMAILJS_CONFIG.templateId,
//             templateParams
//         );

//         if (response.status === 200) {
//             console.log("Vaccination completion email sent successfully");
//             return true;
//         } else {
//             console.error("Failed to send email:", response.text);
//             return false;
//         }
//     } catch (error) {
//         console.error("Error sending email:", error);
//         return false;
//     }
// }

// // Function to send vaccination reminder email
// export async function sendVaccinationReminder(userEmail, babyName, vaccineName, dueDate) {
//     try {
//         const templateParams = {
//             to_email: userEmail,
//             baby_name: babyName,
//             vaccine_name: vaccineName,
//             due_date: dueDate,
//             subject: 'Upcoming Vaccination Reminder',
//             message: `
//                 <h2>Vaccination Reminder</h2>
//                 <p>Dear Parent,</p>
//                 <p>This is a reminder that ${babyName} has a vaccination due tomorrow.</p>
//                 <p><strong>Vaccine:</strong> ${vaccineName}</p>
//                 <p><strong>Due Date:</strong> ${dueDate}</p>
//                 <p>Please make sure to schedule an appointment with your healthcare provider.</p>
//                 <p>Best regards,<br>BabyShield Team</p>
//             `
//         };

//         const response = await emailjs.send(
//             EMAILJS_CONFIG.serviceId,
//             EMAILJS_CONFIG.templateId,
//             templateParams
//         );

//         if (response.status === 200) {
//             console.log("Vaccination reminder email sent successfully");
//             return true;
//         } else {
//             console.error("Failed to send reminder email:", response.text);
//             return false;
//         }
//     } catch (error) {
//         console.error("Error sending reminder email:", error);
//         return false;
//     }
// }

// // Function to check for upcoming vaccinations
// export function checkUpcomingVaccinations(vaccinations, babyName, userEmail) {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     vaccinations.forEach(vaccine => {
//         if (vaccine.status === "🕒 Pending") {
//             const dueDate = new Date(vaccine.dueDate);
            
//             // Check if the vaccination is due tomorrow
//             if (dueDate.toDateString() === tomorrow.toDateString()) {
//                 sendVaccinationReminder(
//                     userEmail,
//                     babyName,
//                     vaccine.vaccine,
//                     formatDate(dueDate)
//                 );
//             }
//         }
//     });
// }

// // Helper function to format date
// function formatDate(date) {
//     return date.toLocaleDateString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });
// } 

// Import EmailJS
import * as emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',   // Replace with your EmailJS service ID
    templateId: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
    userId: 'YOUR_USER_ID'          // Replace with your EmailJS user ID
};

// Function to send vaccination completion email
export async function sendVaccinationCompletionEmail(userEmail, babyName, vaccineName, completionDate) {
    try {
        const templateParams = {
            to_email: userEmail,
            baby_name: babyName,
            vaccine_name: vaccineName,
            completion_date: completionDate,
            subject: 'Vaccination Completed Successfully',
            message: `
                <h2>Vaccination Completed</h2>
                <p>Dear Parent,</p>
                <p>We are pleased to inform you that ${babyName}'s vaccination has been completed successfully.</p>
                <p><strong>Vaccine:</strong> ${vaccineName}</p>
                <p><strong>Completion Date:</strong> ${completionDate}</p>
                <p>Thank you for keeping your child's vaccinations up to date.</p>
                <p>Best regards,<br>BabyShield Team</p>
            `
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.userId
        );

        if (response.status === 200) {
            console.log("Vaccination completion email sent successfully");
            return true;
        } else {
            console.error("Failed to send email:", response.text);
            return false;
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

// Function to send vaccination reminder email
export async function sendVaccinationReminder(userEmail, babyName, vaccineName, dueDate) {
    try {
        const templateParams = {
            to_email: userEmail,
            baby_name: babyName,
            vaccine_name: vaccineName,
            due_date: dueDate,
            subject: 'Upcoming Vaccination Reminder',
            message: `
                <h2>Vaccination Reminder</h2>
                <p>Dear Parent,</p>
                <p>This is a reminder that ${babyName} has a vaccination due tomorrow.</p>
                <p><strong>Vaccine:</strong> ${vaccineName}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p>Please make sure to schedule an appointment with your healthcare provider.</p>
                <p>Best regards,<br>BabyShield Team</p>
            `
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.userId
        );

        if (response.status === 200) {
            console.log("Vaccination reminder email sent successfully");
            return true;
        } else {
            console.error("Failed to send reminder email:", response.text);
            return false;
        }
    } catch (error) {
        console.error("Error sending reminder email:", error);
        return false;
    }
}

// Function to check for upcoming vaccinations
export function checkUpcomingVaccinations(vaccinations, babyName, userEmail) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    vaccinations.forEach(vaccine => {
        if (vaccine.status === "🕒 Pending") {
            const dueDate = new Date(vaccine.dueDate);
            
            // Check if the vaccination is due tomorrow
            if (dueDate.toDateString() === tomorrow.toDateString()) {
                sendVaccinationReminder(
                    userEmail,
                    babyName,
                    vaccine.vaccine,
                    formatDate(dueDate)
                );
            }
        }
    });
}

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
