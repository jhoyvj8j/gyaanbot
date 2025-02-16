let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBD-aYZMyloOQF2v49_0kwTQL9lt5zuubE";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// Memory to store previous questions and answers
let chatHistory = [];

// Simulated ML model for learning (replace with actual ML model later)
function learnFromHistory(history) {
    // Analyze history to improve responses (e.g., detect patterns, preferences, etc.)
    console.log("Learning from history:", history);
    // For now, just log the history. You can replace this with actual ML logic.
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    // Include chat history in the API request for context
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                ...chatHistory.map(entry => ({
                    role: entry.role,
                    parts: [{ text: entry.text }]
                })),
                {
                    role: "user",
                    parts: [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();

        // Properly format AI response with line breaks
        let apiResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\n/g, "<br>")  // Preserve line breaks
            .trim();

        text.innerHTML = apiResponse;

        // Add the AI's response to chat history
        chatHistory.push({ role: "assistant", text: apiResponse });

        // Learn from the updated chat history
        learnFromHistory(chatHistory);
    } catch (error) {
        console.log(error);
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = 'img.svg';
        image.classList.remove("choose");
        user.file = {};
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    // Add the user's message to chat history
    chatHistory.push({ role: "user", text: user.message });

    let html = `
        <img src="USER2.PNG" alt="User Avatar" width="40" height="40">

        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="Gyaan Bot.png" alt="" id="aiImage" width="20%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="" class="load" width="50px">
            </div>`;

        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners for User Input
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

// Handling Image Upload
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];

        user.file = {
            mime_type: file.type,
            data: base64string
        };

        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };

    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
}); 
