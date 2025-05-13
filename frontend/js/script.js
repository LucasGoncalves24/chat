// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")


// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")
const chatFileInput = chat.querySelector(".chat__file");
const chatFileButton = chat.querySelector(".chat__file-button");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const createImageSelfElement = (imageURL) => {
    const div = document.createElement("div");
    const img = document.createElement("img");

    div.classList.add("message--self");
    img.src = imageURL;
    img.alt = "Imagem enviada";

    div.appendChild(img);
    return div;
};

const createImageOtherElement = (imageURL, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const img = document.createElement("img");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.innerHTML = sender;

    img.src = imageURL;
    img.alt = "Imagem recebida";

    div.appendChild(span);
    div.appendChild(img);
    return div;
};


const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const showNotification = (title, body) => {
    if (document.hidden && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "./images/chat-icon.png" // opcional, adicione um ícone do seu projeto
        });
    }
}



const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, image } = JSON.parse(data);

    const message = image
        ? (userId == user.id
            ? createImageSelfElement(image)
            : createImageOtherElement(image, userName, userColor))
        : (userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor));

    if (userId !== user.id) showNotification(userName, content);
      }

    chatMessages.appendChild(message);
    scrollScreen();
};


const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chat-backend-d04q.onrender.com")
    websocket.onmessage = processMessage

    // Solicita permissão para notificação
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}
}

const sendMessage = (event) => {
    event.preventDefault();

    if (chatInput.value.trim()) {
        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: chatInput.value,
            image: null
        };

        websocket.send(JSON.stringify(message));
        chatInput.value = "";
    }
};


chatFileButton.addEventListener("click", () => {
    chatFileInput.click();
});

chatFileInput.addEventListener("change", () => {
    const file = chatFileInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = () => {
            const message = {
                userId: user.id,
                userName: user.name,
                userColor: user.color,
                image: reader.result, // Base64 da imagem
                content: "" // Não há texto na mensagem
            };

            websocket.send(JSON.stringify(message));
        };

        reader.readAsDataURL(file);
    }
});


loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)




const imageModal = document.querySelector(".image-modal");
const imageModalImg = imageModal.querySelector(".image-modal__img");
const imageModalClose = imageModal.querySelector(".image-modal__close");

// Abrir modal ao clicar em uma imagem
chatMessages.addEventListener("click", (event) => {
    if (event.target.tagName === "IMG") {
        imageModalImg.src = event.target.src; // Define a imagem clicada no modal
        imageModal.style.display = "flex"; // Exibe o modal
    }
});

// Fechar modal ao clicar no "X"
imageModalClose.addEventListener("click", () => {
    imageModal.style.display = "none";
});

// Fechar modal ao clicar fora da imagem
imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
        imageModal.style.display = "none";
    }
});
