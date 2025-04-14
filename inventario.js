import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
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

// Itens iniciais que o jogador deve ter (adicionando descrições e propriedade de defesa)
const initialItems = [
    { id: "bolsa-de-escriba", content: "Bolsa de escriba", description: "Uma bolsa para guardar pergaminhos e penas." },
    { id: "weapon", content: "canivete", description: "Uma pequena lâmina afiada." }, // Mudando o id para corresponder ao slot
    { id: "armor", content: "Hábito monástico", description: "Vestes simples que oferecem pouca proteção.", defense: 2 }, // Mudando o id para corresponder ao slot e adicionando defesa
    { id: "velas", content: "Velas", description: "Fontes de luz portáteis." },
    { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, quantity: 3, effect: "heal", value: 2, description: "Um pequeno saco contendo ervas que podem curar ferimentos leves." }, // Adicionando efeito e valor
    { id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital." }, // Adicionando efeito e valor para a poção
    { id: "pao", content: "Pão", consumable: true, quantity: 1, description: "Um pedaço de pão simples." },
    { id: "pao-mofado", content: "Pão Mofado", consumable: true, quantity: 20, effect: "damage", value: 5, description: "Um pedaço de pão velho e mofado. Estranhamente, parece ter um efeito... diferente." } // Quantidade aumentada para 20
];

// Constantes para cálculo de tempo
const GAME_TIME_MULTIPLIER = 7; // 7 segundos no jogo para cada 1 segundo real
const SECONDS_PER_DAY = 86400; // Segundos em um dia
const REAL_SECONDS_PER_GAME_DAY = SECONDS_PER_DAY / GAME_TIME_MULTIPLIER; // Segundos reais para um dia no jogo

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
    // Sistema de Carrossel
    const slides = document.querySelectorAll(".carousel-slide");
    let currentSlide = 0;

    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
            slides[currentSlide].classList.add("active");
        });
    }

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
            slides[currentSlide].classList.add("active");
        });
    }

    // Exibir a primeira janela ao carregar
    if (slides.length > 0) {
        slides[currentSlide].classList.add("active");
    }
    
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
            item.addEventListener('click', () => {
                // Verifica se o clique foi no botão de expandir
                if (!item.classList.contains('item-expand-toggle')) {
                    handleItemClick(item);
                }
            });
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
                    newItem.dataset.quantity = slot.dataset.quantity;
                    newItem.dataset.effect = slot.dataset.effect;
                    newItem.dataset.value = slot.dataset.value;
                    newItem.innerHTML = currentEquippedItem;
                    itemsContainer.appendChild(newItem);
                    addItemClickListener(newItem);
                }

                slot.innerHTML = selectedItem.innerHTML.split('<span class="item-expand-toggle">')[0].trim(); // MODIFICADO AQUI
                slot.dataset.consumable = selectedItem.dataset.consumable; // Atualiza a propriedade consumable do slot
                slot.dataset.quantity = selectedItem.dataset.quantity;
                slot.dataset.effect = selectedItem.dataset.effect;
                slot.dataset.value = selectedItem.dataset.value;
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
                const effect = slot.dataset.effect;
                const value = slot.dataset.value;
                slot.innerHTML = slot.dataset.slot;
                delete slot.dataset.consumable; // Remove a propriedade consumable do slot
                delete slot.dataset.quantity;
                delete slot.dataset.effect;
                delete slot.dataset.value;

                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slotType;

                // Encontra o item original na lista de itens iniciais para obter a descrição
                const originalItem = initialItems.find(item => item.content === itemText);
                newItem.innerHTML = `
                    ${itemText}
                    <span class="item-expand-toggle">+</span>
                    <div class="item-description" style="display: none;">
                        ${originalItem ? originalItem.description : 'Descrição do item.'}
                    </div>
                `;

                if (consumable) {
                    newItem.dataset.consumable = 'true';
                    newItem.dataset.quantity = quantity;
                    if (effect) newItem.dataset.effect = effect;
                    if (value) newItem.dataset.value = value;
                    // Adiciona a quantidade visualmente
                    if (quantity > 0) {
                        newItem.innerHTML += ` <span class="item-quantity">(${quantity})</span>`;
                    }
                }

                itemsContainer.appendChild(newItem);
                addItemClickListener(newItem);
                // Adicionar o listener para o botão de expandir do novo item
                const expandToggle = newItem.querySelector('.item-expand-toggle');
                const descriptionDiv = newItem.querySelector('.item-description');
                if (expandToggle && descriptionDiv) {
                    expandToggle.addEventListener('click', (event) => {
                        event.stopPropagation();
                        descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
                        expandToggle.textContent = descriptionDiv.style.display === 'none' ? '+' : '-';
                    });
                }

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
        useButton.addEventListener("click", async () => { // Adicionando async para usar await
            console.log("Botão 'Usar' clicado");
            if (selectedItem && selectedItem.dataset.consumable === 'true') {
                const itemId = selectedItem.dataset.item;
                const itemName = selectedItem.innerHTML.split('<span')[0].trim(); // Obtém o nome do item sem a quantidade
                console.log("Usando item consumível:", itemName, "ID:", itemId);
                console.log("selectedItem:", selectedItem); // LOG
                console.log("selectedItem.dataset.quantity:", selectedItem.dataset.quantity); // LOG
                console.log("itemName:", itemName); // LOG
                let quantity = parseInt(selectedItem.dataset.quantity);
                if (!isNaN(quantity) && quantity > 0) {
                    // Aplica o efeito do item ANTES de decrementar a quantidade para a verificação
                    if (selectedItem && selectedItem.dataset.effect) {
                        const effect = selectedItem.dataset.effect;
                        const value = parseInt(selectedItem.dataset.value);
                        console.log("Aplicando efeito:", effect, "com valor:", value);

                       if (effect === "damage" && itemName === "Pão Mofado") {
    if (currentPlayerData && currentPlayerData.energy && currentPlayerData.energy.total > 0) {
        currentPlayerData.energy.total -= value;
        // Atualiza o texto e a barra de HP
        const energyTotal = currentPlayerData.energy.total;
        const energyInitial = currentPlayerData.energy.initial;
        document.getElementById("char-energy").innerText = `${energyTotal}/${energyInitial}`;
        
        // Atualiza a barra de HP
        const barraHP = document.getElementById("barra-hp-inventario");
        if (barraHP) {
            const porcentagem = Math.max(0, (energyTotal / energyInitial) * 100);
            barraHP.style.width = `${porcentagem}%`;
        }

        await savePlayerData(auth.currentUser.uid, currentPlayerData);
        console.log("Energia diminuída para:", currentPlayerData.energy.total);
    }
} else if (effect === "heal" && (itemName === "Pequeno saco com ervas medicinais" || itemName === "Poção de Cura Menor")) {
    if (currentPlayerData && currentPlayerData.energy) {
        const initialEnergy = currentPlayerData.energy.initial;
        const newEnergy = Math.min(currentPlayerData.energy.total + value, initialEnergy);
        currentPlayerData.energy.total = newEnergy;
        
        // Atualiza o texto e a barra de HP
        document.getElementById("char-energy").innerText = `${newEnergy}/${initialEnergy}`;
        
        // Atualiza a barra de HP
        const barraHP = document.getElementById("barra-hp-inventario");
        if (barraHP) {
            const porcentagem = Math.max(0, (newEnergy / initialEnergy) * 100);
            barraHP.style.width = `${porcentagem}%`;
        }

        await savePlayerData(auth.currentUser.uid, currentPlayerData);
        console.log("Energia aumentada para:", currentPlayerData.energy.total);
    }
}
                    }

                    quantity--;
                    selectedItem.dataset.quantity = quantity;
                    const quantitySpan = selectedItem.querySelector('.item-quantity');
                    if (quantitySpan) {
                        quantitySpan.textContent = quantity > 0 ? `(${quantity})` : '';
                    } else if (quantity > 0) {
                        selectedItem.innerHTML += ` <span class="item-quantity">(${quantity})</span>`;
                    }

                    if (quantity === 0) {
                        console.log("Item consumível esgotado:", itemName);
                        selectedItem.remove();
                        selectedItem = null;
                        clearHighlights();
                        toggleUseButton(false);
                    }

                    saveInventoryData(auth.currentUser.uid);
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
    item.addEventListener('click', (event) => {
        // Verifica se o clique foi no botão de expandir
        if (!event.target.classList.contains('item-expand-toggle')) {
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
        }
    });
}

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

// Função para salvar dados do inventário no Firestore
async function saveInventoryData(uid) {
    console.log("Salvando dados do inventário para o usuário:", uid);
    const itemsInChest = Array.from(document.querySelectorAll('.item')).map(item => {
        const data = {
            id: item.dataset.item,
            content: item.innerHTML.split('<span class="item-expand-toggle">')[0].trim() // Remove o botão de expandir ao salvar
        };
        if (item.dataset.consumable === 'true') {
            data.consumable = true;
            data.quantity = parseInt(item.dataset.quantity);
            if (item.dataset.effect) {
                data.effect = item.dataset.effect;
            }
            if (item.dataset.value) {
                data.value = parseInt(item.dataset.value);
            }
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
                if (slot.dataset.effect) {
                    acc[slot.dataset.slot + '_effect'] = slot.dataset.effect;
                }
                if (slot.dataset.value) {
                    acc[slot.dataset.slot + '_value'] = parseInt(slot.dataset.value);
                }
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
        newItem.innerHTML = `
            ${item.content}
            <span class="item-expand-toggle">+</span>
            <div class="item-description" style="display: none;">
                ${item.description || 'Descrição do item.'}
            </div>
        `;
        if (item.consumable) {
            newItem.dataset.consumable = 'true';
            newItem.dataset.quantity = item.quantity;
            if (item.effect) {
                newItem.dataset.effect = item.effect;
            }
            if (item.value) {
                newItem.dataset.value = item.value;
            }
            // Remove qualquer contador de quantidade existente antes de adicionar o novo
            newItem.innerHTML = newItem.innerHTML.replace(/ <span class="item-quantity">\(\d+\)<\/span>/g, '');
            if (item.quantity > 0) {
                newItem.innerHTML += ` <span class="item-quantity">(${item.quantity})</span>`;
            }
        }

        chestElement.appendChild(newItem);
        addItemClickListener(newItem); // Mantenha esta linha para a seleção do item
        // Adicionar o listener para o botão de expandir
        const expandToggle = newItem.querySelector('.item-expand-toggle');
        const descriptionDiv = newItem.querySelector('.item-description');
        if (expandToggle && descriptionDiv) {
            expandToggle.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o clique no "+" selecione o item para equipar
                descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
                expandToggle.textContent = descriptionDiv.style.display === 'none' ? '+' : '-';
            });
        }
    });

    // Carrega itens equipados
    document.querySelectorAll('.slot').forEach(slot => {
        const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
        slot.innerHTML = equippedItem || slot.dataset.slot;
        if (equippedItem) {
            if (inventoryData.equippedItems[slot.dataset.slot + '_consumable']) {
                slot.dataset.consumable = 'true';
                slot.dataset.quantity = inventoryData.equippedItems[slot.dataset.slot + '_quantity'];
                if (inventoryData.equippedItems[slot.dataset.slot + '_effect']) {
                    slot.dataset.effect = inventoryData.equippedItems[slot.dataset.slot + '_effect'];
                } else {
                    delete slot.dataset.effect;
                }
                if (inventoryData.equippedItems[slot.dataset.slot + '_value']) {
                    slot.dataset.value = inventoryData.equippedItems[slot.dataset.slot + '_value'];
                } else {
                    delete slot.dataset.value;
                }
            } else {
                delete slot.dataset.consumable;
                delete slot.dataset.quantity;
                delete slot.dataset.effect;
                delete slot.dataset.value;
            }
        } else {
            delete slot.dataset.consumable;
            delete slot.dataset.quantity;
            delete slot.dataset.effect;
            delete slot.dataset.value;
        }
    });
}

async function getPlayerData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
            const data = playerSnap.data();
            // Armazena a energia inicial se ainda não estiver definida
            if (data.energy && !data.energy.initial) {
                data.energy.initial = data.energy.total;
                await setDoc(playerRef, data, { merge: true }); // Salva a energia inicial
                console.log("Energia inicial do jogador definida como:", data.energy.total);
            }
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao recuperar os dados do jogador:", error);
        return null;
    }
}

// Função para atualizar o valor da Couraça na ficha do personagem
async function updateCharacterCouraca() {
    const couracaElement = document.getElementById("char-couraca");
    if (!couracaElement) return;

    let baseCouraca = 0; // Valor base da couraça
    let bonusCouraca = 0;

    // Verifica o item equipado no slot de armadura
    const armorSlot = document.querySelector('.slot[data-slot="armor"]');
    if (armorSlot && armorSlot.innerHTML !== armorSlot.dataset.slot) {
        const equippedArmorName = armorSlot.innerHTML;
        const armorData = initialItems.find(item => item.content === equippedArmorName);
        if (armorData && armorData.defense) {
            bonusCouraca += armorData.defense;
        }
    }

    // Verifica o item equipado no slot de botas
    const bootsSlot = document.querySelector('.slot[data-slot="boots"]');
    if (bootsSlot && bootsSlot.innerHTML !== bootsSlot.dataset.slot) {
        const equippedBootsName = bootsSlot.innerHTML;
        const bootsData = initialItems.find(item => item.content === equippedBootsName);
        if (bootsData && bootsData.defense) {
            bonusCouraca += bootsData.defense;
        }
    }

    // Verifica o item equipado no slot de escudo
    const shieldSlot = document.querySelector('.slot[data-slot="shield"]');
    if (shieldSlot && shieldSlot.innerHTML !== shieldSlot.dataset.slot) {
        const equippedShieldName = shieldSlot.innerHTML;
        const shieldData = initialItems.find(item => item.content === equippedShieldName);
        if (shieldData && shieldData.defense) {
            bonusCouraca += shieldData.defense;
        }
    }

    const totalCouraca = baseCouraca + bonusCouraca;
    couracaElement.innerText = totalCouraca;
    console.log("Valor total da couraça:", totalCouraca);

    // Atualiza o campo 'couraca' no Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
        const playerRef = doc(db, "players", uid);
        try {
            await updateDoc(playerRef, { couraca: totalCouraca });
            console.log("Campo 'couraca' atualizado no Firestore para:", totalCouraca);
        } catch (error) {
            console.error("Erro ao atualizar o campo 'couraca' no Firestore:", error);
        }
    }
}

async function updateCharacterDamage() {
    const weaponSlot = document.querySelector(".slot[data-slot='weapon']"); // Certifique-se de que o dataset é correto
    const damageDisplay = document.querySelector("#char-dano"); // O elemento onde o dano é exibido
    const uid = auth.currentUser.uid; // Obtém o UID do usuário logado

    let newDamageValue = "1"; // Valor padrão

    if (weaponSlot && weaponSlot.innerHTML.toLowerCase().includes("canivete")) {
        newDamageValue = "1D3";
        damageDisplay.textContent = "1D3";
    } else {
        damageDisplay.textContent = "1";
    }

    // Atualiza o campo 'dano' no Firestore
    if (uid) {
        const playerRef = doc(db, "players", uid);
        try {
            await updateDoc(playerRef, { dano: newDamageValue });
            console.log("Campo 'dano' atualizado no Firestore para:", newDamageValue);
        } catch (error) {
            console.error("Erro ao atualizar o campo 'dano' no Firestore:", error);
        }
    }
}


// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            currentPlayerData = await getPlayerData(user.uid);
            if (currentPlayerData) {
                updateCharacterSheet(currentPlayerData);
                initializeGameTime(currentPlayerData); // Inicializa o sistema de tempo
            }

            await loadInventoryData(user.uid);
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});




// Função para inicializar o sistema de tempo
function initializeGameTime(playerData) {
    // Se não existir timestamp inicial, cria um
    if (!playerData.gameTime) {
        playerData.gameTime = {
            startTimestamp: Date.now(),
            currentDay: 1
        };
    }

    // Atualiza o dia atual baseado no tempo decorrido
    updateGameDay(playerData);

    // Inicia o intervalo para atualizar o tempo
    setInterval(() => updateGameDay(playerData), 60000); // Verifica a cada minuto
}

// Função para atualizar o dia do jogo
async function updateGameDay(playerData) {
    const now = Date.now();
    const startTime = playerData.gameTime.startTimestamp;
    const elapsedRealSeconds = (now - startTime) / 1000;
    const elapsedGameDays = Math.floor(elapsedRealSeconds / REAL_SECONDS_PER_GAME_DAY);
    const newDay = elapsedGameDays + 1; // +1 porque começamos no dia 1

    if (newDay !== playerData.gameTime.currentDay) {
        playerData.gameTime.currentDay = newDay;
        document.getElementById("char-day").innerText = newDay;

        // Salva o novo dia no Firestore
        try {
            const uid = auth.currentUser?.uid;
            if (uid) {
                const playerRef = doc(db, "players", uid);
                await updateDoc(playerRef, {
                    'gameTime.currentDay': newDay,
                    'gameTime.startTimestamp': startTime
                });
                console.log("Dia do jogo atualizado para:", newDay);
            }
        } catch (error) {
            console.error("Erro ao salvar o dia do jogo:", error);
        }
    }
}

// 📌 Atualizar os dados da ficha de personagem ao carregar e barra de hp
function updateCharacterSheet(playerData) {
    if (!playerData) return;

    document.getElementById("char-name").innerText = playerData.name || "-";
    document.getElementById("char-race").innerText = playerData.race || "-";
    document.getElementById("char-class").innerText = playerData.class || "-";
    document.getElementById("char-alignment").innerText = playerData.alignment || "-";
    
    // Atualiza energia e barra de HP
    const energyTotal = playerData.energy?.total ?? 0;
    const energyInitial = playerData.energy?.initial ?? 0;
    
    // Atualiza o texto da energia
    document.getElementById("char-energy").innerText = `${energyTotal}/${energyInitial}`;
    
    // Atualiza a barra de HP
    const barraHP = document.getElementById("barra-hp-inventario");
    if (barraHP && energyInitial > 0) {
        const porcentagem = Math.max(0, (energyTotal / energyInitial) * 100);
        barraHP.style.width = `${porcentagem}%`;
    }

    // Restante dos atributos
    document.getElementById("char-skill").innerText = playerData.skill?.total ?? "-";
    document.getElementById("char-charisma").innerText = playerData.charisma?.total ?? "-";
    document.getElementById("char-magic").innerText = playerData.magic?.total ?? "-";
    document.getElementById("char-luck").innerText = playerData.luck?.total ?? "-";
    document.getElementById("char-couraca").innerText = playerData.couraca || "0";
    document.getElementById("char-po").innerText = playerData.po || "0";
    document.getElementById("char-hand").innerText = playerData.maoDominante || "-";
    document.getElementById("char-hemisphere").innerText = playerData.hemisferioDominante || "-";

    // Atualiza o dia
    document.getElementById("char-day").innerText = playerData.gameTime?.currentDay ?? 1;
}

// Nova função para salvar os dados do jogador (além do inventário)
async function savePlayerData(uid, playerData) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, playerData, { merge: true });
        console.log("Dados do jogador salvos com sucesso!");

        // -------------------- CONDIÇÃO DE MORTE (AGORA GERAL) --------------------
        if (playerData.energy && playerData.energy.total <= 0) {
            alert("Seu personagem morreu! Game Over.");
            console.log("GAME OVER: Energia chegou a 0 ou menos.");
            // Aqui você pode adicionar mais lógica de game over, se necessário.
        }
        // ----------------------------------------------------------------------

    } catch (error) {
        console.error("Erro ao salvar os dados do jogador:", error);
    }
}
