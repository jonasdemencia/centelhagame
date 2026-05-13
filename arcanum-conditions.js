// Sistema de Condições Ambientais Globais - Arcanum Verbis
// Data de lançamento do jogo como marco zero
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');

async function getArcanumConditions() {
    // AJUSTE: Aguarda o Firebase estar disponível no window
    if (!window.doc || !window.db) {
        console.log("🔍 CONDIÇÕES DEBUG - Firebase ainda não carregado. Aguardando...");
        await new Promise(resolve => {
            window.addEventListener('firebase-initialized', resolve, { once: true });
            // Fallback caso o evento já tenha passado
            if (window.firebaseReady) resolve();
        });
    }

    console.log("🔍 CONDIÇÕES DEBUG - Função chamada");
    try {
        console.log("🔍 CONDIÇÕES DEBUG - Tentando conectar ao Firestore");
        const conditionsRef = window.doc(window.db, "gameConditions", "current");
        const conditionsSnap = await window.getDoc(conditionsRef);
        
        const agora = new Date();
        const chaveHora = `${agora.toDateString()} - ${agora.getHours()}:${Math.floor(agora.getMinutes()/30)*30}`;
        console.log("🔍 CONDIÇÕES DEBUG - Chave atual:", chaveHora);
        
        if (conditionsSnap.exists()) {
            const firestoreData = conditionsSnap.data();
            console.log("🔍 CONDIÇÕES DEBUG - Dados do Firestore:", firestoreData);
            console.log("🔍 CONDIÇÕES DEBUG - Chave salva:", firestoreData.timeKey);
            
            if (firestoreData.timeKey === chaveHora) {
                console.log("🔍 CONDIÇÕES DEBUG - USANDO dados do Firestore:", firestoreData.conditions);
                return firestoreData.conditions;
            }
        }
        
        console.log("🔍 CONDIÇÕES DEBUG - CALCULANDO novas condições");
        const diasDesdeInicio = Math.floor((agora - new Date('2024-01-01T00:00:00Z')) / (1000 * 60 * 60 * 24));
        const horasDesdeInicio = Math.floor((agora - new Date('2024-01-01T00:00:00Z')) / (1000 * 60 * 60));
        const meiasHorasDesdeInicio = Math.floor((agora - new Date('2024-01-01T00:00:00Z')) / (1000 * 60 * 30));
        
        const conditions = {
            periodo: agora.getHours() < 6 ? 'madrugada' : agora.getHours() < 12 ? 'manha' : agora.getHours() < 18 ? 'tarde' : 'noite',
            vento: ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'][meiasHorasDesdeInicio % 8],
            clima: ['sol-forte', 'sol-fraco', 'nublado', 'chuva-leve', 'neblina', 'tempestade'][horasDesdeInicio % 6],
            pressao: ['alta', 'normal', 'baixa'][Math.floor(horasDesdeInicio / 2) % 3],
            energiaMagica: ['alta', 'normal', 'baixa', 'interferencia'][diasDesdeInicio % 4],
            temperatura: ['muito-frio', 'frio', 'ameno', 'quente', 'muito-quente'][diasDesdeInicio % 5],
            lua: ['nova', 'crescente', 'cheia', 'minguante'][Math.floor(diasDesdeInicio / 2) % 4],
            estacao: ['primavera', 'verao', 'outono', 'inverno'][Math.floor(diasDesdeInicio / 5) % 4]
        };
        
        console.log("🔍 CONDIÇÕES DEBUG - Condições calculadas:", conditions);
        console.log("🔍 CONDIÇÕES DEBUG - SALVANDO no Firestore");
        
        await window.setDoc(conditionsRef, { conditions, timeKey: chaveHora });
        console.log("🔍 CONDIÇÕES DEBUG - SALVO com sucesso");
        
        return conditions;
        
    } catch (error) {
        console.error("🔍 CONDIÇÕES DEBUG - ERRO:", error);
        const fallback = {
            periodo: 'tarde', estacao: 'inverno', vento: 'norte', clima: 'nublado',
            lua: 'cheia', temperatura: 'frio', pressao: 'alta', energiaMagica: 'normal'
        };
        console.log("🔍 CONDIÇÕES DEBUG - USANDO fallback:", fallback);
        return fallback;
    }
}


function getEventoEspecial(dia) {
    if (dia % 100 === 0) return 'eclipse-solar';
    if (dia % 77 === 0) return 'chuva-meteoros';
    if (dia % 50 === 0) return 'aurora-boreal';
    if (dia % 30 === 0) return 'solsticio';
    if (dia % 91 === 0) return 'eclipse-lunar';
    return null;
}

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

window.ArcanumConditions = {
    getConditions: getArcanumConditions,
    getIcon: getConditionIcon
};
