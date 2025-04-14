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
    const valorSpan = document.getElementById(`hp-${idElemento.replace('barra-hp-', '')}-valor`);
    
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
    
    if (valorSpan) {
        valorSpan.textContent = `${valorAtual}/${valorMaximo}`;
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
    
    // Reativa o botão de inventário
    const inventarioButton = document.getElementById("abrir-inventario");
    if (inventarioButton) {
        inventarioButton.disabled = false;
        inventarioButton.style.display = 'block';
    }
    
    // Exibe o botão de loot
    const lootButton = document.getElementById('loot-button');
    if (lootButton) {
        lootButton.style.display = 'block';
        lootButton.addEventListener('click', () => {
            console.log("Botão de loot clicado. Redirecionando para loot.html");
            window.location.href = 'loot.html';
        });
    } else {
        console.error("Erro: Botão de loot não encontrado no HTML.");
    }
    
    battleStarted = false; // Reset do estado da batalha
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
    let battleStarted = false; // Variável de controle para estado da batalha
    console.log("LOG: Variáveis iniciais declaradas.");

    const monsterData = {
    "lobo": {
        nome: "Lobo Faminto",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um lobo selvagem com presas afiadas.",
        habilidade: 1,
        couraça: 1,
        pontosDeEnergia: 5,
        pontosDeEnergiaMax: 5,
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
        couraça: 1,
        pontosDeEnergia: 15,
        pontosDeEnergiaMax: 15,
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

    async function addLogMessage(message, delay = 0, typingSpeed = 30) {
    const logContainer = document.getElementById("battle-log-content");
    return new Promise((resolve) => {
        const p = document.createElement('p');
        currentTurnBlock.appendChild(p); // Adiciona a mensagem ao bloco atual
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

        if (typingSpeed > 0) {
            typeWriter();
        } else {
            p.textContent = message;
            logContainer.scrollTop = logContainer.scrollHeight;
            resolve();
        }
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

    // Variável de controle para evitar chamadas repetitivas
let isMonsterTurnRunning = false;

// Finaliza o turno do jogador e inicia o turno do monstro
function endPlayerTurn() {
    console.log("LOG: Finalizando turno do jogador e iniciando turno do monstro.");
    if (!isPlayerTurn) {
        console.error("LOG: endPlayerTurn chamado fora do turno do jogador. Abortando.");
        return;
    }

    isPlayerTurn = false; // Marca que o turno do jogador acabou

    if (attackOptionsDiv) {
        attackOptionsDiv.style.display = 'none'; // Esconde as opções de ataque do jogador
        
        // Reset dos botões para o próximo turno
        const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
        if (atacarCorpoACorpoButton) {
            atacarCorpoACorpoButton.disabled = true;
            atacarCorpoACorpoButton.style.display = 'none';
        }
    }

    setTimeout(() => {
        console.log("LOG: Chamando monsterAttack após fim do turno do jogador.");
        monsterAttack();
    }, 1500); // Delay para iniciar o turno do monstro
}

// Lógica do turno do monstro
// Lógica do turno do monstro (AJUSTADA PARA INCONSCIÊNCIA/MORTE)
async function monsterAttack() {
    console.log("LOG: Iniciando monsterAttack. currentMonster:", currentMonster, "playerHealth:", playerHealth, "isPlayerTurn:", isPlayerTurn);

    // Verifica se o monstro pode atacar (jogador não está no turno, monstro existe)
    // A verificação de playerHealth <= 0 será feita DEPOIS do dano
    if (isPlayerTurn || !currentMonster) { // Removido 'playerHealth <= 0' daqui
        console.log("LOG: monsterAttack - Condição inválida para iniciar ataque (Turno do Jogador? Monstro não existe?). Retornando.");
        return;
    }
    // Adiciona verificação se o monstro já foi derrotado
    if (currentMonster.pontosDeEnergia <= 0) {
         console.log("LOG: monsterAttack - Monstro já derrotado. Saindo.");
         // Talvez chamar handlePostBattle aqui se necessário? Ou apenas retornar.
         return;
    }


    startNewTurnBlock(currentMonster.nome);
    await addLogMessage(`Turno do ${currentMonster.nome}`, 1000);

    const monsterAttackRoll = Math.floor(Math.random() * 20) + 1 + currentMonster.habilidade;
    await addLogMessage(`${currentMonster.nome} rolou ${monsterAttackRoll} em um D20 para atacar.`, 1000);
    console.log("LOG: monsterAttack - Rolagem de ataque do monstro:", monsterAttackRoll);

    const playerDefense = playerData?.couraca ? parseInt(playerData.couraca) : 10;
    await addLogMessage(`Sua Couraça é ${playerDefense}.`, 1000);
    console.log("LOG: monsterAttack - Defesa do jogador:", playerDefense);

    let damageDealt = false; // Flag para saber se o monstro causou dano

    if (monsterAttackRoll >= playerDefense) {
        await addLogMessage(`O ataque do ${currentMonster.nome} acertou!`, 1000);

        const monsterDamageRoll = rollDice(currentMonster.dano);
        console.log("LOG: monsterAttack - Dano rolado pelo monstro:", monsterDamageRoll);

        // Aplica dano ANTES de verificar derrota
        playerHealth -= monsterDamageRoll;
        damageDealt = true; // Marca que houve dano

        // Atualiza a barra de HP e logs (NÃO limita mais a 0 aqui)
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano.`, 1000);
        await addLogMessage(`Sua energia restante: ${playerHealth}.`, 1000); // Mostrará valor negativo se for o caso

        // Salva o estado (inclusive HP negativo)
        const user = auth.currentUser;
        if (user) {
            // Garante que a energia no Firestore reflita o valor atual, mesmo negativo
            updatePlayerEnergyInFirestore(user.uid, playerHealth);
            saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        }

        // *** INÍCIO DA NOVA LÓGICA DE VERIFICAÇÃO DE HP ***
        if (playerHealth <= -10) {
            // MORTE PERMANENTE
            await addLogMessage(`<p style="color: darkred; font-weight: bold;">VOCÊ MORREU!</p>`, 1000);
            console.log("LOG: monsterAttack - Jogador MORREU (HP <= -10).");
            isPlayerTurn = false; // Impede ações futuras
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none'; // Garante que opções sumam

            // *** ADICIONE AQUI A LÓGICA PARA MORTE PERMANENTE ***
            // Ex: Redirecionar, mostrar tela específica, limpar save, etc.
            // Exemplo simples: alerta e redireciona para uma página inicial
             alert("Game Over! Você morreu.");
             window.location.href = 'index.html'; // Ou página inicial/game over

            return; // Interrompe a função monsterAttack, a batalha/jogo acabou aqui.

        } else if (playerHealth <= 0) {
            // INCONSCIENTE (Entre 0 e -9)
            await addLogMessage(`<p style="color: orange; font-weight: bold;">Você está inconsciente!</p>`, 1000);
            console.log("LOG: monsterAttack - Jogador INCONSCIENTE (0 >= HP > -10).");
            isPlayerTurn = false; // Impede ações do jogador
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none'; // Esconde opções

            // *** ADICIONE AQUI A LÓGICA PARA INCONSCIÊNCIA ***
            // Exemplo: Tratar como derrota na batalha, mas sem morte permanente.
            // Poderia chamar handlePostBattle() aqui se ele trata derrota,
            // ou apenas impedir que o turno volte ao jogador com o 'return'.
            // Se o monstro devesse continuar atacando, removeria o return.

            // Exemplo: Apenas impede o jogo de continuar nesta batalha.
             await addLogMessage("A batalha termina aqui, você precisa se recuperar.", 1000);
             // Mostrar botão para voltar ao mapa talvez?
              const backToMapButton = document.getElementById('back-to-map-button');
              if (backToMapButton) backToMapButton.style.display = 'block';

            return; // PARA AQUI, tratando como fim da batalha atual (REMOVER SE MONSTRO CONTINUA ATACANDO)
        }
        // *** FIM DA NOVA LÓGICA DE VERIFICAÇÃO DE HP ***

        // Se chegou aqui, playerHealth > 0

    } else {
        // Monstro errou o ataque
        await addLogMessage(`O ataque do ${currentMonster.nome} errou.`, 1000);
        console.log("LOG: monsterAttack - Ataque do monstro errou.");
    }

    // Se o jogador não morreu nem ficou inconsciente, passa o turno para ele
    console.log("LOG: Finalizando turno do monstro.");
    // Chama a função que inicia o turno do jogador (endMonsterTurn ou startPlayerTurn, dependendo da sua estrutura)
    // Presumindo que endMonsterTurn() existe e faz isso:
    if (typeof endMonsterTurn === 'function') {
         endMonsterTurn();
    } else {
         console.error("Erro: Função endMonsterTurn não encontrada para passar o turno ao jogador!");
         // Fallback: Tentar habilitar manualmente (pode não funcionar perfeitamente)
         isPlayerTurn = true;
         if(attackOptionsDiv) attackOptionsDiv.style.display = 'block';
         if(atacarCorpoACorpoButton) {
             atacarCorpoACorpoButton.disabled = false;
             atacarCorpoACorpoButton.style.display = 'inline-block';
         }
    }
}
    
// Finaliza o turno do monstro e inicia o turno do jogador
function endMonsterTurn() {
    console.log("LOG: Finalizando turno do monstro e iniciando turno do jogador.");
    if (isPlayerTurn) {
        console.error("LOG: endMonsterTurn chamado fora do turno do monstro. Abortando.");
        return;
    }

    isPlayerTurn = true; // Marca que é o turno do jogador

    if (attackOptionsDiv) {
        attackOptionsDiv.style.display = 'block'; // Exibe as opções de ataque do jogador

        const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
        if (atacarCorpoACorpoButton) {
            atacarCorpoACorpoButton.disabled = false; // Habilita o botão de ataque
            atacarCorpoACorpoButton.style.display = 'inline-block'; // Mostra o botão novamente
        }

        // Reseta o estado dos botões
        const buttons = attackOptionsDiv.querySelectorAll('.button');
        buttons.forEach(button => {
            button.disabled = false;
            if (button.id === 'atacar-corpo-a-corpo') {
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        });
    }

    startNewTurnBlock("Jogador");
    addLogMessage(`Turno do Jogador`, 1000);
}

    function resetActionButtons() {
    if (attackOptionsDiv) {
        const buttons = attackOptionsDiv.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
            if (button.id === 'atacar-corpo-a-corpo') {
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        });
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

    function endPlayerTurn() {
    console.log("LOG: Finalizando turno do jogador e iniciando turno do monstro.");
    if (!isPlayerTurn) {
        console.error("LOG: endPlayerTurn chamado fora do turno do jogador. Abortando.");
        return;
    }

    isPlayerTurn = false; // Marca que o turno do jogador acabou

    if (attackOptionsDiv) {
        attackOptionsDiv.style.display = 'none'; // Esconde as opções de ataque do jogador
    }

    setTimeout(() => {
        console.log("LOG: Chamando monsterAttack após fim do turno do jogador.");
        monsterAttack();
    }, 1500); // Delay para iniciar o turno do monstro
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
            addLogMessage(`Você rolou ${playerInitiativeRoll} + ${playerAbilityStored} (Habilidade) = ${parseInt(playerInitiativeRoll) + parseInt(playerAbilityStored)} para Iniciativa.`, 1000);
            addLogMessage(`${currentMonster.nome} rolou ${monsterInitiativeRoll} + ${monsterAbilityStored} (Habilidade) = ${parseInt(monsterInitiativeRoll) + parseInt(monsterAbilityStored)} para Iniciativa.`, 1000);
            currentTurnBlock = null;
            console.log("LOG: DOMContentLoaded - Informações de iniciativa adicionadas ao log.");
        }
        if (initiativeResult === 'player') {
            setTimeout(() => {
                startNewTurnBlock("Jogador");
                addLogMessage(`<p>Você venceu a Iniciativa e atacará primeiro.</p>`, 1000);
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
                addLogMessage(`<p>${currentMonster.nome} venceu a Iniciativa e atacará primeiro.</p>`, 1000);
                if (attackOptionsDiv) {
                    attackOptionsDiv.style.display = 'none';
                    console.log("LOG: DOMContentLoaded - Iniciativa do monstro vencida. Escondendo opções de ataque.");
                }
                isPlayerTurn = false;
                console.log("LOG: DOMContentLoaded - Iniciativa do monstro vencida. attackOptionsDiv.style.display:", attackOptionsDiv.style.display, "isPlayerTurn:", isPlayerTurn);
                monsterAttack(); // Monstro ataca primeiro
            }, 500);
        } else if (initiativeResult === 'tie') {
            addLogMessage(`<p>Houve um empate na Iniciativa!</p>`, 1000);
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

                        playerMaxHealth = playerData.energy?.initial ? parseInt(playerData.energy.initial) : playerHealth;
                        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
                        // ******************************************
                        
                        const inventarioButton = document.getElementById("abrir-inventario");
const playerHealthDisplay = document.getElementById("player-health");
if (inventarioButton) {
    if (!battleStarted) { // Só habilita se a batalha não tiver começado
        inventarioButton.disabled = false;
        inventarioButton.style.display = 'block';
    } else {
        inventarioButton.disabled = true;
        inventarioButton.style.display = 'none';
    }
    console.log("LOG: onAuthStateChanged - Estado do botão de inventário atualizado.");
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
        battleStarted = true; // Marca que a batalha começou
        
        // Desabilita o botão de inventário
        const inventarioButton = document.getElementById("abrir-inventario");
        if (inventarioButton) {
            inventarioButton.disabled = true;
            inventarioButton.style.display = 'none'; // Opcional: esconde o botão completamente
        }
        
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
                                await addLogMessage(`Você rolou ${playerRoll} + ${playerAbilityValue} (Habilidade) = ${playerRoll + playerAbilityValue} em um D20 para Iniciativa.`, 1000);
                                await addLogMessage(`${currentMonster.nome} rolou ${monsterRoll} + ${monsterAbilityValue} (Habilidade) = ${monsterRoll + monsterAbilityValue} em um D20 para Iniciativa.`, 1000);
                                currentTurnBlock = null; // Reset current turn block

                                let initiativeWinner = '';
                                if (playerRoll + playerAbilityValue > monsterRoll + monsterAbilityValue) {
                                    setTimeout(async () => {
                                        startNewTurnBlock("Jogador");
                                        await addLogMessage(`<p>Você venceu a Iniciativa! Você ataca primeiro.</p>`, 1000);
                                        if (attackOptionsDiv) {
                                            console.log("LOG: onAuthStateChanged - Iniciativa do jogador vencida - Antes de exibir opções, attackOptionsDiv:", attackOptionsDiv); // ADICIONADO
                                            attackOptionsDiv.style.display = 'block';
                                            // Mostrar o botão de ataque corpo a corpo
                                            if (atacarCorpoACorpoButton) {
                                                ;
                                            }
                                            console.log("LOG: onAuthStateChanged - Jogador venceu a iniciativa, exibindo opções de ataque.");
                                            await addLogMessage(`Turno do Jogador`, 1000); // Adicionado log do Turno do Jogador
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
                                        await addLogMessage(`<p>${currentMonster.nome} venceu a Iniciativa e atacará primeiro.</p>`, 1000);
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
                       // --- INÍCIO DO TRECHO 2: Adicionar o listener para 'rolar-localizacao' ---
const rollLocationBtn = document.getElementById("rolar-localizacao");
const rollDamageBtn = document.getElementById("rolar-dano");

if (rollLocationBtn) {
    rollLocationBtn.addEventListener('click', async () => {
        console.log("LOG: Botão 'Rolar Localização' clicado.");
        rollLocationBtn.disabled = true; // Desabilita após clicar
        rollLocationBtn.style.display = 'none'; // Esconde após clicar
        
// Verifica se o contexto SIFER foi iniciado pelo botão de ataque
    if (typeof window.siferContext !== 'object' || window.siferContext === null) {
         console.error("LOG: Erro - Contexto SIFER não foi iniciado corretamente!");
         await addLogMessage("Erro: Fluxo SIFER não iniciado.", 0);
         // Tenta resetar ou passar turno
         resetActionButtons(); // Chama uma função para resetar botões (se existir) ou habilita ataque manualmente
         // if (typeof endPlayerTurn === 'function') { endPlayerTurn(); }
         return;
    }

        const locationRoll = Math.floor(Math.random() * 20) + 1;
        console.log("LOG: SIFER - Jogador rolou localização:", locationRoll);
        await addLogMessage(`Rolando um D20 para localização... <strong style="color: yellow;">${locationRoll}</strong>!`, 800);

        
        let locationName = "";
        let siferBonusDamage = 0;
    let bonusCalculationType = 'none'; // Tipo de cálculo: 'half', 'full', 'double'

    // Determina o local e o TIPO de cálculo do bônus
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

    // Log do resultado e instrução para rolar dano
    let bonusDesc = '';
    if (bonusCalculationType === 'half') bonusDesc = 'Metade do dano da arma';
    else if (bonusCalculationType === 'full') bonusDesc = 'Dano completo da arma';
    else if (bonusCalculationType === 'double') bonusDesc = 'Dobra do dano da arma!';
    await addLogMessage(`Alvo: ${locationName} (Bônus: ${bonusDesc}). Role o Dano!`, 800);

    // Salva a informação necessária para o botão de dano
    window.siferContext.locationRoll = locationRoll;
    window.siferContext.locationName = locationName;
    window.siferContext.bonusType = bonusCalculationType;
    console.log("LOG: Contexto SIFER atualizado para rolagem de dano:", window.siferContext);

        console.log(`LOG: Localização: ${locationName}, Bônus: ${siferBonusDamage}`);
        await addLogMessage(`Alvo: ${locationName}. Bônus SIFER: ${siferBonusDamage}.`, 800);


        // Exibe o botão para rolar o dano
        if (rollDamageBtn) {
            rollDamageBtn.style.display = "inline-block";
            rollDamageBtn.disabled = false;
            console.log("LOG: Botão 'Rolar Dano' habilitado.");
        } else {
            console.error("Botão 'Rolar Dano' não encontrado!");
        }
    });
}

// Listener para o botão "Rolar Dano"
// --- INÍCIO: NOVO CÓDIGO PARA O LISTENER 'rolar-dano' ---
    rolarDanoButton.addEventListener('click', async () => { // Adicionado async
        console.log("LOG: Botão 'DANO' clicado.");
        if (!isPlayerTurn) {
            await addLogMessage(`<p>Não é seu turno!</p>`, 1000);
            return;
        }

        // Desabilita todos botões durante o processamento do dano
        const actionButtons = document.querySelectorAll('#attack-options button');
        actionButtons.forEach(button => button.disabled = true);
        rolarDanoButton.style.display = 'none'; // Esconde o próprio botão de dano

        let totalDamage = 0;
        let baseDamageRoll = 0;
        let siferBonusDamage = 0;
        let isSiferDamage = false; // Flag para saber se é dano SIFER
        const playerDamageDice = playerData?.dano || "1"; // Pega o dado de dano do jogador

        // Verifica se estamos no contexto SIFER (definido pelo botão de localização)

        if (window.siferContext && window.siferContext.bonusType) {
    const { bonusType, locationName, damageStage } = window.siferContext;

    if (!damageStage || damageStage === 'base') {
        // Rolar apenas o dano base
        baseDamageRoll = rollDice(playerDamageDice);
        window.siferContext.baseDamageRoll = baseDamageRoll;
        window.siferContext.damageStage = 'bonus';

        await addLogMessage(`Dano base rolado: ${baseDamageRoll}. Agora role o bônus de ${locationName}.`, 800);

        // Reexibe o botão para o próximo clique
        rolarDanoButton.style.display = 'inline-block';
        rolarDanoButton.disabled = false;
        return;
    } else if (damageStage === 'bonus') {
        // Agora rola o bônus
        const weaponDamageRollForBonus = rollDice(playerDamageDice);

        if (bonusType === 'half') {
            siferBonusDamage = Math.ceil(weaponDamageRollForBonus / 2);
        } else if (bonusType === 'full') {
            siferBonusDamage = weaponDamageRollForBonus;
        } else if (bonusType === 'double') {
            siferBonusDamage = weaponDamageRollForBonus * 2;
        }

        baseDamageRoll = window.siferContext.baseDamageRoll || 0;
        totalDamage = baseDamageRoll + siferBonusDamage;

        await addLogMessage(`Rolou bônus SIFER (${locationName}): ${siferBonusDamage}.`, 800);
        await addLogMessage(`Dano total: <strong style="color:yellow;">${totalDamage}</strong>.`, 1000);

        window.siferContext = null; // Limpa contexto
    }

        } else {
            // Lógica de Dano Normal
            isSiferDamage = false;
            console.log("LOG: Processando Dano Normal...");
            await addLogMessage(`Rolagem de Dano Normal`, 1000);
             baseDamageRoll = rollDice(playerDamageDice); // Rola o dano normal
             totalDamage = baseDamageRoll; // Dano total é só o base

             console.log("LOG: Botão 'DANO' - Dano normal rolado:", totalDamage);
             await addLogMessage(`Você rolou ${totalDamage} de dano (${playerDamageDice})!`, 1000);
        }

        // --- Aplicação do Dano e Fim do Turno (Comum a SIFER e Normal) ---
        if (totalDamage > 0) { // Só aplica se houver dano
            console.log(`Aplicando ${totalDamage} de dano ao monstro.`);
            currentMonster.pontosDeEnergia -= totalDamage;
            currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia); // Garante não ficar negativo

            await addLogMessage(`${currentMonster.nome} sofreu ${totalDamage} de dano.`, 800);

            atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
            await addLogMessage(`Energia restante do ${currentMonster.nome}: ${currentMonster.pontosDeEnergia}.`, 1000);

            // Salva estado (precisa de userId e monsterName no escopo)
            const user = auth.currentUser; // Pega o usuário atual
            if (userId && monsterName && currentMonster) { // Verifica se as variáveis globais estão ok
                 await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
            } else {
                 console.error("Erro ao salvar estado: userId, monsterName ou currentMonster não definidos.");
            }

        } else {
            console.log("Dano total foi zero, nenhum dano aplicado.");
            await addLogMessage("Dano calculado foi zero.", 800);
        }


        // Verifica derrota e passa o turno
        if (currentMonster.pontosDeEnergia <= 0) {
            console.log(`LOG: Monstro derrotado após ${isSiferDamage ? 'SIFER' : 'Dano Normal'}!`);
            await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
            isPlayerTurn = false; // Garante que o turno não continue
            // Chama handlePostBattle ou lógica similar
            if (typeof handlePostBattle === 'function') {
                 handlePostBattle();
            } else {
                console.error("Função handlePostBattle não definida.");
                 // Fallback simples
                 const lootBtn = document.getElementById('loot-button');
                 const mapBtn = document.getElementById('back-to-map-button');
                 if (lootBtn && currentMonster.drops?.length > 0) lootBtn.style.display = 'block';
                 if (mapBtn) mapBtn.style.display = 'block';
                 if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
            }
        } else {
            // Passa o turno para o monstro
            console.log(`LOG: Monstro sobreviveu ao ${isSiferDamage ? 'SIFER' : 'Dano Normal'}. Passando turno.`);
            // Usa a função endPlayerTurn para padronizar o fim do turno
            if (typeof endPlayerTurn === 'function') {
                endPlayerTurn();
            } else {
                 console.error(`LOG: Função endPlayerTurn não encontrada!`);
                 isPlayerTurn = false;
                 setTimeout(() => monsterAttack(), 1500); // Fallback
            }
        }
        // --- Fim da Aplicação do Dano ---
    });
    // --- FIM: NOVO CÓDIGO PARA O LISTENER 'rolar-dano' ---
// --- FIM DO TRECHO PARA 'rolar-localizacao' ---

                    // Lógica para o botão "Corpo a Corpo"
                    // --- INÍCIO DO TRECHO 1: Substituir o listener de 'atacar-corpo-a-corpo' ---
if (atacarCorpoACorpoButton) {
    atacarCorpoACorpoButton.addEventListener('click', async () => { // Ou .onclick = async () => {
        if (!isPlayerTurn || playerHealth <= 0 || !currentMonster || currentMonster.pontosDeEnergia <= 0) {
            console.log("LOG: Ataque inválido (Não é seu turno ou batalha acabou?). Retornando.");
            return;
        }
        console.log("LOG: Botão 'Atacar Corpo a Corpo' clicado.");

        // Desabilita TODOS os botões de ação inicialmente
        const actionButtons = document.querySelectorAll('#attack-options button');
        actionButtons.forEach(button => button.disabled = true);

        //const playerAttackRollRaw =  20; // PARA TESTE 
        const playerAttackRollRaw = Math.floor(Math.random() * 20) + 1; // ALEATÓRIO NORMAL
        const playerAttackRollTotal = playerAttackRollRaw + playerAbilityValue;
        const monsterDefense = currentMonster.couraça || 0;

        await addLogMessage(`Rolando ataque: ${playerAttackRollRaw} + ${playerAbilityValue} (Hab) = ${playerAttackRollTotal} vs Couraça ${monsterDefense}`, 1000);

        // *** LÓGICA SIFER (NATURAL 20) ***
        if (playerAttackRollRaw === 20) {
            console.log("LOG: SIFER - Acerto Crítico! Aguardando rolagem de localização.");
            await addLogMessage(`<strong style="color: orange;">ACERTO CRÍTICO (SIFER)!</strong> Role a localização!`, 500);

            // Mostra botão para o jogador rolar a localização
            const rollLocationBtn = document.getElementById("rolar-localizacao");
            if (rollLocationBtn) {
                rollLocationBtn.style.display = "inline-block"; // Torna o botão visível
                rollLocationBtn.disabled = false; // Habilita o botão
                rollLocationBtn.focus(); // Dá foco ao botão (opcional)

                // Garante que o botão de ataque normal fique desabilitado
                atacarCorpoACorpoButton.disabled = true;

                // Apenas inicia/limpa o contexto SIFER para indicar o fluxo crítico
window.siferContext = {};
console.log("LOG: Contexto SIFER iniciado/limpo para rolagem de localização.");

            } else {
                console.error("Botão 'rolar-localizacao' não encontrado no HTML!");
                // O que fazer se o botão não existe? Talvez só passar o turno?
                // Por segurança, vamos apenas logar o erro e não fazer nada.
                // Considere adicionar o botão ao seu HTML.
                 await addLogMessage(`Erro: Botão 'Rolar Localização' não encontrado. Não é possível continuar o crítico.`, 0);
                 // Talvez chamar endPlayerTurn() aqui? Ou deixar o jogador "preso"?
                 // Por ora, não faz nada.
            }
            // Importante: Não continua daqui, espera o clique no botão "rolar-localizacao"
            // A função return; foi removida daqui de propósito, o fluxo espera

        // --->>> *** ADICIONE A CHAVE DE FECHAMENTO AQUI *** <<<---
        } else {
             // *** LÓGICA ORIGINAL DE ACERTO/ERRO (se não for 20 natural) ***
             if (playerAttackRollTotal >= monsterDefense) {
                 // LÓGICA ORIGINAL DE ACERTO (mostra botão rolar-dano, etc.)
                 console.log("LOG: Ataque normal acertou.");
                 atacarCorpoACorpoButton.style.display = 'none'; // Esconde o botão de ataque
                 atacarCorpoACorpoButton.disabled = true; // Também desabilita o botão
                 if(rolarDanoButton) rolarDanoButton.style.display = 'inline-block'; // Mostra o de dano

                 await addLogMessage(`Seu golpe atinge em cheio o ${currentMonster.nome}! Role o dano.`, 1000);

                 window.siferContext = null; // Garante que não estamos em fluxo SIFER

                 // Habilita APENAS o botão de rolar dano
                 // (actionButtons já estão desabilitados desde o início do listener)
                 if(rolarDanoButton) rolarDanoButton.disabled = false;

             } else {
                  // LÓGICA ORIGINAL DE ERRO
                  console.log("LOG: Ataque normal errou.");
                  await addLogMessage(`Seu ataque passa de raspão no ${currentMonster.nome}.`, 1000);

                   // Passa o turno para o monstro
                   if (typeof endPlayerTurn === 'function') {
                        endPlayerTurn();
                   } else {
                        console.error("LOG: Função endPlayerTurn não encontrada após erro de ataque.");
                        isPlayerTurn = false;
                        setTimeout(() => monsterAttack(), 1500); // Fallback
                   }
             }
             // *** FIM DA LÓGICA ORIGINAL DE ACERTO/ERRO ***
        }

        // A reabilitação dos botões ocorrerá em startPlayerTurn() ou após rolar dano/localização

    });
    console.log("LOG: onAuthStateChanged - Event listener MODIFICADO adicionado ao botão 'Atacar Corpo a Corpo'.");
} else {
    console.error("LOG: Botão 'Atacar Corpo a Corpo' não encontrado (ID: atacar-corpo-a-corpo)");
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
