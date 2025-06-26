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

function validateConjuration(inputWord, correctWord, typingTime, errors, conditions, baseWord) {
    const fluency = calculateFluency(typingTime, errors, correctWord.length);

    // Detectar modificadores aplicados corretamente
    const modifiersApplied = detectAppliedModifiers(inputWord, conditions, baseWord);

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

/**
 * Detecta quantos modificadores corretos o jogador aplicou na palavra digitada,
 * considerando sensibilidade a maiúsculas/minúsculas APENAS nos modificadores que exigem isso.
 * 
 * @param {string} inputWord Palavra digitada pelo jogador (como está no input)
 * @param {object} conditions Objeto com as condições ambientais/atuais
 * @param {string} baseWord Palavra base da magia (ex: "FULMEN")
 * @returns {number} Quantidade de modificadores corretos aplicados
 */
function detectAppliedModifiers(inputWord, conditions, baseWord = 'FULMEN') {
    let count = 0;
    const inputUpper = inputWord.toUpperCase();
    const baseUpper = baseWord.toUpperCase();
    const baseLower = baseWord.toLowerCase();

    // 1. PERÍODOS DO DIA
    if (conditions.periodo === 'manha') {
        // Primeira vogal -> I (case-insensitive)
        let mod = baseUpper.replace(/[AEIOU]/, 'I');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.periodo === 'tarde') {
        // A -> Y (case-insensitive)
        let mod = baseUpper.replace(/A/g, 'Y');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.periodo === 'noite') {
        // Duplica última consoante (case-insensitive)
        let last = baseUpper.match(/[^AEIOU]$/i);
        let mod = last ? baseUpper + last[0] : baseUpper;
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.periodo === 'madrugada') {
        // +MAD no final (case-insensitive)
        if (inputUpper.endsWith('MAD')) count++;
    }

    // 2. ESTAÇÕES
    if (conditions.estacao === 'primavera') {
        if (inputUpper.endsWith('PRI')) count++;
    }
    if (conditions.estacao === 'verao') {
        // E -> A (case-insensitive)
        let mod = baseUpper.replace(/E/g, 'A');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.estacao === 'outono') {
        if (inputUpper.endsWith('OUT')) count++;
    }
    if (conditions.estacao === 'inverno') {
        // O -> U (case-insensitive)
        let mod = baseUpper.replace(/O/g, 'U');
        if (inputUpper.includes(mod)) count++;
    }

    // 3. DIREÇÃO DO VENTO (case-insensitive)
    if (conditions.vento === 'norte' && inputUpper.endsWith('N')) count++;
    if (conditions.vento === 'sul' && inputUpper.endsWith('S')) count++;
    if (conditions.vento === 'leste' && inputUpper.endsWith('L')) count++;
    if (conditions.vento === 'oeste' && inputUpper.endsWith('O')) count++;
    if (conditions.vento === 'nordeste' && inputUpper.endsWith('NE')) count++;
    if (conditions.vento === 'noroeste' && inputUpper.endsWith('NO')) count++;
    if (conditions.vento === 'sudeste' && inputUpper.endsWith('SE')) count++;
    if (conditions.vento === 'sudoeste' && inputUpper.endsWith('SO')) count++;

    // 4. CONDIÇÕES CLIMÁTICAS
    if (conditions.clima === 'sol-forte') {
        // Duplica primeira letra (case-insensitive)
        if (inputUpper.startsWith(baseUpper[0] + baseUpper)) count++;
    }
    if (conditions.clima === 'sol-fraco') {
        // Remove primeira vogal (case-insensitive)
        let mod = baseUpper.replace(/[AEIOU]/, '');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.clima === 'nublado') {
        // +NUB no meio (case-insensitive)
        let mid = Math.floor(baseUpper.length / 2);
        let mod = baseUpper.slice(0, mid) + 'NUB' + baseUpper.slice(mid);
        if (inputUpper.includes('NUB')) count++;
    }
    if (conditions.clima === 'chuva-leve') {
        if (inputUpper.endsWith('PLU')) count++;
    }
    if (conditions.clima === 'chuva-forte') {
        // Todas vogais -> U (case-insensitive)
        let mod = baseUpper.replace(/[AEIOU]/g, 'U');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.clima === 'tempestade') {
        // Palavra invertida (case-insensitive)
        let mod = baseUpper.split('').reverse().join('');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.clima === 'neblina' && inputUpper.endsWith('NEB')) count++;
    if (conditions.clima === 'nevoa' && inputUpper.endsWith('NEV')) count++;
    if (conditions.clima === 'neve' && inputUpper.endsWith('NIV')) count++;
    if (conditions.clima === 'granizo' && inputUpper.endsWith('GRA')) count++;
    if (conditions.clima === 'seco') {
        // Remove todas vogais duplicadas (ex: AA -> A) (case-insensitive)
        let mod = baseUpper.replace(/([AEIOU])\1+/g, '$1');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.clima === 'umido') {
        // Duplica todas vogais (case-insensitive)
        let mod = baseUpper.replace(/[AEIOU]/g, v => v + v);
        if (inputUpper.includes(mod)) count++;
    }

    // 5. FASES DA LUA (case-insensitive)
    if (conditions.lua === 'nova' && inputUpper.endsWith('X')) count++;
    if (conditions.lua === 'crescente' && inputUpper.endsWith('C')) count++;
    if (conditions.lua === 'cheia' && inputUpper.endsWith('F')) count++;
    if (conditions.lua === 'minguante' && inputUpper.endsWith('M')) count++;

    // 6. TEMPERATURA (SENSÍVEL A MAIÚSCULAS/MINÚSCULAS)
    if (conditions.temperatura === 'muito-frio') {
        // Todas letras maiúsculas (não aceitar tudo minúsculo!)
        if (inputWord === inputWord.toUpperCase() && inputWord !== inputWord.toLowerCase()) count++;
    }
    if (conditions.temperatura === 'frio') {
        // Consoantes maiúsculas, vogais minúsculas
        let esperado = '';
        for (const l of baseWord) {
            if ('bcdfghjklmnpqrstvwxyz'.includes(l.toLowerCase())) {
                esperado += l.toUpperCase();
            } else if ('aeiou'.includes(l.toLowerCase())) {
                esperado += l.toLowerCase();
            } else {
                esperado += l;
            }
        }
        if (inputWord === esperado) count++;
    }
    if (conditions.temperatura === 'quente') {
        // Vogais maiúsculas, consoantes minúsculas
        let esperado = '';
        for (const l of baseWord) {
            if ('aeiou'.includes(l.toLowerCase())) {
                esperado += l.toUpperCase();
            } else if ('bcdfghjklmnpqrstvwxyz'.includes(l.toLowerCase())) {
                esperado += l.toLowerCase();
            } else {
                esperado += l;
            }
        }
        if (inputWord === esperado) count++;
    }
    if (conditions.temperatura === 'muito-quente') {
        // I -> Y, E -> A (case-insensitive)
        let mod = baseUpper.replace(/I/g, 'Y').replace(/E/g, 'A');
        if (inputUpper.includes(mod)) count++;
    }

    // 7. PRESSÃO ATMOSFÉRICA (case-insensitive)
    if (conditions.pressao === 'alta' && inputUpper.endsWith('ALT')) count++;
    if (conditions.pressao === 'baixa' && inputUpper.endsWith('BAI')) count++;

    // 8. EVENTOS ESPECIAIS (case-insensitive)
    if (conditions.eventoEspecial === 'eclipse-solar') {
        let mod = baseUpper.split('').reverse().join('');
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.eventoEspecial === 'eclipse-lunar' && inputUpper.endsWith('ECL')) count++;
    if (conditions.eventoEspecial === 'chuva-meteoros' && inputUpper.endsWith('MET')) count++;
    if (conditions.eventoEspecial === 'aurora-boreal' && inputUpper.endsWith('AUR')) count++;
    if (conditions.eventoEspecial === 'solsticio' && inputUpper.endsWith('SOL')) count++;
    if (conditions.eventoEspecial === 'equinocio' && inputUpper.endsWith('EQU')) count++;

    // 9. ENERGIA MÁGICA AMBIENTE
    if (conditions.energiaMagica === 'alta') {
        let mod = baseUpper + baseUpper;
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.energiaMagica === 'baixa') {
        let mod = baseUpper.slice(0, -1);
        if (inputUpper.includes(mod)) count++;
    }
    if (conditions.energiaMagica === 'interferencia') {
        // Substitui vogais por números (A=1, E=2, I=3, O=4, U=5) (case-insensitive)
        let mod = baseUpper.replace(/A/gi, '1').replace(/E/gi, '2').replace(/I/gi, '3').replace(/O/gi, '4').replace(/U/gi, '5');
        if (inputUpper.includes(mod)) count++;
    }

    // 10. LOCALIZAÇÃO/AMBIENTE (implemente conforme necessário)

    // REGRAS ESPECIAIS (case-insensitive)
    if (inputUpper.length > 10 && inputUpper.endsWith('R')) count++;
    if (inputUpper.length < 5 && inputUpper.endsWith('EX')) count++;

    return count;
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
