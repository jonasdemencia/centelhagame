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
            rolls[stat]--; // Reduz o contador de rolagens para o atributo
            savePlayerData(auth.currentUser.uid, getPlayerStats()); // Salva os dados no Firestore
            if (rolls[stat] === 0) disableButton(button); // Desabilita o botão "🎲" quando atingir o limite
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
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
        const doc = await db.collection("players").doc(uid).get();
        if (doc.exists) {
            console.log("Dados do jogador recuperados:", doc.data());
            return doc.data();
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
            firstRoll: document.getElementById("health1").innerText,
            secondRoll: document.getElementById("health2").innerText,
            total: document.getElementById("healthTotal").innerText,
            rolls: rolls.health,
            resets: resets.health
        },
        strength: {
            firstRoll: document.getElementById("strength1").innerText,
            secondRoll: document.getElementById("strength2").innerText,
            total: document.getElementById("strengthTotal").innerText,
            rolls: rolls.strength,
            resets: resets.strength
        },
        dexterity: {
            firstRoll: document.getElementById("dexterity1").innerText,
            secondRoll: document.getElementById("dexterity2").innerText,
            total: document.getElementById("dexterityTotal").innerText,
            rolls: rolls.dexterity,
            resets: resets.dexterity
        },
        intelligence: {
            firstRoll: document.getElementById("intelligence1").innerText,
            secondRoll: document.getElementById("intelligence2").innerText,
            total: document.getElementById("intelligenceTotal").innerText,
            rolls: rolls.intelligence,
            resets: resets.intelligence
        },
        luck: {
            firstRoll: document.getElementById("luck1").innerText,
            secondRoll: document.getElementById("luck2").innerText,
            total: document.getElementById("luckTotal").innerText,
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
