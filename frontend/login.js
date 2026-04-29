const loginForm = document.getElementById("loginForm");
const roleSelector = document.getElementById("roleSelector");
const loginRoleInput = document.getElementById("loginRole");
const loginMessage = document.getElementById("loginMessage");

const apiBaseCandidates = (() => {
  const candidates = [];

  if (window.location.protocol.startsWith("http")) {
    candidates.push(window.location.origin);
  }

  candidates.push("http://127.0.0.1:5050", "http://localhost:5050", "http://127.0.0.1:5000");

  return [...new Set(candidates)];
})();

async function resolveApiBaseUrl() {
  for (const baseUrl of apiBaseCandidates) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { method: "GET" });

      if (response.ok) {
        return baseUrl;
      }
    } catch (error) {
      console.warn(`API health check failed for ${baseUrl}:`, error);
    }
  }

  throw new Error("No API server is reachable.");
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message ${type}`;
}

function setActiveRole(role) {
  roleSelector.querySelectorAll(".role-pill").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  loginRoleInput.value = role;
}

roleSelector.addEventListener("click", (event) => {
  const button = event.target.closest(".role-pill");

  if (!button) {
    return;
  }

  setActiveRole(button.dataset.role);
  showStatus(loginMessage, `Login mode set to ${button.textContent}.`, "info");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const role = loginRoleInput.value;

  try {
    showStatus(loginMessage, "Checking credentials...", "info");
    const apiBaseUrl = await resolveApiBaseUrl();

    const res = await fetch(`${apiBaseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role })
    });

    const data = await readResponseBody(res);

    if (!res.ok) {
      showStatus(loginMessage, data.message || "Login failed.", "error");
      return;
    }

    window.sessionStorage.setItem("rescue-nexus-user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login request failed:", error);
    showStatus(loginMessage, "Could not connect to the login server.", "error");
  }
});

setActiveRole("rescue");
