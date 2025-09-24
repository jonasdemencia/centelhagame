// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { loadEquippedDice, initializeModule } from './dice-ui.js';
import { getMonsterById } from './monstros.js';
import './arcanum-spells.js';

// Itens iniciais que o jogador deve ter (adicionando propriedade de danoo)

const initialItems = [
{ id: "bolsa-de-escriba", content: "Bolsa de escriba", description: "Uma bolsa para guardar pergaminhos e penas.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/bolsa-de-escriba.png" },
{ id: "velas", content: "Velas", description: "Fontes de luz portáteis.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/velas.png" },
{ id: "pequeno-saco-ervas", content: "Pequeno saco com ervas medicinais", consumable: true, quantity: 3, effect: "heal", value: 2, description: "Um pequeno saco contendo ervas que podem curar ferimentos leves.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pequeno-saco-ervas.png" },
{ id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-menor.png" },
{ id: "pao", content: "Pão", consumable: true, quantity: 1, description: "Um pedaço de pão simples.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pao.png" },
{ id: "pao-mofado", content: "Pão Mofado", consumable: true, quantity: 20, effect: "damage", value: 5, description: "Um pedaço de pão velho e mofado. Estranhamente, parece ter um efeito... diferente.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pao-mofado.png" },
{ id: "elixir-poder", content: "Elixir do Poder Supremo", consumable: true, quantity: 5, effect: "boost_attributes", value: 100, description: "Um elixir mágico que aumenta temporariamente todos os seus atributos para 100.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/elixir-poder.png" },
//{ id: "grilo", content: "Grilo", description: "Um pequeno grilo usado como componente mágico para magias de sono.", componente: true, energia: { total: 1, inicial: 1 } }

];

// Lista de itens que podem ser adicionados dinamicamente (não iniciais)

const extraItems = [

{ id: "grilo", content: "Grilo", uuid: "extra-grilo", description: "Um pequeno grilo saltitante.", componente: true, energia: { total: 1, inicial: 1 }, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/grilo.png" },
{ id: "facao", content: "Facao", uuid: "extra-facao", slot: "weapon", description: "Uma pequena lâmina afiada.", damage: "1D4", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/facao.png" },
{ id: "coberta", content: "Coberta", uuid: "extra-coberta", slot: "armor", description: "Vestes simples que oferecem pouca proteção.", defense: 2, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/coberta.png" },
{ id: "la", content: "Lã", uuid: "extra-la", description: "Fios de lã usados como componente mágico para magias de atordoamento.", componente: true, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/la.png" },
{ id: "pedaco-couro", content: "Pedaço de couro", uuid: "extra-pedaco-couro", description: "Tira de couro endurecido para magias.", componente: true, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pedaco-couro.png" },
{ id: "municao-38", content: "Munição de 38.", uuid: "extra-municao38", quantity: 6, projectile: true, description: "Projéteis letais calíbre 38.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/municao-38.png" },
{ id: "pocao-cura-menor", content: "Poção de Cura Menor", consumable: true, uuid: "extra-pocao-cura-menor", quantity: 2, effect: "heal", value: 3, description: "Uma poção que restaura uma pequena quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-menor.png" },
{ id: "revolver-38", content: "Revolver 38", uuid: "extra-revolver38", slot: "weapon", description: "Um revólver calibre 38.", damage: "1d8", ammoType: "municao-38", ammoCapacity: 6, loadedAmmo: 0, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/revolver-38.png" },
{ id: "escopeta-12", content: "Escopeta 12", uuid: "extra-escopeta12", slot: "weapon", description: "Uma espingarda calibre 12.", damage: "1d12+2", ammoType: "municao-12", ammoCapacity: 5, loadedAmmo: 0, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/escopeta-12.png" },
{ id: "municao-12", content: "Munição de 12.", uuid: "extra-municao12", quantity: 5, projectile: true, description: "Projéteis letais calíbre 12.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/municao-12.png" },
{ id: "Adaga", content: "Adaga", uuid: "extra-adaga", slot: "weapon", description: "Uma punhal afiado.", damage: "1D4", image: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/images/items/adaga.png" },
{ id: "granada-mao", content: "Granada de Mão", uuid: "extra-granada-mao", consumable: true, quantity: 3, effect: "explosion", damage: "3D8", description: "Explosivo portátil de área (raio 3). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-mao.png" },
{ id: "granada-de-concussao", content: "Granada de Concussão", uuid: "extra-granada-de-concussao", consumable: true, quantity: 3, effect: "stun", damage: "3D4", description: "Explosivo de concussão de área (raio 2). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 2, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-de-concussao.png" },
{ id: "granada-incendiaria", content: "Granada Incendiária", uuid: "extra-granada-incendiaria", consumable: true, quantity: 3, effect: "explosion", damage: "2D6", description: "Explosivo incendiário de área (raio 3). Pode ser lançada para causar dano em área.", areaEffect: true, areaRadius: 3, allowsResistance: false, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/granada-incendiaria.png" },
{ id: "peitoral-de-aço", content: "Peitoral de aço", uuid: "extra-peitoral-de-aço", slot: "armor", description: "Armadura média, de peso considerável", defense: 20, image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/peitoral-de-aço.png" },
{ id: "pocao-cura-completa", content: "Poção de Cura Completa", consumable: true, uuid: "extra-pocao-cura-completa", quantity: 10, effect: "heal", value: 150, description: "Uma poção que restaura uma massiva quantidade de energia vital.", image: "https://raw.githubusercontent.com/DanielSanMedium/CentelhaGame/main/images/pocao-cura-completa.png" },

];

const armasLeves = ["Adaga"];

let monsterNames = []; // <--- ADICIONE ESTA LINHA AQUI
// Sistema Flecha Ácida de Melf
let preparingSpells = [];
let relampagoRiskCounter = 1; // Contador de risco do Relâmpago (1-20)
window.animatedUndead = [];
window.deadBodies = [];
window.bigbyHandShields = {}; // { monsterId: { shield: valor, couraca: 20, turnos: duracao } }


// Sistema de rastreamento de dano por turno
window.damageTracker = {
    currentTurn: {},
    previousTurn: {},
    
    addDamage(dealerId, damage) {
        if (!this.currentTurn[dealerId]) this.currentTurn[dealerId] = 0;
        this.currentTurn[dealerId] += damage;
    },
    
    endTurn() {
        this.previousTurn = { ...this.currentTurn };
        this.currentTurn = {};
    },
    
    getHighestDamageDealer() {
        let maxDamage = 0;
        let topDealer = null;
        
        for (const [dealerId, damage] of Object.entries(this.previousTurn)) {
            if (damage > maxDamage) {
                maxDamage = damage;
                topDealer = dealerId;
            }
        }
        
        return topDealer;
    }
};

function updateMonsterInfoUI() {
    const target = window.currentMonster;
    if (!target) {
        document.getElementById("monster-name").innerText = "Nenhum alvo";
        document.getElementById("monster-description").innerText = "";
        document.getElementById("monster-image").src = "";
        // A barra de debuffs também deve ser limpa se não houver alvo
        const debuffsContainer = document.getElementById('monster-debuffs-container');
        if (debuffsContainer) debuffsContainer.innerHTML = '';
        return;
    }

    document.getElementById("monster-name").innerText = target.nome;
    document.getElementById("monster-description").innerText = target.descricao;
    document.getElementById("monster-image").src = target.imagem;

}


function displayAllMonsterHealthBars() {
  const container = document.getElementById('monster-bars-container');
  if (!container) return;
  container.innerHTML = '';
    
  // Exibe barras de vida dos monstros atuais
  window.currentMonsters.forEach(monster => {
    const isTarget = (window.currentMonster && window.currentMonster.id === monster.id);
    const monsterDiv = document.createElement('div');
    monsterDiv.className = 'monster-bar-item' + (isTarget ? ' target' : '');
    monsterDiv.style.cursor = 'pointer';

    const barraId = `barra-hp-monstro-${monster.id}`;
    const valorId = `hp-monstro-${monster.id}-valor`;
    const debuffsId = `monster-debuffs-${monster.id}`; // ID único para os debuffs

    monsterDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
        <span>${monster.nome} ${isTarget ? '🎯' : ''}</span>
      </div>
      <div class="barra-hp-container" style="position: relative;">
        <div id="${barraId}" class="barra-hp"></div>
        <span id="${valorId}" class="hp-valor"></span>
      </div>
      <div id="${debuffsId}" class="debuffs-container"></div>
    `;

    monsterDiv.addEventListener('click', () => {
      if (monster.pontosDeEnergia > 0) {
        window.currentMonster = monster;
        currentMonster = monster;
        updateMonsterInfoUI();
        displayAllMonsterHealthBars();
      }
    });

    container.appendChild(monsterDiv);

    // Atualiza barra de HP e debuffs
    atualizarBarraHP(barraId, monster.pontosDeEnergia, monster.pontosDeEnergiaMax);
    renderMonsterDebuffs(monster);
  });

  // Exibir mortos-vivos
  window.animatedUndead
    .filter(u => u.pontosDeEnergia > 0)
    .forEach(undead => {
      const undeadDiv = document.createElement('div');
      undeadDiv.className = 'monster-bar-item';
      undeadDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
          <span>${undead.nome} 💀</span>
        </div>
        <div class="barra-hp-container">
          <div
            class="barra-hp"
            style="
              width: ${(undead.pontosDeEnergia / undead.pontosDeEnergiaMax) * 100}%;
              background-color: #666;
            "
          ></div>
          <span class="hp-valor">
            ${undead.pontosDeEnergia}/${undead.pontosDeEnergiaMax}
          </span>
        </div>
      `;
      container.appendChild(undeadDiv);
    });
}



// Sistema Arcanum Iudicium
window.arcanumIudicium = {
    sucessos: 0,
    falhas: 0,
    ultimaCategoria: null,
    magiaComDesconto: null,
    magiasMemorizadas: [],
    
    async sucesso() { 
        this.sucessos++; 
        console.log(`Arcanum Iudicium: Sucesso (${this.sucessos}/${this.sucessos + this.falhas})`);
        await this.salvarFirestore();
    },
    
    async falha() { 
        this.falhas++; 
        console.log(`Arcanum Iudicium: Falha (${this.sucessos}/${this.sucessos + this.falhas})`);
        await this.salvarFirestore();
    },
    
    getEficiencia() {
        const total = this.sucessos + this.falhas;
        return total > 0 ? (this.sucessos / total * 100).toFixed(1) : 0;
    },
    
    getCategoria() {
        const eficiencia = parseFloat(this.getEficiencia());
        if (eficiencia >= 80) return 'alta';
        if (eficiencia < 30) return 'muito-baixa';
        return 'baixa';
    },
    
    async salvarFirestore() {
        try {
            const user = auth?.currentUser;
            if (!user) return;
            
            const playerRef = doc(db, "players", user.uid);
            await setDoc(playerRef, { 
                arcanumIudicium: {
                    sucessos: this.sucessos,
                    falhas: this.falhas,
                    ultimaCategoria: this.ultimaCategoria,
                    magiaComDesconto: this.magiaComDesconto,
                    magiasMemorizadas: this.magiasMemorizadas
                }
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao salvar Arcanum Iudicium:", error);
        }
    },
    
    async carregarFirestore() {
        try {
            const user = auth?.currentUser;
            if (!user) return;
            
            const playerRef = doc(db, "players", user.uid);
            const playerSnap = await getDoc(playerRef);
            
            if (playerSnap.exists() && playerSnap.data().arcanumIudicium) {
                const data = playerSnap.data().arcanumIudicium;
                this.sucessos = data.sucessos || 0;
                this.falhas = data.falhas || 0;
                this.ultimaCategoria = data.ultimaCategoria || null;
                this.magiaComDesconto = data.magiaComDesconto || null;
                this.magiasMemorizadas = data.magiasMemorizadas || [];
            }
        } catch (error) {
            console.error("Erro ao carregar Arcanum Iudicium:", error);
        }
    },
    
    isMagiaMemorizada(nomeMagia) {
        return this.magiasMemorizadas.includes(nomeMagia);
    }
};

// Sistema de Condições Ambientais Globais - Arcanum Verbis
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');


function getConditionIcon(tipo, valor) {
    const icones = {
        periodo: { manha: '🌅', tarde: '☀️', noite: '🌙', madrugada: '🌌' },
        estacao: { primavera: '🌸', verao: '🌞', outono: '🍂', inverno: '❄️' },
        vento: { norte: '⬆️💨', sul: '⬇️💨', leste: '➡️💨', oeste: '⬅️💨', nordeste: '↗️💨', noroeste: '↖️💨', sudeste: '↘️💨', sudoeste: '↙️💨' },
        clima: { 'sol-forte': '☀️', 'sol-fraco': '🌤️', nublado: '☁️', 'chuva-leve': '🌦️', neblina: '🌫️', tempestade: '⛈️' },
        lua: { nova: '🌑', crescente: '🌓', cheia: '🌕', minguante: '🌗' },
        temperatura: { 'muito-frio': '🥶', frio: '❄️', ameno: '🌡️', quente: '🔥', 'muito-quente': '🌋' },
        pressao: { alta: '📈', normal: '📊', baixa: '📉' },
        energiaMagica: { alta: '⚡', normal: '✨', baixa: '💫', interferencia: '🌀' }
    };
    return icones[tipo]?.[valor] || '❓';
}


// Variáveis globais para estado da batalha
window.isPlayerTurn = false;
window.battleStarted = false;
window.currentMonsters = []; // NOVO: Array para todos os monstros em combate.
window.currentMonster = null; // IMPORTANTE: Agora representa o ALVO ATUAL do jogador.
let escapeAttempts = 0; // Contador de tentativas de fuga
let nextTelegraphedAttack = null; // Próximo ataque telegrafado
let activeBuffs = []; // Sistema de buffs temporários
let activeMonsterDebuffs = []; // IMPORTANTE: Será um "ponteiro" para os debuffs do monstro ativo.
let currentTurnBlock = null;
let attackOptionsDiv = null;
let monsterName = null; // Adicionar esta linha
let userId = null; // ✅ ADICIONE ESTA LINHA AQUI
let currentMonster = null; // Mantido para compatibilidade local
let battleId = null; // ID único para o encontro



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

function updatePlayerProjectilesDisplay() {
    const container = document.getElementById('player-projectiles');
    if (!container) return;

    // Busca o inventário do jogador carregado (playerData)
    const inventory = window.playerData?.inventory;
    if (!inventory) {
        container.innerHTML = '';
        return;
    }

    // Busca a arma equipada
    const equippedWeaponName = inventory.equippedItems?.weapon;
    if (!equippedWeaponName) {
        container.innerHTML = '';
        return;
    }

    // Busca o objeto da arma equipada
    const allItemsArr = [...initialItems, ...extraItems];
    const weaponObj = allItemsArr.find(item => item.content === equippedWeaponName && item.ammoType);

    if (!weaponObj) {
        container.innerHTML = '';
        return;
    }

    // Busca a munição carregada
    const loadedAmmo = inventory.equippedItems.weapon_loadedAmmo || 0;

    // Exibe um ícone para cada munição carregada
    let html = '';
    for (let i = 0; i < loadedAmmo; i++) {
        html += '<span style="font-size:18px; margin-right:1px;">🔘</span>';
    }
    container.innerHTML = html;
}

// Nova função para orquestrar o turno de múltiplos monstros
async function monstersTurn() {
    console.log("LOG: Iniciando monstersTurn para todos os oponentes.");
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);

    for (const monster of monstersAlive) {
        if (playerHealth <= -10) {
            console.log("LOG: Jogador morreu no meio do turno dos monstros. Interrompendo.");
            break; 
        }

        // Define o monstro da vez como o 'currentMonster' global para a lógica de ataque
        window.currentMonster = monster;
        currentMonster = monster; // Atualiza a variável local também
        
        // Cada monstro agora tem sua própria lista de debuffs.
        // Apontamos a variável global para a lista do monstro da vez.
        if (!monster.activeMonsterDebuffs) {
            monster.activeMonsterDebuffs = [];
        }
        activeMonsterDebuffs = monster.activeMonsterDebuffs;

        // Chama a lógica de ataque individual para o monstro da vez
        await monsterAttack(); 
    }

    // Após todos os monstros atacarem, se o jogador ainda estiver vivo, passa o turno.
    if (playerHealth > -10) {
        // Define o alvo do jogador como o primeiro monstro vivo na lista
        window.currentMonster = window.currentMonsters.find(m => m.pontosDeEnergia > 0) || null;
        currentMonster = window.currentMonster;
        
        // Atualiza a UI para refletir o alvo atual do jogador
        if(currentMonster) {
            if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
            activeMonsterDebuffs = currentMonster.activeMonsterDebuffs;
            updateMonsterInfoUI(); // Função que atualiza nome, hp, etc. do monstro
        }
        
        endMonsterTurn(); // Finalmente, passa o turno para o jogador
    }
}

// Lógica do turno do monstro
async function monsterAttack() {
    console.log("LOG: Iniciando monsterAttack. currentMonster:", currentMonster, "playerHealth:", playerHealth, "isPlayerTurn:", isPlayerTurn);

    if (currentMonster.pontosDeEnergia <= 0) {
        console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
        console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
            registerDeadBody(currentMonster); // ← ADICIONAR
        console.log("LOG: monsterAttack - Monstro já está morto. Retornando.");
        return;
    }
    // Verifica se o jogador já está morto
    if (isPlayerTurn || playerHealth <= -10 || !currentMonster) {
        console.log("LOG: monsterAttack - Turno inválido ou jogador morto. Retornando.");
        return;
    }

    startNewTurnBlock(currentMonster.nome);
await addLogMessage(`Turno do ${currentMonster.nome}`, 1000);

// Verifica se está rdoado ANTES de processar debuffs
const stunDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "stun");
if (stunDebuff) {
    await addLogMessage(`${currentMonster.nome} está pasmado e perde o turno!`, 1000);
    await processMonsterDebuffs(); // Remove o stun
    return;
}

    // Verifica se está dormindo ANTES de processar outros debuffs
const sleepDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "sleep");
if (sleepDebuff) {
    await addLogMessage(`${currentMonster.nome} está dormindo e perde o turno!`, 1000);
    await processMonsterDebuffs(); // Remove o sono
    return;
}


// PROCESSA DEBUFFS DO MONSTRO
await processMonsterDebuffs();

    // Processa sangramento de evisceração
const bleedingDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "bleeding");
if (bleedingDebuff) {
    currentMonster.pontosDeEnergia -= bleedingDebuff.valor;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${currentMonster.nome} perde ${bleedingDebuff.valor} HP por evisceração.`, 800);
    
   // Verifica se morreu por sangramento
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
        registerDeadBody(currentMonster); // ← ADICIONAR
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} morreu por perda de sangue!</p>`, 1000);
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        handlePostBattle(currentMonster);
    }
    return; // Retorna para que o monstro morto não ataque. O loop principal continua.
}
}

    // Processa veneno
const poisonDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "poison");
if (poisonDebuff) {
    currentMonster.pontosDeEnergia -= poisonDebuff.valor;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${currentMonster.nome} perde ${poisonDebuff.valor} de energia por veneno.`, 800);

    // Verifica se morreu por veneno
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
        registerDeadBody(currentMonster); // ← ADICIONAR
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} sucumbiu ao veneno!</p>`, 1000);
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        handlePostBattle(currentMonster);
    }
    return; // Retorna para que o monstro morto não ataque. O loop principal continua.
}
}

    // Processa queimadura
const burnDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "burn");
if (burnDebuff) {
    currentMonster.pontosDeEnergia -= burnDebuff.valor;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${currentMonster.nome} perde ${burnDebuff.valor} HP por queimadura.`, 800);
    
    // Verifica se morreu por queimadura
    if (currentMonster.pontosDeEnergia <= 0) {
        console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
        console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
            registerDeadBody(currentMonster); // ← ADICIONAR
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} morreu queimado!</p>`, 1000);
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
        }
        return;
    }
}
    // Processa Assassino Fantasmagórico
const phantomDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "phantom_assassin");
if (phantomDebuff) {
    const assassinRoll = Math.floor(Math.random() * 20) + 1;
    const monsterDefense = getMonsterDefense();
    
    await addLogMessage(`O Assassino Fantasmagórico ataca ${currentMonster.nome}: ${assassinRoll} vs ${monsterDefense}`, 1000);
    
    if (assassinRoll >= monsterDefense) {
        await addLogMessage(`<p style="color: darkred; font-weight: bold;">O Assassino Fantasmagórico executa ${currentMonster.nome}!</p>`, 1200);
        currentMonster.pontosDeEnergia = 0;
        displayAllMonsterHealthBars();
        
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
        }
        return;
    } else {
        await addLogMessage(`O Assassino Fantasmagórico falha em seu ataque.`, 800);
    }
}

    // Processa DOT ácido
const acidDot = currentMonster.activeMonsterDebuffs.find(debuff => debuff.tipo === "acid_dot");
if (acidDot) {
    const damage = rollDice(acidDot.valor);
    currentMonster.pontosDeEnergia -= damage;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${currentMonster.nome} perde ${damage} Energia por ácido corrosivo.`, 800);
    
        if (currentMonster.pontosDeEnergia <= 0) {
        console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
        console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
            registerDeadBody(currentMonster);
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi dissolvido pelo ácido!</p>`, 1000);
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
            return;
        } else {
            window.currentMonster = monstersAlive[0];
            currentMonster = window.currentMonster;
            updateMonsterInfoUI();
            displayAllMonsterHealthBars();
            return;
        }
    }
}



// Processa amputação de pernas (chance de perder turno)
const legsDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "amputation_legs");
if (legsDebuff) {
    const chancePerderTurno = Math.random();
    if (chancePerderTurno < 0.3) { // 30% chance
        await addLogMessage(`${currentMonster.nome} se debate no chão e perde o turno!`, 1000);
        endMonsterTurn();
        return;
    }
}

    
    // Determina o alvo (80% chance de atacar quem causou mais dano)
    let targetEntity = null;
    let isTargetingPlayer = true;

    const aliveUndead = window.animatedUndead.filter(u => u.pontosDeEnergia > 0);
    const highestDamageDealer = window.damageTracker.getHighestDamageDealer();
    const shouldTargetTopDealer = Math.random() < 0.8;

    if (shouldTargetTopDealer && highestDamageDealer) {
        if (highestDamageDealer === 'player') {
            targetEntity = 'player';
            isTargetingPlayer = true;
        } else {
            targetEntity = aliveUndead.find(u => u.id === highestDamageDealer);
            if (targetEntity) {
                isTargetingPlayer = false;
            } else {
                targetEntity = 'player';
                isTargetingPlayer = true;
            }
        }
    } else {
        const allTargets = ['player', ...aliveUndead];
        const randomTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
        
        if (randomTarget === 'player') {
            targetEntity = 'player';
            isTargetingPlayer = true;
        } else {
            targetEntity = randomTarget;
            isTargetingPlayer = false;
        }
    }

    // Escolhe o ataque
    let selectedAttack;
    if (nextTelegraphedAttack) {
        selectedAttack = nextTelegraphedAttack;
        nextTelegraphedAttack = null;
        await addLogMessage(`<strong style="color: orange;">${selectedAttack.nome}!</strong>`, 800);
    } else {
        selectedAttack = chooseMonsterAttack(currentMonster);
        const targetName = isTargetingPlayer ? 'você' : targetEntity.nome;
        await addLogMessage(`${currentMonster.nome} usa ${selectedAttack.nome} contra ${targetName}.`, 800);
    }

    // Rolagem de ataque
    const monsterRollRaw = Math.floor(Math.random() * 20) + 1;
    const accuracyPenalty = activeMonsterDebuffs
        .filter(debuff => debuff.tipo === "accuracy")
        .reduce((total, debuff) => total + debuff.valor, 0);

    const monsterAttackRoll = monsterRollRaw - accuracyPenalty;

    if (accuracyPenalty > 0) {
        await addLogMessage(`${currentMonster.nome} sofre -${accuracyPenalty} de penalidade por debuffs.`, 800);
    }

    await addLogMessage(`${currentMonster.nome} rolou ${monsterRollRaw} em um D20 para atacar.`, 1000);

    // Calcula defesa do alvo
    let targetDefense;
    if (isTargetingPlayer) {
        targetDefense = getPlayerDefense();
        await addLogMessage(`Sua Couraça é ${targetDefense}.`, 1000);
    } else {
        targetDefense = targetEntity.couraça || 0;
        await addLogMessage(`Couraça do ${targetEntity.nome} é ${targetDefense}.`, 1000);
    }

    // Verifica se o ataque acertou
    if (monsterAttackRoll >= targetDefense) {
                const isCriticalHit = monsterRollRaw === 20;
        
        if (isCriticalHit) {
            await addLogMessage(`<strong style="color: red;">ACERTO CRÍTICO!</strong> O ataque atinge um ponto vital!`, 1000);
        } else {
            await addLogMessage(`O ataque acertou!`, 1000);
        }

        let monsterDamageRoll = rollDice(selectedAttack.dano);

        // Aplica modificadores apenas para ataques contra o jogador
        if (isTargetingPlayer) {
            // --- INÍCIO: Dissipar buff oculto se acertado ---
            const ocultoBuffIndex = activeBuffs.findIndex(buff => buff.tipo === "oculto");
            if (ocultoBuffIndex !== -1) {
                activeBuffs.splice(ocultoBuffIndex, 1);
                updateBuffsDisplay();
                await addLogMessage(`<span style="color:red;">Você foi atingido enquanto estava oculto! Seu estado de ocultação se dissipa e você não poderá aplicar o Backstab.</span>`, 1000);
                window.isBackstabAttack = false;
            }
            // --- FIM: Dissipar buff oculto se acertado ---

            // Aplica redução de dano por debuffs
            const damageReduction = activeMonsterDebuffs
                .filter(debuff => debuff.tipo === "damage_reduction")
                .reduce((total, debuff) => total + debuff.valor, 0);

            if (damageReduction > 0) {
                monsterDamageRoll = Math.max(0, monsterDamageRoll - damageReduction);
                await addLogMessage(`Dano reduzido em ${damageReduction} por debuffs (${monsterDamageRoll + damageReduction} → ${monsterDamageRoll}).`, 800);
            }

            // Aplica redução de dano por amputação de braços
            const armsDebuff = activeMonsterDebuffs.find(debuff => debuff.tipo === "amputation_arms");
            if (armsDebuff) {
                const originalDamage = monsterDamageRoll;
                monsterDamageRoll = Math.max(1, Math.floor(monsterDamageRoll * 0.3));
                await addLogMessage(`Dano reduzido por amputação (${originalDamage} → ${monsterDamageRoll}).`, 800);
            }
        }
        
        if (isCriticalHit) {
            monsterDamageRoll = Math.floor(monsterDamageRoll * 1.5);
            const criticalEffects = [
                "O golpe certeiro causa dano devastador!",
                "Um ataque preciso que encontra uma brecha!",
                "O impacto é brutal e certeiro!"
            ];
            const randomEffect = criticalEffects[Math.floor(Math.random() * criticalEffects.length)];
            await addLogMessage(`<em>${randomEffect}</em>`, 800);
        }

        // Aplica o dano no alvo correto
        if (isTargetingPlayer) {
            // Verifica imunidade de Pele Rochosa
            const peleRochosaBuff = activeBuffs.find(buff => buff.tipo === "pele_rochosa");
            if (peleRochosaBuff) {
                peleRochosaBuff.turnos--;
                if (peleRochosaBuff.turnos <= 0) {
                    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "pele_rochosa");
                    await addLogMessage(`Pele Rochosa se dissipou.`, 800);
                }
                updateBuffsDisplay();
                await addLogMessage(`Pele Rochosa: Você é imune ao ataque físico!`, 1000);
                return;
            }

            // Antes de: playerHealth -= monsterDamageRoll;
const bigbyShield = window.bigbyHandShields[currentMonster.id];
if (bigbyShield && bigbyShield.turnos > 0 && bigbyShield.shield > 0) {
    if (monsterDamageRoll <= bigbyShield.shield) {
        bigbyShield.shield -= monsterDamageRoll;
        await addLogMessage(`Mão de Bigby absorve ${monsterDamageRoll} de dano! Escudo: ${bigbyShield.shield}`, 800);
        monsterDamageRoll = 0;
    } else {
        const remainingDamage = monsterDamageRoll - bigbyShield.shield;
        await addLogMessage(`Mão de Bigby absorve ${bigbyShield.shield} e se dissipa!`, 800);
        delete window.bigbyHandShields[currentMonster.id];
        updateBuffsDisplay();
        monsterDamageRoll = remainingDamage;
    }
}


            playerHealth -= monsterDamageRoll;
            atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
            await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano a você${isCriticalHit ? " crítico" : ""}.`, 1000);

            // Verifica reflexão do Escudo do Fogo
            const fireShieldBuff = activeBuffs.find(buff => buff.tipo === "fire_shield");
            if (fireShieldBuff) {
                const resistanceRoll = Math.floor(Math.random() * 20) + 1;
                const resistanceTotal = resistanceRoll + currentMonster.habilidade;
                const difficulty = 20;
                
                await addLogMessage(`${currentMonster.nome} tenta resistir ao Escudo do Fogo: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 800);
                
                if (resistanceTotal < difficulty) {
                    currentMonster.pontosDeEnergia -= monsterDamageRoll;
                    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
                    displayAllMonsterHealthBars();
                    await addLogMessage(`<span style="color: orange;">Escudo do Fogo reflete ${monsterDamageRoll} de dano de volta para ${currentMonster.nome}!</span>`, 1000);
                    
                    if (currentMonster.pontosDeEnergia <= 0) {
                        registerDeadBody(currentMonster);
                        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado pela reflexão!</p>`, 1000);
                        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
                        if (monstersAlive.length === 0) {
                            handlePostBattle(currentMonster);
                            return;
                        } else {
                            window.currentMonster = monstersAlive[0];
                            currentMonster = window.currentMonster;
                            updateMonsterInfoUI();
                            displayAllMonsterHealthBars();
                        }
                    }
                } else {
                    await addLogMessage(`${currentMonster.nome} resistiu ao Escudo do Fogo! Nenhum dano refletido.`, 800);
                }
            }
            
            // Salva o estado
            const user = auth.currentUser;
            if (user) {
                await updatePlayerEnergyInFirestore(user.uid, playerHealth);
                await saveBattleState(user.uid, battleId, playerHealth);
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
            // Ataca o morto-vivo
            targetEntity.pontosDeEnergia -= monsterDamageRoll;
            targetEntity.pontosDeEnergia = Math.max(0, targetEntity.pontosDeEnergia);
            displayAllMonsterHealthBars();
            await addLogMessage(`${currentMonster.nome} causou ${monsterDamageRoll} de dano ao ${targetEntity.nome}${isCriticalHit ? " crítico" : ""}.`, 1000);
            
            if (targetEntity.pontosDeEnergia <= 0) {
                await addLogMessage(`<p style="color: red; font-weight: bold;">${targetEntity.nome} foi destruído!</p>`, 1000);
                window.animatedUndead = window.animatedUndead.filter(u => u.id !== targetEntity.id);
                displayAllMonsterHealthBars();
            }
            
            await addLogMessage(`Energia do ${targetEntity.nome}: ${targetEntity.pontosDeEnergia}.`, 1000);
        }

    } else {
                const targetName = isTargetingPlayer ? 'você' : targetEntity.nome;
        await addLogMessage(`O ataque contra ${targetName} errou.`, 1000);
    }

    // Telegrafação após o ataque (se não foi um ataque telegrafado)
        if (!nextTelegraphedAttack && currentMonster.ataques) {
            const nextAttack = chooseMonsterAttack(currentMonster);
            if (nextAttack.telegrafado) {
                nextTelegraphedAttack = nextAttack;
                await addLogMessage(`<em style="color: yellow;">${nextAttack.mensagemTelegraf}</em>`, 1200);
            }
        }

        // A função monsterAttack agora termina aqui, sem passar o turno.
        // A função monstersTurn() cuidará de passar o turno após o loop.
    }


// Finaliza o turno do jogador e inicia o turno do monstro
function endPlayerTurn() {
    console.log("LOG: Finalizando turno do jogador e iniciando turno do monstro.");
    if (!isPlayerTurn) {
        console.error("LOG: endPlayerTurn chamado fora do turno do jogador. Abortando.");
        return;
    }
    window.damageTracker.endTurn();

    // VELOCIDADE - VERIFICAR SE TODOS OS MONSTROS ESTÃO MORTOS ANTES DA SEGUNDA AÇÃO
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        console.log("LOG: Todos os monstros mortos, não permitindo segunda ação de Velocidade");
        window.velocidadeUsada = false;
        return; // Não continua se não há monstros vivos
    }

    const velocidadeBuff = activeBuffs.find(buff => buff.tipo === "velocidade");
    if (velocidadeBuff && !window.velocidadeUsada) {
        window.velocidadeUsada = true;
        addLogMessage("Buff de Velocidade: Você pode agir novamente!", 800);
        // Reabilita botões para segunda ação
        if (attackOptionsDiv) {
            attackOptionsDiv.style.display = 'block';
            const buttons = document.querySelectorAll('#attack-options button');
            buttons.forEach(button => {
                button.disabled = false;
                if (button.id === 'atacar-corpo-a-corpo' || button.id === 'ato-classe' || button.id === 'itens-ferramentas' || button.id === 'atacar-a-distancia') {
                    button.style.display = 'inline-block';
                }
            });
        }
        return; // Não passa o turno ainda
    }
    
    // Reset da flag de velocidade para o próximo turno
    window.velocidadeUsada = false;

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
    
    setTimeout(async () => { // ✅ Adicionar async aqui
        await undeadAttack();
        console.log("LOG: Chamando monsterAttack após fim do turno do jogador.");
        console.log(`Eficiência Arcanum Iudicium: ${window.arcanumIudicium.getEficiencia()}%`); // ADICIONAR AQUI
        monstersTurn();
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
        valor: "1d8"
    },

    {
        id: "cura-maior",
        nome: "Cura Maior",
        descricao: "Restaura uma grande quantidade de energia",
        custo: 2,
        efeito: "heal",
        valor: "18d8+1" // apenas para testar
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
    id: "causar-medo",
    nome: "Causar Medo",
    descricao: "Faz o monstro fugir de terror (apenas monstros com energia < 40)",
    custo: 3,
    efeito: "fear",
    valor: 1
},


    {
    id: "raio-acido",
    nome: "Raio de Ácido",
    descricao: "Projétil ácido que corrói o alvo",
    custo: 1,
    efeito: "damage",
    valor: "1d3"
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
    id: "sono",
    nome: "Sono",
    descricao: "Faz o monstro dormir e garante crítico no próximo ataque (apenas monstros com energia < 50)",
    custo: 5,
    efeito: "sleep",
    valor: 1,
    componentes: ["grilo"] // ADICIONE ESTA LINHA
},
    {
        id: "voo",
        nome: "Voo",
        descricao: "Concede voo mágico: +4 ataque para você, -4 ataque para todos inimigos por 1d10 turnos",
        custo: 5,
        efeito: "flight",
        valor: 4
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
    id: "cone-glacial",
    nome: "Cone Glacial",
    descricao: "Cone de gelo devastador (até 20d4+20, cada modificador = 1d4+1)",
    custo: 2,
    efeito: "cone_glacial",
    valor: "1d4"
},
        {
        id: "mao-interposta-bigby",
        nome: "A Mão Interposta de Bigby",
        descricao: "Uma mão gigante de proteção, com couraça 20 e energia igual a do mago",
        custo: 2,
        efeito: "bigby_hand",
        valor: 20
    },
        {
        id: "animar-mortos",
        nome: "Animar os Mortos",
        descricao: "Anima esqueletos ou zumbis de corpos mortos (Arcanum Verbis)",
        custo: 2,
        efeito: "animate_dead",
        valor: 1
    },
    {
    id: "pele-rochosa",
    nome: "Pele Rochosa",
    descricao: "Imunidade total a ataques físicos por 1d4+1d10 turnos",
    custo: 2,
    efeito: "pele_rochosa",
    valor: 1
},
    {
    id: "assassino-fantasmagorico",
    nome: "Assassino Fantasmagórico",
    descricao: "Invoca um assassino que tenta matar o alvo. Se resistir, se volta contra você.",
    custo: 1,
    efeito: "phantom_assassin",
    valor: 1
},
    {
    id: "escudo-do-fogo",
    nome: "Escudo do Fogo",
    descricao: "Buff +2 couraça e reflete dano por 2 turnos + 1d20. Pode ser resistido.",
    custo: 8,
    efeito: "fire_shield",
    valor: 2
},
    {
    id: "toque-vampirico",
    nome: "Toque Vampírico",
    descricao: "Toque que drena energia vital do inimigo (até 6d6, cada modificador = 1d6)",
    custo: 10,
    efeito: "touch_vampiric",
    valor: "1d6"
},
    {
    id: "relampago",
    nome: "Relâmpago",
    descricao: "Relâmpago mágico de área que atinge até 5 oponentes (até 10d6, cada modificador = 2 níveis)",
    custo: 10,
    efeito: "area_damage",
    valor: "2d6",
    areaEffect: true,
    areaRadius: 5,
    allowsResistance: true
},
    {
    id: "flecha-acida-melf",
    nome: "Flecha Ácida de Melf",
    descricao: "Prepara por 2 turnos, depois causa 2d4 inicial + 2d4 por turno (nível = turnos extras)",
    custo: 8,
    efeito: "melf_preparation",
    valor: "2d4"
},    
    {
    id: "pasmar",
    nome: "Pasmar",
    descricao: "Faz o monstro perder o próximo turno (apenas monstros com energia < 50)",
    custo: 3,
    efeito: "stun",
    valor: 1,
    componentes: ["la"] // ← ADICIONE ESTA LINHA
},

    {
        id: "escudo-arcano",
        nome: "Escudo Arcano",
        descricao: "Aumenta temporariamente a couraça",
        custo: 3,
        efeito: "shield",
        valor: 4
    },
{
    id: "esfera-flamejante",
    nome: "Esfera Flamejante",
    descricao: "Projétil flamejante de área (raio 2)",
    custo: 4,
    efeito: "area_damage",
    valor: "2d6",
    areaEffect: true,
    areaRadius: 2,
    allowsResistance: true
},
    {
    id: "velocidade",
    nome: "Velocidade",
    descricao: "Ganha +2 couraça e 2 ações por turno por 3 turnos + 1d20",
    custo: 10,
    efeito: "velocidade",
    valor: 2
},
{
        id: "armadura-arcana",
        nome: "Armadura Arcana",
        descricao: "Aumenta temporariamente a couraça",
        custo: 3,
        efeito: "shield",
        valor: 4,
        componentes: ["pedaco-couro"]
    }
    
];

/// Função para verificar se o jogador possui todos os componentes necessários
async function hasRequiredComponents(componentes) {
    if (!componentes || componentes.length === 0) return true;
    
    const userId = auth.currentUser?.uid;
    if (!userId) return false;
    
    try {
        // Busca no Firestore em vez do DOM
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists() || !playerSnap.data().inventory) {
            return false;
        }
        
        const inventoryData = playerSnap.data().inventory;
        const inventoryItems = [];
        
        // Coleta todos os IDs dos itens no inventário
        if (inventoryData.itemsInChest && Array.isArray(inventoryData.itemsInChest)) {
            inventoryData.itemsInChest.forEach(item => {
                inventoryItems.push(item.id);
            });
        }
        
        return componentes.every(componente => inventoryItems.includes(componente));
    } catch (error) {
        console.error("Erro ao verificar componentes:", error);
        return false;
    }
}



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
// Torna as funções Firebase disponíveis globalmente
window.db = db;
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;
console.log("LOG: Funções Firebase disponibilizadas globalmente.");


function startNewTurnBlock(turnName) {
    const battleLogContent = document.getElementById("battle-log-content");
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

async function endMonsterTurn() {
    console.log("LOG: Finalizando turno do monstro e iniciando turno do jogador.");
    if (isPlayerTurn) {
        console.error("LOG: endMonsterTurn chamado fora do turno do monstro. Abortando.");
        return;
    }
    
window.damageTracker.endTurn();


    if (playerHealth <= 0 && playerHealth > -10) {
        console.log("LOG: Jogador inconsciente, o monstro continua atacando.");
        startNewTurnBlock("Estado");
        addLogMessage(`<p style="color: red; font-weight: bold;">Você está inconsciente e indefeso!</p>`, 1000);
        addLogMessage(`O ${currentMonster.nome} continua atacando seu corpo inerte...`, 1000);
        setTimeout(() => {
            monsterAttack();
        }, 2000);
        return;
    }

    isPlayerTurn = true;
    window.isPlayerTurn = true;

    // Verifica se tem buff de velocidade para dupla ação
    const velocidadeBuff = activeBuffs.find(buff => buff.tipo === "velocidade");
    if (velocidadeBuff && !window.velocidadeUsada) {
        window.velocidadeUsada = false; // Reset para o turno
    }

    startNewTurnBlock("Jogador");
    const turnConsumedBySpell = await processBuffs();

    if (turnConsumedBySpell) {
        endPlayerTurn(); // O turno foi consumido pela magia, então encerramos aqui.
        return;
    }

    // Se o turno anterior foi consumido por magia, pula habilitação de UI
if (window.skipNextPlayerTurnUI) {
    console.log("LOG: Turno consumido por efeito especial. UI não habilitada.");
    window.skipNextPlayerTurnUI = false; // reseta a flag
    
    // No PRÓXIMO turno do jogador, reabilita os botões
    setTimeout(() => {
        if (isPlayerTurn && attackOptionsDiv) {
            attackOptionsDiv.style.display = 'block';
            const buttons = document.querySelectorAll('#attack-options button');
            buttons.forEach(button => {
                button.disabled = false;
                button.style.opacity = '1'; // ← ADICIONE ESTA LINHA
                if (button.id === 'atacar-corpo-a-corpo' || button.id === 'ato-classe' || button.id === 'itens-ferramentas' || button.id === 'atacar-a-distancia' || button.id === 'correr-batalha') {
                    button.style.display = 'inline-block';
                }
            });
        }
    }, 100);
} else {
    // Se o turno não foi consumido, o fluxo normal continua.
    if (attackOptionsDiv) {
        attackOptionsDiv.style.display = 'block';
        const buttons = document.querySelectorAll('#attack-options button');
        buttons.forEach(button => {
            button.disabled = false;
            if (button.id === 'atacar-corpo-a-corpo' || button.id === 'ato-classe' || button.id === 'itens-ferramentas' || button.id === 'atacar-a-distancia' || button.id === 'correr-batalha') {
                button.style.display = 'inline-block';
            }
        });
        const correrButton = document.getElementById("correr-batalha");
        if (correrButton) {
            correrButton.onclick = attemptEscape;
        }
    }
}


    addLogMessage(`Turno do Jogador`, 1000);
    await verificarFugaAnimais();
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

// Função para selecionar alvos em área
function selectAreaTargets(radius) {
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length <= radius) {
        return monstersAlive;
    }
    
    const targets = [window.currentMonster];
    const otherMonsters = monstersAlive.filter(m => m.id !== window.currentMonster.id);
    
    for (let i = 0; i < Math.min(radius - 1, otherMonsters.length); i++) {
        const randomIndex = Math.floor(Math.random() * otherMonsters.length);
        targets.push(otherMonsters.splice(randomIndex, 1)[0]);
    }
    
    return targets;
}

// Função para distribuir dano em área
function distributeAreaDamage(totalDamage, targets) {
    if (targets.length === 0) return [];

    // Se houver apenas um alvo, ele recebe o dano total.
    if (targets.length === 1) {
        return [{ monster: targets[0], damage: totalDamage }];
    }
    
    const primaryDamage = Math.floor(totalDamage * 0.6);
    const remainingDamage = totalDamage - primaryDamage;
    const secondaryDamage = targets.length > 1 ? Math.floor(remainingDamage / (targets.length - 1)) : 0;
    
    return targets.map((target, index) => ({
        monster: target,
        damage: index === 0 ? primaryDamage : secondaryDamage
    }));
}


// Função para usar um item - versão modificada
async function usarItem(itemId, effect, value) {
    const userId = auth.currentUser.uid;
    try {
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        if (!playerSnap.exists()) {
            console.error("Dados do jogador não encontrados");
            return;
        }

        const playerData = playerSnap.data();
        const inventoryData = playerData.inventory;
        let itemIndex = -1;
        let item = null;

        if (inventoryData.itemsInChest && Array.isArray(inventoryData.itemsInChest)) {
            itemIndex = inventoryData.itemsInChest.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                item = inventoryData.itemsInChest[itemIndex];
            }
        }

        if (!item) {
            console.error("Item não encontrado no inventário: ", itemId);
            return;
        }

        document.getElementById("itens-modal").style.display = "none";
        startNewTurnBlock("Item");

        let monsterDefeated = false;
        let shouldEndTurn = true;

        // --- LÓGICA DE DANO E EFEITOS ---
        if (itemId === "granada-mao" || itemId === "granada-de-concussao" || itemId === "granada-incendiaria") {
            // Busca as propriedades do template original
            const allItemsArr = [...initialItems, ...extraItems];
            const itemTemplate = allItemsArr.find(template => template.id === itemId);
            
            if (!itemTemplate || !itemTemplate.damage) {
                console.error("Template do item não encontrado ou sem propriedade damage:", itemId);
                await addLogMessage(`Erro: Item ${itemId} não configurado corretamente.`, 1000);
                endPlayerTurn();
                return;
            }
            
            const totalDamage = rollDice(itemTemplate.damage);
            
            if (itemTemplate.areaEffect && itemTemplate.areaRadius) {
                const targets = selectAreaTargets(itemTemplate.areaRadius);
                const damageDistribution = distributeAreaDamage(totalDamage, targets);
                
                await addLogMessage(`Você arremessa uma ${item.content}! Ela explode atingindo ${targets.length} alvo(s)!`, 1000);
                
                for (const {monster, damage} of damageDistribution) {
                    monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - damage);
                    await addLogMessage(`${monster.nome} sofre <b>${damage}</b> de dano da explosão.`, 800);
                    
                    if (itemId === "granada-incendiaria") {
                        if (!monster.activeMonsterDebuffs) monster.activeMonsterDebuffs = [];
                        monster.activeMonsterDebuffs = monster.activeMonsterDebuffs.filter(d => d.tipo !== "burn");
                        monster.activeMonsterDebuffs.push({ tipo: "burn", valor: 3, turnos: 3, nome: "Queimadura" });
                        await addLogMessage(`${monster.nome} está em chamas! Sofrerá 3 de dano por 3 turnos.`, 800);
                    }
                    
                    if (itemId === "granada-de-concussao" && monster.pontosDeEnergiaMax < 50) {
                        if (!monster.activeMonsterDebuffs) monster.activeMonsterDebuffs = [];
                        monster.activeMonsterDebuffs = monster.activeMonsterDebuffs.filter(d => d.tipo !== "stun");
                        monster.activeMonsterDebuffs.push({ tipo: "stun", valor: 1, turnos: 1, nome: item.content });
                        await addLogMessage(`${monster.nome} foi atordoado pela explosão!`, 800);
                    }
                    
                    if (monster.pontosDeEnergia <= 0) monsterDefeated = true;
                }
            } else {
                // Fallback para lógica antiga
                if (currentMonster) {
                    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia - totalDamage);
                    await addLogMessage(`Você arremessa uma ${item.content}! Ela explode e causa <b>${totalDamage}</b> de dano ao ${currentMonster.nome}.`, 1000);

                    if (itemId === "granada-incendiaria") {
                        if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
                        currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(d => d.tipo !== "burn");
                        currentMonster.activeMonsterDebuffs.push({ tipo: "burn", valor: 3, turnos: 3, nome: "Queimadura" });
                        await addLogMessage(`${currentMonster.nome} está em chamas! Sofrerá 3 de dano por 3 turnos.`, 800);
                    }

                    if (itemId === "granada-de-concussao" && currentMonster.pontosDeEnergiaMax < 50) {
                        if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
                        currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(d => d.tipo !== "stun");
                        currentMonster.activeMonsterDebuffs.push({ tipo: "stun", valor: 1, turnos: 1, nome: item.content });
                        await addLogMessage(`${currentMonster.nome} foi atordoado pela explosão!`, 800);
                    }
                    if (currentMonster.pontosDeEnergia <= 0) monsterDefeated = true;
                }
            }
        } else if (effect === "heal" && value > 0) {
            const energyTotal = playerData.energy?.total || 0;
            const energyInitial = playerData.energy?.initial || 0;
            const newEnergy = Math.min(energyTotal + parseInt(value), energyInitial);
            playerData.energy.total = newEnergy;
            playerHealth = newEnergy;
            atualizarBarraHP("barra-hp-jogador", newEnergy, energyInitial);
            await addLogMessage(`Você usou ${item.content} e recuperou ${value} pontos de energia.`, 1000);
        } else if (effect === "damage" && value > 0) {
            if (currentMonster) {
                currentMonster.pontosDeEnergia -= parseInt(value);
                currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
                await addLogMessage(`Você usou ${item.content} e causou ${value} de dano.`, 1000);
                if (currentMonster.pontosDeEnergia <= 0) monsterDefeated = true;
            }
        } else {
            await addLogMessage(`Você usou ${item.content}.`, 1000);
        }

        // --- CONSUMIR ITEM ---
        item.quantity--;
        if (item.quantity <= 0) {
            if (item.uuid) {
                if (!inventoryData.discardedItems) inventoryData.discardedItems = [];
                inventoryData.discardedItems.push(item.uuid);
            }
            inventoryData.itemsInChest.splice(itemIndex, 1);
        }
        
        // Atualiza a UI de todos os monstros
        displayAllMonsterHealthBars();

        // --- SALVAR ESTADO ---
        await setDoc(playerRef, {
            inventory: inventoryData,
            ...(effect === "heal" && { energy: playerData.energy })
        }, { merge: true });
        await saveBattleState(userId, battleId, playerHealth);

        // --- VERIFICAÇÃO DE FIM DE BATALHA (LÓGICA UNIFICADA E CORRIGIDA) ---
        if (monsterDefeated) {
            await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
            const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);

            if (monstersAlive.length === 0) {
                console.log("LOG: Todos os monstros foram derrotados!");
                handlePostBattle(currentMonster);
                shouldEndTurn = false; // A batalha acabou, não passa o turno.
            } else {
                window.currentMonster = monstersAlive[0];
                currentMonster = window.currentMonster;
                await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
                updateMonsterInfoUI();
                displayAllMonsterHealthBars();
            }
        }
        
        // --- FINALIZA O TURNO ---
        if (shouldEndTurn) {
            endPlayerTurn();
        }

    } catch (error) {
        console.error("Erro ao usar item:", error);
        document.getElementById("itens-modal").style.display = "none";
    }
}

async function carregarMagiasDisponiveis() {
    // CARREGAR DADOS ATUALIZADOS DO FIRESTORE
    await window.arcanumIudicium.carregarFirestore();
    const magiasContainer = document.getElementById("magias-container");
    magiasContainer.innerHTML = "";
    
    // Filtrar apenas magias memorizadas
   const magiasMemorizadas = magiasDisponiveis.filter(magia => 
    window.arcanumIudicium.isMagiaMemorizada(magia.id)
);
    
    if (magiasMemorizadas.length === 0) {
        magiasContainer.innerHTML = "<p>Você não possui magias memorizadas.</p>";
        return;
    }
    
    for (const magia of magiasMemorizadas) {
        const magiaElement = document.createElement("div");
        magiaElement.className = "item-consumivel";
        magiaElement.dataset.magiaId = magia.id;
        magiaElement.dataset.efeito = magia.efeito;
        magiaElement.dataset.valor = magia.valor;
        
        // Calcular custo com desconto
        const temDesconto = window.arcanumIudicium.magiaComDesconto === magia.nome;
        const custoFinal = temDesconto ? Math.max(1, magia.custo - 1) : magia.custo;
        const textoDesconto = temDesconto ? ` <span style="color: #00ff00;">-1</span>` : '';
        
        magiaElement.dataset.custo = custoFinal; // Usar custo final
        
        // Verifica se tem magia suficiente E componentes necessários
        const temMagiaSuficiente = playerMagic >= custoFinal; // Usar custo final
        const temComponentes = await hasRequiredComponents(magia.componentes);
        const podeUsar = temMagiaSuficiente && temComponentes;
        
        if (!podeUsar) {
            magiaElement.classList.add("disabled");
            magiaElement.style.opacity = "0.5";
        }
        
        // Adiciona informação sobre componentes na descrição
        let componentesTexto = "";
        if (magia.componentes && magia.componentes.length > 0) {
            const componentesStatus = [];
            for (const comp of magia.componentes) {
                const possui = await hasRequiredComponents([comp]);
                componentesStatus.push(`${comp} ${possui ? '✓' : '✗'}`);
            }
            componentesTexto = `<br><small>Componentes: ${componentesStatus.join(', ')}</small>`;
        }
        
        magiaElement.innerHTML = `
            <div class="item-nome">${magia.nome}</div>
            <div class="item-quantidade">Custo: ${custoFinal}${textoDesconto} PM</div>
            <div class="item-descricao">${magia.descricao}${componentesTexto}</div>
        `;
        
        if (podeUsar) {
            magiaElement.addEventListener("click", () => selecionarMagia(magiaElement));
        }
        magiasContainer.appendChild(magiaElement);
    }
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

function resetArcanumBattle() {
    resetDynamicConditions();
    window.arcanumUsageCount = 0;
    relampagoRiskCounter = 1; // ← ADICIONAR ESTA LINHA
}


async function usarMagia(magiaId, efeito, valor, custo) {
    // Encontra a magia
    const magia = magiasDisponiveis.find(m => m.id === magiaId);
    if (!magia) return;
    
    // Verifica componentes necessários
    if (!hasRequiredComponents(magia.componentes)) {
        await addLogMessage(`Você não possui os componentes necessários para esta magia!`, 1000);
        document.getElementById("magias-modal").style.display = "none";
        return;
    }

    // --- INÍCIO INTEGRAÇÃO ARCANUM ---
if (magiaId === 'missil-magico' || magiaId === 'toque-chocante' || magiaId === 'flecha-acida-melf' || magiaId === 'relampago' || magiaId === 'toque-vampirico' || magiaId === 'animar-mortos' || magiaId === 'cone-glacial') {
    document.getElementById("magias-modal").style.display = "none";
    setupArcanumConjurationModal(magiaId);
    return;
}
// --- FIM INTEGRAÇÃO ARCANUM ---


    const userId = auth.currentUser.uid;
    
    // RECALCULAR CUSTO COM DESCONTO
    const temDesconto = window.arcanumIudicium.magiaComDesconto === magia.nome;
    const custoFinal = temDesconto ? Math.max(1, magia.custo - 1) : magia.custo;
    
    // Verifica se tem magia suficiente (usar custo final)
    if (playerMagic < custoFinal) {
        await addLogMessage(`Você não tem magia suficiente! (${playerMagic}/${custoFinal})`, 1000);
        return;
    }

    // Fechar modal
    document.getElementById("magias-modal").style.display = "none";
    
    // Reduz magia (usar custo final)
    playerMagic -= custoFinal;
    atualizarBarraMagia(playerMagic, playerMaxMagic);
    
    // Criar bloco de turno
    startNewTurnBlock("Magia");
    await addLogMessage(`Você lança ${magia.nome}!`, 800);
    
    // Magias de escudo não fazem teste de resistência
    if (efeito === "shield") {
        // Aplica buff de escudo
        const buffValue = parseInt(valor);
        const buffDuration = 3;
        
        // Remove buff anterior da mesma magia se existir
        activeBuffs = activeBuffs.filter(buff => buff.nome !== magia.nome);

        
        // Adiciona novo buff
        activeBuffs.push({
            tipo: "couraca",
            valor: buffValue,
            turnos: buffDuration,
            nome: magia.nome
        });

        updateBuffsDisplay();
        
        await addLogMessage(`${magia.nome} ativo! Sua couraça aumentou em +${buffValue} por ${buffDuration} turnos.`, 800);
        window.arcanumIudicium.sucesso(); // ADICIONAR AQUI
        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
        return;
    }

    if (efeito === "heal") {
        const healAmount = rollDice(valor); // ROLA OS DADOS
        const newEnergy = Math.min(playerHealth + healAmount, playerMaxHealth);
        playerHealth = newEnergy;
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`Você recuperou ${healAmount} pontos de energia (${valor}).`, 800);
        window.arcanumIudicium.sucesso(); // ADICIONAR AQUI

        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
        return;
    }

    // Teste de resistência do monstro (apenas para magias que não são touch_attack ou touch_debuff)
if (efeito !== "touch_attack" && efeito !== "touch_debuff" && efeito !== "area_damage" && efeito !== "flight" && efeito !== "velocidade" && efeito !== "fire_shield" && efeito !== "phantom_assassin" && efeito !== "pele_rochosa" && efeito !== "bigby_hand") {
        const resistanceRoll = Math.floor(Math.random() * 20) + 1;
        const resistanceTotal = resistanceRoll + currentMonster.habilidade;
        const difficulty = 20;

        await addLogMessage(`${currentMonster.nome} tenta resistir: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 1000);

        if (resistanceTotal >= difficulty) {
            await addLogMessage(`${currentMonster.nome} resistiu à magia!`, 1000);
            window.arcanumIudicium.falha(); // ADICIONAR AQUI
            // Salva estado e passa turno
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, battleId, playerHealth);
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
            window.arcanumIudicium.sucesso(); // ADICIONAR AQUI
            rolarDanoButton.disabled = false;
        }
        
    } else if (efeito === "dazzle") {
        // Aplica debuff de ofuscamento
        const debuffValue = parseInt(valor);
        const debuffDuration = 3;
        
       // Garante que o array de debuffs do monstro alvo exista
    if (!currentMonster.activeMonsterDebuffs) {
        currentMonster.activeMonsterDebuffs = [];
    }

    // Remove debuff anterior do mesmo tipo DO MONSTRO ALVO
    currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.tipo !== "accuracy");

    // Adiciona novo debuff AO MONSTRO ALVO
    currentMonster.activeMonsterDebuffs.push({
            tipo: "accuracy",
            valor: debuffValue,
            turnos: debuffDuration,
            nome: magia.nome
        });
        
        // Atualiza a UI de TODOS os monstros
    displayAllMonsterHealthBars();
        
        await addLogMessage(`${currentMonster.nome} está ofuscado! Sua precisão diminuiu em -${debuffValue} por ${debuffDuration} turnos.`, 800);
        window.arcanumIudicium.sucesso(); // ADICIONAR AQUI

        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
        
        
    } else if (efeito === "stun") {
        // Verifica se o monstro tem energia menor que 50
        if (currentMonster.pontosDeEnergiaMax >= 50) {
            await addLogMessage(`${magia.nome} não funciona em monstros com muita energia!`, 1000);
            // Salva estado e passa turno
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, battleId, playerHealth);
            endPlayerTurn();
            return;
        }

        // Garante que o array de debuffs do monstro alvo exista
    if (!currentMonster.activeMonsterDebuffs) {
        currentMonster.activeMonsterDebuffs = [];
    }
        
        // Adiciona debuff de atordoamento
        currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.tipo !== "stun");
        currentMonster.activeMonsterDebuffs.push({ // <--- CORRETO
            tipo: "stun",
            valor: 1,
            turnos: 1,
            nome: magia.nome
        });
        
        displayAllMonsterHealthBars();
        await addLogMessage(`${currentMonster.nome} está pasmado! Perderá o próximo turno.`, 800);
        
        // Salva estado e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();

    } else if (efeito === "sleep") {
        // Verifica se o monstro tem energia menor que 50
        if (currentMonster.pontosDeEnergiaMax >= 50) {
            await addLogMessage(`${magia.nome} não funciona em monstros com muita energia!`, 1000);
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, battleId, playerHealth);
            endPlayerTurn();
            return;
        }

        // Garante que o array de debuffs do monstro alvo exista
    if (!currentMonster.activeMonsterDebuffs) {
        currentMonster.activeMonsterDebuffs = [];
    }

    // Remove debuff anterior do mesmo tipo DO MONSTRO ALVO
    currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.tipo !== "sleep");
        currentMonster.activeMonsterDebuffs.push({ // <--- CORRETO
            tipo: "sleep",
            valor: 1,
            turnos: 1,
            nome: magia.nome
        });
        
        // Adiciona buff crítico no jogador
        activeBuffs = activeBuffs.filter(buff => buff.tipo !== "critical_guaranteed");
        activeBuffs.push({
            tipo: "critical_guaranteed",
            valor: 1,
            turnos: 2,  // <-- MUDE PARA 2
            nome: "Sono - Crítico Garantido"
        });

        
        displayAllMonsterHealthBars();
        updateBuffsDisplay();
        await addLogMessage(`${currentMonster.nome} está dormindo! Perderá o próximo turno e seu próximo ataque corpo a corpo será crítico!`, 800);
        
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();

    } else if (efeito === "fear") {
        // Verifica se o monstro tem energia menor que 40
        if (currentMonster.pontosDeEnergiaMax > 40) {
            await addLogMessage(`${magia.nome} não funciona em monstros poderosos!`, 1000);
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, battleId, playerHealth);
            endPlayerTurn();
            return;
        }
        
        // Se chegou aqui, o monstro falhou no teste geral de resistência
        await addLogMessage(`${currentMonster.nome} foge aterrorizado da batalha!`, 1000);
        
        // Limpa estado da batalha
        const user = auth.currentUser;
        if (user) {
            await clearBattleState(user.uid, battleId);
        }
        
        // Esconde opções de ataque
        if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
        
        // Mostra botão para voltar ao mapa
        const backButton = document.getElementById('back-to-map-button');
        if (backButton) {
            backButton.style.display = 'block';
        }
        
        return; // Não passa turno, batalha acabou

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
    await saveBattleState(userId, battleId, playerHealth);
    
    // MANTÉM O TURNO DO JOGADOR - não chama endPlayerTurn()
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
        await saveBattleState(userId, battleId, playerHealth);
        
        // Não passa o turno, aguarda rolagem de ataque
        return;

        
                } else if (efeito === "area_damage") {
        const targets = selectAreaTargets(magia.areaRadius || 3);
        const totalDamage = rollDice(valor);
        const damageDistribution = distributeAreaDamage(totalDamage, targets);
        
        let monsterDefeated = false;
        
        await addLogMessage(`${magia.nome} explode atingindo ${targets.length} alvo(s)!`, 800);
        
        for (const {monster, damage} of damageDistribution) {
            if (magia.allowsResistance !== false) {
                const resistanceRoll = Math.floor(Math.random() * 20) + 1;
                const resistanceTotal = resistanceRoll + monster.habilidade;
                const difficulty = 20;
                
                await addLogMessage(`${monster.nome} tenta resistir: ${resistanceRoll} + ${monster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 800);
                
                if (resistanceTotal >= difficulty) {
                    const reducedDamage = Math.floor(damage / 2);
                    monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - reducedDamage);
                    await addLogMessage(`${monster.nome} resiste parcialmente: sofre ${reducedDamage} de dano.`, 800);
                } else {
                    monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - damage);
                    await addLogMessage(`${monster.nome} sofre ${damage} de dano flamejante.`, 800);
                }
            } else {
                monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - damage);
                await addLogMessage(`${monster.nome} sofre ${damage} de dano.`, 800);
            }
            
            if (monster.pontosDeEnergia <= 0) monsterDefeated = true;
        }
        
        displayAllMonsterHealthBars();
        window.arcanumIudicium.sucesso();
        
        if (monsterDefeated) {
            const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
            if (monstersAlive.length === 0) {
                handlePostBattle(currentMonster);
                return;
            } else {
                window.currentMonster = monstersAlive[0];
                currentMonster = window.currentMonster;
                updateMonsterInfoUI();
                displayAllMonsterHealthBars();
            }
        }
        
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
        return;
    }

    // --- ADICIONE O CÓDIGO ABAIXO ---
    else if (efeito === "flight") {
        // Verifica se já tem Voo ativo
        const vooExistente = activeBuffs.find(buff => buff.tipo === "voo");
        if (vooExistente) {
            await addLogMessage(`Voo já está ativo! Não é possível lançar novamente.`, 1000);
        } else {
            const duracao = rollDice("1d10");
            
            // Aplica buff no jogador
            activeBuffs.push({
                tipo: "voo",
                valor: parseInt(valor),
                turnos: duracao,
                nome: magia.nome
            });
            
            // Aplica debuff em TODOS os monstros
            window.currentMonsters.forEach(monster => {
                if (!monster.activeMonsterDebuffs) monster.activeMonsterDebuffs = [];
                monster.activeMonsterDebuffs = monster.activeMonsterDebuffs.filter(debuff => debuff.nome !== "Voo");
                monster.activeMonsterDebuffs.push({
                    tipo: "accuracy",
                    valor: parseInt(valor),
                    turnos: duracao,
                    nome: "Voo"
                });
            });
            
            updateBuffsDisplay();
            displayAllMonsterHealthBars();
            await addLogMessage(`Você alça voo! +${valor} ataque por ${duracao} turnos. Todos inimigos sofrem -${valor} ataque.`, 800);
        }
        
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
    }
    // --- FIM DO CÓDIGO A SER ADICIONADO ---
    
    // --- VELOCIDADE ---
    else if (efeito === "velocidade") {
    const duracao = 3 + rollDice("1d20");
    
    // Remove buff anterior se existir
    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "velocidade");
    
    // Adiciona buff de velocidade
    activeBuffs.push({
        tipo: "velocidade",
        valor: parseInt(valor),
        turnos: duracao,
        nome: magia.nome,
        acoesPorTurno: 2
    });
    
    updateBuffsDisplay();
    await addLogMessage(`Velocidade ativada! +${valor} couraça e 2 ações por turno por ${duracao} turnos.`, 800);
    
    // ADICIONAR ESTE BLOCO:
    // Envelhece o jogador em 1 ano
    const playerRef = doc(db, "players", userId);
    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists()) {
        const currentAge = playerSnap.data().idade || 0;
        const newAge = currentAge + 1;
        await setDoc(playerRef, { idade: newAge }, { merge: true });
        await addLogMessage(`Você envelheceu 1 ano de vida, agora tem ${newAge} anos.`, 800);
    }
    
    window.arcanumIudicium.sucesso();
    
    await updatePlayerMagicInFirestore(userId, playerMagic);
    await saveBattleState(userId, battleId, playerHealth);
    endPlayerTurn();
}
    // --- FIM VELOCIDADE ---

    else if (efeito === "fire_shield") {
    const duracao = 2 + rollDice("1d20");
    
    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "fire_shield");
    
    activeBuffs.push({
        tipo: "fire_shield",
        valor: parseInt(valor),
        turnos: duracao,
        nome: magia.nome,
        couracaBonus: parseInt(valor)
    });
    
    updateBuffsDisplay();
    await addLogMessage(`Escudo do Fogo ativado! +${valor} couraça e reflexão de dano por ${duracao} turnos.`, 800);
    
    window.arcanumIudicium.sucesso();
    
    await updatePlayerMagicInFirestore(userId, playerMagic);
    await saveBattleState(userId, battleId, playerHealth);
    endPlayerTurn();
}
    else if (efeito === "phantom_assassin") {
    // Teste de resistência do monstro
    const resistanceRoll = Math.floor(Math.random() * 20) + 1;
    const resistanceTotal = resistanceRoll + currentMonster.habilidade;
    const difficulty = 20;
    
    await addLogMessage(`${currentMonster.nome} tenta resistir ao Assassino Fantasmagórico: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 1000);
    
    if (resistanceTotal >= difficulty) {
        await addLogMessage(`${currentMonster.nome} resistiu! O assassino se volta contra você!`, 1000);
        
        // Mago faz teste de resistência
        const playerResistanceRoll = Math.floor(Math.random() * 20) + 1;
        const playerHabilidade = playerData?.skill?.total || 0;
        const playerResistanceTotal = playerResistanceRoll + playerHabilidade;
        
        await addLogMessage(`Você tenta resistir: ${playerResistanceRoll} + ${playerHabilidade} = ${playerResistanceTotal} vs ${difficulty}`, 1000);
        
        if (playerResistanceTotal >= difficulty) {
            await addLogMessage(`Você resistiu! O assassino se dissipa.`, 800);
        } else {
            await addLogMessage(`Você falhou! O assassino agora persegue você!`, 1000);
            const duracao = 1 + rollDice("1d20");
            
            activeBuffs.push({
                tipo: "phantom_assassin",
                valor: 1,
                turnos: duracao,
                nome: "Assassino Fantasmagórico",
                target: "player"
            });
            updateBuffsDisplay();
        }
    } else {
        await addLogMessage(`${currentMonster.nome} falhou! O assassino o perseguirá!`, 800);
        const duracao = 1 + rollDice("1d20");
        
        if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
        currentMonster.activeMonsterDebuffs.push({
            tipo: "phantom_assassin",
            valor: 1,
            turnos: duracao,
            nome: "Assassino Fantasmagórico"
        });
        displayAllMonsterHealthBars();
    }
    
    window.arcanumIudicium.sucesso();
    await updatePlayerMagicInFirestore(userId, playerMagic);
    await saveBattleState(userId, battleId, playerHealth);
    endPlayerTurn();
}
        
        else if (efeito === "bigby_hand") {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#333;padding:20px;border-radius:10px;z-index:1000;color:white;';
    modal.innerHTML = `<h3>Escolha o oponente:</h3><div id="monster-selection"></div>`;
    
    const selection = modal.querySelector('#monster-selection');
    window.currentMonsters.filter(m => m.pontosDeEnergia > 0).forEach(monster => {
        const btn = document.createElement('button');
        btn.textContent = monster.nome;
        btn.style.cssText = 'display:block;margin:5px 0;padding:10px;width:100%;';
        btn.onclick = async () => {
            modal.remove();
            const duracao = 1 + rollDice("1d20");
            const playerTotalEnergy = window.playerData?.energy?.initial || playerMaxHealth;
            
            window.bigbyHandShields[monster.id] = {
                shield: playerTotalEnergy,
                couraca: 20,
                turnos: duracao
            };
            
            await addLogMessage(`Mão de Bigby ativa! Couraça 20 e escudo ${playerTotalEnergy} vs ${monster.nome} por ${duracao} turnos.`, 1000);
            updateBuffsDisplay();
            
            await updatePlayerMagicInFirestore(userId, playerMagic);
            await saveBattleState(userId, battleId, playerHealth);
            endPlayerTurn();
        };
        selection.appendChild(btn);
    });
    
    document.body.appendChild(modal);
    return;
}

        
   else if (efeito === "pele_rochosa") {
    const duracao = rollDice("1d4") + rollDice("1d10");
    
    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "pele_rochosa");
    
    activeBuffs.push({
        tipo: "pele_rochosa",
        valor: 1,
        turnos: duracao,
        nome: magia.nome,
        permanent: true // Flag para não ser processado em processBuffs()
    });
    
    updateBuffsDisplay();
    await addLogMessage(`Pele Rochosa ativada! Imunidade total a ataques físicos por ${duracao} ataques.`, 800);
    
    window.arcanumIudicium.sucesso();
    
    await updatePlayerMagicInFirestore(userId, playerMagic);
    await saveBattleState(userId, battleId, playerHealth);
    endPlayerTurn();
}
}

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

    const isMonstro = idElemento === "barra-hp-monstro";
    const isPlayer = idElemento === "barra-hp-jogador";

    let porcentagem;
    if (valorAtual > 0) {
        porcentagem = (valorAtual / valorMaximo) * 100;
        // Para jogador, permite exceder 100% (vampirismo)
        if (isPlayer && porcentagem > 100) {
            porcentagem = Math.min(200, porcentagem); // Máximo 200% na barra
        }
    } else {
        porcentagem = Math.max(0, ((valorAtual + 10) / 10) * 30);
    }
    
    barra.style.width = `${Math.min(100, porcentagem)}%`; // Barra nunca passa de 100% visualmente
    
    // Define cor da barra
    if (valorAtual <= 0) {
        if (isMonstro) {
            barra.style.backgroundColor = '#000000';
        } else {
            if (valorAtual <= -10) {
                barra.style.backgroundColor = '#000000';
            } else {
                barra.style.backgroundColor = '#8B0000';
            }
        }
    } else if (isPlayer && valorAtual > valorMaximo) {
        barra.style.backgroundColor = '#00FF00'; // Verde brilhante para vampirismo
    } else if (valorAtual <= valorMaximo * 0.3) {
        barra.style.backgroundColor = '#FF0000';
    } else {
        barra.style.backgroundColor = '#008000';
    }
    
    // Atualiza texto
    if (valorSpan) {
        if (valorAtual <= 0) {
            if (isMonstro) {
                valorSpan.innerHTML = `<span style="color: darkred">MORTO (${valorAtual}/${valorMaximo})</span>`;
            } else {
                if (valorAtual <= -10) {
                    valorSpan.innerHTML = `<span style="color: darkred">MORTO (${valorAtual}/${valorMaximo})</span>`;
                } else {
                    valorSpan.innerHTML = `<span style="color: red">INCONSCIENTE (${valorAtual}/${valorMaximo})</span>`;
                }
            }
        } else if (isPlayer && valorAtual > valorMaximo) {
            valorSpan.innerHTML = `<span style="color: lime">${valorAtual}/${valorMaximo}</span>`;
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


function rollDice(diceString) {
    console.log("LOG: rollDice chamado com:", diceString);
    
    // Remove espaços para evitar erro no split e parse
    diceString = diceString.replace(/\s+/g, '');

    let modifier = 0;
    let cleanDiceString = diceString;
    
    if (diceString.includes('+')) {
        const parts = diceString.split('+');
        cleanDiceString = parts[0];
        modifier = parseInt(parts[1]) || 0;
    } else if (diceString.includes('-')) {
        const parts = diceString.split('-');
        cleanDiceString = parts[0];
        modifier = -(parseInt(parts[1]) || 0);
    }
    
    const parts = cleanDiceString.toUpperCase().split('D');
    if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        const result = parseInt(parts[0]) + modifier;
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
        totalRoll += modifier;
        console.log("LOG: rollDice (rolagem) retornando:", totalRoll);
        return totalRoll;
    } else {
        console.error("LOG: rollDice - Formato de dado inválido:", diceString);
        return 0;
    }
}

function registerDeadBody(monster) {
    console.log("DEBUG: registerDeadBody chamada para:", monster.nome, monster.id, "HP atual:", monster.pontosDeEnergia);
    if (!window.deadBodies.find(body => body.id === monster.id)) {
        window.deadBodies.push({
            id: monster.id,
            nome: monster.nome,
            pontosDeEnergiaMax: monster.pontosDeEnergiaMax,
            dano: monster.dano,
            habilidade: monster.habilidade,
            couraça: monster.couraça || 0
        });
        console.log("DEBUG: Corpo registrado! Total:", window.deadBodies.length);
    }
}

function animateUndead(necromancyLevel, undeadType) {
    console.log("DEBUG: Corpos disponíveis:", window.deadBodies);
    console.log("DEBUG: Já animados:", window.animatedUndead);

    const availableBodies = window.deadBodies.filter(body => 
        !window.animatedUndead.find(undead => undead.originalId === body.id)
    );

    if (availableBodies.length === 0) {
        console.log("DEBUG: Nenhum corpo disponível!");
        return { success: false, message: "Não há corpos disponíveis!" };
    }

    const animated = [];
    let remainingLevels = necromancyLevel;

    for (const body of availableBodies) {
        if (remainingLevels <= 0) break;

        const hitDice = Math.ceil(body.pontosDeEnergiaMax / 8);
        const requiredLevels = undeadType === 'zombie' ? hitDice + 1 : hitDice;

        if (remainingLevels >= requiredLevels) {
            const hp = (undeadType === 'zombie' ? hitDice + 1 : hitDice) * 8;
            const undead = {
                id: `${undeadType}_${body.id}_${Date.now()}`,
                originalId: body.id,
                nome: undeadType === 'skeleton' ? 'Esqueleto' : 'Zumbi',
                pontosDeEnergia: hp,
                pontosDeEnergiaMax: hp,
                dano: body.dano,
                habilidade: body.habilidade,
                couraça: Math.max(0, (body.couraça || 0) - 2),
                isUndead: true,
                isAlly: true
            };
            animated.push(undead);
            remainingLevels -= requiredLevels;
        }
    }

    window.animatedUndead.push(...animated);

    // Remove corpos animados da lista de monstros ativos
animated.forEach(undead => {
    const originalIndex = window.currentMonsters.findIndex(m => m.id === undead.originalId);
    if (originalIndex !== -1) {
        window.currentMonsters.splice(originalIndex, 1);
    }
});

// Atualiza display das barras
displayAllMonsterHealthBars();

    console.log("DEBUG: Animados:", animated.length);
    return { success: true, animated, message: `${animated.length} morto(s)-vivo(s) animado(s)!` };
}

async function undeadAttack() {
    const aliveUndead = window.animatedUndead.filter(u => u.pontosDeEnergia > 0);
    const aliveEnemies = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    
    if (aliveUndead.length === 0 || aliveEnemies.length === 0) return;
    
    for (const undead of aliveUndead) {
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const attackRoll = Math.floor(Math.random() * 20) + 1 + undead.habilidade;
        
        await addLogMessage(`${undead.nome} ataca ${target.nome}: ${attackRoll} vs ${target.couraça || 0}`, 600);
        
        if (attackRoll >= (target.couraça || 0)) {
            const damage = rollDice(undead.dano);
            target.pontosDeEnergia -= damage;
            window.damageTracker.addDamage(undead.id, damage);
            target.pontosDeEnergia = Math.max(0, target.pontosDeEnergia);
            displayAllMonsterHealthBars();
            
            await addLogMessage(`${undead.nome} causa ${damage} de dano!`, 600);
            
            if (target.pontosDeEnergia <= 0) {
                registerDeadBody(target);
                const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
                if (monstersAlive.length === 0) {
                    handlePostBattle(target);
                    return;
                }
            }
        }
    }
}


// Função para calcular couraça total (base + buffs)
function getPlayerDefense() {
    // Verifica escudo de Bigby contra monstro atual
    const bigbyShield = window.bigbyHandShields[currentMonster?.id];
    if (bigbyShield && bigbyShield.turnos > 0) {
        return 20; // Couraça fixa
    }
    
    // Código original
    const currentPlayerData = window.playerData || playerData;
    const baseDefense = currentPlayerData?.couraca ? parseInt(currentPlayerData.couraca) : 0;
    let buffBonus = 0;
    activeBuffs.forEach(buff => {
        if (buff.tipo === "couraca" || buff.couracaBonus) buffBonus += buff.valor || buff.couracaBonus;
        if (buff.tipo === "anastia") buffBonus += buff.valor;
        if (buff.tipo === "velocidade") buffBonus += buff.valor;
        if (buff.tipo === "fire_shield") buffBonus += buff.valor;
    });
    return baseDefense + buffBonus;
}


// Adicione esta função após getPlayerDefense()
function updatePlayerCouracaDisplay() {
    const couracaSpan = document.getElementById('player-couraca-valor');
    if (couracaSpan) {
        const totalCouraca = getPlayerDefense();
        couracaSpan.textContent = totalCouraca;
    }
}

// Função para calcular couraça total do monstro (base - penalidades)
function getMonsterDefense() {
  const baseDefense = currentMonster.couraça || 0;
  const legsPenalty = activeMonsterDebuffs
    .filter(debuff => debuff.tipo === "amputation_legs")
    .reduce((total, debuff) => total + debuff.valor, 0);
  // NOVO: penalidade de debuff de couraça
  const couracaPenalty = activeMonsterDebuffs
    .filter(debuff => debuff.tipo === "couraca")
    .reduce((total, debuff) => total + debuff.valor, 0);
  return Math.max(0, baseDefense - legsPenalty - couracaPenalty);
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

    // Escudos de Bigby
for (const [monsterId, shield] of Object.entries(window.bigbyHandShields)) {
    const monster = window.currentMonsters.find(m => m.id === monsterId);
    const monsterName = monster ? monster.nome : "oponente";
    const buffElement = document.createElement('div');
    buffElement.className = 'buff-item';
    buffElement.innerHTML = `
        <span>Bigby vs ${monsterName}</span>
        <span class="buff-turns">${shield.turnos} (${shield.shield})</span>
    `;
    container.appendChild(buffElement);
}

    updatePlayerCouracaDisplay();
}

/**
* Limpa e popula o container de debuffs para um monstro específico.
*/
function renderMonsterDebuffs(monster) {
    const debuffsId = `monster-debuffs-${monster.id}`;
    const container = document.getElementById(debuffsId);
    if (!container) return;

    container.innerHTML = ''; // Limpa debuffs antigos

    // Garante que o array de debuffs exista
    if (!monster.activeMonsterDebuffs) {
        monster.activeMonsterDebuffs = [];
    }

    monster.activeMonsterDebuffs.forEach(debuff => {
        const debuffElement = document.createElement('div');
        debuffElement.className = 'debuff-item';
        let label = '';
        switch (debuff.tipo) {
            case 'bleeding':
            case 'poison':
            case 'burn':
                label = `(-${debuff.valor} HP/turno)`;
                break;
            case 'accuracy':
                label = `(-${debuff.valor} precisão)`;
                break;
            case 'couraca':
                label = `(-${debuff.valor} couraça)`;
                break;
            case 'amputation_arms':
                label = '(-70% dano)';
                break;
        }
        debuffElement.innerHTML = `
          <span>
            ${debuff.nome} ${label}
          </span>
          <span class="debuff-turns">
            ${debuff.turnos === 999 ? '∞' : debuff.turnos}
          </span>
        `;
        container.appendChild(debuffElement);
    });
}


// Função para processar buffs no início do turno do jogador
async function processBuffs() {
    // Processa preparação de Melf primeiro, pois pode consumir o turno.
    if (preparingSpells.length > 0) {
        const spell = preparingSpells[0];
        spell.turnosRestantes--;

        if (spell.turnosRestantes <= 0) {
            // Lança a magia
            await addLogMessage(`Flecha Ácida de Melf pronta e lançada!`, 800);

            // Teste de resistência
            const resistanceRoll = Math.floor(Math.random() * 20) + 1;
            const resistanceTotal = resistanceRoll + spell.alvo.habilidade;
            const difficulty = 20;
            await addLogMessage(`${spell.alvo.nome} tenta resistir: ${resistanceRoll} + ${spell.alvo.habilidade} = ${resistanceTotal} vs ${difficulty}`, 1000);

            if (resistanceTotal >= difficulty) {
                await addLogMessage(`${spell.alvo.nome} resistiu às flechas ácidas!`, 1000);
            } else {
                await addLogMessage(`A flecha ácida nível ${spell.nivel} atinge ${spell.alvo.nome}!`, 800);
                // Dano inicial
                const damage = rollDice("2d4");
                spell.alvo.pontosDeEnergia -= damage;
                spell.alvo.pontosDeEnergia = Math.max(0, spell.alvo.pontosDeEnergia);
                await addLogMessage(`${spell.alvo.nome} sofre ${damage} de dano ácido inicial!`, 800);
                // Adiciona DOT
                if (!spell.alvo.activeMonsterDebuffs) spell.alvo.activeMonsterDebuffs = [];
                spell.alvo.activeMonsterDebuffs.push({
                    tipo: "acid_dot",
                    valor: "2d4",
                    turnos: spell.nivel,
                    nome: "Flecha Ácida de Melf"
                });
                await addLogMessage(`${spell.alvo.nome} está sendo corroído pelo ácido! Sofrerá dano por ${spell.nivel} turnos.`, 800);
                displayAllMonsterHealthBars();
            }
            window.skipNextPlayerTurnUI = true; // Marca que o turno já foi consumido
            preparingSpells = []; // Limpa a magia da fila de preparação.
            return true; // SINALIZA QUE O TURNO FOI CONSUMIDO
        }
    }

    // Se a flecha não foi lançada, continua com os outros buffs.
    if (activeBuffs.length === 0) return false;

    // Reduz duração de todos os buffs
activeBuffs.forEach(buff => {
    if (!buff.permanent) buff.turnos--;
});

    // Ativa Anastia após o carregamento
    const anastiaLoading = activeBuffs.find(buff => buff.tipo === "anastia_loading" && buff.turnos <= 0);
    if (anastiaLoading) {
        activeBuffs = activeBuffs.filter(buff => buff.tipo !== "anastia_loading");
        activeBuffs.push({
            tipo: "anastia",
            valor: -10,
            turnos: 4,
            nome: "Anastia (Modo de Mira)",
            criticalThreshold: 15
        });
        updateBuffsDisplay();
        addLogMessage && addLogMessage("<span style='color:orange;'>Você entra em modo Anastia! Couraça -10, crítico SIFER em 15+ por 4 turnos.</span>", 1000);
    }

    // Remove buffs expirados e mostra mensagem
    const expiredBuffs = activeBuffs.filter(buff => buff.turnos <= 0);
    activeBuffs = activeBuffs.filter(buff => buff.turnos > 0);
    updateBuffsDisplay();

    await expiredBuffs.reduce(async (promise, buff) => {
        await promise;
        if (typeof addLogMessage === 'function') {
            await addLogMessage(`${buff.nome} se dissipou.`, 800);
        }
    }, Promise.resolve());
// Processa teste de fim do Voo
    const vooBuff = expiredBuffs.find(buff => buff.tipo === "voo");
    if (vooBuff) {
        // Remove debuff de todos os monstros
        window.currentMonsters.forEach(monster => {
            if (monster.activeMonsterDebuffs) {
                monster.activeMonsterDebuffs = monster.activeMonsterDebuffs.filter(debuff => debuff.nome !== "Voo");
            }
        });
        displayAllMonsterHealthBars();
        
        await addLogMessage("O efeito de Voo se dissipa! Faça um teste de habilidade (dificuldade 12) ou sofra 2d6 de dano.", 1000);
        
        // Cria botão de teste
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Rolar Teste de Habilidade';
        testBtn.classList.add('action-btn');
        currentTurnBlock.appendChild(testBtn);
        
        const testResult = await new Promise(resolve => {
            testBtn.addEventListener('click', () => {
                const roll = Math.floor(Math.random() * 20) + 1;
                resolve(roll);
            }, { once: true });
        });
        
        testBtn.remove();
        const habilidadeTotal = testResult + (playerData?.skill?.total || 0);
        
        await addLogMessage(`Você rolou ${testResult} + ${playerData?.skill?.total || 0} (Hab) = ${habilidadeTotal} vs 12`, 1000);
        
        if (habilidadeTotal >= 12) {
            await addLogMessage("Você consegue pousar com segurança!", 800);
        } else {
            const damage = rollDice("2d6");
            playerHealth -= damage;
            atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
            await addLogMessage(`Você cai desajeitadamente e sofre ${damage} de dano!`, 1000);
            
            const user = auth.currentUser;
            if (user) {
                await updatePlayerEnergyInFirestore(user.uid, playerHealth);
                await saveBattleState(user.uid, battleId, playerHealth);
            }
        }
    }
    // --- FIM DO CÓDIGO A SER ADICIONADO ---

    // --- INSIRA AQUI O TRECHO DO ASSASSINO FANTASMAGÓRICO ---
  const phantomBuff = activeBuffs.find(buff => buff.tipo === "phantom_assassin");
  if (phantomBuff) {
    const assassinRoll = Math.floor(Math.random() * 20) + 1;
    const playerDefense = getPlayerDefense();
    
    await addLogMessage(`O Assassino Fantasmagórico ataca você: ${assassinRoll} vs ${playerDefense}`, 1000);
    
    if (assassinRoll >= playerDefense) {
      await addLogMessage(
        `<p style="color: darkred; font-weight: bold;">O Assassino Fantasmagórico te executa! Você morreu!</p>`,
        1200
      );
      playerHealth = -11; // Força morte
      atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
      
      const user = auth.currentUser;
      if (user) await updatePlayerEnergyInFirestore(user.uid, playerHealth);
      
      if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
      return true; // Turno consumido
    } else {
      await addLogMessage(
        `O Assassino Fantasmagórico falha em seu ataque contra você.`,
        800
      );
    }
  }
  // --- FIM DO BLOCO ASSASSINO FANTASMAGÓRICO ---

    // Processa escudos de Bigby
for (const [monsterId, shield] of Object.entries(window.bigbyHandShields)) {
    shield.turnos--;
    if (shield.turnos <= 0) {
        const monster = window.currentMonsters.find(m => m.id === monsterId);
        if (monster) await addLogMessage(`Mão de Bigby contra ${monster.nome} se dissipou.`, 800);
        delete window.bigbyHandShields[monsterId];
    }
}

    return false; // SINALIZA QUE O TURNO NÃO FOI CONSUMIDO
}


async function verificarFugaAnimais() {
    console.log("VERIFICANDO FUGA DE ANIMAIS - FUNÇÃO CHAMADA");
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        if (!playerSnap.exists()) {
            console.log("Jogador não existe no Firestore");
            return;
        }

        const playerData = playerSnap.data();
        if (!playerData.inventory || !playerData.inventory.itemsInChest) {
            console.log("Inventário não existe");
            return;
        }

        const itemsInChest = playerData.inventory.itemsInChest;
        const griloIndex = itemsInChest.findIndex(item => 
            item.id === "grilo" && item.energia && item.energia.total > 0
        );

        if (griloIndex === -1) {
            console.log("Nenhum grilo com energia encontrado para fugir.");
            return;
        }

        const chanceRoll = Math.floor(Math.random() * 30) + 1;
        if (chanceRoll !== 1) {
            console.log(`GRILO NÃO FUGIU (rolou ${chanceRoll}/30)`);
            return;
        }

        console.log("GRILO FUGIU! (rolou 1/30)");

        // Pega o UUID do grilo que vai fugir ANTES de removê-lo
        const griloFugitivo = itemsInChest[griloIndex];
        const griloUuid = griloFugitivo.uuid;

        // Remove o grilo do inventário
        itemsInChest.splice(griloIndex, 1);

        // Adiciona o UUID do grilo à lista de descartados para não ser recriado
        if (griloUuid) {
            if (!playerData.inventory.discardedItems) {
                playerData.inventory.discardedItems = [];
            }
            playerData.inventory.discardedItems.push(griloUuid);
            console.log(`Grilo com UUID ${griloUuid} adicionado à lista de descarte.`);
        }

        // Salva o inventário atualizado no Firestore
        await setDoc(playerRef, {
            inventory: {
                ...playerData.inventory,
                itemsInChest: itemsInChest,
                discardedItems: playerData.inventory.discardedItems
            }
        }, { merge: true });

        console.log("GRILO REMOVIDO E ADICIONADO À LISTA DE DESCARTADOS!");
        alert("O grilo saltou do seu alforge e desapareceu entre as pedras.");

    } catch (error) {
        console.error("ERRO AO REMOVER GRILO:", error);
    }
}


// Função para processar debuffs do monstro no início do seu turno
function processMonsterDebuffs() {
    // Garante que estamos processando o monstro correto do turno
    const monster = currentMonster; 
    if (!monster || !monster.activeMonsterDebuffs || monster.activeMonsterDebuffs.length === 0) {
        return Promise.resolve();
    }

    // Reduz a duração dos debuffs APENAS do monstro atual
    monster.activeMonsterDebuffs.forEach(debuff => debuff.turnos--);

    const expiredDebuffs = monster.activeMonsterDebuffs.filter(debuff => debuff.turnos <= 0);
    monster.activeMonsterDebuffs = monster.activeMonsterDebuffs.filter(debuff => debuff.turnos > 0);

    // Redesenha TUDO para garantir que a UI reflita a remoção
    displayAllMonsterHealthBars();

    // Processa mensagens de debuffs expirados sequencialmente
    return expiredDebuffs.reduce((promise, debuff) => {
        return promise.then(() => {
            if (typeof addLogMessage === 'function') {
                return addLogMessage(`${debuff.nome} se dissipou do ${monster.nome}.`, 800);
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
function loadBattleState(userId, bId) {
    console.log("LOG: loadBattleState chamado com userId:", userId, "battleId:", bId);
    if (!userId || !bId) {
        console.error("LOG: loadBattleState - Parâmetros inválidos (userId ou battleId ausente)");
        return Promise.resolve(null);
    }
    const battleDocRef = doc(db, "battles", `${userId}_${bId}`);
    return getDoc(battleDocRef)
        .then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("LOG: Estado da batalha carregado do Firestore:", data);
                return data;
            } else {
                console.log("LOG: Nenhum estado de batalha encontrado para este encontro.");
                return null;
            }
        })
        .catch((error) => {
            console.error("LOG: Erro ao carregar o estado da batalha:", error);
            return null;
        });
}


// Função para salvar o estado da batalha no Firestore
function saveBattleState(userId, bId, playerHealth) {
    const monstersState = window.currentMonsters.map(m => ({
        id: m.id, // ex: "lobo_0", "lobo_1"
        pontosDeEnergia: m.pontosDeEnergia,
        activeMonsterDebuffs: m.activeMonsterDebuffs || []
    }));

    console.log("LOG: saveBattleState chamado com:", { userId, battleId: bId, monstersState, playerHealth });
    if (!userId || !bId) {
        console.error("LOG: saveBattleState - Parâmetros inválidos (userId ou battleId ausente)");
        return Promise.resolve();
    }
    const battleDocRef = doc(db, "battles", `${userId}_${bId}`);
    
    const initiativeResult = sessionStorage.getItem('initiativeResult');
    // ... (o resto dos session storage items)

    return setDoc(battleDocRef, {
  monsters: monstersState,
  playerHealth: playerHealth,
  isPlayerTurn: window.isPlayerTurn,
  initiativeResult: initiativeResult || null,
  battleStarted: window.battleStarted || true,
  activeBuffs: activeBuffs || [],       // ← aqui
  lastUpdated: new Date().toISOString()
}, { merge: true });

}


// Função para limpar o estado da batalha quando ela termina
function clearBattleState(userId, bId) {
    console.log("LOG: clearBattleState chamado com userId:", userId, "battleId:", bId);
    if (!userId || !bId) {
        console.error("LOG: clearBattleState - Parâmetros inválidos");
        return Promise.resolve(false);
    }
    const battleDocRef = doc(db, "battles", `${userId}_${bId}`);
    return deleteDoc(battleDocRef)
        .then(() => {
            console.log("LOG: Estado da batalha removido com sucesso.");
            // ... (resto da função)
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

    registerDeadBody(monster);
    
    // Reset do contador de risco do Relâmpago
    relampagoRiskCounter = 1; // ← ADICIONAR ESTA LINHA

    // Reset da energia vampírica
if (playerHealth > playerMaxHealth) {
    playerHealth = playerMaxHealth;
    atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
}

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
           // NOVO CÓDIGO (PARA SUBSTITUIR O BLOCO ACIMA)

// Marca todos os monstros do encontro como derrotados
// A variável 'monsterNames' foi definida no início do script (em DOMContentLoaded)
monsterNames.forEach(name => {
    markMonsterAsDefeated(user.uid, name.trim())
        .then(success => {
            if (success) {
                console.log(`LOG: Monstro ${name.trim()} marcado como derrotado.`);
            } else {
                console.error(`LOG: Falha ao marcar ${name.trim()} como derrotado.`);
            }
        });
});
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

    // Verifica se veio das narrativas
const narrativaVitoria = sessionStorage.getItem('narrativa-vitoria');
const narrativaDerrota = sessionStorage.getItem('narrativa-derrota');

if (narrativaVitoria || narrativaDerrota) {
    const secaoDestino = monster && monster.pontosDeEnergia <= 0 ? narrativaVitoria : narrativaDerrota;
    sessionStorage.removeItem('narrativa-vitoria');
    sessionStorage.removeItem('narrativa-derrota');
    window.location.href = `narrativas.html?secao=${secaoDestino}`;
    return;
}


    // Limpa o estado da batalha quando o monstro é derrotado
    if (user && monster) {
        const monsterName = getUrlParameter('monstro') || monster.id;
        clearBattleState(user.uid, battleId)
            .then(success => {
                if (success) {
                    console.log("LOG: Estado da batalha limpo após vitória.");
                }
            });
    }

    window.battleStarted = false; // Reset do estado da batalha usando window para garantir escopo global
    window.animatedUndead = [];
    window.deadBodies = [];
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
    const monsterNamesParam = getUrlParameter('monstros'); // Ex: "lobo,lobo" ou "lobo,esqueleto"
    monsterNames = monsterNamesParam ? monsterNamesParam.split(',') : [getUrlParameter('monstro') || 'lobo'];
    // Cria um ID único e consistente para a batalha, independente da ordem dos monstros na URL
    battleId = [...monsterNames].sort().join('_');
    console.log("LOG: Battle ID gerado:", battleId);
    


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
    magiaBtn.addEventListener("click", async () => {
        if (isPlayerTurn) {
            await carregarMagiasDisponiveis();
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
const atoClasseButton  = document.getElementById("ato-classe");
const painelAtos       = document.getElementById("painel-atos");
const listaAtos        = document.getElementById("lista-atos");
const fecharPainelAtos = document.getElementById("fechar-painel-atos");

let atosDoJogador = [
  {
    id: "olhar-inventario",
    nome: "Olhar de Inventário",
    descricao: "Veja rapidamente o que o alvo carrega consigo."
  },
  {
    id: "truque-sujo",
    nome: "Truque Sujo",
    descricao:
      "Joga areia nos olhos do inimigo, impondo desvantagem (-3 ataque, -3 couraça por 2 turnos). O alvo pode tentar resistir."
  },
  {
    id: "riso-escarnecedor",
    nome: "Riso Escarnecedor",
    descricao:
      "Provoca o inimigo com insulto cortante. Se falhar no teste de habilidade, sofre -1 de couraça e -1 de ataque por 6 turnos."
  },
  {
    id: "roubo-destino",
    nome: "Roubo de Destino",
    descricao:
      "Troca sua sorte com a de um inimigo, tornando o próximo teste dele um fracasso crítico e o seu um sucesso crítico."
  },
  {
  id: "punhalada-venenosa",
  nome: "Punhalada Venenosa",
  descricao: "Ataque com lâmina embebida em veneno. Se acertar com uma Adaga, causa o dano normal da arma e aplica um veneno que causa 2 de dano por 5 turnos."
},
    {
    id: "levesa-afiada",
    nome: "Leveza Afiada",
    descricao: "Aumenta a chance de acerto crítico SIFER (18-20) com armas leves por 7 turnos."
},

    {
  id: "anastia",
  nome: "Anastia",
  descricao: "Modo de mira extrema: perde 10 de couraça (pode ficar negativo), mas acerta crítico SIFER em 15+. Dura 4 turnos após 1 turno de carregamento."
},
    
    {
  id: "ocultar-se",
  nome: "Ocultar-se",
  descricao: "Tenta se esconder em combate. Se bem-sucedido, seu próximo ataque será um ataque pelas costas (Backstab)."
}
];

if (atoClasseButton) {
  atoClasseButton.addEventListener("click", () => {
    listaAtos.innerHTML = "";

    atosDoJogador.forEach(ato => {
      const div = document.createElement("div");
      div.className = "ato-item";
      div.style.marginBottom = "16px";
      div.innerHTML = `
        <strong>${ato.nome}</strong><br>
        <span style="font-size:0.95em">${ato.descricao}</span><br>
      `;

      const btn = document.createElement("button");
      btn.textContent = "Usar";
      btn.onclick = async () => {
        painelAtos.style.display = "none";

        if (ato.id === "truque-sujo") {
          // Truque Sujo
          await addLogMessage(
            "Você tenta cegar o inimigo com um truque sujo!",
            600
          );

          const resistanceRoll  = Math.floor(Math.random() * 20) + 1;
          const resistanceTotal = resistanceRoll + currentMonster.habilidade;
          const difficulty      = 20;

          await addLogMessage(
            `${currentMonster.nome} tenta resistir: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`,
            1000
          );

          if (resistanceTotal >= difficulty) {
            await addLogMessage(
              `${currentMonster.nome} resiste ao truque sujo!`,
              1000
            );
            endPlayerTurn();
            return;
          } else {
            await addLogMessage(
              `${currentMonster.nome} está momentaneamente cego! (-3 ataque, -3 couraça por 2 turnos)`,
              1000
            );

           // Aplica debuffs ao monstro ALVO
if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.nome !== "Truque Sujo");
currentMonster.activeMonsterDebuffs.push({
  tipo:   "accuracy",
  valor:  3,
  turnos: 2,
  nome:   "Truque Sujo"
});
currentMonster.activeMonsterDebuffs.push({
  tipo:   "couraca",
  valor:  3,
  turnos: 2,
  nome:   "Truque Sujo"
});
displayAllMonsterHealthBars(); // <--- CORRETO
            endPlayerTurn();
            return;
          }
        }

else if (ato.id === "ocultar-se") {
  await addLogMessage("Você tenta se ocultar no meio do combate...", 600);

  // --- INÍCIO: Bônus de habilidade por condições ambientais ---
  let bonusHab = 0;
  let bonusDesc = "";
  let conditions = {};
  if (window.ArcanumConditions && typeof window.ArcanumConditions.getConditions === "function") {
    conditions = await window.ArcanumConditions.getConditions();
  }
  // +3: noite, nublado, neblina, tempestade
  if (
    conditions.periodo === "noite" ||
    conditions.clima === "nublado" ||
    conditions.clima === "neblina" ||
    conditions.clima === "tempestade"
  ) {
    bonusHab = 3;
    bonusDesc = "+3 (condição ambiental favorável)";
  }
  // +5: lua nova, madrugada (prioridade)
  if (
    conditions.lua === "nova" ||
    conditions.periodo === "madrugada"
  ) {
    bonusHab = 5;
    bonusDesc = "+5 (condição ambiental muito favorável)";
  }
  // --- FIM: Bônus de habilidade por condições ambientais ---

  // Rolagem do jogador
  const playerRoll = Math.floor(Math.random() * 20) + 1;
  const playerHab = (playerData?.skill?.total || 0) + bonusHab;
  const playerTotal = playerRoll + playerHab;

  // Rolagem do monstro
  const monsterRoll = Math.floor(Math.random() * 20) + 1;
  const monsterTotal = monsterRoll + (currentMonster.habilidade || 0);

  await addLogMessage(`Você rolou ${playerRoll} + ${playerData?.skill?.total || 0}${bonusHab ? " " + bonusDesc : ""} (Hab) = ${playerTotal}`, 800);
  await addLogMessage(`${currentMonster.nome} rolou ${monsterRoll} + ${currentMonster.habilidade || 0} (Hab) = ${monsterTotal}`, 800);

  if (playerTotal > monsterTotal) {
    // Sucesso: aplica buff "oculto" com +5 couraça
    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "oculto");
    activeBuffs.push({
      tipo: "oculto",
      valor: 1,
      turnos: 2,
      nome: "Oculto (Backstab)",
      couracaBonus: 8 // NOVO: bônus de couraça
    });
    updateBuffsDisplay();
    await addLogMessage(`<span style="color:green;">Você se escondeu com sucesso! Seu próximo ataque será um ataque pelas costas (Backstab) e você recebe +5 de couraça enquanto estiver oculto.</span>`, 1000);
    endPlayerTurn();
  } else {
    // Falha: monstro faz ataque de oportunidade
    await addLogMessage(`<span style="color:red;">Você falha em se esconder! ${currentMonster.nome} percebe e ataca você!</span>`, 1000);
    await monsterOpportunityAttack(1.0);
    endPlayerTurn();
  }
  return;
}

    else if (ato.id === "anastia") {
  await addLogMessage("Você começa a mirar cuidadosamente... (carregando Anastia, 1 turno)", 800);

  // Aplica buff de carregamento (1 turno)
  activeBuffs = activeBuffs.filter(buff => buff.tipo !== "anastia_loading" && buff.tipo !== "anastia");
  activeBuffs.push({
    tipo: "anastia_loading",
    valor: 0,
    turnos: 1,
    nome: "Anastia (Carregando)"
  });
  updateBuffsDisplay();
  endPlayerTurn();
  return;
}
            
        else if (ato.id === "riso-escarnecedor") {
          // Riso Escarnecedor
          await addLogMessage(
            "Você provoca o inimigo com um insulto cortante!",
            600
          );

          const resistanceRoll  = Math.floor(Math.random() * 20) + 1;
          const resistanceTotal = resistanceRoll + currentMonster.habilidade;
          const difficulty      = 20;

          await addLogMessage(
            `${currentMonster.nome} tenta resistir: ${resistanceRoll} + ${currentMonster.habilidade} = ${resistanceTotal} vs ${difficulty}`,
            1000
          );

          if (resistanceTotal >= difficulty) {
            await addLogMessage(
              `${currentMonster.nome} resiste ao insulto!`,
              1000
            );
            endPlayerTurn();
            return;
          } else {
            await addLogMessage(
              `${currentMonster.nome} fica confuso e vulnerável! (-1 ataque, -1 couraça por 6 turnos)`,
              1000
            );

           // Aplica debuffs ao monstro ALVO
if (!currentMonster.activeMonsterDebuffs) currentMonster.activeMonsterDebuffs = [];
currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.nome !== "Riso Escarnecedor");
currentMonster.activeMonsterDebuffs.push({
  tipo:   "accuracy",
  valor:  1,
  turnos: 6,
  nome:   "Riso Escarnecedor"
});
currentMonster.activeMonsterDebuffs.push({
  tipo:   "couraca",
  valor:  1,
  turnos: 6,
  nome:   "Riso Escarnecedor"
});
displayAllMonsterHealthBars(); // <--- CORRETO
            endPlayerTurn();
            return;
          }
        }
            
else if (ato.id === "levesa-afiada") {
    const inventory = window.playerData?.inventory;
    const equippedWeaponName = inventory?.equippedItems?.weapon;

    // Verifica se a arma equipada está na lista de armas leves
    if (equippedWeaponName && armasLeves.includes(equippedWeaponName)) {
        await addLogMessage(
            "Você ativa Leveza Afiada! Seus ataques com armas leves têm chance de acerto crítico SIFER em 18-20 por 7 turnos.",
            800
        );
        // Remove buff anterior para não acumular
        activeBuffs = activeBuffs.filter(buff => buff.tipo !== "critico_aprimorado");
        // Adiciona o novo buff
        activeBuffs.push({
            tipo: "critico_aprimorado",
            valor: 18, // O valor mínimo para um acerto crítico SIFER
            turnos: 7,
            nome: "Leveza Afiada"
        });
        updateBuffsDisplay();
        endPlayerTurn();
    } else {
        await addLogMessage(
            "Você não está com uma arma leve equipada e perde o turno!",
            1000
        );
        endPlayerTurn();
    }
    return;
}
            
        else if (ato.id === "punhalada-venenosa") {
          // Punhalada Venenosa
          // 1. Verifica se Adaga está equipada
          const inventory = window.playerData?.inventory;
          const equippedWeaponName = inventory?.equippedItems?.weapon;
          if (!equippedWeaponName || !/adaga/i.test(equippedWeaponName)) {
            await addLogMessage(
              "Você precisa estar com uma Adaga equipada para usar Punhalada Venenosa!",
              1000
            );
            return; // Não perde o turno
          }
          // 2. Seta contexto especial para o próximo ataque
          window.punhaladaVenenosaContext = true;
          await addLogMessage(
            "Você prepara uma punhalada venenosa! Seu próximo ataque corpo a corpo tentará aplicar o veneno.",
            800
          );
          return; // Jogador deve atacar normalmente
        }
        else {
          // Outros atos genéricos
          await addLogMessage(
            `Você usou <strong>${ato.nome}</strong>!`,
            600
          );
          endPlayerTurn();
        }
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
// Limpa monstros antigos e carrega os novos
window.currentMonsters = [];
monsterNames.forEach((name, index) => {
  const monsterData = getMonsterById(name.trim());
  console.log("Carregando monstro:", name.trim(), monsterData);
  if (monsterData) {
    const monsterInstance = JSON.parse(JSON.stringify(monsterData));
    monsterInstance.id = `${monsterData.id || name.trim()}_${index}`; // Garante ID único

    // --- ENERGIA ALEATÓRIA ---
    if (monsterInstance.energiaDados) {
      const energiaSorteada = rollDice(monsterInstance.energiaDados);
      monsterInstance.pontosDeEnergia = energiaSorteada;
      monsterInstance.pontosDeEnergiaMax = energiaSorteada;
    } else if (typeof monsterInstance.pontosDeEnergia !== 'undefined') {
      monsterInstance.pontosDeEnergiaMax = monsterInstance.pontosDeEnergia;
    }

    window.currentMonsters.push(monsterInstance);
  }
});

// Define o alvo inicial do jogador
window.currentMonster = window.currentMonsters[0] || null;
currentMonster = window.currentMonster;

if (window.currentMonsters.length === 0) {
    console.error("LOG: Nenhum monstro foi carregado para a batalha.");
    document.getElementById("monster-name").innerText = "Monstros não encontrados";
} else {
    // A UI principal (por enquanto) mostrará o primeiro monstro como alvo
    updateMonsterInfoUI();
    // Você precisará criar uma função para exibir as barras de vida de todos os monstros
    displayAllMonsterHealthBars(); 
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
            userId = user.uid; // Remove 'const', usa a variável global
                    await loadEquippedDice(userId);
            // Carregar dados do Arcanum Iudicium
        await window.arcanumIudicium.carregarFirestore();
            relampagoRiskCounter = 1; // Reset do risco do Relâmpago
            console.log("LOG: Usuário logado. ID:", userId);
            const monsterName = getUrlParameter('monstro');

            // Carregar o estado da batalha ao carregar a página
if (window.currentMonsters.length > 0) { // Verifica se há monstros para a batalha
    loadBattleState(userId, battleId)
        .then(savedState => {
            if (savedState) {
                // Carrega os dados do jogador
                playerHealth = savedState.playerHealth;
                isPlayerTurn = savedState.isPlayerTurn;
                window.isPlayerTurn = savedState.isPlayerTurn;
                battleStarted = savedState.battleStarted || true;
                window.battleStarted = savedState.battleStarted || true;
                activeBuffs = savedState.activeBuffs || [];

                // Carrega os dados de cada monstro
                savedState.monsters.forEach(monsterData => {
                    const monsterToUpdate = window.currentMonsters.find(m => m.id === monsterData.id);
                    if (monsterToUpdate) {
                        monsterToUpdate.pontosDeEnergia = monsterData.pontosDeEnergia;
                        monsterToUpdate.activeMonsterDebuffs = monsterData.activeMonsterDebuffs || [];
                    }
                });

                console.log("LOG: onAuthStateChanged - Estado da batalha carregado do Firestore:", savedState);

                // Atualiza a UI
                atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
                displayAllMonsterHealthBars();
                updateBuffsDisplay();
                updatePlayerCouracaDisplay();

                // Define o alvo atual como o primeiro monstro vivo
                window.currentMonster = window.currentMonsters.find(m => m.pontosDeEnergia > 0) || null;
                currentMonster = window.currentMonster;
                if(currentMonster) updateMonsterInfoUI();

                // Esconde botões de início
                const lutarButton = document.getElementById("iniciar-luta");
                const rolarIniciativaButton = document.getElementById("rolar-iniciativa");
                if (lutarButton) lutarButton.style.display = 'none';
                if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'none';

                // Continua a batalha de onde parou
                if (isPlayerTurn) {
                    startNewTurnBlock("Jogador");
                    addLogMessage("Turno do Jogador", 1000);
                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'block';
                } else {
                    startNewTurnBlock("Oponentes");
                    addLogMessage("Turno dos Oponentes", 1000);
                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
                    setTimeout(() => { monstersTurn(); }, 2000);
                }
            }
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
updatePlayerCouracaDisplay();

                      updatePlayerProjectilesDisplay();
                        
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
// resetDynamicConditions(); // REMOVER ESTA LINHA
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

        const locationRoll = Math.floor(Math.random() * 20) + 1; // localização normal
       //  const locationRoll = 6; // TESTE: sempre 6 (teste)
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
       // await addLogMessage(`Alvo: ${locationName}. Bônus SIFER: ${siferBonusDamage}.`, 800);


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
        displayAllMonsterHealthBars();
        await addLogMessage(`${currentMonster.nome} sofreu ${danoRolado} de dano mágico (${window.magicContext.dano}).`, 800);
        
        // Limpa contexto
        const userId = window.magicContext.userId;
        const monsterName = window.magicContext.monsterName;
        window.magicContext = null;
        rolarDanoButton.style.display = 'none';
        
        // Verifica se morreu
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
        registerDeadBody(currentMonster); // ← ADICIONAR
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        handlePostBattle(currentMonster);
    } else {
        window.currentMonster = monstersAlive[0];
        currentMonster = window.currentMonster;
        await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
        updateMonsterInfoUI();
        displayAllMonsterHealthBars();
        endPlayerTurn();
    }
    return;
}
        
        // Salva e passa turno
        await updatePlayerMagicInFirestore(userId, playerMagic);
        await saveBattleState(userId, battleId, playerHealth);
        endPlayerTurn();
        return;
    }


      // VERIFICAÇÃO PARA TOQUE CHOCANTE
if (window.touchSpellContext) {
    let totalDamage = 0;
    const toques = window.touchSpellContext.toques || 1;
    
    for (let i = 0; i < toques; i++) {
        totalDamage += rollDice('1d6');
    }
    
    currentMonster.pontosDeEnergia -= totalDamage;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${toques} descarga(s) elétrica(s) causaram ${totalDamage} de dano total!`, 800);

    
    // Limpa contexto
    window.touchSpellContext = null;
    rolarDanoButton.style.display = 'none';
    
    // Verifica se morreu
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
        registerDeadBody(currentMonster); // ← ADICIONAR
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        handlePostBattle(currentMonster);
    } else {
        window.currentMonster = monstersAlive[0];
        currentMonster = window.currentMonster;
        await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
        updateMonsterInfoUI();
        displayAllMonsterHealthBars();
        endPlayerTurn();
    }
    return;
}
    
    // Salva e passa turno
    const user = auth.currentUser;
    if (user) {
        await saveBattleState(userId, battleId, playerHealth);
    }
    endPlayerTurn();
    return;
}

      // VERIFICAÇÃO PARA TOQUE MACABRO
if (window.touchDebuffContext) {
    const danoRolado = rollDice(window.touchDebuffContext.dano);
    currentMonster.pontosDeEnergia -= danoRolado;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
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
        currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.tipo !== "damage_reduction");
        
        // Adiciona novo debuff
        currentMonster.activeMonsterDebuffs.push({
            tipo: "damage_reduction",
            valor: 3,
            turnos: 3,
            nome: "Toque Macabro"
        });
        
        displayAllMonsterHealthBars();

    }
    
    // Limpa contexto
    window.touchDebuffContext = null;
    rolarDanoButton.style.display = 'none';
    
    // Verifica se morreu
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
        registerDeadBody(currentMonster); // ← ADICIONAR
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        handlePostBattle(currentMonster);
    } else {
        window.currentMonster = monstersAlive[0];
        currentMonster = window.currentMonster;
        await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
        updateMonsterInfoUI();
        displayAllMonsterHealthBars();
        endPlayerTurn();
    }
    return;
}
    
    // Salva e passa turno
    const user = auth.currentUser;
    if (user) {
        await saveBattleState(userId, battleId, playerHealth);
    }
    endPlayerTurn();
    return;
}


// VERIFICAÇÃO PARA TOQUE VAMPÍRICO
if (window.touchVampiricContext) {
    const danoRolado = rollDice(window.touchVampiricContext.dano);
    currentMonster.pontosDeEnergia -= danoRolado;
    currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia);
    displayAllMonsterHealthBars();
    await addLogMessage(`${currentMonster.nome} sofreu ${danoRolado} de dano necrótico (${window.touchVampiricContext.dano}).`, 800);
    
    // Vampirismo: jogador ganha energia igual ao dano causado
    playerHealth += danoRolado;
    atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
    await addLogMessage(`<span style="color: green;">Você drena ${danoRolado} pontos de energia vital!</span>`, 800);
    
    // Limpa contexto
    window.touchVampiricContext = null;
    rolarDanoButton.style.display = 'none';
    
    // Verifica se morreu
    if (currentMonster.pontosDeEnergia <= 0) {
        console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
        console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
            registerDeadBody(currentMonster); // ← ADICIONAR
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi drenado até a morte!</p>`, 1000);
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
        } else {
            window.currentMonster = monstersAlive[0];
            currentMonster = window.currentMonster;
            await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
            updateMonsterInfoUI();
            displayAllMonsterHealthBars();
            endPlayerTurn();
        }
        return;
    }
    
    // Salva e passa turno
    const user = auth.currentUser;
    if (user) {
        await updatePlayerEnergyInFirestore(user.uid, playerHealth);
        await saveBattleState(user.uid, battleId, playerHealth);
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
let playerDamageDice = "1"; // padrão desarmado
const inventory = window.playerData?.inventory;
if (inventory && inventory.equippedItems && inventory.equippedItems.weapon) {
    let equippedWeaponName = inventory.equippedItems.weapon;
    if (equippedWeaponName) {
        equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");
    }
    const allItemsArr = [...initialItems, ...extraItems];
    const weaponObj = allItemsArr.find(item => item.content === equippedWeaponName);
    if (weaponObj && weaponObj.damage) {
        playerDamageDice = weaponObj.damage;
    }
} else if (playerData?.dano) {
    playerDamageDice = playerData.dano;
}

                                     
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

            // VERIFICAÇÃO DE MORTE INSTANTÂNEA SIFER
    const energiaApos = currentMonster.pontosDeEnergia - totalDamage;
    const limiar10Porcento = currentMonster.pontosDeEnergiaMax * 0.1;
    
    if (energiaApos < limiar10Porcento && (window.siferContext.locationRoll === 19 || window.siferContext.locationRoll === 20)) {
        // Morte instantânea para Pescoço/Cabeça
        const tipoMorte = window.siferContext.locationRoll === 19 ? "degolamento" : "decapitação";
        await addLogMessage(`<strong style="color: darkred;">MORTE INSTANTÂNEA!</strong> ${tipoMorte.toUpperCase()}!`, 1200);
        
        // Força morte independente da energia
        currentMonster.pontosDeEnergia = 0;
        displayAllMonsterHealthBars(); // <-- AQUI ESTÁ A MUDANÇA!

        
        await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi executado!</p>`, 1000);
        
        // Salva estado
const user = auth.currentUser;
if (user) {
    await saveBattleState(user.uid, battleId, playerHealth);
}

// Verifica se AINDA existem monstros vivos
const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
if (monstersAlive.length === 0) {
    // TODOS FORAM DERROTADOS! Fim da batalha.
    handlePostBattle(currentMonster);
} else {
    // Ainda há monstros. Define o próximo como alvo e continua a batalha.
    window.currentMonster = monstersAlive[0];
    currentMonster = window.currentMonster;
    await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
    updateMonsterInfoUI();
    displayAllMonsterHealthBars();
    endPlayerTurn();
}
return;
    }

        // VERIFICAÇÃO DE EVISCERAÇÃO SIFER
if (energiaApos < limiar10Porcento && window.siferContext.locationRoll >= 11 && window.siferContext.locationRoll <= 16) {
    // Verifica se já tem evisceração
    const jaTemEvisceração = activeMonsterDebuffs.find(debuff => debuff.tipo === "bleeding");
    
    if (!jaTemEvisceração) {
        // Calcula dano por turno (1% da energia máxima, mínimo 1)
        const danoPerTurno = Math.max(1, Math.ceil(currentMonster.pontosDeEnergiaMax * 0.01));
        
        // Adiciona debuff de evisceração
        currentMonster.activeMonsterDebuffs.push({
            tipo: "bleeding",
            valor: danoPerTurno,
            turnos: 999, // Permanente até morrer
            nome: "Evisceração"
        });
        
        displayAllMonsterHealthBars();
        await addLogMessage(`<strong style="color: darkred;">EVISCERAÇÃO!</strong> Você abre totalmente o abdômen de ${currentMonster.nome} e ele sangrará ${danoPerTurno} Energia por turno!`, 1200);
    }
}

        // VERIFICAÇÃO DE ENUCLEAÇÃO SIFER
if (energiaApos < limiar10Porcento && window.siferContext.locationRoll === 18) {
    // Verifica se já tem cegueira
    const jaTemCegueira = activeMonsterDebuffs.find(debuff => debuff.tipo === "accuracy" && debuff.nome === "Enucleação");
    
    if (!jaTemCegueira) {
        // Remove qualquer debuff de accuracy anterior
        activeMonsterDebuffs = activeMonsterDebuffs.filter(debuff => debuff.tipo !== "accuracy");
        
        // Adiciona debuff de enucleação
        currentMonster.activeMonsterDebuffs.push({
            tipo: "accuracy",
            valor: 10,
            turnos: 999, // Permanente até morrer
            nome: "Enucleação"
        });
        
        displayAllMonsterHealthBars();
        await addLogMessage(`<strong style="color: darkred;">ENUCLEAÇÃO!</strong> Você arranca os olhos de ${currentMonster.nome}!`, 1200);
    }
}

        // VERIFICAÇÃO DE AMPUTAÇÃO SIFER
if (energiaApos < limiar10Porcento) {
    const locationRoll = window.siferContext.locationRoll;
    
    // Amputação de Membros Inferiores (1-5)
    if (locationRoll >= 1 && locationRoll <= 5) {
        const jaTemPernas = activeMonsterDebuffs.find(debuff => debuff.tipo === "amputation_legs");
        if (!jaTemPernas) {
            currentMonster.activeMonsterDebuffs.push({
                tipo: "amputation_legs",
                valor: Math.floor(currentMonster.couraça / 2),
                turnos: 999,
                nome: "Amputação (Pernas)"
            });
            displayAllMonsterHealthBars();
            await addLogMessage(`<strong style="color: darkred;">AMPUTAÇÃO!</strong> Você amputa o ${currentMonster.nome}! Ele se arrasta vulnerável.`, 1200);
        }
    }
    
    // Amputação de Membros Ofensivos (7-10)
    if (locationRoll >= 7 && locationRoll <= 10) {
        const jaTemBracos = activeMonsterDebuffs.find(debuff => debuff.tipo === "amputation_arms");
        if (!jaTemBracos) {
            currentMonster.activeMonsterDebuffs.push({
                tipo: "amputation_arms",
                valor: 70, // 70% de redução (30% restante)
                turnos: 999,
                nome: "Amputação (Braços)"
            });
            displayAllMonsterHealthBars();
            await addLogMessage(`<strong style="color: darkred;">AMPUTAÇÃO!</strong> Você amputa o ${currentMonster.nome}! Seus ataques ficam fracos.`, 1200);
        }
    }
}

        // VERIFICAÇÃO DE HEMORRAGIA INTERNA SIFER
if (energiaApos < limiar10Porcento && window.siferContext.locationRoll === 6) {
    // Calcula dano por turno (2% da energia máxima, mínimo 1)
    const danoPerTurno = Math.max(1, Math.ceil(currentMonster.pontosDeEnergiaMax * 0.02));
    
    // Verifica se já tem sangramento
    const sangramentoExistente = activeMonsterDebuffs.find(debuff => debuff.tipo === "bleeding");
    
    if (sangramentoExistente) {
        // Acumula com sangramento existente
        sangramentoExistente.valor += danoPerTurno;
        sangramentoExistente.nome = "Sangramento Múltiplo";
        await addLogMessage(`<strong style="color: darkred;">HEMORRAGIA INTERNA!</strong> Você perfura órgãos vitais pelas costas de ${currentMonster.nome}! Sangramento aumenta para ${sangramentoExistente.valor} energia/turno!`, 1200);
    } else {
        // Adiciona novo debuff de hemorragia
        currentMonster.activeMonsterDebuffs.push({
            tipo: "bleeding",
            valor: danoPerTurno,
            turnos: 999,
            nome: "Hemorragia Interna"
        });
        await addLogMessage(`<strong style="color: darkred;">HEMORRAGIA INTERNA!</strong> Você perfura órgãos vitais pelas costas de ${currentMonster.nome}! Ele sangrará ${danoPerTurno} energia por turno!`, 1200);
    }
    
    displayAllMonsterHealthBars();
}


    window.siferContext = null; // Limpa contexto

    }

        } else {
            // Lógica de Dano Normal
            isSiferDamage = false;
            console.log("LOG: Processando Dano Normal...");
            await addLogMessage(`Rolagem de Dano Normal`, 1000);
            // --- INÍCIO: Dano extra de Backstab com dois cliques ---
if (window.isBackstabAttack) {
  if (!window.backstabContext) {
    baseDamageRoll = rollDice(playerDamageDice);
    totalDamage = baseDamageRoll;
    window.backstabContext = { stage: 'backstab', base: baseDamageRoll };
    await addLogMessage(`Dano da arma: ${baseDamageRoll} (${playerDamageDice})`, 800);
    await addLogMessage(`Agora role o bônus de Backstab (1d6)! Clique novamente no botão de dano.`, 800);
    rolarDanoButton.style.display = 'inline-block';
    rolarDanoButton.disabled = false;
    return;
  } else if (window.backstabContext.stage === 'backstab') {
    const backstabBonus = rollDice("1d6");
    totalDamage = window.backstabContext.base + backstabBonus;
    await addLogMessage(`<span style="color:orange;">Backstab! Dano extra: ${backstabBonus} (1d6).</span>`, 800);
    await addLogMessage(`Dano total: <strong style="color:yellow;">${totalDamage}</strong>.`, 1000);
    window.isBackstabAttack = false;
    window.backstabContext = null;
    // (segue o fluxo normal de aplicar o dano)
  }
} else {
  baseDamageRoll = rollDice(playerDamageDice);
  totalDamage = baseDamageRoll;
  await addLogMessage(`Você rolou ${totalDamage} de dano (${playerDamageDice})!`, 1000);
}
// --- FIM: Dano extra de Backstab com dois cliques ---
            

           // --- INÍCIO: Lógica CORRIGIDA da Punhalada Venenosa ---
if (window.isPunhaladaVenenosaAttack) {
    // Não causa dano extra, apenas aplica o debuff de veneno.
    await addLogMessage(`<span style="color:green;">A lâmina aplica um veneno potente!</span>`, 800);

    // Garante que o array de debuffs do monstro alvo exista
    if (!currentMonster.activeMonsterDebuffs) {
        currentMonster.activeMonsterDebuffs = [];
    }

    // Remove qualquer veneno anterior para não acumular (opcional, mas bom)
    currentMonster.activeMonsterDebuffs = currentMonster.activeMonsterDebuffs.filter(debuff => debuff.tipo !== 'poison');

    // Aplica o debuff de veneno no alvo
    currentMonster.activeMonsterDebuffs.push({
        tipo: "poison", // Debuff de dano por turno
        valor: 2,      // 2 de dano
        turnos: 5,     // por 5 turnos
        nome: "Punhalada Venenosa"
    });

    displayAllMonsterHealthBars(); // Atualiza a UI para mostrar o novo debuff
    window.isPunhaladaVenenosaAttack = false; // Limpa a flag para o próximo ataque
}
// --- FIM: Lógica CORRIGIDA da Punhalada Venenosa ---

             console.log("LOG: Botão 'DANO' - Dano normal rolado:", totalDamage);
             await addLogMessage(`Você rolou ${totalDamage} de dano (${playerDamageDice})!`, 1000);
        }

        // --- Aplicação do Dano e Fim do Turno (Comum a SIFER e Normal) ---
        if (totalDamage > 0) { // Só aplica se houver dano
            console.log(`Aplicando ${totalDamage} de dano ao monstro.`);
            currentMonster.pontosDeEnergia -= totalDamage;
            window.damageTracker.addDamage('player', totalDamage);
            currentMonster.pontosDeEnergia = Math.max(0, currentMonster.pontosDeEnergia); // Garante não ficar negativo

            await addLogMessage(`${currentMonster.nome} sofreu ${totalDamage} de dano.`, 800);

            displayAllMonsterHealthBars();
            await addLogMessage(`Energia restante do ${currentMonster.nome}: ${currentMonster.pontosDeEnergia}.`, 1000);

            // Salva estado (precisa de userId e monsterName no escopo)
            const user = auth.currentUser; // Pega o usuário atual
            if (userId && monsterName && currentMonster) { // Verifica se as variáveis globais estão ok
                 await saveBattleState(userId, battleId, playerHealth);
            } else {
                 console.error("Erro ao salvar estado: userId, monsterName ou currentMonster não definidos.");
            }

        } else {
            console.log("Dano total foi zero, nenhum dano aplicado.");
            await addLogMessage("Dano calculado foi zero.", 800);
        }


        // Verifica derrota e o estado da batalha
if (currentMonster.pontosDeEnergia <= 0) {
    console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
    console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
    registerDeadBody(currentMonster); // ← ADICIONAR
    console.log(`LOG: Monstro derrotado após ${isSiferDamage ? 'SIFER' : 'Dano Normal'}!`);
    await addLogMessage(`<p style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</p>`, 1000);

    // **INÍCIO DA LÓGICA CORRIGIDA**
    // Verifica se AINDA existem monstros vivos
    const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
    if (monstersAlive.length === 0) {
        // TODOS FORAM DERROTADOS! Fim da batalha.
        console.log("LOG: Todos os monstros foram derrotados!");
        handlePostBattle(currentMonster); // Chama a função de pós-batalha
    } else {
        // Ainda há monstros. Define o próximo como alvo e continua a batalha.
        window.currentMonster = monstersAlive[0];
        currentMonster = window.currentMonster;
        await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
        // Atualiza a UI e passa o turno para o monstro
        updateMonsterInfoUI();
        displayAllMonsterHealthBars();
        endPlayerTurn();
    }
    // **FIM DA LÓGICA CORRIGIDA**
} else {
    // O monstro sobreviveu, apenas passa o turno para o inimigo.
    console.log(`LOG: Monstro sobreviveu ao ${isSiferDamage ? 'SIFER' : 'Dano Normal'}. Passando turno.`);
    if (typeof endPlayerTurn === 'function') {
        endPlayerTurn();
    } else {
         console.error(`LOG: Função endPlayerTurn não encontrada!`);
         isPlayerTurn = false;
         setTimeout(() => monsterAttack(), 1500);
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

        // --- INÍCIO: Lógica de ataque pelas costas (Backstab) ---
const ocultoBuff = activeBuffs.find(buff => buff.tipo === "oculto");
let isBackstab = false;
if (ocultoBuff) {
  isBackstab = true;
  // Remove o buff após o ataque
  activeBuffs = activeBuffs.filter(buff => buff.tipo !== "oculto");
  updateBuffsDisplay();
  await addLogMessage(`<span style="color:orange;">Você está oculto! Este ataque será um ataque pelas costas (Backstab).</span>`, 800);
}
if (isBackstab) {
  window.isBackstabAttack = true;
} else {
  window.isBackstabAttack = false;
}
// --- FIM: Lógica de ataque pelas costas (Backstab) ---
        
        
        // ==================================================================
// === INÍCIO: CÓDIGO A SER INSERIDO ================================
// ==================================================================

// --- INÍCIO: Punhalada Venenosa ---
if (window.punhaladaVenenosaContext) {
  // Limpa o contexto para não aplicar múltiplas vezes
  window.punhaladaVenenosaContext = null;
  // Verifica novamente se Adaga está equipada (caso o jogador troque de arma entre o ato e o ataque)
  const inventory = window.playerData?.inventory;
  const equippedWeaponName = inventory?.equippedItems?.weapon;
  if (!equippedWeaponName || !/adaga/i.test(equippedWeaponName)) {
    await addLogMessage(
      "Você não está mais com uma Adaga equipada. O veneno é desperdiçado.",
      1000
    );
    // Não perde o turno, segue ataque normal
  } else {
    // Sinaliza que o ataque é venenoso para o cálculo de dano
    window.isPunhaladaVenenosaAttack = true;
    await addLogMessage(
      "Você desfere uma punhalada venenosa!",
      800
    );
  }
}
// --- FIM: Punhalada Venenosa ---
        
        
// Verifica se é um ataque de toque mágico
const isTouchSpell = (window.touchSpellContext !== null && window.touchSpellContext !== undefined) ||
(window.touchDebuffContext !== null && window.touchDebuffContext !== undefined) ||
(window.touchVampiricContext !== null && window.touchVampiricContext !== undefined);
        

// --- LÓGICA DE GASTO DE MUNIÇÃO (apenas para ataques normais) ---
if (!isTouchSpell) {
    const inventory = window.playerData?.inventory;
    let equippedWeaponName = inventory?.equippedItems?.weapon;
    // ADICIONE ESTA VERIFICAÇÃO E LIMPEZA
    if (equippedWeaponName) {
        equippedWeaponName = equippedWeaponName.replace(/\s*\(\d+\/\d+\)$/, "");
    }
    const allItemsArr = [...initialItems, ...extraItems];
    const weaponObject = allItemsArr.find(item => item.content === equippedWeaponName);

    if (weaponObject && weaponObject.ammoType) {

    let loadedAmmo = inventory.equippedItems.weapon_loadedAmmo || 0;
    if (loadedAmmo <= 0) {
        // --- INÍCIO LÓGICA DE RECARGA ---
        // Busca munição compatível no inventário
        const ammoItemIndex = inventory.itemsInChest.findIndex(item => item.id === weaponObject.ammoType && item.quantity > 0);
        if (ammoItemIndex === -1) {
            await addLogMessage(`<strong style="color: red;">Sem munição!</strong> Você não pode atacar e perde o turno.`, 1000);
            endPlayerTurn();
            return;
        }
        const ammoItem = inventory.itemsInChest[ammoItemIndex];
        const ammoToLoad = Math.min(weaponObject.ammoCapacity, ammoItem.quantity);
        inventory.equippedItems.weapon_loadedAmmo = ammoToLoad;
        ammoItem.quantity -= ammoToLoad;
        if (ammoItem.quantity <= 0) {
    // Remove do inventário
    inventory.itemsInChest.splice(ammoItemIndex, 1);
    // Marca como descartado para não ser readicionado
    if (!inventory.discardedItems) inventory.discardedItems = [];
    inventory.discardedItems.push(ammoItem.uuid);
}
        // Atualiza no Firestore
        try {
            const playerDocRef = doc(db, "players", userId);
            await setDoc(playerDocRef, { inventory: inventory }, { merge: true });
            updatePlayerProjectilesDisplay();
        } catch (error) {
            console.error("LOG: Erro ao salvar munição no Firestore:", error);
        }
        await addLogMessage(`<strong style="color: orange;">Você recarrega o ${weaponObject.content} com ${ammoToLoad} munição(ões).</strong>`, 1000);
        endPlayerTurn();
        return;
        // --- FIM LÓGICA DE RECARGA ---
    } else {
        // Gasta uma munição normalmente
        loadedAmmo--;
        inventory.equippedItems.weapon_loadedAmmo = loadedAmmo;
        await addLogMessage(`Você gasta uma munição. (${loadedAmmo} restantes)`, 500);
        updatePlayerProjectilesDisplay();
        try {
            const playerDocRef = doc(db, "players", userId);
            await setDoc(playerDocRef, { inventory: inventory }, { merge: true });
        } catch (error) {
            console.error("LOG: Erro ao salvar munição no Firestore:", error);
        }
    }
}

// ==================================================================
// === FIM: CÓDIGO A SER INSERIDO ===================================
// ==================================================================
}
    
if (isTouchSpell) {
    const spellName = window.touchSpellContext?.nome || window.touchDebuffContext?.nome || window.touchVampiricContext?.nome;
    await addLogMessage(`Tentando tocar ${currentMonster.nome} com ${spellName}...`, 800);
}

        console.log("LOG: Botão 'Atacar Corpo a Corpo' clicado.");

        // Desabilita TODOS os botões de ação inicialmente
const actionButtons = document.querySelectorAll('#attack-options button');
actionButtons.forEach(button => button.disabled = true);

// Verifica se tem buff crítico garantido
const criticalBuff = activeBuffs.find(buff => buff.tipo === "critical_guaranteed");
let playerAttackRollRaw;

if (criticalBuff && !isTouchSpell) {
    playerAttackRollRaw = 20; // Força crítico
    // Remove o buff após usar
    activeBuffs = activeBuffs.filter(buff => buff.tipo !== "critical_guaranteed");
    updateBuffsDisplay();
    await addLogMessage(`Crítico garantido ativado! O monstro está dormindo e vulnerável!`, 800);
} else {
    playerAttackRollRaw = Math.floor(Math.random() * 20) + 1; // ataque Normal
    // playerAttackRollRaw = 20; // TESTE de crítico: sempre 20
}

        const vooBuff = activeBuffs.find(buff => buff.tipo === "voo");
const vooBonus = vooBuff ? vooBuff.valor : 0;
const playerAttackRollTotal = playerAttackRollRaw + playerAbilityValue + vooBonus;

if (vooBonus > 0) {
    await addLogMessage(`Bônus de Voo: +${vooBonus}`, 500);
}
        
        const monsterDefense = getMonsterDefense();

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

      // ==================================================================
// === INÍCIO: CÓDIGO CORRIGIDO A SER COLADO ========================
// ==================================================================

// --- NOVA LÓGICA UNIFICADA DE ACERTO E CRÍTICO SIFER ---
// 1. Determinar o limiar do acerto crítico SIFER
let criticalThreshold = 20; // Padrão é 20
const levezAfiadaBuff = activeBuffs.find(buff => buff.tipo === 'critico_aprimorado');
if (levezAfiadaBuff) {
  const inventory = window.playerData?.inventory;
  const currentWeaponName = inventory?.equippedItems?.weapon;
  if (currentWeaponName && armasLeves.map(a => a.toLowerCase()).includes(currentWeaponName.toLowerCase())) {
    criticalThreshold = levezAfiadaBuff.valor;
  }
}


        // Anastia: limiar de crítico SIFER em 15+
const anastiaBuff = activeBuffs.find(buff => buff.tipo === "anastia");
if (anastiaBuff) {
  criticalThreshold = anastiaBuff.criticalThreshold;
}
        
const currentWeaponName = window.playerData?.inventory?.equippedItems?.weapon;
console.log("DEBUG SIFER", {
  playerAttackRollRaw,
  criticalThreshold,
  levezAfiadaBuff,
  currentWeaponName,
  armasLeves
});

// 2. Checar os resultados do ataque
if (playerAttackRollRaw >= criticalThreshold && !isTouchSpell) {
    // ACERTO CRÍTICO SIFER (18, 19 ou 20 com buff, ou 20 sem buff)
    console.log("LOG: SIFER - Acerto Crítico! Aguardando rolagem de localização.");
    // CORREÇÃO AQUI:
    await addLogMessage(`<strong style="color: orange;">ACERTO CRÍTICO (SIFER)!</strong> Role a localização!`, 500);
    const rollLocationBtn = document.getElementById("rolar-localizacao");
    if (rollLocationBtn) {
        rollLocationBtn.style.display = "inline-block";
        rollLocationBtn.disabled = false;
        atacarCorpoACorpoButton.disabled = true;
        window.siferContext = {}; // Inicia o contexto SIFER
    } else {
        console.error("Botão 'rolar-localizacao' não encontrado no HTML!");
        await addLogMessage("Erro: Botão 'Rolar Localização' não encontrado.", 0);
    }
} else if (playerAttackRollTotal >= monsterDefense) {
    // ACERTO NORMAL
    console.log("LOG: Ataque normal acertou.");
    atacarCorpoACorpoButton.style.display = 'none';
    atacarCorpoACorpoButton.disabled = true;
    if (rolarDanoButton) {
        rolarDanoButton.style.display = 'inline-block';
        rolarDanoButton.disabled = false;
    }
    if (isTouchSpell) {
        // CORREÇÃO AQUI:
        await addLogMessage(`Seu toque mágico atinge ${currentMonster.nome}! Role o dano.`, 1000);
    } else {
        // CORREÇÃO AQUI:
        await addLogMessage(`Seu ataque atinge em cheio o ${currentMonster.nome}! Role o dano.`, 1000);
    }
} else {
    // ERRO
    console.log("LOG: Ataque normal errou.");
    if (window.isPunhaladaVenenosaAttack) {
        window.isPunhaladaVenenosaAttack = null;
        window.punhaladaVenenosaExtraDano = null;
        // CORREÇÃO AQUI:
        await addLogMessage(`<span style='color:orange;'>Você erra a punhalada venenosa e desperdiça o veneno.</span>`, 1000);
    }
    if (isTouchSpell) {
        // CORREÇÃO AQUI:
        await addLogMessage(`Seu toque não consegue alcançar ${currentMonster.nome}.`, 1000);
        window.touchSpellContext = null;
        window.touchDebuffContext = null;
        window.touchVampiricContext = null;
    } else {
        // CORREÇÃO AQUI:
        await addLogMessage(`Seu ataque passa de raspão no ${currentMonster.nome}.`, 1000);
    }
    endPlayerTurn();
}

// ==================================================================
// === FIM: DA SUBSTITUIÇÃO =========================================
// ==================================================================
        
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
       // Inicializa o painel Arcanum Verbis com condições dinâmicas
if (window.ArcanumUI) {
window.ArcanumUI.initPanel();
}


    
    console.log("LOG: Event listener para DOMContentLoaded finalizado.");
});

async function setupArcanumConjurationModal(magiaId) {
    const magia = magiasDisponiveis.find(m => m.id === magiaId);
    if (!magia) return;

    // USAR A FUNÇÃO GLOBAL EM VEZ DA LOCAL
    const dynamicConditions = await window.ArcanumConditions.getConditions();
    const modalData = await window.ArcanumSpells.createArcanumConjurationModal(magia);
    const {modal, correctWord, conditions} = modalData;
    
    const modifierMap = {
        periodo: { manha: 'first-vowel-to-i', tarde: 'a-to-y', noite: 'duplicate-last-consonant', madrugada: 'add-mad' },
        estacao: { primavera: 'add-pri', verao: 'e-to-a', outono: 'add-out', inverno: 'o-to-u' },
        vento: { norte: 'add-n', sul: 'add-s', leste: 'add-l', oeste: 'add-o', nordeste: 'add-ne', noroeste: 'add-no', sudeste: 'add-se', sudoeste: 'add-so' },
        clima: { 'sol-forte': 'duplicate-first', 'sol-fraco': 'remove-first-vowel', nublado: 'add-nub-middle', 'chuva-leve': 'add-plu', 'chuva-forte': 'vowels-to-u', tempestade: 'reverse-word', neblina: 'add-neb', nevoa: 'add-nev', neve: 'add-niv', granizo: 'add-gra', seco: 'remove-duplicate-vowels', umido: 'duplicate-vowels' },
        lua: { nova: 'add-x', crescente: 'add-c', cheia: 'add-f', minguante: 'add-m' },
        temperatura: { 'muito-frio': 'all-upper', frio: 'consonants-upper', quente: 'vowels-upper', 'muito-quente': 'i-to-y-e-to-a' },
        pressao: { alta: 'add-alt', baixa: 'add-bai' },
        energiaMagica: { alta: 'duplicate-word', baixa: 'remove-last', interferencia: 'vowels-to-numbers' }
    };

    modal.querySelector('.conditions-display').innerHTML = Object.entries(dynamicConditions).map(([key, value]) => {
        if (!value) return '';
        const modifier = modifierMap[key] && modifierMap[key][value] ? modifierMap[key][value] : '';
        const modifierText = modifier ? ` <span style="color:#feca57;font-size:10px;">[${modifier}]</span>` : '';
        
        const icon = getConditionIcon(key, value);
        return `<span class="condition">${icon}<br>${value.replace('-', ' ').toUpperCase()}${modifierText}</span>`;
    }).join('');

    const oldModal = document.getElementById('arcanum-conjuration-modal');
    if (oldModal) oldModal.remove();

    document.body.appendChild(modal);
    modal.style.display = 'block';

    let typingStart = 0;
    let typingEnd = 0;
    let errors = 0;

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

    modal.querySelector('#conjure-spell').onclick = async () => {
        typingEnd = performance.now();
        const inputWord = input.value.trim().toUpperCase();
        const totalTime = ((typingEnd > typingStart ? typingEnd : performance.now()) - typingStart) / 1000;
        const baseWord = window.ArcanumSpells.getSpellBaseWord(magia.id);
        const result = window.ArcanumSpells.validateConjuration(inputWord, correctWord, totalTime, errors, conditions, baseWord);

        modal.remove();

        let msg = '';
        if (result.success) {
            window.arcanumIudicium.sucesso();
            switch(magiaId) {
                case 'missil-magico':
                    msg = `<span style="color:lime;">Conjuração bem-sucedida! <b>${result.level} dardo(s)</b> lançado(s)! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
                    
                    if (result.level >= 5) {
                        const audio = new Audio('risada1.wav');
                        audio.volume = 0.7;
                        audio.play().catch(e => console.log('Erro ao tocar áudio:', e));
                    }
                    
                    addLogMessage(msg, 500);

                    let totalDamage = 0;
                    for (let i = 0; i < result.level; i++) {
                        totalDamage += rollDice('1d4') + 1;
                    }
                   if (currentMonster) {
    currentMonster.pontosDeEnergia -= totalDamage;
    displayAllMonsterHealthBars();
    await addLogMessage(`Dardos Místicos causaram <b>${totalDamage}</b> de dano!`, 1000);

    if (currentMonster.pontosDeEnergia <= 0) {
        console.log("DEBUG: Monstro morreu:", currentMonster.nome, currentMonster.id);
        console.log("DEBUG: Tentando registrar corpo:", currentMonster.nome, currentMonster.id, "HP:", currentMonster.pontosDeEnergia);
            registerDeadBody(currentMonster); // ← ADICIONAR
        await addLogMessage(`<span style="color: green; font-weight: bold;">${currentMonster.nome} foi derrotado!</span>`, 1000);
        
        // **INÍCIO DA LÓGICA CORRIGIDA**
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            console.log("LOG: Todos os monstros foram derrotados por mísseis mágicos!");
            handlePostBattle(currentMonster);
            return; // Encerra a função aqui
        } else {
            window.currentMonster = monstersAlive[0];
            currentMonster = window.currentMonster;
            await addLogMessage(`Próximo alvo: ${currentMonster.nome}.`, 800);
            updateMonsterInfoUI();
            displayAllMonsterHealthBars();
        }
        // **FIM DA LÓGICA CORRIGIDA**
    }
}
break;
                    
                    case 'cone-glacial':
    const fluidezMult = result.fluency >= 95 ? 4.0 : 
                       result.fluency >= 85 ? 2.0 :
                       result.fluency >= 75 ? 1.5 : 
                       result.fluency >= 60 ? 1.0 : 0.7;
    
    const coneNivelFinal = Math.min(20, Math.floor(result.level * fluidezMult));
    
    msg = `<span style="color:cyan;">Conjuração bem-sucedida! Cone Glacial nível ${coneNivelFinal} (${coneNivelFinal}d4+${coneNivelFinal})! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
    addLogMessage(msg, 500);

    const coneTargets = selectAreaTargets(5);
    let coneDamage = 0;
    for (let i = 0; i < coneNivelFinal; i++) {
        coneDamage += rollDice('1d4') + 1;
    }
    const coneDamageDistribution = distributeAreaDamage(coneDamage, coneTargets);
    
    let coneMonsterDefeated = false;
    await addLogMessage(`O cone glacial atinge ${coneTargets.length} oponente(s)!`, 800);
    
    for (const {monster, damage} of coneDamageDistribution) {
        const resistanceRoll = Math.floor(Math.random() * 20) + 1;
        const resistanceTotal = resistanceRoll + monster.habilidade;
        const difficulty = 20;
        
        await addLogMessage(`${monster.nome} tenta resistir: ${resistanceRoll} + ${monster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 800);
        
        if (resistanceTotal >= difficulty) {
            const reducedDamage = Math.floor(damage / 2);
            monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - reducedDamage);
            await addLogMessage(`${monster.nome} resiste parcialmente: sofre ${reducedDamage} de dano glacial.`, 800);
        } else {
            monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - damage);
            await addLogMessage(`${monster.nome} sofre ${damage} de dano glacial.`, 800);
        }
        
        if (monster.pontosDeEnergia <= 0) coneMonsterDefeated = true;
    }
    
    displayAllMonsterHealthBars();
    
    if (coneMonsterDefeated) {
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
            return;
        } else {
            window.currentMonster = monstersAlive[0];
            currentMonster = window.currentMonster;
            updateMonsterInfoUI();
            displayAllMonsterHealthBars();
        }
    }
    break;


                    
                    case 'flecha-acida-melf':
    msg = `<span style="color:lime;">Conjuração bem-sucedida! Uma flecha ácida nível ${result.level} canalizada! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
    addLogMessage(msg, 500);
    addLogMessage(`Preparando Flecha Ácida de Melf... (1/1 turno)`, 800);
    
    preparingSpells.push({
        turnosRestantes: 1,
        nivel: result.level,
        alvo: currentMonster,
        tipo: 'melf'
    });
    
    // Bloqueia botões
    const actionButtons = document.querySelectorAll('#attack-options button');
    actionButtons.forEach(button => {
        if (button.id !== 'correr-batalha') {
            button.disabled = true;
            button.style.opacity = '0.5';
        }
    });
// Consome a magia
playerMagic -= 8;
atualizarBarraMagia(playerMagic, playerMaxMagic);
await updatePlayerMagicInFirestore(auth.currentUser.uid, playerMagic);
    break;
                    
                    case 'toque-vampirico':
    const nivelVampirico = Math.min(6, result.level); // Máximo 6d6
    
    msg = `<span style="color:lime;">Conjuração bem-sucedida! Toque Vampírico ${nivelVampirico}d6! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
    addLogMessage(msg, 500);

    // Consome a magia do jogador
    playerMagic -= magia.custo;
    atualizarBarraMagia(playerMagic, playerMaxMagic);
    await updatePlayerMagicInFirestore(auth.currentUser.uid, playerMagic);
    
    window.touchVampiricContext = {
        dano: `${nivelVampirico}d6`,
        nome: magia.nome,
        nivel: nivelVampirico,
        userId: auth.currentUser.uid,
        monsterName: getUrlParameter('monstro')
    };
    
    addLogMessage(`Clique em "Atacar" para tentar tocar o inimigo e drenar sua energia vital.`, 800);
    break;

                                    case 'animar-mortos':
                    const necromancyLevel = Math.floor(result.level * 2.5);
                    msg = `<span style="color:lime;">Necromancia nível ${necromancyLevel}!</span>`;
                    addLogMessage(msg, 500);

                        // Consome a magia do jogador
    playerMagic -= magia.custo;
    atualizarBarraMagia(playerMagic, playerMaxMagic);
    await updatePlayerMagicInFirestore(auth.currentUser.uid, playerMagic);

                    
                    const undeadModal = document.createElement('div');
                    undeadModal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#333;padding:20px;border-radius:10px;z-index:1000;';
                    undeadModal.innerHTML = `
                        <h3 style="color:white;">Escolha o tipo:</h3>
                        <button id="animate-skeleton" style="margin:5px;padding:10px;">Esqueletos</button>
                        <button id="animate-zombie" style="margin:5px;padding:10px;">Zumbis</button>
                    `;
                    document.body.appendChild(undeadModal);
                    
                    document.getElementById('animate-skeleton').onclick = () => {
    const result = animateUndead(necromancyLevel, 'skeleton');
    addLogMessage(result.message, 800);
    undeadModal.remove();
    endPlayerTurn();
};

document.getElementById('animate-zombie').onclick = () => {
    const result = animateUndead(necromancyLevel, 'zombie');
    addLogMessage(result.message, 800);
    undeadModal.remove();
    endPlayerTurn();
};
return;


                   case 'relampago':
    const nivelRelampago = result.level * 2;
    const nivelFinal = Math.min(10, nivelRelampago);
    
    msg = `<span style="color:lime;">Conjuração bem-sucedida! Relâmpago nível ${nivelFinal} (${nivelFinal}d6)! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
    addLogMessage(msg, 500);

    // Seleciona até 5 alvos
    const targets = selectAreaTargets(5);
    const relampagoDamage = rollDice(`${nivelFinal}d6`);
    const damageDistribution = distributeAreaDamage(relampagoDamage, targets);
    
    // Sistema de risco crescente (rolagem oculta)
    const riskRoll = Math.floor(Math.random() * 20) + 1;
    const playerTakesDamage = riskRoll <= relampagoRiskCounter;
    
    let monsterDefeated = false;
    
    await addLogMessage(`O relâmpago atinge ${targets.length} oponente(s)!`, 800);
    
    for (const {monster, damage} of damageDistribution) {
        // Teste de resistência para cada monstro
        const resistanceRoll = Math.floor(Math.random() * 20) + 1;
        const resistanceTotal = resistanceRoll + monster.habilidade;
        const difficulty = 20;
        
        await addLogMessage(`${monster.nome} tenta resistir: ${resistanceRoll} + ${monster.habilidade} = ${resistanceTotal} vs ${difficulty}`, 800);
        
        if (resistanceTotal >= difficulty) {
            const reducedDamage = Math.floor(damage / 2);
            monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - reducedDamage);
            await addLogMessage(`${monster.nome} resiste parcialmente: sofre ${reducedDamage} de dano elétrico.`, 800);
        } else {
            monster.pontosDeEnergia = Math.max(0, monster.pontosDeEnergia - damage);
            await addLogMessage(`${monster.nome} sofre ${damage} de dano elétrico.`, 800);
        }
        
        if (monster.pontosDeEnergia <= 0) monsterDefeated = true;
    }
    
    // Verifica se o jogador também recebe dano
    if (playerTakesDamage) {
        const playerDamage = relampagoDamage;
        playerHealth -= playerDamage;
        atualizarBarraHP("barra-hp-jogador", playerHealth, playerMaxHealth);
        await addLogMessage(`<span style="color: red;">⚡ O relâmpago ricocheia! Você também sofre ${playerDamage} de dano elétrico!</span>`, 1200);
        
        // Salva estado do jogador
        const user = auth.currentUser;
        if (user) {
            await updatePlayerEnergyInFirestore(user.uid, playerHealth);
            await saveBattleState(user.uid, battleId, playerHealth);
        }
    }
    
    // Incrementa o contador de risco para o próximo uso
    relampagoRiskCounter = Math.min(20, relampagoRiskCounter + 1);
    
    displayAllMonsterHealthBars();
    
    if (monsterDefeated) {
        const monstersAlive = window.currentMonsters.filter(m => m.pontosDeEnergia > 0);
        if (monstersAlive.length === 0) {
            handlePostBattle(currentMonster);
            return;
        } else {
            window.currentMonster = monstersAlive[0];
            currentMonster = window.currentMonster;
            updateMonsterInfoUI();
            displayAllMonsterHealthBars();
        }
    }
    break;


                case 'toque-chocante':
                    msg = `<span style="color:lime;">Conjuração bem-sucedida! <b>${result.level} toque(s)</b> canalizados! (Precisão: ${result.accuracy.toFixed(1)}%, Fluidez: ${result.fluency.toFixed(1)}%)</span>`;
                    addLogMessage(msg, 500);

                    // --- INÍCIO DA CORREÇÃO ---
                    // Consome a magia do jogador
                    playerMagic -= magia.custo;
                    atualizarBarraMagia(playerMagic, playerMaxMagic);
                    await updatePlayerMagicInFirestore(auth.currentUser.uid, playerMagic);
                    // --- FIM DA CORREÇÃO ---
                    
                    window.touchSpellContext = {
                        dano: '1d6',
                        nome: magia.nome,
                        toques: result.level,
                        userId: auth.currentUser.uid,
                        monsterName: getUrlParameter('monstro')
                    };
                    
                    addLogMessage(`Clique em "Atacar" para tocar o inimigo com ${result.level} descarga(s) elétrica(s).`, 800);
                    break;
            }
        } else {
            window.arcanumIudicium.falha();
            const halfCost = Math.ceil(magia.custo / 2);
            playerMagic -= halfCost;
            atualizarBarraMagia(playerMagic, playerMaxMagic);
            
            msg = `<span style="color:red;">Falha na conjuração (${result.accuracy.toFixed(1)}% precisão)! Você perdeu controle da magia e consumiu ${halfCost} PM.</span>`;
            addLogMessage(msg, 500);
            
            const user = auth.currentUser;
            if (user) {
                updatePlayerMagicInFirestore(user.uid, playerMagic);
                saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
            }
        }
        
        // Só passa o turno se não for toque chocante bem-sucedido
if (!(result.success && (magiaId === 'toque-chocante' || magiaId === 'toque-vampirico' || magiaId === 'animar-mortos'))) {
            endPlayerTurn();
        }
    };

    modal.querySelector('#cancel-conjuration').onclick = () => { modal.remove(); };
    modal.querySelector('#close-conjuration').onclick = () => { modal.remove(); };
}

console.log("LOG: Fim do script batalha.js");
