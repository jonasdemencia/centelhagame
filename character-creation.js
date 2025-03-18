import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let rolls = { health: 3, strength: 3, dexterity: 3, intelligence: 3, luck: 3 };
let resets = { health: 2, strength: 2, dexterity: 2, intelligence: 2, luck: 2 };

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

async function savePlayerData(uid, data) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, data, { merge: true });
        console.log("Dados salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

async function getPlayerData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
            console.log("Dados do jogador recuperados:", playerSnap.data());
            return playerSnap.data();
        } else {
            console.log("Nenhum dado encontrado para este jogador.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao recuperar os dados:", error);
        return null;
    }
}

function getPlayerStats() {
    return {
        name: document.getElementById("playerName").value || "", // Nome do jogador
        race: document.getElementById("race").value,
        alignment: document.getElementById("alignment").value,
        class: document.getElementById("class").value,
        health: getStatObject("health"),
        strength: getStatObject("strength"),
        dexterity: getStatObject("dexterity"),
        intelligence: getStatObject("intelligence"),
        luck: getStatObject("luck"),
    };
}

function getStatObject(stat) {
    return {
        firstRoll: getStat(stat + "1"),
        secondRoll: getStat(stat + "2"),
        total: getStat(stat + "Total"),
        rolls: rolls[stat],
        resets: resets[stat]
    };
}

function getStat(id) {
    return parseInt(document.getElementById(id)?.innerText) || 0;
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
            const playerData = await getPlayerData(user.uid);
            if (playerData) {
                document.getElementById("playerName").value = playerData.name || "";
                document.getElementById("race").value = playerData.race || "";
                document.getElementById("alignment").value = playerData.alignment || "";
                document.getElementById("class").value = playerData.class || "";
                
                for (const stat of ["health", "strength", "dexterity", "intelligence", "luck"]) {
                    if (playerData[stat]) {
                        document.getElementById(stat + "1").innerText = playerData[stat].firstRoll || "-";
                        document.getElementById(stat + "2").innerText = playerData[stat].secondRoll || "-";
                        document.getElementById(stat + "Total").innerText = playerData[stat].total || "-";
                        rolls[stat] = playerData[stat].rolls ?? 3;
                        resets[stat] = playerData[stat].resets ?? 2;
                    }
                }
            }
        } else {
            window.location.href = "index.html";
        }
    });
});
