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

// Configuração de atributos e contadores
let rolls = { energy: 3, skill: 3, charisma: 3, magic: 3, luck: 3 };
let resets = { energy: 2, skill: 2, charisma: 2, magic: 2, luck: 2 };

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Obtém modificadores raciais
function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { energy: 0, skill: 0, charisma: 0, magic: 0, luck: 0 };
    switch (race) {
        case "Anão":
            modifiers.energy += 2;
            modifiers.charisma -= 2;
            break;
        case "Elfo":
            modifiers.skill += 2;
            modifiers.energy -= 2;
            break;
        case "Humano":
            // Humanos não têm modificadores raciais
            break;
    }
    return modifiers;
}

// Rola os valores para um atributo
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
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);
            console.log(`Segunda rolagem (${stat}): ${secondRoll.innerText}`);

            let rollValue = parseInt(firstRoll.innerText) + parseInt(secondRoll.innerText);
            const racialModifiers = getRacialModifiers();
            const modifierValue = racialModifiers[stat];

            modifierDisplay.innerText = modifierValue !== 0 ? ` (+${modifierValue})` : "";
            rollValue += modifierValue;
            totalRoll.innerText = rollValue;
            rolls[stat]--;

            console.log(`Total (${stat}): ${rollValue}`);
            if (rolls[stat] === 0) disableButton(button);
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        }
    } else {
        alert("Você já usou todas as 3 rolagens permitidas para este atributo!");
    }
}

// Reseta um atributo
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

function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
}

// Atualiza os modificadores raciais exibidos
function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();
    for (const stat in racialModifiers) {
        const modifierDisplay = document.getElementById(stat + "Modifier");
        modifierDisplay.innerText = racialModifiers[stat] !== 0 ? ` (+${racialModifiers[stat]})` : "";
    }
}

document.getElementById("race").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
    updateRacialModifiersDisplay();
});

document.getElementById("alignment").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("class").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("mao dominante").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("hemisfério dominante").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("name").addEventListener("input", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("idade").addEventListener("input", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

let saveTimeout;

// Função debounce para evitar múltiplas chamadas ao salvar
function debounceSave(uid, data) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        savePlayerData(uid, data);
    }, 300);
}

// Salva os dados do jogador no Firestore
async function savePlayerData(uid, data) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, data, { merge: true });
        console.log("Dados salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

// Recupera os dados do jogador do Firestore
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

// Retorna os atributos e informações do jogador
function getPlayerStats() {
    return {
        name: document.getElementById("name").value,
        race: document.getElementById("race").value,
        alignment: document.getElementById("alignment").value,
        class: document.getElementById("class").value,
        maoDominante: document.getElementById("mao dominante").value,
        hemisferioDominante: document.getElementById("hemisfério dominante").value,
        idade: document.getElementById("idade").value,
        energy: {
            firstRoll: getStat("energy1"),
            secondRoll: getStat("energy2"),
            total: getStat("energyTotal"),
            rolls: rolls.energy,
            resets: resets.energy
        },
        skill: {
            firstRoll: getStat("skill1"),
            secondRoll: getStat("skill2"),
            total: getStat("skillTotal"),
            rolls: rolls.skill,
            resets: resets.skill
        },
        charisma: {
            firstRoll: getStat("charisma1"),
            secondRoll: getStat("charisma2"),
            total: getStat("charismaTotal"),
            rolls: rolls.charisma,
            resets: resets.charisma
        },
        magic: {
            firstRoll: getStat("magic1"),
            secondRoll: getStat("magic2"),
            total: getStat("magicTotal"),
            rolls: rolls.magic,
            resets: resets.magic
        },
        luck: {
            firstRoll: getStat("luck1"),
            secondRoll: getStat("luck2"),
            total: getStat("luckTotal"),
            rolls: rolls.luck,
            resets: resets.luck
        }
    };
}

// Obtém os valores de um atributo
function getStat(id) {
    return document.getElementById(id).innerText !== "-" ? parseInt(document.getElementById(id).innerText) : 0;
}

// Verifica se todos os atributos e campos da ficha foram preenchidos
function isFichaCompleta(playerData) {
    const stats = ["energy", "skill", "charisma", "magic", "luck"];
    const statsComplete = stats.every(stat => 
        playerData[stat] &&
        playerData[stat].firstRoll > 0 &&
        playerData[stat].secondRoll > 0 &&
        playerData[stat].total > 0
    );

    return (
        playerData &&
        playerData.name &&
        playerData.race &&
        playerData.alignment &&
        playerData.class &&
        playerData.maoDominante &&
        playerData.hemisferioDominante &&
        playerData.idade &&
        statsComplete // Verifica se os atributos estão completos
    );
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
            const playerData = await getPlayerData(user.uid);

            if (playerData && playerData.fichaCompleta) {
                console.log("Ficha já criada e completa. Redirecionando para o inventário...");
                window.location.href = "inventario.html";
                return;
            }

            document.body.classList.remove("hidden");

            if (playerData) {
                if (playerData.name) document.getElementById("name").value = playerData.name;
                if (playerData.race) document.getElementById("race").value = playerData.race;
                if (playerData.alignment) document.getElementById("alignment").value = playerData.alignment;
                if (playerData.class) document.getElementById("class").value = playerData.class;
                if (playerData.maoDominante) document.getElementById("mao dominante").value = playerData.maoDominante;
                if (playerData.hemisferioDominante) document.getElementById("hemisfério dominante").value = playerData.hemisferioDominante;

                if (playerData.idade) {
                    const idadeSelect = document.getElementById("idade");
                    const optionExists = [...idadeSelect.options].some(option => option.value === playerData.idade);

                    if (optionExists) {
                        idadeSelect.value = playerData.idade;
                    }
                }

                const stats = ["energy", "skill", "charisma", "magic", "luck"];
                stats.forEach(stat => {
                    if (playerData[stat]) {
                        document.getElementById(stat + "1").innerText = playerData[stat].firstRoll || "-";
                        document.getElementById(stat + "2").innerText = playerData[stat].secondRoll || "-";
                        document.getElementById(stat + "Total").innerText = playerData[stat].total || "-";
                        document.getElementById(stat + "Modifier").innerText = playerData[stat].modifier ? ` (+${playerData[stat].modifier})` : "";
                        rolls[stat] = playerData[stat].rolls !== undefined ? playerData[stat].rolls : 3;
                        resets[stat] = playerData[stat].resets !== undefined ? playerData[stat].resets : 2;
                    }
                });
            }
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});

// Expondo métodos necessários globalmente
window.rollStat = rollStat;
window.resetStat = resetStat;
