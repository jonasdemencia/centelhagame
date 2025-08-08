// Interface do Sistema Arcanum Verbis

// Sistema de Condições Dinâmicas - ADICIONAR NO INÍCIO DO ARQUIVO
window.arcanumTurnCounter = window.arcanumTurnCounter || 0;
window.arcanumBaseConditions = window.arcanumBaseConditions || null;

// Função para obter ícones das condições (cópia local)
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


const CONDITION_STABILITY = {
    periodo: { changeChance: 0.05 },
    estacao: { changeChance: 0.02 },
    vento: { changeChance: 0.30 },
    clima: { changeChance: 0.25 },
    energiaMagica: { changeChance: 0.35 },
    temperatura: { changeChance: 0.15 },
    pressao: { changeChance: 0.20 },
    lua: { changeChance: 0.10 }
};

const CONDITION_OPTIONS = {
    periodo: ['manha', 'tarde', 'noite', 'madrugada'],
    estacao: ['primavera', 'verao', 'outono', 'inverno'],
    vento: ['norte', 'sul', 'leste', 'oeste'],
    clima: ['sol-forte', 'sol-fraco', 'nublado', 'chuva-leve'],
    temperatura: ['muito-frio', 'frio', 'quente', 'muito-quente'],
    pressao: ['alta', 'baixa'],
    lua: ['nova', 'crescente', 'cheia', 'minguante'],
    energiaMagica: ['alta', 'baixa', 'interferencia']
};

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function getCurrentConditions() {
    // Usa as condições globais do sistema Arcanum
    if (typeof getArcanumConditions === 'function') {
        return await getArcanumConditions();
    }
    
    // Fallback se não conseguir carregar
    return {
        periodo: 'tarde', estacao: 'inverno', vento: 'norte', clima: 'nublado',
        lua: 'cheia', temperatura: 'frio', pressao: 'alta', energiaMagica: 'normal'
    };
}

// Verifica se estamos próximos de uma mudança (turno 2 de 3)
function isNearChange() {
    return window.arcanumTurnCounter % 3 === 2;
}

// Adiciona classe de pulsação para condições que podem mudar
function addPulseToChangingConditions(conditionDiv, conditionKey) {
    if (isNearChange()) {
        const changeChance = CONDITION_STABILITY[conditionKey]?.changeChance || 0;
        // Se a chance de mudança for > 20%, adiciona pulsação
        if (changeChance > 0.20) {
            conditionDiv.classList.add('condition-changing');
        }
    }
}

// Função para criar o painel de condições ambientais
function createArcanumPanel() {
    const panel = document.createElement('div');
    panel.id = 'arcanum-conditions-panel';
        panel.innerHTML = `
        <div class="arcanum-header" id="arcanum-header" style="cursor: pointer;">
            <h3>⚡ CONDIÇÕES MÁGICAS <span id="toggle-arrow">▼</span></h3>
        </div>
        <div class="arcanum-conditions" id="arcanum-conditions-list">
            <!-- Condições serão inseridas aqui -->
        </div>
    `;
    
    // Adiciona evento de clique para recolher/expandir
    panel.addEventListener('click', function(e) {
        if (e.target.closest('.arcanum-header')) {
            const conditionsList = document.getElementById('arcanum-conditions-list');
            const arrow = document.getElementById('toggle-arrow');
            
            if (conditionsList.style.display === 'none') {
                conditionsList.style.display = 'block';
                arrow.textContent = '▼';
            } else {
                conditionsList.style.display = 'none';
                arrow.textContent = '▶';
            }
        }
    });

    
    // Adiciona CSS inline para o painel
    const style = document.createElement('style');
    style.textContent = `
        #arcanum-conditions-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 250px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #4a90e2;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
            font-family: 'Arial', sans-serif;
            color: #ffffff;
            z-index: 500;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .arcanum-header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #4a90e2;
            padding-bottom: 10px;
        }
        
        .arcanum-header h3 {
            margin: 0;
            color: #4a90e2;
            font-size: 16px;
            text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
        }
        
        .arcanum-condition {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            transition: background 0.3s ease;
        }
        
        .arcanum-condition:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .condition-icon {
            font-size: 18px;
            margin-right: 10px;
            min-width: 25px;
        }
        
        .condition-text {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .condition-special {
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .condition-changing {
            animation: changePulse 1s ease-in-out 2;
            border: 1px solid #ff6b6b !important;
        }
        
        @keyframes changePulse {
            0%, 100% { 
                background: rgba(255, 255, 255, 0.1);
                box-shadow: 0 0 5px rgba(255, 107, 107, 0.3);
            }
            50% { 
                background: rgba(255, 107, 107, 0.3);
                box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
            }
        }
    `;
    document.head.appendChild(style);
    
    return panel;
}

// Função para atualizar o painel com as condições atuais + modificador ao lado
async function updateArcanumPanel() {
    const panel = document.getElementById('arcanum-conditions-panel');
    if (!panel) return;

    const conditions = await getCurrentConditions(); // ADICIONAR AWAIT AQUI
    const conditionsList = document.getElementById('arcanum-conditions-list');

    conditionsList.innerHTML = '';

    // Mapeamento de condição para modificador
    const modifierMap = {
        // PERÍODOS DO DIA
        periodo: {
            manha: 'first-vowel-to-i',
            tarde: 'a-to-y',
            noite: 'duplicate-last-consonant',
            madrugada: 'add-mad'
        },
        // ESTAÇÕES
        estacao: {
            primavera: 'add-pri',
            verao: 'e-to-a',
            outono: 'add-out',
            inverno: 'o-to-u'
        },
        // VENTOS
        vento: {
            norte: 'add-n',
            sul: 'add-s',
            leste: 'add-l',
            oeste: 'add-o',
            nordeste: 'add-ne',
            noroeste: 'add-no',
            sudeste: 'add-se',
            sudoeste: 'add-so'
        },
        // CLIMAS
        clima: {
            'sol-forte': 'duplicate-first',
            'sol-fraco': 'remove-first-vowel',
            nublado: 'add-nub-middle',
            'chuva-leve': 'add-plu',
            'chuva-forte': 'vowels-to-u',
            tempestade: 'reverse-word',
            neblina: 'add-neb',
            nevoa: 'add-nev',
            neve: 'add-niv',
            granizo: 'add-gra',
            seco: 'remove-duplicate-vowels',
            umido: 'duplicate-vowels'
        },
        // LUAS
        lua: {
            nova: 'add-x',
            crescente: 'add-c',
            cheia: 'add-f',
            minguante: 'add-m'
        },
        // TEMPERATURA
        temperatura: {
            'muito-frio': 'all-upper',
            frio: 'consonants-upper',
            quente: 'vowels-upper',
            'muito-quente': 'i-to-y-e-to-a'
        },
        // PRESSÃO
        pressao: {
            alta: 'add-alt',
            baixa: 'add-bai'
        },
        // ENERGIA MÁGICA
        energiaMagica: {
            alta: 'duplicate-word',
            baixa: 'remove-last',
            interferencia: 'vowels-to-numbers'
        }
    };

    // Adiciona cada condição ao painel
    const conditionsToShow = [
        { key: 'periodo', label: 'PERÍODO', value: conditions.periodo },
        { key: 'estacao', label: 'ESTAÇÃO', value: conditions.estacao },
        { key: 'vento', label: 'VENTO', value: conditions.vento },
        { key: 'clima', label: 'CLIMA', value: conditions.clima },
        { key: 'lua', label: 'LUA', value: conditions.lua },
        { key: 'temperatura', label: 'TEMP', value: conditions.temperatura },
        { key: 'pressao', label: 'PRESSÃO', value: conditions.pressao },
        { key: 'energiaMagica', label: 'ENERGIA', value: conditions.energiaMagica }
    ];

    conditionsToShow.forEach(condition => {
        if (!condition.value) return; // PULA SE VALOR FOR UNDEFINED
        
        const conditionDiv = document.createElement('div');
        conditionDiv.className = 'arcanum-condition';

        const icon = getConditionIcon(condition.key, condition.value);
        const text = condition.value.replace('-', ' ').toUpperCase();

        // Descobre o modificador para aquele valor (se existir)
        let mod = '';
        if (
            modifierMap[condition.key] &&
            typeof modifierMap[condition.key][condition.value] === "string"
        ) {
            mod = modifierMap[condition.key][condition.value];
        }

        // Mostra o modificador ao lado do valor
        conditionDiv.innerHTML = `
            <span class="condition-icon">${icon}</span>
            <span class="condition-text">${text}${mod ? ` <span style="color:#feca57;font-size:10px; font-weight:normal;">[${mod}]</span>` : ''}</span>
        `;

        // Adiciona pulsação se a condição está para mudar
        addPulseToChangingConditions(conditionDiv, condition.key);

        conditionsList.appendChild(conditionDiv);
    });

    // Adiciona evento especial se existir
    if (conditions.eventoEspecial) {
        // Mapeamento de eventos para modificadores
        const eventModifierMap = {
            'eclipse-solar': 'reverse-word',
            'eclipse-lunar': 'add-ecl',
            'chuva-meteoros': 'add-met',
            'aurora-boreal': 'add-aur',
            'solsticio': 'add-sol',
            'equinocio': 'add-equ'
        };
        const mod = eventModifierMap[conditions.eventoEspecial] || '';
        const specialDiv = document.createElement('div');
        specialDiv.className = 'arcanum-condition condition-special';
        specialDiv.innerHTML = `
            <span class="condition-icon">🌟</span>
            <span class="condition-text">${conditions.eventoEspecial.replace('-', ' ').toUpperCase()}${mod ? ` <span style="color:#feca57;font-size:10px; font-weight:normal;">[${mod}]</span>` : ''}</span>
        `;
        conditionsList.appendChild(specialDiv);
    }
}

// Função para inicializar o painel na página de batalha
async function initArcanumPanel() {
    // Verifica se já existe um painel
    if (document.getElementById('arcanum-conditions-panel')) {
        return;
    }
    
    // Cria e adiciona o painel
    const panel = createArcanumPanel();
    document.body.appendChild(panel);
    
    // Atualiza o painel imediatamente
    await updateArcanumPanel();
    
    // Atualiza o painel a cada 30 segundos para capturar mudanças mais rápidas
setInterval(async () => {
    await updateArcanumPanel();
}, 30000); // 30 segundos em vez de 5 segundos

}

// Exporta as funções para uso global
window.ArcanumUI = {
    initPanel: initArcanumPanel,
    updatePanel: updateArcanumPanel
};


