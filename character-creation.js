import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const auth = getAuth(); // Inicializa antes do uso

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

// Inicializa os contadores para rolagens e resets por atributo
let rolls = { health: 3, strength: 3, dexterity: 3, intelligence: 3, luck: 3 }; // Limite de rolagens por atributo
let resets = { health: 2, strength: 2, dexterity: 2, intelligence: 2, luck: 2 }; // Limite de resets por atributo

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
        console.log(`Rolando atributo: ${stat}`);
        let firstRoll = document.getElementById(stat + "1");
        let secondRoll = document.getElementById(stat + "2");
        let totalRoll = document.getElementById(stat + "Total");
        let modifierDisplay = document.getElementById(stat + "Modifier");

        if (!firstRoll || !secondRoll || !totalRoll || !modifierDisplay) {
            console.error(`Elementos DOM para ${stat} não encontrados.`);
            return;
        }

        if (firstRoll.innerText === "-") {
            firstRoll.innerText = rollDice(6);
            console.log(`Primeira rolagem (${stat}): ${firstRoll.innerText}`);
            savePlayerData(auth.currentUser.uid, getPlayerStats()); // Salva após a primeira rolagem
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);
            console.log(`Segunda rolagem (${stat}): ${secondRoll.innerText}`);

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
            console.log(`Total (${stat}): ${rollValue}`);

            if (rolls[stat] === 0) disableButton(button);
            savePlayerData(auth.currentUser.uid, getPlayerStats()); // Salva após a segunda rolagem e cálculo do total
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
        document.getElementById(stat + "Modifier").innerText = ""; // Limpa o modificador
        resets[stat]--; // Reduz o contador de resets para o atributo
        savePlayerData(auth.currentUser.uid, getPlayerStats()); // Salva os dados no Firestore
        if (resets[stat] === 0) disableButton(button); // Desabilita o botão "Zerar" quando atingir o limite
    } else {
        alert("Você já zerou este atributo 2 vezes!"); // Mensagem ao ultrapassar o limite
    }
}

// Função para desabilitar um botão específico
function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
}

// Atualizar os modificadores raciais com base na raça escolhida
function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();
    for (const stat in racialModifiers) {
        const modifierDisplay = document.getElementById(stat + "Modifier");
        const modifierValue = racialModifiers[stat];
        if (modifierValue !== 0) {
            modifierDisplay.innerText = ` (+${modifierValue})`;
        } else {
            modifierDisplay.innerText = "";
        }
    }
}

// Adicionar evento ao campo de raça
document.getElementById("race").addEventListener("change", updateRacialModifiersDisplay);

// Função para salvar os dados do jogador no Firestore
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

async function savePlayerData(uid, data) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, data, { merge: true });
        console.log("Dados salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}


// Função para recuperar os dados do jogador no Firestore

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


// Função para obter os valores atuais dos atributos do jogador
function getPlayerStats() {
    return {
        health: {
            firstRoll: parseInt(document.getElementById("health1").innerText) || 0,
            secondRoll: parseInt(document.getElementById("health2").innerText) || 0,
            total: parseInt(document.getElementById("healthTotal").innerText) || 0,
            rolls: rolls.health,
            resets: resets.health
        },
        strength: {
            firstRoll: parseInt(document.getElementById("strength1").innerText) || 0,
            secondRoll: parseInt(document.getElementById("strength2").innerText) || 0,
            total: parseInt(document.getElementById("strengthTotal").innerText) || 0,
            rolls: rolls.strength,
            resets: resets.strength
        },
        dexterity: {
            firstRoll: parseInt(document.getElementById("dexterity1").innerText) || 0,
            secondRoll: parseInt(document.getElementById("dexterity2").innerText) || 0,
            total: parseInt(document.getElementById("dexterityTotal").innerText) || 0,
            rolls: rolls.dexterity,
            resets: resets.dexterity
        },
        intelligence: {
            firstRoll: parseInt(document.getElementById("intelligence1").innerText) || 0,
            secondRoll: parseInt(document.getElementById("intelligence2").innerText) || 0,
            total: parseInt(document.getElementById("intelligenceTotal").innerText) || 0,
            rolls: rolls.intelligence,
            resets: resets.intelligence
        },
        luck: {
            firstRoll: parseInt(document.getElementById("luck1").innerText) || 0,
            secondRoll: parseInt(document.getElementById("luck2").innerText) || 0,
            total: parseInt(document.getElementById("luckTotal").innerText) || 0,
            rolls: rolls.luck,
            resets: resets.luck
        }
    };
}

// Recupera e exibe os dados ao carregar a página
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const auth = getAuth();
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
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
            console.log("Nenhum jogador autenticado.");
            window.location.href = "index.html"; // Redireciona para a página de login
        }
    });
});

window.rollStat = rollStat;
window.resetStat = resetStat;
