// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

console.log("LOG: batalha.js carregado.");

// Configuração do Firebase (substitua com suas próprias configurações)
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

async function salvarDropsNoLoot(userId, drops) {
    const lootCollectionRef = collection(db, "users", userId, "loot");

    for (const item of drops) {
        const itemRef = doc(lootCollectionRef, item.id);
        await setDoc(itemRef, item);
    }
}

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    console.log("LOG: getUrlParameter chamado com:", name);
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    const value = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    console.log("LOG: getUrlParameter retornando:", value);
    return value;
}

// Função para barra de HP
function atualizarBarraHP(idElemento, valorAtual, valorMaximo) {
    const barra = document.getElementById(idElemento);
    if (!barra) {
        console.error(`Elemento com id "${idElemento}" não encontrado.`);
        return;
    }
    if (!valorMaximo || valorMaximo <= 0) {
        console.error(`Valor máximo inválido: ${valorMaximo}`);
        return;
    }
    const porcentagem = Math.max(0, (valorAtual / valorMaximo) * 100);
    barra.style.width = `${porcentagem}%`;
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

// Função para atualizar a energia do jogador na ficha do Firestore
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

// Função para carregar o estado da batalha do Firestore (MOVIDA PARA O ESCOPO GLOBAL)
function loadBattleState(userId, monsterName) {
    console.log("LOG: loadBattleState chamado com userId:", userId, "monsterName:", monsterName);
    const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
    return getDoc(battleDocRef)
        .then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("LOG: Estado da batalha carregado do Firestore:", data);
                return data;
            } else {
                console.log("LOG: Nenhum estado de batalha encontrado para este monstro.");
                return null;
            }
        })
        .catch((error) => {
            console.error("LOG: Erro ao carregar o estado da batalha:", error);
            return null;
        });
}

// Função para salvar o estado da batalha no Firestore
function saveBattleState(userId, monsterName, monsterHealth, playerHealth) {
    console.log("LOG: saveBattleState chamado com userId:", userId, "monsterName:", monsterName, "monsterHealth:", monsterHealth, "playerHealth:", playerHealth);
    const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
    return setDoc(battleDocRef, { monsterHealth: monsterHealth, playerHealth: playerHealth }, { merge: true })
        .then(() => {
            console.log("LOG: Estado da batalha salvo no Firestore.");
        })
        .catch((error) => {
            console.error("LOG: Erro ao salvar o estado da batalha:", error);
        });
}

function handlePostBattle() {
    console.log("handlePostBattle chamado.");
    // Exibe o botão de loot
    const lootButton = document.getElementById('loot-button');
    if (lootButton) {
        lootButton.style.display = 'block'; // Ou 'inline-block'

        // Adiciona um evento de clique ao botão de loot
        lootButton.addEventListener('click', () => {
            console.log("Botão de loot clicado. Redirecionando para loot.html");
            window.location.href = 'loot.html';
        });
    } else {
        console.error("Erro: Botão de loot não encontrado no HTML.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("LOG: DOMContentLoaded evento disparado.");
    const lutarButton = document.getElementById("iniciar-luta");
    const rolarIniciativaButton = document.getElementById("rolar-iniciativa");
    const battleLogContent = document.getElementById("battle-log-content");
    const attackOptionsDiv = document.getElementById("attack-options");
    const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
    const rolarDanoButton = document.getElementById("rolar-dano");
    const monsterName = getUrlParameter('monstro');
    let currentMonster; // Declara currentMonster no escopo superior
    let playerData; // Para armazenar os dados do jogador
    let playerHealth = 0;
    let playerMaxHealth = playerHealth; // ✅ AQUI! Esta linha é o que você precisava
    let isPlayerTurn = false; // Variável para controlar o turno
    let currentTurnBlock = null; // Para armazenar o bloco do turno atual
    let playerAbilityValue = 0; // Para armazenar a habilidade do jogador
    console.log("LOG: Variáveis iniciais declaradas.");

    const monsterData = {
    "lobo": {
        nome: "Lobo Faminto",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um lobo selvagem com presas afiadas.",
        habilidade: 1,
        couraça: 1,
        pontosDeEnergia: 10,
        dano: "1D6",
        drops: [
            {
                id: "weapon",
                content: "Espada de madeira",
                description: "Uma espada de treinamento."
            },
            {
                id: "pocao-cura-minima",
                content: "Poção de Cura Minima",
                consumable: true,
                quantity: 2,
                effect: "heal",
                value: 2,
                description: "Uma poção que restaura uma quantidade minima de energia vital."
            }
        ]
    },
    "goblin": {
        nome: "Goblin Sorrateiro",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um pequeno goblin com olhos espertos.",
        habilidade: 2,
        couraça: 10,
        pontosDeEnergia: 15,
        dano: "1D4"
    }
};

    currentMonster = monsterData[monsterName];
console.log("LOG: Dados do monstro carregados:", currentMonster);

const vidaMaximaMonstro = currentMonster.pontosDeEnergia;

currentMonster.pontosDeEnergiaMax = vidaMaximaMonstro; // Salva para usar depois

// Atualiza visualmente as barras no início do combate
atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);


    if (currentMonster) {
        console.log("LOG: Dados do monstro (carregamento inicial):", currentMonster);
        document.getElementById("monster-name").innerText = currentMonster.nome;
        document.getElementById("monster-description").innerText = currentMonster.descricao;
        const monsterImageElement = document.getElementById("monster-image");
        if (monsterImageElement) {
            monsterImageElement.src = currentMonster.imagem;
            console.log("LOG: Imagem do monstro carregada.");
        } else {
            console.error("LOG: Elemento de imagem do monstro não encontrado (ID: monster-image)");
        }
    } else {
        console.error("LOG: Monstro não encontrado:", monsterName);
        document.getElementById("monster-name").innerText = "Monstro não encontrado";
        document.getElementById("monster-description").innerText = "O monstro especificado na URL não foi encontrado.";
    }

    function addLogMessage(message, delay = 0, typingSpeed = 30) {
        return new Promise(resolve => {
            const logContainer = document.getElementById("battle-log-content"); // Obtém a referência do container do log
            if (currentTurnBlock) {
                const p = document.createElement('p');
                currentTurnBlock.appendChild(p);
                let index = 0;
                function typeWriter() {
                    if (index < message.length) {
                        p.textContent += message.charAt(index);
                        index++;
                        setTimeout(typeWriter, typingSpeed);
                    } else {
                        if (delay > 0) {
                            setTimeout(() => {
                                logContainer.scrollTop = logContainer.scrollHeight; // Rola para o final após o delay
                                resolve();
                            }, delay);
                        } else {
                            logContainer.scrollTop = logContainer.scrollHeight; // Rola para o final imediatamente
                            resolve();
                        }
                    }
                }
                if (delay === 0) {
                    typeWriter();
                } else {
                    setTimeout(typeWriter, delay);
                }
            } else {
                const p = document.createElement('p');
                p.textContent = message;
                battleLogContent.appendChild(p);
                logContainer.scrollTop = logContainer.scrollHeight; // Rola para o final imediatamente
                resolve(); // Resolve imediatamente se não houver efeito de digitação
            }
            // Rolagem automática para o fim (MOVIDO PARA DENTRO DAS CONDIÇÕES)
            // battleLogContent.scrollTop = battleLogContent.scrollHeight;
        });
    }

    function startNewTurnBlock(turnName) {
        if (currentTurnBlock) {
            battleLogContent.prepend(currentTurnBlock);
        }
        currentTurnBlock = document.createElement('div');
        currentTurnBlock.classList.add('turn-block');
        const turnTitle = document.createElement('h4');
        turnTitle.textContent = `Turno do ${turnName}`;
        currentTurnBlock.appendChild(turnTitle);
        battleLogContent.prepend(currentTurnBlock); // Adiciona o novo bloco no topo
    }

    function endPlayerTurn() {
        isPlayerTurn = false;
        if (attackOptionsDiv) {
            attackOptionsDiv.style.display = 'none';
        }
        setTimeout(() => {
            monsterAttack();
        }, 1500); // Pequeno delay antes do turno do monstro
    }

async function monsterAttack() {
    console.log("LOG: Iniciando monsterAttack. currentMonster:", currentMonster, "playerHealth:", playerHealth, "isPlayerTurn:", isPlayerTurn);
    if (!currentMonster || playerHealth <= 0) {
        console.log("LOG: monsterAttack - Monstro não existe ou jogador derrotado, retornando.");
        return;
    }

    startNewTurnBlock(currentMonster.nome);
    await addLogMessage(`Turno do ${currentMonster.nome}`, 1000);

    const monsterAttackRoll = Math.floor(Math.random() * 20) + 1 + currentMonster.habilidade;
    await addLogMessage(`${currentMonster.nome} rolou ${monsterAttackRoll} para atacar.`, 1000);
    console.log("LOG: monsterAttack - Rolagem de ataque do monstro:", monsterAttackRoll);

    console.log("LOG: monsterAttack - playerData antes da defesa:", playerData);
    console.log("LOG: monsterAttack - typeof playerData.couraca:", typeof playerData?.couraca);
    console.log("LOG: monsterAttack - Valor de playerData.couraca:", playerData?.couraca);
    const playerDefense = playerData?.couraca ? parseInt(playerData.couraca) : 10;
    await addLogMessage(`Sua Defesa é ${playerDefense}.`, 1000);
    console.log("LOG: monsterAttack - Defesa do jogador:", playerDefense);

    if (monsterAttackRoll >= playerDefense) {
        await addLogMessage(`O ataque do ${currentMonster.nome} acertou!`, 1000);

        const monsterDamageRoll = rollDice(currentMonster.dano);
        console.log("LOG: monsterAttack - Dano rolado pelo monstro:", monsterDamageRoll);
        console.log("LOG: playerHealth antes do dano:", playerHealth);

        // Atualiza a vida do jogador
        playerHealth -= monsterDamageRoll;

        console.log("LOG: playerHealth depois do dano:", playerHealth);

        //  Verifica se playerMaxHealth está definido
        console.log("LOG: playerMaxHealth:", playerMaxHealth);

        // Atualiza a barra de HP do jogador
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);

        await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano.`, 1000);
        await addLogMessage(`Sua energia restante: ${playerHealth}.`, 1000);
        console.log("LOG: monsterAttack - Energia do jogador depois do dano:", playerHealth);

        // Atualiza a energia do jogador na ficha e salva o estado da batalha
        const user = auth.currentUser;
        if (user) {
            updatePlayerEnergyInFirestore(user.uid, playerHealth);
            saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        }

        // Verifica se o jogador foi derrotado
        if (playerHealth <= 0) {
            await addLogMessage(`<p style="color: red;">Você foi derrotado!</p>`, 1000);
            console.log("LOG: monsterAttack - Jogador derrotado.");
            // Lógica adicional de fim de batalha pode ser adicionada aqui
        } else {
            // Após o ataque do monstro, é o turno do jogador novamente
            startNewTurnBlock("Jogador");
            await addLogMessage(`Turno do Jogador`, 1000);
            if (attackOptionsDiv) {
                console.log("LOG: monsterAttack - **FINAL DO TURNO DO MONSTRO - INICIANDO TURNO DO JOGADOR** - attackOptionsDiv.style.display:", attackOptionsDiv.style.display, "isPlayerTurn:", isPlayerTurn);
                attackOptionsDiv.style.display = 'block';
                // Mostrar o botão de ataque corpo a corpo
                if (atacarCorpoACorpoButton) {
                    atacarCorpoACorpoButton.style.display = 'block';
                    atacarCorpoACorpoButton.disabled = false;
                }
                isPlayerTurn = true;
            }
        }
    } else {
        await addLogMessage(`O ataque do ${currentMonster.nome} errou.`, 1000);
        console.log("LOG: monsterAttack - Ataque do monstro errou.");
        // Após o ataque do monstro errar, é o turno do jogador novamente
        startNewTurnBlock("Jogador");
        await addLogMessage(`Turno do Jogador`, 1000);
        if (attackOptionsDiv) {
            console.log("LOG: monsterAttack - **FINAL DO TURNO DO MONSTRO - INICIANDO TURNO DO JOGADOR** - attackOptionsDiv.style.display:", attackOptionsDiv.style.display, "isPlayerTurn:", isPlayerTurn);
            attackOptionsDiv.style.display = 'block';
            // Mostrar o botão de ataque corpo a corpo
            if (atacarCorpoACorpoButton) {
                atacarCorpoACorpoButton.style.display = 'block';
                atacarCorpoACorpoButton.disabled = false;
            }
            isPlayerTurn = true;
        }
    }
}
    const botaoInventario = document.getElementById("abrir-inventario");
    const botaoIniciativa = document.getElementById("rolar-iniciativa");
    const logBatalha = document.getElementById("battle-log-content");

  if (botaoInventario) {
    botaoInventario.addEventListener("click", function () {
        window.location.href = "https://jonasdemencia.github.io/centelhagame/inventario.html";
    });
}

    function desativarInventario() {
        if (botaoInventario) {
            botaoInventario.disabled = true;
            console.log("Botão de inventário desativado.");
        }
    }

    // Desativa o botão ao rolar iniciativa
    if (botaoIniciativa) {
        botaoIniciativa.addEventListener("click", function () {
            console.log("Batalha iniciada. Desativando inventário.");
            desativarInventario();
        });
    }

    // Observador para desativar o inventário quando o log de batalha mudar (ou seja, quando a luta começar)
    if (logBatalha) {
        const observer = new MutationObserver(() => {
            console.log("Mudança detectada no log de batalha. Desativando inventário.");
            observer.disconnect(); // Evita chamadas repetidas
        });

        observer.observe(logBatalha, { childList: true, subtree: true });
    }

    // Verifica o estado da batalha no Session Storage
    const initiativeResult = sessionStorage.getItem('initiativeResult');
    const playerInitiativeRoll = sessionStorage.getItem('playerInitiativeRoll');
    const monsterInitiativeRoll = sessionStorage.getItem('monsterInitiativeRoll');
    const playerAbilityStored = sessionStorage.getItem('playerAbility');
    const monsterAbilityStored = sessionStorage.getItem('monsterAbility');
    const luteButtonClicked = sessionStorage.getItem('luteButtonClicked') === 'true';

    console.log("LOG: DOMContentLoaded - initiativeResult =", initiativeResult);

    if (initiativeResult && currentMonster) { // Garante que currentMonster esteja definido
        console.log("LOG: DOMContentLoaded - initiativeResult encontrado:", initiativeResult);
        if (lutarButton) {
            lutarButton.style.display = 'none';
            console.log("LOG: DOMContentLoaded - Botão 'Lutar' escondido.");
        }
        if (rolarIniciativaButton) {
            rolarIniciativaButton.style.display = 'none';
            console.log("LOG: DOMContentLoaded - Botão 'Rolar Iniciativa' escondido.");
        }
        battleLogContent.innerHTML = ""; // Limpa o log para reconstruir
        console.log("LOG: DOMContentLoaded - Log de batalha limpo.");
        if (playerInitiativeRoll && monsterInitiativeRoll && playerAbilityStored !== null && monsterAbilityStored !== null) {
            startNewTurnBlock("Iniciativa");
            addLogMessage(`Você rolou ${playerInitiativeRoll} + ${playerAbilityStored} (Habilidade) = ${parseInt(playerInitiativeRoll) + parseInt(playerAbilityStored)} para iniciativa.`, 1000);
            addLogMessage(`${currentMonster.nome} rolou ${monsterInitiativeRoll} + ${monsterAbilityStored} (Habilidade) = ${parseInt(monsterInitiativeRoll) + parseInt(monsterAbilityStored)} para iniciativa.`, 1000);
            currentTurnBlock = null;
            console.log("LOG: DOMContentLoaded - Informações de iniciativa adicionadas ao log.");
        }
        if (initiativeResult === 'player') {
            setTimeout(() => {
                startNewTurnBlock("Jogador");
                addLogMessage(`<p>Você venceu a iniciativa e atacará primeiro.</p>`, 1000);
                if (attackOptionsDiv) {
                    console.log("LOG: Iniciativa do jogador vencida - Antes de exibir opções, attackOptionsDiv:", attackOptionsDiv); // ADICIONADO
                    attackOptionsDiv.style.display = 'block';
                    // Mostrar o botão de ataque corpo a corpo
                    if (atacarCorpoACorpoButton) {
                        ;
                    }
                    console.log("LOG: DOMContentLoaded - Iniciativa do jogador vencida. Exibindo opções de ataque.");
                    addLogMessage(`Turno do Jogador`, 1000); // Adicionado log do turno do jogador
                }
                isPlayerTurn = true;
                console.log("LOG: DOMContentLoaded - Iniciativa do jogador vencida. attackOptionsDiv.style.display:", attackOptionsDiv.style.display, "isPlayerTurn:", isPlayerTurn);
            }, 500);
        } else if (initiativeResult === 'monster') {
            setTimeout(() => {
                startNewTurnBlock(currentMonster.nome);
                addLogMessage(`<p>${currentMonster.nome} venceu a iniciativa e atacará primeiro.</p>`, 1000);
                if (attackOptionsDiv) {
                    attackOptionsDiv.style.display = 'none';
                    console.log("LOG: DOMContentLoaded - Iniciativa do monstro vencida. Escondendo opções de ataque.");
                }
                isPlayerTurn = false;
                console.log("LOG: DOMContentLoaded - Iniciativa do monstro vencida. attackOptionsDiv.style.display:", attackOptionsDiv.style.display, "isPlayerTurn:", isPlayerTurn);
                monsterAttack(); // Monstro ataca primeiro
            }, 500);
        } else if (initiativeResult === 'tie') {
            addLogMessage(`<p>Houve um empate na iniciativa!</p>`, 1000);
            if (rolarIniciativaButton) {
                rolarIniciativaButton.style.display = 'block'; // Permitir rolar novamente em caso de empate
                console.log("LOG: DOMContentLoaded - Empate na iniciativa. Exibindo botão 'Rolar Iniciativa'.");
            }
        }
    } else {
        console.log("LOG: DOMContentLoaded - Estado inicial.");
        if (lutarButton) {
            lutarButton.style.display = 'block';
            console.log("LOG: DOMContentLoaded - Botão 'Lutar' exibido (estado inicial).");
        }
        if (rolarIniciativaButton) {
            rolarIniciativaButton.style.display = 'none';
            console.log("LOG: DOMContentLoaded - Botão 'Rolar Iniciativa' escondido (estado inicial).");
        }
        if (attackOptionsDiv) {
            attackOptionsDiv.style.display = 'none'; // Garante que as opções de ataque estejam escondidas inicialmente
            console.log("LOG: DOMContentLoaded - Opções de ataque escondidas (estado inicial).");
        }
        battleLogContent.innerHTML = ""; // Limpa o log no estado inicial
        console.log("LOG: DOMContentLoaded - Log de batalha limpo (estado inicial).");
    }

    onAuthStateChanged(auth, async (user) => {
        console.log("LOG: onAuthStateChanged chamado.");
        if (user) {
            // Usuário está logado!
            const userId = user.uid;
            console.log("LOG: Usuário logado. ID:", userId);
            const monsterName = getUrlParameter('monstro');

            // Carregar o estado da batalha ao carregar a página
            if (currentMonster) {
                loadBattleState(userId, monsterName)
                    .then(savedState => {
                        if (savedState) {
                            currentMonster.pontosDeEnergia = savedState.monsterHealth;
                            playerHealth = savedState.playerHealth;
                            console.log("LOG: onAuthStateChanged - Estado da batalha carregado do Firestore:", savedState);
                            console.log("LOG: onAuthStateChanged - Pontos de Energia do monstro carregados:", currentMonster.pontosDeEnergia);
                            console.log("LOG: onAuthStateChanged - Energia do jogador carregada (do estado da batalha):", playerHealth); // Atualiza a mensagem para "energia"
                            // Atualizar a interface com a energia do jogador (se houver um elemento para isso)
                            const playerHealthDisplay = document.getElementById("player-health");
                            if (playerHealthDisplay) {
                                playerHealthDisplay.innerText = playerHealth;
                                console.log("LOG: onAuthStateChanged - Energia do jogador exibida na interface.");
                            }
                            // Se a vida do monstro for <= 0 ou a vida do jogador for <= 0, a batalha acabou
                            if (currentMonster.pontosDeEnergia <= 0) {
                                addLogMessage(`<p style="color: green;">${currentMonster.nome} foi derrotado!</p>`, 1500);
                                attackOptionsDiv.style.display = 'none';
                                console.log("LOG: onAuthStateChanged - Monstro derrotado, escondendo opções de ataque.");
                            } else if (playerHealth <= 0) {
                                addLogMessage(`<p style="color: red;">Você foi derrotado!</p>`, 1500);
                                attackOptionsDiv.style.display = 'none';
                                console.log("LOG: onAuthStateChanged - Jogador derrotado, escondendo opções de ataque.");
                            }
                        } else {
                            // Se não houver estado salvo, usa os pontos de energia iniciais e define a energia do jogador
                            console.log("LOG: onAuthStateChanged - Nenhum estado de batalha encontrado, carregando energia da ficha do jogador.");
                            // Defina a energia inicial do jogador com base nos dados do personagem (a ser carregado)
                        }
                        document.getElementById("monster-name").innerText = currentMonster.nome;
                        console.log("LOG: onAuthStateChanged - Nome do monstro exibido.");
                        // A descrição e a imagem já foram carregadas inicialmente
                    });
            }

            const playerDocRef = doc(db, "players", user.uid);
            getDoc(playerDocRef)
                .then(docSnap => {
                    if (docSnap.exists()) {
                        playerData = docSnap.data();
                        playerAbilityValue = playerData.habilidade ? playerData.habilidade : 0;
                        const playerDamage = playerData.dano ? playerData.dano : "1";
                        console.log("LOG: onAuthStateChanged - Dados do jogador carregados:", playerData);
                        console.log("LOG: onAuthStateChanged - Habilidade do jogador:", playerAbilityValue);
                        // ---------------------- MODIFICAÇÃO IMPORTANTE AQUI ----------------------
                        playerHealth = playerData.energy?.total ? parseInt(playerData.energy.total) : 8; // Lê a energia de playerData.energy.total
                        console.log("LOG: onAuthStateChanged - Energia do jogador carregada da ficha:", playerHealth);
                        // -------------------------------------------------------------------------

                        playerMaxHealth = playerData.energy?.max ? parseInt(playerData.energy.max) : playerHealth; // ← Atualiza a global
                        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
                        // ******************************************
                        
                        const inventarioButton = document.getElementById("abrir-inventario");
                        const playerHealthDisplay = document.getElementById("player-health");
                        if (inventarioButton) {
                            inventarioButton.disabled = false;
                            console.log("LOG: onAuthStateChanged - Botão de inventário habilitado.");
                        }
                        if (playerHealthDisplay) {
                            playerHealthDisplay.innerText = playerHealth; // Exibe a energia inicial do jogador
                            console.log("LOG: onAuthStateChanged - Energia inicial do jogador exibida.");
                        }

                        // Event listener para o botão "Lutar" (AGORA MOVIDO PARA DENTRO DO onAuthStateChanged APÓS CARREGAR OS DADOS)
                        if (lutarButton) {
                            lutarButton.disabled = false;
                            lutarButton.addEventListener('click', () => {
                                console.log("LOG: Botão 'Lutar' clicado.");
                                lutarButton.style.display = 'none';
                                if (rolarIniciativaButton) {
                                    rolarIniciativaButton.style.display = 'block';
                                    sessionStorage.setItem('luteButtonClicked', 'true');
                                    console.log("LOG: Botão 'Lutar' escondido, botão 'Rolar Iniciativa' exibido.");
                                } else {
                                    console.error("LOG: Botão 'Rolar Iniciativa' não encontrado (ID: rolar-iniciativa)");
                                }
                        });
                        console.log("LOG: onAuthStateChanged - Event listener adicionado ao botão 'Lutar'.");
                        }

                        // Event listener para o botão "Rolar Iniciativa"
                        if (rolarIniciativaButton) {
                            rolarIniciativaButton.addEventListener('click', async () => {
                                console.log("LOG: Botão 'Rolar Iniciativa' clicado.");
                                const playerRoll = Math.floor(Math.random() * 20) + 1;
                                const monsterRoll = Math.floor(Math.random() * 20) + 1;
                                const playerAbilityValue = playerData?.skill.total || 0;
                                const monsterAbilityValue = currentMonster.habilidade;
                                console.log("LOG: onAuthStateChanged - Rolagem de iniciativa do jogador:", playerRoll);
                                console.log("LOG: onAuthStateChanged - Rolagem de iniciativa do monstro:", monsterRoll);
                                console.log("LOG: onAuthStateChanged - Habilidade do monstro:", monsterAbilityValue);

                                battleLogContent.innerHTML = ""; // Limpa o conteúdo para adicionar os blocos de iniciativa
                                startNewTurnBlock("Iniciativa");
                                await addLogMessage(`Turno de Iniciativa`, 1000); // Adicionado await aqui
                                await addLogMessage(`Você rolou ${playerRoll} + ${playerAbilityValue} (Habilidade) = ${playerRoll + playerAbilityValue} para iniciativa.`, 1000);
                                await addLogMessage(`${currentMonster.nome} rolou ${monsterRoll} + ${monsterAbilityValue} (Habilidade) = ${monsterRoll + monsterAbilityValue} para iniciativa.`, 1000);
                                currentTurnBlock = null; // Reset current turn block

                                let initiativeWinner = '';
                                if (playerRoll + playerAbilityValue > monsterRoll + monsterAbilityValue) {
                                    setTimeout(async () => {
                                        startNewTurnBlock("Jogador");
                                        await addLogMessage(`<p>Você venceu a iniciativa! Você ataca primeiro.</p>`, 1000);
                                        if (attackOptionsDiv) {
                                            console.log("LOG: onAuthStateChanged - Iniciativa do jogador vencida - Antes de exibir opções, attackOptionsDiv:", attackOptionsDiv); // ADICIONADO
                                            attackOptionsDiv.style.display = 'block';
                                            // Mostrar o botão de ataque corpo a corpo
                                            if (atacarCorpoACorpoButton) {
                                                ;
                                            }
                                            console.log("LOG: onAuthStateChanged - Jogador venceu a iniciativa, exibindo opções de ataque.");
                                            await addLogMessage(`Turno do Jogador`, 1000); // Adicionado log do turno do jogador
                                        }
                                        initiativeWinner = 'player';
                                        isPlayerTurn = true;
                                        console.log("LOG: onAuthStateChanged - Jogador venceu a iniciativa! initiativeWinner =", initiativeWinner, "isPlayerTurn =", isPlayerTurn);
                                        sessionStorage.setItem('initiativeResult', initiativeWinner);
                                        console.log("LOG: onAuthStateChanged - initiativeResult salvo no Session Storage:", sessionStorage.getItem('initiativeResult'));
                                    }, 500);
                                } else if (monsterRoll + monsterAbilityValue > playerRoll + playerAbilityValue) {
                                    setTimeout(async () => {
                                        startNewTurnBlock(currentMonster.nome);
                                        await addLogMessage(`<p>${currentMonster.nome} venceu a iniciativa e atacará primeiro.</p>`, 1000);
                                        initiativeWinner = 'monster';
                                        isPlayerTurn = false;
                                        if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
                                        console.log("LOG: onAuthStateChanged - Monstro venceu a iniciativa! initiativeWinner =", initiativeWinner, "isPlayerTurn =", isPlayerTurn);
                                        await monsterAttack(); // Monstro ataca primeiro
                                    }, 500);
                                } else {
                                    await addLogMessage(`<p>Houve um empate na iniciativa!</p>`, 1000);
                                    initiativeWinner = 'tie';
                                    isPlayerTurn = false;
                                    console.log("LOG: onAuthStateChanged - Empate na iniciativa! initiativeWinner =", initiativeWinner, "isPlayerTurn =", isPlayerTurn);
                                    if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'block';
                                }

                                sessionStorage.setItem('playerInitiativeRoll', playerRoll.toString());
                                sessionStorage.setItem('monsterInitiativeRoll', monsterRoll.toString());
                                sessionStorage.setItem('playerAbility', playerAbilityValue.toString());
                                sessionStorage.setItem('monsterAbility', monsterAbilityValue.toString());

                                rolarIniciativaButton.style.display = 'none';
                                sessionStorage.removeItem('luteButtonClicked');
                                console.log("LOG: onAuthStateChanged - Iniciativa rolada, botões de iniciativa escondidos.");
                            });
                        console.log("LOG: onAuthStateChanged - Event listener adicionado ao botão 'Rolar Iniciativa'.");
                    } else {
                        console.error("LOG: Botão 'Rolar Iniciativa' não encontrado (ID: rolar-iniciativa)");
                    }

                        
                        // Event listener para o botão "Rolar localização"
                       // --- Listener 'atacar-corpo-a-corpo' (MODIFICADO v3 - Inicia SIFER ou Acerto Normal) ---
                if (atacarCorpoACorpoButton) {
                    atacarCorpoACorpoButton.onclick = async () => { // Usa onclick
                        if (!isPlayerTurn || playerHealth <= 0 || !currentMonster || currentMonster.pontosDeEnergia <= 0) { return; }
                        console.log("LOG: Botão 'Atacar Corpo a Corpo' clicado.");

                        const actionButtons = document.querySelectorAll('#attack-options button');
                        actionButtons.forEach(button => button.disabled = true); // Desabilita todos

                         //const playerAttackRollRaw = Math.floor(Math.random() * 20) + 1; // <<-- Lembre de DESCOMENTAR esta linha após testar
                         const playerAttackRollRaw = 20; // FORÇADO PARA TESTE SIFER
                        const playerAttackRollTotal = playerAttackRollRaw + playerAbilityValue;
                        const monsterDefense = currentMonster.couraça || 0;

                        await addLogMessage(`Rolando ataque: ${playerAttackRollRaw} + ${playerAbilityValue} (Hab) = ${playerAttackRollTotal} vs Defesa ${monsterDefense}`, 1000);

                        // *** LÓGICA SIFER (NATURAL 20) ***
                        if (playerAttackRollRaw === 20) {
                            console.log("LOG: SIFER - Acerto Crítico! Aguardando rolagem de localização.");
                            await addLogMessage(`<strong style="color: orange;">ACERTO CRÍTICO (SIFER)!</strong> Role a localização!`, 500);

                            const rollLocationBtnInternal = document.getElementById("rolar-localizacao"); // Re-busca localmente
                            if (rollLocationBtnInternal) {
                                rollLocationBtnInternal.style.display = "inline-block";
                                rollLocationBtnInternal.disabled = false;
                                rollLocationBtnInternal.focus();
                                atacarCorpoACorpoButton.disabled = true;

                                // Limpa/Inicia contexto SIFER
                                window.siferContext = {};
                                console.log("LOG: Contexto SIFER iniciado/limpo.");

                            } else {
                                console.error("Botão 'rolar-localizacao' não encontrado no HTML!");
                                await addLogMessage(`Erro: Botão 'Rolar Localização' não encontrado.`, 0);
                                 if (typeof endPlayerTurn === 'function') { endPlayerTurn(); } // Tenta passar turno
                            }
                            // Espera clique em 'rolar-localizacao'

                        } else {
                            // *** LÓGICA ORIGINAL DE ACERTO/ERRO ***
                             window.siferContext = null; // Garante limpar contexto se não for SIFER
                            if (playerAttackRollTotal >= monsterDefense) {
                                console.log("LOG: Ataque normal acertou.");
                                atacarCorpoACorpoButton.style.display = 'none'; // Esconde ataque
                                const rolarDanoBtnInternal = document.getElementById("rolar-dano"); // Re-busca localmente
                                if(rolarDanoBtnInternal) {
                                     rolarDanoBtnInternal.style.display = 'inline-block'; // Mostra dano
                                     rolarDanoBtnInternal.disabled = false; // Habilita dano
                                }
                                await addLogMessage(`Você acertou o ${currentMonster.nome}! Role o dano.`, 1000);

                            } else {
                                console.log("LOG: Ataque normal errou.");
                                await addLogMessage(`Você errou o ataque contra o ${currentMonster.nome}.`, 1000);
                                 if (typeof endPlayerTurn === 'function') { endPlayerTurn(); } else { setTimeout(() => monsterAttack(), 1500); }
                            }
                        }
                    };
                    console.log("Listener (v3) adicionado a 'Atacar Corpo a Corpo'.");
                } else {
                    console.error("LOG: Botão 'Atacar Corpo a Corpo' não encontrado.");
                }


                // --- Listener 'rolar-localizacao' (MODIFICADO v3 - Determina Bônus e Mostra Dano) ---
                if (rollLocationBtn) {
                    rollLocationBtn.onclick = async () => { // Usa onclick
                        console.log("LOG: Botão 'Rolar Localização' clicado.");
                        rollLocationBtn.disabled = true;
                        rollLocationBtn.style.display = 'none';

                        if (typeof window.siferContext !== 'object' || window.siferContext === null) { // Verifica se foi iniciado
                             console.error("LOG: Erro - Contexto SIFER não foi iniciado!");
                             await addLogMessage("Erro: Contexto SIFER não iniciado.", 0);
                             if (typeof endPlayerTurn === 'function') { endPlayerTurn(); }
                             return;
                        }

                        const locationRoll = Math.floor(Math.random() * 20) + 1;
                        console.log("LOG: SIFER - Jogador rolou localização:", locationRoll);
                        await addLogMessage(`Rolando para localização... <strong style="color: yellow;">${locationRoll}</strong>!`, 800);

                        let locationName = "";
                        let bonusCalculationType = 'none';

                        // Determina local e tipo de cálculo
                         if (locationRoll >= 1 && locationRoll <= 5) {
                             locationName = "Membros Inferiores"; bonusCalculationType = 'half';
                         } else if (locationRoll === 6) {
                             locationName = "Costas"; bonusCalculationType = 'full';
                         } else if (locationRoll >= 7 && locationRoll <= 10) {
                              locationName = "Membros Ofensivos"; bonusCalculationType = 'half';
                         } else if (locationRoll >= 11 && locationRoll <= 16) {
                              locationName = "Abdômen/Tórax"; bonusCalculationType = 'half';
                         } else if (locationRoll === 17) {
                             locationName = "Coração"; bonusCalculationType = 'full';
                         } else if (locationRoll === 18) {
                             locationName = "Olhos"; bonusCalculationType = 'full';
                         } else if (locationRoll === 19) {
                             locationName = "Pescoço/Garganta"; bonusCalculationType = 'double';
                         } else if (locationRoll === 20) {
                             locationName = "Cabeça"; bonusCalculationType = 'double';
                         }

                         // Log do resultado
                         let bonusDesc = '';
                         if (bonusCalculationType === 'half') bonusDesc = 'Metade do dano da arma';
                         else if (bonusCalculationType === 'full') bonusDesc = 'Dano completo da arma';
                         else if (bonusCalculationType === 'double') bonusDesc = 'Dobra do dano da arma!';
                         await addLogMessage(`Alvo: ${locationName} (Bônus: ${bonusDesc}). Role o Dano!`, 800);


                        // Salva informações no contexto para o botão de dano
                        window.siferContext.locationRoll = locationRoll;
                        window.siferContext.locationName = locationName;
                        window.siferContext.bonusType = bonusCalculationType;
                        console.log("LOG: Contexto SIFER atualizado:", window.siferContext);

                        // Mostra e habilita o botão de rolar dano
                        const rolarDanoBtnInternal = document.getElementById("rolar-dano"); // Re-busca
                        if(rolarDanoBtnInternal){
                            rolarDanoBtnInternal.style.display = 'inline-block';
                            rolarDanoBtnInternal.disabled = false;
                            rolarDanoBtnInternal.focus();
                            console.log("LOG: Botão 'rolar-dano' habilitado para SIFER.");
                        } else {
                             console.error("Botão 'rolar-dano' não encontrado!");
                             await addLogMessage("Erro: Botão 'Rolar Dano' não encontrado.", 0);
                              if (typeof endPlayerTurn === 'function') { endPlayerTurn(); }
                        }
                        // Espera clique em 'rolar-dano'
                    };
                     console.log("Listener (v3) adicionado a 'Rolar Localização'.");
                } else {
                    console.warn("Botão 'rolar-localizacao' não encontrado no DOM.");
                }


                // --- Listener 'rolar-dano' (MODIFICADO v3 - Processa Normal e SIFER) ---
                if (rolarDanoButton) {
                    rolarDanoButton.onclick = async () => { // Usa onclick e async
                        console.log("LOG: Botão 'DANO' clicado.");
                        if (!isPlayerTurn) {
                            await addLogMessage(`<p>Não é seu turno!</p>`, 1000);
                            return;
                        }

                        // Desabilita todos botões durante o processamento
                        const actionButtons = document.querySelectorAll('#attack-options button');
                        actionButtons.forEach(button => button.disabled = true);
                        rolarDanoButton.style.display = 'none'; // Esconde a si mesmo

                        let totalDamage = 0;
                        let baseDamageRoll = 0;
                        let siferBonusDamage = 0;
                        let isSiferDamage = false;

                        // Verifica se está no contexto SIFER
                        if (window.siferContext && typeof window.siferContext.locationRoll === 'number' && typeof window.siferContext.bonusType === 'string') {
                            isSiferDamage = true;
                            console.log("LOG: Processando Dano SIFER...");
                            const { bonusType, locationName } = window.siferContext;

                            // Rola os dados AGORA
                            baseDamageRoll = rollDice(playerData.dano || "1");
                            const weaponDamageRollForBonus = rollDice(playerData.dano || "0");

                             // Calcula o bônus SIFER
                             if (bonusType === 'half') {
                                 siferBonusDamage = Math.ceil(weaponDamageRollForBonus / 2);
                             } else if (bonusType === 'full') {
                                 siferBonusDamage = weaponDamageRollForBonus;
                             } else if (bonusType === 'double') {
                                 siferBonusDamage = weaponDamageRollForBonus * 2;
                             } else { siferBonusDamage = 0; }

                             totalDamage = baseDamageRoll + siferBonusDamage;

                             console.log(`LOG: SIFER Final - Dano Base: ${baseDamageRoll}, Bônus: ${siferBonusDamage}, Total: ${totalDamage}`);
                             await addLogMessage(`Rolou Dano SIFER! Base: ${baseDamageRoll}, Bônus(${locationName}): ${siferBonusDamage}.`, 800);
                             await addLogMessage(`Dano total do crítico: <strong style="color:yellow;">${totalDamage}</strong>.`, 1000);

                             // Limpa contexto
                             window.siferContext = null;
                             console.log("LOG: Contexto SIFER limpo.");

                        } else {
                            // Dano Normal
                            isSiferDamage = false;
                            console.log("LOG: Processando Dano Normal...");
                            baseDamageRoll = rollDice(playerData.dano || "1"); // playerDamage foi definido no início
                            totalDamage = baseDamageRoll;

                            console.log("LOG: Botão 'DANO' - Dano normal rolado:", totalDamage);
                            await addLogMessage(`Rolagem de Dano Normal: ${totalDamage} (${playerData.dano || "1"})!`, 1000);
                        }

                        // --- Aplicação do Dano e Fim do Turno (Comum) ---
                        if (totalDamage > 0) {
                             console.log(`Aplicando ${totalDamage} de dano ao monstro.`);
                            currentMonster.pontosDeEnergia -= totalDamage;
                            currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);

                            await addLogMessage(`${currentMonster.nome} sofreu ${totalDamage} de dano.`, 800);

                            atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
                            await addLogMessage(`Energia restante do ${currentMonster.nome}: ${currentMonster.pontosDeEnergia}.`, 1000);

                            await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);

                        } else {
                             console.log("Dano total foi zero, nenhum dano aplicado.");
                             await addLogMessage("Dano calculado foi zero.", 800);
                        }

                        // Verifica derrota e passa o turno
                        if (currentMonster.pontosDeEnergia <= 0) {
                            console.log(`LOG: Monstro derrotado após ${isSiferDamage ? 'SIFER' : 'Dano Normal'}!`);
                            await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
                            isPlayerTurn = false;
                             handlePostBattle(); // Chama função pós-batalha
                        } else {
                            console.log(`LOG: Monstro sobreviveu. Passando turno.`);
                             if (typeof endPlayerTurn === 'function') {
                                 endPlayerTurn();
                             } else {
                                 console.error(`LOG: Função endPlayerTurn não encontrada!`);
                                 isPlayerTurn = false;
                                 setTimeout(() => monsterAttack(), 1500);
                             }
                        }
                        // --- Fim Aplicação do Dano ---
                    };
                     console.log("Listener (v3) adicionado a 'rolar-dano'.");
                } else {
                    console.error("LOG: Botão 'DANO' não encontrado (ID: rolar-dano)");
                }
                 // Fim da configuração dos listeners

            } catch (error) {
                console.error("LOG: Erro CRÍTICO ao buscar dados do jogador:", error);
                alert(`Erro ao carregar dados do jogador: ${error.message}. Verifique o console.`);
                 // Redirecionar ou mostrar mensagem de erro mais robusta
                 document.body.innerHTML = `<h1>Erro Fatal</h1><p>Não foi possível carregar os dados do jogador.</p><p>${error.message}</p><a href="index.html">Voltar</a>`;
            }

        } else {
            // Nenhum usuário logado
            userId = null; // Limpa ID global
            playerData = null;
            currentMonster = null;
            window.siferContext = null; // Limpa contexto sifer se houver
            console.log("LOG: Nenhum usuário logado, redirecionando para login.");
            const currentPageUrl = window.location.href;
            window.location.href = `index.html?redirect=${encodeURIComponent(currentPageUrl)}`; // Redireciona para login
        }
    }); // Fim onAuthStateChanged

    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
}); // Fim DOMContentLoaded

console.log("LOG: Fim do script batalha.js");

// --- Variável Global para Contexto SIFER ---
// Declarada fora para garantir que esteja acessível nos listeners
// (Pode ser melhorada no futuro, mas funciona para este caso)
window.siferContext = null;
