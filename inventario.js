import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Configuração Firebasee
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
    { id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno grilo saltitante.", componente: true, energia: { total: 1, inicial: 1 } },
    { id: "facao", content: "Facao", uuid: "extra-facao", slot: "weapon", description: "Uma pequena lâmina afiada.", damage: "1D4" },
    { id: "coberta", content: "Coberta", uuid: "extra-coberta", slot: "armor", description: "Vestes simples que oferecem pouca proteção.", defense: 2 },
    { id: "la", content: "Lã", uuid: "extra-la", description: "Fios de lã usados como componente mágico para magias de atordoamento.", componente: true },
    { id: "pedaco-couro", content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira de couro endurecido para magias.", componente: true },
    { id: "municao-38", content: "Munição de 38.", uuid: "extra-municao38", quantity: 6, projectile: true, description: "Projéteis letais calíbre 38." },
    { id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital." },
    { id: "revolver-38", content: "Revolver 38", uuid: "extra-revolver38", slot: "weapon", description: "Um revólver calibre 38.", damage: "1d8", ammoType: "municao-38", ammoCapacity: 6, loadedAmmo: 0 },
    { id: "escopeta-12", content: "Escopeta 12", uuid: "extra-escopeta12", slot: "weapon", description: "Uma espingarda calibre 12.", damage: "1d12+2", ammoType: "municao-12", ammoCapacity: 5, loadedAmmo: 0 },
    { id: "municao-12", content: "Munição de 12.", uuid: "extra-municao12", quantity: 5, projectile: true, description: "Projéteis letais calíbre 12." },
    { id: "Adaga", content: "Adaga", uuid: "extra-adaga", slot: "weapon", description: "Uma punhal afiado.", damage: "1D4" },
    { id: "granada-mao", content: "Granada de Mão", uuid: "extra-granada-mao", slot: "weapon", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil. Pode ser lançada para causar dano em área. Some do inventário ao acabar." },

];


// Função para reiniciar o inventário
async function resetInventory() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        console.error("Usuário não está logado!");
        return;
    }

    try {

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



async function carregarMunicaoNaArma() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const playerRef  = doc(db, "players", uid);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) return;

  const inventoryData        = playerSnap.data().inventory;
  const equippedWeaponName   = inventoryData.equippedItems.weapon;
  if (!equippedWeaponName) return;

  const allItemsArr = [...initialItems, ...extraItems];
  const weaponData  = allItemsArr.find(item =>
    item.content === equippedWeaponName && item.ammoType
  );
  if (!weaponData) {
    alert("A arma equipada não suporta munição!");
    return;
  }

  const ammoItemIndex = inventoryData.itemsInChest.findIndex(item =>
    item.id === weaponData.ammoType
  );
  if (ammoItemIndex === -1) {
    alert("Você não possui munição compatível!");
    return;
  }

  const ammoItem   = inventoryData.itemsInChest[ammoItemIndex];
  const loadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
  const ammoToLoad = Math.min(
    weaponData.ammoCapacity - loadedAmmo,
    ammoItem.quantity
  );

  if (ammoToLoad <= 0) {
    alert("A arma já está carregada ou não há munição suficiente!");
    return;
  }

  // Atualiza munição carregada
  inventoryData.equippedItems.weapon_loadedAmmo = loadedAmmo + ammoToLoad;

  // Atualiza munição no inventário
  ammoItem.quantity -= ammoToLoad;

  // Remove o item do baú se a quantidade ficar zero
  if (ammoItem.quantity <= 0) {
    inventoryData.itemsInChest.splice(ammoItemIndex, 1);

    // Marca esse UUID como descartado
    if (!inventoryData.discardedItems) inventoryData.discardedItems = [];
    inventoryData.discardedItems.push(ammoItem.uuid);
  }

  // (Opcional) Remove eventuais duplicatas de munição com qty <= 0
  inventoryData.itemsInChest = inventoryData.itemsInChest.filter(item => {
    if (item.id === weaponData.ammoType && item.quantity <= 0) {
      return false;
    }
    return true;
  });

  // Garante que o nome da arma equipada permaneça correto
  inventoryData.equippedItems.weapon = weaponData.content;

  // Salva no Firestore
  await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

  alert(`Você carregou ${ammoToLoad} munição no seu ${weaponData.content}.`);
}




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

    // --- DESTAQUE DE SLOT COMPATÍVEL ---
    slots.forEach(slot => slot.classList.remove('highlight'));
   console.log("Item clicado:", item);
const allItemsArr = [...initialItems, ...extraItems];
const itemData = allItemsArr.find(i => i.id === item.dataset.item);
console.log("itemData:", itemData);
if (itemData && itemData.slot) {
    console.log("Slot compatível esperado:", itemData.slot);
    slots.forEach(slot => {
        console.log("Verificando slot:", slot.dataset.slot);
        if (slot.dataset.slot === itemData.slot) {
            console.log("Destacando slot:", slot);
            slot.classList.add('highlight');
        }
    });
} else {
    console.log("Item não tem slot compatível.");
}
    // --- INÍCIO DO AJUSTE DE BOTÕES DE USO E MUNIÇÃO ---

const isProjectile = selectedItem.dataset.projectile === 'true';
let equippedWeaponName = currentPlayerData?.inventory?.equippedItems?.weapon;
// Remove sufixo de munição carregada, se existir (ex: "Revolver 38 (0/6)" -> "Revolver 38")
if (equippedWeaponName) {
    equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");
}
const weaponObj = allItemsArr.find(i => i.content === equippedWeaponName && i.ammoType);

const useBtn = document.getElementById("useBtn");
const carregarBtn = document.getElementById("carregar-municao-btn");

if (isProjectile && weaponObj && weaponObj.ammoType === selectedItem.dataset.item) {
    if (carregarBtn) carregarBtn.style.display = "block";
    if (useBtn) useBtn.style.display = "none";
} else if (selectedItem.dataset.consumable === 'true') {
    if (useBtn) useBtn.style.display = "block";
    if (carregarBtn) carregarBtn.style.display = "none";
} else {
    if (useBtn) useBtn.style.display = "none";
    if (carregarBtn) carregarBtn.style.display = "none";
}

// --- FIM DO AJUSTE DE BOTÕES DE USO E MUNIÇÃO ---
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

        const allItemsArr = [...initialItems, ...extraItems];
        // EQUIPE
        if (selectedItem) {
    const itemData = allItemsArr.find(i => i.id === selectedItem.dataset.item);
    if (itemData && slotType === itemData.slot) {
        // Se já há um item equipado, faz swap
        if (currentEquippedItem && currentEquippedItem !== slot.dataset.slot) {
            // Desequipa o atual e equipa o novo
            // 1. Cria novo item no inventário com o item atualmente equipado
            const originalItemData = allItemsArr.find(i => i.content === currentEquippedItem.replace(/\s*\(\d+\/\d+\)$/, ""));
            if (originalItemData) {
                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = originalItemData.id;
                newItem.dataset.uuid = crypto.randomUUID();
                newItem.innerHTML = `
${originalItemData.content}
<span class="item-expand-toggle">+</span>
<div class="item-description" style="display: none;">
${originalItemData.description || 'Descrição do item.'}
</div>
`;
                itemsContainer.appendChild(newItem);
                addItemClickListener(newItem);
            }
        }
        // Equipa o novo item
        slot.innerHTML = selectedItem.innerHTML.split('<span class="item-expand-toggle">')[0].trim();
        slot.dataset.consumable = selectedItem.dataset.consumable;
        slot.dataset.quantity = selectedItem.dataset.quantity;
        slot.dataset.effect = selectedItem.dataset.effect;
        slot.dataset.value = selectedItem.dataset.value;
        selectedItem.remove();
        selectedItem = null;
        clearHighlights();
        toggleUseButton(false);
        saveInventoryData(auth.currentUser.uid);
        updateCharacterCouraca();
        updateCharacterDamage();
    }
} else if (selectedItem === null && currentEquippedItem && currentEquippedItem !== slot.dataset.slot) {
    
            // Desequipar: remove do slot e adiciona ao inventário
    console.log("Desequipando item:", currentEquippedItem, "do slot:", slotType);

    // Limpa o slot visualmente
    slot.innerHTML = slotType;
    delete slot.dataset.consumable;
    delete slot.dataset.quantity;
    delete slot.dataset.effect;
    delete slot.dataset.value;

    // Busca o objeto do item original
    const allItemsArr = [...initialItems, ...extraItems];
    let itemName = currentEquippedItem.trim();
// Remove sufixo de munição carregada (ex: "Revolver 38 (6/6)" -> "Revolver 38")
itemName = itemName.replace(/\s*\(\d+\/\d+\)$/, "");
// Remove sufixo de quantidade (ex: "Granada de Mão (3)" -> "Granada de Mão")
itemName = itemName.replace(/\s*\(\d+\)$/, "");
const originalItemData = allItemsArr.find(item => item.content === itemName);

    if (!originalItemData) {
        console.warn("Item original não encontrado para desequipar:", currentEquippedItem);
        return;
    }

    // Atualiza o inventário no Firestore
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const playerRef = doc(db, "players", uid);

    getDoc(playerRef).then(playerSnap => {
        if (!playerSnap.exists()) return;
        const inventoryData = playerSnap.data().inventory;

        // Verifica se já está no inventário
        const alreadyInChest = inventoryData.itemsInChest.some(item => item.id === originalItemData.id);

        if (!alreadyInChest) {
            // Adiciona ao inventário
            inventoryData.itemsInChest.push({
                ...originalItemData,
                uuid: crypto.randomUUID()
            });
        }

        // LIMPA O SLOT NO FIRESTORE!
        if (inventoryData.equippedItems && inventoryData.equippedItems[slotType]) {
            inventoryData.equippedItems[slotType] = null;
            // Limpa também os campos extras se existirem
            delete inventoryData.equippedItems[slotType + '_consumable'];
            delete inventoryData.equippedItems[slotType + '_quantity'];
            delete inventoryData.equippedItems[slotType + '_effect'];
            delete inventoryData.equippedItems[slotType + '_value'];
        }

        setDoc(playerRef, { inventory: inventoryData }, { merge: true });
    });

    // Não mexa no DOM do inventário manualmente!
    // O listener onSnapshot vai atualizar a interface

    clearHighlights();
    toggleUseButton(false);
    updateCharacterCouraca();
    updateCharacterDamage();
}
}); // <--- ESTA CHAVE FECHA O addEventListener
});   // <--- ESTA CHAVE FECHA O forEach

  // Adiciona funcionalidade ao botão de descarte
if (discardSlot) {
    discardSlot.addEventListener("click", async () => {
        console.log("Botão de descarte clicado");
        if (selectedItem) {
            console.log("🗑️ DESCARTANDO ITEM:");
            console.log("   - ID do item:", selectedItem.dataset.item);
            console.log("   - Conteúdo:", selectedItem.innerHTML.split('<span')[0].trim());
            
            const uid = auth.currentUser?.uid;
if (uid) {
    const playerRef = doc(db, "players", uid);  // ✅ ADICIONE ESTA LINHA

    const playerSnap = await getDoc(playerRef);

                const inventoryData = playerSnap.data().inventory;
                
                if (!inventoryData.discardedItems) {
                    inventoryData.discardedItems = [];
                }
                
                // CORREÇÃO: Criar ID único para descarte baseado no elemento DOM
const uniqueDiscardId = selectedItem.dataset.uuid; // ← MUDAR ESTA LINHA
console.log("   - UUID único de descarte:", uniqueDiscardId);

inventoryData.discardedItems.push(uniqueDiscardId);
                
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                console.log("   - Item adicionado à lista de descartados");
            }
            
            const itemToRemove = selectedItem;
selectedItem = null;
clearHighlights();
toggleUseButton(false);
itemToRemove.remove();
saveInventoryData(auth.currentUser.uid);

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
        // Verifica se o clique foi no botão de expandir
        if (!event.target.classList.contains('item-expand-toggle')) {
            console.log("Novo item clicado no baú:", item);
            clearHighlights();
            selectedItem = item;
            item.classList.add('selected');

           const allItemsArr = [...initialItems, ...extraItems];
const itemData = allItemsArr.find(i => i.id === item.dataset.item);
if (itemData && itemData.slot) {
    document.querySelectorAll('.slot').forEach(slot => {
        if (slot.dataset.slot === itemData.slot) {
            slot.classList.add('highlight');
        }
    });
}

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

async function saveInventoryData(uid) {
  console.log("Salvando dados do inventário para o usuário:", uid);

  const playerRef = doc(db, "players", uid);
  const playerSnap = await getDoc(playerRef);
  const currentInventoryData = playerSnap.data()?.inventory || {};
  const discardedItems = currentInventoryData.discardedItems || [];

  // Pega todos os itens do baú - COM filtro para descartados
  const itemsInChest = Array.from(document.querySelectorAll('.item'))
    .map(item => {
      const itemId = item.dataset.item;
      if (["weapon", "armor", "helmet", "amulet", "shield", "gloves", "ring", "boots"]
          .includes(itemId)) {
        return null;
      }

      // IGNORA itens que já foram descartados
      const isDiscarded = discardedItems.includes(item.dataset.uuid);
      if (isDiscarded) {
        console.log(`🗑️ IGNORANDO ITEM DESCARTADO: ${itemId}`);
        return null;
      }

      console.log(
        `📦 PROCESSANDO ITEM: ${itemId} - ` +
        `Content: ${item.innerHTML
                    .split('<span class="item-expand-toggle">')[0]
                    .split('<span class="item-energia">')[0]
                    .trim()}`
      );

      const data = {
        id: itemId,
        uuid: item.dataset.uuid,
        content: item.innerHTML
                   .split('<span class="item-expand-toggle">')[0]
                   .split('<span class="item-energia">')[0]
                   .trim()
      };

      if (item.dataset.energia) {
        data.energia = JSON.parse(item.dataset.energia);
      }

      if (item.dataset.consumable === 'true') {
        data.consumable = true;
        data.quantity   = parseInt(item.dataset.quantity, 10);
        if (item.dataset.effect) data.effect = item.dataset.effect;
        if (item.dataset.value)  data.value  = parseInt(item.dataset.value, 10);
      }

      // === AQUI: trata projéteis ===
      if (item.dataset.projectile === 'true') {
        data.projectile = true;
        data.quantity   = parseInt(item.dataset.quantity, 10);
      }

      return data;
    })
    .filter(item => item !== null);

  // Resto igual...
  const equippedItems = Array.from(document.querySelectorAll('.slot'))
    .reduce((acc, slot) => {
      const itemName = slot.innerHTML !== slot.dataset.slot
                      ? slot.innerHTML
                      : null;
      acc[slot.dataset.slot] = itemName;

      if (itemName && slot.dataset.consumable === 'true') {
        acc[slot.dataset.slot + '_consumable'] = true;
        acc[slot.dataset.slot + '_quantity']   = parseInt(slot.dataset.quantity, 10);
        if (slot.dataset.effect) acc[slot.dataset.slot + '_effect'] = slot.dataset.effect;
        if (slot.dataset.value)  acc[slot.dataset.slot + '_value']  = parseInt(slot.dataset.value, 10);
      }

      return acc;
    }, {});

  const inventoryData = {
    itemsInChest,
    equippedItems,
    discardedItems
  };

  console.log("🔍 SALVANDO INVENTÁRIO:");
  console.log("   - Itens no baú:", itemsInChest.map(i => i.id));
  console.log("   - Itens equipados:", equippedItems);

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


async function loadInventoryData(uid) {
    console.log("Configurando listener em tempo real para o inventário:", uid);

    try {
        const playerRef = doc(db, "players", uid);

        // cancela listener anterior, se existir
        if (inventoryListener) {
            inventoryListener();
        }

        inventoryListener = onSnapshot(playerRef, async (docSnap) => {
            // se não existir inventário, inicializa com padrão
            if (!docSnap.exists() || !docSnap.data().inventory) {
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

            // ADICIONA ITENS EXTRAS NOVOS
            let inventoryUpdated = false;

            for (const extraItem of extraItems) {
                // Para munição, verifica se já existe QUALQUER item de mesmo id no inventário
                if (extraItem.id === "municao-38") {
                    const existsAny = inventoryData.itemsInChest.some(item => item.id === "municao-38");
                    if (existsAny) continue;
                }
                const existsInChest = inventoryData.itemsInChest.some(item => item.uuid === extraItem.uuid);
                const isEquipped = Object.values(inventoryData.equippedItems).includes(extraItem.content);
                const wasDiscarded = inventoryData.discardedItems?.includes(extraItem.uuid);
                if (!existsInChest && !isEquipped && !wasDiscarded) {
                    console.log(`➕ ADICIONANDO NOVO ITEM EXTRA: ${extraItem.id}`);
                    inventoryData.itemsInChest.push({ ...extraItem });
                    inventoryUpdated = true;
                }
            }

            // Sempre filtra munições de 38 com quantidade <= 0
            inventoryData.itemsInChest = inventoryData.itemsInChest.filter(item => {
                if (item.id === "municao-38" && item.quantity <= 0) return false;
                return true;
            });

            if (inventoryUpdated) {
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
                console.log("Novos itens extras adicionados e munições zeradas filtradas.");
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
        newItem.dataset.uuid = item.uuid || crypto.randomUUID();

        if (item.energia) {
            newItem.dataset.energia = JSON.stringify(item.energia);
        }

        let energiaHTML = "";
        if (item.energia) {
            const porcentagem = (item.energia.total / item.energia.inicial) * 100;
            let cor = "#4CAF50";
            if (porcentagem <= 50) cor = "#FFA500";
            if (porcentagem <= 25) cor = "#FF0000";
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


if (item.consumable || item.projectile) {
    newItem.dataset.quantity = item.quantity;

    if (item.consumable) {
        newItem.dataset.consumable = 'true';
        // CORREÇÃO: Adiciona os dados de efeito e valor ao elemento
        if (item.effect) newItem.dataset.effect = item.effect;
        if (item.value) newItem.dataset.value = item.value;
    }

    if (item.projectile) {
        newItem.dataset.projectile = 'true';
    }

    // Remove qualquer contador de quantidade existente antes de adicionar o novo
    newItem.innerHTML = newItem.innerHTML.replace(/ <span class="item-quantity">\(\d+\)<\/span>/g, '');
    if (item.quantity > 0) {
        newItem.innerHTML += `<span class="item-quantity">(${item.quantity})</span>`;
    }
}


        chestElement.appendChild(newItem);
        addItemClickListener(newItem);

        // Listener para expandir descrição
        const expandToggle = newItem.querySelector('.item-expand-toggle');
        const descriptionDiv = newItem.querySelector('.item-description');
        if (expandToggle && descriptionDiv) {
            expandToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
                expandToggle.textContent = descriptionDiv.style.display === 'none' ? '+' : '-';
            });
        }
    });

    // Carrega itens equipados
    document.querySelectorAll('.slot').forEach(slot => {
        const equippedItem = inventoryData.equippedItems[slot.dataset.slot];

        if (slot.dataset.slot === "weapon" && equippedItem) {
  const allItemsArr = [...initialItems, ...extraItems];
  // Verifica se é arma de fogo
  const weaponObj = allItemsArr.find(i => i.content === equippedItem && i.ammoType);
  if (weaponObj) {
    const loadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
    slot.innerHTML = `${equippedItem} (${loadedAmmo}/${weaponObj.ammoCapacity})`;
  } else {
    // Verifica se é granada de mão
    const grenadeObj = allItemsArr.find(i => i.content === equippedItem && i.id === "granada-mao");
    if (grenadeObj) {
      // Procura a granada no inventário para pegar a quantidade
      let grenadeQuantity = 0;
      // Procura no inventário
      const invGrenade = inventoryData.itemsInChest.find(item => item.id === "granada-mao");
      if (invGrenade) {
        grenadeQuantity = invGrenade.quantity;
      } else if (inventoryData.equippedItems.weapon === "Granada de Mão" && inventoryData.equippedItems.weapon_quantity) {
        grenadeQuantity = inventoryData.equippedItems.weapon_quantity;
      } else {
        // fallback: pega do objeto base
        grenadeQuantity = grenadeObj.quantity || 0;
      }
      slot.innerHTML = `${equippedItem} (${grenadeQuantity})`;
    } else {
      slot.innerHTML = equippedItem;
    }
  }
} else {
  slot.innerHTML = equippedItem || slot.dataset.slot;
}

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
    // BUSCA EM AMBOS OS ARRAYS
    const allItemsArr = [...initialItems, ...extraItems];
    const armorData = allItemsArr.find(item => item.content === equippedArmorName);
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
    // Não atualize o campo 'dano' no Firestore aqui!
    let newDamageValue = "1"; // Valor padrão desarmado
    if (weaponSlot && weaponSlot.innerHTML !== weaponSlot.dataset.slot) {
        const equippedWeaponName = weaponSlot.innerHTML.replace(/\s*\(\d+\/\d+\)$/, "");
        const allItemsArr = [...initialItems, ...extraItems];
        const weaponData = allItemsArr.find(item => item.content === equippedWeaponName);
        if (weaponData && weaponData.damage) {
            newDamageValue = weaponData.damage;
        }
    }
    if (damageDisplay) damageDisplay.textContent = newDamageValue;
    // NÃO atualize o campo 'dano' no Firestore!
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

      // Carrega dados básicos e inicializa a ficha
      currentPlayerData = await getPlayerData(user.uid);
      if (currentPlayerData) {
        updateCharacterSheet(currentPlayerData);
        initializeGameTime(currentPlayerData);
      }

      // CONFIGURA OS DOIS LISTENERS
      await setupPlayerDataListener(user.uid);
      await loadInventoryData(user.uid);

      // ── AQUI: configurar exibição do botão "carregar munição" ──
      const carregarBtn = document.getElementById("carregar-municao-btn");
      const playerRef   = doc(db, "players", user.uid);

      getDoc(playerRef).then(playerSnap => {
        if (!playerSnap.exists()) {
          carregarBtn.style.display = "none";
          return;
        }

        const inventoryData        = playerSnap.data().inventory;
        const equippedWeaponName   = inventoryData.equippedItems.weapon;
        if (!equippedWeaponName) {
          carregarBtn.style.display = "none";
          return;
        }

        // encontra no catálogo o tipo de munição dessa arma
        const allItemsArr = [...initialItems, ...extraItems];
        const weaponData  = allItemsArr.find(item =>
          item.content === equippedWeaponName && item.ammoType
        );

        if (!weaponData) {
          carregarBtn.style.display = "none";
          return;
        }

        // verifica se há munição compatível no baú
        const temMunicao = inventoryData.itemsInChest
          .some(item => item.id === weaponData.ammoType && item.quantity > 0);

        if (temMunicao) {
          carregarBtn.style.display = "block";
          carregarBtn.onclick     = carregarMunicaoNaArma;
        } else {
          carregarBtn.style.display = "none";
        }
      });
      // ──────────────────────────────────────────────────────────────

      await loadDiceState(user.uid);

    } else {
      console.log("Nenhum usuário autenticado. Redirecionando...");
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
