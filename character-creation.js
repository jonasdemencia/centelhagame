import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Inicializa Firebase
const auth = getAuth();
const db = getFirestore();

let rolls = { health: 3, strength: 3, dexterity: 3, intelligence: 3, luck: 3 };
let resets = { health: 2, strength: 2, dexterity: 2, intelligence: 2, luck: 2 };

// Rola um dado de 6 lados
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

// Atualiza os atributos na tela e salva no Firestore
async function updateStats(uid) {
    const playerData = {
        health: { firstRoll: getValue("health1"), secondRoll: getValue("health2"), total: getValue("healthTotal"), rolls: rolls.health, resets: resets.health },
        strength: { firstRoll: getValue("strength1"), secondRoll: getValue("strength2"), total: getValue("strengthTotal"), rolls: rolls.strength, resets: resets.strength },
        dexterity: { firstRoll: getValue("dexterity1"), secondRoll: getValue("dexterity2"), total: getValue("dexterityTotal"), rolls: rolls.dexterity, resets: resets.dexterity },
        intelligence: { firstRoll: getValue("intelligence1"), secondRoll: getValue("intelligence2"), total: getValue("intelligenceTotal"), rolls: rolls.intelligence, resets: resets.intelligence },
        luck: { firstRoll: getValue("luck1"), secondRoll: getValue("luck2"), total: getValue("luckTotal"), rolls: rolls.luck, resets: resets.luck }
    };
    await setDoc(doc(db, "players", uid), playerData, { merge: true });
}

// Carrega os dados ao entrar na página
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "players", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            for (const stat in data) {
                setValue(stat + "1", data[stat].firstRoll);
                setValue(stat + "2", data[stat].secondRoll);
                setValue(stat + "Total", data[stat].total);
                rolls[stat] = data[stat].rolls;
                resets[stat] = data[stat].resets;
            }
        }
    }
});

// Funções auxiliares
function getValue(id) {
    return document.getElementById(id).innerText || "-";
}

function setValue(id, value) {
    document.getElementById(id).innerText = value || "-";
}
