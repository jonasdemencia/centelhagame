// batalha.js - Versão Corrigida (com config inline)

// Importações do Firebase (SDKs necessários)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
// REMOVIDO: import firebaseConfig from './firebase-config.js';

// --- Configuração do Firebase (Definida diretamente aqui) ---
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw", // Substitua pela sua chave real se esta for placeholder
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// --- Inicialização do Firebase ---
console.log('LOG: batalha.js carregado.');
let app, auth, database;
try {
    console.log('LOG: Inicializando Firebase com config inline.');
    // Inicializa usando a constante definida acima
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('LOG: Firebase inicializado.');
} catch (error) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase.", error);
    alert("Erro ao conectar com o servidor. Verifique sua configuração do Firebase e a conexão.");
    // Considerar desabilitar a interface ou mostrar uma mensagem permanente
}

// --- Variáveis Globais ---
let userId = null;
let monsterName = '';
let monsterData = null;
let monsterStats = {};
let playerStats = { energia: 0, habilidade: 0 };
let initiativeResult = { player: 0, monster: 0, playerBonus: 0, monsterBonus: 0, winner: null };
let currentTurn = null;
let battleEnded = false;
let currentTurnBlock = null;

// Elementos do DOM
let monsterNameDisplay, monsterEnergyDisplay, playerEnergyDisplay;
let fightButton, rollInitiativeButton, attackOptions, meleeAttackButton; // Removidos rangeAttackButton, damageButton se não existirem
let logContainer;
let monsterImage;
let inventoryButton;
let lootSection;
let monsterHealthBar, playerHealthBar; // Adicionado para barras de vida

// --- Funções Utilitárias ---

function getUrlParameter(name) {
    // console.log(`LOG: getUrlParameter chamado com: ${name}`); // Logs podem ser removidos se estiver funcionando
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    const value = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    // console.log(`LOG: getUrlParameter retornando: ${value}`);
    return value;
}

function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

function addLogMessage(message, type = 'normal') {
    if (!logContainer) {
        console.error("ERRO: Elemento 'battleLog' (logContainer) não encontrado no DOM ao tentar adicionar mensagem.");
        return;
    }
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.classList.add(`log-${type}`);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logEntry.textContent = `[${timestamp}] ${message}`;

    if (type === 'turno') {
        currentTurnBlock = document.createElement('div');
        currentTurnBlock.classList.add('turn-block');
        logContainer.appendChild(currentTurnBlock);
        currentTurnBlock.appendChild(logEntry);
    } else if (currentTurnBlock) {
        currentTurnBlock.appendChild(logEntry);
    } else {
        logContainer.appendChild(logEntry);
    }
    logContainer.scrollTop = logContainer.scrollHeight;
}

// --- Funções de Carregamento e Estado ---

async function loadMonsterData(monsterName) {
    if (!database) {
        console.error("ERRO: Banco de dados Firebase não inicializado ao tentar carregar dados do monstro.");
        return null;
    }
    const monsterRef = ref(database, `monstros/${monsterName}`);
    try {
        const snapshot = await get(monsterRef);
        if (snapshot.exists()) {
            console.log("LOG: Dados do monstro carregados:", snapshot.val());
            return snapshot.val();
        } else {
            console.error(`ERRO: Monstro "${monsterName}" não encontrado no banco de dados.`);
            addLogMessage(`Erro: Monstro "${monsterName}" não encontrado.`, "erro");
            return null;
        }
    } catch (error) {
        console.error("ERRO ao carregar dados do monstro:", error);
        addLogMessage("Erro ao carregar dados do monstro.", "erro");
        return null;
    }
}

async function loadPlayerData(userId) {
    if (!database) {
        console.error("ERRO: Banco de dados Firebase não inicializado ao tentar carregar dados do jogador.");
        return null;
    }
    const playerRef = ref(database, `users/${userId}/ficha`);
    try {
        const snapshot = await get(playerRef);
        if (snapshot.exists()) {
            console.log("LOG: Dados do jogador carregados:", snapshot.val());
            return snapshot.val();
        } else {
            console.warn(`WARN: Ficha do jogador com ID "${userId}" não encontrada.`);
            addLogMessage("Ficha do jogador não encontrada.", "erro");
            return { energia_atual: 10, habilidade: 1 }; // Padrão se não achar
        }
    } catch (error) {
        console.error("ERRO ao carregar dados do jogador:", error);
        addLogMessage("Erro ao carregar dados do jogador.", "erro");
        return null;
    }
}

async function saveBattleState() { // Opcional, implementar se quiser salvar/continuar
     if (!userId || !monsterName || !database || battleEnded) return;
     // ... (lógica para salvar no Firebase) ...
     console.log("LOG: Estado da batalha salvo (se implementado).");
 }

 async function loadBattleState(userId, monsterName) { // Opcional
     if (!userId || !monsterName || !database) return null;
     // ... (lógica para carregar do Firebase) ...
     console.log("LOG: Estado da batalha carregado (se implementado e encontrado).");
     return null; // Retorna null por padrão se não implementado
 }

 async function clearBattleState(userId, monsterName) {
     if (!userId || !monsterName || !database) return;
     const battleStateRef = ref(database, `battleStates/${userId}/${monsterName}`);
     try {
         await remove(battleStateRef);
         console.log("LOG: Estado da batalha removido do Firebase.");
     } catch (error) {
         // Não é um erro crítico se não existia, então pode ser só um warning
         console.warn("WARN: Não foi possível remover estado da batalha (pode não existir):", error.message);
     }
 }

// --- Funções de Interface (UI) ---

function updateMonsterEnergyDisplay() {
    if (monsterEnergyDisplay && monsterStats && monsterData) {
        const currentEnergy = monsterStats.energia || 0;
        const baseEnergy = monsterData.energia_base || 1; // Evitar divisão por zero
        monsterEnergyDisplay.textContent = `Energia: ${currentEnergy} / ${monsterData.energia_base}`;

        if (monsterHealthBar) {
            const healthPercentage = Math.max(0, (currentEnergy / baseEnergy) * 100);
            monsterHealthBar.style.width = `${healthPercentage}%`;
            // Mudar cor
            if (healthPercentage < 30) monsterHealthBar.style.backgroundColor = 'red';
            else if (healthPercentage < 60) monsterHealthBar.style.backgroundColor = 'orange';
            else monsterHealthBar.style.backgroundColor = '#4caf50'; // Verde
        }
    } else {
        console.warn("WARN: Não foi possível atualizar a energia do monstro (elemento ou dados faltando).");
        if (monsterEnergyDisplay) monsterEnergyDisplay.textContent = "Energia: ? / ?";
    }
}

function updatePlayerEnergyDisplay() {
    if (playerEnergyDisplay && playerStats) {
        const currentEnergy = playerStats.energia || 0;
        // Assumindo que playerStats pode ter energia_base após carregar dados
        const baseEnergy = playerStats.energia_base || currentEnergy || 1; // Usa base, senão atual, senão 1
        playerEnergyDisplay.textContent = `Sua Energia: ${currentEnergy}`; // Simplificado, pode adicionar / baseEnergy se quiser

        if(playerHealthBar){
             const healthPercentage = Math.max(0,(currentEnergy / baseEnergy) * 100);
             playerHealthBar.style.width = `${healthPercentage}%`;
              // Mudar cor (opcional)
             if (healthPercentage < 30) playerHealthBar.style.backgroundColor = 'red';
             else if (healthPercentage < 60) playerHealthBar.style.backgroundColor = 'orange';
             else playerHealthBar.style.backgroundColor = '#4caf50'; // Verde
        }

    } else {
        console.warn("WARN: Não foi possível atualizar a energia do jogador (elemento ou dados faltando).");
        if (playerEnergyDisplay) playerEnergyDisplay.textContent = "Sua Energia: ?";
    }
}

function updateMonsterImage() {
    if (monsterImage && monsterData && monsterData.imagem_url) {
        monsterImage.src = monsterData.imagem_url;
        monsterImage.alt = monsterName;
        console.log("LOG: Imagem do monstro carregada.");
    } else if (monsterImage) {
         console.warn("WARN: URL da imagem do monstro não encontrada. Usando placeholder ou vazio.");
         monsterImage.alt = "Imagem indisponível";
         // monsterImage.src = 'path/to/placeholder.png'; // Definir placeholder se tiver um
    }
}

function showFightButton() {
    if (fightButton) fightButton.style.display = 'block';
    if (rollInitiativeButton) rollInitiativeButton.style.display = 'none';
    if (attackOptions) attackOptions.style.display = 'none';
}
function showInitiativeButton() {
    if (fightButton) fightButton.style.display = 'none';
    if (rollInitiativeButton) rollInitiativeButton.style.display = 'block';
    if (attackOptions) attackOptions.style.display = 'none';
}
function showAttackOptions() {
    if (fightButton) fightButton.style.display = 'none';
    if (rollInitiativeButton) rollInitiativeButton.style.display = 'none';
    if (attackOptions) attackOptions.style.display = 'block';
}
function hideAllCombatControls() {
    if (fightButton) fightButton.style.display = 'none';
    if (rollInitiativeButton) rollInitiativeButton.style.display = 'none';
    if (attackOptions) attackOptions.style.display = 'none';
}

function disableInventoryButton() {
    if (inventoryButton) {
        inventoryButton.disabled = true;
        inventoryButton.style.opacity = 0.5;
        console.log("LOG: Botão de inventário desativado.");
    }
}
function enableInventoryButton() {
    if (inventoryButton) {
        inventoryButton.disabled = false;
        inventoryButton.style.opacity = 1.0;
        console.log("LOG: Botão de inventário ativado.");
    }
}

// --- Lógica Principal da Batalha ---

function endBattle(isVictory) {
    if (battleEnded) {
        console.log("LOG: Tentativa de finalizar batalha que já terminou.");
        return;
    }
    battleEnded = true;
    console.log(`LOG: Batalha finalizada. Resultado: ${isVictory ? 'Vitória' : 'Derrota'}`);
    addLogMessage(`--- Batalha Finalizada ---`, "sistema");

    hideAllCombatControls();

    if (userId && monsterName) {
        clearBattleState(userId, monsterName);
    } else {
        console.warn("WARN: userId ou monsterName faltando para limpar estado da batalha.");
    }

    if (isVictory) {
        addLogMessage("Você venceu!", "vitoria");
        if (lootSection) {
            lootSection.style.display = 'block';
            console.log("LOG: Seção de Loot exibida.");
            // TODO: Implementar a função generateAndDisplayLoot(monsterName);
            addLogMessage("Colete seu loot!", "sistema");
             // Exemplo: Adicionar botão para sair após coletar
             const collectButton = document.getElementById('collectLootButton');
             if(collectButton) {
                 collectButton.onclick = () => {
                    // Lógica para adicionar loot ao inventário (Firebase)
                    console.log("LOG: Loot coletado (lógica a implementar).");
                    // Redirecionar para o mapa ou index
                    window.location.href = 'index.html';
                 };
             }
        } else {
            console.error("ERRO: Elemento 'lootSection' não encontrado no DOM.");
            addLogMessage("Erro ao tentar exibir a seção de loot.", "erro");
        }
    } else {
        addLogMessage("Você foi derrotado.", "derrota");
        console.log("LOG: Batalha terminou em derrota.");
        // TODO: Mostrar opções de derrota (voltar mapa, tentar novamente?)
        // Exemplo: window.alert("Você foi derrotado!"); window.location.href = 'index.html';
    }

    enableInventoryButton();
}

function rollInitiative() {
    if (!playerStats || !monsterStats) {
        console.error("ERRO: Estatísticas faltando para rolar iniciativa.");
        addLogMessage("Erro interno ao rolar iniciativa.", "erro");
        return;
    }
    if (battleEnded) return; // Não faz nada se já acabou

    initiativeResult.player = rollD6();
    initiativeResult.monster = rollD6();
    initiativeResult.playerBonus = playerStats.habilidade || 0;
    initiativeResult.monsterBonus = monsterStats.habilidade || 0;

    const playerTotal = initiativeResult.player + initiativeResult.playerBonus;
    const monsterTotal = initiativeResult.monster + initiativeResult.monsterBonus;

    addLogMessage(`Iniciativa: Você (${initiativeResult.player} + ${initiativeResult.playerBonus} = ${playerTotal}) vs ${monsterName} (${initiativeResult.monster} + ${initiativeResult.monsterBonus} = ${monsterTotal})`, "info");

    if (playerTotal >= monsterTotal) {
        initiativeResult.winner = 'player';
        currentTurn = 'player';
        addLogMessage("Você ganhou a iniciativa!", "vitoria");
        addLogMessage("Seu Turno.", "turno");
        showAttackOptions();
    } else {
        initiativeResult.winner = 'monster';
        currentTurn = 'monster';
        addLogMessage(`${monsterName} ganhou a iniciativa!`, "derrota");
        addLogMessage(`Turno do ${monsterName}.`, "turno");
        setTimeout(async () => {
             if (!battleEnded) {
                 await monsterTurn();
                 if (!battleEnded) {
                    currentTurn = 'player';
                    addLogMessage("Seu Turno.", "turno");
                    showAttackOptions();
                 }
             }
         }, 50); // Pequeno delay para UI atualizar
    }
    // saveBattleState(); // Opcional
}

async function monsterTurn() {
    if (battleEnded || currentTurn !== 'monster') return;

    console.log("LOG: Iniciando turno do monstro.");
    // Lógica de ataque do monstro (simplificada)
    const attackRoll = rollD6() + rollD6();
    const defenseRoll = rollD6() + rollD6(); // Simples defesa do jogador
    const monsterAttackPower = monsterStats.habilidade || 1;

    addLogMessage(`${monsterName} ataca! (Rolagem: ${attackRoll} vs Sua Defesa: ${defenseRoll})`, "info");

    if (attackRoll + monsterAttackPower > defenseRoll + (playerStats.habilidade || 0)) {
        const damageDealt = Math.max(1, monsterData.dano_base || 1);
        console.log(`LOG: Ataque do monstro acertou! Dano: ${damageDealt}`);
        const battleOver = await handleMonsterAttackResult(damageDealt);
         if (battleOver) return;
    } else {
        addLogMessage(`${monsterName} errou o ataque!`, "info");
        console.log("LOG: Ataque do monstro errou.");
    }

    console.log("LOG: Fim do turno do monstro.");
    // A transição de turno é feita na função chamadora (rollInitiative ou handlePlayerAttackResult)
    // saveBattleState(); // Opcional
}

async function handleMonsterAttackResult(damageDealt) {
    if (battleEnded) return true;

    playerStats.energia -= damageDealt;
    addLogMessage(`${monsterName} causou ${damageDealt} de dano a você.`, "dano-monstro");
    updatePlayerEnergyDisplay();

    if (playerStats.energia <= 0) {
        playerStats.energia = 0;
        updatePlayerEnergyDisplay();
        endBattle(false); // Derrota
        return true;
    }
    return false; // Batalha continua
}

async function playerAttack(attackType) {
    if (battleEnded || currentTurn !== 'player') return;

    console.log(`LOG: Jogador atacando: ${attackType}`);
    hideAttackOptions();

    const playerAttackRoll = rollD6() + rollD6();
    const monsterDefenseRoll = rollD6() + rollD6();
    const playerAttackPower = playerStats.habilidade || 0;
    const monsterDefensePower = monsterStats.defesa || 0; // Supondo 'defesa' no monstro

    addLogMessage(`Você ataca (${attackType})! (Rolagem: ${playerAttackRoll} vs Defesa ${monsterName}: ${monsterDefenseRoll})`, "info");

    if (playerAttackRoll + playerAttackPower > monsterDefenseRoll + monsterDefensePower) {
        const baseDamage = playerStats.dano_base || 2; // Supondo dano base no jogador
        const totalDamage = Math.max(1, baseDamage); // Garante pelo menos 1
        console.log(`LOG: Ataque do jogador acertou! Dano: ${totalDamage}`);
        await handlePlayerAttackResult(totalDamage);
    } else {
        addLogMessage("Você errou o ataque!", "info");
        console.log("LOG: Ataque do jogador errou.");
        if (!battleEnded) {
             addLogMessage(`Turno do ${monsterName}.`, "turno");
             currentTurn = 'monster'; // Passa o turno
             await monsterTurn();
             if (!battleEnded) { // Se a batalha não acabou após o turno do monstro
                 currentTurn = 'player'; // Devolve o turno
                 addLogMessage("Seu Turno.", "turno");
                 showAttackOptions();
             }
        }
    }
    // saveBattleState(); // Opcional
}

async function handlePlayerAttackResult(damageDealt) {
    if (battleEnded) return;

    monsterStats.energia -= damageDealt;
    addLogMessage(`Você causou ${damageDealt} de dano ao ${monsterName}!`, "dano-jogador");
    updateMonsterEnergyDisplay();

    if (monsterStats.energia <= 0) {
        monsterStats.energia = 0;
        updateMonsterEnergyDisplay();
        endBattle(true); // Vitória
        return; // Sai, batalha acabou
    }

    // Se monstro sobreviveu, passa o turno
    console.log("LOG: Monstro sobreviveu.");
    addLogMessage(`Turno do ${monsterName}.`, "turno");
    currentTurn = 'monster'; // Passa o turno
    await monsterTurn();

    // Após o turno do monstro, se a batalha ainda não acabou, devolve pro jogador
    if (!battleEnded) {
        currentTurn = 'player';
        addLogMessage("Seu Turno.", "turno");
        showAttackOptions();
    }
}

// --- Inicialização e Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("LOG: DOMContentLoaded evento disparado.");

    // Obter referências aos elementos do DOM
    monsterNameDisplay = document.getElementById('monsterName');
    monsterEnergyDisplay = document.getElementById('monsterEnergy');
    playerEnergyDisplay = document.getElementById('playerEnergy');
    fightButton = document.getElementById('fightButton');
    rollInitiativeButton = document.getElementById('rollInitiativeButton');
    attackOptions = document.getElementById('attackOptions');
    meleeAttackButton = document.getElementById('meleeAttackButton');
    logContainer = document.getElementById('battleLog');
    monsterImage = document.getElementById('monsterImage');
    inventoryButton = document.getElementById('inventoryButton');
    lootSection = document.getElementById('lootSection');
    monsterHealthBar = document.getElementById('monsterHealthBar'); // Barra de vida monstro
    playerHealthBar = document.getElementById('playerHealthBar');   // Barra de vida jogador

    // Validar elementos essenciais
    if (!logContainer || !monsterNameDisplay || !monsterEnergyDisplay || !playerEnergyDisplay || !fightButton || !rollInitiativeButton || !attackOptions || !meleeAttackButton || !monsterImage || !lootSection) {
        console.error("ERRO CRÍTICO: Um ou mais elementos essenciais da interface não foram encontrados! Verifique os IDs no HTML.");
        alert("Erro ao carregar a interface da batalha. Verifique o console.");
        document.body.innerHTML = "<h1>Erro Crítico</h1><p>Não foi possível carregar a interface da batalha. Verifique os IDs dos elementos no HTML e o console do navegador.</p>"; // Trava a página com erro
        return;
    }
    console.log("LOG: Elementos do DOM referenciados.");

    monsterName = getUrlParameter('monstro');
    if (!monsterName) {
        console.error("ERRO: Nome do monstro não especificado na URL.");
        addLogMessage("Erro: Monstro não especificado.", "erro");
        monsterNameDisplay.textContent = "Monstro Desconhecido";
        hideAllCombatControls();
        return;
    }
    monsterNameDisplay.textContent = monsterName.charAt(0).toUpperCase() + monsterName.slice(1);

    // Configuração inicial da UI
    if (logContainer) logContainer.innerHTML = '';
    addLogMessage(`Preparando para lutar contra ${monsterName}...`, "sistema");
    showFightButton();
    enableInventoryButton();
    battleEnded = false;
    currentTurnBlock = null;
    updateMonsterEnergyDisplay(); // Zera display inicial
    updatePlayerEnergyDisplay(); // Zera display inicial

    // --- Autenticação e Carregamento de Dados ---
    if (auth) {
        onAuthStateChanged(auth, async (user) => {
            console.log("LOG: onAuthStateChanged status mudou.");
            if (user) {
                userId = user.uid;
                console.log(`LOG: Usuário logado. ID: ${userId}`);
                addLogMessage("Jogador autenticado.", "sistema");

                // Carrega dados do monstro PRIMEIRO
                monsterData = await loadMonsterData(monsterName);
                if (!monsterData) {
                    addLogMessage(`Erro fatal: Não foi possível carregar dados do ${monsterName}.`, "erro");
                    hideAllCombatControls(); return;
                }
                monsterStats = { ...monsterData, energia: monsterData.energia_base || 1 };
                updateMonsterEnergyDisplay();
                updateMonsterImage();
                console.log("LOG: Dados base do monstro definidos.");

                // Tenta carregar estado salvo (se implementado)
                const savedState = await loadBattleState(userId, monsterName);

                if (savedState /*&& confirm("Continuar batalha anterior?")*/) { // Desabilitado prompt por enquanto
                     console.log("LOG: Restaurando estado de batalha salvo (se implementado).");
                     // ... Lógica para restaurar estado ...
                     // Por enquanto, inicia nova batalha mesmo se achar estado salvo
                     addLogMessage("Iniciando nova batalha...", "sistema");
                      const playerData = await loadPlayerData(userId);
                      if (!playerData) {
                          addLogMessage("Erro fatal: Não foi possível carregar seus dados.", "erro");
                          hideAllCombatControls(); return;
                      }
                      playerStats = {
                          ...playerData, // Pega tudo da ficha
                          energia: playerData.energia_atual || playerData.energia_base || 10, // Prioriza atual
                          habilidade: playerData.habilidade || 1
                      };
                      playerStats.energia_base = playerData.energia_base || playerStats.energia; // Guarda base se tiver
                      updatePlayerEnergyDisplay();
                      showFightButton(); // Mostra Lutar para começar nova batalha


                } else {
                    console.log("LOG: Iniciando nova batalha.");
                    // Carrega dados do jogador
                    const playerData = await loadPlayerData(userId);
                    if (!playerData) {
                        addLogMessage("Erro fatal: Não foi possível carregar seus dados.", "erro");
                        hideAllCombatControls(); return;
                    }
                     playerStats = {
                        ...playerData, // Pega tudo da ficha
                        energia: playerData.energia_atual || playerData.energia_base || 10, // Prioriza atual
                        habilidade: playerData.habilidade || 1
                    };
                    playerStats.energia_base = playerData.energia_base || playerStats.energia; // Guarda base se tiver
                    console.log(`LOG: Dados do jogador carregados. Energia: ${playerStats.energia}, Habilidade: ${playerStats.habilidade}`);
                    updatePlayerEnergyDisplay();
                    showFightButton(); // Mostra Lutar para começar nova batalha
                }

                // Adiciona Listeners APÓS garantir que dados foram carregados
                if (fightButton && fightButton.style.display !== 'none') { // Só adiciona se botão estiver visível
                   // Remove listener antigo para evitar duplicação se onAuthStateChanged disparar de novo
                   fightButton.replaceWith(fightButton.cloneNode(true));
                   fightButton = document.getElementById('fightButton'); // Re-seleciona o botão clonado

                    fightButton.addEventListener('click', () => {
                        console.log("LOG: Botão 'Lutar' clicado.");
                        if(battleEnded) { // Segurança extra
                            console.warn("WARN: Botão Lutar clicado após fim da batalha.");
                            return;
                        }
                        addLogMessage("Batalha iniciada!", "sistema");
                        battleEnded = false;
                        currentTurnBlock = null;
                        disableInventoryButton();
                        showInitiativeButton();
                    });
                    console.log("LOG: Event listener adicionado ao botão 'Lutar'.");
                 } else {
                     console.log("LOG: Botão 'Lutar' não visível ou não encontrado, listener não adicionado.");
                 }


                 // Listener para Iniciativa (sempre adiciona, botão pode aparecer depois)
                 if (rollInitiativeButton) {
                      rollInitiativeButton.replaceWith(rollInitiativeButton.cloneNode(true));
                      rollInitiativeButton = document.getElementById('rollInitiativeButton');
                      rollInitiativeButton.addEventListener('click', () => {
                           if (battleEnded) return;
                           console.log("LOG: Botão 'Rolar Iniciativa' clicado.");
                           addLogMessage("Rolando iniciativa...", "info");
                           rollInitiative();
                       });
                      console.log("LOG: Event listener adicionado ao botão 'Rolar Iniciativa'.");
                 }

                 // Listener para Ataque Corpo a Corpo (sempre adiciona)
                 if (meleeAttackButton) {
                      meleeAttackButton.replaceWith(meleeAttackButton.cloneNode(true));
                      meleeAttackButton = document.getElementById('meleeAttackButton');
                      meleeAttackButton.addEventListener('click', () => {
                           if (battleEnded) return;
                           console.log("LOG: Botão 'Corpo a Corpo' clicado.");
                           playerAttack('Corpo a Corpo');
                       });
                      console.log("LOG: Event listener adicionado ao botão 'Corpo a Corpo'.");
                 }
                  console.log("LOG: Setup inicial da batalha concluído.");


            } else {
                userId = null;
                console.log("LOG: Usuário deslogado.");
                addLogMessage("Você não está logado. Faça login para batalhar.", "erro");
                hideAllCombatControls();
                // Opcional: Redirecionar para login
                // window.location.href = 'login.html';
            }
        });
    } else {
         console.error("ERRO CRÍTICO: Módulo de autenticação do Firebase não inicializado.");
         addLogMessage("Erro crítico: Falha na autenticação.", "erro");
         alert("Erro crítico de autenticação. A batalha não pode começar.");
         hideAllCombatControls();
    }

    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
});

console.log('LOG: Fim do script batalha.js');
