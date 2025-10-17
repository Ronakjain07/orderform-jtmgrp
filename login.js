document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  // --- SET YOUR FIXED USERNAME AND PASSWORD HERE ---
const CORRECT_USERNAME = config.LOGIN_USERNAME;
const CORRECT_PASSWORD = config.LOGIN_PASSWORD;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from actually submitting

    const enteredUsername = usernameInput.value;
    const enteredPassword = passwordInput.value;

    // Check if the credentials are correct
    if (
      enteredUsername === CORRECT_USERNAME &&
      enteredPassword === CORRECT_PASSWORD
    ) {
      // SUCCESS: Redirect to the main order form page
      window.location.href = "orderform.html";
    } else {
      // FAILURE: Show an error message
      errorMessage.textContent = "Invalid ID or Password. Please try again.";

      // Add a shake animation for visual feedback
      const loginBox = document.querySelector(".login-box");
      loginBox.style.animation = "shake 0.5s";
      setTimeout(() => {
        loginBox.style.animation = "";
      }, 500);
    }
  });
});

// Add this small CSS animation keyframe to your login.css file for the shake effect
/*

*/
