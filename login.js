// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const auth = getAuth(app); // Autenticação
const db = getFirestore(app); // Banco de dados Firestore

// Testando a conexão com Firestore
async function testFirestoreConnection() {
    try {
        const testDoc = doc(db, "test", "connection");
        await setDoc(testDoc, { status: "connected" });
        console.log("Conexão com o Firestore: Sucesso");
    } catch (error) {
        console.error("Erro ao conectar com o Firestore:", error);
    }
}

testFirestoreConnection(); // Testa a conexão ao carregar o arquivo

// Função para verificar e criar dados iniciais no Firestore
async function initializePlayerData(uid) {
    try {
        const docRef = doc(db, "players", uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Dados iniciais para um novo jogador
            const initialData = {
                health: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
                strength: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
                dexterity: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
                intelligence: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
                luck: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 }
            };
            await setDoc(docRef, initialData);
            console.log("Dados iniciais criados para o jogador:", uid);
        } else {
            console.log("Jogador já possui dados no Firestore.");
        }
    } catch (error) {
        console.error("Erro ao inicializar os dados do jogador:", error);
    }
}

// Função para processar o login
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita o recarregamento da página
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            document.getElementById("message").innerText = "Login bem-sucedido!";
            console.log("Usuário logado:", user);

            // Testando o UID do usuário
            console.log("UID do jogador autenticado:", user.uid);

            // Inicializa os dados do jogador no Firestore, se necessário
            await initializePlayerData(user.uid);

            // Redireciona para a página de criação de ficha
            window.location.href = "character-creation.html";
        })
        .catch((error) => {
            document.getElementById("message").innerText = "Erro ao fazer login: " + error.message;
            console.error("Erro ao fazer login:", error);
        });
});
