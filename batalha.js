// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { loadEquippedDice, initializeModule } from './dice-ui.js';
import { getMonsterById } from './monstros.js';
import './arcanum-spells.js';

// Variáveis globais para estado da batalha
window.isPlayerTurn = false;
window.battleStarted = false;
window.currentMonster = null;
let escapeAttempts = 0; // Contador de tentativas de fuga
let nextTelegraphedAttack = null; // Próximo ataque telegrafado
let activeBuffs = []; // Sistema de buffs temporários
let activeMonsterDebuffs = []; // Sistema de debuffs do monstro
let currentTurnBlock = null;
let attackOptionsDiv = null;




console.log("LOG: batalha.js carregado.");

async function addLogMessage(message, delay = 0, typingSpeed = 30) {
    const logContainer = document.getElementById("battle-log-content");
    return new Promise((resolve) => {
        const p = document.createElement('p');
        currentTurnBlock.appendChild(p); // Adiciona a mensagem ao bloco atual
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
            p.innerHTML = message;
            logContainer.scrollTop = logContainer.scrollHeight;
            resolve();
        }
    });
}

// Finaliza o turno do jogador e inicia o turno do monstro
function endPlayerTurn() {
    console.log("LOG: Finalizando turno do jogador e iniciando turno do monstro.");
    if (!isPlayerTurn) {
        console.error("LOG: endPlayerTurn chamado fora do turno do jogador. Abortando.");
        return;
    }

    isPlayerTurn = false; // Marca que o turno do jogador acabou
    window.isPlayerTurn = false; // Atualiza a variável global


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


// Falhas críticas (rolar 1 no d20 ao atacar)
const falhasCriticas = [
  { mensagem: "Você escorrega e cai de bunda no chão. Que vergonha! Você perde o turno atual.", efeito: "perdeTurno" },
  { mensagem: "Você se machuca de leve com seu próprio ataque (sofre 1d4 de dano).", efeito: "autoDano" },
  { mensagem: "Você tenta ser mais expressivo no ataque do que realmente é. O monstro zomba de você. Nada acontece, só humilhação.", efeito: "nada" }
];

// Lista de magias disponíveis
const magiasDisponiveis = [
    {
        id: "cura-menor",
        nome: "Cura Menor",
        descricao: "Restaura pequena quantidade de energia",
        custo: 2,
        efeito: "heal",
        valor: 3
    },
    {
        id: "missil-magico",
        nome: "Dardos Místicos", 
        descricao: "Projétil mágico",
        custo: 1,
        efeito: "damage",
        valor: "1d4"
    },

{
    id: "luz",
    nome: "Luz",
    descricao: "Cria luz ofuscante que reduz a precisão do inimigo",
    custo: 2,
    efeito: "dazzle",
    valor: 3
},  

  {
    id: "toque-chocante",
    nome: "Toque Chocante",
    descricao: "Ataque mágico de toque que causa dano elétrico",
    custo: 2,
    efeito: "touch_attack",
    valor: "1d8"
},

    {
    id: "toque-macabro",
    nome: "Toque Macabro",
    descricao: "Toque que causa dano e enfraquece os ataques do inimigo",
    custo: 3,
    efeito: "touch_debuff",
    valor: "1d4+1"
},

    {
        id: "escudo-arcano",
        nome: "Escudo Arcano",
        descricao: "Aumenta temporariamente a couraça",
        custo: 3,
        efeito: "shield",
        valor: 2
    }
];



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
initializeModule(db);  // Inicializa o módulo de dados
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

    // Verifica se é a barra do monstro
    const isMonstro = idElemento === "barra-hp-monstro";

    // Novo cálculo de porcentagem considerando valores negativos
    let porcentagem;
    if (valorAtual > 0) {
        porcentagem = (valorAtual / valorMaximo) * 100;
    } else {
        // Para valores negativos, calculamos a porcentagem até -10
        porcentagem = Math.max(0, ((valorAtual + 10) / 10) * 30); // 30% é o máximo para valores negativos
    }
    
    // Atualiza a largura da barra
    barra.style.width = `${porcentagem}%`;
    
    // Define a cor da barra baseado no estado
    if (valorAtual <= 0) {
        // Para monstros, qualquer valor <= 0 significa morte
        if (isMonstro) {
            barra.style.backgroundColor = '#000000'; // Preto para morto
        } else {
            // Para o jogador, mantém a lógica original
            if (valorAtual <= -10) {
                barra.style.backgroundColor = '#000000'; // Preto para morto
            } else {
                barra.style.backgroundColor = '#8B0000'; // Vermelho escuro para inconsciente
            }
        }
    } else if (valorAtual <= valorMaximo * 0.3) {
        barra.style.backgroundColor = '#FF0000'; // Vermelho para baixa energia
    } else {
        barra.style.backgroundColor = '#008000'; // Verde para normal
    }
    
    // Atualiza o texto
    if (valorSpan) {
        if (valorAtual <= 0) {
            // Para monstros, qualquer valor <= 0 significa morte
            if (isMonstro) {
                valorSpan.innerHTML = `<span style="color: darkred">MORTO (${valorAtual}/${valorMaximo})</span>`;
            } else {
                // Para o jogador, mantém a lógica original
                if (valorAtual <= -10) {
                    valorSpan.innerHTML = `<span style="color: darkred">MORTO (${valorAtual}/${valorMaximo})</span>`;
                } else {
                    valorSpan.innerHTML = `<span style="color: red">INCONSCIENTE (${valorAtual}/${valorMaximo})</span>`;
                }
            }
        } else {
            valorSpan.textContent = `${valorAtual}/${valorMaximo}`;
        }
    }
}


// Função para barra de Magia
function atualizarBarraMagia(valorAtual, valorMaximo) {
    const barra = document.getElementById("barra-magia-jogador");
    const valorSpan = document.getElementById("magia-jogador-valor");
    
    if (!barra || !valorSpan) return;
    if (!valorMaximo || valorMaximo <= 0) return;

    const porcentagem = (valorAtual / valorMaximo) * 100;
    barra.style.width = `${porcentagem}%`;
    
    // Cores da barra de magia
    if (valorAtual <= 0) {
        barra.style.backgroundColor = '#000080'; // Azul escuro para vazia
    } else if (valorAtual <= valorMaximo * 0.3) {
        barra.style.backgroundColor = '#4169E1'; // Azul médio para baixa
    } else {
        barra.style.backgroundColor = '#0000FF'; // Azul para normal
    }
    
    valorSpan.textContent = `${valorAtual}/${valorMaximo}`;
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

// Função para calcular couraça total (base + buffs)
function getPlayerDefense() {
    // Declara playerData como global ou busca do escopo correto
    const currentPlayerData = window.playerData || playerData;
    const baseDefense = currentPlayerData?.couraca ? parseInt(currentPlayerData.couraca) : 0;
    const buffBonus = activeBuffs
        .filter(buff => buff.tipo === "couraca")
        .reduce((total, buff) => total + buff.valor, 0);
    return baseDefense + buffBonus;
}


// Função para atualizar display de buffs
function updateBuffsDisplay() {
    const container = document.getElementById('buffs-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    activeBuffs.forEach(buff => {
        const buffElement = document.createElement('div');
        buffElement.className = 'buff-item';
        buffElement.innerHTML = `
            <span>${buff.nome}</span>
            <span class="buff-turns">${buff.turnos}</span>
        `;
        container.appendChild(buffElement);
    });
}

// Função para atualizar display de debuffs do monstro
function updateMonsterDebuffsDisplay() {
    const container = document.getElementById('monster-debuffs-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    activeMonsterDebuffs.forEach(debuff => {
        const debuffElement = document.createElement('div');
        debuffElement.className = 'debuff-item';
        debuffElement.innerHTML = `
            <span>${debuff.nome}</span>
            <span class="debuff-turns">${debuff.turnos}</span>
        `;
        container.appendChild(debuffElement);
    });
}



// Função para processar buffs no início do turno do jogador
function processBuffs() {
    if (activeBuffs.length === 0) return Promise.resolve();
    
    // Reduz duração de todos os buffs
    activeBuffs.forEach(buff => buff.turnos--);
    
    // Remove buffs expirados e mostra mensagem
    const expiredBuffs = activeBuffs.filter(buff => buff.turnos <= 0);
    activeBuffs = activeBuffs.filter(buff => buff.turnos > 0);
      // Atualiza display
    updateBuffsDisplay();

    
    // Processa mensagens de buffs expirados sequencialmente
    return expiredBuffs.reduce((promise, buff) => {
    return promise.then(() => {
        if (typeof addLogMessage === 'function') {
            return addLogMessage(`${buff.nome} se dissipou.`, 800);
        }
        return Promise.resolve();
    });
}, Promise.resolve());
  } // <- ADICIONE ESTA CHAVE AQUI


// Função para processar debuffs do monstro no início do seu turno
function processMonsterDebuffs() {
    if (activeMonsterDebuffs.length === 0) return Promise.resolve();
    
    // Reduz duração de todos os debuffs
    activeMonsterDebuffs.forEach(debuff => debuff.turnos--);
    
    // Remove debuffs expirados e mostra mensagem
    const expiredDebuffs = activeMonsterDebuffs.filter(debuff => debuff.turnos <= 0);
    activeMonsterDebuffs = activeMonsterDebuffs.filter(debuff => debuff.turnos > 0);
    
    // Atualiza display
    updateMonsterDebuffsDisplay();
    
    // Processa mensagens de debuffs expirados sequencialmente
    return expiredDebuffs.reduce((promise, debuff) => {
        return promise.then(() => {
            if (typeof addLogMessage === 'function') {
                return addLogMessage(`${debuff.nome} se dissipou do ${currentMonster.nome}.`, 800);
            }
            return Promise.resolve();
        });
    }, Promise.resolve());
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

// Função para atualizar magia do jogador no Firestore
async function updatePlayerMagicInFirestore(userId, newMagic) {
    console.log("LOG: updatePlayerMagicInFirestore chamado com userId:", userId, "newMagic:", newMagic);
    const playerDocRef = doc(db, "players", userId);
    return setDoc(playerDocRef, { magic: { total: newMagic } }, { merge: true })
        .then(() => {
            console.log("LOG: Magia do jogador atualizada na ficha:", newMagic);
        })
        .catch((error) => {
            console.error("LOG: Erro ao atualizar a magia do jogador na ficha:", error);
        });
}


// Adicione esta função logo após a função updatePlayerEnergyInFirestore
async function updatePlayerExperience(userId, xpToAdd) {
    console.log("LOG: updatePlayerExperience chamado com userId:", userId, "xpToAdd:", xpToAdd);
    const playerDocRef = doc(db, "players", userId);
    
    try {
        // Primeiro, pegamos os dados atuais do jogador
        const playerDoc = await getDoc(playerDocRef);
        const playerData = playerDoc.data();
        const currentXP = playerData.experience || 0;
        const newXP = currentXP + xpToAdd;
        
        // Atualiza a experiência no Firestore
        await setDoc(playerDocRef, { experience: newXP }, { merge: true });
        console.log("LOG: Experiência do jogador atualizada:", newXP);
        
        return newXP;
    } catch (error) {
        console.error("LOG: Erro ao atualizar experiência do jogador:", error);
        throw error;
    }
}


// Função para carregar o estado da batalha do Firestore
function loadBattleState(userId, monsterName) {
    console.log("LOG: loadBattleState chamado com userId:", userId, "monsterName:", monsterName);
    if (!userId || !monsterName) {
        console.error("LOG: loadBattleState - Parâmetros inválidos");
        return Promise.resolve(null);
    }
    
    const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
    return getDoc(battleDocRef)
        .then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("LOG: Estado da batalha carregado do Firestore:", data);
                
                // Restaura o estado da iniciativa no sessionStorage
                if (data.initiativeResult) {
                    sessionStorage.setItem('initiativeResult', data.initiativeResult);
                }
                if (data.playerInitiativeRoll) {
                    sessionStorage.setItem('playerInitiativeRoll', data.playerInitiativeRoll);
                }
                if (data.monsterInitiativeRoll) {
                    sessionStorage.setItem('monsterInitiativeRoll', data.monsterInitiativeRoll);
                }
                if (data.playerAbility) {
                    sessionStorage.setItem('playerAbility', data.playerAbility);
                }
                if (data.monsterAbility) {
                    sessionStorage.setItem('monsterAbility', data.monsterAbility);
                }
                
                // Define as variáveis globais
                window.isPlayerTurn = data.isPlayerTurn;
                isPlayerTurn = data.isPlayerTurn; // Sincroniza a variável local
                window.battleStarted = data.battleStarted || false;
              
              // Restaura buffs ativos
activeBuffs = data.activeBuffs || [];
              activeMonsterDebuffs = data.activeMonsterDebuffs || [];

  
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
    console.log("LOG: saveBattleState chamado com:", {userId, monsterName, monsterHealth, playerHealth});
    if (!userId || !monsterName) {
        console.error("LOG: saveBattleState - Parâmetros inválidos");
        return Promise.resolve();
    }
    
    const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
    
    // Obtém o estado atual da iniciativa do sessionStorage
    const initiativeResult = sessionStorage.getItem('initiativeResult');
    const playerInitiativeRoll = sessionStorage.getItem('playerInitiativeRoll');
    const monsterInitiativeRoll = sessionStorage.getItem('monsterInitiativeRoll');
    const playerAbility = sessionStorage.getItem('playerAbility');
    const monsterAbility = sessionStorage.getItem('monsterAbility');
    
    // Usa a variável global window.isPlayerTurn em vez de isPlayerTurn
    return setDoc(battleDocRef, { 
    monsterHealth: monsterHealth, 
    playerHealth: playerHealth,
    isPlayerTurn: window.isPlayerTurn,
    initiativeResult: initiativeResult || null,
    playerInitiativeRoll: playerInitiativeRoll || null,
    monsterInitiativeRoll: monsterInitiativeRoll || null,
    playerAbility: playerAbility || null,
    monsterAbility: monsterAbility || null,
    battleStarted: window.battleStarted || false,
    activeBuffs: activeBuffs || [],
    activeMonsterDebuffs: activeMonsterDebuffs || [],
    lastUpdated: new Date().toISOString()
}, { merge: true });
}


// Função para limpar o estado da batalha quando ela termina
function clearBattleState(userId, monsterName) {
    console.log("LOG: clearBattleState chamado com userId:", userId, "monsterName:", monsterName);
    if (!userId || !monsterName) {
        console.error("LOG: clearBattleState - Parâmetros inválidos");
        return Promise.resolve(false);
    }
    
    const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
    
    return deleteDoc(battleDocRef)
        .then(() => {
            console.log("LOG: Estado da batalha removido com sucesso.");
            
            // Limpa também o sessionStorage
            sessionStorage.removeItem('initiativeResult');
            sessionStorage.removeItem('playerInitiativeRoll');
            sessionStorage.removeItem('monsterInitiativeRoll');
            sessionStorage.removeItem('playerAbility');
            sessionStorage.removeItem('monsterAbility');
            sessionStorage.removeItem('luteButtonClicked');
            
            return true;
        })
        .catch(error => {
            console.error("LOG: Erro ao limpar o estado da batalha:", error);
            return false;
        });
}


// Função para marcar um monstro como derrotado no Firestore
async function markMonsterAsDefeated(userId, monsterId) {
    console.log("LOG: markMonsterAsDefeated chamado com userId:", userId, "monsterId:", monsterId);
    if (!userId || !monsterId) {
        console.error("LOG: markMonsterAsDefeated - Parâmetros inválidos");
        return false;
    }
    
    try {
        // Referência para o documento de monstros derrotados do usuário
        const defeatedMonstersRef = doc(db, "defeatedEnemies", userId);
        
        // Verifica se o documento já existe
        const docSnap = await getDoc(defeatedMonstersRef);
        
        if (docSnap.exists()) {
            // Documento existe, adiciona o monstro à lista se ainda não estiver lá
            const data = docSnap.data();
            const enemies = data.enemies || [];
            
            if (!enemies.includes(monsterId)) {
                enemies.push(monsterId);
                await setDoc(defeatedMonstersRef, { enemies }, { merge: true });
                console.log("LOG: Monstro adicionado à lista de derrotados");
            } else {
                console.log("LOG: Monstro já estava na lista de derrotados");
            }
        } else {
            // Documento não existe, cria um novo
            await setDoc(defeatedMonstersRef, { enemies: [monsterId] });
            console.log("LOG: Criada nova lista de monstros derrotados");
        }
        
        return true;
    } catch (error) {
        console.error("LOG: Erro ao marcar monstro como derrotado:", error);
        return false;
    }
}



function handlePostBattle(monster) {
    console.log("handlePostBattle chamado com monstro:", monster?.nome);

    // Concede experiência ao jogador se o monstro foi derrotado
    if (monster && monster.pontosDeEnergia <= 0) {
        // Define a experiência com base no nome do monstro
        const xpToGain = 
            monster.nome === "Lobo Faminto" ? 50 :
            monster.nome === "Goblin Sorrateiro" ? 30 :
            monster.nome === "Esqueleto Guerreiro" ? 60 :
            monster.nome === "Rato Gigante" ? 20 :
            monster.nome === "Ogro Brutamontes" ? 150 :
            monster.nome === "Aranha Venenosa" ? 55 :
            monster.nome === "Zumbi Cambaleante" ? 70 :
            monster.nome === "Harpia Cruel" ? 80 :
            monster.nome === "Verme Gigante da Terra" ? 90 :
            monster.nome === "Bandido de Estrada" ? 60 :
            monster.nome === "Morcego Sanguessuga" ? 35 :
            monster.nome === "Elemental de Fogo" ? 100 :
            monster.nome === "Espectro Sombrio" ? 90 :
            monster.nome === "Mímico" ? 120 :
            monster.nome === "Lobo Alfa" ? 80 :
            monster.nome === "Escaravelho Explosivo" ? 45 :
            monster.nome === "Necromante Aprendiz" ? 110 :
            monster.nome === "Golem de Pedra" ? 150 :
            monster.nome === "Serpente do Pântano" ? 70 :
            monster.nome === "Árvore Viva" ? 130 :
            monster.nome === "Rato Mutante" ? 60 :
            20; // Valor padrão para monstros não listados

        const user = auth.currentUser;
        if (user) {
            // Atualiza a experiência do jogador
            updatePlayerExperience(user.uid, xpToGain)
                .then(newXP => {
                    const logContainer = document.getElementById("battle-log-content");
                    if (logContainer) {
                        const xpDiv = document.createElement('div');
                        xpDiv.classList.add('turn-block');
                        const xpTitle = document.createElement('h4');
                        xpTitle.textContent = 'Experiência';
                        xpDiv.appendChild(xpTitle);

                        const xpMsg = document.createElement('p');
                        xpMsg.textContent = `Você ganhou ${xpToGain} pontos de experiência!`;
                        xpDiv.appendChild(xpMsg);

                        const totalMsg = document.createElement('p');
                        totalMsg.textContent = `Experiência total: ${newXP}`;
                        xpDiv.appendChild(totalMsg);

                        logContainer.prepend(xpDiv);
                    }
                })
                .catch(error => {
                    console.error("Erro ao conceder experiência:", error);
                });

            // Marca o monstro como derrotado
            const monsterName = getUrlParameter('monstro');
            if (monsterName) {
                markMonsterAsDefeated(user.uid, monsterName)
                    .then(success => {
                        if (success) {
                            console.log(`LOG: Monstro ${monsterName} marcado como derrotado para o usuário ${user.uid}`);
                        } else {
                            console.error(`LOG: Falha ao marcar monstro como derrotado`);
                        }
                    });
            }
        }
    }

    // ----------- SISTEMA DE DROPS FLEXÍVEL -----------
    let lootItems = [];
    // 1. Prioridade: Loot customizado definido pelo behavior/sala, via sessionStorage
    const customLootStr = sessionStorage.getItem('customLoot');
    if (customLootStr) {
        try {
            lootItems = JSON.parse(customLootStr);
            if (!Array.isArray(lootItems)) lootItems = [];
        } catch (e) {
            lootItems = [];
        }
        sessionStorage.removeItem('customLoot'); // Limpa após uso
    }

    // 2. Se não existe customLoot, usa os drops do monstro
    if (!lootItems || lootItems.length === 0) {
        lootItems = Array.isArray(monster.drops) ? monster.drops : [];
    }

    // 3. Se ainda não tem loot, usa fallback genérico
    if (!lootItems || lootItems.length === 0) {
        if (typeof getDefaultLoot === "function") {
            lootItems = getDefaultLoot(monster);
        } else {
            lootItems = []; // fallback vazio
        }
    }

    // Salva loot para a tela de loot
    sessionStorage.setItem('lootItems', JSON.stringify(lootItems));

    // ------------ NOVO: SALVAR NO FIRESTORE -------------
    const user = auth.currentUser;
    if (user && lootItems.length > 0) {
        console.log("Salvando loot no Firestore:", lootItems);
        salvarDropsNoLoot(user.uid, lootItems)
            .then(() => {
                console.log("Loot salvo no Firestore com sucesso.");
            })
            .catch((error) => {
                console.error("Erro ao salvar loot no Firestore:", error);
            });
    } else {
        if (!user) console.log("Usuário não autenticado (loot não salvo).");
        if (!lootItems.length) console.log("Loot vazio, nada a salvar.");
    }

    // --------------------------------------------------

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
        lootButton.replaceWith(lootButton.cloneNode(true));
        const newLootButton = document.getElementById('loot-button');
        newLootButton.style.display = 'block';
        newLootButton.addEventListener('click', () => {
            console.log("Botão de loot clicado. Redirecionando para loot.html");
            window.location.href = 'loot.html';
        });
    } else {
        console.error("Erro: Botão de loot não encontrado no HTML.");
    }

    // Limpa o estado da batalha quando o monstro é derrotado
    if (user && monster) {
        const monsterName = getUrlParameter('monstro') || monster.id;
        clearBattleState(user.uid, monsterName)
            .then(success => {
                if (success) {
                    console.log("LOG: Estado da batalha limpo após vitória.");
                }
            });
    }

    window.battleStarted = false; // Reset do estado da batalha usando window para garantir escopo global
}


document.addEventListener('DOMContentLoaded', () => {

     // --- Limpeza dos dados de iniciativa ANTES de qualquer lógica de batalha ---
    sessionStorage.removeItem('initiativeResult');
    sessionStorage.removeItem('playerInitiativeRoll');
    sessionStorage.removeItem('monsterInitiativeRoll');
    sessionStorage.removeItem('playerAbility');
    sessionStorage.removeItem('monsterAbility');
    sessionStorage.removeItem('luteButtonClicked');
    // ---------------------------------------------------------------------------

    
    console.log("LOG: DOMContentLoaded evento disparado.");
    const lutarButton = document.getElementById("iniciar-luta");
    const rolarIniciativaButton = document.getElementById("rolar-iniciativa");
    const battleLogContent = document.getElementById("battle-log-content");
    attackOptionsDiv = document.getElementById("attack-options");
    const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
    const rolarDanoButton = document.getElementById("rolar-dano");
    const monsterName = getUrlParameter('monstro');
    let currentMonster; // Declara currentMonster no escopo superior

let playerData; // Para armazenar os dados do jogador
window.playerData = null; // Variável global para playerData
let playerHealth = 0;
    let playerMaxHealth = playerHealth; // ✅ AQUI! Esta linha é o que você precisava
    let playerMagic = 0;
    let playerMaxMagic = 0;
    let isPlayerTurn = false; // Variável para controlar o turno
    //let currentTurnBlock = null; // Para armazenar o bloco do turno atual
    let playerAbilityValue = 0; // Para armazenar a habilidade do jogador
    let battleStarted = false; // Variável de controle para estado da batalha
    console.log("LOG: Variáveis iniciais declaradas.");


  // Inicializar o botão de fuga (substitua o código existente)
const correrButton = document.getElementById("correr-batalha");
if (correrButton) {
    // Remove qualquer listener existente antes de adicionar um novo
    correrButton.removeEventListener('click', attemptEscape);
    correrButton.addEventListener('click', attemptEscape);
    console.log("LOG: Evento de clique adicionado ao botão 'Correr'");
} else {
    console.error("LOG: Botão 'Correr' não encontrado (ID: correr-batalha)");
}



// Configurar evento do botão de itens e ferramentas
const itensBtn = document.getElementById("itens-ferramentas");
if (itensBtn) {
    itensBtn.addEventListener("click", () => {
        if (isPlayerTurn) {
            carregarItensConsumiveis(auth.currentUser.uid);
            document.getElementById("itens-modal").style.display = "block";
        }
    });
}

// Configurar eventos do modal de itens
const itensModal = document.getElementById("itens-modal");
if (itensModal) {
    const closeModal = itensModal.querySelector(".close-modal");
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            itensModal.style.display = "none";
        });
    }
    
    const usarBtn = itensModal.querySelector(".usar-item-btn");
    if (usarBtn) {
        usarBtn.addEventListener("click", () => {
            const itemId = usarBtn.dataset.itemId;
            const effect = usarBtn.dataset.effect;
            const value = usarBtn.dataset.value;
            usarItem(itemId, effect, value);
        });
    }
    
    // Fechar o modal ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === itensModal) {
            itensModal.style.display = "none";
        }
    });
}


  // Configurar evento do botão de magia
const magiaBtn = document.getElementById("atacar-a-distancia");
if (magiaBtn) {
    magiaBtn.addEventListener("click", () => {
        if (isPlayerTurn) {
            carregarMagiasDisponiveis();
            document.getElementById("magias-modal").style.display = "block";
        }
    });
}

// Configurar eventos do modal de magias
const magiasModal = document.getElementById("magias-modal");
if (magiasModal) {
    const closeModal = magiasModal.querySelector(".close-modal-magia");
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            magiasModal.style.display = "none";
        });
    }
    
    const usarBtn = magiasModal.querySelector(".usar-magia-btn");
    if (usarBtn) {
        usarBtn.addEventListener("click", () => {
            const magiaId = usarBtn.dataset.magiaId;
            const efeito = usarBtn.dataset.efeito;
            const valor = usarBtn.dataset.valor;
            const custo = usarBtn.dataset.custo;
            usarMagia(magiaId, efeito, valor, custo);
        });
    }
    
    // Fechar o modal ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === magiasModal) {
            magiasModal.style.display = "none";
        }
    });
}

  
  

  // --- INÍCIO DO BLOCO DE ATOS ---
const atoClasseButton = document.getElementById("ato-classe");
const painelAtos = document.getElementById("painel-atos");
const listaAtos = document.getElementById("lista-atos");
const fecharPainelAtos = document.getElementById("fechar-painel-atos");

let atosDoJogador = [
    {
        id: "olhar-inventario",
        nome: "Olhar de Inventário",
        descricao: "Veja rapidamente o que o alvo carrega consigo."
    },
    {
        id: "roubo-destino",
        nome: "Roubo de Destino",
        descricao: "Troca sua sorte com a de um inimigo, tornando o próximo teste dele um fracasso crítico e o seu um sucesso crítico."
    }
];

if (atoClasseButton) {
    atoClasseButton.addEventListener("click", () => {
        listaAtos.innerHTML = "";
        atosDoJogador.forEach(ato => {
            const div = document.createElement("div");
            div.className = "ato-item";
            div.style.marginBottom = "16px";
            div.innerHTML = `<strong>${ato.nome}</strong><br><span style="font-size:0.95em">${ato.descricao}</span><br>`;
            const btn = document.createElement("button");
            btn.textContent = "Usar";
            btn.onclick = async () => {
                await addLogMessage(`Você usou <strong>${ato.nome}</strong>!`, 600);
                painelAtos.style.display = "none";
                endPlayerTurn();
            };
            div.appendChild(btn);
            listaAtos.appendChild(div);
        });
        painelAtos.style.display = "block";
    });
}

if (fecharPainelAtos) {
    fecharPainelAtos.addEventListener("click", () => {
        painelAtos.style.display = "none";
    });
}
// --- FIM DO BLOCO DE ATOS ---

 

// Tenta carregar o monstro do sessionStorage primeiro
const storedMonster = sessionStorage.getItem('currentMonster');
if (storedMonster) {
    currentMonster = JSON.parse(storedMonster);
    console.log("LOG: Dados do monstro carregados do sessionStorage:", currentMonster);
} else {
    // Fallback para o monsterData importado
    currentMonster = getMonsterById(monsterName);
    console.log("LOG: Dados do monstro carregados via getMonsterById ou monsterData:", currentMonster);
}

// Limpa o sessionStorage após carregar
sessionStorage.removeItem('currentMonster');

// Se ainda não temos o monstro, mostra erro
if (!currentMonster) {
    console.error("LOG: Monstro não encontrado:", monsterName);
    document.getElementById("monster-name").innerText = "Monstro não encontrado";
    document.getElementById("monster-description").innerText = "O monstro especificado na URL não foi encontrado.";
} else {
    // Configura os valores máximos de energia
    const vidaMaximaMonstro = currentMonster.pontosDeEnergia;
    currentMonster.pontosDeEnergiaMax = vidaMaximaMonstro; // Salva para usar depois

    // Atualiza visualmente as barras no início do combate
    atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
}



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

    // Função para atualizar a experiência do jogador no Firestore
async function updatePlayerExperience(userId, xpToAdd) {
    console.log("LOG: updatePlayerExperience chamado com userId:", userId, "xpToAdd:", xpToAdd);
    const playerDocRef = doc(db, "players", userId);
    
    try {
        // Primeiro, pegamos os dados atuais do jogador
        const playerDoc = await getDoc(playerDocRef);
        const playerData = playerDoc.data();
        const currentXP = playerData.experience || 0;
        const newXP = currentXP + xpToAdd;
        
        // Atualiza a experiência no Firestore
        await setDoc(playerDocRef, { experience: newXP }, { merge: true });
        console.log("LOG: Experiência do jogador atualizada:", newXP);
        
        return newXP;
    } catch (error) {
        console.error("LOG: Erro ao atualizar experiência do jogador:", error);
        throw error;
    }
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


// Função para escolher ataque do monstro
function chooseMonsterAttack(monster) {
    // Se não tem sistema de ataques, usa o sistema antigo
    if (!monster.ataques || !Array.isArray(monster.ataques)) {
        return {
            nome: "Ataque",
            dano: monster.dano,
            telegrafado: false
        };
    }

    // Calcula porcentagem de HP
    const hpPercent = monster.pontosDeEnergia / monster.pontosDeEnergiaMax;
    const isLowHP = hpPercent <= 0.5;

    // Cria array de pesos baseado no HP
    const weightedAttacks = monster.ataques.map(attack => ({
        ...attack,
        currentWeight: isLowHP ? attack.pesoHPBaixo : attack.peso
    }));

    // Seleciona ataque baseado nos pesos
    const totalWeight = weightedAttacks.reduce((sum, attack) => sum + attack.currentWeight, 0);
    let random = Math.random() * totalWeight;
    
    for (const attack of weightedAttacks) {
        random -= attack.currentWeight;
        if (random <= 0) {
            return attack;
        }
    }
    
    return weightedAttacks[0]; // Fallback
}

// Lógica do turno do monstro
async function monsterAttack() {
    console.log("LOG: Iniciando monsterAttack. currentMonster:", currentMonster, "playerHealth:", playerHealth, "isPlayerTurn:", isPlayerTurn);

    // Verifica se o jogador já está morto
    if (isPlayerTurn || playerHealth <= -10 || !currentMonster) {
        console.log("LOG: monsterAttack - Turno inválido ou jogador morto. Retornando.");
        return;
    }

    startNewTurnBlock(currentMonster.nome);
    await addLogMessage(`Turno do ${currentMonster.nome}`, 1000);

  // Processa debuffs do monstro
await processMonsterDebuffs();


    // Escolhe o ataque (telegrafado ou novo)
    let selectedAttack;
    if (nextTelegraphedAttack) {
        selectedAttack = nextTelegraphedAttack;
        nextTelegraphedAttack = null;
        await addLogMessage(`<strong style="color: orange;">${selectedAttack.nome}!</strong>`, 800);
    } else {
        selectedAttack = chooseMonsterAttack(currentMonster);
        await addLogMessage(`${currentMonster.nome} usa ${selectedAttack.nome}.`, 800);
    }

    // Rolagem de ataque
    const monsterRollRaw = Math.floor(Math.random() * 20) + 1;
    // Aplica penalidade de debuffs de precisão
const accuracyPenalty = activeMonsterDebuffs
    .filter(debuff => debuff.tipo === "accuracy")
    .reduce((total, debuff) => total + debuff.valor, 0);

const monsterAttackRoll = monsterRollRaw - accuracyPenalty;

if (accuracyPenalty > 0) {
    await addLogMessage(`${currentMonster.nome} sofre -${accuracyPenalty} de penalidade por debuffs.`, 800);
}


    
await addLogMessage(`${currentMonster.nome} rolou ${monsterRollRaw} em um D20 para atacar.`, 1000);


    const playerDefense = getPlayerDefense();
    await addLogMessage(`Sua Couraça é ${playerDefense}.`, 1000);

    // Verifica se o ataque acertou
    if (monsterAttackRoll >= playerDefense) {
        const isCriticalHit = monsterRollRaw === 20;
        
        if (isCriticalHit) {
            await addLogMessage(`<strong style="color: red;">ACERTO CRÍTICO!</strong> O ataque atinge um ponto vital!`, 1000);
        } else {
            await addLogMessage(`O ataque acertou!`, 1000);
        }

        // Calcula o dano
        let monsterDamageRoll = rollDice(selectedAttack.dano);

// Aplica redução de dano por debuffs
const damageReduction = activeMonsterDebuffs
    .filter(debuff => debuff.tipo === "damage_reduction")
    .reduce((total, debuff) => total + debuff.valor, 0);

if (damageReduction > 0) {
    monsterDamageRoll = Math.max(0, monsterDamageRoll - damageReduction);
    await addLogMessage(`Dano reduzido em ${damageReduction} por debuffs (${monsterDamageRoll + damageReduction} → ${monsterDamageRoll}).`, 800);
}

        
        if (isCriticalHit) {
            monsterDamageRoll = Math.floor(monsterDamageRoll * 1.5);
            const criticalEffects = [
                "O golpe te deixa atordoado!",
                "Você sente suas forças se esvaindo!",
                "O impacto te faz perder o equilíbrio!",
                "Um golpe certeiro que te faz recuar!"
            ];
            const randomEffect = criticalEffects[Math.floor(Math.random() * criticalEffects.length)];
            await addLogMessage(`<em>${randomEffect}</em>`, 800);
        }

        playerHealth -= monsterDamageRoll;
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano${isCriticalHit ? " crítico" : ""}.`, 1000);

        // Salva o estado
        const user = auth.currentUser;
        if (user) {
            await updatePlayerEnergyInFirestore(user.uid, playerHealth);
            await saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        }

        // Verifica morte/inconsciência
        if (playerHealth <= -10) {
            await addLogMessage(`<p style="color: darkred;">Você morreu!</p>`, 1000);
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
            return;
        } else if (playerHealth <= 0) {
            await addLogMessage(`<p style="color: red;">Você está inconsciente!</p>`, 1000);
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
        }

        await addLogMessage(`Sua energia: ${playerHealth}.`, 1000);
    } else {
        await addLogMessage(`O ataque errou.`, 1000);
    }

    // Telegrafação após o ataque (se não foi um ataque telegrafado)
    if (!nextTelegraphedAttack && currentMonster.ataques) {
        const nextAttack = chooseMonsterAttack(currentMonster);
        if (nextAttack.telegrafado) {
            nextTelegraphedAttack = nextAttack;
            await addLogMessage(`<em style="color: yellow;">${nextAttack.mensagemTelegraf}</em>`, 1200);
        }
    }

    // Continua o jogo se o jogador não estiver morto
    if (playerHealth > -10) {
        endMonsterTurn();
    }
}


    
async function endMonsterTurn() {

    console.log("LOG: Finalizando turno do monstro e iniciando turno do jogador.");
    if (isPlayerTurn) {
        console.error("LOG: endMonsterTurn chamado fora do turno do monstro. Abortando.");
        return;
    }

    // Verifica se o jogador está inconsciente (energia entre 0 e -9)
    if (playerHealth <= 0 && playerHealth > -10) {
        console.log("LOG: Jogador inconsciente, o monstro continua atacando.");
        startNewTurnBlock("Estado");
        addLogMessage(`<p style="color: red; font-weight: bold;">Você está inconsciente e indefeso!</p>`, 1000);
        addLogMessage(`O ${currentMonster.nome} continua atacando seu corpo inerte...`, 1000);
        
        // Não passa o turno para o jogador, inicia outro turno do monstro
        setTimeout(() => {
            monsterAttack();
        }, 2000);
        return;
    }

    // Se o jogador não estiver inconsciente, continua normalmente
    isPlayerTurn = true; // Marca que é o turno do jogador
    window.isPlayerTurn = true; // Atualiza a variável global

    if (attackOptionsDiv) {
        attackOptionsDiv.style.display = 'block'; // Exibe as opções de ataque do jogador

                // Exibe e habilita todos os botões principais
        const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
        const atoClasseButton = document.getElementById("ato-classe");
        const itensFerramentasButton = document.getElementById("itens-ferramentas");
        const correrButton = document.getElementById("correr-batalha");
        const magiaButton = document.getElementById("atacar-a-distancia");
        
        if (atacarCorpoACorpoButton) {
            atacarCorpoACorpoButton.disabled = false;
            atacarCorpoACorpoButton.style.display = 'inline-block';
        }
        if (atoClasseButton) {
            atoClasseButton.disabled = false;
            atoClasseButton.style.display = 'inline-block';
        }
        if (itensFerramentasButton) {
            itensFerramentasButton.disabled = false;
            itensFerramentasButton.style.display = 'inline-block';
        }
        if (magiaButton) {
            magiaButton.disabled = false;
            magiaButton.style.display = 'inline-block';
        }

        
        // IMPORTANTE: Garantir que o botão de fuga esteja visível e com evento
        if (correrButton) {
            correrButton.disabled = false;
            correrButton.style.display = 'inline-block';
            correrButton.onclick = attemptEscape;
            console.log("LOG: Botão 'Correr' exibido e configurado no turno do jogador");
        } else {
            console.error("LOG: Botão 'Correr' não encontrado em endMonsterTurn");
        }
    }

    startNewTurnBlock("Jogador");
await processBuffs();
addLogMessage(`Turno do Jogador`, 1000);


    
    // Salva o estado após mudar o turno para o jogador
    const user = auth.currentUser;
    const monsterName = getUrlParameter('monstro');
    if (user && monsterName) {
        saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
    }
}




  

    // Exemplo para resetActionButtons
function resetActionButtons() {
    if (attackOptionsDiv) {
        const buttons = attackOptionsDiv.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
            if (button.id === 'atacar-corpo-a-corpo' || button.id === 'ato-classe' || button.id === 'itens-ferramentas') {
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        });
    }
}


  // Função para ataque de oportunidade do monstro
async function monsterOpportunityAttack(damageMultiplier = 0.8) {
    await addLogMessage(`${currentMonster.nome} aproveita sua distração para atacar!`, 800);
    
    const damage = Math.floor(rollDice(currentMonster.dano) * damageMultiplier);
    playerHealth -= damage;
    atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
    
    await addLogMessage(`Você sofre ${damage} de dano!`, 800);
    
    // Atualiza estado
    if (auth.currentUser) {
        await updatePlayerEnergyInFirestore(auth.currentUser.uid, playerHealth);
        await saveBattleState(auth.currentUser.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
    }
}

  


async function attemptEscape() {
    // Verifica se já está em uma tentativa de fuga para evitar duplicação
    if (window.escapingInProgress) {
        return;
    }
    window.escapingInProgress = true;

    // Incrementa o contador de tentativas
    escapeAttempts++;
    
    // Obtém a habilidade do local correto
    const habilidadeUsada = playerData?.skill?.total || 0;
    
    // Calcula a dificuldade base (25 + habilidade do monstro)
    const baseDifficulty = 25 + currentMonster.habilidade;
    // Adiciona penalidade por tentativas (+2 por tentativa)
    const difficulty = baseDifficulty + ((escapeAttempts - 1) * 2);

    startNewTurnBlock("Tentativa de Fuga");
    await addLogMessage(`Você tenta escapar do combate...`, 800);
    
    // Remove qualquer botão de rolagem existente antes de criar um novo
    const existingRollBtn = currentTurnBlock.querySelector('.roll-btn');
    if (existingRollBtn) {
        existingRollBtn.remove();
    }
    
    // Cria o botão de rolagem de forma mais segura
    const rollBtn = document.createElement('button');
    rollBtn.textContent = 'Rolar D20';
    rollBtn.classList.add('action-btn', 'roll-btn');
    
    // Adiciona o botão ao bloco de turno atual
    currentTurnBlock.appendChild(rollBtn);

    const diceRoll = await new Promise(resolve => {
        rollBtn.addEventListener('click', () => {
            const roll = Math.floor(Math.random() * 20) + 1;
            resolve(roll);
        }, { once: true });
    });

    // Remove o botão após o clique
    if (rollBtn.parentNode) {
        rollBtn.parentNode.removeChild(rollBtn);
    }
    
    const totalRoll = diceRoll + habilidadeUsada;

    await addLogMessage(`Você rolou ${diceRoll} + ${habilidadeUsada} (Hab) = ${totalRoll} vs dificuldade ${difficulty}`, 800);

    if (totalRoll >= difficulty) {
        // Sucesso na fuga
        await addLogMessage(`<strong style="color: green;">Você consegue escapar do combate!</strong>`, 1000);
        window.escapingInProgress = false;
        window.location.href = 'masmorra.html';
    } else {
        // Falha na fuga - monstro ganha ataque gratuito com dano reduzido
        await addLogMessage(`<strong style="color: red;">Você não consegue escapar!</strong>`, 800);
        await monsterOpportunityAttack(0.8);

        window.escapingInProgress = false;
        // Passa o turno
        endPlayerTurn();
    }
}







// Função para carregar itens consumíveis do inventário
async function carregarItensConsumiveis(userId) {
    try {
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        
        if (playerSnap.exists() && playerSnap.data().inventory) {
            const inventoryData = playerSnap.data().inventory;
            const itensContainer = document.getElementById("itens-container");
            itensContainer.innerHTML = "";
            
            // Filtrar apenas itens consumíveis
            const itensConsumiveis = [];
            
            // Verificar itens no baú
            if (inventoryData.itemsInChest && Array.isArray(inventoryData.itemsInChest)) {
                inventoryData.itemsInChest.forEach(item => {
                    if (item.consumable && item.quantity > 0) {
                        itensConsumiveis.push(item);
                    }
                });
            }
            
            // Se não houver itens consumíveis
            if (itensConsumiveis.length === 0) {
                itensContainer.innerHTML = "<p>Você não possui itens consumíveis.</p>";
                return;
            }
            
            // Criar elementos para cada item consumível
            itensConsumiveis.forEach(item => {
                const itemElement = document.createElement("div");
                itemElement.className = "item-consumivel";
                itemElement.dataset.itemId = item.id;
                itemElement.dataset.effect = item.effect || "";
                itemElement.dataset.value = item.value || 0;
                
                itemElement.innerHTML = `
                    <div class="item-nome">${item.content}</div>
                    <div class="item-quantidade">Quantidade: ${item.quantity}</div>
                    <div class="item-descricao">${item.description || ""}</div>
                `;
                
                itemElement.addEventListener("click", () => selecionarItem(itemElement));
                itensContainer.appendChild(itemElement);
            });
        } else {
            console.log("Inventário não encontrado para o usuário");
        }
    } catch (error) {
        console.error("Erro ao carregar itens consumíveis:", error);
    }
}

// Função para selecionar um item
function selecionarItem(itemElement) {
    // Limpa seleção anterior
    document.querySelectorAll(".item-consumivel").forEach(el => {
        el.classList.remove("selected");
    });
    
    // Seleciona o novo item
    itemElement.classList.add("selected");
    
    // Mostra o botão de usar
    const usarBtn = document.querySelector(".usar-item-btn");
    if (usarBtn) {
        usarBtn.style.display = "block";
        usarBtn.dataset.itemId = itemElement.dataset.itemId;
        usarBtn.dataset.effect = itemElement.dataset.effect;
        usarBtn.dataset.value = itemElement.dataset.value;
    }
}

// Função para usar um item - versão modificada
async function usarItem(itemId, effect, value) {
    const userId = auth.currentUser.uid;
    
    try {
        // Buscar dados do jogador e inventário
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists()) {
            console.error("Dados do jogador não encontrados");
            return;
        }
        
        const playerData = playerSnap.data();
        const inventoryData = playerData.inventory;
        
        // Encontrar o item no inventário
        let itemIndex = -1;
        let item = null;
        
        if (inventoryData.itemsInChest && Array.isArray(inventoryData.itemsInChest)) {
            itemIndex = inventoryData.itemsInChest.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                item = inventoryData.itemsInChest[itemIndex];
            }
        }
        
        if (!item) {
            console.error("Item não encontrado no inventário");
            return;
        }
        
        // Fechar a janela de itens imediatamente
        document.getElementById("itens-modal").style.display = "none";
        
        // Criar um novo bloco de turno para o item
        startNewTurnBlock("Item");
        
        // Aplicar efeito do item
        if (effect === "heal" && value > 0) {
            // Cura o jogador
            const energyTotal = playerData.energy?.total || 0;
            const energyInitial = playerData.energy?.initial || 0;
            const newEnergy = Math.min(energyTotal + parseInt(value), energyInitial);
            
            // Atualiza a energia do jogador
            playerData.energy.total = newEnergy;
            playerHealth = newEnergy; // Atualiza a variável global
            
            // Atualiza a barra de HP
            atualizarBarraHP("barra-hp-jogador", newEnergy, energyInitial);
            
            // Adiciona mensagem ao log
            await addLogMessage(`Você usou ${item.content} e recuperou ${value} pontos de energia.`, 1000);
            await addLogMessage(`Sua energia atual: ${newEnergy}/${energyInitial}`, 800);
            
        } else if (effect === "damage" && value > 0) {
            // Causa dano ao monstro
            if (currentMonster) {
                currentMonster.pontosDeEnergia -= parseInt(value);
                currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
                
                // Atualiza a barra de HP do monstro
                atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
                
                // Adiciona mensagem ao log
                await addLogMessage(`Você usou ${item.content} e causou ${value} pontos de dano ao ${currentMonster.nome}.`, 1000);
                await addLogMessage(`Energia restante do ${currentMonster.nome}: ${currentMonster.pontosDeEnergia}/${currentMonster.pontosDeEnergiaMax}`, 800);
                
                // Verifica se o monstro morreu
                if (currentMonster.pontosDeEnergia <= 0) {
                    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
                    handlePostBattle(currentMonster);
                    return;
                }
            }
        } else {
            // Item sem efeito específico
            await addLogMessage(`Você usou ${item.content}.`, 1000);
        }
        
        // Reduz a quantidade do item
        item.quantity--;
        
        // Remove o item se a quantidade chegar a zero
        if (item.quantity <= 0) {
            inventoryData.itemsInChest.splice(itemIndex, 1);
        }
        
        // Salva as alterações no Firestore
        await setDoc(playerRef, { 
            energy: playerData.energy,
            inventory: inventoryData 
        }, { merge: true });
        
        // Atualiza o estado da batalha
        if (currentMonster) {
            await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerData.energy.total);
        }
        
       // Monstro faz ataque de oportunidade antes de passar o turno
await monsterOpportunityAttack(0.8);
// Passa o turno para o monstro
endPlayerTurn();

        
    } catch (error) {
        console.error("Erro ao usar item:", error);
        // Garantir que a janela feche mesmo em caso de erro
        document.getElementById("itens-modal").style.display = "none";
    }
}


  // Função para carregar magias disponíveis
function carregarMagiasDisponiveis() {
    const magiasContainer = document.getElementById("magias-container");
    magiasContainer.innerHTML = "";
    
    magiasDisponiveis.forEach(magia => {
        const magiaElement = document.createElement("div");
        magiaElement.className = "item-consumivel";
        magiaElement.dataset.magiaId = magia.id;
        magiaElement.dataset.efeito = magia.efeito;
        magiaElement.dataset.valor = magia.valor;
        magiaElement.dataset.custo = magia.custo;
        
        // Verifica se tem magia suficiente
        const temMagiaSuficiente = playerMagic >= magia.custo;
        if (!temMagiaSuficiente) {
            magiaElement.classList.add("disabled");
            magiaElement.style.opacity = "0.5";
        }
        
        magiaElement.innerHTML = `
            <div class="item-nome">${magia.nome}</div>
            <div class="item-quantidade">Custo: ${magia.custo} PM</div>
            <div class="item-descricao">${magia.descricao}</div>
        `;
        
        if (temMagiaSuficiente) {
            magiaElement.addEventListener("click", () => selecionarMagia(magiaElement));
        }
        magiasContainer.appendChild(magiaElement);
    });
}

// Função para selecionar uma magia
function selecionarMagia(magiaElement) {
    // Limpa seleção anterior
    document.querySelectorAll(".item-consumivel").forEach(el => {
        el.classList.remove("selected");
    });
    
    // Seleciona a nova magia
    magiaElement.classList.add("selected");
    
    // Mostra o botão de usar
    const usarBtn = document.querySelector(".usar-magia-btn");
    if (usarBtn) {
        usarBtn.style.display = "block";
        usarBtn.dataset.magiaId = magiaElement.dataset.magiaId;
        usarBtn.dataset.efeito = magiaElement.dataset.efeito;
        usarBtn.dataset.valor = magiaElement.dataset.valor;
        usarBtn.dataset.custo = magiaElement.dataset.custo;
    }
}

// Função para usar uma magia
async function usarMagia(magiaId, efeito, valor, custo) {
  // --- INÍCIO INTEGRAÇÃO ARCANUM ---
if (magiaId === 'missil-magico') {
    setupArcanumConjurationModal();
    return;
}
// --- FIM INTEGRAÇÃO ARCANUM ---
    const userId = auth.currentUser.uid;
    const custoNum = parseInt(custo);
    
    // Verifica se tem magia suficiente
    if (playerMagic < custoNum) {
        await addLogMessage(`Você não tem magia suficiente! (${playerMagic}/${custoNum})`, 1000);
        return;
    }
    
    // Encontra a magia
    const magia = magiasDisponiveis.find(m => m.id === magiaId);
    if (!magia) return;
    
    // Fechar modal
    document.getElementById("magias-modal").style.display = "none";
    
    // Reduz magia
    playerMagic -= custoNum;
    atualizarBarraMagia(playerMagic, playerMaxMagic);
    
    // Criar bloco de turno
    startNewTurnBlock("Magia");
    await addLogMessage(`Você lança ${magia.nome}!`, 800);
    
    // Magias de escudo não fazem teste de resistência
    if (efeito === "shield") {
        // Aplica buff de escudo
        const buffValue = parseInt(valor);
        const buffDuration = 3;
        
        // Remove buff anterior do mesmo tipo se existir
        activeBuffs = activeBuffs.filter(buff => buff.tipo !== "couraca");
        
        // Adiciona novo buff
        activeBuffs.push({
            tipo: "couraca",
            valor: buffValue,
            turnos: buffDuration,
            nome: magia.nome
        });

        updateBuffsDisplay();
        
        await addLogMessage(`${magia.nome} ativo! Sua couraça aumentou em +${buffValue} por ${buffDuration} turnos.`, 800);
        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        endPlayerTurn();
        return;
    }

    if (efeito === "heal") {
        const newEnergy = Math.min(playerHealth + parseInt(valor), playerMaxHealth);
        playerHealth = newEnergy;
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`Você recuperou ${valor} pontos de energia.`, 800);
        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        endPlayerTurn();
        return;
    }

   // Teste de resistência do monstro (apenas para magias que não são touch_attack ou touch_debuff)
if (efeito !== "touch_attack" && efeito !== "touch_debuff") {
        const resistanceRoll = Math.floor(Math.random() * 20) + 1;
        const resistanceTotal = resistanceRoll + currentMonster.habilidade;
        const difficulty = 15;

        await addLogMessage(`${currentMonster.nome} tenta resistir: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 1000);

        if (resistanceTotal >= difficulty) {
            await addLogMessage(`${currentMonster.nome} resistiu à magia!`, 1000);
            // Salva estado e passa turno
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
            endPlayerTurn();
            return;
        } else {
            await addLogMessage(`A magia afeta ${currentMonster.nome}!`, 800);
        }
    }

    if (efeito === "damage") {
        await addLogMessage(`Role o dano da magia!`, 800);
        
        // Salva dados da magia para usar no botão de dano
        window.magicContext = {
            dano: valor,
            userId: userId,
            monsterName: monsterName
        };
        
        // Mostra botão de dano
        const rolarDanoButton = document.getElementById("rolar-dano");
        if (rolarDanoButton) {
            rolarDanoButton.style.display = 'inline-block';
            rolarDanoButton.disabled = false;
        }
        
    } else if (efeito === "dazzle") {
        // Aplica debuff de ofuscamento
        const debuffValue = parseInt(valor);
        const debuffDuration = 3;
        
        // Remove debuff anterior do mesmo tipo se existir
        activeMonsterDebuffs = activeMonsterDebuffs.filter(debuff => debuff.tipo !== "accuracy");
        
        // Adiciona novo debuff
        activeMonsterDebuffs.push({
            tipo: "accuracy",
            valor: debuffValue,
            turnos: debuffDuration,
            nome: magia.nome
        });
        
        updateMonsterDebuffsDisplay();
        
        await addLogMessage(`${currentMonster.nome} está ofuscado! Sua precisão diminuiu em -${debuffValue} por ${debuffDuration} turnos.`, 800);
        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        endPlayerTurn();

    } else if (efeito === "touch_attack") {
        // Salva contexto da magia de toque
        window.touchSpellContext = {
            dano: valor,
            nome: magia.nome,
            userId: userId,
            monsterName: monsterName
        };
        
        await addLogMessage(`Você canaliza ${magia.nome}! Clique no botão "Atacar" para tentar tocar o inimigo.`, 800);
        
        // Salva estado da magia
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        
        // Não passa o turno, aguarda rolagem de ataque
        return;
    

      } else if (efeito === "touch_debuff") {
        // Salva contexto da magia de toque com debuff
        window.touchDebuffContext = {
            dano: valor,
            nome: magia.nome,
            userId: userId,
            monsterName: monsterName
        };
        
        await addLogMessage(`Você canaliza ${magia.nome}! Clique no botão "Atacar" para tentar tocar o inimigo.`, 800);
        
        // Salva estado da magia
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        
        // Não passa o turno, aguarda rolagem de ataque
        return;
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
            addLogMessage(`Você rolou ${playerInitiativeRoll} em um d20 + ${playerAbilityStored} (Habilidade) = ${parseInt(playerInitiativeRoll) + parseInt(playerAbilityStored)} para Iniciativa.`, 1000);
            addLogMessage(`${currentMonster.nome} rolou ${monsterInitiativeRoll} em um d20 + ${monsterAbilityStored} (Habilidade) = ${parseInt(monsterInitiativeRoll) + parseInt(monsterAbilityStored)} para Iniciativa.`, 1000);
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
                    await loadEquippedDice(userId);
            console.log("LOG: Usuário logado. ID:", userId);
            const monsterName = getUrlParameter('monstro');

            // Carregar o estado da batalha ao carregar a página
            if (currentMonster) {
                loadBattleState(userId, monsterName)
    .then(savedState => {
        if (savedState) {
            // Carrega os dados básicos
            currentMonster.pontosDeEnergia = savedState.monsterHealth;
            playerHealth = savedState.playerHealth;
            isPlayerTurn = savedState.isPlayerTurn;
            window.isPlayerTurn = savedState.isPlayerTurn;
            battleStarted = savedState.battleStarted || true; // Se há estado salvo, a batalha já começou
            window.battleStarted = savedState.battleStarted || true;
            
            console.log("LOG: onAuthStateChanged - Estado da batalha carregado do Firestore:", savedState);
            console.log("LOG: onAuthStateChanged - Pontos de Energia do monstro carregados:", currentMonster.pontosDeEnergia);
            console.log("LOG: onAuthStateChanged - Energia do jogador carregada (do estado da batalha):", playerHealth);
            console.log("LOG: onAuthStateChanged - Turno atual:", isPlayerTurn ? "Jogador" : "Monstro");
            
            // Atualiza a interface com a energia do jogador
            const playerHealthDisplay = document.getElementById("player-health");
            if (playerHealthDisplay) {
                playerHealthDisplay.innerText = playerHealth;
                console.log("LOG: onAuthStateChanged - Energia do jogador exibida na interface.");
            }
            
            // Atualiza as barras de HP
            atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
            atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
            
            // Esconde o botão de lutar e mostra o estado correto da batalha
            if (lutarButton) lutarButton.style.display = 'none';
            if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'none';
            
            // Se a vida do monstro for <= 0 ou a vida do jogador for <= 0, a batalha acabou
            if (currentMonster.pontosDeEnergia <= 0) {
                startNewTurnBlock("Resultado");
                addLogMessage(`<p style="color: green;">${currentMonster.nome} foi derrotado!</p>`, 1500);
                attackOptionsDiv.style.display = 'none';
                console.log("LOG: onAuthStateChanged - Monstro derrotado, escondendo opções de ataque.");
            } else if (playerHealth <= 0) {
                startNewTurnBlock("Resultado");
                addLogMessage(`<p style="color: red;">Você foi derrotado!</p>`, 1500);
                attackOptionsDiv.style.display = 'none';
                console.log("LOG: onAuthStateChanged - Jogador derrotado, escondendo opções de ataque.");
            } else {
                // Restaura o estado do turno atual
                if (isPlayerTurn) {
                    startNewTurnBlock("Jogador");
                    addLogMessage(`Turno do Jogador`, 1000);
                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'block';
                } else {
                    startNewTurnBlock(currentMonster.nome);
                    addLogMessage(`Turno do ${currentMonster.nome}`, 1000);
                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
                    // Inicia o turno do monstro após um pequeno delay
                    setTimeout(() => {
                        monsterAttack();
                    }, 2000);
                }
            }
        } else {
            // Se não houver estado salvo, usa os pontos de energia iniciais e define a energia do jogador
            console.log("LOG: onAuthStateChanged - Nenhum estado de batalha encontrado, carregando energia da ficha do jogador.");
        }
        document.getElementById("monster-name").innerText = currentMonster.nome;
        console.log("LOG: onAuthStateChanged - Nome do monstro exibido.");
    });

            }

            const playerDocRef = doc(db, "players", user.uid);
            getDoc(playerDocRef)
                .then(docSnap => {
                    if (docSnap.exists()) {
    playerData = docSnap.data();
    window.playerData = playerData; // Salva globalmente
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

                        // Carrega dados de magia
playerMagic = playerData.magic?.total ? parseInt(playerData.magic.total) : 0;
playerMaxMagic = playerMagic; // Magia máxima é igual ao total atual
atualizarBarraMagia(playerMagic, playerMaxMagic);
console.log("LOG: Magia do jogador carregada:", playerMagic, "/", playerMaxMagic);

                      
                        
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
                                await addLogMessage(`Você rolou ${playerRoll} em um d20 + ${playerAbilityValue} (Habilidade) = ${playerRoll + playerAbilityValue} para Iniciativa.`, 1000);
                                await addLogMessage(`${currentMonster.nome} rolou ${monsterRoll} em um d20 + ${monsterAbilityValue} (Habilidade) = ${monsterRoll + monsterAbilityValue} para Iniciativa.`, 1000);
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
                                        window.isPlayerTurn = true;

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

          // NOVA VERIFICAÇÃO PARA MAGIA
    if (window.magicContext) {
        // É dano de magia
        const danoRolado = rollDice(window.magicContext.dano);
        currentMonster.pontosDeEnergia -= danoRolado;
        currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
        atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
        await addLogMessage(`${currentMonster.nome} sofreu ${danoRolado} de dano mágico (${window.magicContext.dano}).`, 800);
        
        // Limpa contexto
        const userId = window.magicContext.userId;
        const monsterName = window.magicContext.monsterName;
        window.magicContext = null;
        rolarDanoButton.style.display = 'none';
        
        // Verifica se morreu
        if (currentMonster.pontosDeEnergia <= 0) {
            await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
            handlePostBattle(currentMonster);
            return;
        }
        
        // Salva e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, monsterName, currentMonster.pontosDeEnergia, playerHealth);
        endPlayerTurn();
        return;
    }


      // VERIFICAÇÃO PARA TOQUE CHOCANTE
if (window.touchSpellContext) {
    const danoRolado = rollDice(window.touchSpellContext.dano);
    currentMonster.pontosDeEnergia -= danoRolado;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
    await addLogMessage(`${currentMonster.nome} sofreu ${danoRolado} de dano elétrico (${window.touchSpellContext.dano}).`, 800);
    
    // Limpa contexto
    window.touchSpellContext = null;
    rolarDanoButton.style.display = 'none';
    
    // Verifica se morreu
    if (currentMonster.pontosDeEnergia <= 0) {
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
        handlePostBattle(currentMonster);
        return;
    }
    
    // Salva e passa turno
    const user = auth.currentUser;
    if (user) {
        await saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
    }
    endPlayerTurn();
    return;
}

      // VERIFICAÇÃO PARA TOQUE MACABRO
if (window.touchDebuffContext) {
    const danoRolado = rollDice(window.touchDebuffContext.dano);
    currentMonster.pontosDeEnergia -= danoRolado;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
    await addLogMessage(`${currentMonster.nome} sofreu ${danoRolado} de dano necrótico (${window.touchDebuffContext.dano}).`, 800);
    
    // Teste de resistência para o debuff
    const resistanceRoll = Math.floor(Math.random() * 20) + 1;
    const resistanceTotal = resistanceRoll + currentMonster.habilidade;
    const difficulty = 20;
    
    await addLogMessage(`${currentMonster.nome} tenta resistir ao debuff: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 1000);
    
    if (resistanceTotal >= difficulty) {
        await addLogMessage(`${currentMonster.nome} resistiu ao enfraquecimento!`, 800);
    } else {
        await addLogMessage(`${currentMonster.nome} foi enfraquecido! Seus ataques causarão menos dano.`, 800);
        
        // Remove debuff anterior do mesmo tipo se existir
        activeMonsterDebuffs = activeMonsterDebuffs.filter(debuff => debuff.tipo !== "damage_reduction");
        
        // Adiciona novo debuff
        activeMonsterDebuffs.push({
            tipo: "damage_reduction",
            valor: 3,
            turnos: 3,
            nome: "Toque Macabro"
        });
        
        updateMonsterDebuffsDisplay();
    }
    
    // Limpa contexto
    window.touchDebuffContext = null;
    rolarDanoButton.style.display = 'none';
    
    // Verifica se morreu
    if (currentMonster.pontosDeEnergia <= 0) {
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
        handlePostBattle(currentMonster);
        return;
    }
    
    // Salva e passa turno
    const user = auth.currentUser;
    if (user) {
        await saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
    }
    endPlayerTurn();
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
    
    // Chama handlePostBattle passando o monstro atual
    if (typeof handlePostBattle === 'function') {
        handlePostBattle(currentMonster);
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
        // Primeiro verifica se está morto (<=- 10)
if (!isPlayerTurn || playerHealth <= -10 || !currentMonster || currentMonster.pontosDeEnergia <= 0) {
    console.log("LOG: Ataque inválido (jogador morto ou batalha acabou). Retornando.");
    return;
}

// Depois verifica se está inconsciente (entre 0 e -9)
if (playerHealth <= 0) {
    await addLogMessage(`<p style="color: red;">Você está inconsciente e não pode atacar!</p>`, 1000);
    return;
}

      // Verifica se é um ataque de toque mágico
const isTouchSpell = (window.touchSpellContext !== null && window.touchSpellContext !== undefined) || 
                     (window.touchDebuffContext !== null && window.touchDebuffContext !== undefined);


if (isTouchSpell) {
    const spellName = window.touchSpellContext?.nome || window.touchDebuffContext?.nome;
    await addLogMessage(`Tentando tocar ${currentMonster.nome} com ${spellName}...`, 800);
}


        console.log("LOG: Botão 'Atacar Corpo a Corpo' clicado.");

        // Desabilita TODOS os botões de ação inicialmente
        const actionButtons = document.querySelectorAll('#attack-options button');
        actionButtons.forEach(button => button.disabled = true);

        //const playerAttackRollRaw =  1; // PARA TESTE DE FALHA CRÍTICA
        const playerAttackRollRaw = Math.floor(Math.random() * 20) + 1; // ALEATÓRIO NORMAL
        const playerAttackRollTotal = playerAttackRollRaw + playerAbilityValue;
        const monsterDefense = currentMonster.couraça || 0;

        if (isTouchSpell) {
    await addLogMessage(`Rolando toque mágico: ${playerAttackRollRaw} em um d20 + ${playerAbilityValue} (Hab) = ${playerAttackRollTotal} vs Couraça ${monsterDefense}`, 1000);
} else {
    await addLogMessage(`Rolando ataque: ${playerAttackRollRaw} em um d20 + ${playerAbilityValue} (Hab) = ${playerAttackRollTotal} vs Couraça ${monsterDefense}`, 1000);
}


        // --- Falha crítica: 1 natural no d20 ---
if (playerAttackRollRaw === 1 && !isTouchSpell) {
    // Sorteia uma falha crítica
    const sorteio = falhasCriticas[Math.floor(Math.random() * falhasCriticas.length)];
    await addLogMessage(`😱 Falha Crítica! ${sorteio.mensagem}`, 1200);

    if (sorteio.efeito === "autoDano") {
        const autoDano = rollDice("1D4");
        playerHealth -= autoDano;
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`Você sofre ${autoDano} de dano!`, 800);
    }
    // Não faz nada no caso "nada" ou "perdeTurno" (ambos só perdem o turno)
    // Passa imediatamente o turno para o monstro
    if (typeof endPlayerTurn === 'function') {
        endPlayerTurn();
    } else {
        isPlayerTurn = false;
        setTimeout(() => monsterAttack(), 1500);
    }
    return; // NÃO CONTINUA O FLUXO NORMAL
}

        // *** LÓGICA SIFER (NATURAL 20) ***
        if (playerAttackRollRaw === 20 && !isTouchSpell) {
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

                 if (isTouchSpell) {
    await addLogMessage(`Seu toque mágico atinge ${currentMonster.nome}! Role o dano.`, 1000);
} else {
    await addLogMessage(`Seu golpe atinge em cheio o ${currentMonster.nome}! Role o dano.`, 1000);
}

                 window.siferContext = null; // Garante que não estamos em fluxo SIFER

                 // Habilita APENAS o botão de rolar dano
                 // (actionButtons já estão desabilitados desde o início do listener)
                 if(rolarDanoButton) rolarDanoButton.disabled = false;

             } else {
                  // LÓGICA ORIGINAL DE ERRO
                  console.log("LOG: Ataque normal errou.");
                  if (isTouchSpell) {
    await addLogMessage(`Seu toque não consegue alcançar ${currentMonster.nome}.`, 1000);
    window.touchSpellContext = null; // Limpa contexto
    window.touchDebuffContext = null; // Limpa contexto debuff
} else {
    await addLogMessage(`Seu ataque passa de raspão no ${currentMonster.nome}.`, 1000);
}



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
        // Inicializa o painel Arcanum Verbis
    if (window.ArcanumUI) {
        window.ArcanumUI.initPanel();
    }
    
    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
});

function setupArcanumConjurationModal() {
    const magia = magiasDisponiveis.find(m => m.id === 'missil-magico');
    if (!magia) return;

    const {modal, correctWord, conditions} = window.ArcanumSpells.createArcanumConjurationModal(magia);

    const oldModal = document.getElementById('arcanum-conjuration-modal');
    if (oldModal) oldModal.remove();

    document.body.appendChild(modal);
    modal.style.display = 'block';

    let selectedLevel = 1;
    let typingStart = 0;
    let typingEnd = 0;
    let errors = 0;

    modal.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLevel = parseInt(btn.dataset.level, 10);
        });
    });

    const input = modal.querySelector('#conjuration-word');
    input.value = '';
    input.focus();
    errors = 0;
    typingStart = 0;
    typingEnd = 0;

    input.addEventListener('keydown', e => {
        if (typingStart === 0) typingStart = performance.now();
        if (e.key === 'Backspace' || e.key === 'Delete') errors++;
    });
    input.addEventListener('blur', () => { typingEnd = performance.now(); });
    input.addEventListener('input', () => {
        if (typingStart === 0) typingStart = performance.now();
        const now = performance.now();
        const elapsed = ((now - typingStart) / 1000).toFixed(1);
        modal.querySelector('#conjuration-timer').textContent = `${elapsed}s`;
    });

    modal.querySelector('#conjure-spell').onclick = () => {
        typingEnd = performance.now();
        const inputWord = input.value.trim().toUpperCase();
        const totalTime = ((typingEnd > typingStart ? typingEnd : performance.now()) - typingStart) / 1000;
        const result = window.ArcanumSpells.validateConjuration(inputWord, correctWord, selectedLevel, totalTime, errors);

        modal.remove();

        let msg = '';
        if (result.success) {
            msg = `<span style="color:lime;">Conjuração bem-sucedida! <b>${result.level} dardo(s)</b> lançado(s)! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
        } else {
            msg = `<span style="color:red;">Falha ou potência reduzida! Só 1 dardo lançado. (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
        }

        addLogMessage(msg, 500);

        let totalDamage = 0;
        for (let i = 0; i < result.level; i++) {
            totalDamage += rollDice('1d4') + 1;
        }
        if (currentMonster) {
            currentMonster.pontosDeEnergia -= totalDamage;
            atualizarBarraHP("barra-hp-monstro", currentMonster.pontosDeEnergia, currentMonster.pontosDeEnergiaMax);
            addLogMessage(`Dardos Místicos causaram <b>${totalDamage}</b> de dano!`, 1000);
            if (currentMonster.pontosDeEnergia <= 0) {
                addLogMessage(`<span style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</span>`, 1000);
                handlePostBattle(currentMonster);
                return;
            }
        }
        endPlayerTurn();
    };

    modal.querySelector('#cancel-conjuration').onclick = () => { modal.remove(); };
    modal.querySelector('#close-conjuration').onclick = () => { modal.remove(); };
}

console.log("LOG: Fim do script batalha.js");
