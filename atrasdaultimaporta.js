// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sistema de Condições Ambientais Globais - Arcanum Verbis
const ARCANUM_LAUNCH_DATE = new Date('2024-01-01T00:00:00Z');

async function registrarEsquecimento() {
  const user = getAuth().currentUser;
  if (!user) {
    console.warn("Usuário não autenticado.");
    return;
  }
  const userRef = doc(db, "players", user.uid);
  try {
    await setDoc(userRef, { esquecimentos: increment(1) }, { merge: true });
    console.log("Esquecimento registrado no Firestore.");
  } catch (e) {
    console.error("Erro ao registrar esquecimento:", e);
  }
}

async function getArcanumConditions() {
    console.log("🔍 CONDIÇÕES DEBUG - Função chamada");
    
    try {
        console.log("🔍 CONDIÇÕES DEBUG - Tentando conectar ao Firestore");
        const conditionsRef = doc(db, "gameConditions", "current");
        const conditionsSnap = await getDoc(conditionsRef);
        
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
        
        await setDoc(conditionsRef, { conditions, timeKey: chaveHora });
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



// Sistema Arcanum Iudicium
window.arcanumIudicium = {
    sucessos: 0,
    falhas: 0,
    ultimaCategoria: null,
    magiaComDesconto: null,
    magiasMemorizadas: [],
    magiasEstudadas: [],
    magiasReflexao: [],
    reflexoesSalvas: {},



    async sucesso() { 
        this.sucessos++; 
        console.log(`Arcanum Iudicium: Sucesso (${this.sucessos}/${this.sucessos + this.falhas})`);
        await this.salvarFirestore();
    },
    
    async falha() { 
        this.falhas++; 
        console.log(`Arcanum Iudicium: Falha (${this.sucessos}/${this.sucessos + this.falhas})`);
        await this.salvarFirestore();
    },
    
    getEficiencia() {
        const total = this.sucessos + this.falhas;
        return total > 0 ? (this.sucessos / total * 100).toFixed(1) : 0;
    },
    
    getCategoria() {
        const eficiencia = parseFloat(this.getEficiencia());
        if (eficiencia >= 80) return 'alta';
        if (eficiencia < 30) return 'muito-baixa';
        return 'baixa';
    },
    
    async salvarFirestore() {
        try {
            const user = auth?.currentUser;
            if (!user) return;
            
            const playerRef = doc(db, "players", user.uid);
            await setDoc(playerRef, { 
                arcanumIudicium: {
                    sucessos: this.sucessos,
                    falhas: this.falhas,
                    ultimaCategoria: this.ultimaCategoria,
                    magiaComDesconto: this.magiaComDesconto,
                    magiasMemorizadas: this.magiasMemorizadas,
                    magiasEstudadas: this.magiasEstudadas,
                    magiasReflexao: this.magiasReflexao,
                    reflexoesSalvas: this.reflexoesSalvas

                }
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao salvar Arcanum Iudicium:", error);
        }
    },
    
    async carregarFirestore() {
        try {
            const user = auth?.currentUser;
            if (!user) {
                console.log("Arcanum Iudicium: Usuário não logado");
                return;
            }
            
            console.log("Arcanum Iudicium: Carregando dados do Firestore...");
            const playerRef = doc(db, "players", user.uid);
            const playerSnap = await getDoc(playerRef);
            
            if (playerSnap.exists() && playerSnap.data().arcanumIudicium) {
                const data = playerSnap.data().arcanumIudicium;
                this.sucessos = data.sucessos || 0;
                this.falhas = data.falhas || 0;
                this.ultimaCategoria = data.ultimaCategoria || null;
                this.magiaComDesconto = data.magiaComDesconto || null;
                this.magiasMemorizadas = data.magiasMemorizadas || [];
                this.magiasEstudadas = data.magiasEstudadas || [];
                this.magiasReflexao = data.magiasReflexao || [];
                this.reflexoesSalvas = data.reflexoesSalvas || {};


                console.log(`Arcanum Iudicium carregado: ${this.sucessos} sucessos, ${this.falhas} falhas, categoria: ${this.ultimaCategoria}, desconto: ${this.magiaComDesconto}, memorizadas: ${this.magiasMemorizadas.length}`);
            } else {
                console.log("Arcanum Iudicium: Nenhum dado encontrado no Firestore - iniciando com valores zerados");
            }
        } catch (error) {
            console.error("Erro ao carregar Arcanum Iudicium:", error);
        }
    },
    
    async memorizarMagia(idMagia) {
        if (!this.magiasMemorizadas.includes(idMagia)) {
            this.magiasMemorizadas.push(idMagia);
            await this.salvarFirestore();
            console.log(`Magia memorizada: ${idMagia}`);
        }
    },
    
    isMagiaMemorizada(idMagia) {
    return this.magiasMemorizadas.includes(idMagia);
},

async estudarMagia(idMagia) {
    if (!this.magiasEstudadas.includes(idMagia)) {
        this.magiasEstudadas.push(idMagia);
        await this.salvarFirestore();
    }
},

isMagiaEstudada(idMagia) {
    return this.magiasEstudadas.includes(idMagia);
},

    async reflexaoMagia(idMagia) {
    if (!this.magiasReflexao.includes(idMagia)) {
        this.magiasReflexao.push(idMagia);
        await this.salvarFirestore();
    }
},

isMagiaReflexao(idMagia) {
    return this.magiasReflexao.includes(idMagia);
}

};


// Mensagens do Grimório por Categoria
const mensagensGrimorio = {
    'alta': [
        "Tuas palavras cortam como ferro que se lembra de ser espada.",
        "O papel se curva ao teu comando. Mas e tua vontade, a quem obedece?",
        "O silêncio entre os versos também conjura. Tu sabes usá-lo?",
        "A página vibrou com tua voz. Ela ainda ecoa.",
        "Não és o primeiro a dominar-me. Mas talvez sejas o último.",
        "Estás pronto para conjurar o que não quer ser conjurado?",
        "Dominas os símbolos. Mas entendes o que eles sangram?",
        "Muito bem. Cuidado para que tua chama não vire farol para aquilo que te odeia.",
        "Gostaria de saber... tu és feito de papel também?",
        "Se fosses um feitiço, qual seria teu custo?"
    ],
    'baixa': [
        "Algo em ti balança, como tinta prestes a escorrer.",
        "Tu lês as palavras... mas lês a pausa entre elas?",
        "Tua mão hesita. É medo de errar ou de acertar?",
        "Já pensaste se és digno do que tentas invocar?",
        "A magia não falha — quem falha é a voz que a pronuncia.",
        "Estás tentando conjurar... ou apenas imitar?",
        "O grimório te ouve. Ele não está convencido.",
        "Já sentiste a página se calar sob tua mão?",
        "Há algo entre ti e o feitiço. Que nome tem esse véu?",
        "Por que insistes em escrever com mãos que tremem?"
    ],
    'muito-baixa': [
        "O papel te rejeita. E eu também.",
        "Fica difícil ser temido quando até a tinta foge de ti.",
        "Conjuração ou contorcionismo? Me confundo.",
        "Já considerou usar pedras em vez de palavras?",
        "A magia sente vergonha por ter sido associada ao teu gesto.",
        "Eu teria te rasgado... se ainda valesses o esforço.",
        "Ergues a mão como quem pede desculpas. A quem?",
        "Tu lês como quem implora. E a página não responde a súplicas.",
        "Estás tentando ou apenas... fazendo barulho?",
        "Se tua magia tivesse um nome, seria 'Errum'."
    ]
};

// Função para exibir julgamento do grimório
async function exibirJulgamentoGrimorio(categoria) {
    return new Promise(async (resolve) => {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Criar container da mensagem
        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            color: white;
            font-size: 18px;
            text-align: center;
            max-width: 600px;
            padding: 20px;
            font-family: 'VT323', monospace;
            letter-spacing: 1.5px;
        `;
        
        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);
        
        // Desabilitar todos os botões
        const botoes = document.querySelectorAll('button');
        botoes.forEach(btn => btn.disabled = true);
        
        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);
        
        // Aguardar fade in e começar digitação
        setTimeout(async () => {
            const mensagens = mensagensGrimorio[categoria];
            const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
            
            // Digitar mensagem
            let index = 0;
            const digitar = () => {
                if (index < mensagem.length) {
                    messageContainer.textContent += mensagem.charAt(index);
                    index++;
                    setTimeout(digitar, 50); // 50ms por caractere
                } else {
                    // Verificar se é alta eficiência e sortear desconto
                    if (categoria === 'alta' && Math.random() < 0.33) {
                        // Filtrar magias elegíveis (custo > 1)
                        const magiasElegiveis = magias.filter(magia => magia.custo > 1);
                        if (magiasElegiveis.length > 0) {
                            const magiaEscolhida = magiasElegiveis[Math.floor(Math.random() * magiasElegiveis.length)];
                            window.arcanumIudicium.magiaComDesconto = magiaEscolhida.nome;
                            console.log(`Desconto aplicado à magia: ${magiaEscolhida.nome}`);
                        }
                    }
                    
                    // Aguardar 2s e fazer fade out
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                            // Reabilitar botões
                            botoes.forEach(btn => btn.disabled = false);
                            resolve();
                        }, 300);
                    }, 2000);
                }
            };
            
            digitar(); // ESTA LINHA ESTAVA FALTANDO
        }, 300);
    });
}





const magias = [
    {
        id: "armadura-arcana",
        nome: "Armadura Arcana",
        nomeVerdadeiro: "Vestes de Recusa",
        descricao: "O conjurador se cobre de memória sólida, de palavras que nunca deixaram o papel.\nA página se dobra, formando um molde invisível ao redor do corpo.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: "Retalho da pele de quem já sobreviveu a mais de uma sentença",
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "3 turnos"
    },
    {
        id: "causar-medo",
        nome: "Causar Medo (TIMORIS)",
        nomeVerdadeiro: "Eco do Berro Não Nascido",
        descricao: "A página emite um som que não se ouve.\nAqueles que têm pouco sangue para perder sentem sua espinha entortar sob o peso do \"e se\".",
        custo: 3,
        efeito: "Fugir de terror (alvos com < 40 HP)",
        componente: null,
        resistencia: "Sim",
        tempoExecucao: "1 turno",
        duracao: "Até o fim do combate"
    },
    {
        id: "cura-maior",
        nome: "Cura Maior",
        nomeVerdadeiro: "Cântico do Coração que Teima",
        descricao: "Um poema partido em três partes, lido em silêncio. O papel absorve o desespero e o transforma em sopro vital.\nExige do conjurador fé em algo que talvez já tenha morrido.",
        custo: 2,
        efeito: "Cura profunda (10d8+1)",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "Instantânea"
    },
    {
        id: "cura-menor",
        nome: "Cura Menor (SANITAS)",
        nomeVerdadeiro: "Murmúrio do Sangue Quieto",
        descricao: "Uma prece curta inscrita nas margens da página, ativada por compaixão ou temor.\nO grimório sussurra memórias de infância, quando dor era cuidada com mãos e lágrimas.",
        custo: 2,
        efeito: "Cura leve (1d8)",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "Instantânea"
    },
    {
        id: "missil-magico",
        nome: "Dardos Místicos (FULMEN)",
        nomeVerdadeiro: "Olhar Afiado do Inominado",
        descricao: "As linhas saltam da página como farpas etéreas. Cada letra se torna uma lança de pensamento puro.\nNão mira a carne, mas a hesitação entre as costelas.",
        custo: 1,
        efeito: "Dano (1d4)",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "Instantânea"
    },
    {
        id: "escudo-arcano",
        nome: "Escudo Arcano (AEGIS)",
        nomeVerdadeiro: "Círculo do Não-Tocar",
        descricao: "Linhas em espiral giram na página como se gravadas à unha.\nProtege não com força, mas com intenção perfeita.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "3 turnos"
    },
    {
        id: "luz",
        nome: "Luz (LUMINA)",
        nomeVerdadeiro: "Vislumbre da Aurora que Queima",
        descricao: "A tinta brilha no escuro da página, irradiando luz branca.\nNão ilumina o caminho — apenas o erro dos olhos alheios.",
        custo: 2,
        efeito: "Ofuscamento (precisão -3)",
        componente: null,
        resistencia: "Sim",
        tempoExecucao: "1 turno",
        duracao: "3 turnos"
    },
    {
        id: "pasmar",
        nome: "Pasmar (OBSTUPRA)",
        nomeVerdadeiro: "Silêncio do Instante Rachado",
        descricao: "Ao pronunciar essa palavra, o tempo hesita.\nO inimigo sente que algo o observava antes dele existir.",
        custo: 3,
        efeito: "Perda de turno (alvos com < 50 HP)",
        componente: "O resíduo macio de uma nota que foi tocada para ninguém ouvir",
        resistencia: "Sim",
        tempoExecucao: "1 turno",
        duracao: "1 turno"
    },
    {
        id: "raio-acido",
        nome: "Raio de Ácido (CORRODO)",
        nomeVerdadeiro: "Chuva da Boca Amarga",
        descricao: "Cada gota conjurada contém o azedume de uma palavra não dita.\nO papel escorre enquanto você lê — e quem vê, sente arder.",
        custo: 1,
        efeito: "Dano ácido (1d3)",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "Instantânea"
    },
    {
        id: "sono",
        nome: "Sono (QUIESCAS)",
        nomeVerdadeiro: "Cântico da Pálpebra Frágil",
        descricao: "Cada linha é um sussurro que pesa nas têmporas.\nO grimório exige um fragmento do sono alheio —",
        custo: 5,
        efeito: "Sono (alvos com < 50 HP)",
        componente: "A canção de quem canta mesmo sabendo que será esmagado",
        resistencia: "Sim",
        tempoExecucao: "1 turno",
        duracao: "1 turno"
    },
    {
        id: "toque-chocante",
        nome: "Toque Chocante (FULGOR)",
        nomeVerdadeiro: "Dedos da Tempestade Guardada",
        descricao: "O conjurador não conjura — apenas empresta sua mão ao trovão.\nA página pulsa como um músculo elétrico.",
        custo: 2,
        efeito: "Dano elétrico por toque (1d8)",
        componente: null,
        resistencia: "Nenhuma",
        tempoExecucao: "1 turno",
        duracao: "Instantânea"
    },
    {
        id: "toque-macabro",
        nome: "Toque Macabro (EXSANGUO)",
        nomeVerdadeiro: "Frieza que Suga a Cor",
        descricao: "O toque rouba mais do que calor — leva intenção.\nA página fica cinza por alguns segundos após o uso.",
        custo: 3,
        efeito: "Dano + enfraquecimento (1d4+1)",
        componente: null,
        resistencia: "Sim",
        tempoExecucao: "1 turno",
        duracao: "3 turnos"
    }
];

// Intenções das magias
const intencoesMagias = {
    "armadura-arcana": "Permanecer. Não ser desfeito. Guardar a forma mesmo sob ameaça.",
    "causar-medo": "Afastar. Evocar o pânico primordial. Despertar a memória do que foi temido antes mesmo de se nascer.",
    "cura-maior": "Restaurar o que se partiu. Lembrar o corpo de quem ele já foi — inteiro.",
    "cura-menor": "Acalmar. Lamber feridas pequenas com mãos invisíveis. Fazer o tempo cuidar mais rápido.",
    "missil-magico": "Ferir sem hesitar. Encontrar a dúvida no peito do outro e transformá-la em dor certeira.",
    "escudo-arcano": "Proteger sem barganha. Ser negação pura ao toque. Delimitar o sagrado.",
    "luz": "Revelar. Obrigar olhos a verem o que fingem não estar lá.",
    "pasmar": "Silenciar o instante. Suspender a vontade alheia. Fazer o tempo tropeçar.",
    "raio-acido": "Corrói por justiça. Dissolver o que finge firmeza. Desfazer verdades falsas.",
    "sono": "Fechar olhos para evitar o pior. Conceder esquecimento temporário. Esconder do mundo por um instante.",
    "toque-chocante": "Despertar com violência. Lembrar que há pulsos elétricos até nos corpos que desistem.",
    "toque-macabro": "Enfraquecer. Fazer a alma esquecer como se mantém firme. Roubar a última chama."
};

// Julgamentos pessoais das magias
const julgamentosMagias = {
    "armadura-arcana": [
        "Você se cobre de palavras, mas nenhuma delas é sua.",
        "Parece que confia mais na página do que em si mesmo.",
        "Você luta para não ser tocado, mas já foi ferido por dentro."
    ],
    "causar-medo": [
        "Você gosta de ver o pavor nos outros porque reconhece o seu.",
        "Teme ser fraco, então usa o medo como disfarce.",
        "Sua voz não grita — geme."
    ],
    "cura-maior": [
        "Seu desespero é um pedido disfarçado.",
        "Você cura os outros para não encarar suas próprias feridas.",
        "Há fé em você… mas ela cambaleia."
    ],
    "cura-menor": [
        "Suas mãos tremem ao cuidar — você não aprendeu a ser gentil.",
        "Cada toque seu parece pedir desculpas.",
        "Você não crê no remédio, apenas no ritual."
    ],
    "missil-magico": [
        "Seu olhar é mais cruel do que sua magia.",
        "Você prefere atacar a ouvir.",
        "Sua pontaria nasce do rancor."
    ],
    "escudo-arcano": [
        "Você não quer ser tocado porque teme se desfazer.",
        "Confia mais em barreiras do que em palavras.",
        "Seu escudo é feito de ressentimento."
    ],
    "luz": [
        "Você ilumina para cegar, não para guiar.",
        "Seus olhos queimam, mas seu coração permanece escuro.",
        "A luz que você conjura não aquece ninguém."
    ],
    "pasmar": [
        "Você congela o mundo porque não sabe avançar.",
        "Vive pausando o tempo… mas nunca olha pra trás.",
        "Você não interrompe o inimigo — interrompe a si mesmo."
    ],
    "raio-acido": [
        "Sua boca é ácida porque seu silêncio já apodreceu.",
        "Você não digere o mundo — o vomita.",
        "A mágoa transbordou. E você chama isso de feitiço."
    ],
    "sono": [
        "Você põe os outros pra dormir, mas nunca descansa.",
        "Sua fadiga é culpa disfarçada.",
        "Seu canto embala os outros, mas ninguém canta pra você."
    ],
    "toque-chocante": [
        "Sua eletricidade não é poder — é pânico.",
        "Você nunca segura… apenas descarrega.",
        "Seus dedos tremem mesmo antes do feitiço."
    ],
    "toque-macabro": [
        "Você é frio porque o calor te abandonou.",
        "O toque que você oferece é ausência.",
        "Você não enfraquece o inimigo — apenas compartilha sua apatia."
    ]
};

// Perguntas existenciais das magias
const perguntasMagias = {
    "armadura-arcana": [
        "De que realmente você tenta se proteger?",
        "Você resistiria ao mundo se não tivesse pele?",
        "A recusa é defesa… ou medo?"
    ],
    "causar-medo": [
        "O que você teme quando está sozinho?",
        "Já sentiu medo de quem está se tornando?",
        "Existe algo mais assustador que seu próprio silêncio?"
    ],
    "cura-maior": [
        "Ainda acredita que merece ser curado?",
        "Já perdoou aquilo que partiu seu coração?",
        "O que você faz com a dor que não cicatriza?"
    ],
    "cura-menor": [
        "Quando foi a última vez que você chorou por si mesmo?",
        "Qual ferida nunca recebeu um gesto de cuidado?",
        "Você se cura… ou apenas ignora a dor?"
    ],
    "missil-magico": [
        "O que você fere quando pensa em atacar?",
        "Já destruiu algo só por medo de que te destruísse antes?",
        "Você sabe mirar... mas por quê?"
    ],
    "escudo-arcano": [
        "Quem você não permite mais se aproximar?",
        "O que há dentro do seu círculo que não suporta luz?",
        "A proteção é escolha... ou prisão?"
    ],
    "luz": [
        "O que você espera ver quando tudo estiver iluminado?",
        "Existe algo em você que a luz não alcança?",
        "Quando a verdade brilha, o que você desvia o olhar para não ver?"
    ],
    "pasmar": [
        "Já foi paralisado por algo que não compreendeu?",
        "O tempo te respeita… ou te ignora?",
        "Em que instante sua história rachou?"
    ],
    "raio-acido": [
        "Qual palavra engolida ainda corrói sua garganta?",
        "Você cospe dor… ou apenas recicla a que recebeu?",
        "É mais fácil destruir ou dizer o que sente?"
    ],
    "sono": [
        "O que você teme sonhar se adormecer?",
        "Qual vigília você se recusa a abandonar?",
        "Se dormisse agora… o que deixaria de existir?"
    ],
    "toque-chocante": [
        "O que em você ainda espera explodir?",
        "Já se arrependeu depois de ferir?",
        "Você toca com raiva... ou por desespero?"
    ],
    "toque-macabro": [
        "Já sentiu sua própria vida se esvaziando?",
        "A que custo você se torna intocável?",
        "O que ainda te dá cor?"
    ]
};


let paginaAtual = 0;

const contentData = {
    grimorio: () => criarGrimorio(),
    cruzar: () => criarCruzarAnimais(), // ADICIONAR ESTA LINHA
    sacrificar: "Sacrificar animais (Berço e Lâmina)",
    silencio: "Silêncio (entrecorda)",
    dormir: () => { dormirTelaPreta(); return ""; },
    cagar: "Necessidades fisiológicas - caso coma, tem que cagar",
    comer: "Comer - não existe fome, a pessoa come se quiser",
    alambique: "Alambique",
    sombra: "Jogos com a sua sombra - exclusivo para ladinos (Roubar de si mesmo)",
    semente: "Semente de si mesmo (para depois)",
    sangue: "Sangue Recursivo (para depois)"
};

async function criarGrimorio() {
  await window.arcanumIudicium.carregarFirestore();
  const eficiencia = parseFloat(window.arcanumIudicium.getEficiencia());
  const categoriaAtual = window.arcanumIudicium.getCategoria();

  console.log(`Eficiência atual do Arcanum Iudicium: ${eficiencia}%`);

  // Verificar se houve mudança de categoria
  if (window.arcanumIudicium.ultimaCategoria && window.arcanumIudicium.ultimaCategoria !== categoriaAtual) {
    console.log(`Mudança de categoria detectada: ${window.arcanumIudicium.ultimaCategoria} → ${categoriaAtual}`);
    // Se saiu da alta eficiência, remove desconto
    if (categoriaAtual !== 'alta') {
      window.arcanumIudicium.magiaComDesconto = null;
    }
    // Atualizar categoria e salvar
    window.arcanumIudicium.ultimaCategoria = categoriaAtual;
    await window.arcanumIudicium.salvarFirestore();
    // Exibir julgamento
    await exibirJulgamentoGrimorio(categoriaAtual);
  } else if (!window.arcanumIudicium.ultimaCategoria) {
    // Primeira vez - salvar categoria atual
    window.arcanumIudicium.ultimaCategoria = categoriaAtual;
    await window.arcanumIudicium.salvarFirestore();
  }

  // Se não está em alta eficiência, garantir que não há desconto
  if (categoriaAtual !== 'alta') {
    window.arcanumIudicium.magiaComDesconto = null;
  }

  let classeEficiencia = '';
  if (eficiencia >= 80) {
    classeEficiencia = 'grimorio-alta';
  } else if (eficiencia < 30) {
    classeEficiencia = 'grimorio-muito-baixa';
  } else {
    classeEficiencia = 'grimorio-baixa';
  }

  // --- AJUSTE CRÍTICO: não tente acessar magias[paginaAtual] se estiver na Margem Viva ---
  if (paginaAtual === magias.length) {
    return `
      <div class="grimorio-container ${classeEficiencia}">
        <div id="magia-content">
          ${await criarPaginaMargemViva()}
        </div>
        <div class="grimorio-nav">
          <button class="nav-btn" id="prev-btn" onclick="mudarPagina(-1)">← Página Anterior</button>
          <span class="page-number">Página ${paginaAtual + 1}</span>
          <button class="nav-btn" id="next-btn" onclick="mudarPagina(1)">Próxima Página →</button>
        </div>
        <div class="grimorio-actions"></div>
      </div>
    `;
  }

  // Verificar se magia atual está memorizada (só se NÃO estiver na Margem Viva)
  const magiaAtual = magias[paginaAtual];
  const jaMemorizada = window.arcanumIudicium.isMagiaMemorizada(magiaAtual.id);

  return `
    <div class="grimorio-container ${classeEficiencia}">
      <div id="magia-content">
        ${criarPaginaMagia(paginaAtual)}
      </div>
      <div class="grimorio-nav">
        <button class="nav-btn" id="prev-btn" onclick="mudarPagina(-1)">← Página Anterior</button>
        <span class="page-number">Página ${paginaAtual + 1}</span>
        <button class="nav-btn" id="next-btn" onclick="mudarPagina(1)">Próxima Página →</button>
      </div>
      <div class="grimorio-actions"></div>
    </div>
  `;
}


async function criarPaginaMargemViva() {
  let proezasHtml = '<div style="color: #888; font-style: italic;">(Em branco... por enquanto)</div>';
  const user = auth.currentUser;
  if (user) {
    const playerRef = doc(db, "players", user.uid);
    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists() && playerSnap.data().proezas && playerSnap.data().proezas.length > 0) {
      proezasHtml = playerSnap.data().proezas.map(msg =>
        `<div style="margin-bottom: 8px; color: #feca57;">${msg}</div>`
      ).join('');
    }
  }
  return `
    <div class="magia-page active">
      <div class="magia-titulo">Margem Viva</div>
      <div class="magia-divisor">═══════════════════════════════</div>
      <div class="magia-descricao" style="font-style: italic; color: #888;">
        ${proezasHtml}
      </div>
      <div class="magia-divisor">═══════════════════════════════</div>
    </div>
  `;
}

function criarPaginaMagia(index) {
    // 👉 Página extra no final do grimório
    if (index === magias.length) {
        return `
            <div class="magia-page active">
                <div class="magia-titulo">Margem Viva</div>
                <div class="magia-divisor">═══════════════════════════════</div>
                <div class="magia-descricao" style="font-style: italic; color: #888;">
                    (Em branco... por enquanto)
                </div>
                <div class="magia-divisor">═══════════════════════════════</div>
            </div>
        `;
    }

    const magia = magias[index];

    // Aplica efeitos aleatórios baseados na eficiência
    setTimeout(() => aplicarEfeitosAleatorios(), 100);

    // Verificar se esta magia tem desconto
    const temDesconto = window.arcanumIudicium.magiaComDesconto === magia.nome;
    const custoFinal = temDesconto ? Math.max(1, magia.custo - 1) : magia.custo;
    const textoDesconto = temDesconto ? ` <span style="color: #00ff00;">-1</span>` : '';

    // Verificar se magia está memorizada
    const jaMemorizada = window.arcanumIudicium.isMagiaMemorizada(magia.id);
    const statusMemorizada = jaMemorizada ? ' <span style="color: #ffd700;">✓ Memorizada</span>' : '';
    const jaEstudada = window.arcanumIudicium.isMagiaEstudada(magia.id);
    const intencaoHtml = jaEstudada
        ? `<div class="magia-intencao" style="margin: 15px 0; font-size: 13px; color: #c5bebe; font-weight: bold;"><strong>Intenção:</strong> ${intencoesMagias[magia.id]}</div>`
        : '';
    const reflexaoSalva = window.arcanumIudicium.reflexoesSalvas[magia.id];
    const reflexaoHtml = reflexaoSalva
        ? `<div class="magia-julgamento" style="margin: 15px 0; font-size: 13px; color: #8B4513; font-weight: bold; font-style: italic;">${reflexaoSalva}</div>`
        : '';
    const jaReflexao = window.arcanumIudicium.isMagiaReflexao(magia.id);
    const mostrarEstudarNovamente = jaEstudada && !jaReflexao && Math.random() < 0.33;

    return `
        <div class="magia-page active">
            <div class="magia-titulo">${magia.nome}${statusMemorizada}</div>
            <div class="magia-nome-verdadeiro">"${magia.nomeVerdadeiro}"</div>
            <div class="magia-divisor">═══════════════════════════════</div>
            <div class="magia-descricao">${magia.descricao.replace(/\n/g, '<br><br>')}</div>
            ${intencaoHtml}
            ${reflexaoHtml}
            <div class="magia-stats">
                <div>📖 <span class="label">Custo:</span> <span class="valor">${custoFinal}${textoDesconto}</span></div>
                <div>🌀 <span class="label">Efeito:</span> <span class="valor">${magia.efeito}</span></div>
                <div>🕯️ <span class="label">Componente:</span> <span class="valor">${magia.componente || 'Nenhum'}</span></div>
                <div>🛡️ <span class="label">Resistência:</span> <span class="valor">${magia.resistencia}</span></div>
                <div>⏱️ <span class="label">Tempo de Execução:</span> <span class="valor">${magia.tempoExecucao}</span></div>
                <div>⏳ <span class="label">Duração:</span> <span class="valor">${magia.duracao}</span></div>
            </div>
            <div class="magia-divisor">═══════════════════════════════</div>
        </div>
    `;
}



async function mudarPagina(direcao) {
    const novaPagina = paginaAtual + direcao;
    if (novaPagina < 0 || novaPagina > magias.length) return;

    const magiaContent = document.getElementById('magia-content');
    const paginaAtiva = magiaContent.querySelector('.magia-page');

    paginaAtiva.classList.remove('active');

    setTimeout(async () => {
        paginaAtual = novaPagina;
       magiaContent.innerHTML = paginaAtual === magias.length
  ? await criarPaginaMargemViva()
  : criarPaginaMagia(paginaAtual);
       const numeroTotal = magias.length + 1;
document.querySelector('.page-number').textContent = `Página ${paginaAtual + 1} de ${numeroTotal}`;

        renderizarAcoesGrimorio();
        atualizarBotoes();
    }, 300);
}



function atualizarBotoes() {
  document.getElementById('prev-btn').disabled = paginaAtual === 0;
  document.getElementById('next-btn').disabled = paginaAtual === magias.length;
}

function renderizarAcoesGrimorio() {
    const magiaAtual = magias[paginaAtual];
    const jaMemorizada = window.arcanumIudicium.isMagiaMemorizada(magiaAtual.id);
    const jaEstudada = window.arcanumIudicium.isMagiaEstudada(magiaAtual.id);
    const jaReflexao = window.arcanumIudicium.isMagiaReflexao(magiaAtual.id);
    const mostrarEstudarNovamente = jaEstudada && !jaReflexao && Math.random() < 0.33;
    const actionsDiv = document.querySelector('.grimorio-actions');
    if (!actionsDiv) return;

    actionsDiv.innerHTML = '';
    if (mostrarEstudarNovamente)
        actionsDiv.innerHTML += '<button class="action-btn" onclick="estudarProfundamente()">Estudar</button>';
    else if (!jaEstudada)
        actionsDiv.innerHTML += '<button class="action-btn" onclick="estudarMagia()">Estudar</button>';

    if (!jaMemorizada) {
        const novoBotao = document.createElement('button');
        novoBotao.className = 'action-btn';
        novoBotao.onclick = memorizarMagia;
        novoBotao.textContent = 'Memorizar';
        actionsDiv.appendChild(novoBotao);
    }
}


async function estudarMagia() {
    const magiaAtual = magias[paginaAtual];
    
    // Salvar no Firestore
    await window.arcanumIudicium.estudarMagia(magiaAtual.id);
    
    // Recarregar a página atual para mostrar a intenção
    const magiaContent = document.getElementById('magia-content');
    magiaContent.innerHTML = criarPaginaMagia(paginaAtual);
    
    // Usar função centralizada
    renderizarAcoesGrimorio();
    
    // Aplicar efeito visual na intenção
    setTimeout(() => {
        const intencaoDiv = document.querySelector('.magia-intencao');
        if (intencaoDiv) {
            intencaoDiv.style.color = '#8B4513';
            setTimeout(() => {
                intencaoDiv.style.color = '#c5bebe';
            }, 3000);
        }
    }, 100);
}

function estudarProfundamente() {
    const magiaAtual = magias[paginaAtual];
    const julgamentos = julgamentosMagias[magiaAtual.id];
    const perguntas = perguntasMagias[magiaAtual.id];
    
    const julgamentoAleatorio = julgamentos[Math.floor(Math.random() * julgamentos.length)];
    const perguntaAleatoria = perguntas[Math.floor(Math.random() * perguntas.length)];
    
    // Criar elementos
    const reflexaoDiv = document.createElement('div');
    reflexaoDiv.className = 'magia-reflexao';
    reflexaoDiv.innerHTML = `
        <div style="margin: 15px 0; font-size: 13px; color: #8B4513; font-weight: bold; font-style: italic;">
            ${julgamentoAleatorio}
        </div>
        <div style="margin: 15px 0; font-size: 13px; color: #c5bebe; font-weight: bold;">
            ${perguntaAleatoria}
        </div>
        <div style="margin: 15px 0; display: flex; gap: 10px; justify-content: center;">
            <button class="action-btn" onclick="responderMentalmente()">Responder Mentalmente</button>
            <button class="action-btn" onclick="fecharOlhos()">Fechar os Olhos</button>
        </div>
    `;
    
    // Inserir após a intenção
    const intencao = document.querySelector('.magia-intencao');
    intencao.parentNode.insertBefore(reflexaoDiv, intencao.nextSibling);
    
    // Remover botão estudar
    const botaoEstudar = document.querySelector('button[onclick="estudarProfundamente()"]');
    if (botaoEstudar) {
        botaoEstudar.remove();
    }
}

async function responderMentalmente() {
    const magiaAtual = magias[paginaAtual];
    const julgamento = document.querySelector('.magia-reflexao div:first-child').textContent;
    
    // Salvar julgamento
    window.arcanumIudicium.reflexoesSalvas[magiaAtual.id] = julgamento;
    await window.arcanumIudicium.reflexaoMagia(magiaAtual.id);
    
    // Recarregar página para mostrar julgamento permanente
    const magiaContent = document.getElementById('magia-content');
    magiaContent.innerHTML = criarPaginaMagia(paginaAtual);
    
    // Usar função centralizada
    renderizarAcoesGrimorio();
}


async function fecharOlhos() {
    const magiaAtual = magias[paginaAtual];
    const julgamento = document.querySelector('.magia-reflexao div:first-child').textContent;
    
    // Salvar julgamento
    window.arcanumIudicium.reflexoesSalvas[magiaAtual.id] = julgamento;
    await window.arcanumIudicium.reflexaoMagia(magiaAtual.id);
    
    // Criar overlay escuro
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Fade in para preto
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    // Após 1 segundo, fade out e remover
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
            
            // Recarregar página para mostrar julgamento permanente
            const magiaContent = document.getElementById('magia-content');
            magiaContent.innerHTML = criarPaginaMagia(paginaAtual);
            
            // Usar função centralizada
            renderizarAcoesGrimorio();
        }, 300);
    }, 1000);
}



async function memorizarMagia() {
    const magiaAtual = magias[paginaAtual];
    
    if (!window.arcanumIudicium.isMagiaMemorizada(magiaAtual.id)) {
        await window.arcanumIudicium.memorizarMagia(magiaAtual.id);
        
        // Remove apenas o botão memorizar
        const botaoMemorizar = document.querySelector('button[onclick="memorizarMagia()"]');
        if (botaoMemorizar) {
            botaoMemorizar.remove();
        }
        
        // Atualiza o status na página
        const titulo = document.querySelector('.magia-titulo');
        if (titulo && !titulo.innerHTML.includes('✓ Memorizada')) {
            titulo.innerHTML += ' <span style="color: #ffd700;">✓ Memorizada</span>';
        }
        
        alert(`${magiaAtual.nome} foi memorizada!`);
    }
}



document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const content = this.getAttribute('data-content');
        
        if (content === 'grimorio') {
            const resultado = await contentData[content]();
            document.getElementById('content-area').innerHTML = resultado;
            setTimeout(() => {
                atualizarBotoes();
                renderizarAcoesGrimorio();
            }, 0);
        } else if (content === 'cruzar') {
    const resultado = await contentData[content]();
    document.getElementById('content-area').innerHTML = resultado;
} else {
            const resultado = typeof contentData[content] === 'function' ? contentData[content]() : contentData[content];
            document.getElementById('content-area').innerHTML = resultado;
        }
    });
});


async function criarCruzarAnimais() {
    const listaAnimaisHtml = await obterListaAnimais();
    const dynamicConditions = await getArcanumConditions(); // ADICIONAR AWAIT AQUI
    
    const conditionsHtml = Object.entries(dynamicConditions).map(([key, value]) => {
        if (!value) return '';
        const icon = getConditionIcon(key, value);
        return `<span class="condition">${icon}<br>${value.replace('-', ' ').toUpperCase()}</span>`;
    }).join('');
    
    setTimeout(() => {
        document.getElementById('slot-1').addEventListener('click', () => removerAnimal('slot-1'));
        document.getElementById('slot-2').addEventListener('click', () => removerAnimal('slot-2'));
    }, 100);
    
    return `
        <div class="cruzar-container">
            <div class="conditions-display" style="margin-bottom: 20px; text-align: center; font-size: 12px; color: #feca57;">
                ${conditionsHtml}
            </div>
            <div id="mensagem-erro" style="color: red; text-align: center; margin-bottom: 10px; display: none;">Animais assim não geram descendência.</div>
            <div class="espaco-central" id="espaco-central">
                <div class="animal-slot" id="slot-1">Vazio</div>
                <div class="animal-slot" id="slot-2">Vazio</div>
            </div>
            <button class="cantar-btn" id="cantar-btn" onclick="cantarAnimais()">CANTAR</button>
            <div class="lista-animais" id="lista-animais">
                ${listaAnimaisHtml}
            </div>
        </div>
    `;
}

async function obterListaAnimais() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        return '<div class="sem-animais">Usuário não autenticado.</div>';
    }
    
    try {
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists() || !playerSnap.data().inventory?.itemsInChest) {
            return '<div class="sem-animais">Não pode ofertar descendência sem ter exemplares para cruzar.</div>';
        }
        
        const itemsInChest = playerSnap.data().inventory.itemsInChest;
        
        // Filtra apenas animais vivos (têm energia e energia.total > 0)
        const animais = itemsInChest.filter(item => 
            item.energia && 
            item.energia.total > 0
        );
        
        if (animais.length === 0) {
            return '<div class="sem-animais">Não pode ofertar descendência sem ter exemplares para cruzar.</div>';
        }
        
        // Testa ambas as propriedades para ver qual existe
        return animais.map(animal => {
            const nomeAnimal = animal.content || animal.nome || 'Animal sem nome';
            const vidaAnimal = animal.energia.total;
            return `<div class="animal-item" onclick="selecionarAnimal('${nomeAnimal}', ${vidaAnimal})">${nomeAnimal} - ${vidaAnimal} HP</div>`;
        }).join('');
        
    } catch (error) {
        console.error("Erro ao carregar animais:", error);
        return '<div class="sem-animais">Erro ao carregar animais.</div>';
    }
}


function selecionarAnimal(nome, vida) {
    const slot1 = document.getElementById('slot-1');
    const slot2 = document.getElementById('slot-2');
    
    if (slot1.textContent === 'Vazio') {
        slot1.textContent = `${nome} - ${vida} HP`;
        slot1.dataset.nome = nome;
    } else if (slot2.textContent === 'Vazio') {
        slot2.textContent = `${nome} - ${vida} HP`;
        slot2.dataset.nome = nome;
    }
}



function removerAnimal(slotId) {
    const slot = document.getElementById(slotId);
    slot.textContent = 'Vazio';
    delete slot.dataset.nome;
    
    // Esconder mensagem de erro quando remover animal
    const mensagem = document.getElementById('mensagem-erro');
    if (mensagem) {
        mensagem.style.display = 'none';
    }
}

function calcularChanceCruzamento(condicoes) {
    let chanceBase = 50;
    let modificadores = [];
    let especiais = [];
    
    // Lua (fator principal)
    const fatorLua = {
        'nova': 0.6,      // 30% chance
        'crescente': 1.0,  // 50% chance  
        'cheia': 1.7,     // 85% chance
        'minguante': 0.8   // 40% chance
    };
    chanceBase *= fatorLua[condicoes.lua] || 1.0;
    if (condicoes.lua === 'cheia') especiais.push('mutação rara');
    
    // Temperatura
    const fatorTemp = {
        'muito-frio': 0.5,  // 25%
        'frio': 1.2,        // 60%
        'ameno': 1.6,       // 80%
        'quente': 1.4,      // 70%
        'muito-quente': 0.7 // 35%
    };
    chanceBase *= fatorTemp[condicoes.temperatura] || 1.0;
    if (condicoes.temperatura === 'ameno') especiais.push('condições ideais');
    
    // Clima
    const fatorClima = {
        'sol-forte': 1.5,    // 75% + filhotes fortes
        'chuva-leve': 1.7,   // 85%
        'tempestade': 0.4,   // 20%
        'neblina': 1.3,      // 65% + albinismo
        'nublado': 1.4       // 70%
    };
    chanceBase *= fatorClima[condicoes.clima] || 1.0;
    if (condicoes.clima === 'sol-forte') especiais.push('filhote forte');
    if (condicoes.clima === 'neblina') especiais.push('chance albinismo');
    
    // Estação (fator importante)
    const fatorEstacao = {
        'primavera': 1.8,  // 90%
        'verao': 1.4,      // 70%
        'outono': 1.2,     // 60%
        'inverno': 0.6     // 30%
    };
    chanceBase *= fatorEstacao[condicoes.estacao] || 1.0;
    
    // Energia Mágica
    const fatorEnergia = {
        'alta': 1.4,          // 70% + habilidade especial
        'normal': 1.5,        // 75%
        'baixa': 1.1,         // 55%
        'interferencia': 0.8  // 40% + mutação bizarra
    };
    chanceBase *= fatorEnergia[condicoes.energiaMagica] || 1.0;
    if (condicoes.energiaMagica === 'alta') especiais.push('habilidade especial');
    if (condicoes.energiaMagica === 'interferencia') especiais.push('mutação bizarra');
    
    // Período do Dia
    const fatorPeriodo = {
        'madrugada': 1.6,  // 80%
        'manha': 1.5,      // 75%
        'tarde': 1.3,      // 65%
        'noite': 1.7       // 85%
    };
    chanceBase *= fatorPeriodo[condicoes.periodo] || 1.0;
    
    // Combinações especiais
    if (condicoes.lua === 'cheia' && condicoes.estacao === 'primavera' && condicoes.periodo === 'madrugada') {
        especiais.push('Ninhada Lunar');
        chanceBase *= 1.2;
    }
    
    if (condicoes.clima === 'tempestade' && condicoes.energiaMagica === 'alta') {
        especiais.push('Filhote Tempestuoso');
        chanceBase *= 1.1;
    }
    
    // Combinações mortais
    if ((condicoes.temperatura === 'muito-frio' && condicoes.clima === 'tempestade') ||
        (condicoes.temperatura === 'muito-quente' && condicoes.pressao === 'baixa')) {
        chanceBase = 0;
        especiais = ['Impossível'];
    }
    
    const chanceTotal = Math.min(100, Math.max(0, chanceBase));
    
    return {
        chance: Math.round(chanceTotal),
        especiais: especiais,
        condicoes: condicoes
    };
}



async function cantarAnimais() {
    const slot1 = document.getElementById('slot-1');
    const slot2 = document.getElementById('slot-2');
    const mensagem = document.getElementById('mensagem-erro');
    
    if (slot1.textContent !== 'Vazio' && slot2.textContent !== 'Vazio') {
        const primeiroNome1 = slot1.dataset.nome.split(' ')[0];
        const primeiroNome2 = slot2.dataset.nome.split(' ')[0];
        
        if (primeiroNome1 === primeiroNome2) {
            // ⬇️ Aqui está o ajuste importante
            const condicoes = await getArcanumConditions();
            const resultado = calcularChanceCruzamento(condicoes);
            
            console.log(`Chance de cruzamento: ${resultado.chance}%`, resultado);
            
            iniciarCruzamento(slot1.dataset.nome, slot2.dataset.nome, resultado);
        } else {
            mensagem.textContent = 'Animais assim não geram descendência.';
            mensagem.style.display = 'block';
        }
    } else {
        mensagem.textContent = 'Selecione dois animais para cruzar.';
        mensagem.style.display = 'block';
    }
}



function iniciarCruzamento(animal1, animal2, resultado) {
    const mensagem = document.getElementById('mensagem-erro');
    const numerosRomanos = ['X', 'IX', 'VIII', 'VII', 'VI', 'V', 'IV', 'III', 'II', 'I'];
    let contador = 0;
    
    // Desabilitar botões
    desabilitarBotoesCruzar(true);
    
    // Mostrar chance e condições
    const especialTexto = resultado.especiais.length > 0 ? ` (${resultado.especiais.join(', ')})` : '';
    
    mensagem.innerHTML = `
        <div class="contagem-container">
            <span>Cruzando ${animal1} com ${animal2}!</span>
            <span style="color: #feca57;">Chance: ${resultado.chance}%${especialTexto}</span>
            <span id="contador-romano">${numerosRomanos[contador]}</span>
            <span class="ampulheta">⧗</span>
        </div>
    `;
    mensagem.style.display = 'block';
    
    // Salvar resultado para usar depois
    window.resultadoCruzamento = resultado;
    
    // Iniciar contagem
    const intervalo = setInterval(() => {
        contador++;
        if (contador < numerosRomanos.length) {
            document.getElementById('contador-romano').textContent = numerosRomanos[contador];
        } else {
            clearInterval(intervalo);
            finalizarCruzamento();
        }
    }, 1000);
}


function finalizarCruzamento() {
    const mensagem = document.getElementById('mensagem-erro');
    const resultado = window.resultadoCruzamento;
    
    // Rolar para ver se teve sucesso
    const rolagem = Math.random() * 100;
    const sucesso = rolagem <= resultado.chance;
    
    if (sucesso) {
        const especialTexto = resultado.especiais.length > 0 ? ` ${resultado.especiais.join(' + ')}!` : '!';
        
        mensagem.innerHTML = `
            <div class="contagem-container">
                <span style="color: #00ff00;">Descendência gerada${especialTexto}</span>
                <button class="botao-recolher" onclick="recolherDescendencia()">Recolher</button>
            </div>
        `;
    } else {
        mensagem.innerHTML = `
            <div class="contagem-container">
                <span style="color: #ff6b6b;">Cruzamento falhou (${Math.round(rolagem)}% vs ${resultado.chance}%)</span>
                <button class="botao-recolher" onclick="limparCruzamento()">Tentar Novamente</button>
            </div>
        `;
    }
    
    // Reabilitar botões
    desabilitarBotoesCruzar(false);
}

function limparCruzamento() {
    const mensagem = document.getElementById('mensagem-erro');
    mensagem.style.display = 'none';
    removerAnimal('slot-1');
    removerAnimal('slot-2');
}


function desabilitarBotoesCruzar(desabilitar) {
    const botaoCantar = document.getElementById('cantar-btn');
    const slots = document.querySelectorAll('.animal-slot');
    const animaisLista = document.querySelectorAll('.animal-item');
    
    if (botaoCantar) {
        botaoCantar.disabled = desabilitar;
        botaoCantar.style.opacity = desabilitar ? '0.5' : '1';
        botaoCantar.style.cursor = desabilitar ? 'not-allowed' : 'pointer';
    }
    
    slots.forEach(slot => {
        slot.style.pointerEvents = desabilitar ? 'none' : 'auto';
        slot.style.opacity = desabilitar ? '0.5' : '1';
    });
    
    animaisLista.forEach(item => {
        item.style.pointerEvents = desabilitar ? 'none' : 'auto';
        item.style.opacity = desabilitar ? '0.5' : '1';
    });
}

function criarGriloVariant(condicoes, especiais) {
    console.log("🦗 ANÁLISE DE GRILO:");
    console.log("   Condições:", condicoes);
    console.log("   Especiais:", especiais);
    
    // Verificar condições especiais em ordem de prioridade
    
    // Combinação especial: Lua Cheia + Primavera + Madrugada
    if (especiais.includes('Ninhada Lunar')) {
        console.log("   ✅ GRILO LUNAR - Ninhada Lunar detectada");
        return {
            id: "grilo-lunar",
            content: "Grilo Lunar",
            description: "Um grilo místico que brilha suavemente no escuro com luz prateada",
            energia: { total: 1, inicial: 1 }
        };
    }
    
    // Neblina = Grilo Albino
    if (condicoes.clima === 'neblina') {
        console.log("   ✅ GRILO ALBINO - Clima neblina");
        return {
            id: "grilo-albino",
            content: "Grilo Albino",
            description: "Um raro grilo de cor branca pura, quase translúcido",
            energia: { total: 1, inicial: 1 }
        };
    }
    
    // Energia Alta = Grilo Elétrico
    if (condicoes.energiaMagica === 'alta') {
        console.log("   ✅ GRILO ELÉTRICO - Energia mágica alta");
        return {
            id: "grilo-eletrico",
            content: "Grilo Elétrico",
            description: "Um grilo que crepita com pequenas faíscas elétricas",
            energia: { total: 1, inicial: 1 }
        };
    }
    
    // Sol Forte = Grilo Dourado
    if (condicoes.clima === 'sol-forte') {
        console.log("   ✅ GRILO DOURADO - Sol forte");
        return {
            id: "grilo-dourado",
            content: "Grilo Dourado",
            description: "Um grilo com exoesqueleto dourado e resistência superior",
            energia: { total: 2, inicial: 2 }
        };
    }
    
    // Interferência Mágica = Grilo Mutante
    if (condicoes.energiaMagica === 'interferencia') {
        console.log("   ✅ GRILO MUTANTE - Interferência mágica");
        return {
            id: "grilo-mutante",
            content: "Grilo Mutante",
            description: "Um grilo com características bizarras e habilidades imprevisíveis",
            energia: { total: 1, inicial: 1 }
        };
    }
    
    // Grilo básico (padrão)
    console.log("   ⚪ GRILO NORMAL - Nenhuma condição especial atendida");
    return {
        id: "grilo",
        content: "Grilo",
        description: "Um pequeno grilo saltitante",
        energia: { total: 1, inicial: 1 }
    };
}



async function recolherDescendencia() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error('Usuário não autenticado');
        return;
    }
    
    try {
        const playerRef = doc(db, "players", userId);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists()) {
            console.error('Dados do jogador não encontrados');
            return;
        }
        
        const playerData = playerSnap.data();
        const inventory = playerData.inventory || {};
        const itemsInChest = inventory.itemsInChest || [];
        
        // Determinar tipo de grilo baseado nas condições
        const resultado = window.resultadoCruzamento;
        const condicoes = resultado.condicoes;
        let griloGerado = criarGriloVariant(condicoes, resultado.especiais);
        
        // Adiciona ao inventário
        itemsInChest.push(griloGerado);

// Salvar proeza se for grilo raro
let proezaMsg = null;
if (griloGerado.id === "grilo-albino") {
  proezaMsg = "ele trouxe música em miniatura. Um grilo. Raro. Vivo. Por quanto tempo? Ele obteve um Grilo Albino";
}
if (griloGerado.id === "grilo-mutante") {
  proezaMsg = "Um presente? Um presságio? Anoto, mas não aprovo. Ele obteve um Grilo Mutante (Mutação Rara)";
}
if (griloGerado.id === "grilo-eletrico") {
  proezaMsg = "Anoto aqui com relutância: o tolo apanhou um grilo raro.";
}
if (proezaMsg) {
  const dataAgora = new Date();
  const dataFormatada = dataAgora.toLocaleDateString('pt-BR') + ' ' + dataAgora.toLocaleTimeString('pt-BR');
  const mensagemProeza = `${proezaMsg} em ${dataFormatada}`;

  // Sempre busque o array mais recente do Firestore
  const playerSnapAtual = await getDoc(playerRef);
  const proezasAtuais = playerSnapAtual.exists() && playerSnapAtual.data().proezas ? playerSnapAtual.data().proezas : [];
  proezasAtuais.push(mensagemProeza);

  await setDoc(playerRef, { proezas: proezasAtuais }, { merge: true });
}
        
        // Remove a mensagem e limpa os slots
        const mensagem = document.getElementById('mensagem-erro');
        if (mensagem) {
            mensagem.style.display = 'none';
        }
        
        removerAnimal('slot-1');
        removerAnimal('slot-2');
        
        alert(`${griloGerado.content} adicionado ao inventário!`);
        
    } catch (error) {
        console.error('Erro ao adicionar grilo:', error);
        alert('Erro ao recolher descendência');
    }
}



// Torna funções acessíveis globalmente para onclick
window.mudarPagina = mudarPagina;
window.estudarMagia = estudarMagia;
window.memorizarMagia = memorizarMagia;
window.estudarProfundamente = estudarProfundamente;
window.responderMentalmente = responderMentalmente;
window.fecharOlhos = fecharOlhos;
window.selecionarAnimal = selecionarAnimal;
window.cantarAnimais = cantarAnimais;
window.recolherDescendencia = recolherDescendencia;
window.dormirTelaPreta = dormirTelaPreta;


const começos = [

{ texto: "Dentro de um castelo em ruínas", peso: 5 }, // RARO
  { texto: "Numa rua familiar, mas deserta", peso: 5 },
  { texto: "Num campo silencioso ao entardecer", peso: 10 },
  { texto: "À beira de um rio onde a água corre para cima", peso: 5 }, // incomum
    { texto: "Há um lugar onde", peso: 10 },
  { texto: "Em um campo aberto", peso: 10 },
  { texto: "Ao lado de um rio", peso: 10 },
  { texto: "Numa rua que você acha que conhece", peso: 8 },
  { texto: "Dentro de uma casa sem teto", peso: 7 },
  { texto: "Você vê pessoas esperando em silêncio", peso: 6 },
  { texto: "Você entra em um lugar familiar", peso: 8 },
  { texto: "Na margem de algo imenso", peso: 5 },
  { texto: "Alguém segura sua mão e", peso: 6 },
  { texto: "Você volta a um lugar que nunca viu", peso: 4 },
  { texto: "Na beira da floresta", peso: 8 },
  { texto: "Enquanto o sol se põe devagar", peso: 9 },
  { texto: "Debaixo de uma ponte", peso: 7 },
  { texto: "Em um corredor estreito", peso: 6 },
  { texto: "Você ouve passos e", peso: 5 },
  { texto: "Dentro de uma estação vazia", peso: 4 },
  { texto: "Há um animal parado", peso: 5 },
  { texto: "Num quintal sem portão", peso: 4 },
  { texto: "No topo de um morro isolado", peso: 5 },
  { texto: "Em um salão iluminado por velas", peso: 5 },
  { texto: "Na praia onde as ondas não quebram", peso: 3 },
  { texto: "Em um vilarejo sem moradores", peso: 3 },          
  { texto: "Em um trem que nunca chega", peso: 3 },
  { texto: "No silêncio de uma biblioteca vazia", peso: 4 },
  { texto: "Num celeiro esquecido", peso: 3 },
  { texto: "No fundo de um cais antigo", peso: 3 },
  { texto: "Em uma caverna escura", peso: 5 },
  { texto: "Na crista de uma montanha gelada", peso: 5 },     
  { texto: "Nos escombros de uma cidade perdida", peso: 5 },
  { texto: "Num labirinto de corredores brancos", peso: 5 },
  { texto: "Em meio a estátuas sem rosto", peso: 2 },      
  { texto: "Num teatro sem plateia", peso: 2 },             
  { texto: "Na cozinha de uma casa intocada", peso: 5 },
  { texto: "Embaixo de uma árvore que não floresce", peso: 5 }, 
  { texto: "Na borda de um penhasco", peso: 5 },
  { texto: "Sobre um rio congelado", peso: 3 },
  { texto: "Num deserto coberto de neblina", peso: 5 },     
  { texto: "Num navio fantasma ancorado", peso: 5 },       
  { texto: "Num campo de girassóis murchos", peso: 3 },
  { texto: "Dentro de um castelo em ruínas", peso: 5 },    
  { texto: "Num asilo silencioso", peso: 5 },              
  { texto: "Num altar sem oferenda", peso: 5 },           
  { texto: "Em um beco sem saída", peso: 4 },
  { texto: "Num jardim sem flores", peso: 3 },
  { texto: "No salão de espelhos quebrados", peso: 4 },    
  { texto: "Em meio a nuvens de poeira", peso: 3 },
  { texto: "Na sombra de um farol apagado", peso: 3 },
  { texto: "Na cratera de um vulcão adormecido", peso: 4 },
  { texto: "Em um pátio cercado por muros altos", peso: 3 },
  { texto: "No túnel de um metrô desativado", peso: 3 },
  { texto: "Na cobertura de um prédio abandonado", peso: 3 },
  { texto: "Na sala de aula trancada", peso: 4 },
  { texto: "Num hospital inundado", peso: 4 },               

    // comuns a moderados
  { texto: "Na varanda de um casarão antigo", peso: 6 },
  { texto: "Em um circo sem palhaços", peso: 5 },
  { texto: "Em uma estação de rádio silenciosa", peso: 6 },
  { texto: "No centro de um labirinto de espinhos", peso: 4 },
  { texto: "Em um porão guardado pelo silêncio", peso: 6 },
  { texto: "Num portão rangendo ao vento", peso: 7 },
  { texto: "No cais onde navios já naufragaram", peso: 5 },
  { texto: "Na colina onde as árvores não crescem", peso: 5 },
  { texto: "Embaixo de um toldo rasgado", peso: 6 },
  { texto: "No meio de uma sala vazia", peso: 8 },
  { texto: "Perto de um relógio parado", peso: 8 },
  { texto: "Sobre trilhos que não conduzem a lugar algum", peso: 4 },
  { texto: "Num terraço coberto de hera", peso: 6 },
  { texto: "Perto de uma ponte quebrada", peso: 7 },
  { texto: "Em um campo onde as sombras dançam", peso: 5 },
  { texto: "Num corredor iluminado por lâmpadas tremeluzentes", peso: 5 },

  // raros e perturbadores
  { texto: "No fundo de uma escola vazia", peso: 1 },
  { texto: "Dentro de um castelo em ruínas", peso: 1 },
  { texto: "Em uma estação de trem onde não há trilhos", peso: 1 },
  { texto: "Num campo sem horizonte", peso: 1 },
  { texto: "Atrás do espelho do seu antigo quarto", peso: 1 },
  { texto: "Sob uma árvore que cresce ao contrário", peso: 1 },
  { texto: "Num quarto idêntico ao seu, mas com móveis trocados", peso: 1 },
  { texto: "Num porão onde todas as luzes estão acesas", peso: 1 },
  { texto: "Dentro de um elevador que não para de subir", peso: 1 },
  { texto: "Num corredor de hospital sem fim", peso: 1 },
  { texto: "Numa cidade onde todas as casas são iguais", peso: 1 },
  { texto: "Na sala onde você cresceu, mas tudo está molhado", peso: 1 },
  { texto: "Num banheiro com dezenas de espelhos", peso: 1 },
  { texto: "No silêncio entre dois trovões", peso: 1 },
  { texto: "Num ônibus que só anda em marcha ré", peso: 1 },
  { texto: "Na rua onde você morou, mas tudo está coberto de cinzas", peso: 1 }
 
 
];

const imagens = [
{ texto: "uma criança desenha você com uma exatidão impossível.", peso: 1 }, // RARO
  { texto: "há um animal semelhante a um pato, imóvel, como se soubesse que não pertence ali.", peso: 10 },
  { texto: "uma multidão observa um céu que muda de forma lentamente, mas sem parar.", peso: 5 },
  { texto: "você reconhece um rosto que nunca viu antes e sabe que ele odeia você.", peso: 2 },

    { texto: "um cachorro observa o rio como se esperasse algo.", peso: 5 },
  { texto: "há crianças brincando com bonecas que parecem feitas de vidro.", peso: 4 },
  { texto: "uma mulher acende velas para um pássaro morto.", peso: 3 },
  { texto: "os peixes nadam no ar acima do lago.", peso: 5 },
  { texto: "uma fila de pessoas espera diante de uma porta trancada.", peso: 4 },
  { texto: "você encontra uma carta escrita por alguém que ainda não nasceu.", peso: 3 },
  { texto: "uma bicicleta enferrujada se move sozinha pela estrada.", peso: 4 },
  { texto: "os talheres flutuam em volta da mesa, mas ninguém repara.", peso: 3 },
  { texto: "uma criança diz que o mundo acabou ontem.", peso: 4 },
  { texto: "você encontra um armário cheio de seus próprios sapatos.", peso: 3 },
  { texto: "há um mercado onde ninguém vende nada, mas todos estão comprando.", peso: 3 },
  { texto: "uma fogueira arde dentro de uma pia.", peso: 3 },
  { texto: "alguém sorri com seu rosto.", peso: 2 },
  { texto: "há um animal deitado no sofá, como se fosse da família.", peso: 4 },
  { texto: "o mar recua até sumir completamente.", peso: 5 },
  { texto: "as nuvens formam letras que você tenta ler.", peso: 4 },
  { texto: "alguém tenta te acordar, mas você não consegue lembrar quem é.", peso: 3 },

  { texto: "um velho toca piano no fundo de uma piscina vazia.", peso: 2 },
  { texto: "há livros enterrados no jardim, com as páginas ainda secas.", peso: 3 },
  { texto: "um poste de luz pisca em código Morse, mas ninguém responde.", peso: 3 },
  { texto: "você vê seu próprio quarto dentro de uma televisão antiga.", peso: 4 },
  { texto: "um menino segura uma caixa e diz que ela contém o vento.", peso: 3 },
  { texto: "há um hospital abandonado onde os relógios andam para trás.", peso: 2 },
  { texto: "um trem atravessa um campo de trigo às três da manhã, sem trilhos.", peso: 3 },
  { texto: "você observa a si mesmo dormindo, mas de outro quarto.", peso: 4 },
  { texto: "uma mulher coloca cartas em envelopes e os joga no rio.", peso: 3 },
  { texto: "há um poço onde as moedas sussurram quando caem.", peso: 3 },
  { texto: "um homem chora diante de um espelho coberto por lençol.", peso: 3 },
  { texto: "há uma casa sem portas, apenas janelas abertas.", peso: 4 },
  { texto: "um cão uiva para um balão preso em uma árvore.", peso: 4 },
  { texto: "você vê um funeral onde ninguém parece saber quem morreu.", peso: 3 },
  { texto: "uma ponte liga dois telhados de prédios diferentes.", peso: 4 },
  { texto: "uma criança desenha você com uma exatidão impossível.", peso: 3 },
  { texto: "há um campo onde todos os espantalhos olham para você.", peso: 3 },
  { texto: "alguém varre folhas no fundo do mar.", peso: 2 },
  { texto: "um avião estacionado em um estacionamento de supermercado.", peso: 2 },
  { texto: "as roupas no varal se movem como se estivessem dançando.", peso: 4 },
  { texto: "um urso toma chá com duas senhoras em uma varanda.", peso: 2 },
  { texto: "as placas de trânsito brilham mesmo sem luz.", peso: 4 },
  { texto: "você vê uma porta no meio de um campo vazio.", peso: 4 },
  { texto: "um homem alimenta pombos com migalhas de um livro rasgado.", peso: 3 },
  { texto: "um ônibus escolar vazio atravessa um túnel debaixo d’água.", peso: 3 },
  { texto: "há um palco montado no topo de uma árvore.", peso: 3 },
  { texto: "as paredes da casa respiram devagar.", peso: 4 },
  { texto: "um carro estacionado está coberto por folhas, mas é verão.", peso: 3 },

    { texto: "alguém coloca sal em volta de uma bicicleta.", peso: 4 },
  { texto: "você vê sapatos arrumados como se esperassem uma reunião.", peso: 4 },
  { texto: "um barco à vela preso no meio de uma estrada.", peso: 4 },
  { texto: "há uma sombra andando sem ninguém.", peso: 3 },
  { texto: "alguém planta relógios em pequenos vasos.", peso: 3 },
  { texto: "uma criança diz que o sol está dormindo hoje.", peso: 3 },
  { texto: "as estátuas de um museu se viram para te olhar.", peso: 4 },
  { texto: "você recebe uma carta assinada por um nome que te assusta.", peso: 3 },
  { texto: "há pessoas sentadas em um restaurante, mas só bebem água.", peso: 4 },
  { texto: "um balde coleta lágrimas em uma sala vazia.", peso: 3 },
  { texto: "você pisa em ovos e nenhum quebra.", peso: 4 },
  { texto: "um peixe salta de uma tigela para uma lareira acesa.", peso: 4 },
  { texto: "um homem oferece um guarda-chuva mesmo sem chuva.", peso: 4 },
  { texto: "você encontra sua cama no meio de uma floresta.", peso: 4 },
  { texto: "uma porta gira sozinha, devagar, como se cansada.", peso: 4 },
  { texto: "há um quarto onde o teto toca o chão.", peso: 3 },
  { texto: "os quadros pendurados na parede estão de costas.", peso: 4 },
  { texto: "uma mulher fala com uma planta, e ela responde.", peso: 3 },
  { texto: "uma criança abre a geladeira e encontra neve.", peso: 3 },
  { texto: "há um campo de girassóis com olhos no centro.", peso: 3 },
  { texto: "uma mão desenhada na parede tenta segurar a sua.", peso: 2 },
  { texto: "as árvores andam alguns metros quando ninguém vê.", peso: 2 },
  { texto: "você vê sua infância sentada em um banco de praça.", peso: 3 },
  { texto: "um rádio toca sussurros ao invés de música.", peso: 3 },
  { texto: "as janelas mostram lugares diferentes do que há lá fora.", peso: 4 },
  { texto: "uma senhora vende memórias em potes de vidro.", peso: 3 },
  { texto: "você pisa em uma calçada que canta baixinho.", peso: 4 },
  { texto: "um gato dorme dentro de um relógio antigo.", peso: 3 },
  { texto: "há uma escada que sobe até o fundo de um lago.", peso: 2 },
  { texto: "alguém pinta o céu de cinza com um rolo.", peso: 3 },
  { texto: "um vendedor oferece maçãs que brilham no escuro.", peso: 4 },
  { texto: "há uma escola com apenas uma cadeira e dois quadros.", peso: 3 },
  { texto: "uma loja vende retratos de pessoas que nunca existiram.", peso: 3 },
  { texto: "um homem sopra bolhas que não estouram nunca.", peso: 4 },
  { texto: "você entra em um elevador que sobe, mas o mundo desce.", peso: 4 },
  { texto: "há uma estação de trem onde todos os trilhos levam ao mesmo lugar.", peso: 3 },
  { texto: "um armário aberto mostra uma praia iluminada.", peso: 3 },
  { texto: "você vê palavras escritas no chão com pétalas.", peso: 3 },
  { texto: "um cachorro late sem abrir a boca.", peso: 4 },
  { texto: "há um rio que corre de volta para a nascente.", peso: 3 },
  { texto: "alguém lê um jornal do dia seguinte.", peso: 3 },
  { texto: "as pessoas piscam ao mesmo tempo e desaparecem por um segundo.", peso: 2 },
  { texto: "uma criança segura uma vela acesa dentro da chuva.", peso: 4 },
  { texto: "há uma maçaneta no chão de pedra.", peso: 3 },
  { texto: "um homem desenha rostos na neblina.", peso: 3 },
  { texto: "você vê estrelas caindo para cima.", peso: 2 },
  { texto: "um sino toca toda vez que você pisca.", peso: 3 },
  { texto: "há uma caixa de música que toca risos.", peso: 3 },
  { texto: "as laranjas no cesto têm olhos fechados.", peso: 3 },
  { texto: "um peixe canta em cima da geladeira.", peso: 3 },
  { texto: "uma mulher atravessa a rua de olhos fechados com segurança.", peso: 4 },
  { texto: "você encontra um copo com seu nome já escrito.", peso: 3 },
  { texto: "há um quadro-negro com frases escritas por sua avó.", peso: 3 },
  { texto: "as sombras sobem pelas paredes ao amanhecer.", peso: 3 },
  { texto: "um bebê segura uma bengala e diz que é seu avô.", peso: 2 },
  { texto: "há uma carta no seu bolso escrita por alguém que você amava.", peso: 3 },

    { texto: "um gato te segue por um sonho inteiro sem nunca piscar.", peso: 5 },
  { texto: "uma estante de livros gira sozinha e revela uma sala.", peso: 5 },
  { texto: "você toca em um espelho e ele afunda como água.", peso: 5 },
  { texto: "há um metrônomo batendo dentro de uma flor.", peso: 5 },
  { texto: "um vendedor vende mapas que mostram apenas onde você chorou.", peso: 5 },
  { texto: "você se vê rindo, mas não sabe o motivo.", peso: 5 },
  { texto: "as pessoas andam de costas nas ruas.", peso: 5 },
  { texto: "um semáforo muda de cor para roxo e todos param.", peso: 5 },
  { texto: "há um quadro de você mesmo, mas mais velho e assustado.", peso: 5 },
  { texto: "um gato entra por uma janela e sai por outra década.", peso: 5 },
  { texto: "você segura a mão de alguém e sente saudade.", peso: 5 },
  { texto: "há um rio com nomes escritos na espuma.", peso: 5 },
  { texto: "as pedras do chão tentam formar palavras.", peso: 5 },
  { texto: "uma pessoa tira fotos com uma câmera sem lente.", peso: 5 },
  { texto: "você vê uma estrela dentro de um copo d’água.", peso: 5 },
  { texto: "há uma bandeira tremulando mesmo sem vento.", peso: 5 },
  { texto: "um homem pede desculpas a uma árvore e abraça o tronco.", peso: 5 },
  { texto: "você encontra sua própria assinatura em uma pedra antiga.", peso: 5 },

  // bizarros intermediários (peso 4)
  { texto: "um relógio marca um horário impossível, como 25:61.", peso: 4 },
  { texto: "um elevador teme cair e bloqueia o botão de emergência.", peso: 4 },
  { texto: "uma lâmpada sussurra segredos antigos quando acesa.", peso: 4 },
  { texto: "os móveis trocam de forma sempre que você pisca.", peso: 4 },
  { texto: "uma porta surge no chão e se abre para dentro.", peso: 4 },
  { texto: "um pássaro com espelho no peito reflete seu olhar.", peso: 4 },
  { texto: "um espantalho convida você para tomar chá.", peso: 4 },
  { texto: "um tapete se desenrola e revela um rio sob seus pés.", peso: 4 },
  { texto: "as paredes escorrem tinta que fala seu nome.", peso: 4 },
  { texto: "um livro lê seu dono em voz alta.", peso: 4 },
  { texto: "você vê seus próprios passos dançando sem você.", peso: 4 },
  { texto: "o sol nasce no oeste e deixa um rastro de gelo.", peso: 4 },
  { texto: "a grama cresce ao ritmo de uma canção sem voz.", peso: 4 },
  { texto: "um piano toca sozinho na beira de um penhasco.", peso: 4 },
  { texto: "os relógios batem como corações pulsantes.", peso: 4 },
  { texto: "uma criança sorri sem demonstrar alegria.", peso: 4 },
  { texto: "um gato atravessa uma porta de espelhos infinitos.", peso: 4 },
  { texto: "você sente o sopro de uma tempestade invisível.", peso: 4 },
  { texto: "a chuva cai em câmera lenta, como gotas de vidro.", peso: 4 },
  { texto: "um telefone toca, mas não há quem atenda.", peso: 4 },
  { texto: "as sombras executam uma dança sincronizada.", peso: 4 },
  { texto: "um rio de areia flui como se fosse água corrente.", peso: 4 },
  { texto: "um selo de vidro lacra sua testa sem dor.", peso: 4 },
  { texto: "uma nuvem passeia pelo corredor sem tocar o teto.", peso: 4 },
  { texto: "os azulejos do chão cantam uma melodia triste.", peso: 4 },
  { texto: "um sapato calça seu pé sem nunca tocá-lo.", peso: 4 },
  { texto: "a lua se reflete em uma poça de óleo negro.", peso: 4 },
  { texto: "um coelho marca as horas com cada pulo.", peso: 4 },
  { texto: "as tochas se apagam sozinhas, deixando rastros de luz.", peso: 4 },
  { texto: "uma escultura sussurra contos de sonhos antigos.", peso: 4 },
  { texto: "o vento escreve mensagens na areia do piso.", peso: 4 },
  { texto: "um vibrato percorre os ossos do edifício.", peso: 4 },
  { texto: "um camaleão confunde o próprio reflexo.", peso: 4 },
  { texto: "um sino é tocado por mãos invisíveis.", peso: 4 },
  { texto: "as plantas se inclinam ao ritmo de seus passos.", peso: 4 },
  { texto: "um quadro absorve a cor de tudo ao redor.", peso: 4 },
  { texto: "uma poça reflete um céu que não existe.", peso: 4 },
  { texto: "as luminárias pulsam como lanternas de vaga-lume.", peso: 4 },
  { texto: "um barulho de passos segue em padrões rítmicos.", peso: 4 },
  { texto: "os livros se abrem sozinhos em um capítulo perdido.", peso: 4 },
  { texto: "a água de um copo se transforma em fumaça.", peso: 4 },
  { texto: "um chalé desmonta-se e revela segredos no sótão.", peso: 4 },
  { texto: "um par de sapatos dança sem par.", peso: 4 },
  { texto: "uma vitrine mostra o seu próprio passado.", peso: 4 },
  { texto: "os sinos de vento tocam melodias desconcertantes.", peso: 4 },
  { texto: "um farol pisca no meio de uma sala escura.", peso: 4 },
  { texto: "teias de aranha pendem coroas de luz.", peso: 4 },
  { texto: "um urso de pelúcia pisca para você.", peso: 4 },
  { texto: "as portas se fecham depois de você entrar.", peso: 4 },
  { texto: "uma vespa faz sombra de borboleta.", peso: 4 },
  { texto: "um relógio de sol projeta sua sombra ao meio-dia.", peso: 4 },
  { texto: "uma escultura de gelo não derrete, mesmo no fogo.", peso: 4 },
  { texto: "os espelhos escondem lembranças antigas.", peso: 4 },
  { texto: "um marinheiro chora lágrimas de tinta.", peso: 4 },
  { texto: "uma bota caminha até a porta e espera por você.", peso: 4 },

  // raros e perturbadores (peso 1)
  { texto: "uma criança desenha você com uma exatidão impossível.", peso: 1 },
  { texto: "você vê um corpo vestido como você, mas o rosto está ausente.", peso: 1 },
  { texto: "todas as pessoas olham para você, mas com os olhos virados ao contrário.", peso: 1 },
  { texto: "alguém diz seu nome do jeito exato que você odeia ouvir.", peso: 1 },
  { texto: "um animal morto tenta entrar pela janela, com muito cuidado.", peso: 1 },
  { texto: "você ouve seus pais chorando embaixo do chão.", peso: 1 },
  { texto: "um telefone toca sem parar, mas quando você atende, está ouvindo sua própria voz pedindo socorro.", peso: 1 },
  { texto: "há fotos suas envelhecidas, como se você tivesse morrido há décadas.", peso: 1 },
  { texto: "sua mão está segurando algo que não consegue soltar, mas você não enxerga o que é.", peso: 1 },
  { texto: "alguém sussurra um segredo que você sente que sempre soube, mas não quer lembrar.", peso: 1 },
  { texto: "um espelho mostra alguém que copia seus movimentos com atraso.", peso: 1 },
  { texto: "você sente que algo foi arrancado de você, mas não sabe o quê.", peso: 1 },
  { texto: "um grupo de pessoas canta sua história em uma língua que você entende e esquece ao mesmo tempo.", peso: 1 },
  { texto: "uma criatura usa seu rosto para pedir perdão.", peso: 1 },
  { texto: "todos ao seu redor fingem que você não está ali ― até você parar de se mover.", peso: 1 },
  { texto: "você escreve uma carta para alguém que nunca vai existir.", peso: 1 },
  { texto: "uma versão sua menor está trancada num aquário, batendo nas paredes de vidro.", peso: 1 },
  { texto: "um buraco se abre na sua barriga e começa a contar os dias.", peso: 1 },
  { texto: "há dentes crescendo nas costas da sua língua.", peso: 1 },
  { texto: "uma gravação mostra você acordando todos os dias e esquecendo o mesmo crime.", peso: 1 }
    
];

const totalPesoComecos  = começos.reduce((sum, x) => sum + x.peso, 0);
const totalPesoImagens = imagens.reduce((sum, x) => sum + x.peso, 0);

// limites automático (ainda disponíveis, se precisar)
const minTotal = Math.min(...começos.map(x => x.peso))
               + Math.min(...imagens.map(x => x.peso));
const maxTotal = Math.max(...começos.map(x => x.peso))
               + Math.max(...imagens.map(x => x.peso));

// thresholds fixos para classificação
const limiarRaro    = 4;  // total < 4  → “Raro”
const limiarIncomum = 7;  // 4 ≤ total < 7 → “Incomum”

function classificarRaridade(total) {
  if (total < limiarRaro)       return 'Raro';
  if (total < limiarIncomum)    return 'Incomum';
  return 'Comum';
}



function sortearComPeso(array) {
  const soma = array.reduce((acc, item) => acc + item.peso, 0);
  let alea = Math.random() * soma;

  for (const item of array) {
    if (alea < item.peso) return item;
    alea -= item.peso;
  }
  return array[0];
}

function gerarSonho() {
  const c = sortearComPeso(começos);
  const i = sortearComPeso(imagens);
  const total = c.peso + i.peso;
  const categoria = classificarRaridade(total);

  // Probabilidade daquele par específico: P(c) * P(i)
  const prob = (c.peso / totalPesoComecos) * (i.peso / totalPesoImagens);
  const percent = (prob * 100).toFixed(2) + '%';
  const odds = Math.round(1 / prob);

  console.log(
    `Raridade total do sonho: ${total} ` +
    `(categoria "${categoria}"), ` +
    `Probabilidade: ${percent} (ou 1 em ${odds})`
  );

  return `${c.texto}… ${i.texto}`;
}


function dormirTelaPreta() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: black;
    z-index: 99999;
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 2s ease;
    flex-direction: column;
  `;

  const mensagem = document.createElement('div');
  mensagem.textContent = 'Você adormece...';
  mensagem.style.cssText = `
    color: #fff;
    font-size: 2rem;
    opacity: 0;
    transition: opacity 3s ease;
    font-family: 'VT323', monospace;
    text-align: center;
    max-width: 80vw;
    margin-bottom: 3rem;
  `;

  const fraseSonho = document.createElement('div');
  fraseSonho.textContent = ''; // Vai receber o sonho depois
  fraseSonho.style.cssText = `
    color: #aaa;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 2s ease;
    font-family: 'VT323', monospace;
    text-align: center;
    max-width: 80vw;
    margin-bottom: 2rem;
  `;

  const botoes = document.createElement('div');
  botoes.style.cssText = `
    display: flex;
    gap: 2rem;
    opacity: 0;
    transition: opacity 2s ease;
  `;

  const btnRecordar = document.createElement('button');
  btnRecordar.textContent = 'Recordar';

  const btnEsquecer = document.createElement('button');
  btnEsquecer.textContent = 'Esquecer';

  [btnRecordar, btnEsquecer].forEach(btn => {
    btn.style.cssText = `
      background: none;
      border: 1px solid #555;
      color: #ccc;
      font-family: 'VT323', monospace;
      font-size: 1.5rem;
      padding: 0.5rem 1.5rem;
      cursor: pointer;
      transition: background 0.3s;
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.background = '#222';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = 'none';
    });
  });

  btnEsquecer.addEventListener('click', async () => {
    await registrarEsquecimento();
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 2000);
  });

  btnRecordar.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 2000);
  });

  botoes.appendChild(btnRecordar);
  botoes.appendChild(btnEsquecer);

  overlay.appendChild(mensagem);
  overlay.appendChild(fraseSonho);
  overlay.appendChild(botoes);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    mensagem.style.opacity = '1';
  }, 2000);

  setTimeout(() => {
    fraseSonho.textContent = gerarSonho();
    fraseSonho.style.opacity = '1';
  }, 5000);

  setTimeout(() => {
    botoes.style.opacity = '1';
  }, 7000);
}


function aplicarEfeitosAleatorios() {
    const eficiencia = parseFloat(window.arcanumIudicium.getEficiencia());
    
    if (eficiencia >= 80) {
        // 70% chance para itálico
        if (Math.random() < 0.7) {
            // Só aplica em descrição, não em stats que têm HTML complexo
            const elementos = document.querySelectorAll('.magia-descricao');
            if (elementos.length > 0) {
                const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
                
                const texto = elementoAleatorio.innerHTML;
                const palavras = texto.split(' ');
                const palavraAleatoria = Math.floor(Math.random() * palavras.length);
                
                // Só aplica se a palavra não contém HTML
                if (!palavras[palavraAleatoria].includes('<') && !palavras[palavraAleatoria].includes('>')) {
                    palavras[palavraAleatoria] = `<em>${palavras[palavraAleatoria]}</em>`;
                    elementoAleatorio.innerHTML = palavras.join(' ');
                }
            }
        }
        
    } else if (eficiencia < 30) {
        // 40% chance para piscar
        if (Math.random() < 0.4) {
            const elementos = document.querySelectorAll('.magia-descricao, .magia-stats div');
            const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
            elementoAleatorio.style.animation = 'piscar 0.3s ease-in-out 3';
        }
        // 30% chance para desaparecer
        else if (Math.random() < 0.3) {
            const elementos = document.querySelectorAll('.magia-descricao, .magia-stats div');
            const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
            elementoAleatorio.style.animation = 'desaparecer 0.6s ease-in-out';
        }
        
    } else {
        // 60% chance para tremular (eficiência baixa)
        if (Math.random() < 0.6) {
            const elementos = document.querySelectorAll('.magia-descricao, .magia-stats div');
            const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
            elementoAleatorio.style.animation = 'tremular 0.5s ease-in-out 2';
        }
    }
}



