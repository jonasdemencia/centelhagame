import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
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
// Variável global para o listener
let inventoryListener = null;
// Variável global para o listener do jogador
let playerDataListener = null;

// Função para configurar listener dos dados do jogador
async function setupPlayerDataListener(uid) {
    console.log("Configurando listener dos dados do jogador:", uid);
    try {
        const playerRef = doc(db, "players", uid);
        
        // Remove listener anterior se existir
        if (playerDataListener) {
            playerDataListener();
        }
        
        // Configura listener em tempo real para TODOS os dados do jogador
        playerDataListener = onSnapshot(playerRef, (docSnap) => {
            if (docSnap.exists()) {
                const playerData = docSnap.data();
                console.log("DADOS DO JOGADOR ATUALIZADOS EM TEMPO REAL!");
                
                // Atualiza dados globais
                currentPlayerData = playerData;
                
                // Atualiza a interface
                updateCharacterSheet(playerData);
            }
        }, (error) => {
            console.error("Erro no listener dos dados do jogador:", error);
        });
        
    } catch (error) {
        console.error("Erro ao configurar listener dos dados do jogador:", error);
    }
}

// Itens iniciais que o jogador deve ter (adicionando propriedade de dano)
const initialItems = [
    { id: "bolsa-de-escriba", content: "Bolsa de escriba", description: "Uma bolsa para guardar pergaminhos e penas." },
    { id: "weapon", content: "canivete", description: "Uma pequena lâmina afiada.", damage: "1D10" }, // Adicionando dano
    { id: "armor", content: "Hábito monástico", description: "Vestes simples que oferecem pouca proteção.", defense: 2 },
    { id: "velas", content: "Velas", description: "Fontes de luz portáteis." },
    { id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, quantity: 3, effect: "heal", value: 2, description: "Um pequeno saco contendo ervas que podem curar ferimentos leves." },
    { id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital." },
    { id: "pao", content: "Pão", consumable: true, quantity: 1, description: "Um pedaço de pão simples." },
    { id: "pao-mofado", content: "Pão Mofado", consumable: true, quantity: 20, effect: "damage", value: 5, description: "Um pedaço de pão velho e mofado. Estranhamente, parece ter um efeito... diferente." },
    { id: "elixir-poder", content: "Elixir do Poder Supremo", consumable: true, quantity: 5, effect: "boost_attributes", value: 100, description: "Um elixir mágico que aumenta temporariamente todos os seus atributos para 100." },
    //{ id: "grilo", content: "Grilo", description: "Um pequeno grilo usado como componente mágico para magias de sono.", componente: true, energia: { total: 1, inicial: 1 } }

];

// Lista de itens que podem ser adicionados dinamicamente (não iniciais)
const extraItems = [
    { id: "grilo", content: "Grilo", description: "Um pequeno grilo saltitante.", componente: true, energia: { total: 1, inicial: 1 } },
    { id: "espada-ferro", content: "Espada de Ferro", description: "Uma espada comum de ferro.", damage: "1d8" },
    { id: "la", content: "Lã", description: "Fios de lã usados como componente mágico para magias de atordoamento.", componente: true }, // ← ADICIONE ESTA LINHA
    { id: "pedaco-couro", content: "Pedaço de couro", description: "tira de couro endurecido para magias.", componente: true }, // ← ADICIONE ESTA LINHA

    // Adicione mais itens aqui conforme necessário
];


// Função para reiniciar o inventário
async function resetInventory() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        console.error("Usuário não está logado!");
        return;
    }

    try {
        const playerRef = doc(db, "players", uid);
        // Remove o inventário atual
        await setDoc(playerRef, { 
            inventory: {
                itemsInChest: [],
                equippedItems: {}
            }
        }, { merge: true });
        
        console.log("Inventário limpo. Recarregando...");
        
        // Recarrega a página para inicializar com os novos itens
        window.location.reload();
        
    } catch (error) {
        console.error("Erro ao resetar inventário:", error);
    }
}

// Adicione esta linha após a função resetInventory
window.resetInventory = resetInventory;

// Variável global para armazenar o dado selecionado
let selectedDice = null;

// Função para inicializar os dados da coleção
function initializeDiceCollection() {
    const diceCollection = document.querySelector('.dice-items');
    const initialDice = [
        { type: 'D3', name: 'Dado de Cristal (D3)', description: 'Um pequeno dado triangular de cristal' },
        { type: 'D4', name: 'Dado de Jade (D4)', description: 'Um dado piramidal de jade' },
        { type: 'D6', name: 'Dado de Marfim (D6)', description: 'Um dado cúbico de marfim antigo' },
        { type: 'D8', name: 'Dado de Âmbar (D8)', description: 'Um dado octaédrico de âmbar' },
        { type: 'D10', name: 'Dado de Ametista (D10)', description: 'Um dado decaédrico de ametista' },
        { type: 'D12', name: 'Dado de Safira (D12)', description: 'Um dado dodecaédrico de safira' },
        { type: 'D20', name: 'Dado de Rubi (D20)', description: 'Um dado icosaédrico de rubi' }
    ];

    diceCollection.innerHTML = ''; // Limpa a coleção antes de adicionar

    initialDice.forEach(dice => {
        const diceElement = document.createElement('div');
        diceElement.className = 'dice-item';
        diceElement.dataset.diceType = dice.type;
        diceElement.dataset.diceName = dice.name;
        diceElement.textContent = dice.name;
        diceCollection.appendChild(diceElement);

        diceElement.addEventListener('click', () => handleDiceClick(diceElement));
    });
}
// Função para lidar com o clique em um dado
function handleDiceClick(diceElement) {
    clearDiceHighlights();
    selectedDice = diceElement;
    diceElement.classList.add('selected');

    const slots = document.querySelectorAll('.dice-slot');
    slots.forEach(slot => {
        if (slot.dataset.dice === diceElement.dataset.diceType) {
            slot.classList.add('highlight');
        }
    });
}

// Função para limpar destaques dos dados
function clearDiceHighlights() {
    document.querySelectorAll('.dice-item').forEach(die => die.classList.remove('selected'));
    document.querySelectorAll('.dice-slot').forEach(slot => slot.classList.remove('highlight'));
}

// Adiciona eventos aos slots de dados
function initializeDiceSlots() {
    const diceSlots = document.querySelectorAll('.dice-slot');
    diceSlots.forEach(slot => {
        slot.addEventListener('click', async () => {
            const slotType = slot.dataset.dice;
            const currentEquippedDice = slot.innerHTML !== slotType ? slot.innerHTML : null;

            if (selectedDice && slotType === selectedDice.dataset.diceType) {
                // Equipa o dado
                if (currentEquippedDice) {
                    // Devolve o dado atual para a coleção
                    const newDice = document.createElement('div');
                    newDice.className = 'dice-item';
                    newDice.dataset.diceType = slotType;
                    newDice.dataset.diceName = currentEquippedDice;
                    newDice.textContent = currentEquippedDice;
                    document.querySelector('.dice-items').appendChild(newDice);
                    newDice.addEventListener('click', () => handleDiceClick(newDice));
                }

                // Coloca o novo dado no slot
                slot.innerHTML = selectedDice.dataset.diceName;
                selectedDice.remove();
                selectedDice = null;
                clearDiceHighlights();

                // Salva o estado após equipar
                await saveDiceState(auth.currentUser.uid);

            } else if (selectedDice === null && currentEquippedDice) {
                // Desequipa o dado
                const newDice = document.createElement('div');
                newDice.className = 'dice-item';
                newDice.dataset.diceType = slotType;
                newDice.dataset.diceName = currentEquippedDice;
                newDice.textContent = currentEquippedDice;
                document.querySelector('.dice-items').appendChild(newDice);
                newDice.addEventListener('click', () => handleDiceClick(newDice));
                
                slot.innerHTML = slotType;

                // Salva o estado após desequipar
                await saveDiceState(auth.currentUser.uid);
            }
        });
    });
}

// Inicializa o sistema de dados quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeDiceCollection();
    initializeDiceSlots();
});

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

        // Exibir a primeira janela ao carregar
    if (slides.length > 0) {
        slides[currentSlide].classList.add("active");
    }

    // ADICIONE SEU NOVO CÓDIGO AQUI
    // Sistema de Carrossel para Armazenamento (Storage)
    const storageSlides = document.querySelectorAll(".storage-carousel-slide");
    let currentStorageSlide = 0;

    const prevStorageBtn = document.getElementById("prevStorageBtn");
    if (prevStorageBtn) {
        prevStorageBtn.addEventListener("click", () => {
            storageSlides[currentStorageSlide].classList.remove("active");
            currentStorageSlide = (currentStorageSlide === 0) ? storageSlides.length - 1 : currentStorageSlide - 1;
            storageSlides[currentStorageSlide].classList.add("active");
        });
    }

    const nextStorageBtn = document.getElementById("nextStorageBtn");
    if (nextStorageBtn) {
        nextStorageBtn.addEventListener("click", () => {
            storageSlides[currentStorageSlide].classList.remove("active");
            currentStorageSlide = (currentStorageSlide === storageSlides.length - 1) ? 0 : currentStorageSlide + 1;
            storageSlides[currentStorageSlide].classList.add("active");
        });
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
    discardSlot.addEventListener("click", async () => {
        console.log("Botão de descarte clicado");
        if (selectedItem) {
            console.log("Item descartado:", selectedItem.innerHTML);
            
            // Adiciona à lista de descartados
            const uid = auth.currentUser?.uid;
            if (uid) {
                const playerRef = doc(db, "players", uid);
                const playerSnap = await getDoc(playerRef);
                const inventoryData = playerSnap.data().inventory;
                
                if (!inventoryData.discardedItems) {
                    inventoryData.discardedItems = [];
                }
// Para itens com componente, usa ID único; para outros, usa ID base
const itemToDiscard = selectedItem.dataset.componente === 'true' 
    ? selectedItem.dataset.item 
    : selectedItem.dataset.item.split('_')[0];
inventoryData.discardedItems.push(selectedItem.dataset.item);
                
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
            }
            
            selectedItem.remove();
            selectedItem = null;
            clearHighlights();
            toggleUseButton(false);
            saveInventoryData(auth.currentUser.uid); // ← ADICIONE ESTA LINHA
        }
    });
} else {
    console.warn("Slot de descarte não encontrado no HTML.");
}



    // Adiciona funcionalidade ao botão de usar
if (useButton) {
    useButton.addEventListener("click", async () => {
        console.log("Botão 'Usar' clicado");
        if (selectedItem && selectedItem.dataset.effect === "boost_attributes") {
    // Aplica o boost de atributos
    if (currentPlayerData) {
        // Aplica o boost
        const boostValue = parseInt(selectedItem.dataset.value) || 100;
        currentPlayerData.luck = { total: boostValue, initial: boostValue };
        currentPlayerData.skill = { total: boostValue, initial: boostValue };
        currentPlayerData.charisma = { total: boostValue, initial: boostValue };
        currentPlayerData.magic = { total: boostValue, initial: boostValue };

                
                // Salva no Firestore
                await savePlayerData(auth.currentUser.uid, currentPlayerData);
                
                // Consome o item
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
                        selectedItem.remove();
                        selectedItem = null;
                        clearHighlights();
                        toggleUseButton(false);
                    }
                    
                    saveInventoryData(auth.currentUser.uid);
                }
                
                alert("Seus atributos foram aumentados para 100!");
                location.reload();
                return;
            }
        } else if (selectedItem && selectedItem.dataset.consumable === 'true') {
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
        if (!event.target.classList.contains('item-expand-toggle')) {
            if (multiSelectMode) {
                if (selectedItems.has(item)) {
                    selectedItems.delete(item);
                    item.classList.remove('multi-selected');
                } else {
                    selectedItems.add(item);
                    item.classList.add('multi-selected');
                }
                document.getElementById('selectedCount').textContent = `${selectedItems.size} selecionados`;
            } else {
                handleItemClick(item);
            }
        }
    });
}


let multiSelectMode = false;
let selectedItems = new Set();

// Controles de seleção múltipla
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleMultiSelect');
    const selectAllBtn = document.getElementById('selectAllGrilos');
    const discardBtn = document.getElementById('discardSelected');
    const countSpan = document.getElementById('selectedCount');

    toggleBtn.addEventListener('click', () => {
        multiSelectMode = !multiSelectMode;
        selectedItems.clear();
        
        if (multiSelectMode) {
            toggleBtn.textContent = 'Sair da Seleção Múltipla';
            selectAllBtn.style.display = 'inline-block';
            discardBtn.style.display = 'inline-block';
            countSpan.style.display = 'inline';
            document.querySelectorAll('.item').forEach(item => item.classList.remove('multi-selected'));
        } else {
            toggleBtn.textContent = 'Seleção Múltipla';
            selectAllBtn.style.display = 'none';
            discardBtn.style.display = 'none';
            countSpan.style.display = 'none';
            document.querySelectorAll('.item').forEach(item => item.classList.remove('multi-selected'));
        }
        updateSelectedCount();
    });

    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.item').forEach(item => {
            if (item.innerHTML.includes('Grilo')) {
                selectedItems.add(item);
                item.classList.add('multi-selected');
            }
        });
        updateSelectedCount();
    });

    discardBtn.addEventListener('click', async () => {
        if (selectedItems.size === 0) return;
        
        if (confirm(`Descartar ${selectedItems.size} itens selecionados?`)) {
            const uid = auth.currentUser?.uid;
            if (uid) {
                const playerRef = doc(db, "players", uid);
                const playerSnap = await getDoc(playerRef);
                const inventoryData = playerSnap.data().inventory;
                
                if (!inventoryData.discardedItems) {
                    inventoryData.discardedItems = [];
                }
                
                selectedItems.forEach(item => {
                    inventoryData.discardedItems.push(item.dataset.item);
                    item.remove();
                });
                
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                saveInventoryData(uid);
            }
            
            selectedItems.clear();
            updateSelectedCount();
        }
    });

    function updateSelectedCount() {
        countSpan.textContent = `${selectedItems.size} selecionados`;
    }
});


// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}

async function saveInventoryData(uid) {
    console.log("Salvando dados do inventário para o usuário:", uid);
    
    // Busca a lista de descartados do Firestore
    const playerRef = doc(db, "players", uid);
    const playerSnap = await getDoc(playerRef);
    const currentInventoryData = playerSnap.data()?.inventory || {};
    const discardedItems = currentInventoryData.discardedItems || [];
    
    const itemsInChest = Array.from(document.querySelectorAll('.item')).map(item => {
        const data = {
            id: item.dataset.item,
            content: item.innerHTML.split('<span class="item-expand-toggle">')[0].split('<span class="item-energia">')[0].trim()
        };
        if (item.dataset.energia) {
            data.energia = JSON.parse(item.dataset.energia);
        }
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
    })
    // FILTRA OS DESCARTADOS
.filter(item => {
    // Para itens com componente, verifica ID exato; para outros, verifica ID base
    return !discardedItems.includes(item.id);
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
        equippedItems: equippedItems,
        discardedItems: discardedItems // Mantém a lista de descartados
    };

    try {
        await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
        console.log("Inventário salvo com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar o inventário:", error);
    }
}


// ADICIONE A FUNÇÃO saveDiceState AQUI, com a correção do parêntese
async function saveDiceState(uid) {
    try {
        const diceState = {
            collection: Array.from(document.querySelectorAll('.dice-items .dice-item')).map(die => ({
                type: die.dataset.diceType,
                name: die.dataset.diceName,
                content: die.textContent
            })),
            equipped: Array.from(document.querySelectorAll('.dice-slot')).reduce((acc, slot) => {
                const diceContent = slot.innerHTML !== slot.dataset.dice ? {
                    type: slot.dataset.dice,
                    name: slot.textContent
                } : null;
                acc[slot.dataset.dice] = diceContent;
                return acc;
            }, {})
        };

        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, { diceStorage: diceState }, { merge: true });
        console.log("Estado dos dados salvo com sucesso!", diceState);
    } catch (error) {
        console.error("Erro ao salvar estado dos dados:", error);
    }
}

// Função para carregar o estado dos dados
async function loadDiceState(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        
        if (playerSnap.exists() && playerSnap.data().diceStorage) {
            const diceState = playerSnap.data().diceStorage;
            loadDiceUI(diceState);
        } else {
            initializeDiceCollection(); // Inicializa com os dados padrão
        }
    } catch (error) {
        console.error("Erro ao carregar estado dos dados:", error);
    }
}


// Função para carregar dados do Firestore COM LISTENER EM TEMPO REAL
async function loadInventoryData(uid) {
    console.log("Configurando listener em tempo real para o inventário:", uid);
    try {
        const playerRef = doc(db, "players", uid);
        
        // Remove listener anterior se existir
        if (inventoryListener) {
            inventoryListener();
        }
        
        // Configura listener em tempo real
        inventoryListener = onSnapshot(playerRef, async (docSnap) => {
            if (!docSnap.exists() || !docSnap.data().inventory) {
                // Se o inventário não existir, inicializa com os itens iniciais
                const initialInventoryData = {
                    itemsInChest: initialItems.map(item => ({ ...item })),
                    equippedItems: {
                        weapon: null, armor: null, helmet: null, amulet: null,
                        shield: null, gloves: null, ring: null, boots: null
                    }
                };
                await setDoc(playerRef, { inventory: initialInventoryData }, { merge: true });
                console.log("Inventário inicializado com os itens padrão.");
                return;
            }

            const inventoryData = docSnap.data().inventory;
            
            // Verifica se há novos itens em initialItems que não estão no inventário
            let inventoryUpdated = false;
            for (const initialItem of initialItems) {
                const itemExists = inventoryData.itemsInChest.some(item => item.id === initialItem.id);
                if (!itemExists) {
                    inventoryData.itemsInChest.push({...initialItem});
                    inventoryUpdated = true;
                }
            }
            
           // Verifica se algum item foi removido da lista de descartados e deve ser readicionado
// Verifica itens extras apenas se não existirem E não estão descartados
for (const extraItem of extraItems) {
    // Para itens com componente, só adiciona se não houver NENHUM do tipo base
    if (extraItem.componente) {
        const hasAnyOfType = inventoryData.itemsInChest.some(item => item.id.startsWith(extraItem.id));
        const allDiscarded = inventoryData.discardedItems && 
            inventoryData.discardedItems.some(discarded => discarded.startsWith(extraItem.id));
        
        // Só adiciona se não tem nenhum E não tem nenhum descartado
        if (!hasAnyOfType && !allDiscarded) {
            const newItem = {...extraItem};
            newItem.id = `${extraItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            inventoryData.itemsInChest.push(newItem);
            inventoryUpdated = true;
        }
    } else {
        // Para itens normais, lógica original
        const itemExists = inventoryData.itemsInChest.some(item => item.id === extraItem.id);
        const wasDiscarded = inventoryData.discardedItems && inventoryData.discardedItems.includes(extraItem.id);
        
        if (!itemExists && !wasDiscarded) {
            inventoryData.itemsInChest.push({...extraItem});
            inventoryUpdated = true;
        }
    }
}


            
            // Se o inventário foi atualizado, salva as alterações
            if (inventoryUpdated) {
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                console.log("Novos itens adicionados ao inventário.");
            }
            
            console.log("INVENTÁRIO ATUALIZADO EM TEMPO REAL!");
            loadInventoryUI(inventoryData);
            updateCharacterCouraca();
            updateCharacterDamage();
        }, (error) => {
            console.error("Erro no listener do inventário:", error);
        });
        
    } catch (error) {
        console.error("Erro ao configurar listener do inventário:", error);
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
        if (item.componente) {
    newItem.dataset.componente = 'true';
}

        
        if (item.energia) {
            newItem.dataset.energia = JSON.stringify(item.energia);
        }
        
        
       let energiaHTML = "";
if (item.energia) {
    const porcentagem = (item.energia.total / item.energia.inicial) * 100;
    let cor = "#4CAF50"; // Verde
    if (porcentagem <= 50) cor = "#FFA500"; // Amarelo
    if (porcentagem <= 25) cor = "#FF0000"; // Vermelho
    
    energiaHTML = `
    <div class="item-energy-bar">
        <div class="item-energy-fill" style="width: ${porcentagem}%; background-color: ${cor};"></div>
        <span class="item-energy-text">${item.energia.total}/${item.energia.inicial}</span>
    </div>
`;
}

newItem.innerHTML = `
    ${item.content}
    <span class="item-expand-toggle">+</span>
    <div class="item-description" style="display: none;">
        ${item.description || 'Descrição do item.'}
    </div>
    ${energiaHTML}
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

function loadDiceUI(diceState) {
    const diceCollection = document.querySelector('.dice-items');
    const slots = document.querySelectorAll('.dice-slot');
    
    // Limpa a coleção e slots
    diceCollection.innerHTML = '';
    slots.forEach(slot => {
        slot.innerHTML = slot.dataset.dice;
    });

    // Carrega dados da coleção
    if (diceState.collection && Array.isArray(diceState.collection)) {
        diceState.collection.forEach(dice => {
            const diceElement = document.createElement('div');
            diceElement.className = 'dice-item';
            diceElement.dataset.diceType = dice.type;
            diceElement.dataset.diceName = dice.name;
            diceElement.textContent = dice.name;
            diceCollection.appendChild(diceElement);
            diceElement.addEventListener('click', () => handleDiceClick(diceElement));
        });
    }

    // Carrega dados equipados
    if (diceState.equipped) {
        Object.entries(diceState.equipped).forEach(([slotType, diceData]) => {
            if (diceData) {
                const slot = document.querySelector(`.dice-slot[data-dice="${slotType}"]`);
                if (slot) {
                    slot.textContent = diceData.name;
                }
            }
        });
    }
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
    const weaponSlot = document.querySelector(".slot[data-slot='weapon']");
    const damageDisplay = document.querySelector("#char-dano");
    const uid = auth.currentUser.uid;

    let newDamageValue = "1"; // Valor padrão

    if (weaponSlot && weaponSlot.innerHTML !== weaponSlot.dataset.slot) {
        const equippedWeaponName = weaponSlot.innerHTML;
        const weaponData = initialItems.find(item => item.content === equippedWeaponName);
        
        if (weaponData && weaponData.damage) {
            newDamageValue = weaponData.damage;
            damageDisplay.textContent = weaponData.damage;
        } else {
            damageDisplay.textContent = "1";
        }
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


// Adicione esta função após a função updateCharacterDamage
function calculateLevel(experience) {
    // Base de experiência para cada nível (aumenta exponencialmente)
    const baseXP = 100;
    const exponent = 1.5;
    
    // Se não tiver experiência, é nível 1
    if (!experience || experience <= 0) return { level: 1, currentXP: 0, nextLevelXP: baseXP };
    
    // Calcula o nível atual
    let level = 1;
    let xpForNextLevel = baseXP;
    
    while (experience >= xpForNextLevel) {
        level++;
        // Próximo nível requer mais XP
        xpForNextLevel += Math.floor(baseXP * Math.pow(level, exponent));
    }
    
    // Calcula XP para o próximo nível
    const xpForCurrentLevel = xpForNextLevel - Math.floor(baseXP * Math.pow(level, exponent));
    const currentLevelXP = experience - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = currentLevelXP / xpNeeded;
    
    return {
        level,
        currentXP: experience,
        nextLevelXP: xpForNextLevel,
        currentLevelXP,
        xpNeeded,
        progress
    };
}



// Inicializa e carrega o inventário ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);

            currentPlayerData = await getPlayerData(user.uid);
            if (currentPlayerData) {
                updateCharacterSheet(currentPlayerData);
                initializeGameTime(currentPlayerData);
            }

            // CONFIGURA OS DOIS LISTENERS
            await setupPlayerDataListener(user.uid);  // ← NOVO
            await loadInventoryData(user.uid);
            await loadDiceState(user.uid);
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
// Modifique a função updateCharacterSheet para incluir a experiência
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

    // Atualiza a experiência e nível
    const experience = playerData.experience || 0;
    const levelInfo = calculateLevel(experience);
    
    document.getElementById("char-level").innerText = levelInfo.level;
    document.getElementById("char-xp").innerText = `${experience}/${levelInfo.nextLevelXP}`;
    
    // Atualiza a barra de XP
    const barraXP = document.getElementById("barra-xp-inventario");
    if (barraXP) {
        barraXP.style.width = `${levelInfo.progress * 100}%`;
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
