function sendResetLink(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    if (validateEmail(email)) {
        showPopup();  // Show the success popup
    } else {
        alert('Please enter a valid email address.');
    }
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
