// Configurações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configurações do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inicializa os contadores para rolagens e resets por atributo
let rolls = { health: 3, strength: 3, dexterity: 3, intelligence: 3, luck: 3 };
let resets = { health: 2, strength: 2, dexterity: 2, intelligence: 2, luck: 2 };

// Função para rolar os dados
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Função para obter modificadores raciais com base na raça escolhida
function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { health: 0, strength: 0, dexterity: 0, intelligence: 0, luck: 0 };
    switch (race) {
        case "Anão":
            modifiers.health += 12;
            modifiers.intelligence += 3;
            modifiers.strength += 6;
            modifiers.dexterity += 4;
            break;
        case "Elfo":
            modifiers.health += 8;
            modifiers.intelligence += 4;
            modifiers.dexterity += 6;
            modifiers.strength += 4;
            break;
        case "Humano":
            modifiers.health += 10;
            modifiers.intelligence += 6;
            modifiers.dexterity += 4;
            modifiers.strength += 4;
            break;
    }
    return modifiers;
}

// Função para rolar o atributo
function rollStat(stat, button) {
    if (rolls[stat] > 0) {
        let firstRoll = document.getElementById(stat + "1");
        let secondRoll = document.getElementById(stat + "2");
        let totalRoll = document.getElementById(stat + "Total");
        let modifierDisplay = document.getElementById(stat + "Modifier");

        if (firstRoll.innerText === "-") {
            firstRoll.innerText = rollDice(6);
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);

            let rollValue = parseInt(firstRoll.innerText) + parseInt(secondRoll.innerText);
            const racialModifiers = getRacialModifiers();
            const modifierValue = racialModifiers[stat];

            if (modifierValue !== 0) {
                modifierDisplay.innerText = ` (+${modifierValue})`;
            } else {
                modifierDisplay.innerText = "";
            }

            rollValue += modifierValue;
            totalRoll.innerText = rollValue;
            rolls[stat]--;
            savePlayerData(auth.currentUser.uid, getPlayerStats());

            if (rolls[stat] === 0) disableButton(button);
        }
    } else {
        alert("Você já usou todas as 3 rolagens permitidas para este atributo!");
    }
}

// Função para zerar os atributos
function resetStat(stat, button) {
    if (resets[stat] > 0) {
        document.getElementById(stat + "1").innerText = "-";
        document.getElementById(stat + "2").innerText = "-";
        document.getElementById(stat + "Total").innerText = "-";
        document.getElementById(stat + "Modifier").innerText = "";
        resets[stat]--;
        savePlayerData(auth.currentUser.uid, getPlayerStats());
        if (resets[stat] === 0) disableButton(button);
    } else {
        alert("Você já zerou este atributo 2 vezes!");
    }
}

// Função para salvar os dados do jogador no Firestore
async function savePlayerData(uid, data) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, data, { merge: true });
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

// Função para carregar os dados do jogador ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const playerData = await getPlayerData(user.uid);
            if (playerData) {
                for (const stat in playerData) {
                    document.getElementById(stat + "1").innerText = playerData[stat].firstRoll || "-";
                    document.getElementById(stat + "2").innerText = playerData[stat].secondRoll || "-";
                    document.getElementById(stat + "Total").innerText = playerData[stat].total || "-";
                    rolls[stat] = playerData[stat].rolls || 3;
                    resets[stat] = playerData[stat].resets || 2;
                }
            }
        } else {
            window.location.href = "index.html";
        }
    });
});

window.rollStat = rollStat;
window.resetStat = resetStat;
