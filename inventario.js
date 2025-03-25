import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Configuração Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Substitua pela sua apiKey
    authDomain: "YOUR_AUTH_DOMAIN", // Substitua pelo seu authDomain
    projectId: "YOUR_PROJECT_ID", // Substitua pelo seu projectId
    storageBucket: "YOUR_STORAGE_BUCKET", // Substitua pelo seu storageBucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Substitua pelo seu messagingSenderId
    appId: "YOUR_APP_ID" // Substitua pelo seu appId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let selectedItem = null; // Armazena o item selecionado
let currentPlayerData = null; // Armazena os dados do jogador

// Itens iniciais que o jogador deve ter
const initialItems = [
    { id: "bolsa-de-escriba", content: "Bolsa de escriba" },
    { id: "weapon", content: "canivete" }, // Mudando o id para corresponder ao slot
    { id: "armor", content: "Hábito monástico" }, // Mudando o id para corresponder ao slot
    { id: "velas", content: "Velas" },
    { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais" }
];

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
            const slotType = slot.dataset.slot;
            const currentEquippedItem = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;

            if (selectedItem && slotType === selectedItem.dataset.item) {
                // Equipa um novo item
                if (currentEquippedItem) {
                    // Desequipa o item atual e devolve ao baú
                    const newItem = document.createElement("div");
                    newItem.classList.add("item");
                    newItem.dataset.item = slotType;
                    newItem.innerHTML = currentEquippedItem;
                    document.querySelector(".items").appendChild(newItem);
                    addItemClickListener(newItem);
                }

                slot.innerHTML = selectedItem.innerHTML;
                selectedItem.remove();
                selectedItem = null;
                clearHighlights();
                saveInventoryData(auth.currentUser.uid);
            } else if (selectedItem === null && currentEquippedItem) {
                // Desequipa um item existente
                slot.innerHTML = slot.dataset.slot;
                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slotType;
                newItem.innerHTML = currentEquippedItem;
                document.querySelector(".items").appendChild(newItem);
                addItemClickListener(newItem);
                saveInventoryData(auth.currentUser.uid);
            }
        });
    });

    // Adiciona funcionalidade ao botão de descarte
    document.getElementById("discard-slot").addEventListener("click", () => {
        if (selectedItem) {
            selectedItem.remove();
            selectedItem = null;
            clearHighlights();
            saveInventoryData(auth.currentUser.uid);
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
        updateCharacterCouraca(); // Atualiza a couraça após salvar o inventário
    } catch (error) {
        console.error("Erro ao salvar o inventário:", error);
    }
}

// Função para carregar dados do Firestore
async function loadInventoryData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists() || !playerSnap.data().inventory) {
            // Se o inventário não existir, inicializa com os itens iniciais
            const initialInventoryData = {
                itemsInChest: initialItems,
                equippedItems: {
                    weapon: null, // Slot para arma
                    armor: null,  // Slot para armadura
                    helmet: null,
                    amulet: null,
                    shield: null,
                    gloves: null,
                    ring: null,
                    boots: null
                }
            };
            await setDoc(playerRef, { inventory: initialInventoryData }, { merge: true });
            console.log("Inventário inicializado com os itens padrão.");
            // Agora que o inventário inicial foi salvo, vamos carregá-lo
            const updatedPlayerSnap = await getDoc(playerRef);
            const inventoryData = updatedPlayerSnap.data().inventory;
            loadInventoryUI(inventoryData);
        } else {
            const inventoryData = playerSnap.data().inventory;
            loadInventoryUI(inventoryData);
        }
        updateCharacterCouraca(); // Atualiza a couraça após carregar o inventário
    } catch (error) {
        console.error("Erro ao carregar o inventário:", error);
    }
}

function loadInventoryUI(inventoryData) {
    // Carrega itens no baú
    const chestElement = document.querySelector('.items');
    chestElement.innerHTML = ""; // Limpa o conteúdo atual
    inventoryData.itemsInChest.forEach(item => {
        const newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.item = item.id;
        newItem.innerHTML = item.content;

        chestElement.appendChild(newItem);
        addItemClickListener(newItem);
    });

    // Carrega itens equipados
    document.querySelectorAll('.slot').forEach(slot => {
        const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
        slot.innerHTML = equippedItem || slot.dataset.slot;
    });
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

// Função para atualizar o valor da Couraça na ficha do personagem
function updateCharacterCouraca() {
    if (!currentPlayerData) return;

    const equippedItems = Array.from(document.querySelectorAll('.slot')).reduce((acc, slot) => {
        acc[slot.dataset.slot] = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;
        return acc;
    }, {});

    let baseCouraca = parseInt(currentPlayerData.couraca || 0);
    let bonusCouraca = 0;

    if (equippedItems.armor === "Hábito monástico") {
        bonusCouraca += 2;
    }

    const totalCouraca = baseCouraca + bonusCouraca;
    document.getElementById("char-couraca").innerText = totalCouraca;
}

// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            currentPlayerData = await getPlayerData(user.uid); // 🔹 Recupera os dados da ficha
            if (currentPlayerData) {
                updateCharacterSheet(currentPlayerData); // 🔹 Atualiza a ficha do personagem
                updateCharacterCouraca(); // Atualiza a couraça inicialmente
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
