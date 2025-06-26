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

// Aplica TODOS os modificadores possíveis à palavra base, na ordem correta e de acordo com as condições
function applyArcanumModifiers(baseWord, conditions) {
    let modifiedWord = baseWord;
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

    // CLIMAS
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

    // LUAS
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

    // ENERGIA MÁGICA
    if (conditions.energiaMagica === 'alta') modifiers.push({type: 'duplicate-word', order: 9});
    if (conditions.energiaMagica === 'baixa') modifiers.push({type: 'remove-last', order: 9});
    if (conditions.energiaMagica === 'interferencia') modifiers.push({type: 'vowels-to-numbers', order: 9});

    // Ordena e aplica
    modifiers.sort((a, b) => a.order - b.order);

    for (const modifier of modifiers) {
        modifiedWord = applyModifier(modifiedWord, modifier.type);
    }

    // Regras especiais: +R (>10 letras), +EX (<5 letras)
    if (modifiedWord.length > 10) modifiedWord += "R";
    if (modifiedWord.length < 5) modifiedWord += "EX";

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

// Lista todos os modificadores possíveis do sistema Arcanum Verbis, com suas condições.
function getActiveModifiers(conditions) {
    const mods = [
        // PERÍODOS DO DIA
        { type: 'first-vowel-to-i', order: 1, cond: c => c.periodo === 'manha' },
        { type: 'a-to-y', order: 1, cond: c => c.periodo === 'tarde' },
        { type: 'duplicate-last-consonant', order: 1, cond: c => c.periodo === 'noite' },
        { type: 'add-mad', order: 1, cond: c => c.periodo === 'madrugada' },
        // ESTAÇÕES
        { type: 'add-pri', order: 2, cond: c => c.estacao === 'primavera' },
        { type: 'e-to-a', order: 2, cond: c => c.estacao === 'verao' },
        { type: 'add-out', order: 2, cond: c => c.estacao === 'outono' },
        { type: 'o-to-u', order: 2, cond: c => c.estacao === 'inverno' },
        // VENTOS
        { type: 'add-n', order: 3, cond: c => c.vento === 'norte' },
        { type: 'add-s', order: 3, cond: c => c.vento === 'sul' },
        { type: 'add-l', order: 3, cond: c => c.vento === 'leste' },
        { type: 'add-o', order: 3, cond: c => c.vento === 'oeste' },
        { type: 'add-ne', order: 3, cond: c => c.vento === 'nordeste' },
        { type: 'add-no', order: 3, cond: c => c.vento === 'noroeste' },
        { type: 'add-se', order: 3, cond: c => c.vento === 'sudeste' },
        { type: 'add-so', order: 3, cond: c => c.vento === 'sudoeste' },
        // CLIMAS
        { type: 'duplicate-first', order: 4, cond: c => c.clima === 'sol-forte' },
        { type: 'remove-first-vowel', order: 4, cond: c => c.clima === 'sol-fraco' },
        { type: 'add-nub-middle', order: 4, cond: c => c.clima === 'nublado' },
        { type: 'add-plu', order: 4, cond: c => c.clima === 'chuva-leve' },
        { type: 'vowels-to-u', order: 4, cond: c => c.clima === 'chuva-forte' },
        { type: 'reverse-word', order: 4, cond: c => c.clima === 'tempestade' },
        { type: 'add-neb', order: 4, cond: c => c.clima === 'neblina' },
        { type: 'add-nev', order: 4, cond: c => c.clima === 'nevoa' },
        { type: 'add-niv', order: 4, cond: c => c.clima === 'neve' },
        { type: 'add-gra', order: 4, cond: c => c.clima === 'granizo' },
        { type: 'remove-duplicate-vowels', order: 4, cond: c => c.clima === 'seco' },
        { type: 'duplicate-vowels', order: 4, cond: c => c.clima === 'umido' },
        // LUAS
        { type: 'add-x', order: 5, cond: c => c.lua === 'nova' },
        { type: 'add-c', order: 5, cond: c => c.lua === 'crescente' },
        { type: 'add-f', order: 5, cond: c => c.lua === 'cheia' },
        { type: 'add-m', order: 5, cond: c => c.lua === 'minguante' },
        // TEMPERATURA
        { type: 'all-upper', order: 6, cond: c => c.temperatura === 'muito-frio' },
        { type: 'consonants-upper', order: 6, cond: c => c.temperatura === 'frio' },
        { type: 'vowels-upper', order: 6, cond: c => c.temperatura === 'quente' },
        { type: 'i-to-y-e-to-a', order: 6, cond: c => c.temperatura === 'muito-quente' },
        // PRESSÃO
        { type: 'add-alt', order: 7, cond: c => c.pressao === 'alta' },
        { type: 'add-bai', order: 7, cond: c => c.pressao === 'baixa' },
        // EVENTOS ESPECIAIS
        { type: 'reverse-word', order: 8, cond: c => c.eventoEspecial === 'eclipse-solar' },
        { type: 'add-ecl', order: 8, cond: c => c.eventoEspecial === 'eclipse-lunar' },
        { type: 'add-met', order: 8, cond: c => c.eventoEspecial === 'chuva-meteoros' },
        { type: 'add-aur', order: 8, cond: c => c.eventoEspecial === 'aurora-boreal' },
        { type: 'add-sol', order: 8, cond: c => c.eventoEspecial === 'solsticio' },
        { type: 'add-equ', order: 8, cond: c => c.eventoEspecial === 'equinocio' },
        // ENERGIA MÁGICA
        { type: 'duplicate-word', order: 9, cond: c => c.energiaMagica === 'alta' },
        { type: 'remove-last', order: 9, cond: c => c.energiaMagica === 'baixa' },
        { type: 'vowels-to-numbers', order: 9, cond: c => c.energiaMagica === 'interferencia' },
    ];
    return mods.filter(m => m.cond(conditions)).sort((a, b) => a.order - b.order);
}

// Gera todas as combinações possíveis de modificadores ativos
function getAllModifierCombinations(modifiers) {
    const result = [];
    const n = modifiers.length;
    for (let k = 1; k <= n; k++) {
        combineHelper([], 0, k);
    }
    function combineHelper(current, start, k) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < n; i++) {
            current.push(modifiers[i]);
            combineHelper(current, i + 1, k);
            current.pop();
        }
    }
    return result;
}

// Detecta a quantidade EXATA de modificadores aplicados corretamente
function detectAppliedModifiers(inputWord, conditions, baseWord = 'FULMEN') {
    inputWord = inputWord.trim();
    const activeMods = getActiveModifiers(conditions);

    // Testa todas as combinações (1..n mods ativos), na ordem correta
    const combos = getAllModifierCombinations(activeMods);

    for (const combo of combos) {
        let palavra = baseWord;
        for (const mod of combo) {
            palavra = applyModifier(palavra, mod.type);
        }
        // REGRAS ESPECIAIS
        let palavraFinal = palavra;
        if (palavraFinal.length > 10) palavraFinal += "R";
        if (palavraFinal.length < 5) palavraFinal += "EX";
        if (palavraFinal === inputWord) {
            return combo.length;
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
