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
        // PERÍODOS
        case 'first-vowel-to-i': return word.replace(/[aeiou]/i, 'I');
        case 'a-to-y': return word.replace(/A/gi, 'Y');
        case 'duplicate-last-consonant': 
            const lastChar = word.charAt(word.length - 1);
            return !/[aeiou]/i.test(lastChar) ? word + lastChar : word;
        case 'add-mad': return word + 'MAD';
        
        // ESTAÇÕES
        case 'add-pri': return word + 'PRI';
        case 'e-to-a': return word.replace(/E/gi, 'A');
        case 'add-out': return word + 'OUT';
        case 'o-to-u': return word.replace(/O/gi, 'U');
        
        // VENTOS
        case 'add-n': return word + 'N';
        case 'add-s': return word + 'S';
        case 'add-l': return word + 'L';
        case 'add-o': return word + 'O';
        case 'add-ne': return word + 'NE';
        case 'add-no': return word + 'NO';
        case 'add-se': return word + 'SE';
        case 'add-so': return word + 'SO';
        
        // CLIMAS
        case 'duplicate-first': return word.charAt(0) + word;
        case 'remove-first-vowel': return word.replace(/[aeiou]/i, '');
        case 'add-nub-middle': 
            const mid = Math.floor(word.length / 2);
            return word.slice(0, mid) + 'NUB' + word.slice(mid);
        case 'add-plu': return word + 'PLU';
        case 'vowels-to-u': return word.replace(/[aeiou]/gi, 'U');
        case 'reverse-word': return word.split('').reverse().join('');
        case 'add-neb': return word + 'NEB';
        case 'add-nev': return word + 'NEV';
        case 'add-niv': return word + 'NIV';
        case 'add-gra': return word + 'GRA';
        case 'remove-duplicate-vowels': return word.replace(/([aeiou])\1+/gi, '$1');
        case 'duplicate-vowels': return word.replace(/[aeiou]/gi, match => match + match);
        
        // LUAS
        case 'add-x': return word + 'X';
        case 'add-c': return word + 'C';
        case 'add-f': return word + 'F';
        case 'add-m': return word + 'M';
        
        // TEMPERATURAS
        case 'all-upper': return word.toUpperCase();
        case 'consonants-upper': return word.replace(/[bcdfghjklmnpqrstvwxyz]/gi, match => match.toUpperCase());
        case 'vowels-upper': return word.replace(/[aeiou]/gi, match => match.toUpperCase());
        case 'i-to-y-e-to-a': return word.replace(/I/gi, 'Y').replace(/E/gi, 'A');
        
        // PRESSÃO
        case 'add-alt': return word + 'ALT';
        case 'add-bai': return word + 'BAI';
        
        // EVENTOS
        case 'add-ecl': return word + 'ECL';
        case 'add-met': return word + 'MET';
        case 'add-aur': return word + 'AUR';
        case 'add-sol': return word + 'SOL';
        case 'add-equ': return word + 'EQU';
        
        // ENERGIA MÁGICA
        case 'duplicate-word': return word + word;
        case 'remove-last': return word.slice(0, -1);
        case 'vowels-to-numbers': return word.replace(/[aeiou]/gi, match => {
            const map = {'A': '1', 'E': '2', 'I': '3', 'O': '4', 'U': '5'};
            return map[match.toUpperCase()] || match;
        });
        
        default: return word;
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
    const fluency = calculateFluency(typingTime, errors, correctWord.length);
    
    // Detectar modificadores aplicados corretamente
    const modifiersApplied = detectAppliedModifiers(inputWord, correctWord);
    
    // Calcular multiplicador de fluidez
    let fluencyMultiplier = 1.0;
    if (fluency >= 95) fluencyMultiplier = 1.2;
    else if (fluency >= 80) fluencyMultiplier = 1.1;
    else if (fluency >= 60) fluencyMultiplier = 1.0;
    else if (fluency >= 40) fluencyMultiplier = 0.9;
    else fluencyMultiplier = 0.8;
    
    // Calcular dardos finais
    const baseDarts = modifiersApplied;
    const finalDarts = Math.max(0, Math.floor(baseDarts * fluencyMultiplier));
    
    return {
        success: finalDarts > 0,
        accuracy: modifiersApplied > 0 ? 100 : 0, // Para display
        fluency: fluency,
        level: finalDarts,
        modifiersDetected: modifiersApplied
    };
}

function detectAppliedModifiers(inputWord, correctWord) {
    const conditions = window.ArcanumConditions.getConditions();
    console.log("Condições:", conditions);
    console.log("Palavra digitada:", inputWord);
    console.log("Palavra esperada:", correctWord);
    
    const baseWord = 'FULMEN';
    let modifiersCount = 0;
    
    // Lista de todos os modificadores possíveis
    const allPossibleModifiers = [];
    
    // PERÍODOS DO DIA
    if (conditions.periodo === 'manha') allPossibleModifiers.push({type: 'first-vowel-to-i', result: applyModifier(baseWord, 'first-vowel-to-i')});
    if (conditions.periodo === 'tarde') allPossibleModifiers.push({type: 'a-to-y', result: applyModifier(baseWord, 'a-to-y')});
    if (conditions.periodo === 'noite') allPossibleModifiers.push({type: 'duplicate-last-consonant', result: applyModifier(baseWord, 'duplicate-last-consonant')});
    if (conditions.periodo === 'madrugada') allPossibleModifiers.push({type: 'add-mad', result: applyModifier(baseWord, 'add-mad')});
    
    // ESTAÇÕES
    if (conditions.estacao === 'primavera') allPossibleModifiers.push({type: 'add-pri', result: applyModifier(baseWord, 'add-pri')});
    if (conditions.estacao === 'verao') allPossibleModifiers.push({type: 'e-to-a', result: applyModifier(baseWord, 'e-to-a')});
    if (conditions.estacao === 'outono') allPossibleModifiers.push({type: 'add-out', result: applyModifier(baseWord, 'add-out')});
    if (conditions.estacao === 'inverno') allPossibleModifiers.push({type: 'o-to-u', result: applyModifier(baseWord, 'o-to-u')});
    
    // DIREÇÃO DO VENTO
    if (conditions.vento === 'norte') allPossibleModifiers.push({type: 'add-n', result: applyModifier(baseWord, 'add-n')});
    if (conditions.vento === 'sul') allPossibleModifiers.push({type: 'add-s', result: applyModifier(baseWord, 'add-s')});
    if (conditions.vento === 'leste') allPossibleModifiers.push({type: 'add-l', result: applyModifier(baseWord, 'add-l')});
    if (conditions.vento === 'oeste') allPossibleModifiers.push({type: 'add-o', result: applyModifier(baseWord, 'add-o')});
    
    // CONDIÇÕES CLIMÁTICAS
    if (conditions.clima === 'sol-forte') allPossibleModifiers.push({type: 'duplicate-first', result: applyModifier(baseWord, 'duplicate-first')});
    if (conditions.clima === 'sol-fraco') allPossibleModifiers.push({type: 'remove-first-vowel', result: applyModifier(baseWord, 'remove-first-vowel')});
    if (conditions.clima === 'nublado') allPossibleModifiers.push({type: 'add-nub-middle', result: applyModifier(baseWord, 'add-nub-middle')});
    if (conditions.clima === 'chuva-leve') allPossibleModifiers.push({type: 'add-plu', result: applyModifier(baseWord, 'add-plu')});
    if (conditions.clima === 'chuva-forte') allPossibleModifiers.push({type: 'vowels-to-u', result: applyModifier(baseWord, 'vowels-to-u')});
    if (conditions.clima === 'tempestade') allPossibleModifiers.push({type: 'reverse-word', result: applyModifier(baseWord, 'reverse-word')});
    
    // FASES DA LUA
    if (conditions.lua === 'nova') allPossibleModifiers.push({type: 'add-x', result: applyModifier(baseWord, 'add-x')});
    if (conditions.lua === 'crescente') allPossibleModifiers.push({type: 'add-c', result: applyModifier(baseWord, 'add-c')});
    if (conditions.lua === 'cheia') allPossibleModifiers.push({type: 'add-f', result: applyModifier(baseWord, 'add-f')});
    if (conditions.lua === 'minguante') allPossibleModifiers.push({type: 'add-m', result: applyModifier(baseWord, 'add-m')});
    
    // TEMPERATURA
    if (conditions.temperatura === 'muito-frio') allPossibleModifiers.push({type: 'all-upper', result: applyModifier(baseWord, 'all-upper')});
    if (conditions.temperatura === 'frio') allPossibleModifiers.push({type: 'consonants-upper', result: applyModifier(baseWord, 'consonants-upper')});
    if (conditions.temperatura === 'quente') allPossibleModifiers.push({type: 'vowels-upper', result: applyModifier(baseWord, 'vowels-upper')});
    if (conditions.temperatura === 'muito-quente') allPossibleModifiers.push({type: 'i-to-y-e-to-a', result: applyModifier(baseWord, 'i-to-y-e-to-a')});
    
    // PRESSÃO ATMOSFÉRICA
    if (conditions.pressao === 'alta') allPossibleModifiers.push({type: 'add-alt', result: applyModifier(baseWord, 'add-alt')});
    if (conditions.pressao === 'baixa') allPossibleModifiers.push({type: 'add-bai', result: applyModifier(baseWord, 'add-bai')});
    
    // ENERGIA MÁGICA AMBIENTE
    if (conditions.energiaMagica === 'alta') allPossibleModifiers.push({type: 'duplicate-word', result: applyModifier(baseWord, 'duplicate-word')});
    if (conditions.energiaMagica === 'baixa') allPossibleModifiers.push({type: 'remove-last', result: applyModifier(baseWord, 'remove-last')});
    if (conditions.energiaMagica === 'interferencia') allPossibleModifiers.push({type: 'vowels-to-numbers', result: applyModifier(baseWord, 'vowels-to-numbers')});
    
    // Verificar se a palavra digitada corresponde a algum modificador individual
    for (const modifier of allPossibleModifiers) {
        if (inputWord === modifier.result) {
            console.log(`Modificador detectado: ${modifier.type}`);
            return 1; // Aplicou 1 modificador corretamente
        }
    }
    
    // Se não encontrou modificador individual, verificar combinações (código existente)
    const modifierSteps = generateModifierSteps(baseWord, conditions);
    for (let i = modifierSteps.length - 1; i >= 0; i--) {
        if (inputWord === modifierSteps[i]) {
            return i + 1;
        }
    }
    
    return 0;
}


function generateModifierSteps(baseWord, conditions) {
    const steps = [baseWord];
    let currentWord = baseWord;
    
    const modifiers = [];
    
    // PERÍODOS DO DIA
    if (conditions.periodo === 'manha') modifiers.push({type: 'first-vowel-to-i', order: 1});
    if (conditions.periodo === 'tarde') modifiers.push({type: 'a-to-y', order: 1});
    if (conditions.periodo === 'noite') modifiers.push({type: 'duplicate-last-consonant', order: 1});
    if (conditions.periodo === 'madrugada') modifiers.push({type: 'add-mad', order: 1});
    
    // ESTAÇÕES
    if (conditions.estacao === 'primavera') modifiers.push({type: 'add-pri', order: 2});
    if (conditions.estacao === 'verao') modifiers.push({type: 'e-to-a', order: 2});
    if (conditions.estacao === 'outono') modifiers.push({type: 'add-out', order: 2});
    if (conditions.estacao === 'inverno') modifiers.push({type: 'o-to-u', order: 2});
    
    // DIREÇÃO DO VENTO
    if (conditions.vento === 'norte') modifiers.push({type: 'add-n', order: 3});
    if (conditions.vento === 'sul') modifiers.push({type: 'add-s', order: 3});
    if (conditions.vento === 'leste') modifiers.push({type: 'add-l', order: 3});
    if (conditions.vento === 'oeste') modifiers.push({type: 'add-o', order: 3});
    if (conditions.vento === 'nordeste') modifiers.push({type: 'add-ne', order: 3});
    if (conditions.vento === 'noroeste') modifiers.push({type: 'add-no', order: 3});
    if (conditions.vento === 'sudeste') modifiers.push({type: 'add-se', order: 3});
    if (conditions.vento === 'sudoeste') modifiers.push({type: 'add-so', order: 3});
    
    // CONDIÇÕES CLIMÁTICAS
    if (conditions.clima === 'sol-forte') modifiers.push({type: 'duplicate-first', order: 4});
    if (conditions.clima === 'sol-fraco') modifiers.push({type: 'remove-first-vowel', order: 4});
    if (conditions.clima === 'nublado') modifiers.push({type: 'add-nub-middle', order: 4});
    if (conditions.clima === 'chuva-leve') modifiers.push({type: 'add-plu', order: 4});
    if (conditions.clima === 'chuva-forte') modifiers.push({type: 'vowels-to-u', order: 4});
    if (conditions.clima === 'tempestade') modifiers.push({type: 'reverse-word', order: 4});
    if (conditions.clima === 'neblina') modifiers.push({type: 'add-neb', order: 4});
    if (conditions.clima === 'nevoa') modifiers.push({type: 'add-nev', order: 4});
    if (conditions.clima === 'neve') modifiers.push({type: 'add-niv', order: 4});
    if (conditions.clima === 'granizo') modifiers.push({type: 'add-gra', order: 4});
    if (conditions.clima === 'seco') modifiers.push({type: 'remove-duplicate-vowels', order: 4});
    if (conditions.clima === 'umido') modifiers.push({type: 'duplicate-vowels', order: 4});
    
    // FASES DA LUA
    if (conditions.lua === 'nova') modifiers.push({type: 'add-x', order: 5});
    if (conditions.lua === 'crescente') modifiers.push({type: 'add-c', order: 5});
    if (conditions.lua === 'cheia') modifiers.push({type: 'add-f', order: 5});
    if (conditions.lua === 'minguante') modifiers.push({type: 'add-m', order: 5});
    
    // TEMPERATURA
    if (conditions.temperatura === 'muito-frio') modifiers.push({type: 'all-upper', order: 6});
    if (conditions.temperatura === 'frio') modifiers.push({type: 'consonants-upper', order: 6});
    if (conditions.temperatura === 'quente') modifiers.push({type: 'vowels-upper', order: 6});
    if (conditions.temperatura === 'muito-quente') modifiers.push({type: 'i-to-y-e-to-a', order: 6});
    
    // PRESSÃO ATMOSFÉRICA
    if (conditions.pressao === 'alta') modifiers.push({type: 'add-alt', order: 7});
    if (conditions.pressao === 'baixa') modifiers.push({type: 'add-bai', order: 7});
    
    // EVENTOS ESPECIAIS
    if (conditions.eventoEspecial === 'eclipse-solar') modifiers.push({type: 'reverse-word', order: 8});
    if (conditions.eventoEspecial === 'eclipse-lunar') modifiers.push({type: 'add-ecl', order: 8});
    if (conditions.eventoEspecial === 'chuva-meteoros') modifiers.push({type: 'add-met', order: 8});
    if (conditions.eventoEspecial === 'aurora-boreal') modifiers.push({type: 'add-aur', order: 8});
    if (conditions.eventoEspecial === 'solsticio') modifiers.push({type: 'add-sol', order: 8});
    if (conditions.eventoEspecial === 'equinocio') modifiers.push({type: 'add-equ', order: 8});
    
    // ENERGIA MÁGICA AMBIENTE
    if (conditions.energiaMagica === 'alta') modifiers.push({type: 'duplicate-word', order: 9});
    if (conditions.energiaMagica === 'baixa') modifiers.push({type: 'remove-last', order: 9});
    if (conditions.energiaMagica === 'interferencia') modifiers.push({type: 'vowels-to-numbers', order: 9});
    
    // Ordenar e aplicar
    modifiers.sort((a, b) => a.order - b.order);
    
    for (const modifier of modifiers) {
        currentWord = applyModifier(currentWord, modifier.type);
        steps.push(currentWord);
        
        // REGRAS ESPECIAIS
        if (currentWord.length > 10) currentWord += 'R';
        if (currentWord.length < 5) currentWord += 'EX';
    }
    
    return steps;
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
