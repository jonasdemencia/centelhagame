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

// Itens iniciais que o jogador deve ter (adicionando propriedade de danoo)

const initialItems = [
{ id: "bolsa-de-escriba", content: "Bolsa de escriba", description: "Uma bolsa para guardar pergaminhos e penas.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/bolsa-de-escriba.png" },
{ id: "velas", content: "Velas", description: "Fontes de luz portáteis.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/velas.png" },
{ id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, quantity: 3, effect: "heal", value: 2, description: "Um pequeno saco contendo ervas que podem curar ferimentos leves.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pequeno-saco-ervas.png" },
{ id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-menor.png" },
{ id: "pao", content: "Pão", consumable: true, quantity: 1, description: "Um pedaço de pão simples.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pao.png" },
{ id: "pao-mofado", content: "Pão Mofado", consumable: true, quantity: 20, effect: "damage", value: 5, description: "Um pedaço de pão velho e mofado. Estranhamente, parece ter um efeito... diferente.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pao-mofado.png" },
{ id: "elixir-poder", content: "Elixir do Poder Supremo", consumable: true, quantity: 5, effect: "boost_attributes", value: 100, description: "Um elixir mágico que aumenta temporariamente todos os seus atributos para 100.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/elixir-poder.png" },
//{ id: "grilo", content: "Grilo", description: "Um pequeno grilo usado como componente mágico para magias de sono.", componente: true, energia: { total: 1, inicial: 1 } }

];

// Lista de itens que podem ser adicionados dinamicamente (não iniciais)

const extraItems = [

{ id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno grilo saltitante.", componente: true, energia: { total: 1, inicial: 1 }, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/grilo.png" },
{ id: "facao", content: "Facao", uuid: "extra-facao", slot: "weapon", description: "Uma pequena lâmina afiada.", damage: "1D4", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/facao.png" },
{ id: "coberta", content: "Coberta", uuid: "extra-coberta", slot: "armor", description: "Vestes simples que oferecem pouca proteção.", defense: 2, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/coberta.png" },
{ id: "la", content: "Lã", uuid: "extra-la", description: "Fios de lã usados como componente mágico para magias de atordoamento.", componente: true, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/la.png" },
{ id: "pedaco-couro", content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira de couro endurecido para magias.", componente: true, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pedaco-couro.png" },
{ id: "municao-38", content: "Munição de 38.", uuid: "extra-municao38", quantity: 6, projectile: true, description: "Projéteis letais calíbre 38.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/municao-38.png" },
{ id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-menor.png" },
{ id: "revolver-38", content: "Revolver 38", uuid: "extra-revolver38", slot: "weapon", description: "Um revólver calibre 38.", damage: "1d8", ammoType: "municao-38", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/revolver-38.png" },
{ id: "escopeta-12", content: "Escopeta 12", uuid: "extra-escopeta12", slot: "weapon", description: "Uma espingarda calibre 12.", damage: "1d12+2", ammoType: "municao-12", ammoCapacity: 5, loadedAmmo: 0, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/escopeta-12.png" },
{ id: "municao-12", content: "Munição de 12.", uuid: "extra-municao12", quantity: 5, projectile: true, description: "Projéteis letais calíbre 12.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/municao-12.png" },
{ id: "Adaga", content: "Adaga", uuid: "extra-adaga", slot: "weapon", description: "Uma punhal afiado.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/adaga.png", thumbnailImage: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/thuadaga.png" },
{ id: "granada-mao", content: "Granada de Mão", uuid: "extra-granada-mao", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil de área (raio 3). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-mao.png" },
{ id: "granada-de-concussao", content: "Granada de Concussão", uuid: "extra-granada-de-concussao", consumable: true, quantity: 3, effect: "stun", damage: "3D4", description: "Explosivo de concussão de área (raio 2). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 2, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-de-concussao.png" },
{ id: "granada-incendiaria", content: "Granada Incendiária", uuid: "extra-granada-incendiaria", consumable: true, quantity: 3, effect: "explosion", damage: "2D6", description: "Explosivo incendiário de área (raio 3). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-incendiaria.png" },
{ id: "peitoral-de-aço", content: "Peitoral de aço", uuid: "extra-peitoral-de-aço", slot: "armor", description: "Armadura média, de peso considerável", defense: 20, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/peitoral-de-aço.png" },
{ id: "pocao-cura-completa", content: "Poção de Cura Completa", consumable: true, uuid: "extra-pocao-cura-completa", quantity: 10, effect: "heal", value: 150, description: "Uma poção que restaura uma massiva quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-completa.png" },

];

function updateItemPreview(item) {
    console.log("updateItemPreview chamada com:", item);
    
    const previewImage = document.getElementById('preview-image');
    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    
    console.log("Elementos encontrados:", previewImage, previewName, previewDescription);
    
    const allItemsArr = [...initialItems, ...extraItems];
    const itemData = allItemsArr.find(i => i.id === item.dataset.item);
    
    console.log("Item data encontrado:", itemData);
    
    if (itemData) {
        previewImage.src = itemData.image; // Sempre usa a imagem em alta resolução
        previewImage.style.display = 'block';
        previewName.textContent = itemData.content;
        previewDescription.textContent = itemData.description || 'Sem descrição disponível';
        console.log("Preview atualizado com imagem:", itemData.image);
    }
}

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

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (!playerSnap.exists()) return;

const inventoryData = playerSnap.data().inventory;

const equippedWeaponName = inventoryData.equippedItems.weapon;

if (!equippedWeaponName) return;

const allItemsArr = [...initialItems, ...extraItems];

const weaponData = allItemsArr.find(item =>

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

const ammoItem = inventoryData.itemsInChest[ammoItemIndex];

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

// Listener global para desselecionar item clicando em qualquer lugar

document.addEventListener('click', function(event) {

// Elementos que NÃO devem desselecionar o item

const keepSelection = event.target.closest('.item, .slot, #useBtn, #carregar-municao-btn, #discard-slot, .dice-item, .dice-slot');

if (!keepSelection && selectedItem) {

clearHighlights();

selectedItem = null;

toggleUseButton(false);

    // ADICIONAR ESTAS LINHAS:
        const previewImage = document.getElementById('preview-image');
        const previewName = document.getElementById('preview-name');
        const previewDescription = document.getElementById('preview-description');
        
        previewImage.style.display = 'none';
        previewName.textContent = '';
        previewDescription.textContent = '';

}

// Desselecionar dados

if (!keepSelection && selectedDice) {

clearDiceHighlights();

selectedDice = null;

}

});

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
    updateItemPreview(item);
}

// Adiciona evento de clique aos itens iniciais

const itemsContainer = document.querySelector('.items');

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

// ==================================================================
// === INÍCIO: LÓGICA DE EQUIPAR/DESEQUIPAR TOTALMENTE REFEITA =====
// ==================================================================
slots.forEach(slot => {
    slot.addEventListener('click', async () => {
        const slotType = slot.dataset.slot;
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        if (!playerSnap.exists()) return;

        const inventoryData = playerSnap.data().inventory;
        const allItemsArr = [...initialItems, ...extraItems];

        // Garante que os objetos de inventário existam
        if (!inventoryData.equippedItems) inventoryData.equippedItems = {};
        if (!inventoryData.itemsInChest) inventoryData.itemsInChest = [];
        if (!inventoryData.weaponAmmoCounts) inventoryData.weaponAmmoCounts = {};

        const currentlyEquippedName = inventoryData.equippedItems[slotType];
        const currentlyEquippedData = allItemsArr.find(i => i.content === currentlyEquippedName);

        // CASO 1: EQUIPAR UM NOVO ITEM (selectedItem existe)
        if (selectedItem) {
            const newItemData = allItemsArr.find(i => i.id === selectedItem.dataset.item);

            // Verifica se o slot é compatível
            if (newItemData && slotType === newItemData.slot) {
                console.log(`Equipando ${newItemData.content} no slot ${slotType}`);

                // A) Salvar o estado do item que está sendo desequipado (se houver)
                if (currentlyEquippedData) {
                    console.log(`Desequipando ${currentlyEquippedName} para o inventário.`);
                    // Se for uma arma, salva sua munição atual antes de mover
                    if (currentlyEquippedData.ammoType) {
                        const currentLoadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
                        inventoryData.weaponAmmoCounts[currentlyEquippedName] = currentLoadedAmmo;
                        console.log(`Salvando munição de ${currentlyEquippedName}: ${currentLoadedAmmo}`);
                    }
                    // Adiciona o item antigo de volta ao baú
                    inventoryData.itemsInChest.push({ ...currentlyEquippedData, uuid: crypto.randomUUID() });
                }

                // B) Remover o novo item do baú
                const itemInChestIndex = inventoryData.itemsInChest.findIndex(i => i.uuid === selectedItem.dataset.uuid);
                if (itemInChestIndex > -1) {
                    inventoryData.itemsInChest.splice(itemInChestIndex, 1);
                }

                // C) Colocar o novo item no slot e limpar dados antigos
                inventoryData.equippedItems[slotType] = newItemData.content;
                // Limpa todos os dados específicos de arma/consumível para evitar vazamento
                delete inventoryData.equippedItems.weapon_loadedAmmo;
                delete inventoryData.equippedItems[slotType + '_consumable'];
                delete inventoryData.equippedItems[slotType + '_quantity'];
                delete inventoryData.equippedItems[slotType + '_effect'];
                delete inventoryData.equippedItems[slotType + '_value'];

                // D) Se o novo item for uma arma de fogo, carregar sua munição específica
                if (newItemData.ammoType) {
                    const savedAmmo = inventoryData.weaponAmmoCounts[newItemData.content] || 0;
                    inventoryData.equippedItems.weapon_loadedAmmo = savedAmmo;
                    console.log(`Carregando munição de ${newItemData.content}: ${savedAmmo}`);
                }
                
                // E) Salvar tudo no Firestore
                await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

                // F) Limpar estado da UI (o onSnapshot vai redesenhar)
                selectedItem = null;
                clearHighlights();
                toggleUseButton(false);
            }
        }
        // CASO 2: DESEQUIPAR UM ITEM (sem um novo item selecionado)
        else if (currentlyEquippedData) {
            console.log(`Desequipando ${currentlyEquippedName} do slot ${slotType}`);

            // A) Salvar o estado do item (munição)
            if (currentlyEquippedData.ammoType) {
                const currentLoadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
                inventoryData.weaponAmmoCounts[currentlyEquippedName] = currentLoadedAmmo;
                console.log(`Salvando munição de ${currentlyEquippedName}: ${currentLoadedAmmo}`);
            }

            // B) Limpar o slot e todos os dados associados
            inventoryData.equippedItems[slotType] = null;
            delete inventoryData.equippedItems.weapon_loadedAmmo;
            delete inventoryData.equippedItems[slotType + '_consumable'];
            delete inventoryData.equippedItems[slotType + '_quantity'];
            delete inventoryData.equippedItems[slotType + '_effect'];
            delete inventoryData.equippedItems[slotType + '_value'];

            // C) Adicionar o item de volta ao baú
            inventoryData.itemsInChest.push({ ...currentlyEquippedData, uuid: crypto.randomUUID() });

            // D) Salvar no Firestore
            await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

            // E) Limpar estado da UI
            clearHighlights();
        }
    });
});
// ==================================================================
// === FIM: LÓGICA DE EQUIPAR/DESEQUIPAR TOTALMENTE REFEITA =======
// ==================================================================


// Adiciona funcionalidade ao botão de descarte

if (discardSlot) {

discardSlot.addEventListener("click", async () => {

console.log("Botão de descarte clicado");

if (selectedItem) {

console.log("🗑️ DESCARTANDO ITEM:");

console.log(" - ID do item:", selectedItem.dataset.item);

console.log(" - Conteúdo:", selectedItem.dataset.itemName);

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid); // ✅ ADICIONE ESTA LINHA

const playerSnap = await getDoc(playerRef);

const inventoryData = playerSnap.data().inventory;

if (!inventoryData.discardedItems) {

inventoryData.discardedItems = [];

}

// CORREÇÃO: Criar ID único para descarte baseado no elemento DOM

const uniqueDiscardId = selectedItem.dataset.uuid; // ← MUDAR ESTA LINHA

console.log(" - UUID único de descarte:", uniqueDiscardId);

inventoryData.discardedItems.push(uniqueDiscardId);

await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

console.log(" - Item adicionado à lista de descartados");

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

selectedItem.innerHTML += `<span class="item-quantity">(${quantity})</span>`;

}

if (quantity === 0) {

selectedItem.remove();

selectedItem = null;

clearHighlights();

toggleUseButton(false);

}

// Atualiza no Firestore diretamente

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (playerSnap.exists()) {

const inventoryData = playerSnap.data().inventory;

const itemIndex = inventoryData.itemsInChest.findIndex(i => i.id === selectedItem.dataset.item);

if (itemIndex !== -1) {

inventoryData.itemsInChest[itemIndex].quantity = quantity;

if (quantity <= 0) {

inventoryData.itemsInChest.splice(itemIndex, 1);

}

await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

}

}

}

}

alert("Seus atributos foram aumentados para 100!");

location.reload();

return;

}

} else if (selectedItem && selectedItem.dataset.consumable === 'true') {

const itemId = selectedItem.dataset.item;

const itemName = selectedItem.dataset.itemName; // Obtém o nome do item sem a quantidade

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

} else if (effect === "heal" && (itemName === "Pequeno saco com ervas medicinais" || itemName === "Poção de Cura Menor" || itemName === "Poção de Cura Completa")) {

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

selectedItem.innerHTML += `<span class="item-quantity">(${quantity})</span>`;

}

if (quantity === 0) {

console.log("Item consumível esgotado:", itemName);

selectedItem.remove();

selectedItem = null;

clearHighlights();

toggleUseButton(false);

}

// Atualiza no Firestore diretamente

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid);

const playerSnap = await getDoc(playerRef);

if (playerSnap.exists()) {

const inventoryData = playerSnap.data().inventory;

const itemIndex = inventoryData.itemsInChest.findIndex(i => i.id === itemId);

if (itemIndex !== -1) {

inventoryData.itemsInChest[itemIndex].quantity = quantity;

if (quantity <= 0) {

inventoryData.itemsInChest.splice(itemIndex, 1);

}

await setDoc(playerRef, { inventory: inventoryData }, { merge: true });

}

}

}

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

            if (selectedItem.dataset.consumable === 'true') {
                toggleUseButton(true);
            } else {
                toggleUseButton(false);
            }
            
            // ADICIONAR ESTA LINHA AQUI:
            updateItemPreview(item);
        }
    });
}


// Função para limpar destaques visuais

function clearHighlights() {

document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));

document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));

}

// ESTA FUNÇÃO NÃO É MAIS NECESSÁRIA, POIS O SALVAMENTO É FEITO DIRETAMENTE
// NA LÓGICA DE EQUIPAR/DESEQUIPAR. PODE SER REMOVIDA OU DEIXADA EM BRANCO.
async function saveInventoryData(uid) {
    console.log("saveInventoryData não é mais usada. O salvamento agora é direto.");
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

},
weaponAmmoCounts: {} // **NOVO** Inicializa o mapa de munição

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

console.log("--- [LOAD UI] --- Iniciando redesenho do inventário com dados do Firestore:", inventoryData);

const chestElement = document.querySelector('.items');
chestElement.innerHTML = ""; // Limpa o conteúdo atual

const allItemsArr = [...initialItems, ...extraItems];

inventoryData.itemsInChest.forEach(dbItem => {
    // Encontra os detalhes completos do item (incluindo a imagem) usando o ID do item do banco de dados.
    const fullItemData = allItemsArr.find(localItem => localItem.id === dbItem.id);

    if (!fullItemData) {
        console.warn(`[LOAD UI] Item com id "${dbItem.id}" não encontrado nos catálogos locais. Pulando.`);
        return; // Pula para o próximo item se não encontrar os detalhes.
    }

    console.log(`[LOAD UI] Processando item: ${fullItemData.content}`, fullItemData);

    const newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.dataset.item = fullItemData.id;
    newItem.dataset.uuid = dbItem.uuid || crypto.randomUUID(); // Usa o UUID do DB ou cria um novo.
    newItem.dataset.itemName = fullItemData.content;

    if (fullItemData.energia) {
        newItem.dataset.energia = JSON.stringify(fullItemData.energia);
    }

    let energiaHTML = "";
    if (fullItemData.energia) {
        const porcentagem = (fullItemData.energia.total / fullItemData.energia.inicial) * 100;
        let cor = "#4CAF50";
        if (porcentagem <= 50) cor = "#FFA500";
        if (porcentagem <= 25) cor = "#FF0000";
        energiaHTML = `
            <div class="item-energy-bar">
                <div class="item-energy-fill" style="width: ${porcentagem}%; background-color: ${cor};"></div>
                <span class="item-energy-text">${fullItemData.energia.total}/${fullItemData.energia.inicial}</span>
            </div>
        `;
    }

   let itemHTML = `
    <img src="${fullItemData.thumbnailImage || fullItemData.image}" alt="${fullItemData.content}" />
    ${energiaHTML}
`;


    if (fullItemData.consumable || fullItemData.projectile) {
        const quantity = dbItem.quantity || fullItemData.quantity;
        newItem.dataset.quantity = quantity;

        if (fullItemData.consumable) {
            newItem.dataset.consumable = 'true';
            if (fullItemData.effect) newItem.dataset.effect = fullItemData.effect;
            if (fullItemData.value) newItem.dataset.value = fullItemData.value;
        }
        if (fullItemData.projectile) {
            newItem.dataset.projectile = 'true';
        }
        if (quantity > 0) {
            itemHTML += `<span class="item-quantity">(${quantity})</span>`;
        }
    }

    newItem.innerHTML = itemHTML;
    chestElement.appendChild(newItem);
    addItemClickListener(newItem);

});


// Carrega itens equipados
document.querySelectorAll('.slot').forEach(slot => {
    const equippedItemName = inventoryData.equippedItems[slot.dataset.slot];
    const item = allItemsArr.find(i => i.content === equippedItemName);

    if (item) {
        let slotHTML = `<img src="${item.thumbnailImage || item.image}" alt="${item.content}" />`;
        slot.dataset.itemName = item.content;

        // **LÓGICA DE MUNIÇÃO CORRIGIDA**
        if (slot.dataset.slot === "weapon" && item.ammoType) {
            const loadedAmmo = inventoryData.equippedItems.weapon_loadedAmmo || 0;
            slotHTML = `<img src="${item.image}" alt="${item.content}" /> (${loadedAmmo}/${item.ammoCapacity})`;
        }
        
        slot.innerHTML = slotHTML;

        // Limpa dados antigos e define os novos se o item for consumível
        delete slot.dataset.consumable;
        delete slot.dataset.quantity;
        delete slot.dataset.effect;
        delete slot.dataset.value;

        if (inventoryData.equippedItems[slot.dataset.slot + '_consumable']) {
            slot.dataset.consumable = 'true';
            slot.dataset.quantity = inventoryData.equippedItems[slot.dataset.slot + '_quantity'];
            if (inventoryData.equippedItems[slot.dataset.slot + '_effect']) {
                slot.dataset.effect = inventoryData.equippedItems[slot.dataset.slot + '_effect'];
            }
            if (inventoryData.equippedItems[slot.dataset.slot + '_value']) {
                slot.dataset.value = inventoryData.equippedItems[slot.dataset.slot + '_value'];
            }
        }
    } else {
        slot.innerHTML = slot.dataset.slot;
        delete slot.dataset.itemName;
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

if (armorSlot && armorSlot.dataset.itemName) {

const equippedArmorName = armorSlot.dataset.itemName;

// BUSCA EM AMBOS OS ARRAYS

const allItemsArr = [...initialItems, ...extraItems];

const armorData = allItemsArr.find(item => item.content === equippedArmorName);

if (armorData && armorData.defense) {

bonusCouraca += armorData.defense;

}

}

// Verifica o item equipado no slot de botas

const bootsSlot = document.querySelector('.slot[data-slot="boots"]');

if (bootsSlot && bootsSlot.dataset.itemName) {

const equippedBootsName = bootsSlot.dataset.itemName;

const bootsData = initialItems.find(item => item.content === equippedBootsName);

if (bootsData && bootsData.defense) {

bonusCouraca += bootsData.defense;

}

}

// Verifica o item equipado no slot de escudo

const shieldSlot = document.querySelector('.slot[data-slot="shield"]');

if (shieldSlot && shieldSlot.dataset.itemName) {

const equippedShieldName = shieldSlot.dataset.itemName;

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

if (weaponSlot && weaponSlot.dataset.itemName) {

const equippedWeaponName = weaponSlot.dataset.itemName.replace(/\s*\(\d+\/\d+\)$/, "");

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

const playerRef = doc(db, "players", user.uid);

getDoc(playerRef).then(playerSnap => {

if (!playerSnap.exists()) {

carregarBtn.style.display = "none";

return;

}

const inventoryData = playerSnap.data().inventory;

let equippedWeaponName = inventoryData.equippedItems.weapon; // Alterado para let

if (!equippedWeaponName) {

carregarBtn.style.display = "none";

return;

}

// Remove o sufixo de munição para encontrar o item base

equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");

// encontra no catálogo o tipo de munição dessa arma

const allItemsArr = [...initialItems, ...extraItems];

const weaponData = allItemsArr.find(item =>

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

carregarBtn.onclick = carregarMunicaoNaArma;

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

// --- Início do Bloco de Idade Robusto ---

// Função auxiliar para gerar um número inteiro aleatório entre min e max (inclusive)

function getRandomInt(min, max) {

min = Math.ceil(min);

max = Math.floor(max);

return Math.floor(Math.random() * (max - min + 1)) + min;

}

// Verifica se a idade do jogador NÃO é um número. Isso corrige personagens com a string errada ou sem idade.

if (typeof playerData.idade !== 'number') {

let newAge = 20; // Idade padrão caso a lógica abaixo falhe

// Se a idade for uma string (como "Adepto (45-60 anos)"), tenta extrair a faixa etária

if (typeof playerData.idade === 'string') {

// Procura por um padrão como "(XX-YY anos)"

const matches = playerData.idade.match(/\((\d+)-(\d+)\s*anos\)/);

if (matches && matches.length === 3) {

const minAge = parseInt(matches[1], 10);

const maxAge = parseInt(matches[2], 10);

// Gera uma idade aleatória dentro da faixa encontrada

newAge = getRandomInt(minAge, maxAge);

}

}

// Define a idade corrigida para o personagem

playerData.idade = newAge;

// Salva a idade correta (numérica) no Firestore para não precisar fazer isso de novo

const uid = auth.currentUser?.uid;

if (uid) {

const playerRef = doc(db, "players", uid);

updateDoc(playerRef, { idade: playerData.idade });

console.log(`Idade do personagem corrigida para: ${playerData.idade}`);

}

}

// Atualiza o elemento HTML com a idade correta (agora garantido que é um número)

document.getElementById("char-idade").innerText = playerData.idade;

// --- Fim do Bloco de Idade Robusto ---

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
