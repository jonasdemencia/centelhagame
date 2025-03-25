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

let selectedItem = null; // Armazena o ID do item selecionado
let selectedItemElement = null; // Armazena o elemento do item selecionado
let currentPlayerData = null; // Armazena os dados do jogador

// Itens iniciais que o jogador deve ter
const initialItems = [
    { id: "bolsa-de-escriba", content: "Bolsa de escriba" },
    { id: "weapon", content: "canivete" },
    { id: "armor", content: "Hábito monástico" },
    { id: "velas", content: "Velas" },
    { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais" },
    { id: "pao-estragado", content: "Pão Estragado", consumable: true, quantity: 5 }
];

// Seleciona os itens clicados no baú
document.addEventListener("DOMContentLoaded", () => {
    const itemsContainer = document.querySelector('.items');
    if (itemsContainer) {
        itemsContainer.addEventListener('click', (event) => {
            const itemElement = event.target.closest('.item');
            if (itemElement) {
                clearHighlights();
                selectedItem = itemElement.dataset.item;
                selectedItemElement = itemElement;
                itemElement.classList.add('selected');

                const useButton = document.getElementById('useBtn');
                const itemData = initialItems.find(i => i.id === selectedItem) || { consumable: false, quantity: 0 };

                if (itemData.consumable && itemData.quantity > 0) {
                    useButton.style.display = 'inline-block';
                } else {
                    useButton.style.display = 'none';
                }

                document.querySelectorAll('.slot').forEach(slot => {
                    if (slot.dataset.slot === selectedItem) {
                        slot.classList.add('highlight');
                    }
                });
            }
        });
    }

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const slotType = slot.dataset.slot;
            const currentEquippedItem = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;

            if (selectedItem && slotType === selectedItem) {
                // Equipa um novo item
                if (currentEquippedItem) {
                    // Desequipa o item atual e devolve ao baú
                    const newItem = document.createElement("div");
                    newItem.classList.add("item");
                    newItem.dataset.item = slotType;
                    newItem.innerHTML = currentEquippedItem;
                    document.querySelector(".items").appendChild(newItem);
                    // addItemClickListener(newItem); // Removido
                }

                slot.innerHTML = selectedItemElement.innerHTML;
                selectedItemElement.remove();
                selectedItem = null;
                selectedItemElement = null;
                clearHighlights();
                document.getElementById('useBtn').style.display = 'none';

                saveInventoryData(auth.currentUser.uid);
                updateCharacterCouraca();
                updateCharacterDamage();
            } else if (selectedItem === null && currentEquippedItem) {
                // Desequipa um item existente
                const itemText = slot.innerHTML;
                slot.innerHTML = slot.dataset.slot;

                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slotType;
                newItem.innerHTML = itemText;

                document.querySelector(".items").appendChild(newItem);
                // addItemClickListener(newItem); // Removido

                updateCharacterCouraca();
                updateCharacterDamage();
                saveInventoryData(auth.currentUser.uid);
            }
        });
    });

    // Adiciona funcionalidade ao botão de descarte
    document.getElementById("discard-slot").addEventListener("click", () => {
        if (selectedItem) {
            const itemIndex = initialItems.findIndex(item => item.id === selectedItem);
            if (itemIndex !== -1) {
                initialItems.splice(itemIndex, 1);
            }
            if (selectedItemElement) {
                selectedItemElement.remove();
                selectedItemElement = null;
            }
            selectedItem = null;
            clearHighlights();
            document.getElementById('useBtn').style.display = 'none';
            saveInventoryData(auth.currentUser.uid);
        }
    });

    const useButton = document.getElementById('useBtn');
    useButton.addEventListener('click', () => {
        if (selectedItem) {
            const itemIndex = initialItems.findIndex(item => item.id === selectedItem);
            if (itemIndex !== -1 && initialItems[itemIndex].consumable && initialItems[itemIndex].quantity > 0) {
                const itemData = initialItems[itemIndex];

                // Efeito do item "pao-estragado"
                if (itemData.id === 'pao-estragado') {
                    const energyElement = document.getElementById('char-energy');
                    if (energyElement) {
                        let currentEnergy = parseInt(energyElement.innerText || '0');
                        currentEnergy -= 2;
                        energyElement.innerText = Math.max(0, currentEnergy);
                    }
                }

                // Decrementa a quantidade do item
                initialItems[itemIndex].quantity--;

                // Atualiza a UI do baú
                const chestElement = document.querySelector('.items');
                const itemElement = chestElement.querySelector(`.item[data-item="${selectedItem}"]`);
                if (itemElement) {
                    itemElement.innerHTML = itemData.content;
                    const quantitySpan = itemElement.querySelector('.item-quantity');
                    if (itemData.quantity > 1) {
                        if (!quantitySpan) {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = ` (${itemData.quantity})`;
                            itemElement.appendChild(newQuantitySpan);
                        } else {
                            quantitySpan.textContent = ` (${itemData.quantity})`;
                        }
                    } else if (itemData.quantity === 1) {
                        if (quantitySpan) {
                            quantitySpan.textContent = '';
                        } else {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = '';
                            itemElement.appendChild(newQuantitySpan);
                        }
                    } else if (itemData.quantity <= 0) {
                        // Remove o item do array initialItems
                        initialItems.splice(itemIndex, 1);
                        // Remove o item do DOM
                        itemElement.remove();
                        selectedItem = null;
                        selectedItemElement = null;
                        useButton.style.display = 'none';
                        saveInventoryData(auth.currentUser.uid); // Salva aqui para refletir a remoção
                        return;
                    }
                }

                selectedItem = null;
                if (selectedItemElement) {
                    selectedItemElement.classList.remove('selected');
                    selectedItemElement = null;
                }
                useButton.style.display = 'none';

                saveInventoryData(auth.currentUser.uid);
            }
        }
    });
});

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

// Função para salvar dados no Firestore
async function saveInventoryData(uid) {
    const inventoryData = {
        itemsInChest: initialItems.map(item => ({
            id: item.id,
            content: item.content,
            consumable: item.consumable,
            quantity: item.quantity
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
        // A atualização da Couraça agora é feita diretamente no evento de clique
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
                itemsInChest: initialItems.map(item => ({ ...item })), // Cria uma cópia dos itens iniciais
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
            updateCharacterCouraca(); // Atualiza a Couraça ao carregar inicialmente
            updateCharacterDamage(); // Atualiza o Dano ao carregar inicialmente
        } else {
            const inventoryData = playerSnap.data().inventory;
            // Atualiza a variável initialItems com os dados do Firestore
            initialItems.length = 0; // Limpa o array existente
            inventoryData.itemsInChest.forEach(item => initialItems.push({ ...item }));
            loadInventoryUI(inventoryData);
            updateCharacterCouraca(); // Atualiza a Couraça ao carregar inicialmente
            updateCharacterDamage(); // Atualiza o Dano ao carregar inicialmente
        }
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

        if (item.consumable && item.quantity > 0) {
            const quantitySpan = document.createElement('span');
            quantitySpan.classList.add('item-quantity');
            quantitySpan.textContent = item.quantity > 1 ? ` (${item.quantity})` : '';
            newItem.appendChild(quantitySpan);
        }

        chestElement.appendChild(newItem);
        // Usamos o event listener no container agora
        // addItemClickListener(newItem);
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
    const couracaElement = document.getElementById("char-couraca");
    if (!couracaElement) return;

    let baseCouraca = 0; // Explicitly set baseCouraca to 0
    let bonusCouraca = 0;

    const armorSlot = document.querySelector('.slot[data-slot="armor"]');
    if (armorSlot && armorSlot.innerHTML === "Hábito monástico") {
        bonusCouraca += 2;
    }

    const totalCouraca = baseCouraca + bonusCouraca;
    couracaElement.innerText = totalCouraca;
}

function updateCharacterDamage() {
    const weaponSlot = document.querySelector(".slot[data-slot='weapon']"); // Certifique-se de que o dataset é correto
    const damageDisplay = document.querySelector("#char-dano"); // O elemento onde o dano é exibido

    if (weaponSlot && weaponSlot.innerHTML.toLowerCase().includes("canivete")) {
        damageDisplay.textContent = "1D3";
    } else {
        damageDisplay.textContent = "1";
    }
}


// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            currentPlayerData = await getPlayerData(user.uid); // 🔹 Recupera os dados da ficha
            if (currentPlayerData) {
                updateCharacterSheet(currentPlayerData); // 🔹 Atualiza a ficha do personagem
            }

            await loadInventoryData(user.uid); // 🔹 Carrega os itens do inventário e slots equipados
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });

    // Event listener para o botão "Usar"
    const useButton = document.getElementById('useBtn');
    useButton.addEventListener('click', () => {
        if (selectedItem) {
            const itemIndex = initialItems.findIndex(item => item.id === selectedItem);
            if (itemIndex !== -1 && initialItems[itemIndex].consumable && initialItems[itemIndex].quantity > 0) {
                const itemData = initialItems[itemIndex];

                // Efeito do item "pao-estragado"
                if (itemData.id === 'pao-estragado') {
                    const energyElement = document.getElementById('char-energy');
                    if (energyElement) {
                        let currentEnergy = parseInt(energyElement.innerText || '0');
                        currentEnergy -= 2;
                        energyElement.innerText = Math.max(0, currentEnergy);
                    }
                }

                // Decrementa a quantidade do item
                initialItems[itemIndex].quantity--;

                // Atualiza a UI do baú
                const chestElement = document.querySelector('.items');
                const itemElement = chestElement.querySelector(`.item[data-item="${selectedItem}"]`);
                if (itemElement) {
                    itemElement.innerHTML = itemData.content;
                    const quantitySpan = itemElement.querySelector('.item-quantity');
                    if (itemData.quantity > 1) {
                        if (!quantitySpan) {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = ` (${itemData.quantity})`;
                            itemElement.appendChild(newQuantitySpan);
                        } else {
                            quantitySpan.textContent = ` (${itemData.quantity})`;
                        }
                    } else if (itemData.quantity === 1) {
                        if (quantitySpan) {
                            quantitySpan.textContent = '';
                        } else {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = '';
                            itemElement.appendChild(newQuantitySpan);
                        }
                    } else if (itemData.quantity <= 0) {
                        const removedItemId = initialItems.splice(itemIndex, 1)[0]?.id;
                        if (removedItemId) {
                            const removedElement = chestElement.querySelector(`.item[data-item="${removedItemId}"]`);
                            if (removedElement) {
                                removedElement.remove();
                            }
                        }
                        selectedItem = null;
                        selectedItemElement = null;
                        useButton.style.display = 'none';
                        saveInventoryData(auth.currentUser.uid);
                        return;
                    }
                }

                selectedItem = null;
                if (selectedItemElement) {
                    selectedItemElement.classList.remove('selected');
                    selectedItemElement = null;
                }
                useButton.style.display = 'none';

                saveInventoryData(auth.currentUser.uid);
            }
        }
    });
});

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

// Função para salvar dados no Firestore
async function saveInventoryData(uid) {
    const inventoryData = {
        itemsInChest: initialItems.map(item => ({ ...item })), // Salva uma cópia do item
        equippedItems: Array.from(document.querySelectorAll('.slot')).reduce((acc, slot) => {
            acc[slot.dataset.slot] = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;
            return acc;
        }, {})
    };

    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
        console.log("Inventário salvo com sucesso!");
        // A atualização da Couraça agora é feita diretamente no evento de clique
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
                itemsInChest: initialItems.map(item => ({ ...item })), // Cria uma cópia dos itens iniciais
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
            // Atualiza a variável initialItems com os dados do Firestore
            initialItems.length = 0; // Limpa o array existente
            inventoryData.itemsInChest.forEach(item => initialItems.push({ ...item }));
            loadInventoryUI(inventoryData);
            updateCharacterCouraca(); // Atualiza a Couraça ao carregar inicialmente
            updateCharacterDamage(); // Atualiza o Dano ao carregar inicialmente
        } else {
            const inventoryData = playerSnap.data().inventory;
            // Atualiza a variável initialItems com os dados do Firestore
            initialItems.length = 0; // Limpa o array existente
            inventoryData.itemsInChest.forEach(item => initialItems.push({ ...item }));
            loadInventoryUI(inventoryData);
            updateCharacterCouraca(); // Atualiza a Couraça ao carregar inicialmente
            updateCharacterDamage(); // Atualiza o Dano ao carregar inicialmente
        }
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

        if (item.consumable && item.quantity > 0) {
            const quantitySpan = document.createElement('span');
            quantitySpan.classList.add('item-quantity');
            newItem.appendChild(document.createTextNode(item.content)); // Adiciona o texto do item primeiro
            quantitySpan.textContent = item.quantity > 1 ? ` (${item.quantity})` : '';
            newItem.appendChild(quantitySpan);
        }

        chestElement.appendChild(newItem);
        // O listener de clique agora está no container
        // addItemClickListener(newItem);
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
    const couracaElement = document.getElementById("char-couraca");
    if (!couracaElement) return;

    let baseCouraca = 0; // Explicitly set baseCouraca to 0
    let bonusCouraca = 0;

    const armorSlot = document.querySelector('.slot[data-slot="armor"]');
    if (armorSlot && armorSlot.innerHTML === "Hábito monástico") {
        bonusCouraca += 2;
    }

    const totalCouraca = baseCouraca + bonusCouraca;
    couracaElement.innerText = totalCouraca;
}

function updateCharacterDamage() {
    const weaponSlot = document.querySelector(".slot[data-slot='weapon']"); // Certifique-se de que o dataset é correto
    const damageDisplay = document.querySelector("#char-dano"); // O elemento onde o dano é exibido

    if (weaponSlot && weaponSlot.innerHTML.toLowerCase().includes("canivete")) {
        damageDisplay.textContent = "1D3";
    } else {
        damageDisplay.textContent = "1";
    }
}


// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            currentPlayerData = await getPlayerData(user.uid); // 🔹 Recupera os dados da ficha
            if (currentPlayerData) {
                updateCharacterSheet(currentPlayerData); // 🔹 Atualiza a ficha do personagem
            }

            await loadInventoryData(user.uid); // 🔹 Carrega os itens do inventário e slots equipados
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });

    // Event listener para o botão "Usar"
    const useButton = document.getElementById('useBtn');
    useButton.addEventListener('click', () => {
        if (selectedItem) {
            const itemIndex = initialItems.findIndex(item => item.id === selectedItem);
            if (itemIndex !== -1 && initialItems[itemIndex].consumable && initialItems[itemIndex].quantity > 0) {
                const itemData = initialItems[itemIndex];

                // Efeito do item "pao-estragado"
                if (itemData.id === 'pao-estragado') {
                    const energyElement = document.getElementById('char-energy');
                    if (energyElement) {
                        let currentEnergy = parseInt(energyElement.innerText || '0');
                        currentEnergy -= 2;
                        energyElement.innerText = Math.max(0, currentEnergy);
                    }
                }

                // Decrementa a quantidade do item
                initialItems[itemIndex].quantity--;

                // Atualiza a UI do baú
                const chestElement = document.querySelector('.items');
                const itemElement = chestElement.querySelector(`.item[data-item="${selectedItem}"]`);
                if (itemElement) {
                    itemElement.innerHTML = itemData.content;
                    const quantitySpan = itemElement.querySelector('.item-quantity');
                    if (itemData.quantity > 1) {
                        if (!quantitySpan) {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = ` (${itemData.quantity})`;
                            itemElement.appendChild(newQuantitySpan);
                        } else {
                            quantitySpan.textContent = ` (${itemData.quantity})`;
                        }
                    } else if (itemData.quantity === 1) {
                        if (quantitySpan) {
                            quantitySpan.textContent = '';
                        } else {
                            const newQuantitySpan = document.createElement('span');
                            newQuantitySpan.classList.add('item-quantity');
                            newQuantitySpan.textContent = '';
                            itemElement.appendChild(newQuantitySpan);
                        }
                    } else if (itemData.quantity <= 0) {
                        const removedItemId = initialItems.splice(itemIndex, 1)[0]?.id;
                        if (removedItemId) {
                            const removedElement = chestElement.querySelector(`.item[data-item="${removedItemId}"]`);
                            if (removedElement) {
                                removedElement.remove();
                            }
                        }
                        selectedItem = null;
                        selectedItemElement = null;
                        useButton.style.display = 'none';
                        saveInventoryData(auth.currentUser.uid);
                        return;
                    }
                }

                selectedItem = null;
                if (selectedItemElement) {
                    selectedItemElement.classList.remove('selected');
                    selectedItemElement = null;
                }
                useButton.style.display = 'none';

                saveInventoryData(auth.currentUser.uid);
            }
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
    // document.getElementById("char-dano").innerText = playerData.dano || "1"; // O dano agora é atualizado pela função updateCharacterDamage
}
