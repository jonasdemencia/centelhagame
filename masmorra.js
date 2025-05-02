// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// Dados da masmorra
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
            x: 50, // Coordenadas no SVG
            y: 80,
            width: 10, // Largura em unidades SVG
            height: 20, // Altura em unidades SVG
            events: [
                { type: "first-visit", text: "O ar está frio e você sente um arrepio na espinha." }
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
            x: 50,
            y: 50,
            width: 20,
            height: 20,
            events: [
                { type: "first-visit", text: "As estátuas parecem observar seus movimentos." }
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
            x: 80,
            y: 50,
            width: 15,
            height: 15,
            events: [
                { type: "first-visit", text: "Você vê um baú ornamentado no centro da sala." }
            ]
        },
        "room-4": {
            id: "room-4",
            name: "Sala de Armas",
            description: "Uma sala com armas antigas penduradas nas paredes.",
            type: "room",
            exits: [
                { direction: "east", leadsTo: "room-2", type: "door", locked: false }
            ],
            visited: false,
            discovered: false,
            x: 20,
            y: 50,
            width: 15,
            height: 15,
            events: [
                { type: "first-visit", text: "Armas antigas e enferrujadas decoram as paredes." }
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

// Função para adicionar mensagem ao log de exploração
function addLogMessage(message, delay = 0, typingSpeed = 30) {
    const logContainer = document.getElementById("exploration-log-content");
    return new Promise((resolve) => {
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');
        logContainer.appendChild(logEntry);
        
        let index = 0;
        const text = message;

        function typeWriter() {
            if (index < text.length) {
                logEntry.textContent += text.charAt(index);
                index++;
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
            logEntry.textContent = text;
            logContainer.scrollTop = logContainer.scrollHeight;
            resolve();
        }
    });
}

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
    
    // Desenha as salas descobertas
    for (const roomId of playerState.discoveredRooms) {
        const room = dungeon.rooms[roomId];
        if (!room) continue;
        
        // Cria o elemento da sala
        const roomElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        roomElement.setAttribute("x", room.x - room.width/2);
        roomElement.setAttribute("y", room.y - room.height/2);
        roomElement.setAttribute("width", room.width);
        roomElement.setAttribute("height", room.height);
        roomElement.setAttribute("class", `room ${room.type} ${room.visited ? 'visited' : 'discovered'}`);
        roomElement.setAttribute("data-room-id", room.id);
        
        mapRooms.appendChild(roomElement);
        
        // Desenha as portas
        if (room.exits) {
            room.exits.forEach(exit => {
                if (exit.type === "door") {
                    const doorX = room.x;
                    const doorY = room.y;
                    let doorWidth = 4;
                    let doorHeight = 4;
                    
                    // Ajusta a posição da porta com base na direção
                    switch (exit.direction) {
                        case "north":
                            doorX = room.x;
                            doorY = room.y - room.height/2;
                            break;
                        case "south":
                            doorX = room.x;
                            doorY = room.y + room.height/2;
                            break;
                        case "east":
                            doorX = room.x + room.width/2;
                            doorY = room.y;
                            doorWidth = 2;
                            doorHeight = 6;
                            break;
                        case "west":
                            doorX = room.x - room.width/2;
                            doorY = room.y;
                            doorWidth = 2;
                            doorHeight = 6;
                            break;
                    }
                    
                    const doorElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    doorElement.setAttribute("x", doorX - doorWidth/2);
                    doorElement.setAttribute("y", doorY - doorHeight/2);
                    doorElement.setAttribute("width", doorWidth);
                    doorElement.setAttribute("height", doorHeight);
                    doorElement.setAttribute("class", `door ${exit.locked ? 'locked' : ''}`);
                    doorElement.setAttribute("data-exit-to", exit.leadsTo);
                    
                    mapDoors.appendChild(doorElement);
                }
            });
        }
    }
    
    // Desenha o marcador do jogador
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    if (currentRoom) {
        const playerMarker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        playerMarker.setAttribute("cx", currentRoom.x);
        playerMarker.setAttribute("cy", currentRoom.y);
        playerMarker.setAttribute("r", 3);
        playerMarker.setAttribute("class", "player-marker");
        
        mapPlayer.appendChild(playerMarker);
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
    if (!playerState.visitedRooms.includes(roomId)) {
        playerState.visitedRooms.push(roomId);
        room.visited = true;
        
        // Processa eventos de primeira visita
        const firstVisitEvents = room.events?.filter(event => event.type === "first-visit") || [];
        for (const event of firstVisitEvents) {
            await addLogMessage(event.text, 1000);
        }
    }
    
    // Adiciona descrição da sala ao log
    await addLogMessage(`Você está em: ${room.name}`, 500);
    await addLogMessage(room.description, 1000);
    
    // Atualiza o mapa
    drawMap();
    
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

// Função para salvar o estado do jogador no Firestore
function savePlayerState() {
    const user = auth.currentUser;
    if (!user) return;
    
    const dungeonStateRef = doc(db, "dungeons", user.uid);
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
    const user = auth.currentUser;
    if (!user) return;
    
    const dungeonStateRef = doc(db, "dungeons", user.uid);
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
            
            // Atualiza o estado das salas
            playerState.visitedRooms.forEach(roomId => {
                if (dungeon.rooms[roomId]) {
                    dungeon.rooms[roomId].visited = true;
                }
            });
            
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
    const directionButtons = document.querySelectorAll(".direction-btn");
    directionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const leadsTo = button.dataset.leadsTo;
            if (leadsTo) {
                moveToRoom(leadsTo);
            }
        });
    });
    
    // Botão de examinar sala
    const examineRoomBtn = document.getElementById("examine-room");
    if (examineRoomBtn) {
        examineRoomBtn.addEventListener("click", () => {
            const currentRoom = dungeon.rooms[playerState.currentRoom];
            if (currentRoom) {
                addLogMessage(`Você examina a ${currentRoom.name} com cuidado.`, 500);
                addLogMessage(currentRoom.description, 1000);
            }
        });
    }
    
    // Verifica autenticação
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("LOG: Usuário logado. ID:", user.uid);
            await loadPlayerState();
            moveToRoom(playerState.currentRoom);
        } else {
            console.log("LOG: Nenhum usuário logado. Redirecionando para login...");
            window.location.href = "index.html";
        }
    });
});
