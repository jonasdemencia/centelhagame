// Interface do Sistema Arcanum Verbis
// Função para criar o painel de condições ambientais
function createArcanumPanel() {
    const panel = document.createElement('div');
    panel.id = 'arcanum-conditions-panel';
    panel.innerHTML = `
        <div class="arcanum-header">
            <h3>⚡ CONDIÇÕES MÁGICAS</h3>
        </div>
        <div class="arcanum-conditions" id="arcanum-conditions-list">
            <!-- Condições serão inseridas aqui -->
        </div>
    `;
    
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
            z-index: 1000;
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
    `;
    document.head.appendChild(style);
    
    return panel;
}

// Função para atualizar o painel com as condições atuais + modificador ao lado
function updateArcanumPanel() {
    const panel = document.getElementById('arcanum-conditions-panel');
    if (!panel) return;

    const conditions = getDynamicConditions(); // USA AS CONDIÇÕES DINÂMICAS
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
        const conditionDiv = document.createElement('div');
        conditionDiv.className = 'arcanum-condition';

        const icon = window.ArcanumConditions.getIcon(condition.key, condition.value);
        const text = condition.value.replace('-', ' ').toUpperCase();

        // Descobre o modificador para aquele valor (se existir)
        let mod = '';
        if (
            modifierMap[condition.key] &&
            typeof modifierMap[condition.key][condition.value] === "string"
        ) {
            mod = modifierMap[condition.key][condition.value];
        }

        // Mostra o modificador ao lado do valor (só para teste/debug)
        conditionDiv.innerHTML = `
            <span class="condition-icon">${icon}</span>
            <span class="condition-text">${text}${mod ? ` <span style="color:#feca57;font-size:10px; font-weight:normal;">[${mod}]</span>` : ''}</span>
        `;

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
function initArcanumPanel() {
    // Verifica se já existe um painel
    if (document.getElementById('arcanum-conditions-panel')) {
        return;
    }
    
    // Cria e adiciona o painel
    const panel = createArcanumPanel();
    document.body.appendChild(panel);
    
    // Atualiza o painel imediatamente
    updateArcanumPanel();
    
    // Atualiza o painel a cada 5 segundos para capturar mudanças de turno
setInterval(updateArcanumPanel, 5000);
}

// Exporta as funções para uso global
window.ArcanumUI = {
    initPanel: initArcanumPanel,
    updatePanel: updateArcanumPanel
};
