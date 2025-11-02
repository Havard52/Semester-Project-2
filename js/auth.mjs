// auth.mjs
export const API_KEY = 'abc693e7-12a4-4279-a63a-a9644683228d';
const baseURL = "https://v2.api.noroff.dev/";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

//  Helper: show messages
function showMessage(msg, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = msg;
  authMessage.style.color = isError ? "red" : "green";
}

//Login existing user
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const res = await fetch(`${baseURL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_KEY
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.message || "Login failed.");

      const user = data.data;
      localStorage.setItem("ans_user", JSON.stringify(user));
      localStorage.setItem("ans_token", user.accessToken);

      // Redirect too index
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      showMessage(err.message, true);
    }
  });
}

// Register new user
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const passwordRepeat = document.getElementById("registerPasswordRepeat").value.trim();

    if (password !== passwordRepeat) {
      return showMessage("Passwords do not match.", true);
    }

    try {
      const res = await fetch(`${baseURL}auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_KEY
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.message || "Registration failed.");

      const user = data.data;

      // automatic login after registration
      const loginRes = await fetch(`${baseURL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_KEY
        },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.errors?.[0]?.message || "Login after registration failed.");

      const loggedInUser = loginData.data;
      localStorage.setItem("ans_user", JSON.stringify(loggedInUser));
      localStorage.setItem("ans_token", loggedInUser.accessToken);

      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      showMessage(err.message, true);
    }
  });
}

// auto redirect if already logged in 
const storedUser = localStorage.getItem("ans_user");
if (storedUser && window.location.pathname.includes("login.html")) {
  window.location.href = "index.html";
}

