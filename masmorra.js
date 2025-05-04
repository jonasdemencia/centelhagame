// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
            gridWidth: 2, // Alterado para 2x2
            gridHeight: 2, // Alterado para 2x2
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
            gridX: 9, // Ajustado para alinhar com room-1
            gridY: 12, // Posicionado acima da room-1, sem sobreposição
            gridWidth: 4,
            gridHeight: 4,
            events: [
                { type: "first-visit", text: "As estátuas de pedra parecem observar seus movimentos com olhos vazios." }
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
            gridX: 14, // Ajustado para ficar adjacente à room-2 pelo leste, sem sobreposição
            gridY: 12, // Mesmo Y que room-2
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
                { direction: "north", leadsTo: "room-5", type: "door", locked: false }
            ],
            visited: false,
            discovered: false,
            gridX: 5, // Ajustado para ficar adjacente à room-2 pelo oeste, sem sobreposição
            gridY: 12, // Mesmo Y que room-2
            gridWidth: 3,
            gridHeight: 3,
            events: [
                { type: "first-visit", text: "Armas antigas e enferrujadas decoram as paredes. A maioria parece inútil após séculos de abandono." }
            ]
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
            gridY: 8, // Ajustado para ficar adjacente à room-4 pelo norte, sem sobreposição
            gridWidth: 4,
            gridHeight: 3,
            events: [
                { type: "first-visit", text: "Símbolos estranhos brilham levemente no chão. Você sente uma presença antiga neste lugar." }
            ]
        }
    }
};




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

// Função para desenhar o mapa
// Função para desenhar o mapa
// Função para desenhar o mapa
function drawMap() {
    const mapRooms = document.getElementById("map-rooms");
    const mapCorridors = document.getElementById("map-corridors");
    const mapDoors = document.getElementById("map-doors");
    const mapPlayer = document.getElementById("map-player");
    
    // Limpa os elementos existentes
    mapRooms.innerHTML = '';
    mapCorridors.innerHTML = '';
    mapDoors.innerHTML = '';
    mapPlayer.innerHTML = '';
    
    // Desenha a grade de fundo
    drawGrid();
    
    // Desenha as salas descobertas
    for (const roomId of playerState.discoveredRooms) {
        const room = dungeon.rooms[roomId];
        if (!room) continue;
        
        // Verifica se as propriedades necessárias existem
        if (room.gridX === undefined || room.gridY === undefined || 
            room.gridWidth === undefined || room.gridHeight === undefined) {
            console.error(`Sala ${roomId} tem propriedades de grade indefinidas.`);
            continue;
        }
        
        // Calcula as coordenadas reais a partir das coordenadas da grade
        const x = room.gridX * GRID_CELL_SIZE;
        const y = room.gridY * GRID_CELL_SIZE;
        const width = room.gridWidth * GRID_CELL_SIZE;
        const height = room.gridHeight * GRID_CELL_SIZE;
        
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
                
                roomGroup.appendChild(cellRect);
            }
        }
        
        mapRooms.appendChild(roomGroup);
        
        // Desenha as portas
        if (room.exits) {
            room.exits.forEach(exit => {
                // Só desenha a porta se a sala de destino também estiver descoberta
                if (playerState.discoveredRooms.includes(exit.leadsTo)) {
                    if (exit.type === "door") {
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
                                doorX = x + (width / 2) - (doorWidth / 2);
                                doorY = y - (doorHeight / 2);
                                break;
                            case "south":
                                // Porta no meio da parede sul
                                doorX = x + (width / 2) - (doorWidth / 2);
                                doorY = y + height - (doorHeight / 2);
                                break;
                            case "east":
                                // Porta no meio da parede leste
                                doorX = x + width - (doorWidth / 2);
                                doorY = y + (height / 2) - (doorHeight / 2);
                                doorWidth = GRID_CELL_SIZE * 0.4;
                                doorHeight = GRID_CELL_SIZE * 0.8;
                                break;
                            case "west":
                                // Porta no meio da parede oeste
                                doorX = x - (doorWidth / 2);
                                doorY = y + (height / 2) - (doorHeight / 2);
                                doorWidth = GRID_CELL_SIZE * 0.4;
                                doorHeight = GRID_CELL_SIZE * 0.8;
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
        // Verifica se as propriedades necessárias existem
        if (currentRoom.gridX !== undefined && currentRoom.gridY !== undefined && 
            currentRoom.gridWidth !== undefined && currentRoom.gridHeight !== undefined) {
            
            // Calcula o centro da sala atual
            const centerX = (currentRoom.gridX * GRID_CELL_SIZE) + (currentRoom.gridWidth * GRID_CELL_SIZE / 2);
            const centerY = (currentRoom.gridY * GRID_CELL_SIZE) + (currentRoom.gridHeight * GRID_CELL_SIZE / 2);
            
            const playerMarker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            playerMarker.setAttribute("cx", centerX);
            playerMarker.setAttribute("cy", centerY);
            playerMarker.setAttribute("r", GRID_CELL_SIZE * 0.4); // Alterado de 0.6 para 0.4
            playerMarker.setAttribute("class", "player-marker");
            
            mapPlayer.appendChild(playerMarker);
        } else {
            console.error(`Sala atual ${currentRoom.id} tem propriedades de grade indefinidas.`);
        }
    }
}


// Função para mover o jogador para uma sala
async function moveToRoom(roomId) {
    const room = dungeon.rooms[roomId];
    if (!room) {
        console.error(`Sala ${roomId} não encontrada.`);
        return;
    }
    
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
    
    // Atualiza os botões de direção
    updateDirectionButtons();
    
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

// Função para procurar na sala atual
async function searchRoom() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (!currentRoom) return;
    
    startNewLogBlock("Procurar");
    await addLogMessage("Você procura cuidadosamente por itens ou passagens secretas...", 1000);
    
    // Chance de encontrar algo (50%)
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
        const hasKey = playerState.inventory.some(item => item.id === exit.keyId);
        if (hasKey) {
            await addLogMessage(`Você usa a chave para destrancar a porta.`, 800);
            exit.locked = false;
            updateDirectionButtons();
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
            playerState = {
                currentRoom: data.currentRoom || "room-1",
                discoveredRooms: data.discoveredRooms || ["room-1"],
                visitedRooms: data.visitedRooms || [],
                inventory: data.inventory || [],
                health: data.health || 100
            };
            
            console.log("Estado da masmorra carregado com sucesso!");
        } else {
            console.log("Nenhum estado de masmorra encontrado. Usando estado inicial.");
            // Usa o estado inicial
            playerState = {
                currentRoom: "room-1",
                discoveredRooms: ["room-1"],
                visitedRooms: [],
                inventory: [],
                health: 100
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
                }
            } catch (error) {
                console.error("Erro ao carregar dados do jogador:", error);
            }
            
            // Carrega o estado da masmorra
            await loadPlayerState();

            // Atualiza a barra de energia
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
