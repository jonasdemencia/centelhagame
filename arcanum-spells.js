/*
 * Sistema Arcanum Verbis - Modificadores de Palavras Mágicas
 *
 * Sistema avançado e robusto para conjuração dinâmica de palavras mágicas!
 *
 * Como adicionar novos modificadores:
 * 1. Adicione a regra na função applyModifier.
 * 2. Adicione o tipo e condição nas funções getActiveModifiers e applyArcanumModifiers.
 * 3. Siga sempre o padrão de 'type' (string única), 'order' (número), e 'cond' (função que recebe as condições do turno).
 *
 * Ordem dos modificadores:
 * 1. Período do dia
 * 2. Estação do ano
 * 3. Direção do vento
 * 4. Clima
 * 5. Fase da lua
 * 6. Temperatura
 * 7. Pressão atmosférica
 * 8. Evento especial
 * 9. Energia mágica ambiente
 *
 * Sobre as regras especiais:
 * - Se a palavra resultante tiver mais de 10 letras, acrescente 'R' ao final (bônus).
 * - Se tiver menos de 5 letras, acrescente 'EX' ao final (bônus).
 * - Essas regras são opcionais, contam como um modificador extra se aplicadas corretamente!
 *
 * Fluxo do sistema:
 * - O jogador pode aplicar qualquer subconjunto dos modificadores ativos, em qualquer ordem.
 * - O sistema detecta o menor subconjunto de modificadores necessários para obter a palavra digitada.
 * - Não há "dardos grátis" por modificadores neutros/inócuos.
 * - Regras especiais são bônus opcionais.
 *
 * Funções principais:
 * - getSpellBaseWord: retorna a palavra base de uma magia.
 * - applyArcanumModifiers: aplica todos os modificadores nas condições do turno, na ordem correta.
 * - applyModifier: aplica a transformação de um modificador na palavra.
 * - getActiveModifiers: retorna todos os modificadores ativos para as condições do turno.
 * - getAllModifierCombinations: gera todas as combinações possíveis de modificadores ativos.
 * - detectAppliedModifiers: retorna quantos modificadores o jogador aplicou (mínimo necessário), quais foram e se regra especial foi usada.
 * - validateConjuration: valida a palavra digitada, calcula fluidez e precisão.
 *
 * Exemplo de uso:
 *
 * const conditions = {
 *   periodo: 'manha', estacao: 'inverno', vento: 'sul', clima: 'sol-forte', 
 *   lua: 'cheia', temperatura: 'quente', pressao: 'alta', eventoEspecial: null, energiaMagica: 'alta'
 * };
 * const base = getSpellBaseWord('missil-magico');
 * const palavraFinal = applyArcanumModifiers(base, conditions);
 *
 * // Verificação da palavra mágica digitada pelo jogador:
 * const resultado = detectAppliedModifiers('FULMENSOLPLU', conditions, base);
 * // resultado.count => número de modificadores necessários (mínimo)
 * // resultado.mods => array com os tipos de modificadores usados (em ordem)
 * // resultado.regraEspecial => "R", "EX" ou null se nenhuma
 */


/**
 * Log detalhado da conjuração de palavras mágicas.
 * Pode ser adaptado para enviar para backend, armazenar em arquivo, etc.
 */

// Sistema de Condições Dinâmicas
window.arcanumTurnCounter = window.arcanumTurnCounter || 0;
window.arcanumBaseConditions = window.arcanumBaseConditions || null;

const CONDITION_STABILITY = {
    // ESTÁVEIS (mudam raramente)
    periodo: { changeChance: 0.05 },
    estacao: { changeChance: 0.02 },
    
    // DINÂMICAS (mudam frequentemente)
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

// Adicione esta função após a linha 46
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


function logArcanumConjuration({
    spellId,
    spellName,
    baseWord,
    correctWord,
    inputWord,
    typingTime,
    errors,
    conditions,
    fluency,
    accuracy,
    modifiersDetected,
    finalDarts,
    success,
    detalhes
}) {
    const log = {
        timestamp: new Date().toISOString(),
        spellId,
        spellName,
        baseWord,
        correctWord,
        inputWord,
        typingTime,
        errors,
        conditions: {...conditions},
        fluency,
        accuracy,
        modifiersDetected,
        finalDarts,
        success,
        detalhes
    };
    // Exemplo: enviar para o console. Substitua por fetch/POST para backend se quiser.
    console.log("Arcanum Log:", log);
    // window.__arcanumLogs = window.__arcanumLogs || []; window.__arcanumLogs.push(log); // se quiser histórico em memória
}


// Palavras base das magias
function getSpellBaseWord(spellId) {
    const baseWords = {
        'missil-magico': 'FULMEN',
        'toque-chocante': 'FULGOR', 
        'luz': 'LUMINA',
        'cura-menor': 'SANITAS',
        'escudo-arcano': 'AEGIS',
        'flecha-acida-melf': 'SAGITTAMELFAX',
        'relampago': 'AEROTREMORIS',  // ← ADICIONAR ESTA LINHA
        'toque-vampirico': 'THERMOVORUS',  // ← ADICIONAR ESTA LINHA
        'animar-mortos': 'MORTUUM',
        'cone-glacial': 'NEFRIGUM'

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

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}


// Criar modal de conjuração Arcanum
async function createArcanumConjurationModal(spell) {
    // MUDANÇA: Usar condições globais em vez de dinâmicas
    const conditions = await getArcanumConditions(); // USAR FUNÇÃO GLOBAL
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
                    value ? `<span class="condition">${getConditionIcon(key, value)} ${value.replace('-', ' ').toUpperCase()}</span>` : ''
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
    
    // CSS permanece igual...
    const style = document.createElement('style');
    style.textContent = `
        #arcanum-conjuration-modal {
    display: none;
    position: fixed;
    z-index: 500;
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


function validateConjuration(inputWord, correctWord, typingTime, errors, conditions, baseWord, spellId = "", spellName = "") {
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

    let detalhes = {};

    // Detalhamento da análise
    if (modifiersApplied === 0) {
        detalhes.erro = "Nenhum modificador correto aplicado ou palavra mágica incorreta.";
        detalhes.correto = correctWord;
        detalhes.modificadores_esperados = getActiveModifiers(conditions).map(m => m.type);
    } else {
        detalhes.sucesso = "Modificadores aplicados corretamente.";
        detalhes.modificadores_esperados = getActiveModifiers(conditions).map(m => m.type);
        detalhes.modificadores_que_bati = modifiersApplied;
    }

    // Adicione detalhes de precisão e fluidez
    detalhes.accuracy = modifiersApplied > 0 ? 100 : 0;
    detalhes.fluency = fluency;

    // LOG!
    logArcanumConjuration({
        spellId,
        spellName,
        baseWord,
        correctWord,
        inputWord,
        typingTime,
        errors,
        conditions,
        fluency,
        accuracy: detalhes.accuracy,
        modifiersDetected: modifiersApplied,
        finalDarts,
        success: finalDarts > 0,
        detalhes
    });

    return {
        success: finalDarts > 0,
        accuracy: detalhes.accuracy,
        fluency: fluency,
        level: finalDarts,
        modifiersDetected: modifiersApplied,
        detalhes
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

/**
 * Detecta quantos modificadores corretos o jogador aplicou na palavra digitada,
 * permitindo qualquer ordem, qualquer subconjunto dos modificadores ativos, e
 * considerando as regras especiais (+R, +EX) como modificadores bônus opcionais.
 * 
 * Esta versão considera o MENOR subconjunto de modificadores possível que gera
 * a palavra digitada, evitando "inflar" a quantidade de dardos por mods neutros.
 * 
 * @param {string} inputWord Palavra digitada pelo jogador
 * @param {object} conditions Objeto com as condições ambientais/atuais
 * @param {string} baseWord Palavra base da magia (ex: "FULMEN")
 * @returns {number} Quantidade de modificadores corretos aplicados (incluindo regra especial, se usada)
 */
function detectAppliedModifiers(inputWord, conditions, baseWord = 'FULMEN') {
    inputWord = inputWord.trim();

    // 1. Pegue todos os modificadores ativos do turno
    const activeMods = getActiveModifiers(conditions);

    // 2. Gera TODOS os subconjuntos possíveis dos modificadores ativos (menor para maior)
    function getAllSubsets(array) {
        const result = [];
        const total = 1 << array.length;
        for (let i = 1; i < total; i++) {
            const subset = [];
            for (let j = 0; j < array.length; j++) {
                if (i & (1 << j)) subset.push(array[j]);
            }
            result.push(subset);
        }
        // Ordena do menor para o maior subconjunto
        result.sort((a, b) => a.length - b.length);
        return result;
    }

    // 3. Para cada subconjunto, teste todas as permutações (todas as ordens possíveis)
    function permute(array) {
        if (array.length <= 1) return [array];
        const result = [];
        for (let i = 0; i < array.length; i++) {
            const current = array[i];
            const remaining = array.slice(0, i).concat(array.slice(i + 1));
            for (const perm of permute(remaining)) {
                result.push([current].concat(perm));
            }
        }
        return result;
    }

    // 4. Testa se alguma permutação de algum subconjunto chega à palavra digitada,
    //    considerando as regras especiais como modificadores opcionais.
    //    Retorna o MENOR subconjunto possível.
    const subsets = getAllSubsets(activeMods);

    for (const subset of subsets) {
        const perms = permute(subset);
        for (const order of perms) {
            let palavra = baseWord;
            for (const mod of order) {
                palavra = applyModifier(palavra, mod.type);
            }
            let palavraFinal = palavra;

            const addR = (palavraFinal.length > 10);
            const addEX = (palavraFinal.length < 5);

            // Se o jogador digitou a palavra com R (e caberia R), conta como extra
            if (addR && inputWord === palavraFinal + "R") {
                return order.length + 1;
            }
            // Se o jogador digitou a palavra com EX (e caberia EX), conta como extra
            if (addEX && inputWord === palavraFinal + "EX") {
                return order.length + 1;
            }
            // Se o jogador digitou a palavra sem as regras especiais, aceita normalmente
            if (inputWord === palavraFinal) {
                return order.length;
            }
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

// Reset no início de cada batalha
function resetArcanumBattle() {
    resetDynamicConditions();
    window.arcanumUsageCount = 0; // Se usando custo progressivo
}


// Exportar funções globalmente
window.ArcanumSpells = {
    getSpellBaseWord,
    applyArcanumModifiers,
    createArcanumConjurationModal,
    validateConjuration,
    resetArcanumBattle,
};
