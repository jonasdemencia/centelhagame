// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
    let playerHealth = 0; // Adiciona a vida do jogador (agora representando a energia)
    let isPlayerTurn = false; // Variável para controlar o turno
    let currentTurnBlock = null; // Para armazenar o bloco do turno atual
    let playerAbilityValue = 0; // Para armazenar a habilidade do jogador
    console.log("LOG: Variáveis iniciais declaradas.");

    const monsterData = {
        "lobo": {
            nome: "Lobo Faminto",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um lobo selvagem com presas afiadas.",
            habilidade: 3,
            couraça: 12,
            pontosDeEnergia: 20,
            dano: "1D6" // Adiciona o dano do monstro
        },
        "goblin": {
            nome: "Goblin Sorrateiro",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um pequeno goblin com olhos espertos.",
            habilidade: 2,
            couraça: 10,
            pontosDeEnergia: 15,
            dano: "1D4" // Adiciona o dano do monstro
        }
    };
    currentMonster = monsterData[monsterName]; // Atribui o valor de currentMonster aqui
    console.log("LOG: Dados do monstro carregados:", currentMonster);

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

// Função para o ataque do monstro (agora com delays e log em tempo real)
    async function monsterAttack() {
        console.log("LOG: Iniciando monsterAttack. currentMonster:", currentMonster, "playerHealth:", playerHealth, "isPlayerTurn:", isPlayerTurn);
        if (!currentMonster || playerHealth <= 0) {
            console.log("LOG: monsterAttack - Monstro não existe ou jogador derrotado, retornando.");
            return; // Se o monstro não existir ou o jogador estiver derrotado, não ataca
        }

        startNewTurnBlock(currentMonster.nome);
        await addLogMessage(`Turno do ${currentMonster.nome}`, 1000);

        const monsterAttackRoll = Math.floor(Math.random() * 20) + 1 + currentMonster.habilidade;
        await addLogMessage(`${currentMonster.nome} rolou ${monsterAttackRoll} para atacar.`, 1000);
        console.log("LOG: monsterAttack - Rolagem de ataque do monstro:", monsterAttackRoll);

        const playerDefense = playerData?.defesa ? parseInt(playerData.defesa) : 10;
        await addLogMessage(`Sua Defesa é ${playerDefense}.`, 1000);
        console.log("LOG: monsterAttack - Defesa do jogador:", playerDefense);

        if (monsterAttackRoll >= playerDefense) {
            await addLogMessage(`O ataque do ${currentMonster.nome} acertou!`, 1000);

            const monsterDamageRoll = rollDice(currentMonster.dano);
            console.log("LOG: monsterAttack - Dano rolado pelo monstro:", monsterDamageRoll);
            console.log("LOG: monsterAttack - Energia do jogador antes do dano:", playerHealth);
            playerHealth -= monsterDamageRoll;
            await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano.`, 1000);
            await addLogMessage(`Sua energia restante: ${playerHealth}.`, 1000); // Atualiza a mensagem para "energia"
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
                }
                isPlayerTurn = true;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
    const botaoInventario = document.getElementById("abrir-inventario");
    const botaoIniciativa = document.getElementById("rolar-iniciativa");
    const logBatalha = document.getElementById("battle-log-content");

    if (botaoInventario) {
        botaoInventario.disabled = false; // Habilita o botão no início
        botaoInventario.addEventListener("click", function () {
            console.log("Botão de inventário clicado!");
            window.location.href = "https://jonasdemencia.github.io/centelhagame/inventario";
        });
    } else {
        console.error("Erro: Botão de inventário NÃO encontrado!");
    }

    // Função para desativar o botão de inventário
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
            desativarInventario();
            observer.disconnect(); // Evita chamadas repetidas
        });

        observer.observe(logBatalha, { childList: true, subtree: true });
    }
});


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
                        atacarCorpoACorpoButton.style.display = 'block';
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
    } else if (luteButtonClicked) {
        console.log("LOG: DOMContentLoaded - luteButtonClicked é true, iniciativa não rolada.");
        if (lutarButton) {
            lutarButton.style.display = 'none';
            console.log("LOG: DOMContentLoaded - Botão 'Lutar' escondido (luteButtonClicked).");
        }
        if (rolarIniciativaButton) {
            rolarIniciativaButton.style.display = 'block';
            console.log("LOG: DOMContentLoaded - Botão 'Rolar Iniciativa' exibido (luteButtonClicked).");
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
                                const monsterAbilityValue = currentMonster.habilidade;
                                console.log("LOG: onAuthStateChanged - Rolagem de iniciativa do jogador:", playerRoll);
                                console.log("LOG: onAuthStateChanged - Rolagem de iniciativa do monstro:", monsterRoll);
                                console.log("LOG: onAuthStateChanged - Habilidade do monstro:", monsterAbilityValue);

                                battleLogContent.innerHTML = ""; // Limpa o conteúdo para adicionar os blocos de iniciativa
                                startNewTurnBlock("Iniciativa");
                                await addLogMessage(`Turno do Iniciativa`, 1000); // Adicionado await aqui
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
                                                atacarCorpoACorpoButton.style.display = 'block';
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

                        // Lógica para o botão "Corpo a Corpo"
                        if (atacarCorpoACorpoButton) {
                            atacarCorpoACorpoButton.addEventListener('click', async () => {
                                console.log("LOG: Botão 'Corpo a Corpo' clicado. isPlayerTurn:", isPlayerTurn);
                                if (!isPlayerTurn) {
                                    await addLogMessage(`<p>Não é seu turno!</p>`, 1000);
                                    return;
                                }
                                if (attackOptionsDiv) {
                                    // Desabilita os botões de ação durante a sequência
                                    const buttons = attackOptionsDiv.querySelectorAll('.button');
                                    buttons.forEach(button => button.disabled = true);
                                }

                                startNewTurnBlock("Jogador"); // Adiciona o início do turno aqui

                                await addLogMessage(`Você optou pelo ataque corpo a corpo.`, 1000);

                                const playerRoll = Math.floor(Math.random() * 20) + 1 + playerAbilityValue; // Adiciona a habilidade ao ataque
                                const monsterArmorClass = currentMonster.couraça; // Obtém a couraça do monstro
                                console.log("LOG: Botão 'Corpo a Corpo' - Rolagem de ataque do jogador:", playerRoll);
                                console.log("LOG: Botão 'Corpo a Corpo' - Couraça do monstro:", monsterArmorClass);

                                await addLogMessage(`Você atacou corpo a corpo e rolou um ${playerRoll} (1D20 + ${playerAbilityValue} de Habilidade).`, 1000);

                                if (playerRoll >= monsterArmorClass) {
                                    await addLogMessage(`Seu ataque acertou o ${currentMonster.nome} (Couraça: ${monsterArmorClass})!`, 1000);
                                    if (atacarCorpoACorpoButton) atacarCorpoACorpoButton.style.display = 'none';
                                    if (rolarDanoButton) {
                                        rolarDanoButton.style.display = 'block';
                                    }
                                    if (attackOptionsDiv) {
                                        const buttons = attackOptionsDiv.querySelectorAll('.button');
                                        buttons.forEach(button => button.disabled = false);
                                    }
                                    console.log("LOG: Botão 'Corpo a Corpo' - Ataque acertou, escondendo 'Corpo a Corpo', exibindo 'DANO'.");
                                } else {
                                    await addLogMessage(`Seu ataque errou o ${currentMonster.nome} (Couraça: ${monsterArmorClass}).`, 1000);
                                    await addLogMessage(`Fim do Turno do Jogador.`, 1000);
                                    endPlayerTurn();
                                    console.log("LOG: Botão 'Corpo a Corpo' - Ataque errou. isPlayerTurn:", isPlayerTurn);
                                    if (attackOptionsDiv) {
                                        const buttons = attackOptionsDiv.querySelectorAll('.button');
                                        buttons.forEach(button => button.disabled = false);
                                    }
                                }
                            });
                            console.log("LOG: onAuthStateChanged - Event listener adicionado ao botão 'Corpo a Corpo'.");
                        } else {
                            console.error("LOG: Botão 'Corpo a Corpo' não encontrado (ID: atacar-corpo-a-corpo)");
                        }

                        // Event listener para o botão "DANO"
                        if (rolarDanoButton) {
                            rolarDanoButton.addEventListener('click', () => {
                                console.log("LOG: Botão 'DANO' clicado. isPlayerTurn:", isPlayerTurn);
                                if (!isPlayerTurn) {
                                    addLogMessage(`<p>Não é seu turno!</p>`, 1000);
                                    return;
                                }
                                if (attackOptionsDiv) {
                                    const buttons = attackOptionsDiv.querySelectorAll('.button');
                                    buttons.forEach(button => button.disabled = true);
                                }
                                addLogMessage(`Rolagem de Dano`, 1000);
                                setTimeout(() => {
                                    const damageRollResult = rollDice(playerDamage);
                                    console.log("LOG: Botão 'DANO' - Dano rolado pelo jogador:", damageRollResult, "Dados de dano:", playerDamage);
                                    addLogMessage(`Você rolou ${damageRollResult} de dano (${playerDamage})!`, 1000);

                                    setTimeout(() => {
                                        currentMonster.pontosDeEnergia -= damageRollResult;
                                        addLogMessage(`${currentMonster.nome} sofreu ${damageRollResult} de dano. Pontos de Energia restantes: ${currentMonster.pontosDeEnergia}.`, 1000);
                                        if (rolarDanoButton) rolarDanoButton.style.display = 'none';
                                        attackOptionsDiv.style.display = 'none'; // Fim do turno do jogador
                                        isPlayerTurn = false;
                                        console.log("LOG: Botão 'DANO' - Dano causado ao monstro. Pontos de Energia restantes do monstro:", currentMonster.pontosDeEnergia, "isPlayerTurn:", isPlayerTurn);

                                        // Salvar o estado da batalha no Firestore
                                        if (currentMonster && user) {
                                            saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
                                        }

                                        setTimeout(() => {
                                            // Verifica se o monstro foi derrotado
                                            if (currentMonster.pontosDeEnergia <= 0) {
                                                addLogMessage(`<p style="color: green;">${currentMonster.nome} foi derrotado!</p>`, 1000);
                                                console.log("LOG: Botão 'DANO' - Monstro derrotado.");
                                                // Aqui você pode adicionar lógica para recompensar o jogador e, opcionalmente, restaurar parte da energia.
                                            } else {
                                                addLogMessage(`Fim do Turno do Jogador.`, 1000);
                                                console.log("LOG: Botão 'DANO' - Turno do monstro após o ataque do jogador.");
                                                monsterAttack(); // Turno do monstro APÓS o jogador causar dano
                                            }
                                            if (attackOptionsDiv) {
                                                const buttons = attackOptionsDiv.querySelectorAll('.button');
                                                buttons.forEach(button => button.disabled = false);
                                            }
                                        }, 1000);
                                    }, 1000);
                                }, 1000);
                            });
                            console.log("LOG: onAuthStateChanged - Event listener adicionado ao botão 'DANO'.");
                        } else {
                            console.error("LOG: Botão 'DANO' não encontrado (ID: rolar-dano)");
                        }

                    } else {
                        console.log("LOG: onAuthStateChanged - Nenhum documento encontrado para o jogador:", user.uid);
                        alert("Dados do jogador não encontrados. Por favor, crie seu personagem.");
                        window.location.href = "character-creation.html";
                    }
                })
                .catch(error => {
                    console.error("LOG: onAuthStateChanged - Erro ao buscar dados do jogador:", error);
                });
        } else {
            // Nenhum usuário está logado. Redirecionar para a página de login.
            const currentPageUrl = window.location.href;
            window.location.href = `index.html?redirect=${encodeURIComponent(currentPageUrl)}`;
            console.log("LOG: onAuthStateChanged - Nenhum usuário logado, redirecionando para login.");
        }
    });
    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
});

console.log("LOG: Fim do script batalha.js");
