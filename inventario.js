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
let currentPlayerData = null; // Armazena os dados do jogador

// Itens iniciais que o jogador deve ter
const initialItems = [
    { id: "bolsa-de-escriba", content: "Bolsa de escriba" },
    { id: "weapon", content: "canivete" }, // Mudando o id para corresponder ao slot
    { id: "armor", content: "Hábito monástico" }, // Mudando o id para corresponder ao slot
    { id: "velas", content: "Velas" },
    { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, quantity: 3 },
    { id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, quantity: 2 }
];

// Função para exibir/ocultar o botão de usar
function toggleUseButton(show) {
    const useButton = document.getElementById("useBtn");
    if (useButton) {
        useButton.style.display = show ? "block" : "none";
    } else {
        console.warn("Botão 'Usar' não encontrado no HTML.");
    }
}

// Seleciona os itens clicados no baú
document.addEventListener("DOMContentLoaded", () => {
    const itemsContainer = document.querySelector('.items');
    const slots = document.querySelectorAll('.slot');
    const discardSlot = document.getElementById("discard-slot");
    const useButton = document.getElementById("useBtn"); // Obtém a referência do botão

    function handleItemClick(item) {
        console.log("Item clicado:", item);
        clearHighlights();
        selectedItem = item;
        item.classList.add('selected');

        // Destaca os slots compatíveis
        slots.forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight'); // Adiciona o destaque
            }
        });

        // Verifica se o item é consumível e mostra/oculta o botão "Usar"
        if (selectedItem.dataset.consumable === 'true') {
            toggleUseButton(true);
        } else {
            toggleUseButton(false);
        }
    }

    // Adiciona evento de clique aos itens iniciais
    if (itemsContainer) {
        itemsContainer.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => handleItemClick(item));
        });
    }

    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            console.log("Slot clicado:", slot);
            const slotType = slot.dataset.slot;
            const currentEquippedItem = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;

            if (selectedItem && slotType === selectedItem.dataset.item) {
                console.log("Equipando item:", selectedItem.innerHTML, "no slot:", slotType);
                // Equipa um novo item
                if (currentEquippedItem) {
                    // Desequipa o item atual e devolve ao baú
                    const newItem = document.createElement("div");
                    newItem.classList.add("item");
                    newItem.dataset.item = slotType;
                    newItem.dataset.consumable = slot.dataset.consumable; // Mantém a propriedade consumable
                    newItem.dataset.quantity = slot.dataset.quantity;     // Mantém a quantidade
                    newItem.innerHTML = currentEquippedItem;
                    itemsContainer.appendChild(newItem);
                    addItemClickListener(newItem);
                }

                slot.innerHTML = selectedItem.innerHTML;
                slot.dataset.consumable = selectedItem.dataset.consumable; // Atualiza a propriedade consumable do slot
                slot.dataset.quantity = selectedItem.dataset.quantity;     // Atualiza a quantidade do slot
                selectedItem.remove();
                selectedItem = null;
                clearHighlights();
                toggleUseButton(false); // Oculta o botão após equipar

                saveInventoryData(auth.currentUser.uid);
                updateCharacterCouraca();
                updateCharacterDamage();
            } else if (selectedItem === null && currentEquippedItem) {
                console.log("Desequipando item:", currentEquippedItem, "do slot:", slotType);
                // Desequipa um item existente
                const itemText = slot.innerHTML;
                const consumable = slot.dataset.consumable === 'true';
                const quantity = slot.dataset.quantity;
                slot.innerHTML = slot.dataset.slot;
                delete slot.dataset.consumable; // Remove a propriedade consumable do slot
                delete slot.dataset.quantity;     // Remove a quantidade do slot

                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slotType;
                newItem.innerHTML = itemText;
                if (consumable) {
                    newItem.dataset.consumable = 'true';
                    newItem.dataset.quantity = quantity;
                }

                itemsContainer.appendChild(newItem);
                addItemClickListener(newItem);

                updateCharacterCouraca();
                updateCharacterDamage();
                saveInventoryData(auth.currentUser.uid);
            }
        });
    });

    // Adiciona funcionalidade ao botão de descarte
    if (discardSlot) {
        discardSlot.addEventListener("click", () => {
            console.log("Botão de descarte clicado");
            if (selectedItem) {
                console.log("Item descartado:", selectedItem.innerHTML);
                selectedItem.remove();
                selectedItem = null;
                clearHighlights();
                toggleUseButton(false);
                saveInventoryData(auth.currentUser.uid);
            }
        });
    } else {
        console.warn("Slot de descarte não encontrado no HTML.");
    }

    // Adiciona funcionalidade ao botão de usar
    if (useButton) {
        useButton.addEventListener("click", () => {
            console.log("Botão 'Usar' clicado");
            if (selectedItem && selectedItem.dataset.consumable === 'true') {
                const itemId = selectedItem.dataset.item;
                console.log("Usando item consumível:", selectedItem.innerHTML, "ID:", itemId);
                let quantity = parseInt(selectedItem.dataset.quantity);
                if (!isNaN(quantity) && quantity > 0) {
                    quantity--;
                    selectedItem.dataset.quantity = quantity;
                    const quantitySpan = selectedItem.querySelector('.item-quantity');
                    if (quantitySpan) {
                        quantitySpan.textContent = quantity > 0 ? `(${quantity})` : '';
                    } else if (quantity > 0) {
                        selectedItem.innerHTML += ` <span class="item-quantity">(${quantity})</span>`;
                    }

                    if (quantity === 0) {
                        console.log("Item consumível esgotado:", selectedItem.innerHTML);
                        selectedItem.remove();
                        selectedItem = null;
                        clearHighlights();
                        toggleUseButton(false);
                    }
                    saveInventoryData(auth.currentUser.uid);
                    // Aqui você pode adicionar a lógica para o efeito do item
                    console.log("Quantidade restante:", quantity);
                }
            } else if (selectedItem) {
                console.log("O item selecionado não é consumível.");
            } else {
                console.log("Nenhum item consumível selecionado para usar.");
            }
        });
    } else {
        console.warn("Botão 'Usar' não encontrado no HTML.");
    }
});

// Adiciona evento de clique aos novos itens do baú
function addItemClickListener(item) {
    item.addEventListener('click', () => {
        console.log("Novo item clicado no baú:", item);
        clearHighlights();
        selectedItem = item;
        item.classList.add('selected');

        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight');
            }
        });

        // Verifica se o item é consumível e mostra/oculta o botão "Usar"
        if (selectedItem.dataset.consumable === 'true') {
            toggleUseButton(true);
        } else {
            toggleUseButton(false);
        }
    });
}

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

// Função para salvar dados no Firestore
async function saveInventoryData(uid) {
    console.log("Salvando dados do inventário para o usuário:", uid);
    const itemsInChest = Array.from(document.querySelectorAll('.item')).map(item => {
        const data = {
            id: item.dataset.item,
            content: item.innerHTML
        };
        if (item.dataset.consumable === 'true') {
            data.consumable = true;
            data.quantity = parseInt(item.dataset.quantity);
        }
        return data;
    });

    const equippedItems = Array.from(document.querySelectorAll('.slot')).reduce((acc, slot) => {
        const itemName = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;
        acc[slot.dataset.slot] = itemName;
        if (itemName) {
            if (slot.dataset.consumable === 'true') {
                acc[slot.dataset.slot + '_consumable'] = true;
                acc[slot.dataset.slot + '_quantity'] = parseInt(slot.dataset.quantity);
            }
        }
        return acc;
    }, {});

    const inventoryData = {
        itemsInChest: itemsInChest,
        equippedItems: equippedItems
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
    console.log("Carregando dados do inventário para o usuário:", uid);
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        if (!playerSnap.exists() || !playerSnap.data().inventory) {
            // Se o inventário não existir, inicializa com os itens iniciais
            const initialInventoryData = {
                itemsInChest: initialItems.map(item => ({ ...item })), // Cria uma cópia para não alterar o original
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
            loadInventoryUI(inventoryData);
            updateCharacterCouraca(); // Atualiza a Couraça ao carregar inicialmente
            updateCharacterDamage(); // Atualiza o Dano ao carregar inicialmente
        }
    } catch (error) {
        console.error("Erro ao carregar o inventário:", error);
    }
}

function loadInventoryUI(inventoryData) {
    console.log("Carregando UI do inventário:", inventoryData);
    // Carrega itens no baú
    const chestElement = document.querySelector('.items');
    chestElement.innerHTML = ""; // Limpa o conteúdo atual
    inventoryData.itemsInChest.forEach(item => {
        const newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.item = item.id;
        newItem.innerHTML = item.content;
        if (item.consumable) {
            newItem.dataset.consumable = 'true';
            newItem.dataset.quantity = item.quantity;
            if (item.quantity > 0) {
                newItem.innerHTML += ` <span class="item-quantity">(${item.quantity})</span>`;
            }
        }

        chestElement.appendChild(newItem);
        addItemClickListener(newItem);
    });

    // Carrega itens equipados
    document.querySelectorAll('.slot').forEach(slot => {
        const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
        slot.innerHTML = equippedItem || slot.dataset.slot;
        if (equippedItem) {
            if (inventoryData.equippedItems[slot.dataset.slot + '_consumable']) {
                slot.dataset.consumable = 'true';
                slot.dataset.quantity = inventoryData.equippedItems[slot.dataset.slot + '_quantity'];
            } else {
                delete slot.dataset.consumable;
                delete slot.dataset.quantity;
            }
        } else {
            delete slot.dataset.consumable;
            delete slot.dataset.quantity;
        }
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
});

// 📌 Sistema de Carrossel entre as janelas
const slides = document.querySelectorAll(".carousel-slide");
let currentSlide = 0;

const prevBtn = document.getElementById("prevBtn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
        slides[currentSlide].classList.add("active");
    });
} else {
    console.warn("Botão 'Anterior' do carrossel não encontrado.");
}

const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
        slides[currentSlide].classList.add("active");
    });
} else {
    console.warn("Botão 'Próximo' do carrossel não encontrado.");
}

// 📌 Exibir a primeira janela ao carregar
if (slides.length > 0) {
    slides[currentSlide].classList.add("active");
}

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
