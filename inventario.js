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
                if (slot.dataset.slot === item.dataset.item) {
                    slot.classList.add('highlight'); // Adiciona o destaque
                }
            });
        });
    });

    // Gerencia o clique nos slots
    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', () => {
            if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
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

async function savePlayerData(uid, playerData) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, { ...playerData }, { merge: true });
        console.log("Dados do jogador salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados do jogador:", error);
    }
}

// Exemplo de uso ao selecionar uma classe (evento de mudança):
document.querySelector('#class').addEventListener('change', async (event) => {
    const selectedClass = event.target.value; // Classe selecionada
    const uid = auth.currentUser.uid; // ID do jogador
    await savePlayerData(uid, { class: selectedClass }); // Salva a classe no Firestore

    loadStartingItemsForClass(selectedClass); // Atualiza os itens no baú
});

// Função para carregar dados do Firestore
// Definição dos itens iniciais por classe
const classStartingItems = {
    Mago: [
        { name: "Robe", type: "equipable", slot: "armor slot" }
    ],
    Guerreiro: [
        { name: "Espada", type: "equipable", slot: "weapon slot" }
    ],
    Ladino: [
        { name: "Adaga", type: "equipable", slot: "weapon slot" }
    ],
    Estudante: [
        { name: "Bolsa de escriba", type: "consumable", slot: null },
        { name: "Canivete", type: "equipable", slot: "weapon slot" },
        { name: "Hábito monástico", type: "equipable", slot: "armor slot" },
        { name: "Velas", type: "consumable", slot: null },
        { name: "Pequeno saco com ervas medicinais", type: "consumable", slot: null }
    ]
};

// Após carregar os itens iniciais para a classe
const playerData = await getPlayerData(uid);
if (playerData && playerData.class) {
    console.log(`Carregando itens iniciais para a classe: ${playerData.class}`);
    loadStartingItemsForClass(playerData.class); // Carrega os itens iniciais
    saveInventoryData(uid); // 🔹 Salva os itens no Firestore imediatamente
}

// Função para carregar itens iniciais no baú com base na classe
function loadStartingItemsForClass(playerClass) {
    const startingItems = classStartingItems[playerClass] || [];
    const chestElement = document.querySelector('.items');

    // Limpa os itens do baú (se necessário)
    chestElement.innerHTML = "";

    // Adiciona os itens iniciais da classe ao baú
    startingItems.forEach(item => {
        const newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.item = item.slot ? item.slot : "consumable"; // Define o tipo do item
        newItem.innerHTML = `${item.name} - ${item.type === "consumable" ? "Consumível" : "Equipável"}`;

        chestElement.appendChild(newItem);
        addItemClickListener(newItem); // Adiciona a funcionalidade de clique para itens
    });
}

// Função para carregar dados do Firestore
async function loadInventoryData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists() && playerSnap.data().inventory) {
            const inventoryData = playerSnap.data().inventory;

            // Carrega itens no baú
            const chestElement = document.querySelector('.items');
            chestElement.innerHTML = ""; // Limpa o conteúdo atual do baú
            inventoryData.itemsInChest.forEach(item => {
                const newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.item = item.id;
                newItem.innerHTML = item.content;

                chestElement.appendChild(newItem);
                addItemClickListener(newItem);
            });

            // Carrega itens equipados nos slots
            document.querySelectorAll('.slot').forEach(slot => {
                const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
                slot.innerHTML = equippedItem || slot.dataset.slot; // Adiciona item ou mantém o slot padrão
            });

            console.log("Inventário carregado com sucesso!");
        } else {
            console.log("Nenhum inventário encontrado para este jogador.");

            // Garante que os slots fiquem vazios
            document.querySelectorAll('.slot').forEach(slot => {
                slot.innerHTML = slot.dataset.slot;
            });

            // Carrega itens iniciais com base na classe do jogador
            // Carrega itens iniciais com base na classe do jogador
const playerData = await getPlayerData(uid);
if (playerData && playerData.class) {
    console.log(`Carregando itens iniciais para a classe: ${playerData.class}`);
    loadStartingItemsForClass(playerData.class); // Carrega os itens iniciais
    await saveInventoryData(uid); // Salva os itens no Firestore
} else {
    console.log("Classe do jogador não encontrada ou não definida.");
}

            }
        }
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

            const playerData = await getPlayerData(user.uid); // 🔹 Recupera os dados da ficha
            if (playerData) {
                updateCharacterSheet(playerData); // 🔹 Atualiza a ficha do personagem
            }

            await loadInventoryData(user.uid); // 🔹 Carrega os itens do inventário e slots equipados
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
