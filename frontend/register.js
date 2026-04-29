const form = document.getElementById("form");
const statusMessage = document.getElementById("statusMessage");
const submitButton = document.getElementById("registerButton");

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;
  const role = document.getElementById("registerRole").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showStatus(statusMessage, "Passwords do not match.", "error");
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Registering...";
    showStatus(statusMessage, "Saving responder profile...", "info");
    const apiBaseUrl = await resolveApiBaseUrl();

    const res = await fetch(`${apiBaseUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, dob, role, password })
    });

    const data = await readResponseBody(res);

    if (!res.ok) {
      showStatus(statusMessage, data.message || "Registration failed.", "error");
      return;
    }

    form.reset();
    showStatus(statusMessage, "Registration successful. Redirecting to login...", "success");
    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (error) {
    console.error("Registration request failed:", error);
    showStatus(statusMessage, "Could not connect to the registration server.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Register responder";
  }
});
