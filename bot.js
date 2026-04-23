// bot.js — Lógica del chatbot para el portfolio

const conversationHistory = [];

const SUGGESTED_QUESTIONS = [
  "¿Por qué debería contratarte?",
  "¿Qué experiencia tienes con IA?",
  "¿Cuáles son tus proyectos más destacados?",
  "¿Qué tipo de trabajo buscas?",
  "¿Con qué tecnologías trabajas?",
];

function initChat() {
  const chatToggle = document.getElementById("chat-toggle");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const suggestionsEl = document.getElementById("chat-suggestions");

  chatToggle.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
    chatToggle.classList.toggle("active");
    if (!chatWindow.classList.contains("hidden")) {
      chatInput.focus();
    }
  });

  chatClose.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
    chatToggle.classList.remove("active");
  });

  SUGGESTED_QUESTIONS.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    btn.textContent = q;
    btn.addEventListener("click", () => {
      sendMessage(q);
      suggestionsEl.style.display = "none";
    });
    suggestionsEl.appendChild(btn);
  });

  chatSend.addEventListener("click", () => handleSend());
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";
    suggestionsEl.style.display = "none";
    sendMessage(text);
  }
}

async function sendMessage(text) {
  appendMessage("user", text);
  const typing = appendTyping();

  // Añadir mensaje al historial antes de enviarlo
  conversationHistory.push({ role: "user", content: text });

  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: conversationHistory.slice(0, -1), // historial previo sin el mensaje actual
      }),
    });

    typing.remove();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Guardar respuesta del asistente en el historial
    conversationHistory.push({ role: "assistant", content: data.response });

    appendMessage("bot", data.response);
  } catch (err) {
    typing.remove();
    conversationHistory.pop(); // revertir si falló
    appendMessage(
      "bot",
      "Lo siento, ha ocurrido un error. Puedes contactar a Joan directamente en joanpedrocchipons@gmail.com"
    );
    console.error("Error chat:", err);
  }
}

function appendMessage(role, text) {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `chat-message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = text.replace(/\n/g, "<br>");

  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function appendTyping() {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "chat-message bot";
  div.innerHTML = `<div class="bubble typing"><span></span><span></span><span></span></div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

document.addEventListener("DOMContentLoaded", initChat);
