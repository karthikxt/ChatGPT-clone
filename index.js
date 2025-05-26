const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_key = "AIzaSyC7pmte-GnlqNgE2Zt6oiFRClef81umSnM";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class = "default-text">
                            <h1>Welcome to Chatbot</h1>
                            <p>Chat with our AI assistant and get instant responses to your queries.</p>
                            <p>Your chat history will be displayed here</p>
                            </div>`

    chatContainer.innerHTML = localStorage.getItem("chatHistory") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDataFromLocalStorage();

const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_key}`;

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: userText }]
                }
            ]
        })
    };

    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

        incomingChatDiv.querySelector(".typing-animation")?.remove();
        const pElement = document.createElement("p");
        pElement.textContent = resultText;
        incomingChatDiv.querySelector(".chat-details").appendChild(pElement);

    } catch (error) {
        console.error("Error:", error);
        incomingChatDiv.querySelector(".typing-animation")?.remove();
        const errorElement = document.createElement("p");
        errorElement.classList.add("error");
        errorElement.textContent = "Oops! Somithing went wrong while retrieving the response. Please try again.";
        incomingChatDiv.querySelector(".chat-details").appendChild(errorElement);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("chatHistory", chatContainer.innerHTML);
};

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="chatbot.jpg" alt="Bot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user.webp" alt="User-img">
                        <p></p>
                    </div>
                </div>`;
    const outgoingChatDiv = createElement(html, "outgoing");
    chatContainer.appendChild(outgoingChatDiv);
    outgoingChatDiv.querySelector("p").textContent = userText;

    // removes the welcome text
    // document.querySelector(".default-text")?.remove();
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
};

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete the chat chats?")) {
        localStorage.removeItem("chatHistory");
        loadDataFromLocalStorage();
    }
});


chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);
