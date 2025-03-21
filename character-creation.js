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

let rolls = { energia: 3, habilidade: 3, carisma: 3, magia: 3, sorte: 3 };
let resets = { energia: 2, habilidade: 2, carisma: 2, magia: 2, sorte: 2 };

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { energia: 0, habilidade: 0, carisma: 0, magia: 0, sorte: 0 };

    switch (race) {
        case "Anão":
            modifiers.energia += 2;
            modifiers.carisma -= 2;
            break;
        case "Elfo":
            modifiers.habilidade += 2;
            modifiers.energia -= 2;
            break;
    }
    return modifiers;
}

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
            savePlayerData(auth.currentUser.uid, getPlayerStats());
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

document.getElementById("submit").addEventListener("click", async () => {
    const data = getPlayerStats();

    if (isFichaCompleta(data)) {
        data.fichaCompleta = true;
        await savePlayerData(auth.currentUser.uid, data);
        console.log("Ficha marcada como completa. Redirecionando para o inventário...");
        window.location.href = "inventario.html";
    } else {
        alert("Por favor, preencha todos os campos e finalize todas as rolagens antes de prosseguir!");
    }
});

let saveTimeout;
function debounceSave(uid, data) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        savePlayerData(uid, data);
    }, 300);
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
        name: document.getElementById("name").value,
        race: document.getElementById("race").value,
        alignment: document.getElementById("alignment").value,
        class: document.getElementById("class").value,
        maoDominante: document.getElementById("mao dominante").value,
        hemisferioDominante: document.getElementById("hemisfério dominante").value,
        idade: document.getElementById("idade").value,
        energia: {
            firstRoll: getStat("energia1"),
            secondRoll: getStat("energia2"),
            total: getStat("energiaTotal"),
            rolls: rolls.energia,
            resets: resets.energia
        },
        habilidade: {
            firstRoll: getStat("habilidade1"),
            secondRoll: getStat("habilidade2"),
            total: getStat("habilidadeTotal"),
            rolls: rolls.habilidade,
            resets: resets.habilidade
        },
        carisma: {
            firstRoll: getStat("carisma1"),
            secondRoll: getStat("carisma2"),
            total: getStat("carismaTotal"),
            rolls: rolls.carisma,
            resets: resets.carisma
        },
        magia: {
            firstRoll: getStat("magia1"),
            secondRoll: getStat("magia2"),
            total: getStat("magiaTotal"),
            rolls: rolls.magia,
            resets: resets.magia
        },
        sorte: {
            firstRoll: getStat("sorte1"),
            secondRoll: getStat("sorte2"),
            total: getStat("sorteTotal"),
            rolls: rolls.sorte,
            resets: resets.sorte
        }
    };
}

function getStat(id) {
    return document.getElementById(id).innerText !== "-" ? parseInt(document.getElementById(id).innerText) : 0;
}

function isFichaCompleta(playerData) {
    const stats = ["energia", "habilidade", "carisma", "magia", "sorte"];
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
        statsComplete
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

            console.log("Ficha incompleta. Exibindo a página.");
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
                    } else {
                        console.warn("O valor salvo da idade não corresponde a nenhuma opção no <select>.");
                    }
                    console.log("Idade restaurada:", playerData.idade);
                }

                const stats = ["energia", "habilidade", "carisma", "magia", "sorte"];
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

window.rollStat = rollStat;
window.resetStat = resetStat;
