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
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);

            let rollValue = parseInt(firstRoll.innerText) + parseInt(secondRoll.innerText);
            const racialModifiers = getRacialModifiers();
            const modifierValue = racialModifiers[stat];

            modifierDisplay.innerText = modifierValue !== 0 ? ` (+${modifierValue})` : "";
            rollValue += modifierValue;
            totalRoll.innerText = rollValue;
            rolls[stat]--;

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

function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();
    for (const stat in racialModifiers) {
        const modifierDisplay = document.getElementById(stat + "Modifier");
        if (modifierDisplay) {
            modifierDisplay.innerText = racialModifiers[stat] !== 0 ? ` (+${racialModifiers[stat]})` : "";
        }
    }
}

document.getElementById("race").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
    updateRacialModifiersDisplay();
});

document.getElementById("submit").addEventListener("click", async () => {
    const data = getPlayerStats();
    if (isFichaCompleta(data)) {
        data.fichaCompleta = true;
        await savePlayerData(auth.currentUser.uid, data);
        window.location.href = "inventario.html";
    } else {
        alert("Por favor, preencha todos os campos e finalize todas as rolagens antes de prosseguir!");
    }
});

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
            return playerSnap.data();
        } else {
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
        idade: document.getElementById("idade").value,
        energia: getStatObject("energia"),
        habilidade: getStatObject("habilidade"),
        carisma: getStatObject("carisma"),
        magia: getStatObject("magia"),
        sorte: getStatObject("sorte"),
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
        playerData.idade &&
        statsComplete
    );
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const playerData = await getPlayerData(user.uid);
            if (playerData && playerData.fichaCompleta) {
                window.location.href = "inventario.html";
                return;
            }
            document.body.classList.remove("hidden");
        } else {
            window.location.href = "index.html";
        }
    });
});

window.rollStat = rollStat;
window.resetStat = resetStat;
