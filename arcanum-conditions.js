// Importa funções do Firebase v9
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Sistema de Condições Ambientais Globais - Arcanum Verbis
// Data de lançamento do jogo como marco zero
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');

// Função para obter condições ambientais globais
async function getArcanumConditions() {
    console.log("🔍 CONDIÇÕES DEBUG - Função chamada");
    
    try {
        console.log("🔍 CONDIÇÕES DEBUG - Tentando conectar ao Firestore");
        
        // Aguarda o Firebase estar disponível
        if (!window.db) {
            console.log("🔍 CONDIÇÕES DEBUG - Firebase não disponível, usando fallback");
            throw new Error("Firebase não disponível");
        }
        
        // Usa o db do batalha.js que já está disponível globalmente
const conditionsRef = doc(window.db || db, "gameConditions", "current");
const conditionsSnap = await getDoc(conditionsRef);

        
        const hoje = new Date().toDateString();
        console.log("🔍 CONDIÇÕES DEBUG - Data de hoje:", hoje);
        
        if (conditionsSnap.exists) {
            const firestoreData = conditionsSnap.data();
            console.log("🔍 CONDIÇÕES DEBUG - Dados do Firestore:", firestoreData);
            console.log("🔍 CONDIÇÕES DEBUG - Data salva:", firestoreData.date);
            console.log("🔍 CONDIÇÕES DEBUG - Datas coincidem?", firestoreData.date === hoje);
            
            if (firestoreData.date === hoje) {
                console.log("🔍 CONDIÇÕES DEBUG - USANDO dados do Firestore:", firestoreData.conditions);
                return firestoreData.conditions;
            }
        } else {
            console.log("🔍 CONDIÇÕES DEBUG - Documento não existe no Firestore");
        }
        
        console.log("🔍 CONDIÇÕES DEBUG - CALCULANDO novas condições");
        const agora = new Date();
        const diasDesdeInicio = Math.floor((agora - ARCANUM_LAUNCH_DATE) / (1000 * 60 * 60 * 24));
        const horaAtual = agora.getHours();
        
        console.log("🔍 CONDIÇÕES DEBUG - Dias desde início:", diasDesdeInicio);
        console.log("🔍 CONDIÇÕES DEBUG - Hora atual:", horaAtual);
        
        const conditions = {
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
        
        console.log("🔍 CONDIÇÕES DEBUG - Condições calculadas:", conditions);
        console.log("🔍 CONDIÇÕES DEBUG - SALVANDO no Firestore");
        
await setDoc(conditionsRef, { conditions, date: hoje });
        console.log("🔍 CONDIÇÕES DEBUG - SALVO com sucesso");
        
        return conditions;
        
    } catch (error) {
        console.error("🔍 CONDIÇÕES DEBUG - ERRO:", error);
        
        // Fallback local se Firestore falhar
        const agora = new Date();
        const diasDesdeInicio = Math.floor((agora - ARCANUM_LAUNCH_DATE) / (1000 * 60 * 60 * 24));
        const horaAtual = agora.getHours();
        
        const fallback = {
            periodo: horaAtual < 6 ? 'madrugada' : 
                    horaAtual < 12 ? 'manha' :
                    horaAtual < 18 ? 'tarde' : 'noite',
            estacao: ['primavera', 'verao', 'outono', 'inverno'][Math.floor(diasDesdeInicio / 30) % 4],
            vento: ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'][Math.floor(diasDesdeInicio / 3) % 8],
            clima: ['sol-forte', 'sol-fraco', 'nublado', 'chuva-leve', 'neblina', 'tempestade'][Math.floor(diasDesdeInicio / 2) % 6],
            lua: ['nova', 'crescente', 'cheia', 'minguante'][Math.floor(diasDesdeInicio / 7) % 4],
            temperatura: ['muito-frio', 'frio', 'ameno', 'quente', 'muito-quente'][Math.floor(diasDesdeInicio / 5) % 5],
            pressao: ['alta', 'normal', 'baixa'][Math.floor(diasDesdeInicio / 4) % 3],
            eventoEspecial: getEventoEspecial(diasDesdeInicio),
            energiaMagica: ['alta', 'normal', 'baixa', 'interferencia'][Math.floor(diasDesdeInicio / 10) % 4]
        };
        
        console.log("🔍 CONDIÇÕES DEBUG - USANDO fallback:", fallback);
        return fallback;
    }
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

// Exporta as funções para uso global
window.ArcanumConditions = {
    getConditions: getArcanumConditions,
    getIcon: getConditionIcon
};
