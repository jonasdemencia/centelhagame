import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Configuração Firebase
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

// 🔹 Itens iniciais por classe
const classStartingItems = {
    "Mago": [{ id: "robe", content: "🧥 Robe Mágico", slot: "armor" }],
    "Guerreiro": [{ id: "sword", content: "⚔️ Espada Longa", slot: "weapon" }],
    "Ladino": [{ id: "dagger", content: "🗡️ Adaga", slot: "weapon" }],
    "Candidato": [
        { id: "scribe-bag", content: "📜 Bolsa de Escriba" },
        { id: "pocket-knife", content: "🔪 Canivete", slot: "weapon" },
        { id: "monastic-habit", content: "🧥 Hábito Monástico", slot: "armor" },
        { id: "candles", content: "🕯️ Velas" },
        { id: "herb-bag", content: "🌿 Pequeno Saco com Ervas Medicinais" }
    ]
};

// 🔹 Função para obter os itens iniciais com base na classe
function getStartingItems(playerClass) {
    return classStartingItems[playerClass] ? [...classStartingItems[playerClass]] : [];
}

let selectedItem = null; // Armazena o item selecionado 

// Seleciona os itens clicados no baú
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
            clearHighlights();

            // Define o novo item selecionado
            selectedItem = item;
            item.classList.add('selected');

            // Destaca os slots compatíveis
            document.querySelectorAll('.slot').forEach(slot => {
                if (slot.dataset.slot === getItemSlot(item.dataset.item)) {
                    slot.classList.add('highlight'); // Adiciona o destaque
                }
            });
        });
    });

    // Gerencia o clique nos slots
    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', () => {
            if (selectedItem && slot.dataset.slot === getItemSlot(selectedItem.dataset.item)) {
                if (slot.innerHTML !== slot.dataset.slot) {
                    // Desequipa o item atual e devolve ao baú
                    const equippedItemText = slot.innerHTML;

                    const newItem = document.createElement("div");
                    newItem.classList.add("item");
                    newItem.dataset.item = slot.dataset.slot;
                    newItem.innerHTML = equippedItemText;

                    document.querySelector(".items").appendChild(newItem);
                    addItemClickListener(newItem);
                }

                // Equipa o novo item no slot
                slot.innerHTML = selectedItem.innerHTML;
                selectedItem.remove();
                selectedItem = null;
                clearHighlights();

                saveInventoryData(auth.currentUser.uid); // Salva alterações no Firestore
            } else if (selectedItem === null && slot.innerHTML !== slot.dataset.slot) {
                const itemText = slot.innerHTML;
                slot.innerHTML = slot.dataset.slot;

                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slot.dataset.slot;
                newItem.innerHTML = itemText;

                document.querySelector(".items").appendChild(newItem);
                addItemClickListener(newItem);

                saveInventoryData(auth.currentUser.uid); // Salva alterações no Firestore
            }
        });
    });

    // Adiciona funcionalidade ao botão de descarte
    document.getElementById("discard-slot").addEventListener("click", () => {
        if (selectedItem) {
            selectedItem.remove();
            selectedItem = null;
            clearHighlights();
            saveInventoryData(auth.currentUser.uid); // Salva alterações no Firestore
        }
    });

});

function getItemSlot(itemId) {
    const allItems = Object.values(classStartingItems).flat();
    const foundItem = allItems.find(item => item.id === itemId);
    return foundItem ? foundItem.slot : null;
}

// Adiciona evento de clique aos novos itens do baú
function addItemClickListener(item) {
    item.addEventListener('click', () => {
        clearHighlights();
        selectedItem = item;
        item.classList.add('selected');

        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight');
            }
        });
    });
}

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

// Função para salvar dados no Firestore
async function saveInventoryData(uid) {
    const inventoryData = {
        itemsInChest: Array.from(document.querySelectorAll('.item')).map(item => ({
            id: item.dataset.item,
            content: item.innerHTML
        })),
        equippedItems: Array.from(document.querySelectorAll('.slot')).reduce((acc, slot) => {
            acc[slot.dataset.slot] = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;
            return acc;
        }, {})
    };

    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
        console.log("Inventário salvo com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar o inventário:", error);
    }
}

// Função para carregar dados do Firestore
async function loadInventoryData(uid, playerClass) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        let inventoryData = playerSnap.exists() ? playerSnap.data().inventory : null;

        if (!inventoryData) {
            console.log("Nenhum inventário encontrado. Criando novo...");

            // 🔹 Obtém os itens da classe do jogador
            const startingItems = getStartingItems(playerClass);

            // 🔹 Define o inventário inicial
            inventoryData = {
                itemsInChest: startingItems,
                equippedItems: {}
            };

            await setDoc(doc(db, "players", uid), { inventory: inventoryData }, { merge: true });
        }

        // 🔹 Exibe os itens do baú na interface
        const chestElement = document.querySelector('.items');
        chestElement.innerHTML = "";
        inventoryData.itemsInChest.forEach(item => {
            const newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.item = item.id;
            newItem.innerHTML = item.content;
            chestElement.appendChild(newItem);
            addItemClickListener(newItem);
        });

        // 🔹 Carrega os itens equipados nos slots
        document.querySelectorAll('.slot').forEach(slot => {
            const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
            slot.innerHTML = equippedItem || slot.dataset.slot;
        });

        console.log("Inventário carregado com sucesso!");
    } catch (error) {
        console.error("Erro ao carregar o inventário:", error);
    }
}


async function getPlayerData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        return playerSnap.exists() ? playerSnap.data() : null;
    } catch (error) {
        console.error("Erro ao recuperar os dados do jogador:", error);
        return null;
    }
}

// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            const playerData = await getPlayerData(user.uid);
            if (playerData) {
                await loadInventoryData(user.uid, playerData.class);
                updateCharacterSheet(playerData);  // 🔹 Agora a ficha do carrossel será preenchida corretamente
            }
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});


// 📌 Sistema de Carrossel entre as janelas
const slides = document.querySelectorAll(".carousel-slide");
let currentSlide = 0;

document.getElementById("prevBtn").addEventListener("click", () => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
    slides[currentSlide].classList.add("active");
});

document.getElementById("nextBtn").addEventListener("click", () => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
    slides[currentSlide].classList.add("active");
});

// 📌 Exibir a primeira janela ao carregar
slides[currentSlide].classList.add("active");

// 📌 Atualizar os dados da ficha de personagem ao carregar
function updateCharacterSheet(playerData) {
    if (!playerData) return;

    document.getElementById("char-name").innerText = playerData.name || "-";
    document.getElementById("char-race").innerText = playerData.race || "-";
    document.getElementById("char-class").innerText = playerData.class || "-";
    document.getElementById("char-alignment").innerText = playerData.alignment || "-";
    document.getElementById("char-energy").innerText = playerData.energy?.total ?? "-";
    document.getElementById("char-skill").innerText = playerData.skill?.total ?? "-";
    document.getElementById("char-charisma").innerText = playerData.charisma?.total ?? "-";
    document.getElementById("char-magic").innerText = playerData.magic?.total ?? "-";
    document.getElementById("char-luck").innerText = playerData.luck?.total ?? "-";
    document.getElementById("char-couraca").innerText = playerData.couraca || "0";
    document.getElementById("char-po").innerText = playerData.po || "0";
    document.getElementById("char-hand").innerText = playerData.maoDominante || "-";
    document.getElementById("char-hemisphere").innerText = playerData.hemisferioDominante || "-";
}
