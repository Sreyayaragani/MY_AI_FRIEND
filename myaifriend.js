const speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "auto";
recognition.interimResults = false;

document.querySelector(".mic-btn").addEventListener("click", () => {
    recognition.start();
    console.log("Listening...");
});

recognition.addEventListener("result", async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("User said:", transcript);
    
    addMessageBubble("You", transcript, "user-bubble");
  
    let aiReply = await getAIReply(transcript);

    addMessageBubble("AI", aiReply, "ai-bubble");


    speakText(aiReply);

});

function addMessageBubble(sender, text, className) {
    const chatBox = document.getElementById("chat-box");
    const bubble = document.createElement("div");
    bubble.className = `bubble ${className}`;
    bubble.innerHTML = `<strong>${sender}:</strong><p>${text}</p>`;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function getAIReply(userInput) {
    try {
        const response = await fetch("https://api.pawan.krd/gpt-oss-20b/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_API_KEY_HERE"
            },
            body: JSON.stringify({
                model: "gpt-oss-20b",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userInput }
                ]
            })
        });

        const data = await response.json();
        console.log("AI Response:", data);

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return data.error?.message || "No reply from AI.";
        }
        
    } catch (err) {
        console.error("API Error:", err);
        return "Sorry, I couldn't connect to AI.";
    }
}


function speakText(text) {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    let selectedVoiceType = document.getElementById("voice-select").value || "female";

    let voice;
    if (selectedVoiceType === "male") {
        voice = voices.find(v => v.name.toLowerCase().includes("child")) || voices.find(v => v.name.toLowerCase().includes("junior")) || voices[0];
    }
     else {

        voice = voices.find(v => v.name.toLowerCase().includes("female")) || voices.find(v => v.name.toLowerCase().includes("samantha")) || voices[0];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 1; 
    utterance.pitch = 1; 
    synth.speak(utterance);
}

speechSynthesis.onvoiceschanged = () => {
    console.log("Available voices:", speechSynthesis.getVoices());
};