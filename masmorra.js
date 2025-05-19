// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getMonsterById } from './monstros.js';

console.log("LOG: masmorra.js carregado.");

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// Inicializa o Firebase
console.log("LOG: Inicializando Firebase.");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("LOG: Firebase inicializado.");

// Variáveis globais
let currentLogBlock = null;
let playerData = null;
let userId = null;

// Constantes para o sistema de grade
const GRID_CELL_SIZE = 5; // Tamanho de cada célula da grade em unidades SVG
const GRID_COLOR = "#222"; // Cor das linhas da grade


// Dados da masmorra - Definição das salas e corredores
const dungeon = {
    name: "Ruínas de Undermountain",
    description: "Uma vasta masmorra sob a cidade de Águas Profundas.",
    entrance: "room-1",
    rooms: {
        "room-1": {
            id: "room-1",
            name: "Entrada da Masmorra",
            description: "Um corredor frio e úmido se estende à sua frente. Há uma porta de madeira ao final.",
            type: "corridor",
            exits: [
                { direction: "north", leadsTo: "room-2", type: "door", locked: false }
            ],
            visited: false,
            discovered: false,
            gridX: 10, // Coordenada X na grade (em células)
            gridY: 18, // Ajustado para ficar abaixo da room-2 sem sobreposição
            gridWidth: 1, // Alterado para 2x2
            gridHeight: 4, // Alterado para 2x2
            events: [
                { type: "first-visit", text: "O ar está frio e você sente um arrepio na espinha ao entrar neste lugar antigo." }
            ]
        },
        "room-2": {
    id: "room-2",
    name: "Sala das Estátuas",
    description: "Uma sala ampla com estátuas de guerreiros. Há portas a leste e oeste.",
    type: "room",
    exits: [
        { direction: "south", leadsTo: "room-1", type: "door", locked: false },
        { direction: "east", leadsTo: "room-3", type: "door", locked: true, keyId: "key-1" },
        { direction: "west", leadsTo: "room-4", type: "door", locked: false }
    ],
    visited: false,
    discovered: false,
    gridX: 9,
    gridY: 13,
    gridWidth: 3,
    gridHeight: 5,
    events: [
        { type: "first-visit", text: "As estátuas de pedra parecem observar seus movimentos com olhos vazios." }
    ],
    // Adicionando estados de exploração
    explorationState: {
        examined: false,
        specialStatueFound: false,
        keyFound: false
    },
    // Item que pode ser encontrado
    hiddenItems: [
        { 
            id: "key-1", 
            content: "Chave Pesada de Ferro", 
            description: "Uma chave pesada feita de ferro enferrujado. Parece antiga."
        }
    ]
},

        "room-3": {
            id: "room-3",
            name: "Câmara do Tesouro",
            description: "Uma pequena câmara com um baú no centro.",
            type: "room",
            exits: [
                { direction: "west", leadsTo: "room-2", type: "door", locked: false }
            ],
            visited: false,
            discovered: false,
            gridX: 13, // Ajustado para ficar adjacente à room-2 pelo leste, sem sobreposição
            gridY: 14, // Mesmo Y que room-2
            gridWidth: 3,
            gridHeight: 3,
            events: [
                { type: "first-visit", text: "Você vê um baú ornamentado no centro da sala, coberto por uma fina camada de poeira." }
            ],
            items: [
                { id: "gold-coins", name: "Moedas de Ouro", description: "Um punhado de moedas de ouro antigas.", quantity: 50 }
            ]
        },
        "room-4": {
            id: "room-4",
            name: "Sala de Armas",
            description: "Uma sala com armas antigas penduradas nas paredes.",
            type: "room",
            exits: [
    { direction: "east", leadsTo: "room-2", type: "door", locked: false },
    { direction: "north", leadsTo: "room-5", type: "door", locked: false },
    { direction: "west", leadsTo: "room-6", type: "door", locked: false }
],

            visited: false,
            discovered: false,
            gridX: 5, // Ajustado para ficar adjacente à room-2 pelo oeste, sem sobreposição
            gridY: 13, // Mesmo Y que room-2
            gridWidth: 3,
            gridHeight: 5,
            events: [
                { type: "first-visit", text: "Armas antigas e enferrujadas decoram as paredes. A maioria parece inútil após séculos de abandono." }
            ]
        },
        "room-6": {
    id: "room-6",
    name: "Toca do Rato",
    description: "Uma pequena sala escura e úmida. Você ouve guinchos e vê olhos vermelhos brilhando na escuridão.",
    type: "room",
    exits: [
        { direction: "east", leadsTo: "room-4", type: "door", locked: false }
    ],
    visited: false,
    discovered: false,
    gridX: 1,
    gridY: 13,
    gridWidth: 3,
    gridHeight: 3,
    events: [
        { type: "first-visit", text: "Um enorme rato mutante se aproxima, mostrando dentes afiados e prontos para atacar!" }
    ],
    enemy: {
        id: "rato-mutante",
        name: "Rato Mutante",
        description: "Um rato gigante com olhos vermelhos brilhantes e dentes afiados."
    }
},

        "room-5": {
            id: "room-5",
            name: "Câmara Ritual",
            description: "Uma sala circular com símbolos arcanos gravados no chão.",
            type: "room",
            exits: [
                { direction: "south", leadsTo: "room-4", type: "door", locked: false }
            ],
            visited: false,
            discovered: false,
            gridX: 5, // Mesmo X que room-4
            gridY: 9, // Ajustado para ficar adjacente à room-4 pelo norte, sem sobreposição
            gridWidth: 3,
            gridHeight: 3,
            events: [
                { type: "first-visit", text: "Símbolos estranhos brilham levemente no chão. Você sente uma presença antiga neste lugar." }
            ]
        }
    }
};

// Adicione isso após a definição do objeto dungeon
const decorativeBlocks = [
    // Exemplo: corredor entre sala de armas e sala de estátuas
    { type: "corridor", gridX: 8, gridY: 15, gridWidth: 1, gridHeight: 1 },
    { type: "corridor", gridX: 12, gridY: 15, gridWidth: 1, gridHeight: 1 },
    { type: "corridor", gridX: 6, gridY: 12, gridWidth: 1, gridHeight: 1 },
    { type: "corridor", gridX: 4, gridY: 15, gridWidth: 1, gridHeight: 1 },
];



// Estado do jogador na masmorra
let playerState = {
    currentRoom: "room-1",
    discoveredRooms: ["room-1"],
    visitedRooms: [],
    inventory: [],
    health: 100,
    discoveredBlocks: [] // Adicione esta linha
};


// Função para atualizar a barra de energia do jogador
function updateHealthBar() {
    const healthBar = document.getElementById("player-health-bar");
    const healthValue = document.getElementById("player-health-value");
    
    if (healthBar && healthValue) {
        if (playerData && playerData.energy) {
            // Obtém a energia atual e máxima do jogador do Firestore
            const currentEnergy = playerData.energy.total || 0;
            const maxEnergy = playerData.energy.initial || currentEnergy;
            
            // Calcula a porcentagem
            const percentage = Math.max(0, Math.min(100, (currentEnergy / maxEnergy) * 100));
            healthBar.style.width = `${percentage}%`;
            
            // Muda a cor da barra com base na saúde
            if (percentage <= 25) {
                healthBar.style.backgroundColor = "#FF0000"; // Vermelho para saúde baixa
            } else if (percentage <= 50) {
                healthBar.style.backgroundColor = "#FFA500"; // Laranja para saúde média
            } else {
                healthBar.style.backgroundColor = "#4CAF50"; // Verde para saúde alta
            }
            
            // Atualiza o texto com os valores reais
            healthValue.textContent = `${currentEnergy}/${maxEnergy}`;
            
            // Atualiza o estado do jogador para refletir a energia atual
            playerState.health = currentEnergy;
        } else {
            // Fallback para o valor de saúde do playerState
            const percentage = Math.max(0, Math.min(100, playerState.health));
            healthBar.style.width = `${percentage}%`;
            
            // Muda a cor da barra com base na saúde
            if (percentage <= 25) {
                healthBar.style.backgroundColor = "#FF0000"; // Vermelho para saúde baixa
            } else if (percentage <= 50) {
                healthBar.style.backgroundColor = "#FFA500"; // Laranja para saúde média
            } else {
                healthBar.style.backgroundColor = "#4CAF50"; // Verde para saúde alta
            }
            
            healthValue.textContent = `${playerState.health}/100`;
        }
    }
}

// Função para rolar dados (ex: "1D6", "2D4")
function rollDice(diceString) {
    console.log("LOG: rollDice chamado com:", diceString);
    const parts = diceString.toUpperCase().split('D');
    if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        // Se for apenas um número, retorna esse número
        const result = parseInt(parts[0]);
        console.log("LOG: rollDice (número único) retornando:", result);
        return result;
    } else if (parts.length === 2) {
        const numDice = parseInt(parts[0]);
        const numSides = parseInt(parts[1]);
        if (isNaN(numDice) || isNaN(numSides) || numDice <= 0 || numSides <= 0) {
            console.error("LOG: rollDice - Valores de dado inválidos:", diceString);
            return 0;
        }
        let totalRoll = 0;
        for (let i = 0; i < numDice; i++) {
            totalRoll += Math.floor(Math.random() * numSides) + 1;
        }
        console.log("LOG: rollDice (rolagem) retornando:", totalRoll);
        return totalRoll;
    } else {
        console.error("LOG: rollDice - Formato de dado inválido:", diceString);
        return 0;
    }
}

// Função para avaliar condições baseadas em estados
function evaluateCondition(condition, states) {
    if (!condition || condition === 'true') return true;
    if (condition === 'false') return false;
    
    // Substitui referências a estados por seus valores reais
    let evalString = condition.replace(/states\.(\w+)/g, (match, stateName) => {
        return states[stateName] ? 'true' : 'false';
    });
    
    // Substitui operadores lógicos por seus equivalentes em JavaScript
    evalString = evalString.replace(/&&/g, '&&').replace(/\|\|/g, '||').replace(/!/g, '!');
    
    try {
        // Avalia a expressão de forma segura
        return Function('"use strict"; return (' + evalString + ')')();
    } catch (error) {
        console.error("Erro ao avaliar condição:", condition, error);
        return false;
    }
}

// Função para aplicar efeitos definidos no JSON
async function applyEffects(effects, room) {
    if (!effects) return;
    
    // Inicializa o estado de exploração se não existir
    if (!room.explorationState) {
        room.explorationState = {};
    }
    
    // Processa cada efeito
    for (const [key, value] of Object.entries(effects)) {
        if (key.startsWith('states.')) {
            // Altera um estado
            const stateName = key.replace('states.', '');
            room.explorationState[stateName] = value;
        } else if (key === 'addExit') {
            // Adiciona uma nova saída
            if (!room.exits) room.exits = [];
            room.exits.push(value);
            // Atualiza os botões de direção
            updateDirectionButtons();
        } else if (key === 'removeItem') {
            // Remove um item do inventário do jogador
            removeItemFromInventory(value);
        } else if (key === 'unlockExit') {
            // Desbloqueia uma saída
            const exit = room.exits.find(e => e.direction === value);
            if (exit) {
                exit.locked = false;
                updateDirectionButtons();
            }
        }
    }
    
    // Salva o estado atualizado
    savePlayerState();
}

// Função para remover um item do inventário do jogador
async function removeItemFromInventory(itemId) {
    if (!userId) return false;
    
    // Primeiro remove do estado local
    playerState.inventory = playerState.inventory.filter(item => item.id !== itemId);
    
    // Depois remove do Firestore
    if (playerData && playerData.inventory && playerData.inventory.itemsInChest) {
        const playerDocRef = doc(db, "players", userId);
        const updatedChest = playerData.inventory.itemsInChest.filter(item => item.id !== itemId);
        
        await updateDoc(playerDocRef, {
            "inventory.itemsInChest": updatedChest
        });
        
        // Atualiza o playerData local
        playerData.inventory.itemsInChest = updatedChest;
    }
    
    return true;
}

// Função para processar dano ao jogador
async function applyDamageToPlayer(damageInfo) {
    if (!damageInfo || !damageInfo.amount) return;
    
    // Rola o dano
    const damage = rollDice(damageInfo.amount);
    
    // Reduz a energia do jogador
    const oldHealth = playerState.health;
    playerState.health = Math.max(0, playerState.health - damage);
    
    // Atualiza a barra de energia
    if (playerData && playerData.energy) {
        playerData.energy.total = playerState.health;
    }
    updateHealthBar();
    
    // Atualiza a energia no Firestore
    if (userId) {
        await updatePlayerEnergyInFirestore(userId, playerState.health);
    }
    
    // Mensagens de dano
    if (damageInfo.message) {
        await addLogMessage(damageInfo.message, 800);
    }
    
    await addLogMessage(`Você sofreu <strong style='color: red;'>${damage}</strong> pontos de dano!`, 1000);
    await addLogMessage(`Sua energia caiu de ${oldHealth} para ${playerState.health}.`, 800);
    
    if (playerState.health <= 0) {
        await addLogMessage("<strong style='color: darkred;'>Você está inconsciente!</strong>", 1000);
    } else if (playerState.health < 10) {
        await addLogMessage("<strong style='color: orange;'>Você está gravemente ferido!</strong>", 1000);
    }
    
    // Salva o estado do jogador
    savePlayerState();
}


// Função para atualizar a energia do jogador no Firestore
function updatePlayerEnergyInFirestore(userId, newEnergy) {
    console.log("LOG: updatePlayerEnergyInFirestore chamado com userId:", userId, "newEnergy:", newEnergy);
    const playerDocRef = doc(db, "players", userId);
    return setDoc(playerDocRef, { energy: { total: newEnergy } }, { merge: true }) // Atualiza o campo "energy.total"
        .then(() => {
            console.log("LOG: Energia do jogador atualizada na ficha:", newEnergy);
        })
        .catch((error) => {
            console.error("LOG: Erro ao atualizar a energia do jogador na ficha:", error);
        });
}

function createFightButton(enemy) {
    // Remove qualquer botão existente primeiro
    removeFightButton();
    
    // Cria o botão
    const fightButton = document.createElement('button');
    fightButton.id = 'fight-enemy-button';
    fightButton.textContent = 'Lutar!';
    fightButton.classList.add('action-btn', 'fight-btn');
    
    // Adiciona o evento de clique
    fightButton.addEventListener('click', () => {
        // Certifique-se de que o objeto enemy tem todas as propriedades necessárias
        // e com os nomes corretos antes de armazená-lo
        const monsterData = {
            id: enemy.id,
            nome: enemy.name || enemy.nome,
            descricao: enemy.description || enemy.descricao,
            imagem: enemy.image || enemy.imagem || "https://via.placeholder.com/150",
            habilidade: enemy.habilidade || 3,
            couraça: enemy.couraça || 5,
            pontosDeEnergia: enemy.pontosDeEnergia || 3,
            pontosDeEnergiaMax: enemy.pontosDeEnergiaMax || 3,
            dano: enemy.dano || "1D8",
            drops: enemy.drops || []
        };
        
        // Armazena os dados normalizados do monstro no sessionStorage
        sessionStorage.setItem('currentMonster', JSON.stringify(monsterData));
        
        // Redireciona para a página de batalha com o ID do inimigo
        window.location.href = `https://jonasdemencia.github.io/centelhagame/batalha.html?monstro=${enemy.id}`;
    });
    
    // Adiciona o botão à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(fightButton);
    }
    
    // Desabilita todos os outros botões quando há um inimigo
    disableAllButtonsExceptFight();
}

// Função para desabilitar todos os botões exceto o de lutar
function disableAllButtonsExceptFight() {
    console.log("Desabilitando todos os botões exceto o de lutar");
    
    // Força a desabilitação direta dos botões de direção
    setTimeout(() => {
        // Usa setTimeout para garantir que isso seja executado após qualquer outra função
        const northBtn = document.getElementById("go-north");
        const southBtn = document.getElementById("go-south");
        const eastBtn = document.getElementById("go-east");
        const westBtn = document.getElementById("go-west");
        
        if (northBtn) northBtn.disabled = true;
        if (southBtn) southBtn.disabled = true;
        if (eastBtn) eastBtn.disabled = true;
        if (westBtn) westBtn.disabled = true;
        
        console.log("Estado dos botões após desabilitar com timeout:");
        console.log("North:", northBtn ? northBtn.disabled : "não encontrado");
        console.log("South:", southBtn ? southBtn.disabled : "não encontrado");
        console.log("East:", eastBtn ? eastBtn.disabled : "não encontrado");
        console.log("West:", westBtn ? westBtn.disabled : "não encontrado");
    }, 0);
    
    // Desabilita botões de ação (exceto o de lutar)
    const actionButtons = document.querySelectorAll('.action-btn:not(.fight-btn)');
    actionButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Desabilita o botão de inventário
    const inventarioButton = document.getElementById("abrir-inventario");
    if (inventarioButton) {
        inventarioButton.disabled = true;
    }
    
    // Desabilita também o botão de abrir porta
    const openDoorBtn = document.getElementById("open-door");
    if (openDoorBtn) {
        openDoorBtn.disabled = true;
    }
}





// Função para reabilitar todos os botões
function enableAllButtons() {
    // Reabilita botões de ação
    const actionButtons = document.querySelectorAll('.action-btn:not(.fight-btn)');
    actionButtons.forEach(button => {
        button.disabled = false;
    });
    
    // Reabilita o botão de inventário
    const inventarioButton = document.getElementById("abrir-inventario");
    if (inventarioButton) {
        inventarioButton.disabled = false;
    }
    
    // Atualiza os botões de direção (isso vai reabilitar apenas os que devem estar habilitados)
    updateDirectionButtons();
}

// Função para remover o botão de lutar
function removeFightButton() {
    const fightButton = document.getElementById('fight-enemy-button');
    if (fightButton) {
        fightButton.remove();
    }
    
    // Reabilita os botões quando o botão de lutar é removido
    enableAllButtons();
}



// Função para iniciar um novo bloco de log
function startNewLogBlock(title) {
    const logContainer = document.getElementById("exploration-log-content");
    
    if (currentLogBlock) {
        logContainer.appendChild(currentLogBlock);
    }
    
    currentLogBlock = document.createElement('div');
    currentLogBlock.classList.add('log-block');
    
    const blockTitle = document.createElement('h4');
    blockTitle.textContent = title;
    currentLogBlock.appendChild(blockTitle);
    
    logContainer.appendChild(currentLogBlock);
    return currentLogBlock;
}

// Função para desenhar a grade de fundo
function drawGrid() {
    const mapGrid = document.getElementById("map-grid");
    mapGrid.innerHTML = '';
    
    // Desenha linhas horizontais
    for (let y = 0; y <= 20; y++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "0");
        line.setAttribute("y1", y * GRID_CELL_SIZE);
        line.setAttribute("x2", "100");
        line.setAttribute("y2", y * GRID_CELL_SIZE);
        line.setAttribute("stroke", GRID_COLOR);
        line.setAttribute("stroke-width", "0.1");
        mapGrid.appendChild(line);
    }
    
    // Desenha linhas verticais
    for (let x = 0; x <= 20; x++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x * GRID_CELL_SIZE);
        line.setAttribute("y1", "0");
        line.setAttribute("x2", x * GRID_CELL_SIZE);
        line.setAttribute("y2", "100");
        line.setAttribute("stroke", GRID_COLOR);
        line.setAttribute("stroke-width", "0.1");
        mapGrid.appendChild(line);
    }
}

// Função para adicionar um item ao inventário do jogador
async function addItemToInventory(item) {
    console.log("Adicionando ao inventário:", item);
    if (!userId) {
        console.error("Usuário não autenticado.");
        return;
    }

    const playerDocRef = doc(db, "players", userId);
    const playerSnap = await getDoc(playerDocRef);

    if (!playerSnap.exists()) {
        console.error("Documento do jogador não encontrado.");
        return;
    }

    const playerData = playerSnap.data();
    const inventory = playerData.inventory || {};
    const chest = inventory.itemsInChest || [];

    // Validação mínima
    const itemName = item.content || item.name;
    if (!itemName) {
        console.error("Item sem nome ou content detectado:", item);
        return;
    }

    // Garante que exista um ID
    const itemId = item.id || itemName.toLowerCase().replace(/\s+/g, '-');

    // Verifica se item já existe no baú
    const indexExistente = chest.findIndex(existing => existing.id === itemId);

    if (indexExistente !== -1) {
        if (item.quantity) {
            chest[indexExistente].quantity = (chest[indexExistente].quantity || 1) + item.quantity;
        }
    } else {
        const itemParaAdicionar = {
            id: itemId,
            content: itemName,
            description: item.description || ""
        };
        if (typeof item.quantity === "number") itemParaAdicionar.quantity = item.quantity;
        if (item.consumable) itemParaAdicionar.consumable = true;
        if (item.effect) itemParaAdicionar.effect = item.effect;
        if (item.value) itemParaAdicionar.value = item.value;

        chest.push(itemParaAdicionar);
    }

    console.log("Salvando inventário com:", chest);
    await updateDoc(playerDocRef, {
        "inventory.itemsInChest": chest
    });
    
    return true; // Indica sucesso
}


// Função para adicionar mensagem ao log de exploração
async function addLogMessage(message, delay = 0, typingSpeed = 30) {
    if (!currentLogBlock) {
        startNewLogBlock("Exploração");
    }
    
    return new Promise((resolve) => {
        const p = document.createElement('p');
        currentLogBlock.appendChild(p);
        let index = 0;
        const logContainer = document.getElementById("exploration-log-content");

        function typeWriter() {
            if (index < message.length) {
                if (message.charAt(index) === '<') {
                    // Se encontrar uma tag HTML, adiciona a tag completa de uma vez
                    const closeTagIndex = message.indexOf('>', index);
                    if (closeTagIndex !== -1) {
                        p.innerHTML += message.substring(index, closeTagIndex + 1);
                        index = closeTagIndex + 1;
                    } else {
                        p.innerHTML += message.charAt(index);
                        index++;
                    }
                } else {
                    p.innerHTML += message.charAt(index);
                    index++;
                }
                
                // Faz o scroll para o final após cada caractere
                logContainer.scrollTop = logContainer.scrollHeight;
                
                setTimeout(typeWriter, typingSpeed);
            } else {
                if (delay > 0) {
                    setTimeout(() => {
                        logContainer.scrollTop = logContainer.scrollHeight;
                        resolve();
                    }, delay);
                } else {
                    logContainer.scrollTop = logContainer.scrollHeight;
                    resolve();
                }
            }
        }

        if (typingSpeed > 0) {
            typeWriter();
        } else {
            p.innerHTML = message;
            logContainer.scrollTop = logContainer.scrollHeight;
            resolve();
        }
    });
}


function drawMap() {
    const mapSvg = document.getElementById("dungeon-map");
    console.log("SVG viewBox:", mapSvg.getAttribute("viewBox"));
    
    // Cria ou atualiza o elemento de exibição de coordenadas
    let coordsDisplay = document.getElementById("grid-coordinates");
    if (!coordsDisplay) {
        coordsDisplay = document.createElement("div");
        coordsDisplay.id = "grid-coordinates";
        coordsDisplay.style.position = "absolute";
        coordsDisplay.style.bottom = "10px";
        coordsDisplay.style.left = "10px";
        coordsDisplay.style.backgroundColor = "rgba(0,0,0,0.7)";
        coordsDisplay.style.color = "white";
        coordsDisplay.style.padding = "5px";
        coordsDisplay.style.borderRadius = "3px";
        coordsDisplay.style.fontSize = "12px";
        coordsDisplay.style.zIndex = "1000";
        coordsDisplay.textContent = "X: -, Y: -";
        
        // Adiciona o elemento ao container do mapa
        const mapContainer = document.querySelector(".map-container");
        if (mapContainer) {
            mapContainer.appendChild(coordsDisplay);
        }
    }
    
    // Ajusta o viewBox para garantir que todo o mapa seja visível
    mapSvg.setAttribute("viewBox", "0 0 100 120");
    
    const mapRooms = document.getElementById("map-rooms");
    const mapCorridors = document.getElementById("map-corridors");
    const mapDoors = document.getElementById("map-doors");
    const mapPlayer = document.getElementById("map-player");
    
    // Limpa os elementos existentes
    mapRooms.innerHTML = '';
    mapCorridors.innerHTML = '';
    mapDoors.innerHTML = '';
    mapPlayer.innerHTML = '';

    // Log para depuração
    console.log("Dimensões da sala room-1:", 
        dungeon.rooms["room-1"].gridWidth, 
        "x", 
        dungeon.rooms["room-1"].gridHeight);
    
    // Desenha a grade de fundo
    drawGrid();
    
// Desenha os blocos decorativos que já foram descobertos
const blocksToUse = dungeon.decorativeBlocks || decorativeBlocks;
for (const block of blocksToUse) {
    // Só desenha blocos que já foram descobertos
    if (playerState.discoveredBlocks && playerState.discoveredBlocks.some(b => 
        b.gridX === block.gridX && b.gridY === block.gridY)) {
        
        const x = block.gridX * GRID_CELL_SIZE;
        const y = block.gridY * GRID_CELL_SIZE;
        
        // Desenha as células da grade para formar o bloco
        for (let cellY = 0; cellY < (block.gridHeight || 1); cellY++) {
            for (let cellX = 0; cellX < (block.gridWidth || 1); cellX++) {
                const cellRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                cellRect.setAttribute("x", x + (cellX * GRID_CELL_SIZE));
                cellRect.setAttribute("y", y + (cellY * GRID_CELL_SIZE));
                cellRect.setAttribute("width", GRID_CELL_SIZE);
                cellRect.setAttribute("height", GRID_CELL_SIZE);
                cellRect.setAttribute("class", `room ${block.type}`);
                
                mapCorridors.appendChild(cellRect);
            }
        }
    }
}




    
    // Desenha as salas descobertas
    for (const roomId of playerState.discoveredRooms) {
        const room = dungeon.rooms[roomId];
        if (!room) continue;

        // Depuração específica para a sala 1
        if (roomId === "room-1") {
            console.log("DEPURAÇÃO SALA 1:");
            console.log("- Tipo:", room.type);
            console.log("- Dimensões:", room.gridWidth, "x", room.gridHeight);
            console.log("- Posição:", room.gridX, ",", room.gridY);
        }
        
        // Verifica se as propriedades necessárias existem
        if (room.gridX === undefined || room.gridY === undefined || 
            room.gridWidth === undefined || room.gridHeight === undefined) {
            console.error(`Sala ${roomId} tem propriedades de grade indefinidas.`);
            continue;
        }
        
        // Calcula as coordenadas reais a partir das coordenadas da grade
        const x = room.gridX * GRID_CELL_SIZE;
        const y = room.gridY * GRID_CELL_SIZE;
        
        // Cria um grupo para a sala
        const roomGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        roomGroup.setAttribute("class", `room-group ${room.type} ${playerState.visitedRooms.includes(room.id) ? 'visited' : 'discovered'}`);
        roomGroup.setAttribute("data-room-id", room.id);
        
        // Desenha as células da grade para formar a sala
        for (let cellY = 0; cellY < room.gridHeight; cellY++) {
            for (let cellX = 0; cellX < room.gridWidth; cellX++) {
                const cellRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                cellRect.setAttribute("x", x + (cellX * GRID_CELL_SIZE));
                cellRect.setAttribute("y", y + (cellY * GRID_CELL_SIZE));
                cellRect.setAttribute("width", GRID_CELL_SIZE);
                cellRect.setAttribute("height", GRID_CELL_SIZE);
                cellRect.setAttribute("class", `room ${room.type} ${playerState.visitedRooms.includes(room.id) ? 'visited' : 'discovered'}`);
                
                // Depuração para a sala 1
                if (roomId === "room-1") {
                    cellRect.setAttribute("data-debug", `cell-${cellX}-${cellY}`);
                    console.log(`Célula (${cellX},${cellY}) desenhada em (${x + (cellX * GRID_CELL_SIZE)},${y + (cellY * GRID_CELL_SIZE)})`);
                }
                
                roomGroup.appendChild(cellRect);
            }
        }
        
        // Adiciona o grupo ao mapa apropriado
        if (room.type === "corridor") {
            mapCorridors.appendChild(roomGroup);
        } else {
            mapRooms.appendChild(roomGroup);
        }
        
        // Desenha as portas
        if (room.exits) {
            room.exits.forEach(exit => {
                // Só desenha a porta se a sala de destino também estiver descoberta
                        if (roomId === playerState.currentRoom || playerState.discoveredRooms.includes(exit.leadsTo)) {

                    if (exit.type === "door") {
                        const width = room.gridWidth * GRID_CELL_SIZE;
                        const height = room.gridHeight * GRID_CELL_SIZE;
                        let doorX = x + (width / 2);
                        let doorY = y + (height / 2);
                        let doorWidth = GRID_CELL_SIZE * 0.8;
                        let doorHeight = GRID_CELL_SIZE * 0.8;
                        
                        // Obtém a sala de destino
                        const destRoom = dungeon.rooms[exit.leadsTo];
                        
                        // Ajusta a posição da porta com base na direção
                        switch (exit.direction) {
                            case "north":
                                // Porta no meio da parede norte
                                doorWidth = GRID_CELL_SIZE * 0.8;  // <-- Define a largura para portas norte
                                doorHeight = GRID_CELL_SIZE * 0.4; // <-- Define a altura para portas norte
                                doorX = x + (width / 2) - (doorWidth / 2);
                                doorY = y - (doorHeight / 2);
                                break;
                            case "south":
                                // Porta no meio da parede sul
                                doorWidth = GRID_CELL_SIZE * 0.8;  // <-- Define a largura para portas sul
                                doorHeight = GRID_CELL_SIZE * 0.4; // <-- Define a altura para portas sul
                                doorX = x + (width / 2) - (doorWidth / 2);
                                doorY = y + height - (doorHeight / 2);
                                break;
                            case "east":
                                // Porta no meio da parede leste
                                doorWidth = GRID_CELL_SIZE * 0.4;  // <-- Define a largura para portas leste
                                doorHeight = GRID_CELL_SIZE * 0.8; // <-- Define a altura para portas leste
                                doorX = x + width - (doorWidth / 2);
                                doorY = y + (height / 2) - (doorHeight / 2);
                                break;
                            case "west":
                                // Porta no meio da parede oeste
                                doorWidth = GRID_CELL_SIZE * 0.4;  // <-- Define a largura para portas oeste
                                doorHeight = GRID_CELL_SIZE * 0.8; // <-- Define a altura para portas oeste
                                doorX = x - (doorWidth / 2);
                                doorY = y + (height / 2) - (doorHeight / 2);
                                break;
                        }
                        
                        const doorElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        doorElement.setAttribute("x", doorX);
                        doorElement.setAttribute("y", doorY);
                        doorElement.setAttribute("width", doorWidth);
                        doorElement.setAttribute("height", doorHeight);
                        doorElement.setAttribute("class", `door ${exit.locked ? 'locked' : ''}`);
                        doorElement.setAttribute("data-exit-to", exit.leadsTo);
                        
                        mapDoors.appendChild(doorElement);
                    }
                }
            });
        }
    }
    
    // Desenha o marcador do jogador
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (currentRoom) {
        // Calcula o centro da sala atual
        const centerX = (currentRoom.gridX * GRID_CELL_SIZE) + (currentRoom.gridWidth * GRID_CELL_SIZE / 2);
        const centerY = (currentRoom.gridY * GRID_CELL_SIZE) + (currentRoom.gridHeight * GRID_CELL_SIZE / 2);
        
        // Cria um grupo para o marcador do jogador
        const playerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Cria o círculo do marcador
        const playerMarker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        playerMarker.setAttribute("cx", centerX);
        playerMarker.setAttribute("cy", centerY);
        playerMarker.setAttribute("r", GRID_CELL_SIZE * 0.3);
        playerMarker.setAttribute("fill", "#f1c40f");
        playerMarker.setAttribute("stroke", "#f39c12");
        playerMarker.setAttribute("stroke-width", "0.5");
        
        // Cria a animação de opacidade (mais intensa)
        const animateOpacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animateOpacity.setAttribute("attributeName", "opacity");
        animateOpacity.setAttribute("values", "0.5;1;0.5"); // Maior contraste
        animateOpacity.setAttribute("dur", "1.5s"); // Mais rápido
        animateOpacity.setAttribute("repeatCount", "indefinite");
        
        // Cria a animação de escala (para pulsar)
        const animateRadius = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animateRadius.setAttribute("attributeName", "r");
        animateRadius.setAttribute("values", `${GRID_CELL_SIZE * 0.2};${GRID_CELL_SIZE * 0.4};${GRID_CELL_SIZE * 0.2}`); // Pulsa entre 0.2 e 0.4
        animateRadius.setAttribute("dur", "1.5s"); // Mesma duração que a opacidade
        animateRadius.setAttribute("repeatCount", "indefinite");
        
        // Adiciona as animações ao marcador
        playerMarker.appendChild(animateOpacity);
        playerMarker.appendChild(animateRadius);
        
        // Adiciona o marcador ao grupo
        playerGroup.appendChild(playerMarker);
        
        // Adiciona o grupo ao mapa
        mapPlayer.appendChild(playerGroup);
    }
    
    // Adiciona eventos para mostrar coordenadas e copiar ao clicar
    function svgToGridCoords(svgX, svgY) {
        // Obtém o viewBox do SVG
        const viewBox = mapSvg.viewBox.baseVal;
        
        // Obtém as dimensões do elemento SVG
        const rect = mapSvg.getBoundingClientRect();
        
        // Calcula a escala entre o viewBox e o tamanho real do elemento
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;
        
        // Converte as coordenadas do mouse para coordenadas SVG
        const svgRealX = (svgX - rect.left) * scaleX + viewBox.x;
        const svgRealY = (svgY - rect.top) * scaleY + viewBox.y;
        
        // Converte para coordenadas da grade
        const gridX = Math.floor(svgRealX / GRID_CELL_SIZE);
        const gridY = Math.floor(svgRealY / GRID_CELL_SIZE);
        
        return { gridX, gridY };
    }
    
    // Adiciona evento de mousemove ao SVG
    mapSvg.addEventListener("mousemove", (event) => {
        const { gridX, gridY } = svgToGridCoords(event.clientX, event.clientY);
        coordsDisplay.textContent = `X: ${gridX}, Y: ${gridY}`;
    });
    
    // Esconde as coordenadas quando o mouse sai do SVG
    mapSvg.addEventListener("mouseout", () => {
        coordsDisplay.textContent = "X: -, Y: -";
    });
    
    // Adiciona evento de clique para copiar as coordenadas
    mapSvg.addEventListener("click", (event) => {
        const { gridX, gridY } = svgToGridCoords(event.clientX, event.clientY);
        
        // Cria uma string formatada para o bloco decorativo
        const blockCode = `{ type: "corridor", gridX: ${gridX}, gridY: ${gridY}, gridWidth: 1, gridHeight: 1 },`;
        
        // Copia para a área de transferência
        navigator.clipboard.writeText(blockCode).then(() => {
            // Mostra uma mensagem temporária
            const oldText = coordsDisplay.textContent;
            coordsDisplay.textContent = "Copiado!";
            setTimeout(() => {
                coordsDisplay.textContent = oldText;
            }, 1000);
        });
        
        console.log(`Coordenadas clicadas: X=${gridX}, Y=${gridY}`);
        console.log(`Código do bloco: ${blockCode}`);
    });
}



// Função para atualizar os botões de direção
function updateDirectionButtons() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom || !currentRoom.exits) return;
    
    // Obtém os botões de direção
    const northBtn = document.getElementById("go-north");
    const southBtn = document.getElementById("go-south");
    const eastBtn = document.getElementById("go-east");
    const westBtn = document.getElementById("go-west");
    
    // Desabilita todos os botões primeiro
    northBtn.disabled = true;
    southBtn.disabled = true;
    eastBtn.disabled = true;
    westBtn.disabled = true;
    
    // Habilita os botões com base nas saídas disponíveis
    currentRoom.exits.forEach(exit => {
        let button;
        switch (exit.direction) {
            case "north": button = northBtn; break;
            case "south": button = southBtn; break;
            case "east": button = eastBtn; break;
            case "west": button = westBtn; break;
        }
        
        if (button) {
            if (exit.locked) {
                button.disabled = true;
                button.textContent = `${exit.direction.charAt(0).toUpperCase() + exit.direction.slice(1)} (Trancado)`;
            } else {
                button.disabled = false;
                button.textContent = exit.direction.charAt(0).toUpperCase() + exit.direction.slice(1);
                button.dataset.leadsTo = exit.leadsTo;
            }
        }
    });
}

// Modifique a função examineRoom para verificar a qual masmorra a sala pertence
async function examineRoom() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom) return;
    
    startNewLogBlock("Examinar");
    
    // Verifica se a sala tem configurações de exploração
    if (currentRoom.exploration && currentRoom.exploration.examine) {
        // Inicializa o estado de exploração se não existir
        if (!currentRoom.explorationState) {
            if (currentRoom.exploration.states && currentRoom.exploration.states.initial) {
                currentRoom.explorationState = { ...currentRoom.exploration.states.initial };
            } else {
                currentRoom.explorationState = {};
            }
        }
        
        // Procura por um evento de exame que corresponda ao estado atual
        for (const examineEvent of currentRoom.exploration.examine) {
            if (evaluateCondition(examineEvent.condition, currentRoom.explorationState)) {
                await addLogMessage(examineEvent.text, 1000);
                
                // Aplica efeitos, se houver
                if (examineEvent.effect) {
                    await applyEffects(examineEvent.effect, currentRoom);
                }
                
                // Processa pontos de interesse
                if (examineEvent.pointsOfInterest && examineEvent.pointsOfInterest.length > 0) {
                    console.log("Pontos de interesse encontrados:", examineEvent.pointsOfInterest);
                    createPointsOfInterestButtons(examineEvent.pointsOfInterest, currentRoom);
                } else {
                    console.log("Nenhum ponto de interesse encontrado no evento de exame");
                }
                
                // Salva o estado atualizado
                savePlayerState();
                return;
            }
        }
    }
    
    // Caso especial para a Sala das Estátuas (compatibilidade com código antigo)
    // Verifica se estamos na masmorra "Ruínas de Undermountain" e na sala "room-2"
    if (dungeon.name === "Ruínas de Undermountain" && currentRoom.id === "room-2" && currentRoom.explorationState) {
        // Primeira vez que examina a sala
        if (!currentRoom.explorationState.examined) {
            await addLogMessage(`Você examina a ${currentRoom.name} com cuidado.`, 500);
            await addLogMessage("A sala tem um teto alto e paredes de pedra antiga. O chão está coberto por uma fina camada de poeira. Há uma estátua que parece diferente das demais.", 1000);
            
            currentRoom.explorationState.examined = true;
            savePlayerState(); // Salva o estado atualizado
            return;
        }
        
        // Segunda vez que examina a sala (após já ter examinado uma vez)
        if (currentRoom.explorationState.examined && !currentRoom.explorationState.specialStatueFound) {
            await addLogMessage("A estátua diferente é a de uma criança elfo, feita de marfim, tampando com as mãos o rosto. No seu ombro direito, há um pequeno alforge de couro pendurado.", 1000);
            
            currentRoom.explorationState.specialStatueFound = true;
            savePlayerState(); // Salva o estado atualizado
            return;
        }
        
        // Se já encontrou a estátua especial
        if (currentRoom.explorationState.specialStatueFound) {
            await addLogMessage("Você já examinou esta sala minuciosamente e encontrou a estátua diferente.", 800);
            return;
        }
    }
    
    // Comportamento padrão para outras salas
    await addLogMessage(`Você examina a ${currentRoom.name} com cuidado.`, 500);
    
    // Descrição detalhada com base no tipo de sala
    let detailedDescription = "";
    switch (currentRoom.type) {
        case "corridor":
            detailedDescription = "O corredor é estreito e úmido. Gotas de água escorrem pelas paredes de pedra.";
            break;
        case "room":
            detailedDescription = "A sala tem um teto alto e paredes de pedra antiga. O chão está coberto por uma fina camada de poeira.";
            break;
        default:
            detailedDescription = "Você não nota nada de especial.";
    }
    
    await addLogMessage(detailedDescription, 1000);
    
    // Verifica se há itens na sala
    if (currentRoom.items && currentRoom.items.length > 0) {
        await addLogMessage("Você encontra algo interessante:", 800);
        for (const item of currentRoom.items) {
            await addLogMessage(`- ${item.name || item.content}: ${item.description}`, 500);
        }
    }
}




// Função para criar o botão de recolher item
function createCollectButton(item) {
    // Remove qualquer botão existente primeiro
    removeCollectButton();
    
    // Remove também os botões de interação para evitar que reapareçam
    removeInteractionButtons();
    
    // Cria o botão
    const collectButton = document.createElement('button');
    collectButton.id = 'collect-item-button';
    collectButton.textContent = 'Recolher Item';
    collectButton.classList.add('action-btn', 'collect-btn');
    
    // Adiciona o evento de clique
    collectButton.addEventListener('click', async () => {
        // Adiciona o item ao inventário
        const success = await addItemToInventory(item);
        
        if (success) {
            // Marca o item como coletado
            const currentRoom = dungeon.rooms[playerState.currentRoom];
            if (currentRoom && currentRoom.id === "room-2") {
                currentRoom.explorationState.keyCollected = true;
                savePlayerState();
            }
            
            // Adiciona mensagem ao log
            startNewLogBlock("Item Recolhido");
            await addLogMessage(`Você recolheu: ${item.content}`, 800);
            
            // Remove o botão
            removeCollectButton();
        }
    });
    
    // Adiciona o botão à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(collectButton);
    }
    
    // Adiciona eventos para remover o botão quando outros botões são clicados
    const allButtons = document.querySelectorAll('.direction-btn, .action-btn:not(.collect-btn)');
    allButtons.forEach(button => {
        button.addEventListener('click', removeCollectButton);
    });
}


// Função para remover o botão de recolher item
function removeCollectButton() {
    const collectButton = document.getElementById('collect-item-button');
    if (collectButton) {
        collectButton.remove();
    }
}

// Função para criar botões de pontos de interesse
function createPointsOfInterestButtons(pointsOfInterest, room) {
    console.log("Criando botões de pontos de interesse:", pointsOfInterest);
    
    // Remove botões existentes primeiro
    removePointsOfInterestButtons();
    
    // Verifica se há pontos de interesse
    if (!pointsOfInterest || pointsOfInterest.length === 0) {
        console.log("Nenhum ponto de interesse para mostrar");
        return;
    }
    
    // Inicializa o estado de exploração se não existir
    if (!room.explorationState) {
        if (room.exploration && room.exploration.states && room.exploration.states.initial) {
            room.explorationState = { ...room.exploration.states.initial };
        } else {
            room.explorationState = {};
        }
    }
    
    // Cria um container para os botões
    const poiContainer = document.createElement('div');
    poiContainer.id = 'points-of-interest-buttons';
    poiContainer.classList.add('points-of-interest-buttons');
    
    // Adiciona um título
    const poiTitle = document.createElement('p');
    poiTitle.textContent = 'O que você deseja examinar?';
    poiTitle.classList.add('poi-title');
    poiContainer.appendChild(poiTitle);
    
    // Cria botões para cada ponto de interesse
    for (const poi of pointsOfInterest) {
        // Verifica se o ponto de interesse tem uma condição e se ela é atendida
        if (poi.condition && !evaluateCondition(poi.condition, room.explorationState)) {
            continue; // Pula este ponto de interesse se a condição não for atendida
        }
        
        const poiBtn = document.createElement('button');
        poiBtn.textContent = poi.name;
        poiBtn.classList.add('poi-btn');
        poiBtn.dataset.poiId = poi.id;
        
        // Adiciona o evento de clique
        poiBtn.addEventListener('click', async () => {
            await handlePointOfInterestClick(poi, room);
        });
        
        poiContainer.appendChild(poiBtn);
    }
    
    // No final da função createPointsOfInterestButtons
const actionButtons = document.getElementById('action-buttons');
if (actionButtons) {
    console.log("Adicionando container de pontos de interesse ao DOM");
    actionButtons.appendChild(poiContainer);
} else {
    console.error("Elemento 'action-buttons' não encontrado!");
}

}

// Função para remover botões de pontos de interesse
function removePointsOfInterestButtons() {
    const poiButtons = document.getElementById('points-of-interest-buttons');
    if (poiButtons) {
        poiButtons.remove();
    }
}

// Função para lidar com o clique em um ponto de interesse
async function handlePointOfInterestClick(poi, room) {
    // Remove botões de interação existentes primeiro
    removeInteractionButtons();
    
    // Adiciona a descrição do ponto de interesse ao log
    startNewLogBlock(`Examinar ${poi.name}`);
    await addLogMessage(poi.description, 1000);
    
    // Aplica efeitos, se houver
    if (poi.effect) {
        await applyEffects(poi.effect, room);
    }
    
    // Verifica se há testes de atributos associados
    if (poi.luckTest || poi.skillTest || poi.charismaTest) {
        await handleAttributeTestEvent(poi, room);
    } else {
        // Verifica se há itens para coletar
        if (poi.items && poi.items.length > 0) {
            createCollectButton(poi.items[0]);
        }
    }
    
    // Salva o estado
    savePlayerState();
    
    // Cria botões de interação específicos para este ponto de interesse
    createInteractionButtons(room, poi.id);
    
    // Opcionalmente, podemos atualizar os botões para refletir mudanças de estado
    const poiButtons = document.querySelectorAll('.poi-btn');
    poiButtons.forEach(button => {
        if (button.dataset.poiId === poi.id) {
            button.classList.add('examined');
        }
    });
}








// Função para criar botões de interação
function createInteractionButtons(room, poiId) {
    // Remove botões de interação existentes
    removeInteractionButtons();
    
    // Verifica se a sala tem interações definidas
    if (!room.exploration || !room.exploration.interactions) return;
    
    // Inicializa o estado de exploração se não existir
    if (!room.explorationState) {
        if (room.exploration.states && room.exploration.states.initial) {
            room.explorationState = { ...room.exploration.states.initial };
        } else {
            room.explorationState = {};
        }
    }
    
    // Encontra a interação apropriada com base no ponto de interesse
    let activeInteraction = null;
    
    for (const interaction of room.exploration.interactions) {
        // Verifica se a condição é atendida
        if (evaluateCondition(interaction.condition, room.explorationState)) {
            // Mapeia pontos de interesse para interações específicas
            if (poiId === 'pilares' && interaction.id === 'teste-sorte-pilar') {
                activeInteraction = interaction;
                break;
            } else if (poiId === 'piso' && interaction.id === 'mecanismo-antigo') {
                activeInteraction = interaction;
                break;
            } else if (poiId === 'estatua' && interaction.id === 'teste-carisma') {
                activeInteraction = interaction;
                break;
            } else if (!poiId) {
                // Se não houver poiId, usa a primeira interação válida (comportamento original)
                activeInteraction = interaction;
                break;
            }
        }
    }
    
    // Se não encontrou nenhuma interação válida, retorna
    if (!activeInteraction) return;
    
    // Cria o container para o botão de interação
    const interactionsContainer = document.createElement('div');
    interactionsContainer.id = 'interaction-buttons';
    interactionsContainer.classList.add('interaction-buttons');
    
    // Cria o botão apropriado com base na ação da interação
    if (activeInteraction.result.action === "testLuck") {
        const luckBtn = document.createElement('button');
        luckBtn.textContent = 'Testar Sorte';
        luckBtn.classList.add('action-btn', 'interaction-btn', 'test-luck-btn');
        luckBtn.addEventListener('click', () => startLuckTest({
            description: activeInteraction.result.luckTest.description,
            room: room,
            success: activeInteraction.result.luckTest.success,
            failure: activeInteraction.result.luckTest.failure
        }));
        interactionsContainer.appendChild(luckBtn);
    } 
    else if (activeInteraction.result.action === "testSkill") {
        const skillBtn = document.createElement('button');
        skillBtn.textContent = 'Testar Habilidade';
        skillBtn.classList.add('action-btn', 'interaction-btn', 'test-skill-btn');
        skillBtn.addEventListener('click', async () => {
            await addLogMessage(activeInteraction.result.skillTest.description, 800);
            const result = await testSkill(activeInteraction.result.skillTest.difficulty);
            
            if (result) {
                await addLogMessage(activeInteraction.result.skillTest.success.text, 800);
                if (activeInteraction.result.skillTest.success.effect) {
                    await applyEffects(activeInteraction.result.skillTest.success.effect, room);
                }
                if (activeInteraction.result.skillTest.success.items && 
                    activeInteraction.result.skillTest.success.items.length > 0) {
                    createCollectButton(activeInteraction.result.skillTest.success.items[0]);
                }
            } else {
                await addLogMessage(activeInteraction.result.skillTest.failure.text, 800);
                if (activeInteraction.result.skillTest.failure.effect) {
                    await applyEffects(activeInteraction.result.skillTest.failure.effect, room);
                }
                if (activeInteraction.result.skillTest.failure.damage) {
                    await applyDamageToPlayer(activeInteraction.result.skillTest.failure.damage);
                }
            }
            
            createInteractionButtons(room, null);
        });
        interactionsContainer.appendChild(skillBtn);
    } 
    else if (activeInteraction.result.action === "testCharisma") {
        const charismaBtn = document.createElement('button');
        charismaBtn.textContent = 'Testar Carisma';
        charismaBtn.classList.add('action-btn', 'interaction-btn', 'test-charisma-btn');
        charismaBtn.addEventListener('click', async () => {
            await addLogMessage(activeInteraction.result.charismaTest.description, 800);
            const result = await testCharisma(activeInteraction.result.charismaTest.difficulty);
            
            if (result) {
                await addLogMessage(activeInteraction.result.charismaTest.success.text, 800);
                if (activeInteraction.result.charismaTest.success.effect) {
                    await applyEffects(activeInteraction.result.charismaTest.success.effect, room);
                }
                if (activeInteraction.result.charismaTest.success.items && 
                    activeInteraction.result.charismaTest.success.items.length > 0) {
                    createCollectButton(activeInteraction.result.charismaTest.success.items[0]);
                }
            } else {
                await addLogMessage(activeInteraction.result.charismaTest.failure.text, 800);
                if (activeInteraction.result.charismaTest.failure.effect) {
                    await applyEffects(activeInteraction.result.charismaTest.failure.effect, room);
                }
                if (activeInteraction.result.charismaTest.failure.damage) {
                    await applyDamageToPlayer(activeInteraction.result.charismaTest.failure.damage);
                }
            }
            
            createInteractionButtons(room, null);
        });
        interactionsContainer.appendChild(charismaBtn);
    }
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(interactionsContainer);
    }
}




// Função para remover botões de interação
function removeInteractionButtons() {
    const interactionButtons = document.getElementById('interaction-buttons');
    if (interactionButtons) {
        interactionButtons.remove();
    }
}

// Função para lidar com interações
async function handleInteraction(interaction, room) {
    startNewLogBlock(interaction.name);
    
    // Exibe o resultado da interação
    await addLogMessage(interaction.result.text, 1000);
    
    // Aplica efeitos, se houver
    if (interaction.result.effect) {
        await applyEffects(interaction.result.effect, room);
    }
    
    // Atualiza os botões de interação
    createInteractionButtons(room, null);
    
    // Atualiza os botões de direção (caso uma nova saída tenha sido adicionada)
    updateDirectionButtons();
    
    // Atualiza o mapa
    drawMap();
    
    // Salva o estado
    savePlayerState();
}


// Função para carregar uma masmorra a partir de um arquivo JSON
async function loadDungeonFromJSON(dungeonId) {
    try {
        console.log(`LOG: Carregando masmorra ${dungeonId} de arquivo JSON...`);
        
        // Caminho para o arquivo JSON da masmorra
        const dungeonPath = `./dungeons/${dungeonId}.json`;
        
        // Carrega o arquivo JSON
        const response = await fetch(dungeonPath);
        if (!response.ok) {
            throw new Error(`Erro ao carregar masmorra: ${response.status} ${response.statusText}`);
        }
        
        // Tenta converter o JSON para objeto com tratamento de erro
        try {
            const dungeonData = await response.json();
            console.log(`LOG: Masmorra ${dungeonId} carregada com sucesso!`);
            return dungeonData;
        } catch (jsonError) {
            console.error(`LOG: Erro ao analisar JSON da masmorra ${dungeonId}:`, jsonError);
            throw jsonError;
        }
    } catch (error) {
        console.error(`LOG: Erro ao carregar masmorra ${dungeonId}:`, error);
        
        // Em caso de erro, retorna uma cópia da masmorra padrão
        console.log("LOG: Usando masmorra padrão como fallback.");
        return JSON.parse(JSON.stringify(dungeon));
    }
}


// Função para inicializar a masmorra
// Função para inicializar a masmorra (versão atualizada)
async function initializeDungeon(dungeonId = null) {
    let currentDungeon;
    
    // Se um ID de masmorra foi especificado, tenta carregar do JSON
    if (dungeonId) {
        currentDungeon = await loadDungeonFromJSON(dungeonId);
    } else {
        // Caso contrário, usa a masmorra padrão definida no código
        currentDungeon = dungeon;
    }
    
    // Inicializa os estados de exploração para todas as salas
    if (currentDungeon.rooms) {
        for (const roomId in currentDungeon.rooms) {
            const room = currentDungeon.rooms[roomId];
            if (room.exploration && room.exploration.states && room.exploration.states.initial) {
                room.explorationState = { ...room.exploration.states.initial };
            }
        }
    }
    
    // Atualiza a variável global dungeon com os dados carregados
    // Isso mantém a compatibilidade com o código existente
    Object.assign(dungeon, currentDungeon);
    
    console.log("LOG: Masmorra inicializada:", dungeon.name);
    
    // Retorna a masmorra inicializada
    return dungeon;
}


// Função para listar masmorras disponíveis
async function listAvailableDungeons() {
    try {
        // Carrega o índice de masmorras disponíveis
        const response = await fetch('./dungeons/index.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar índice de masmorras: ${response.status} ${response.statusText}`);
        }
        
        // Converte o JSON para objeto
        const dungeonIndex = await response.json();
        console.log("LOG: Masmorras disponíveis:", dungeonIndex);
        
        return dungeonIndex;
    } catch (error) {
        console.error("LOG: Erro ao listar masmorras disponíveis:", error);
        return [];
    }
}

// Função para criar um seletor de masmorras
function createDungeonSelector(dungeons, currentDungeonId) {
    // Cria um elemento select
    const selector = document.createElement('select');
    selector.id = 'dungeon-selector';
    selector.classList.add('dungeon-selector');
    
    // Adiciona as opções
    dungeons.forEach(dungeon => {
        const option = document.createElement('option');
        option.value = dungeon.id;
        option.textContent = dungeon.name;
        option.selected = dungeon.id === currentDungeonId;
        selector.appendChild(option);
    });
    
    // Adiciona o evento de mudança
    selector.addEventListener('change', async (event) => {
        const newDungeonId = event.target.value;
        console.log(`LOG: Mudando para masmorra ${newDungeonId}`);
        
        // Confirma com o usuário
        if (confirm(`Deseja realmente mudar para a masmorra "${dungeons.find(d => d.id === newDungeonId).name}"? Seu progresso atual será salvo.`)) {
            // Salva o estado atual
            savePlayerState();
            
           // Redefine o estado do jogador para a nova masmorra
// Redefine o estado do jogador para a nova masmorra
playerState = {
    currentRoom: "room-1",
    discoveredRooms: ["room-1"],
    visitedRooms: [],
    inventory: playerState.inventory, // Mantém o inventário
    health: playerState.health, // Mantém a saúde
    attributes: playerState.attributes, // Mantém os atributos
    discoveredBlocks: [] // Inicializa como array vazio
};


            
            // Carrega a nova masmorra
            await initializeDungeon(newDungeonId);
            
            // Atualiza a interface
            startNewLogBlock("Mudança de Masmorra");
            await addLogMessage(`Você entrou em ${dungeon.name}!`, 500);
            await addLogMessage(dungeon.description, 1000);
            
            // Move para a sala inicial
            moveToRoom(dungeon.entrance);
        } else {
            // Restaura a seleção anterior
            selector.value = currentDungeonId;
        }
    });
    
    return selector;
}


// Modifique a função searchRoom para verificar a qual masmorra a sala pertence
async function searchRoom() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom) return;
    
    startNewLogBlock("Procurar");
    
    // Verifica se a sala tem configurações de exploração
    if (currentRoom.exploration && currentRoom.exploration.search) {
        // Inicializa o estado de exploração se não existir
        if (!currentRoom.explorationState) {
            if (currentRoom.exploration.states && currentRoom.exploration.states.initial) {
                currentRoom.explorationState = { ...currentRoom.exploration.states.initial };
            } else {
                currentRoom.explorationState = {};
            }
        }
        
        // Procura por um evento de busca que corresponda ao estado atual
        for (const searchEvent of currentRoom.exploration.search) {
            if (evaluateCondition(searchEvent.condition, currentRoom.explorationState)) {
                // Verifica se há uma chance de encontrar algo
                const chance = searchEvent.chance || 1.0;
                if (Math.random() <= chance) {
                    // Verifica se o evento tem testes de atributos associados
                    if (searchEvent.luckTest || searchEvent.skillTest || searchEvent.charismaTest) {
                        await handleAttributeTestEvent(searchEvent, currentRoom);
                        savePlayerState();
                        return;
                    }
                    
                    // Código existente para processar o evento normal
                    await addLogMessage(searchEvent.text, 1000);
                    
                    // Aplica efeitos, se houver
                    if (searchEvent.effect) {
                        await applyEffects(searchEvent.effect, currentRoom);
                    }
                    
                    // Processa dano, se houver
                    if (searchEvent.damage) {
                        await applyDamageToPlayer(searchEvent.damage);
                    }
                    
                    // Cria botões para itens encontrados
                    if (searchEvent.items && searchEvent.items.length > 0) {
                        createCollectButton(searchEvent.items[0]);
                    }
                    
                    // Só processa o primeiro evento que corresponder
                    savePlayerState();
                    return;
                }
            }
        }
    }
    
    // Caso especial para a Sala das Estátuas (compatibilidade com código antigo)
    if (dungeon.name === "Ruínas de Undermountain" && currentRoom.id === "room-2" && 
        currentRoom.explorationState && 
        currentRoom.explorationState.specialStatueFound && 
        !currentRoom.explorationState.keyFound) {
        
        await addLogMessage("Você procura cuidadosamente no alforge da estátua...", 1000);
        await addLogMessage("Você encontra uma chave pesada de ferro!", 800);
        
        // Marca a chave como encontrada
        currentRoom.explorationState.keyFound = true;
        
        // Cria o botão para recolher o item
        const keyItem = {
            id: "key-1", 
            content: "Chave Pesada de Ferro", 
            description: "Uma chave pesada feita de ferro enferrujado. Parece antiga."
        };
        createCollectButton(keyItem);
        
        savePlayerState(); // Salva o estado atualizado
        return;
    }
    
    // Se já encontrou a chave mas não recolheu
    if (dungeon.name === "Ruínas de Undermountain" && currentRoom.id === "room-2" && 
        currentRoom.explorationState && 
        currentRoom.explorationState.keyFound && 
        !currentRoom.explorationState.keyCollected) {
        
        await addLogMessage("Você já encontrou uma chave pesada de ferro aqui.", 800);
        
        // Recria o botão para recolher o item caso tenha sido removido
        const keyItem = {
            id: "key-1", 
            content: "Chave Pesada de Ferro", 
            description: "Uma chave pesada feita de ferro enferrujado. Parece antiga."
        };
        createCollectButton(keyItem);
        return;
    }
    
    // Verifica se é a sala 5 (Câmara Ritual) para acionar a armadilha
    if (dungeon.name === "Ruínas de Undermountain" && currentRoom.id === "room-5") {
        // Armadilha de flecha!
        await addLogMessage("<strong style='color: red;'>CLIQUE!</strong> Você acionou uma armadilha!", 800);
        await addLogMessage("Uma flecha dispara de uma fenda na parede!", 800);
        
        // Rola 1d10 de dano
        const damage = rollDice("1D10");
        
        // Reduz a energia do jogador
        const oldHealth = playerState.health;
        playerState.health = Math.max(0, playerState.health - damage); // Não permite energia negativa
        
        // Atualiza a barra de energia
        if (playerData && playerData.energy) {
            playerData.energy.total = playerState.health;
        }
        updateHealthBar();
        
        // Atualiza a energia no Firestore
        if (userId) {
            await updatePlayerEnergyInFirestore(userId, playerState.health);
        }
        
        // Mensagens de dano
        await addLogMessage(`A flecha atinge você, causando <strong style='color: red;'>${damage}</strong> pontos de dano!`, 1000);
        await addLogMessage(`Sua energia caiu de ${oldHealth} para ${playerState.health}.`, 800);
        
        if (playerState.health <= 0) {
            await addLogMessage("<strong style='color: darkred;'>Você está inconsciente!</strong>", 1000);
        } else if (playerState.health < 10) {
            await addLogMessage("<strong style='color: orange;'>Você está gravemente ferido!</strong>", 1000);
        }
        
        // Salva o estado do jogador
        savePlayerState();
        return;
    }
    
    // Lógica original para outras salas
    await addLogMessage("Você procura cuidadosamente por itens ou passagens secretas...", 1000);
    const foundSomething = Math.random() > 0.5;

    if (foundSomething && currentRoom.items && currentRoom.items.length > 0) {
        // Encontrou um item
        const item = currentRoom.items[0]; // Pega o primeiro item
        await addLogMessage(`Você encontrou: <strong>${item.name || item.content}</strong>!`, 800);
        await addLogMessage(item.description, 500);
        
        // Cria o botão para recolher o item
        const itemToCollect = {
            id: item.id,
            content: item.name || item.content,
            description: item.description || "",
            quantity: item.quantity || 1
        };
        createCollectButton(itemToCollect);
        
        // Salva o estado
        savePlayerState();
    } else {
        await addLogMessage("Você não encontrou nada de interessante.", 800);
    }
}




// Função para tentar abrir uma porta
async function openDoor(direction) {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom || !currentRoom.exits) return;
    
    // Encontra a saída na direção especificada
    const exit = currentRoom.exits.find(e => e.direction === direction);
    if (!exit) {
        await addLogMessage(`Não há saída na direção ${direction}.`, 500);
        return;
    }
    
    startNewLogBlock("Abrir Porta");
    
    if (exit.locked) {
        await addLogMessage(`A porta está trancada.`, 500);
        
        // Verifica se o jogador tem a chave
        // Verifica se o jogador tem a chave no inventário do Firestore
let hasKey = false;

// Primeiro verifica no playerState local (compatibilidade)
hasKey = playerState.inventory.some(item => item.id === exit.keyId);

// Se não encontrou, verifica no inventário do Firestore
if (!hasKey && playerData && playerData.inventory && playerData.inventory.itemsInChest) {
    hasKey = playerData.inventory.itemsInChest.some(item => item.id === exit.keyId);
}


        if (hasKey) {
            await addLogMessage(`Você usa a chave para destrancar a porta.`, 800);
            exit.locked = false;
            updateDirectionButtons();
            savePlayerState(); // Adicione esta linha para salvar o estado da porta destrancada
        } else {
            await addLogMessage(`Você precisa de uma chave para abrir esta porta.`, 800);
        }
    } else {
        await addLogMessage(`Você abre a porta.`, 500);
        
        // Descobre a sala do outro lado
        if (!playerState.discoveredRooms.includes(exit.leadsTo)) {
            playerState.discoveredRooms.push(exit.leadsTo);
            await addLogMessage(`Você vê uma nova área além da porta.`, 800);
            drawMap();
        }
        
        // Pergunta se quer entrar
        await addLogMessage(`Deseja entrar?`, 500);
        
        // Atualiza os botões de direção
        updateDirectionButtons();
    }
}

// Função para descansar
async function rest() {
    startNewLogBlock("Descansar");
    await addLogMessage("Você decide descansar um pouco para recuperar suas forças...", 1000);
    
    // Recupera um pouco de saúde
    const healthRecovered = Math.floor(Math.random() * 10) + 5; // 5-15 pontos
    playerState.health = Math.min(100, playerState.health + healthRecovered);

    // Atualiza a barra de energia
    updateHealthBar();
    
    await addLogMessage(`Você recuperou ${healthRecovered} pontos de energia.`, 800);
    await addLogMessage(`Energia atual: ${playerState.health}/100`, 500);
    
    // Chance de evento aleatório durante o descanso (20%)
    const randomEvent = Math.random() < 0.2;
    if (randomEvent) {
        await addLogMessage("Durante seu descanso, você ouve sons estranhos ecoando pela masmorra...", 1000);
    }
    
    // Salva o estado
    savePlayerState();
}

function savePlayerState() {
    if (!userId) return;
    
    // Prepara os dados para salvar
    const roomStates = {};
    
    // Salva os estados de exploração de cada sala
    for (const roomId in dungeon.rooms) {
        const room = dungeon.rooms[roomId];
        if (room.explorationState) {
            roomStates[roomId] = room.explorationState;
        }
    }
    
    // Garante que discoveredBlocks seja sempre um array
    if (!playerState.discoveredBlocks) {
        playerState.discoveredBlocks = [];
    }
    
    const dungeonStateRef = doc(db, "dungeons", userId);
    setDoc(dungeonStateRef, {
        currentRoom: playerState.currentRoom,
        discoveredRooms: playerState.discoveredRooms,
        visitedRooms: playerState.visitedRooms,
        inventory: playerState.inventory,
        health: playerState.health,
        roomStates: roomStates,
        discoveredBlocks: playerState.discoveredBlocks,
        lastUpdated: new Date().toISOString()
    }, { merge: true })
    .then(() => {
        console.log("Estado da masmorra salvo com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao salvar estado da masmorra:", error);
    });
}


// Função para carregar o estado do jogador do Firestore (versão atualizada)
async function loadPlayerState() {
    if (!userId) return;
    
    const dungeonStateRef = doc(db, "dungeons", userId);
    try {
        const docSnap = await getDoc(dungeonStateRef);
        
        // Valores padrão para os atributos
        let attributes = {
            luck: 7,
            skill: 7,
            charisma: 7
        };
        
        // Se playerData estiver disponível, use os atributos do jogador
        if (playerData) {
            // Extrai os valores totais dos atributos do jogador
            if (playerData.luck && playerData.luck.total !== undefined) {
                attributes.luck = playerData.luck.total;
            }
            if (playerData.skill && playerData.skill.total !== undefined) {
                attributes.skill = playerData.skill.total;
            }
            if (playerData.charisma && playerData.charisma.total !== undefined) {
                attributes.charisma = playerData.charisma.total;
            }
        }
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Se playerData estiver disponível, use a energia do jogador
            const playerEnergy = playerData?.energy?.total || 100;
            
            // Na função loadPlayerState(), adicione discoveredBlocks aos dados carregados
playerState = {
    currentRoom: data.currentRoom || "room-1",
    discoveredRooms: data.discoveredRooms || ["room-1"],
    visitedRooms: data.visitedRooms || [],
    inventory: data.inventory || [],
    health: data.health || playerEnergy,
    discoveredBlocks: data.discoveredBlocks || [], // Adicione esta linha
    attributes: attributes
};

            
            // Carrega os estados de exploração das salas
            if (data.roomStates) {
                for (const roomId in data.roomStates) {
                    if (dungeon.rooms[roomId]) {
                        dungeon.rooms[roomId].explorationState = data.roomStates[roomId];
                    }
                }
            }
            
            console.log("Estado da masmorra carregado com sucesso!");
            console.log("Atributos carregados:", attributes);
        } else {
            console.log("Nenhum estado de masmorra encontrado. Usando estado inicial.");
            
            // Se playerData estiver disponível, use a energia do jogador
            const playerEnergy = playerData?.energy?.total || 100;
            
            // Usa o estado inicial
            playerState = {
                currentRoom: "room-1",
                discoveredRooms: ["room-1"],
                visitedRooms: [],
                inventory: [],
                health: playerEnergy, // Usa a energia do jogador se disponível
                attributes: attributes // Usa os atributos do jogador
            };
            
            // Inicializa os estados de exploração para todas as salas
            for (const roomId in dungeon.rooms) {
                const room = dungeon.rooms[roomId];
                if (room.exploration && room.exploration.states && room.exploration.states.initial) {
                    room.explorationState = { ...room.exploration.states.initial };
                }
            }
        }
    } catch (error) {
        console.error("Erro ao carregar estado da masmorra:", error);
    }
}


// Função para atualizar o atributo de sorte do jogador no Firestore
async function updatePlayerLuckInFirestore(newLuckValue) {
    if (!userId) return;
    
    console.log(`LOG: Atualizando atributo de sorte para ${newLuckValue}`);
    
    const playerDocRef = doc(db, "players", userId);
    
    return setDoc(playerDocRef, { 
        luck: { 
            ...playerData.luck, // Mantém as outras propriedades do objeto luck
            total: newLuckValue // Atualiza apenas o valor total
        } 
    }, { merge: true })
        .then(() => {
            console.log(`LOG: Atributo de sorte atualizado para ${newLuckValue}`);
            
            // Atualiza também o playerData local
            if (playerData && playerData.luck) {
                playerData.luck.total = newLuckValue;
            }
        })
        .catch((error) => {
            console.error(`LOG: Erro ao atualizar atributo de sorte:`, error);
        });
}


// Função para iniciar um teste de sorte
async function startLuckTest(context) {
    // Garante que playerState.attributes existe
    if (!playerState.attributes) {
        console.warn("Atributos não definidos, usando valores padrão");
        playerState.attributes = {
            luck: playerData?.luck?.total || 7,
            skill: playerData?.skill?.total || 7,
            charisma: playerData?.charisma?.total || 7
        };
    }
    
    const currentLuck = playerState.attributes.luck;
    
    startNewLogBlock("Teste de Sorte");
    await addLogMessage(context.description, 800);
    await addLogMessage(`Seu atributo de Sorte atual é <strong>${currentLuck}</strong>.`, 500);
    await addLogMessage("Deseja fazer um teste de sorte? Se sim, pressione o botão de rolar dado. Se não, pressione qualquer outro botão.", 800);
    
    // Remove o botão de interação original
    removeInteractionButtons();
    
    // Cria diretamente o botão para rolar o dado
    const rollContainer = document.createElement('div');
    rollContainer.id = 'roll-dice-container';
    rollContainer.classList.add('roll-dice-container');
    
    const rollButton = document.createElement('button');
    rollButton.id = 'roll-dice-button';
    rollButton.textContent = 'Rolar Dado';
    rollButton.classList.add('action-btn', 'roll-btn');
    
    rollContainer.appendChild(rollButton);
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(rollContainer);
    }
    
    // Retorna uma promessa que será resolvida quando o jogador fizer uma escolha
    return new Promise((resolve) => {
        // Adiciona evento de clique ao botão de rolar dado
        rollButton.addEventListener('click', async () => {
            // Inicia o processo de rolagem de dados
            const result = await performLuckTest(currentLuck);
            
            // Processa o resultado do teste
            if (result) {
                // Sucesso - aplica o efeito positivo
                await addLogMessage(context.success.text, 800);
                
                // Aplica efeitos, se houver
                if (context.success.effect) {
                    await applyEffects(context.success.effect, context.room);
                }
                
                // Adiciona itens, se houver
                if (context.success.items && context.success.items.length > 0) {
                    createCollectButton(context.success.items[0]);
                }
                
                resolve(true);
            } else {
                // Falha - aplica o efeito negativo
                await addLogMessage(context.failure.text, 800);
                
                // Aplica efeitos, se houver
                if (context.failure.effect) {
                    await applyEffects(context.failure.effect, context.room);
                }
                
                // Aplica dano, se houver
                if (context.failure.damage) {
                    await applyDamageToPlayer(context.failure.damage);
                }
                
                resolve(false);
            }
        });
        
        // Adiciona evento de clique a todos os outros botões para cancelar o teste
        const otherButtons = document.querySelectorAll('button:not(#roll-dice-button)');
        otherButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove o botão de rolar dado
                const rollDiceContainer = document.getElementById('roll-dice-container');
                if (rollDiceContainer) {
                    rollDiceContainer.remove();
                }
                
                // Informa que o jogador decidiu não testar a sorte
                addLogMessage("Você decide não arriscar sua sorte.", 500);
                resolve(false);
            }, { once: true });
        });
    });
}


// Função para realizar o teste de sorte com rolagens individuais
// Função para realizar o teste de sorte com rolagens individuais
async function performLuckTest(currentLuck) {
    // Remove qualquer botão de rolagem existente
    const existingRollContainer = document.getElementById('roll-dice-container');
    if (existingRollContainer) {
        existingRollContainer.remove();
    }
    
    // Cria o botão para rolar o primeiro dado
    const rollContainer = document.createElement('div');
    rollContainer.id = 'roll-dice-container';
    rollContainer.classList.add('roll-dice-container');
    
    const rollButton = document.createElement('button');
    rollButton.id = 'roll-dice-button';
    rollButton.textContent = 'Rolar Dado';
    rollButton.classList.add('action-btn', 'roll-btn');
    
    rollContainer.appendChild(rollButton);
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(rollContainer);
    }
    
    // Primeira rolagem
    const firstRoll = await new Promise(resolve => {
        rollButton.addEventListener('click', () => {
            const roll = Math.floor(Math.random() * 6) + 1; // 1d6
            addLogMessage(`Você rolou o primeiro dado e obteve: <strong>${roll}</strong>`, 500);
            resolve(roll);
        }, { once: true });
    });
    
    // Segunda rolagem
    const secondRoll = await new Promise(resolve => {
        rollButton.textContent = 'Rolar Segundo Dado';
        rollButton.addEventListener('click', () => {
            const roll = Math.floor(Math.random() * 6) + 1; // 1d6
            addLogMessage(`Você rolou o segundo dado e obteve: <strong>${roll}</strong>`, 500);
            resolve(roll);
        }, { once: true });
    });
    
    // Remove o botão de rolagem
    const rollDiceContainer = document.getElementById('roll-dice-container');
    if (rollDiceContainer) {
        rollDiceContainer.remove();
    }
    
    // Calcula o resultado total
    const totalRoll = firstRoll + secondRoll;
    await addLogMessage(`Total dos dados: <strong>${totalRoll}</strong>`, 500);
    
    // Verifica se teve sorte (roll <= luck)
    if (totalRoll <= currentLuck) {
        await addLogMessage(`<strong style='color: green;'>Você teve sorte!</strong> (${totalRoll} ≤ ${currentLuck})`, 800);
        
        // Reduz o atributo de sorte
        const newLuckValue = currentLuck - 1;
        playerState.attributes.luck = newLuckValue;
        await addLogMessage(`Seu atributo de Sorte foi reduzido para <strong>${newLuckValue}</strong>.`, 800);
        
        // Atualiza o atributo de sorte no Firestore
        await updatePlayerLuckInFirestore(newLuckValue);
        
        return true; // Indica que teve sorte
    } else {
        await addLogMessage(`<strong style='color: red;'>Você não teve sorte!</strong> (${totalRoll} > ${currentLuck})`, 800);
        return false; // Indica que não teve sorte
    }
}


// Função para realizar teste de habilidade
async function testSkill(difficulty) {
    // Garante que playerState.attributes existe
    if (!playerState.attributes) {
        console.warn("Atributos não definidos, usando valores padrão");
        playerState.attributes = {
            luck: playerData?.luck?.total || 7,
            skill: playerData?.skill?.total || 7,
            charisma: playerData?.charisma?.total || 7
        };
    }
    
    const currentSkill = playerState.attributes.skill;
    
    startNewLogBlock("Teste de Habilidade");
    await addLogMessage(`Seu atributo de Habilidade é <strong>${currentSkill}</strong>.`, 500);
    await addLogMessage(`Dificuldade do teste: <strong>${difficulty}</strong>`, 500);
    
    // Remove qualquer botão de rolagem existente
    const existingRollContainer = document.getElementById('roll-dice-container');
    if (existingRollContainer) {
        existingRollContainer.remove();
    }
    
    // Cria o botão para rolar o dado
    const rollContainer = document.createElement('div');
    rollContainer.id = 'roll-dice-container';
    rollContainer.classList.add('roll-dice-container');
    
    const rollButton = document.createElement('button');
    rollButton.id = 'roll-dice-button';
    rollButton.textContent = 'Rolar D20';
    rollButton.classList.add('action-btn', 'roll-btn');
    
    rollContainer.appendChild(rollButton);
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(rollContainer);
    }
    
    // Rolagem do d20
    const diceRoll = await new Promise(resolve => {
        rollButton.addEventListener('click', () => {
            const roll = Math.floor(Math.random() * 20) + 1; // 1d20
            addLogMessage(`Você rolou 1D20 e obteve: <strong>${roll}</strong>`, 500);
            resolve(roll);
        }, { once: true });
    });
    
    // Remove o botão de rolagem
    document.getElementById('roll-dice-container').remove();
    
    // Remove também o botão de interação original
    removeInteractionButtons();
    
    // Calcula o resultado total
    const totalRoll = diceRoll + currentSkill;
    await addLogMessage(`Total: ${diceRoll} + ${currentSkill} = <strong>${totalRoll}</strong>`, 800);
    
    // Verifica se passou no teste (totalRoll >= difficulty)
    if (totalRoll >= difficulty) {
        await addLogMessage(`<strong style='color: green;'>Sucesso!</strong> (${totalRoll} ≥ ${difficulty})`, 800);
        return true; // Indica que passou no teste
    } else {
        await addLogMessage(`<strong style='color: red;'>Falha!</strong> (${totalRoll} < ${difficulty})`, 800);
        return false; // Indica que falhou no teste
    }
}


// Função para realizar teste de carisma
async function testCharisma(difficulty) {
    // Garante que playerState.attributes existe
    if (!playerState.attributes) {
        console.warn("Atributos não definidos, usando valores padrão");
        playerState.attributes = {
            luck: playerData?.luck?.total || 7,
            skill: playerData?.skill?.total || 7,
            charisma: playerData?.charisma?.total || 7
        };
    }
    
    const currentCharisma = playerState.attributes.charisma;
    
    startNewLogBlock("Teste de Carisma");
    await addLogMessage(`Seu atributo de Carisma é <strong>${currentCharisma}</strong>.`, 500);
    await addLogMessage(`Dificuldade do teste: <strong>${difficulty}</strong>`, 500);
    
    // Remove qualquer botão de rolagem existente
    const existingRollContainer = document.getElementById('roll-dice-container');
    if (existingRollContainer) {
        existingRollContainer.remove();
    }
    
    // Cria o botão para rolar o dado
    const rollContainer = document.createElement('div');
    rollContainer.id = 'roll-dice-container';
    rollContainer.classList.add('roll-dice-container');
    
    const rollButton = document.createElement('button');
    rollButton.id = 'roll-dice-button';
    rollButton.textContent = 'Rolar D20';
    rollButton.classList.add('action-btn', 'roll-btn');
    
    rollContainer.appendChild(rollButton);
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(rollContainer);
    }
    
    // Rolagem do d20
    const diceRoll = await new Promise(resolve => {
        rollButton.addEventListener('click', () => {
            const roll = Math.floor(Math.random() * 20) + 1; // 1d20
            addLogMessage(`Você rolou 1D20 e obteve: <strong>${roll}</strong>`, 500);
            resolve(roll);
        }, { once: true });
    });
    
    // Remove o botão de rolagem
    document.getElementById('roll-dice-container').remove();
    
    // Remove também o botão de interação original
    removeInteractionButtons();
    
    // Calcula o resultado total
    const totalRoll = diceRoll + currentCharisma;
    await addLogMessage(`Total: ${diceRoll} + ${currentCharisma} = <strong>${totalRoll}</strong>`, 800);
    
    // Verifica se passou no teste (totalRoll >= difficulty)
    if (totalRoll >= difficulty) {
        await addLogMessage(`<strong style='color: green;'>Sucesso!</strong> (${totalRoll} ≥ ${difficulty})`, 800);
        return true; // Indica que passou no teste
    } else {
        await addLogMessage(`<strong style='color: red;'>Falha!</strong> (${totalRoll} < ${difficulty})`, 800);
        return false; // Indica que falhou no teste
    }
}


// Função para processar eventos que podem acionar testes de atributos
async function handleAttributeTestEvent(event, room) {
    await addLogMessage(event.text, 1000);
    
    // Verifica se o evento tem um teste de sorte associado
    if (event.luckTest) {
        const context = {
            description: event.luckTest.description || "Você precisa testar sua sorte para ver o que acontece.",
            room: room,
            success: event.luckTest.success,
            failure: event.luckTest.failure
        };
        
        // Inicia o teste de sorte
        const result = await startLuckTest(context);
        // O resultado já foi processado dentro da função startLuckTest
    }
    
    // Verifica se o evento tem um teste de habilidade associado
    else if (event.skillTest) {
        await addLogMessage(event.skillTest.description || "Você precisa testar sua habilidade.", 800);
        const result = await testSkill(event.skillTest.difficulty);
        
        if (result) {
            // Sucesso
            await addLogMessage(event.skillTest.success.text, 800);
            
            // Aplica efeitos, se houver
            if (event.skillTest.success.effect) {
                await applyEffects(event.skillTest.success.effect, room);
            }
            
            // Adiciona itens, se houver
            if (event.skillTest.success.items && event.skillTest.success.items.length > 0) {
                createCollectButton(event.skillTest.success.items[0]);
            }
        } else {
            // Falha
            await addLogMessage(event.skillTest.failure.text, 800);
            
            // Aplica efeitos, se houver
            if (event.skillTest.failure.effect) {
                await applyEffects(event.skillTest.failure.effect, room);
            }
            
            // Aplica dano, se houver
            if (event.skillTest.failure.damage) {
                await applyDamageToPlayer(event.skillTest.failure.damage);
            }
        }
    }
    
    // Verifica se o evento tem um teste de carisma associado
    else if (event.charismaTest) {
        await addLogMessage(event.charismaTest.description || "Você precisa testar seu carisma.", 800);
        const result = await testCharisma(event.charismaTest.difficulty);
        
        if (result) {
            // Sucesso
            await addLogMessage(event.charismaTest.success.text, 800);
            
            // Aplica efeitos, se houver
            if (event.charismaTest.success.effect) {
                await applyEffects(event.charismaTest.success.effect, room);
            }
            
            // Adiciona itens, se houver
            if (event.charismaTest.success.items && event.charismaTest.success.items.length > 0) {
                createCollectButton(event.charismaTest.success.items[0]);
            }
        } else {
            // Falha
            await addLogMessage(event.charismaTest.failure.text, 800);
            
            // Aplica efeitos, se houver
            if (event.charismaTest.failure.effect) {
                await applyEffects(event.charismaTest.failure.effect, room);
            }
            
            // Aplica dano, se houver
            if (event.charismaTest.failure.damage) {
                await applyDamageToPlayer(event.charismaTest.failure.damage);
            }
        }
    }
    
    // Aplica efeitos gerais, se houver
    if (event.effect) {
        await applyEffects(event.effect, room);
    }
    
    // Processa dano geral, se houver
    if (event.damage) {
        await applyDamageToPlayer(event.damage);
    }
    
    // Cria botões para itens encontrados
    if (event.items && event.items.length > 0) {
        createCollectButton(event.items[0]);
    }
    
    // Salva o estado
    savePlayerState();
    
    // REMOVA ESTA LINHA: Não recrie botões de interação após os testes
    // createInteractionButtons(room, null);
}

// Adicione estas funções após a função handleAttributeTestEvent

// Função para criar e exibir diálogo com NPC
async function startDialogue(npc) {
    // Remove botões existentes
    removeInteractionButtons();
    removePointsOfInterestButtons();
    removeCollectButton();
    
    // Inicia um novo bloco de log para o diálogo
    startNewLogBlock(`Conversa com ${npc.name}`);
    
    // Exibe a descrição do NPC
    if (npc.description) {
        await addLogMessage(npc.description, 800);
    }
    
    // Inicia o diálogo com a primeira fala do NPC
    await showNPCDialogue(npc, "initial"); // Use a string "initial" em vez de npc.dialogues.initial

}

// Função para exibir a fala do NPC e as opções de resposta
async function showNPCDialogue(npc, dialogueId) {
    // Busca o diálogo atual
    const dialogue = npc.dialogues[dialogueId];
    if (!dialogue) {
        console.error(`Diálogo ${dialogueId} não encontrado para o NPC ${npc.name}`);
        return;
    }
    
    // Exibe a fala do NPC
    await addLogMessage(`<strong>${npc.name}:</strong> ${dialogue.text}`, 800);
    
    // Se não houver opções de resposta, encerra o diálogo
    if (!dialogue.options || dialogue.options.length === 0) {
        await addLogMessage("<em>Fim da conversa.</em>", 500);
        return;
    }
    
    // Cria o container para as opções de resposta
    const responseContainer = document.createElement('div');
    responseContainer.id = 'dialogue-options';
    responseContainer.classList.add('dialogue-options');
    
    // Adiciona um título
    const responseTitle = document.createElement('p');
    responseTitle.textContent = 'Sua resposta:';
    responseTitle.classList.add('dialogue-title');
    responseContainer.appendChild(responseTitle);
    
    // Cria botões para cada opção de resposta
    for (const option of dialogue.options) {
        const responseBtn = document.createElement('button');
        responseBtn.textContent = option.text;
        responseBtn.classList.add('dialogue-option-btn');
        
        // Adiciona o evento de clique
        responseBtn.addEventListener('click', async () => {
            // Remove o container de opções
            responseContainer.remove();
            
            // Exibe a resposta escolhida pelo jogador
            await addLogMessage(`<strong>Você:</strong> ${option.text}`, 500);
            
            // Aplica efeitos, se houver
            if (option.effect) {
                const currentRoom = dungeon.rooms[playerState.currentRoom];
                await applyEffects(option.effect, currentRoom);
            }
            
            // Verifica se há itens para receber
            if (option.items && option.items.length > 0) {
                for (const item of option.items) {
                    await addLogMessage(`${npc.name} entrega a você: ${item.content}`, 800);
                    await addItemToInventory(item);
                }
            }
            
            // Continua o diálogo ou encerra
            if (option.next) {
                await showNPCDialogue(npc, option.next);
            } else {
                await addLogMessage("<em>Fim da conversa.</em>", 500);
            }
        });
        
        responseContainer.appendChild(responseBtn);
    }
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(responseContainer);
    }
}

// Função para verificar se há NPCs na sala e criar botões para interagir com eles
function createNPCButtons(room) {
    // Remove botões existentes primeiro
    removeNPCButtons();
    
    // Verifica se há NPCs na sala
    if (!room.npcs || room.npcs.length === 0) return;
    
    // Cria um container para os botões
    const npcContainer = document.createElement('div');
    npcContainer.id = 'npc-buttons';
    npcContainer.classList.add('npc-buttons');
    
    // Adiciona um título
    const npcTitle = document.createElement('p');
    npcTitle.textContent = 'Personagens na sala:';
    npcTitle.classList.add('npc-title');
    npcContainer.appendChild(npcTitle);
    
    // Cria botões para cada NPC
    for (const npc of room.npcs) {
        // Verifica se o NPC tem uma condição para aparecer
        if (npc.condition && !evaluateCondition(npc.condition, room.explorationState)) {
            continue; // Pula este NPC se a condição não for atendida
        }
        
        const npcBtn = document.createElement('button');
        npcBtn.textContent = `Falar com ${npc.name}`;
        npcBtn.classList.add('npc-btn');
        
        // Adiciona o evento de clique
        npcBtn.addEventListener('click', () => {
            startDialogue(npc);
        });
        
        npcContainer.appendChild(npcBtn);
    }
    
    // Adiciona o container à interface
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(npcContainer);
    }
}

// Função para remover botões de NPC
function removeNPCButtons() {
    const npcButtons = document.getElementById('npc-buttons');
    if (npcButtons) {
        npcButtons.remove();
    }
}



// Função para verificar se um monstro foi derrotado
async function checkDefeatedMonster(monsterId) {
    if (!userId) return false;
    
    try {
        // Referência para o documento de monstros derrotados do usuário
        const defeatedMonstersRef = doc(db, "defeatedEnemies", userId);
        
        // Verifica se o documento existe
        const docSnap = await getDoc(defeatedMonstersRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const enemies = data.enemies || [];
            
            // Verifica se o monstro está na lista de derrotados
            return enemies.includes(monsterId);
        }
        
        return false;
    } catch (error) {
        console.error("LOG: Erro ao verificar monstro derrotado:", error);
        return false;
    }
}


// Função para mover o jogador para uma sala (versão corrigida)
async function moveToRoom(roomId) {
    const room = dungeon.rooms[roomId];
    if (!room) {
        console.error(`Sala ${roomId} não encontrada.`);
        return;
    }

    // Remove o botão de lutar se existir
    removeFightButton();
    
    // Remove botões de interação
    removeInteractionButtons();
    
    // Remove botões de pontos de interesse
    removePointsOfInterestButtons();
    
    // Atualiza o estado do jogador
    playerState.currentRoom = roomId;
    
    // Marca a sala como descoberta se ainda não estiver
    if (!playerState.discoveredRooms.includes(roomId)) {
        playerState.discoveredRooms.push(roomId);
    }
    
    // Marca a sala como visitada se ainda não estiver
    const isFirstVisit = !playerState.visitedRooms.includes(roomId);
    if (isFirstVisit) {
        playerState.visitedRooms.push(roomId);
        
        // Verifica se há novos blocos decorativos para descobrir
const blocksToUse = dungeon.decorativeBlocks || decorativeBlocks;
for (const block of blocksToUse) {
    // Só processa se o bloco ainda não foi descoberto
    const alreadyDiscovered = playerState.discoveredBlocks && 
        playerState.discoveredBlocks.some(b => b.gridX === block.gridX && b.gridY === block.gridY);
    
    if (!alreadyDiscovered) {
        // Se o bloco tem a propriedade "connects", verifica se todas as salas conectadas foram visitadas
        if (block.connects) {
            const allConnectedRoomsVisited = block.connects.every(roomId => 
                playerState.visitedRooms.includes(roomId));
            
            if (allConnectedRoomsVisited) {
                if (!playerState.discoveredBlocks) playerState.discoveredBlocks = [];
                
                console.log(`Descobrindo bloco em X:${block.gridX}, Y:${block.gridY}`);
                playerState.discoveredBlocks.push({
                    gridX: block.gridX,
                    gridY: block.gridY
                });
            }
        } 
        // Caso contrário, usa a lógica antiga de proximidade
        else {
            // Para cada sala visitada, verifica se há outra sala visitada próxima ao bloco
            let connectedRooms = 0;
            
            for (const visitedRoomId of playerState.visitedRooms) {
                const visitedRoom = dungeon.rooms[visitedRoomId];
                if (!visitedRoom) continue;
                
                // Verifica se a sala está próxima ao bloco
                const distX = Math.abs(block.gridX - visitedRoom.gridX);
                const distY = Math.abs(block.gridY - visitedRoom.gridY);
                
                if (distX <= 2 && distY <= 2) {
                    connectedRooms++;
                    
                    // Se encontrou pelo menos duas salas visitadas próximas ao bloco, adiciona à lista
                    if (connectedRooms >= 2) {
                        if (!playerState.discoveredBlocks) playerState.discoveredBlocks = [];
                        
                        console.log(`Descobrindo bloco em X:${block.gridX}, Y:${block.gridY}`);
                        playerState.discoveredBlocks.push({
                            gridX: block.gridX,
                            gridY: block.gridY
                        });
                        
                        break; // Sai do loop interno
                    }
                }
            }
        }
    }
}


        
        // Inicializa o estado de exploração se não existir
        if (room.exploration && room.exploration.states && room.exploration.states.initial) {
            room.explorationState = { ...room.exploration.states.initial };
        }
        
        // Processa eventos de primeira visita
        const firstVisitEvents = room.events?.filter(event => event.type === "first-visit") || [];
        for (const event of firstVisitEvents) {
            await addLogMessage(event.text, 1000);
        }
    }
    
    // Verifica se a sala tem um inimigo e se ele já foi derrotado
    let customDescription = room.description;
    if (room.enemy) {
        const isDefeated = await checkDefeatedMonster(room.enemy.id);
        if (isDefeated) {
            // Usa descrição alternativa se disponível
            if (room.enemy.defeatedDescription) {
                customDescription = room.enemy.defeatedDescription;
            }
        }
    }

    
    // Adiciona descrição da sala ao log
    startNewLogBlock(room.name);
    await addLogMessage(customDescription, 1000);
    
    // Atualiza o mapa
    drawMap();

    // Atualiza a barra de energia
    updateHealthBar();
    
    // Verifica se a sala tem um inimigo com gatilho
    if (room.enemy && room.enemy.trigger) {
        // Inicializa o estado de exploração se não existir
        if (!room.explorationState) {
            if (room.exploration && room.exploration.states && room.exploration.states.initial) {
                room.explorationState = { ...room.exploration.states.initial };
            } else {
                room.explorationState = {};
            }
        }
        
        // Verifica se o gatilho deve ser acionado
        const shouldTrigger = evaluateCondition(room.enemy.trigger.condition, room.explorationState);
        const isDefeated = await checkDefeatedMonster(room.enemy.id);
        
        if (shouldTrigger && !isDefeated) {
            // Exibe a mensagem do gatilho
            await addLogMessage(room.enemy.trigger.message, 1000);
            
            // Cria o botão de lutar
            createFightButton(room.enemy);
        } else if (room.enemy && !isDefeated) {
            // Inimigo normal (sem gatilho)
            createFightButton(room.enemy);
            await addLogMessage(`Um ${room.enemy.name} está pronto para atacar!`, 800);
        } else if (isDefeated) {
            // O inimigo já foi derrotado
            await addLogMessage(`Você vê os restos do ${room.enemy.name} que você derrotou anteriormente.`, 800);
            updateDirectionButtons();
        }
    } else if (room.enemy) {
        // Verifica se o inimigo já foi derrotado
        const isDefeated = await checkDefeatedMonster(room.enemy.id);
        
        if (isDefeated) {
            // O inimigo já foi derrotado
            await addLogMessage(`Você vê os restos do ${room.enemy.name} que você derrotou anteriormente.`, 800);
            updateDirectionButtons();
        } else {
            // O inimigo ainda está vivo
            createFightButton(room.enemy);
            await addLogMessage(`Um ${room.enemy.name} está pronto para atacar!`, 800);
        }
    } else {
        // Atualiza os botões de direção
        updateDirectionButtons();
    }
    
    // Cria botões de interação, se houver
    if (room.exploration && room.exploration.interactions) {
        createInteractionButtons(room, null);
    }

    // Verifica se há NPCs na sala
if (room.npcs) {
    createNPCButtons(room);
}
    
    // Salva o estado do jogador
    savePlayerState();
}




// Nova função para mostrar tela de seleção de masmorra
function showDungeonSelectionScreen(dungeons) {
    // Limpa o conteúdo principal
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = '';
    
    // Cria o container de seleção
    const selectionContainer = document.createElement('div');
    selectionContainer.className = 'dungeon-selection';
    selectionContainer.innerHTML = '<h2>Escolha uma Masmorra</h2>';
    
    // Cria a lista de masmorras
    const dungeonList = document.createElement('div');
    dungeonList.className = 'dungeon-list';
    
    // Adiciona cada masmorra como um card clicável
    dungeons.forEach(dungeon => {
        const dungeonCard = document.createElement('div');
        dungeonCard.className = 'dungeon-card';
        dungeonCard.innerHTML = `
            <h3>${dungeon.name}</h3>
            <p>${dungeon.description || 'Uma masmorra misteriosa aguarda...'}</p>
        `;
        
        // Adiciona evento de clique para iniciar a masmorra
        dungeonCard.addEventListener('click', () => {
            loadAndStartDungeon(dungeon.id);
        });
        
        dungeonList.appendChild(dungeonCard);
    });
    
    selectionContainer.appendChild(dungeonList);
    mainContent.appendChild(selectionContainer);
}

// Nova função para carregar e iniciar uma masmorra
async function loadAndStartDungeon(dungeonId = null) {
    // Restaura o layout original
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <div class="dungeon-container">
            <div class="map-container">
                <svg id="dungeon-map" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    <g id="map-grid"></g>
                    <g id="map-rooms"></g>
                    <g id="map-corridors"></g>
                    <g id="map-doors"></g>
                    <g id="map-items"></g>
                    <g id="map-player"></g>
                </svg>
            </div>
            <div class="exploration-log">
                <h2>Exploração</h2>
                <div id="exploration-log-content"></div>
            </div>
        </div>
        <div class="player-status">
            <div class="health-bar-container">
                <span>Energia:</span>
                <div class="health-bar-wrapper">
                    <div id="player-health-bar" class="health-bar"></div>
                </div>
                <span id="player-health-value">100/100</span>
            </div>
        </div>
        <div class="player-actions">
            <div id="direction-buttons">
                <button id="go-north" class="direction-btn">Norte</button>
                <div class="east-west-container">
                    <button id="go-west" class="direction-btn">Oeste</button>
                    <button id="go-east" class="direction-btn">Leste</button>
                </div>
                <button id="go-south" class="direction-btn">Sul</button>
            </div>
            <div id="action-buttons">
                <button id="examine-room" class="action-btn">Examinar Sala</button>
                <button id="open-door" class="action-btn">Abrir Porta</button>
                <button id="search-room" class="action-btn">Procurar</button>
                <button id="rest" class="action-btn">Descansar</button>
            </div>
        </div>
    `;
    
    // Reconecta os event listeners aos botões
    const northBtn = document.getElementById("go-north");
    const southBtn = document.getElementById("go-south");
    const eastBtn = document.getElementById("go-east");
    const westBtn = document.getElementById("go-west");
    
    if (northBtn) northBtn.addEventListener("click", () => {
        const leadsTo = northBtn.dataset.leadsTo;
        if (leadsTo) moveToRoom(leadsTo);
    });
    
    if (southBtn) southBtn.addEventListener("click", () => {
        const leadsTo = southBtn.dataset.leadsTo;
        if (leadsTo) moveToRoom(leadsTo);
    });
    
    if (eastBtn) eastBtn.addEventListener("click", () => {
        const leadsTo = eastBtn.dataset.leadsTo;
        if (leadsTo) moveToRoom(leadsTo);
    });
    
    if (westBtn) westBtn.addEventListener("click", () => {
        const leadsTo = westBtn.dataset.leadsTo;
        if (leadsTo) moveToRoom(leadsTo);
    });
    
    const examineRoomBtn = document.getElementById("examine-room");
    if (examineRoomBtn) examineRoomBtn.addEventListener("click", examineRoom);
    
    const searchRoomBtn = document.getElementById("search-room");
    if (searchRoomBtn) searchRoomBtn.addEventListener("click", searchRoom);
    
    const openDoorBtn = document.getElementById("open-door");
    if (openDoorBtn) {
        openDoorBtn.addEventListener("click", () => {
            // Abre um menu para escolher a direção
            const currentRoom = dungeon.rooms[playerState.currentRoom];
            if (!currentRoom || !currentRoom.exits) return;
            
            // Cria um menu temporário para escolher a direção
            const directionMenu = document.createElement('div');
            directionMenu.classList.add('direction-menu');
            directionMenu.innerHTML = '<p>Escolha uma direção:</p>';
            
            currentRoom.exits.forEach(exit => {
                const dirBtn = document.createElement('button');
                dirBtn.textContent = exit.direction.charAt(0).toUpperCase() + exit.direction.slice(1);
                dirBtn.classList.add('direction-choice');
                dirBtn.addEventListener('click', () => {
                    openDoor(exit.direction);
                    directionMenu.remove();
                });
                directionMenu.appendChild(dirBtn);
            });
            
            // Adiciona botão para cancelar
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.classList.add('direction-choice', 'cancel');
            cancelBtn.addEventListener('click', () => {
                directionMenu.remove();
            });
            directionMenu.appendChild(cancelBtn);
            
            document.querySelector('.player-actions').appendChild(directionMenu);
        });
    }
    
    const restBtn = document.getElementById("rest");
    if (restBtn) restBtn.addEventListener("click", rest);
    
    // Carrega o estado da masmorra
    await loadPlayerState();
    
    // Carrega a masmorra especificada ou a padrão
    await initializeDungeon(dungeonId);
    
    // Adiciona o seletor de masmorras
    const availableDungeons = await listAvailableDungeons();
    if (availableDungeons.length > 0) {
        const dungeonSelector = createDungeonSelector(
            availableDungeons, 
            dungeonId || 'default'
        );
        
        // Adiciona o seletor à interface
        const headerElement = document.querySelector('header');
        if (headerElement) {
            dungeonSelector.style.marginLeft = '10px';
            headerElement.appendChild(dungeonSelector);
        }
    }
    
    // Atualiza a barra de energia
    updateHealthBar();
    
    // Inicia a exploração
    startNewLogBlock("Bem-vindo");
    await addLogMessage(`Bem-vindo às ${dungeon.name}!`, 500);
    await addLogMessage(dungeon.description, 1000);
    
    // Move para a sala inicial
    moveToRoom(playerState.currentRoom);
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log("LOG: DOMContentLoaded evento disparado.");
    
    // Botão de inventário
    const inventarioButton = document.getElementById("abrir-inventario");
    if (inventarioButton) {
        inventarioButton.addEventListener("click", () => {
            window.location.href = "inventario.html";
        });
    }
    
    // Verifica autenticação
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("LOG: Usuário logado. ID:", user.uid);
            userId = user.uid;
        
            // Carrega os dados do jogador
            const playerDocRef = doc(db, "players", userId);
            try {
                const docSnap = await getDoc(playerDocRef);
                if (docSnap.exists()) {
                    playerData = docSnap.data();
                    console.log("Dados do jogador carregados:", playerData);
                    
                    // Atualiza o estado do jogador com a energia correta
                    if (playerData.energy && playerData.energy.total !== undefined) {
                        playerState.health = playerData.energy.total;
                    }
                    
                    // Atualiza a barra de energia após carregar os dados do jogador
                    updateHealthBar();
                }
            } catch (error) {
                console.error("Erro ao carregar dados do jogador:", error);
            }
            
            // Lista masmorras disponíveis e cria o seletor
            const availableDungeons = await listAvailableDungeons();
            if (availableDungeons.length > 0) {
                // Verifica se há um parâmetro de masmorra na URL
                const urlParams = new URLSearchParams(window.location.search);
                const dungeonParam = urlParams.get('dungeon');
                
                if (dungeonParam) {
                    // Se há um parâmetro na URL, carrega diretamente essa masmorra
                    await loadAndStartDungeon(dungeonParam);
                } else {
                    // Caso contrário, mostra uma tela de seleção
                    showDungeonSelectionScreen(availableDungeons);
                }
            } else {
                // Se não houver masmorras disponíveis, carrega a padrão
                await loadAndStartDungeon();
            }
        } else {
            console.log("LOG: Nenhum usuário logado. Redirecionando para login...");
            window.location.href = "index.html";
        }
    });
});
