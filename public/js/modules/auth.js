const AuthModule = {
  currentUser: localStorage.getItem("currentUser") || null,

  init() {
    this.bindEvents();
    this.updateUI();
  },

  bindEvents() {
    document.getElementById("loginBtn").addEventListener("click", this.openModal.bind(this));
    document.getElementById("authToggle").addEventListener("click", this.toggleMode.bind(this));
    document.getElementById("authForm").addEventListener("submit", this.handleSubmit.bind(this));
    document.getElementById("logoutBtn").addEventListener("click", this.logout.bind(this));
  },

  openModal() {
    document.getElementById("authModal").style.display = "block";
  },

  closeModal() {
    document.getElementById("authModal").style.display = "none";
    document.getElementById("authForm").reset();
    document.getElementById("authError").style.display = "none";
  },

  toggleMode(e) {
    e.preventDefault();
    const isLogin = e.target.textContent.includes("Login");
    document.getElementById("authTitle").textContent = isLogin ? "Login" : "Register";
    document.getElementById("authSubmit").textContent = isLogin ? "Login" : "Register";
    e.target.textContent = isLogin ? "Need an account? Register" : "Have an account? Login";
  },

  async handleSubmit(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const isLogin = document.getElementById("authSubmit").textContent === "Login";

    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const response = await fetch(`${backendUrl}api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.currentUser = username;
        localStorage.setItem("currentUser", username);
        this.updateUI();
        this.closeModal();
        this.showNotification(`Successfully ${isLogin ? "logged in" : "registered"}!`);
      } else {
        this.showError(data.error || "Authentication failed");
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.updateUI();
    this.showNotification("Logged out successfully");
  },

  updateUI() {
    const userGreeting = document.getElementById("userGreeting");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (this.currentUser) {
      userGreeting.textContent = `Hi, ${this.currentUser}!`;
      userGreeting.style.display = "block";
      logoutBtn.style.display = "block";
      loginBtn.style.display = "none";
    } else {
      userGreeting.style.display = "none";
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
    }
  },

  showError(message) {
    const authError = document.getElementById("authError");
    authError.textContent = message;
    authError.style.display = "block";
  },

  showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : "success"}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  AuthModule.init();
});