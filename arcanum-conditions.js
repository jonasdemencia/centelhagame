// Sistema de Condições Ambientais Globais - Arcanum Verbis
// Data de lançamento do jogo como marco zero
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');

// Função para obter condições ambientais globais
function getArcanumConditions() {
    const agora = new Date();
    const diasDesdeInicio = Math.floor((agora - ARCANUM_LAUNCH_DATE) / (1000 * 60 * 60 * 24));
    const horaAtual = agora.getHours();
    
    return {
        // Período do Dia (baseado em hora real)
        periodo: horaAtual < 6 ? 'madrugada' : 
                horaAtual < 12 ? 'manha' :
                horaAtual < 18 ? 'tarde' : 'noite',
        
        // Estação (muda a cada 30 dias)
        estacao: ['primavera', 'verao', 'outono', 'inverno'][Math.floor(diasDesdeInicio / 30) % 4],
        
        // Direção do Vento (muda a cada 3 dias)
        vento: ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'][Math.floor(diasDesdeInicio / 3) % 8],
        
        // Clima (muda a cada 2 dias)
        clima: ['sol-forte', 'sol-fraco', 'nublado', 'chuva-leve', 'neblina', 'tempestade'][Math.floor(diasDesdeInicio / 2) % 6],
        
        // Fase da Lua (muda a cada 7 dias)
        lua: ['nova', 'crescente', 'cheia', 'minguante'][Math.floor(diasDesdeInicio / 7) % 4],
        
        // Temperatura (muda a cada 5 dias)
        temperatura: ['muito-frio', 'frio', 'ameno', 'quente', 'muito-quente'][Math.floor(diasDesdeInicio / 5) % 5],
        
        // Pressão Atmosférica (muda a cada 4 dias)
        pressao: ['alta', 'normal', 'baixa'][Math.floor(diasDesdeInicio / 4) % 3],
        
        // Eventos Especiais (dias específicos)
        eventoEspecial: getEventoEspecial(diasDesdeInicio),
        
        // Energia Mágica (muda a cada 10 dias)
        energiaMagica: ['alta', 'normal', 'baixa', 'interferencia'][Math.floor(diasDesdeInicio / 10) % 4]
    };
}

// Função para eventos especiais em dias específicos
function getEventoEspecial(dia) {
    if (dia % 100 === 0) return 'eclipse-solar';
    if (dia % 77 === 0) return 'chuva-meteoros';
    if (dia % 50 === 0) return 'aurora-boreal';
    if (dia % 30 === 0) return 'solsticio';
    if (dia % 91 === 0) return 'eclipse-lunar';
    return null;
}

// Função para obter ícones das condições
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

// Função para aplicar modificadores gramaticais
function applyArcanumModifiers(palavraBase, conditions) {
    let palavra = palavraBase.toUpperCase();
    
    // 1. PERÍODOS DO DIA
    switch(conditions.periodo) {
        case 'manha':
            palavra = palavra.replace(/[AEIOU]/, 'I'); // Primeira vogal → I
            break;
        case 'tarde':
            palavra = palavra.replace(/A/g, 'Y'); // A → Y
            break;
        case 'noite':
            const ultimaConsoante = palavra.match(/[BCDFGHJKLMNPQRSTVWXYZ](?=[BCDFGHJKLMNPQRSTVWXYZ]*$)/);
            if (ultimaConsoante) {
                palavra = palavra.replace(ultimaConsoante[0], ultimaConsoante[0] + ultimaConsoante[0]);
            }
            break;
        case 'madrugada':
            palavra += 'MAD';
            break;
    }
    
    // 2. ESTAÇÕES
    switch(conditions.estacao) {
        case 'primavera':
            palavra += 'PRI';
            break;
        case 'verao':
            palavra = palavra.replace(/E/g, 'A');
            break;
        case 'outono':
            palavra += 'OUT';
            break;
        case 'inverno':
            palavra = palavra.replace(/O/g, 'U');
            break;
    }
    
    return palavra;
}


// Exporta as funções para uso global
window.ArcanumConditions = {
    getConditions: getArcanumConditions,
    getIcon: getConditionIcon,
    applyModifiers: applyArcanumModifiers
};

