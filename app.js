document.getElementById("sessionForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  if (!phone) {
    alert("⚠️ Please enter your WhatsApp number.");
    return;
  }

  try {
    const response = await fetch("/generate-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("sessionId").textContent = data.sessionId;
      document.getElementById("result").classList.remove("d-none");
    } else {
      alert("❌ Failed: " + data.message);
    }
  } catch (err) {
    alert("Server error. Make sure backend is running.");
  }
});
