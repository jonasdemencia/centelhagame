// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para processar o login
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita o recarregamento da página
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            document.getElementById("message").innerText = "Login bem-sucedido!";
            console.log("Usuário logado:", user);
            // Atualizado para redirecionar para a página de criação de ficha
            window.location.href = "character-creation.html";
        })
        .catch((error) => {
            document.getElementById("message").innerText = "Erro ao fazer login: " + error.message;
            console.error("Erro ao fazer login:", error);
        });
});
