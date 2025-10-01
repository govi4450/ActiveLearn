// Configuration
const apiKey = "AIzaSyDmlFU86ydq5734N5P_55KeYgKnJHj1GTY";
const backendUrl = "http://127.0.0.1:5000/";
const GOOGLE_API_KEY = "AIzaSyAjtS64P8wyCfNw31B3lClZs3U6qRI5hnY";
const SEARCH_ENGINE_ID = "051550749bd4e4df9";

// Initialize dark mode
function initializeDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    toggle.checked = true;
  }
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", toggle.checked ? "enabled" : "disabled");
  });
}

// Utility functions
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();
  
  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("authModal")) {
      AuthModule.closeModal();
    }
  });

  // Initialize scroll to top button
  document.querySelector(".fab").addEventListener("click", scrollToTop);
});