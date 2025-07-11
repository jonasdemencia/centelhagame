// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
    dormir: "Dormir para dentro - não existe sono, a pessoa dorme se quiser",
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
    
    // Verificar se magia atual está memorizada
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



function criarPaginaMagia(index) {
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
const intencaoHtml = jaEstudada ? `<div class="magia-intencao" style="margin: 15px 0; font-size: 13px; color: #c5bebe; font-weight: bold;"><strong>Intenção:</strong> ${intencoesMagias[magia.id]}</div>` : '';
    const reflexaoSalva = window.arcanumIudicium.reflexoesSalvas[magia.id];
const reflexaoHtml = reflexaoSalva ? `<div class="magia-julgamento" style="margin: 15px 0; font-size: 13px; color: #8B4513; font-weight: bold; font-style: italic;">${reflexaoSalva}</div>` : '';
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
    if (novaPagina < 0 || novaPagina >= magias.length) return;

    const magiaContent = document.getElementById('magia-content');
    const paginaAtiva = magiaContent.querySelector('.magia-page');

    paginaAtiva.classList.remove('active');

    setTimeout(async () => {
        paginaAtual = novaPagina;
        magiaContent.innerHTML = criarPaginaMagia(paginaAtual);
        document.querySelector('.page-number').textContent = `Página ${paginaAtual + 1}`;
        renderizarAcoesGrimorio();
        atualizarBotoes();
    }, 300);
}



function atualizarBotoes() {
    document.getElementById('prev-btn').disabled = paginaAtual === 0;
    document.getElementById('next-btn').disabled = paginaAtual === magias.length - 1;
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
        } else {
            const resultado = typeof contentData[content] === 'function' ? contentData[content]() : contentData[content];
            document.getElementById('content-area').innerHTML = resultado;
        }
    });
});

// Função para cruzar animais
function criarCruzarAnimais() {
    setTimeout(() => {
        document.getElementById('slot-1').addEventListener('click', () => removerAnimal('slot-1'));
        document.getElementById('slot-2').addEventListener('click', () => removerAnimal('slot-2'));
    }, 100);
    
    return `
        <div class="cruzar-container">
            <div class="espaco-central" id="espaco-central">
                <div class="animal-slot" id="slot-1">Vazio</div>
                <div class="animal-slot" id="slot-2">Vazio</div>
            </div>
            <button class="cantar-btn" id="cantar-btn" onclick="cantarAnimais()">CANTAR</button>
            <div class="lista-animais" id="lista-animais">
                ${obterListaAnimais()}
            </div>
        </div>
    `;
}

function obterListaAnimais() {
    const inventario = [
        { nome: "Lobo Sombrio", vida: 85 },
        { nome: "Corvo Ancestral", vida: 120 },
        { nome: "Serpente de Ferro", vida: 95 }
    ];
    
    const animais = inventario.filter(item => item.vida > 0);
    
    if (animais.length === 0) {
        return '<div class="sem-animais">Não pode ofertar descendência sem ter exemplares para cruzar.</div>';
    }
    
    return animais.map(animal => 
        `<div class="animal-item" onclick="selecionarAnimal('${animal.nome}', ${animal.vida})">${animal.nome} - ${animal.vida} HP</div>`
    ).join('');
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
}

function cantarAnimais() {
    const slot1 = document.getElementById('slot-1');
    const slot2 = document.getElementById('slot-2');
    
    if (slot1.textContent !== 'Vazio' && slot2.textContent !== 'Vazio') {
        alert(`Cruzando ${slot1.dataset.nome} com ${slot2.dataset.nome}!`);
    } else {
        alert('Selecione dois animais para cruzar.');
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



