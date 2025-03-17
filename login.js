// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
  authDomain: "centelhagame-9d511.firebaseapp.com",
  projectId: "centelhagame-9d511",
  storageBucket: "centelhagame-9d511.firebasestorage.app",
  messagingSenderId: "700809803145",
  appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Testa a conexão com o Firestore
async function testFirestoreConnection() {
    try {
        const testDoc = doc(db, "test", "connection");
        await setDoc(testDoc, { status: "connected" });
        console.log("Conexão com o Firestore: Sucesso");
    } catch (error) {
        console.error("Erro ao conectar com o Firestore:", error);
    }
}
testFirestoreConnection();

// Inicializa os dados do jogador no Firestore se não existirem
async function initializePlayerData(uid) {
    const docRef = doc(db, "players", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        const initialData = {
            health: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
            strength: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
            dexterity: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
            intelligence: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 },
            luck: { firstRoll: "-", secondRoll: "-", total: "-", rolls: 3, resets: 2 }
        };
        await setDoc(docRef, initialData);
        console.log("Dados iniciais criados para o jogador:", uid);
    }
}

// Processa o login do jogador
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log("Usuário logado:", user);
            await initializePlayerData(user.uid);
            window.location.href = "character-creation.html";
        })
        .catch((error) => {
            console.error("Erro ao fazer login:", error);
            document.getElementById("message").innerText = "Erro: " + error.message;
        });
});
