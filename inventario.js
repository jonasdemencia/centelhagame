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
                newItem.addEventListener('click', () => {
                    clearHighlights();
                    selectedItem = newItem;
                    newItem.classList.add('selected');

                    document.querySelectorAll('.slot').forEach(s => {
                        if (s.dataset.slot === newItem.dataset.item) {
                            s.classList.add('highlight'); // Destaca os slots compatíveis
                        }
                    });
                });
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
            newItem.addEventListener('click', () => {
                clearHighlights();
                selectedItem = newItem;
                newItem.classList.add('selected');

                document.querySelectorAll('.slot').forEach(s => {
                    if (s.dataset.slot === newItem.dataset.item) {
                        s.classList.add('highlight');
                    }
                });
            });

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
async function loadInventoryData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists() && playerSnap.data().inventory) {
            const inventoryData = playerSnap.data().inventory;

            // Carrega itens no baú
            const chestElement = document.querySelector('.items');
            chestElement.innerHTML = ""; // Limpa o conteúdo atual
            inventoryData.itemsInChest.forEach(item => {
                const newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.item = item.id;
                newItem.innerHTML = item.content;

                chestElement.appendChild(newItem);

                newItem.addEventListener('click', () => {
                    clearHighlights();
                    selectedItem = newItem;
                    newItem.classList.add('selected');

                    document.querySelectorAll('.slot').forEach(slot => {
                        if (slot.dataset.slot === newItem.dataset.item) {
                            slot.classList.add('highlight');
                        }
                    });
                });
            });

            // Carrega itens equipados
            document.querySelectorAll('.slot').forEach(slot => {
                const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
                slot.innerHTML = equippedItem || slot.dataset.slot;
            });

            console.log("Inventário carregado com sucesso!");
        } else {
            console.log("Nenhum inventário encontrado para este jogador.");
        }
    } catch (error) {
        console.error("Erro ao carregar o inventário:", error);
    }
}

// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
            await loadInventoryData(user.uid);
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});
