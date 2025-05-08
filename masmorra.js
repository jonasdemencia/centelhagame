// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
    health: 100
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

// Função para criar o botão de lutar
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
    
    // Força a desabilitação do botão East diretamente
    const eastBtn = document.getElementById("go-east");
    if (eastBtn) {
        eastBtn.disabled = true;
        console.log("Botão East desabilitado diretamente:", eastBtn.disabled);
    }
}


// Função para desabilitar todos os botões exceto o de lutar
function disableAllButtonsExceptFight() {
    console.log("Desabilitando todos os botões exceto o de lutar");
    
    // Força a desabilitação direta dos botões de direção
    document.getElementById("go-north").disabled = true;
    document.getElementById("go-south").disabled = true;
    document.getElementById("go-east").disabled = true;
    document.getElementById("go-west").disabled = true;
    
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
    
    // Adiciona um log para verificar se os botões foram desabilitados
    console.log("Estado dos botões após desabilitar:");
    console.log("North:", document.getElementById("go-north").disabled);
    console.log("South:", document.getElementById("go-south").disabled);
    console.log("East:", document.getElementById("go-east").disabled);
    console.log("West:", document.getElementById("go-west").disabled);
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
                setTimeout(typeWriter, typingSpeed);
            } else {
                if (delay > 0) {
                    setTimeout(() => {
                        const logContainer = document.getElementById("exploration-log-content");
                        logContainer.scrollTop = logContainer.scrollHeight;
                        resolve();
                    }, delay);
                } else {
                    const logContainer = document.getElementById("exploration-log-content");
                    logContainer.scrollTop = logContainer.scrollHeight;
                    resolve();
                }
            }
        }

        if (typingSpeed > 0) {
            typeWriter();
        } else {
            p.innerHTML = message;
            const logContainer = document.getElementById("exploration-log-content");
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
    
    // Desenha os blocos decorativos
    for (const block of decorativeBlocks) {
        const x = block.gridX * GRID_CELL_SIZE;
        const y = block.gridY * GRID_CELL_SIZE;
        
        // Desenha as células da grade para formar o bloco
        for (let cellY = 0; cellY < block.gridHeight; cellY++) {
            for (let cellX = 0; cellX < block.gridWidth; cellX++) {
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
                if (playerState.discoveredRooms.includes(exit.leadsTo)) {
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




// Função para mover o jogador para uma sala
async function moveToRoom(roomId) {
    const room = dungeon.rooms[roomId];
    if (!room) {
        console.error(`Sala ${roomId} não encontrada.`);
        return;
    }

    // Remove o botão de lutar se existir
    removeFightButton();
    
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
        
        // Processa eventos de primeira visita
        const firstVisitEvents = room.events?.filter(event => event.type === "first-visit") || [];
        for (const event of firstVisitEvents) {
            await addLogMessage(event.text, 1000);
        }
    }
    
    // Adiciona descrição da sala ao log
    startNewLogBlock(room.name);
    await addLogMessage(room.description, 1000);
    
    // Atualiza o mapa
    drawMap();

    // Atualiza a barra de energia
    updateHealthBar();
    
    // Verifica se a sala atual tem um inimigo
    if (room.enemy) {
        // Cria o botão de lutar
        createFightButton(room.enemy);
        
        // Adiciona uma mensagem sobre o inimigo
        await addLogMessage(`Um ${room.enemy.name} está pronto para atacar!`, 800);
    } else {
        // Só atualiza os botões de direção se não houver inimigo
        updateDirectionButtons();
    }
    
    // Salva o estado do jogador
    savePlayerState();
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

// Função para examinar a sala atual
async function examineRoom() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom) return;
    
    startNewLogBlock("Examinar");
    
    // Caso especial para a Sala das Estátuas
    if (currentRoom.id === "room-2") {
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
            await addLogMessage(`- ${item.name}: ${item.description}`, 500);
        }
    }
}

// Função para criar o botão de recolher item
function createCollectButton(item) {
    // Remove qualquer botão existente primeiro
    removeCollectButton();
    
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


// Função para procurar na sala atual
// Função para procurar na sala atual
async function searchRoom() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom) return;
    
    startNewLogBlock("Procurar");
    
    // Caso especial para a Sala das Estátuas
    if (currentRoom.id === "room-2" && 
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
    if (currentRoom.id === "room-2" && 
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
    if (currentRoom.id === "room-5") {
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
        await addLogMessage(`Você encontrou: <strong>${item.name}</strong>!`, 800);
        await addLogMessage(item.description, 500);
        
        // Adiciona o item ao inventário
        playerState.inventory.push(item);
        
        // Remove o item da sala
        currentRoom.items.splice(0, 1);
        
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

// Função para salvar o estado do jogador no Firestore
function savePlayerState() {
    if (!userId) return;
    
    const dungeonStateRef = doc(db, "dungeons", userId);
    setDoc(dungeonStateRef, {
        currentRoom: playerState.currentRoom,
        discoveredRooms: playerState.discoveredRooms,
        visitedRooms: playerState.visitedRooms,
        inventory: playerState.inventory,
        health: playerState.health,
        lastUpdated: new Date().toISOString()
    }, { merge: true })
    .then(() => {
        console.log("Estado da masmorra salvo com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao salvar estado da masmorra:", error);
    });
}

// Função para carregar o estado do jogador do Firestore
async function loadPlayerState() {
    if (!userId) return;
    
    const dungeonStateRef = doc(db, "dungeons", userId);
    try {
        const docSnap = await getDoc(dungeonStateRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Se playerData estiver disponível, use a energia do jogador
            const playerEnergy = playerData?.energy?.total || 100;
            
            playerState = {
                currentRoom: data.currentRoom || "room-1",
                discoveredRooms: data.discoveredRooms || ["room-1"],
                visitedRooms: data.visitedRooms || [],
                inventory: data.inventory || [],
                health: data.health || playerEnergy // Usa a energia do jogador se disponível
            };
            
            console.log("Estado da masmorra carregado com sucesso!");
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
                health: playerEnergy // Usa a energia do jogador se disponível
            };
        }
    } catch (error) {
        console.error("Erro ao carregar estado da masmorra:", error);
    }
}



// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log("LOG: DOMContentLoaded evento disparado.");
    
    // Botão de inventário
    const inventarioButton = document.getElementById("abrir-inventario");
    if (inventarioButton) {
        inventarioButton.addEventListener("click", () => {
            window.location.href = "inventario.html";
        });
    }
    
    // Botões de direção
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
    
    // Botões de ação
    const examineRoomBtn = document.getElementById("examine-room");
    if (examineRoomBtn) {
        examineRoomBtn.addEventListener("click", examineRoom);
    }
    
    const searchRoomBtn = document.getElementById("search-room");
    if (searchRoomBtn) {
        searchRoomBtn.addEventListener("click", searchRoom);
    }
    
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
    if (restBtn) {
        restBtn.addEventListener("click", rest);
    }
    
   // Verifica autenticação
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
        
        // Carrega o estado da masmorra
        await loadPlayerState();
        
        // Atualiza a barra de energia novamente após carregar o estado da masmorra
        updateHealthBar();
        
        // Inicia a exploração
        startNewLogBlock("Bem-vindo");
        await addLogMessage(`Bem-vindo às ${dungeon.name}!`, 500);
        await addLogMessage(dungeon.description, 1000);
        
        // Move para a sala atual
        moveToRoom(playerState.currentRoom);
    } else {
        console.log("LOG: Nenhum usuário logado. Redirecionando para login...");
        window.location.href = "index.html";
    }
});
});
