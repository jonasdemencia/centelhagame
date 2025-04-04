// batalha.js - Versão Corrigida e Comentada

// Importações do Firebase (ajuste os caminhos se necessário)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import firebaseConfig from './firebase-config.js'; // Seu arquivo de configuração

// --- Inicialização do Firebase ---
console.log('LOG: batalha.js carregado.');
let app, auth, database;
try {
    console.log('LOG: Inicializando Firebase.');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('LOG: Firebase inicializado.');
} catch (error) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase.", error);
    alert("Erro ao conectar com o servidor. Verifique sua configuração do Firebase e a conexão.");
}

// --- Variáveis Globais ---
let userId = null;
let monsterName = '';
let monsterData = null; // Dados base do monstro (imutáveis durante a batalha)
let monsterStats = {};  // Estado atual do monstro (energia, etc.)
let playerStats = { energia: 0, habilidade: 0 }; // Estado atual do jogador
let initiativeResult = { player: 0, monster: 0, playerBonus: 0, monsterBonus: 0, winner: null };
let currentTurn = null; // 'player' ou 'monster'
let battleEnded = false; // Flag para controlar o fim da batalha
let currentTurnBlock = null; // Referência ao DIV do turno atual no log

// Elementos do DOM (declarados aqui para acesso global, mas atribuídos após DOMContentLoaded)
let monsterNameDisplay, monsterEnergyDisplay, playerEnergyDisplay;
let fightButton, rollInitiativeButton, attackOptions, meleeAttackButton, rangeAttackButton, damageButton;
let logContainer;
let monsterImage;
let inventoryButton; // Assumindo que existe um botão de inventário geral
let lootSection; // A seção que será exibida no final

// --- Funções Utilitárias ---

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    console.log(`LOG: getUrlParameter chamado com: ${name}`);
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    const value = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    console.log(`LOG: getUrlParameter retornando: ${value}`);
    return value;
}

// Função para rolar um dado D6
function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

// Função para adicionar mensagens ao log de batalha (CORRIGIDA)
function addLogMessage(message, type = 'normal') {
    if (!logContainer) {
        console.error("ERRO: Elemento 'battleLog' (logContainer) não encontrado no DOM ao tentar adicionar mensagem.");
        return; // Não tenta adicionar se o container não existe
    }

    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.classList.add(`log-${type}`); // Adiciona classe baseada no tipo (ex: log-vitoria, log-dano-jogador)

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    // Usar textContent previne XSS se 'message' vier de fontes não confiáveis
    logEntry.textContent = `[${timestamp}] ${message}`;
    // Se precisar de HTML na mensagem (cuidado com XSS): logEntry.innerHTML = `<span>[${timestamp}]</span> ${message}`;

    if (type === 'turno') {
        // Cria um novo bloco de DIV para agrupar mensagens do turno
        currentTurnBlock = document.createElement('div');
        currentTurnBlock.classList.add('turn-block');
        logContainer.appendChild(currentTurnBlock);
        currentTurnBlock.appendChild(logEntry); // Adiciona a mensagem inicial do turno
    } else if (currentTurnBlock) {
        // Se já existe um bloco de turno, adiciona a mensagem a ele
        currentTurnBlock.appendChild(logEntry);
    } else {
        // Se não há bloco de turno ativo, adiciona diretamente ao container principal
        logContainer.appendChild(logEntry);
    }

    // Rola o log para a mensagem mais recente
    logContainer.scrollTop = logContainer.scrollHeight;
}


// --- Funções de Carregamento e Estado ---

// Carrega dados do monstro do Firebase
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

// Carrega dados do jogador do Firebase
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
            // Retornar um objeto padrão ou null? Depende de como o resto do código lida com isso.
            return { energia: 10, habilidade: 1 }; // Exemplo de padrão
        }
    } catch (error) {
        console.error("ERRO ao carregar dados do jogador:", error);
        addLogMessage("Erro ao carregar dados do jogador.", "erro");
        return null;
    }
}

// Salva o estado atual da batalha (energia, etc.) - Opcional
async function saveBattleState() {
     if (!userId || !monsterName || !database || battleEnded) return; // Não salva se não tiver dados ou a batalha acabou

     const battleStateRef = ref(database, `battleStates/${userId}/${monsterName}`);
     const state = {
         playerEnergy: playerStats.energia,
         monsterEnergy: monsterStats.energia,
         currentTurn: currentTurn,
         initiative: initiativeResult,
         timestamp: Date.now()
     };
     try {
         await set(battleStateRef, state);
         console.log("LOG: Estado da batalha salvo.");
     } catch (error) {
         console.error("ERRO ao salvar estado da batalha:", error);
     }
 }

// Carrega um estado de batalha salvo - Opcional
 async function loadBattleState(userId, monsterName) {
     if (!userId || !monsterName || !database) return null;

     const battleStateRef = ref(database, `battleStates/${userId}/${monsterName}`);
     try {
         const snapshot = await get(battleStateRef);
         if (snapshot.exists()) {
             console.log("LOG: Estado de batalha encontrado e carregado:", snapshot.val());
             return snapshot.val();
         } else {
             console.log("LOG: Nenhum estado de batalha salvo encontrado para este monstro.");
             return null;
         }
     } catch (error) {
         console.error("ERRO ao carregar estado da batalha:", error);
         return null;
     }
 }

 // Limpa o estado da batalha do Firebase ao finalizar
 async function clearBattleState(userId, monsterName) {
     if (!userId || !monsterName || !database) return;

     const battleStateRef = ref(database, `battleStates/${userId}/${monsterName}`);
     try {
         await remove(battleStateRef);
         console.log("LOG: Estado da batalha removido do Firebase.");
     } catch (error) {
         console.error("ERRO ao remover estado da batalha:", error);
         addLogMessage("Erro ao limpar estado da batalha no servidor.", "erro");
     }
 }

// --- Funções de Interface (UI) ---

// Atualiza a exibição da energia do monstro
function updateMonsterEnergyDisplay() {
    if (monsterEnergyDisplay && monsterStats && monsterData) {
        monsterEnergyDisplay.textContent = `Energia: ${monsterStats.energia} / ${monsterData.energia_base}`;
        // Adicionar lógica para barra de vida se existir
        const healthPercentage = (monsterStats.energia / monsterData.energia_base) * 100;
        const healthBar = document.getElementById('monsterHealthBar'); // Supondo que exista uma barra
        if(healthBar) {
            healthBar.style.width = `${Math.max(0, healthPercentage)}%`;
            // Mudar cor da barra com base na vida (opcional)
            if (healthPercentage < 30) healthBar.style.backgroundColor = 'red';
            else if (healthPercentage < 60) healthBar.style.backgroundColor = 'orange';
            else healthBar.style.backgroundColor = 'green';
        }

    } else {
        console.warn("WARN: Não foi possível atualizar a energia do monstro (elemento ou dados faltando).");
    }
}

// Atualiza a exibição da energia do jogador
function updatePlayerEnergyDisplay() {
    if (playerEnergyDisplay && playerStats) {
        // Se a energia base do jogador for conhecida (ex: carregada de `loadPlayerData`)
        // playerEnergyDisplay.textContent = `Sua Energia: ${playerStats.energia} / ${playerStats.energia_base}`;
        // Senão, apenas a atual:
        playerEnergyDisplay.textContent = `Sua Energia: ${playerStats.energia}`;
         // Adicionar lógica para barra de vida se existir
        // const playerHealthPercentage = (playerStats.energia / playerStats.energia_base) * 100;
        // ... (lógica da barra de vida do jogador) ...
    } else {
        console.warn("WARN: Não foi possível atualizar a energia do jogador (elemento ou dados faltando).");
    }
}

// Atualiza a imagem do monstro
function updateMonsterImage() {
    if (monsterImage && monsterData && monsterData.imagem_url) {
        monsterImage.src = monsterData.imagem_url;
        monsterImage.alt = monsterName; // Texto alternativo para acessibilidade
        console.log("LOG: Imagem do monstro carregada.");
    } else if (monsterImage) {
         console.warn("WARN: URL da imagem do monstro não encontrada nos dados. Usando placeholder ou deixando em branco.");
         // monsterImage.src = 'path/to/placeholder.png'; // Opcional: Imagem padrão
         monsterImage.alt = "Imagem do monstro indisponível";
    }
}

// Mostra/Esconde botões e opções
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

// Desativa/Reativa o botão de inventário durante a batalha
function disableInventoryButton() {
    if (inventoryButton) {
        inventoryButton.disabled = true;
        inventoryButton.style.opacity = 0.5; // Feedback visual
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

// Função chamada quando a batalha termina (vitória ou derrota) (AJUSTADA)
function endBattle(isVictory) {
    if (battleEnded) {
        console.log("LOG: Tentativa de finalizar batalha que já terminou.");
        return; // Previne execução múltipla
    }
    battleEnded = true; // Marca a batalha como finalizada
    console.log("LOG: Batalha finalizada.");
    addLogMessage(`--- Batalha Finalizada ---`, "sistema");

    hideAllCombatControls(); // Esconde todos os botões de combate

    // Limpar o estado da batalha no Firebase
    if (userId && monsterName) {
        clearBattleState(userId, monsterName);
    } else {
        console.warn("WARN: userId ou monsterName faltando para limpar estado da batalha.");
    }

    // Mostrar seção de loot APENAS se for vitória
    if (isVictory) {
        addLogMessage("Você venceu!", "vitoria");
        if (lootSection) {
            lootSection.style.display = 'block'; // Ou 'flex', etc., dependendo do seu CSS
            console.log("LOG: Seção de Loot exibida.");
            // ---------------------------------------------------------
            // TODO: CHAMAR A FUNÇÃO PARA GERAR E EXIBIR O LOOT REAL AQUI
            // Exemplo: generateAndDisplayLoot(monsterName);
            // ---------------------------------------------------------
            addLogMessage("Colete seu loot!", "sistema"); // Mensagem no log
        } else {
            console.error("ERRO: Elemento 'lootSection' não encontrado no DOM para exibir loot.");
            addLogMessage("Erro ao tentar exibir a seção de loot.", "erro");
        }
    } else {
        addLogMessage("Você foi derrotado.", "derrota");
        console.log("LOG: Batalha terminou em derrota. Nenhuma seção de loot exibida.");
        // TODO: Adicionar lógica para derrota (ex: botão "Voltar ao Mapa", etc.)
        // const defeatOptions = document.getElementById('defeatOptions');
        // if(defeatOptions) defeatOptions.style.display = 'block';
    }

    enableInventoryButton(); // Reabilita o inventário após a batalha
}


// Rola a iniciativa e determina quem começa
function rollInitiative() {
    if (!playerStats || !monsterStats) {
        console.error("ERRO: Estatísticas do jogador ou monstro não disponíveis para rolar iniciativa.");
        addLogMessage("Erro interno ao rolar iniciativa.", "erro");
        return;
    }

    initiativeResult.player = rollD6();
    initiativeResult.monster = rollD6();
    initiativeResult.playerBonus = playerStats.habilidade || 0; // Usa 0 se não definida
    initiativeResult.monsterBonus = monsterStats.habilidade || 0;

    const playerTotal = initiativeResult.player + initiativeResult.playerBonus;
    const monsterTotal = initiativeResult.monster + initiativeResult.monsterBonus;

    addLogMessage(`Iniciativa: Você rolou ${initiativeResult.player} (+${initiativeResult.playerBonus}) = ${playerTotal}`, "info");
    addLogMessage(`Iniciativa: ${monsterName} rolou ${initiativeResult.monster} (+${initiativeResult.monsterBonus}) = ${monsterTotal}`, "info");

    if (playerTotal >= monsterTotal) {
        initiativeResult.winner = 'player';
        currentTurn = 'player';
        addLogMessage("Você ganhou a iniciativa!", "vitoria");
        addLogMessage("Seu Turno.", "turno"); // Inicia o bloco de turno
        showAttackOptions();
    } else {
        initiativeResult.winner = 'monster';
        currentTurn = 'monster';
        addLogMessage(`${monsterName} ganhou a iniciativa!`, "derrota");
        addLogMessage(`Turno do ${monsterName}.`, "turno"); // Inicia o bloco de turno
        // Monstro ataca imediatamente após ganhar iniciativa
        // Precisamos garantir que monsterTurn seja async para esperar a conclusão
        // e que ele chame addLogMessage corretamente.
        // Envolver a chamada em setTimeout(0) garante que as mensagens de iniciativa apareçam antes do ataque.
         setTimeout(async () => {
             if (!battleEnded) { // Verifica se a batalha não acabou por algum motivo
                 await monsterTurn();
                 // Após o turno do monstro (se a batalha não acabou), é a vez do jogador
                 if (!battleEnded) {
                    currentTurn = 'player';
                    addLogMessage("Seu Turno.", "turno");
                    showAttackOptions();
                 }
             }
         }, 0); // Pequeno delay para renderização do log
    }
    // saveBattleState(); // Salva o estado após iniciativa (opcional)
}

// Lógica do turno do monstro
async function monsterTurn() {
    if (battleEnded) return; // Não faz nada se a batalha acabou

    console.log("LOG: Iniciando turno do monstro.");
    // Simples: Monstro sempre ataca
    // Cálculo de dano (exemplo simples baseado na habilidade)
    const attackRoll = rollD6() + rollD6(); // Monstro rola 2D6 para ataque
    const defenseRoll = rollD6() + rollD6(); // Jogador rola 2D6 para defesa (ou use armadura, etc.)
    const monsterAttackPower = monsterStats.habilidade || 1; // Poder de ataque base

    addLogMessage(`${monsterName} prepara um ataque (Rolagem: ${attackRoll} vs Sua Defesa: ${defenseRoll})`, "info");

    // Lógica de acerto (exemplo)
    if (attackRoll + monsterAttackPower > defenseRoll + playerStats.habilidade) { // Ataque > Defesa
        // Calcular dano - Exemplo: Dano fixo ou baseado na diferença
        const damageDealt = Math.max(1, monsterData.dano_base || 1); // Garante pelo menos 1 de dano
        console.log(`LOG: Ataque do monstro acertou! Dano: ${damageDealt}`);
        // A função handleMonsterAttackResult cuidará de aplicar o dano e verificar derrota
        const battleOver = await handleMonsterAttackResult(damageDealt); // Passa o dano calculado
         if (battleOver) return; // Se a batalha terminou, sai

    } else {
        addLogMessage(`${monsterName} errou o ataque!`, "info");
        console.log("LOG: Ataque do monstro errou.");
    }

    // O turno passa para o jogador APÓS o ataque do monstro ser resolvido (se a batalha não acabou)
    // Isso agora é feito na função que chamou monsterTurn (rollInitiative ou handlePlayerAttackResult)
     console.log("LOG: Fim do turno do monstro.");
     // saveBattleState(); // Salva o estado após turno do monstro (opcional)
}

// Processa o resultado do ataque do monstro no jogador (AJUSTADA)
async function handleMonsterAttackResult(damageDealt) {
    if (battleEnded) return true; // Batalha já acabou

    console.log(`LOG: Energia do jogador antes do ataque do monstro: ${playerStats.energia}`);
    playerStats.energia -= damageDealt;
    addLogMessage(`${monsterName} atacou você e causou ${damageDealt} de dano.`, "dano-monstro");
    console.log(`LOG: Energia do jogador após ataque do monstro: ${playerStats.energia}`);

    updatePlayerEnergyDisplay(); // Atualiza a UI

    // Verifica se o jogador foi derrotado
    if (playerStats.energia <= 0) {
        playerStats.energia = 0; // Não deixa energia negativa
        updatePlayerEnergyDisplay(); // Garante que mostre 0
        // Log da derrota já está em endBattle
        endBattle(false); // Chama o fim da batalha indicando derrota
        return true; // Sinaliza que a batalha acabou
    }

    // Se o jogador sobreviveu
    console.log("LOG: Jogador sobreviveu ao ataque do monstro.");
    return false; // Sinaliza que a batalha continua
}


// Lógica do ataque do jogador (exemplo: Corpo a Corpo)
async function playerAttack(attackType) {
    if (battleEnded || currentTurn !== 'player') return; // Só ataca no turno do jogador e se a batalha não acabou

    console.log(`LOG: Jogador iniciando ataque: ${attackType}`);
    hideAttackOptions(); // Esconde opções enquanto o ataque é processado

    // Exemplo simples de cálculo de ataque e dano
    const playerAttackRoll = rollD6() + rollD6();
    const monsterDefenseRoll = rollD6() + rollD6(); // Ou use a defesa do monstro
    const playerAttackPower = playerStats.habilidade || 0;
    const monsterDefensePower = monsterStats.defesa || 0; // Supondo que monstro tem defesa

    addLogMessage(`Você ataca (${attackType})! (Rolagem: ${playerAttackRoll} vs Defesa ${monsterName}: ${monsterDefenseRoll})`, "info");

    if (playerAttackRoll + playerAttackPower > monsterDefenseRoll + monsterDefensePower) {
        // Acertou! Calcular dano (exemplo: dano fixo + bônus)
        const baseDamage = 2; // Exemplo
        const bonusDamage = Math.max(0, playerAttackPower - monsterDefensePower); // Exemplo
        const totalDamage = baseDamage + bonusDamage;
        console.log(`LOG: Ataque do jogador acertou! Dano: ${totalDamage}`);
        await handlePlayerAttackResult(totalDamage); // Processa o dano no monstro
    } else {
        addLogMessage("Você errou o ataque!", "info");
        console.log("LOG: Ataque do jogador errou.");
        // Mesmo errando, o turno do monstro começa (se a batalha não acabou)
        if (!battleEnded) {
             addLogMessage(`Turno do ${monsterName}.`, "turno");
             await monsterTurn();
             // Após turno do monstro, se a batalha não acabou, volta pro jogador
             if (!battleEnded) {
                 currentTurn = 'player';
                 addLogMessage("Seu Turno.", "turno");
                 showAttackOptions(); // Mostra opções novamente
             }
        }
    }
     // saveBattleState(); // Salva após ação do jogador (opcional)
}

// Processa o resultado do ataque do jogador no monstro (AJUSTADA)
async function handlePlayerAttackResult(damageDealt) {
    if (battleEnded) return; // Batalha já acabou

    console.log(`LOG: Energia do monstro antes do ataque do jogador: ${monsterStats.energia}`);
    monsterStats.energia -= damageDealt;
    addLogMessage(`Você causou ${damageDealt} de dano ao ${monsterName}!`, "dano-jogador");
    console.log(`LOG: Energia do monstro após ataque do jogador: ${monsterStats.energia}`);

    updateMonsterEnergyDisplay(); // Atualiza a UI

    // Verifica se o monstro foi derrotado
    if (monsterStats.energia <= 0) {
        monsterStats.energia = 0; // Não deixa energia negativa
        updateMonsterEnergyDisplay(); // Garante que mostre 0
        // Log da vitória já está em endBattle
        endBattle(true); // Chama o fim da batalha indicando vitória
        return; // Sai da função, batalha acabou
    }

    // Se o monstro sobreviveu, é a vez dele
    console.log("LOG: Monstro sobreviveu ao ataque.");
    addLogMessage(`Turno do ${monsterName}.`, "turno");
    await monsterTurn(); // Monstro age

    // Após o turno do monstro, se a batalha não acabou, volta pro jogador
    if (!battleEnded) {
        currentTurn = 'player';
        addLogMessage("Seu Turno.", "turno");
        showAttackOptions(); // Mostra opções novamente
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
    // rangeAttackButton = document.getElementById('rangeAttackButton'); // Se tiver ataque à distância
    // damageButton = document.getElementById('damageButton'); // Botão DANO parece ser de teste? Remover se não usado.
    logContainer = document.getElementById('battleLog');
    monsterImage = document.getElementById('monsterImage');
    inventoryButton = document.getElementById('inventoryButton'); // Assumindo ID do botão geral
    lootSection = document.getElementById('lootSection'); // Pega a seção de loot

    // Validar se elementos essenciais foram encontrados
    if (!logContainer || !monsterNameDisplay || !monsterEnergyDisplay || !playerEnergyDisplay || !fightButton || !rollInitiativeButton || !attackOptions || !meleeAttackButton || !monsterImage || !lootSection) {
        console.error("ERRO CRÍTICO: Um ou mais elementos essenciais da interface não foram encontrados! Verifique os IDs no HTML.");
        alert("Erro ao carregar a interface da batalha. Verifique o console para detalhes.");
        return; // Impede a continuação se a UI estiver quebrada
    }


    // Pega o nome do monstro da URL
    monsterName = getUrlParameter('monstro');
    if (!monsterName) {
        console.error("ERRO: Nome do monstro não especificado na URL (ex: batalha.html?monstro=lobo)");
        addLogMessage("Erro: Monstro não especificado.", "erro");
        // Opcional: Redirecionar ou mostrar mensagem de erro mais clara
        return;
    }
    if (monsterNameDisplay) monsterNameDisplay.textContent = monsterName.charAt(0).toUpperCase() + monsterName.slice(1); // Capitaliza nome

    console.log("LOG: Variáveis iniciais declaradas.");

    // Limpa o log e configura estado inicial da UI
    if (logContainer) logContainer.innerHTML = ''; // Limpa logs anteriores
    addLogMessage(`Preparando para lutar contra ${monsterName}...`, "sistema");
    showFightButton(); // Estado inicial: Mostrar botão "Lutar"
    enableInventoryButton(); // Garante que inventário está ativo no início
    battleEnded = false; // Reseta a flag de fim de batalha
    currentTurnBlock = null; // Reseta a referência do bloco de turno do log

    // Observador de Autenticação do Firebase
    if (auth) {
        onAuthStateChanged(auth, async (user) => {
            console.log("LOG: onAuthStateChanged chamado.");
            if (user) {
                userId = user.uid;
                console.log(`LOG: Usuário logado. ID: ${userId}`);
                addLogMessage("Jogador autenticado.", "sistema");

                // 1. Carregar dados do monstro
                monsterData = await loadMonsterData(monsterName);
                if (!monsterData) {
                    console.error("Falha crítica ao carregar dados do monstro. Batalha não pode continuar.");
                    addLogMessage("Erro fatal: Não foi possível carregar o monstro.", "erro");
                    hideAllCombatControls(); // Esconde controles se monstro não carrega
                    return;
                }
                // Define o estado inicial do monstro (cópia dos dados base)
                monsterStats = { ...monsterData, energia: monsterData.energia_base }; // Inicia com energia cheia
                updateMonsterEnergyDisplay();
                updateMonsterImage();


                // 2. Tentar carregar estado de batalha salvo (opcional)
                const savedState = await loadBattleState(userId, monsterName);

                if (savedState && confirm("Continuar batalha anterior?")) { // Pergunta ao usuário
                     console.log("LOG: Restaurando estado de batalha salvo.");
                     addLogMessage("Continuando batalha anterior...", "sistema");
                     playerStats.energia = savedState.playerEnergy;
                     monsterStats.energia = savedState.monsterEnergy;
                     currentTurn = savedState.currentTurn;
                     initiativeResult = savedState.initiative;
                     // TODO: Restaurar UI com base no estado (quem joga, botões visíveis)
                     updatePlayerEnergyDisplay();
                     updateMonsterEnergyDisplay();
                     if(currentTurn === 'player') showAttackOptions();
                     else if (currentTurn === 'monster') {
                        // Se era turno do monstro, talvez ele deva agir? Ou esperar o jogador?
                        // Por simplicidade, vamos deixar o jogador agir.
                         addLogMessage("É o seu turno (continuando batalha).", "turno");
                         showAttackOptions();
                     } else {
                         // Estado inválido ou antes da iniciativa? Reinicia.
                          showFightButton();
                     }

                } else {
                    console.log("LOG: Iniciando nova batalha ou usuário optou por não continuar.");
                    // 3. Se não há estado salvo (ou não quis continuar), carregar dados do jogador
                    const playerData = await loadPlayerData(userId);
                    if (!playerData) {
                        console.error("Falha crítica ao carregar dados do jogador. Batalha não pode continuar.");
                        addLogMessage("Erro fatal: Não foi possível carregar seus dados.", "erro");
                        hideAllCombatControls();
                        return;
                    }
                    // Define o estado inicial do jogador
                    playerStats = {
                        energia: playerData.energia_atual || playerData.energia_base || 10, // Usa atual, senão base, senão 10
                        habilidade: playerData.habilidade || 1 // Usa habilidade, senão 1
                        // Adicionar outros atributos relevantes (defesa, etc.)
                    };
                    console.log(`LOG: Energia inicial do jogador: ${playerStats.energia}, Habilidade: ${playerStats.habilidade}`);
                    updatePlayerEnergyDisplay();
                    showFightButton(); // Mostra o botão "Lutar" para começar
                }

                // 4. Adicionar Event Listeners aos botões de controle da batalha
                 if (fightButton) {
                    fightButton.addEventListener('click', () => {
                        console.log("LOG: Botão 'Lutar' clicado.");
                        addLogMessage("Batalha iniciada!", "sistema");
                        battleEnded = false; // Garante que a flag está resetada
                        currentTurnBlock = null; // Reseta bloco de log
                        disableInventoryButton(); // Desativa inventário durante a luta
                        showInitiativeButton(); // Mostra botão de iniciativa
                    });
                 }

                 if (rollInitiativeButton) {
                     rollInitiativeButton.addEventListener('click', () => {
                         if (battleEnded) return;
                         console.log("LOG: Botão 'Rolar Iniciativa' clicado.");
                         addLogMessage("Rolando iniciativa...", "info");
                         rollInitiative(); // Rola e determina quem começa
                         // Os botões de ataque/turno do monstro são exibidos dentro de rollInitiative
                     });
                 }

                 if (meleeAttackButton) {
                     meleeAttackButton.addEventListener('click', () => {
                         if (battleEnded) return;
                         console.log("LOG: Botão 'Corpo a Corpo' clicado.");
                         playerAttack('Corpo a Corpo');
                     });
                 }

                 // Adicionar listeners para outros botões de ataque (rangeAttackButton, etc.) se existirem

            } else {
                userId = null;
                console.log("LOG: Usuário deslogado.");
                addLogMessage("Você não está logado. Faça login para batalhar.", "erro");
                hideAllCombatControls();
                // Opcional: Redirecionar para a página de login
                // window.location.href = '/login.html';
            }
        });
    } else {
         console.error("ERRO CRÍTICO: Módulo de autenticação do Firebase não inicializado.");
         addLogMessage("Erro crítico: Falha na autenticação.", "erro");
         alert("Erro crítico de autenticação. A batalha não pode começar.");
    }

    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
});

console.log('LOG: Fim do script batalha.js');
