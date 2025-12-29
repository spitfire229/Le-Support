let socket;

function connectWebSocket(sessionId) {
    socket = new WebSocket(`wss://TON_SERVEUR:3000/?session=${sessionId}`);

    socket.onopen = () => {
        setStatus("🟢 Connecté au serveur");
    };

    socket.onerror = () => {
        setStatus("🔴 Erreur WebSocket");
    };
}
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const sessionInput = document.getElementById("session");

sendBtn.onclick = async () => {
    const sessionId = sessionInput.value.trim();
    if (!sessionId) {
        setStatus("❌ ID de session manquant");
        return;
    }

    connectWebSocket(sessionId);

    for (const file of fileInput.files) {
        const formData = new FormData();
        formData.append("session_id", sessionId);
        formData.append("file", file);

        await fetch("https://TON_SERVEUR:3000/upload", {
            method: "POST",
            body: formData
        });

        setStatus(`📤 ${file.name} envoyé`);
    }
};
function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}
