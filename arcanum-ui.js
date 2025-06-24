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

// Função para atualizar o painel com as condições atuais
function updateArcanumPanel() {
    const panel = document.getElementById('arcanum-conditions-panel');
    if (!panel) return;
    
    const conditions = window.ArcanumConditions.getConditions();
    const conditionsList = document.getElementById('arcanum-conditions-list');
    
    conditionsList.innerHTML = '';
    
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
        
        conditionDiv.innerHTML = `
            <span class="condition-icon">${icon}</span>
            <span class="condition-text">${text}</span>
        `;
        
        conditionsList.appendChild(conditionDiv);
    });
    
    // Adiciona evento especial se existir
    if (conditions.eventoEspecial) {
        const specialDiv = document.createElement('div');
        specialDiv.className = 'arcanum-condition condition-special';
        specialDiv.innerHTML = `
            <span class="condition-icon">🌟</span>
            <span class="condition-text">${conditions.eventoEspecial.replace('-', ' ').toUpperCase()}</span>
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
    
    // Atualiza o painel a cada minuto
    setInterval(updateArcanumPanel, 60000);
}

// Função para criar modal de conjuração
function createConjurationModal() {
    const modal = document.createElement('div');
    modal.id = 'arcanum-conjuration-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="conjuration-container">
                <div class="conjuration-header">
                    <h2>⚡ CONJURAÇÃO - TOQUE CHOCANTE</h2>
                    <button class="close-conjuration" id="close-conjuration">×</button>
                </div>
                
                <div class="conjuration-info">
                    <div class="spell-info">
                        <p><strong>Palavra Base:</strong> FULGOR</p>
                        <p><strong>Sequência:</strong> ↑↑↑↓</p>
                    </div>
                </div>
                
                <div class="conjuration-input">
                    <div class="directional-input">
                        <label>Sequência Direcional:</label>
                        <input type="text" id="directional-sequence" placeholder="↑↑↑↓" maxlength="10">
                    </div>
                    
                    <div class="word-input">
                        <label>Palavra Modificada:</label>
                        <input type="text" id="conjuration-word" placeholder="Digite a palavra..." maxlength="50">
                    </div>
                </div>
                
                <div class="conjuration-actions">
                    <button id="conjure-spell" class="conjure-btn">🔮 CONJURAR</button>
                    <button id="cancel-conjuration" class="cancel-btn">Cancelar</button>
                </div>
            </div>
        </div>
    `;

        // CSS para o modal
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        #arcanum-conjuration-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .conjuration-container {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #4a90e2;
            border-radius: 15px;
            padding: 20px;
            max-width: 400px;
            width: 90%;
            color: white;
            box-shadow: 0 10px 30px rgba(74, 144, 226, 0.3);
        }
        
        .conjuration-header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #4a90e2;
            padding-bottom: 10px;
        }
        
        .conjuration-header h2 {
            margin: 0;
            color: #4a90e2;
            font-size: 18px;
        }
        
        .close-conjuration {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: #ff6b6b;
            font-size: 24px;
            cursor: pointer;
        }
        
        .conjuration-input {
            margin: 15px 0;
        }
        
        .conjuration-input label {
            display: block;
            margin-bottom: 5px;
            color: #4a90e2;
            font-weight: bold;
        }
        
        .conjuration-input input {
            width: 100%;
            padding: 8px;
            border: 1px solid #4a90e2;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 16px;
        }
        
        .conjuration-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .conjure-btn, .cancel-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .conjure-btn {
            background: linear-gradient(45deg, #4a90e2, #357abd);
            color: white;
        }
        
        .cancel-btn {
            background: #6c757d;
            color: white;
        }
    `;
    document.head.appendChild(modalStyle);

    
    return modal;
}


// Exporta as funções para uso global
window.ArcanumUI = {
    initPanel: initArcanumPanel,
    updatePanel: updateArcanumPanel,
    createConjurationModal: createConjurationModal
};

