const { ipcRenderer } = require("electron");

require('dotenv').config();
const discordAPI = process.env.DISCORD;

function closeWindow() {
    ipcRenderer.send("close-window");
}

function minWindow() {
    ipcRenderer.send("minimize-window");
}

function typeWriterEffect(element, text, speed) {
    element.textContent = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function updateGreeting() {
    const hours = new Date().getHours();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let greeting;
    if (hours < 5) {
        greeting = "Still Awake?! It's " + time;
    } else if (hours < 12) {
        greeting = "Good Morning!! The time is " + time;
    } else if (hours < 18) {
        greeting = "Good Afternoon! The time is " + time;;
    } else if (hours < 21) {
        greeting = "Good Evening! The time is " + time;;
    } else {
        greeting = "It's nightime.. The time is " + time;;
    }

    const greetingElement = document.getElementById("greeting");
    if (greetingElement) {
        typeWriterEffect(greetingElement, greeting, 100);
    }
}

updateGreeting();

// Navigation
function gotoRandomPicker() {
    window.location.href = "random-picker.html";
}

function gotoMessenger() {
    window.location.href = "messenger.html";
}

function goHome() {
    window.location.href = "index.html";
}

function pickRandom() {
    const input = document.getElementById("inputElements").value;
    const elements = input.split(",").map(item => item.trim()).filter(item => item !== "");

    if (elements.length === 0) {
        document.getElementById("output").textContent = "Please enter at least one element!";
        return;
    }

    sessionStorage.setItem("inputData", input);
    sessionStorage.setItem("fromPicking", "true");
    window.location.href = "picking.html";
}

function startRandomAnimation() {
    const storedInput = sessionStorage.getItem("inputData");
    if (!storedInput) {
        document.getElementById("output").textContent = "No elements found!";
        return;
    }

    const elements = storedInput.split(",").map(item => item.trim()).filter(item => item !== "");
    const output = document.getElementById("output");
    const backButton = document.getElementById("backButton");
    const respinButton = document.getElementById("respinButton");

    let index = 0;
    const interval = setInterval(() => {
        output.textContent = "Picking: " + elements[index];
        index = (index + 1) % elements.length;
    }, 150); // Animation speed

    setTimeout(() => {
        clearInterval(interval);
        const randomIndex = Math.floor(Math.random() * elements.length);
        output.textContent = "Landed on: " + elements[randomIndex];

        if (backButton) backButton.style.display = "block";
        if (respinButton) respinButton.style.display = "block";
    }, 2000); // Animation duration
}

function loadStoredInput() {
    const fromPicking = sessionStorage.getItem("fromPicking");
    if (fromPicking === "true") {
        const storedInput = sessionStorage.getItem("inputData");
        if (storedInput) {
            document.getElementById("inputElements").value = storedInput;
        }
        sessionStorage.removeItem("fromPicking");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.style.display = "none";
        backButton.addEventListener("click", () => {
            sessionStorage.setItem("fromAnimation", "true");
            window.location.href = "random-picker.html";
        });
    }

    const respinButton = document.getElementById("respinButton");
    if (respinButton) {
        respinButton.style.display = "none";
        respinButton.addEventListener("click", startRandomAnimation);
    }

    if (window.location.pathname.includes("picking.html")) {
        startRandomAnimation();
    }

    if (window.location.pathname.includes("random-picker.html")) {
        loadStoredInput();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sendIdeaButton").addEventListener("click", sendIdea);
});

function sendIdea() {
    const ideaInput = document.getElementById("ideaInput");
    const ideaText = ideaInput.value.trim();

    const modal = document.getElementById("customPrompt");
    const modalImage = modal.querySelector(".msg-modal-header img"); 

    if (ideaText === "") {
        openPrompt("Please enter something so I can send it!");
        modalImage.src = "assets/redCross.png";
        return;
    }

    fetch(discordAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: ideaText })
    }).then(response => {
        if (response.ok) {
            openPrompt("its been sent!!");
            ideaInput.value = "";
            ideaInput.disabled = false;
            modalImage.src = "assets/aaa.png";
        } else {
            openPrompt("Error!", "Failed to send your idea.");
            modalImage.src = "assets/redCross.png";
        }
    }).catch(error => {
        openPrompt("Error!", "Something went wrong.");
        modalImage.src = "assets/redCross.png";
        console.error("Error sending message:", error);
    });
}

function openPrompt(message) {
    const modal = document.getElementById("customPrompt");
    const modalMessage = modal.querySelector(".msg-modal-header h3"); 
    modalMessage.textContent = message;
    modal.style.display = "block";
}

function closePrompt() {
    document.getElementById("customPrompt").style.display = "none";
}