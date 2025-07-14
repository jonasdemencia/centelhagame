// Importa Firebase (adicione no topo do arquivo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sistema de Condições Ambientais Globais - Arcanum Verbis
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');

async function getArcanumConditions() {
    console.log("🔍 CONDIÇÕES DEBUG - Função chamada");
    
    try {
        console.log("🔍 CONDIÇÕES DEBUG - Tentando conectar ao Firestore");
        const conditionsRef = doc(db, "gameConditions", "current");
        const conditionsSnap = await getDoc(conditionsRef);
        
        const hoje = new Date().toDateString();
        console.log("🔍 CONDIÇÕES DEBUG - Data de hoje:", hoje);
        
        if (conditionsSnap.exists()) {
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
            periodo: horaAtual < 6 ? 'madrugada' : horaAtual < 12 ? 'manha' : horaAtual < 18 ? 'tarde' : 'noite',
            estacao: ['primavera', 'verao', 'outono', 'inverno'][Math.floor(diasDesdeInicio / 30) % 4],
            vento: ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'][Math.floor(diasDesdeInicio / 3) % 8],
            clima: ['sol-forte', 'sol-fraco', 'nublado', 'chuva-leve', 'neblina', 'tempestade'][Math.floor(diasDesdeInicio / 2) % 6],
            lua: ['nova', 'crescente', 'cheia', 'minguante'][Math.floor(diasDesdeInicio / 7) % 4],
            temperatura: ['muito-frio', 'frio', 'ameno', 'quente', 'muito-quente'][Math.floor(diasDesdeInicio / 5) % 5],
            pressao: ['alta', 'normal', 'baixa'][Math.floor(diasDesdeInicio / 4) % 3],
            eventoEspecial: getEventoEspecial(diasDesdeInicio),
            energiaMagica: ['alta', 'normal', 'baixa', 'interferencia'][Math.floor(diasDesdeInicio / 10) % 4]
        };
        
        console.log("🔍 CONDIÇÕES DEBUG - Condições calculadas:", conditions);
        console.log("🔍 CONDIÇÕES DEBUG - SALVANDO no Firestore");
        
        await setDoc(conditionsRef, { conditions, date: hoje });
        console.log("🔍 CONDIÇÕES DEBUG - SALVO com sucesso");
        
        return conditions;
        
    } catch (error) {
        console.error("🔍 CONDIÇÕES DEBUG - ERRO:", error);
        const agora = new Date();
        const diasDesdeInicio = Math.floor((agora - ARCANUM_LAUNCH_DATE) / (1000 * 60 * 60 * 24));
        const horaAtual = agora.getHours();
        
        const fallback = {
            periodo: horaAtual < 6 ? 'madrugada' : horaAtual < 12 ? 'manha' : horaAtual < 18 ? 'tarde' : 'noite',
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
