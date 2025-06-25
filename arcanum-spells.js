// Sistema Arcanum Verbis - Modificadores de Palavras Mágicas

// Palavras base das magias
function getSpellBaseWord(spellId) {
    const baseWords = {
        'missil-magico': 'FULMEN',
        'toque-chocante': 'FULGOR', 
        'luz': 'LUMINA',
        'cura-menor': 'SANITAS',
        'escudo-arcano': 'AEGIS'
    };
    return baseWords[spellId] || 'ARCANUM';
}

// Aplicar modificadores à palavra base
function applyArcanumModifiers(baseWord, conditions) {
    let modifiedWord = baseWord;
    
    // Aplicar modificadores em ordem alfabética
    const modifiers = [];
    
    // Coletar todos os modificadores aplicáveis
    if (conditions.clima === 'sol-forte') modifiers.push({type: 'duplicate-first', order: 1});
    if (conditions.periodo === 'tarde') modifiers.push({type: 'a-to-y', order: 2});
    if (conditions.estacao === 'outono') modifiers.push({type: 'add-out', order: 3});
    if (conditions.energiaMagica === 'baixa') modifiers.push({type: 'remove-last', order: 4});
    if (conditions.vento === 'sul') modifiers.push({type: 'add-s', order: 5});
    if (conditions.lua === 'crescente') modifiers.push({type: 'add-c', order: 6});
    if (conditions.pressao === 'alta') modifiers.push({type: 'add-alt', order: 7});
    if (conditions.temperatura === 'quente') modifiers.push({type: 'vowels-upper', order: 8});
    
    // Aplicar modificadores em ordem
    modifiers.sort((a, b) => a.order - b.order);
    
    for (const modifier of modifiers) {
        modifiedWord = applyModifier(modifiedWord, modifier.type);
    }
    
    return modifiedWord;
}

function applyModifier(word, type) {
    switch(type) {
        case 'duplicate-first':
            return word.charAt(0) + word;
        case 'a-to-y':
            return word.replace(/A/gi, 'Y');
        case 'add-out':
            return word + 'OUT';
        case 'remove-last':
            return word.slice(0, -1);
        case 'add-s':
            return word + 'S';
        case 'add-c':
            return word + 'C';
        case 'add-alt':
            return word + 'ALT';
        case 'vowels-upper':
            return word.replace(/[aeiou]/gi, match => match.toUpperCase());
        default:
            return word;
    }
}

// Criar modal de conjuração Arcanum
function createArcanumConjurationModal(spell) {
    const conditions = window.ArcanumConditions.getConditions();
    const baseWord = getSpellBaseWord(spell.id);
    const correctWord = applyArcanumModifiers(baseWord, conditions);
    
    const modal = document.createElement('div');
    modal.id = 'arcanum-conjuration-modal';
    modal.innerHTML = `
        <div class="modal-content arcanum-modal">
            <span class="close-modal" id="close-conjuration">&times;</span>
            <h3>Conjuração Arcanum: ${spell.nome}</h3>
            <div class="conditions-display">
                ${Object.entries(conditions).map(([key, value]) => 
                    value ? `<span class="condition">${window.ArcanumConditions.getIcon(key, value)} ${value.replace('-', ' ').toUpperCase()}</span>` : ''
                ).join('')}
            </div>
            <div class="spell-levels">
                <button class="level-btn" data-level="1">Simples (1 dardo)</button>
                <button class="level-btn" data-level="2">Nível 2 (2 dardos)</button>
                <button class="level-btn" data-level="3">Nível 3 (3 dardos)</button>
                <button class="level-btn" data-level="4">Nível 4 (4 dardos)</button>
                <button class="level-btn" data-level="5">Extraordinário (5 dardos)</button>
            </div>
            <div class="conjuration-input">
                <input type="text" id="conjuration-word" placeholder="Digite a palavra mágica..." maxlength="50">
                <div class="time-display">Tempo: <span id="conjuration-timer">0.0s</span></div>
            </div>
            <div class="modal-buttons">
                <button id="conjure-spell">Conjurar</button>
                <button id="cancel-conjuration">Cancelar</button>
            </div>
        </div>
    `;
    
    // CSS para o modal
    const style = document.createElement('style');
    style.textContent = `
        #arcanum-conjuration-modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
        }
        .arcanum-modal {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            margin: 5% auto;
            padding: 20px;
            border: 2px solid #4a90e2;
            border-radius: 10px;
            width: 80%;
            max-width: 500px;
            color: white;
            text-align: center;
        }
        .conditions-display {
            margin: 15px 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
        }
        .condition {
            background: rgba(74, 144, 226, 0.2);
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
        }
        .spell-levels {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .level-btn {
            padding: 10px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .level-btn:hover {
            background: #357abd;
        }
        .level-btn.selected {
            background: #ff6b6b;
        }
        .conjuration-input {
            margin: 20px 0;
        }
        #conjuration-word {
            width: 100%;
            padding: 15px;
            font-size: 18px;
            text-align: center;
            border: 2px solid #4a90e2;
            border-radius: 5px;
            background: rgba(255,255,255,0.1);
            color: white;
        }
        .time-display {
            margin-top: 10px;
            font-size: 14px;
            color: #4a90e2;
        }
        .modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .modal-buttons button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        #conjure-spell {
            background: #28a745;
            color: white;
        }
        #cancel-conjuration {
            background: #dc3545;
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    return {modal, correctWord, conditions};
}

function validateConjuration(inputWord, correctWord, typingTime, errors) {
    const accuracy = calculateAccuracy(inputWord, correctWord);
    const fluency = calculateFluency(typingTime, errors, correctWord.length);
    
    // Requisitos por nível
    const requirements = {
        5: {accuracy: 98, fluency: 90},
        4: {accuracy: 96, fluency: 80},
        3: {accuracy: 94, fluency: 70},
        2: {accuracy: 92, fluency: 60},
        1: {accuracy: 90, fluency: 0}
    };
    
    // Encontra o maior nível que o jogador consegue atingir
    let achievedLevel = 0;
    for (let level = 5; level >= 1; level--) {
        const req = requirements[level];
        if (accuracy >= req.accuracy && fluency >= req.fluency) {
            achievedLevel = level;
            break;
        }
    }
    
    return {
        success: achievedLevel > 0,
        accuracy,
        fluency,
        level: achievedLevel
    };
}



function calculateAccuracy(input, correct) {
    if (input === correct) return 100;
    
    const distance = levenshteinDistance(input, correct);
    const maxLength = Math.max(input.length, correct.length);
    return Math.max(0, (1 - distance / maxLength) * 100);
}

function calculateFluency(time, errors, wordLength) {
    const idealTime = wordLength * 0.2; // 200ms por caractere
    const timeScore = Math.max(0, 100 - (time - idealTime) * 2);
    const errorPenalty = errors * 10;
    return Math.max(0, timeScore - errorPenalty);
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

// Exportar funções globalmente
window.ArcanumSpells = {
    getSpellBaseWord,
    applyArcanumModifiers,
    createArcanumConjurationModal,
    validateConjuration
};
