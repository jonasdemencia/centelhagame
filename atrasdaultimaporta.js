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
                    ultimaCategoria: this.ultimaCategoria
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
                console.log(`Arcanum Iudicium carregado: ${this.sucessos} sucessos, ${this.falhas} falhas, categoria: ${this.ultimaCategoria}`);
            } else {
                console.log("Arcanum Iudicium: Nenhum dado encontrado no Firestore - iniciando com valores zerados");
            }
        } catch (error) {
            console.error("Erro ao carregar Arcanum Iudicium:", error);
        }
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
        }, 10);
        
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
            digitar();
        }, 300);
    });
}



const magias = [
    {
        nome: "Armadura Arcana",
        nomeVerdadeiro: "Vestes de Recusa",
        descricao: "O conjurador se cobre de memória sólida, de palavras que nunca deixaram o papel.\nA página se dobra, formando um molde invisível ao redor do corpo.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: "Retalho da pele de quem já sobreviveu a mais de uma sentença"
    },
    {
        nome: "Causar Medo (TIMORIS)",
        nomeVerdadeiro: "Eco do Berro Não Nascido",
        descricao: "A página emite um som que não se ouve.\nAqueles que têm pouco sangue para perder sentem sua espinha entortar sob o peso do \"e se\".",
        custo: 3,
        efeito: "Fugir de terror (alvos com < 40 HP)",
        componente: null
    },
    {
        nome: "Cura Maior",
        nomeVerdadeiro: "Cântico do Coração que Teima",
        descricao: "Um poema partido em três partes, lido em silêncio. O papel absorve o desespero e o transforma em sopro vital.\nExige do conjurador fé em algo que talvez já tenha morrido.",
        custo: 2,
        efeito: "Cura profunda (10d8+1)",
        componente: null
    },
    {
        nome: "Cura Menor (SANITAS)",
        nomeVerdadeiro: "Murmúrio do Sangue Quieto",
        descricao: "Uma prece curta inscrita nas margens da página, ativada por compaixão ou temor.\nO grimório sussurra memórias de infância, quando dor era cuidada com mãos e lágrimas.",
        custo: 2,
        efeito: "Cura leve (1d8)",
        componente: null
    },
    {
        nome: "Dardos Místicos (FULMEN)",
        nomeVerdadeiro: "Olhar Afiado do Inominado",
        descricao: "As linhas saltam da página como farpas etéreas. Cada letra se torna uma lança de pensamento puro.\nNão mira a carne, mas a hesitação entre as costelas.",
        custo: 1,
        efeito: "Dano (1d4)",
        componente: null
    },
    {
        nome: "Escudo Arcano (AEGIS)",
        nomeVerdadeiro: "Círculo do Não-Tocar",
        descricao: "Linhas em espiral giram na página como se gravadas à unha.\nProtege não com força, mas com intenção perfeita.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: null
    },
    {
        nome: "Luz (LUMINA)",
        nomeVerdadeiro: "Vislumbre da Aurora que Queima",
        descricao: "A tinta brilha no escuro da página, irradiando luz branca.\nNão ilumina o caminho — apenas o erro dos olhos alheios.",
        custo: 2,
        efeito: "Ofuscamento (precisão -3)",
        componente: null
    },
    {
        nome: "Pasmar (OBSTUPRA)",
        nomeVerdadeiro: "Silêncio do Instante Rachado",
        descricao: "Ao pronunciar essa palavra, o tempo hesita.\nO inimigo sente que algo o observava antes dele existir.",
        custo: 3,
        efeito: "Perda de turno (alvos com < 50 HP)",
        componente: "O resíduo macio de uma nota que foi tocada para ninguém ouvir"
    },
    {
        nome: "Raio de Ácido (CORRODO)",
        nomeVerdadeiro: "Chuva da Boca Amarga",
        descricao: "Cada gota conjurada contém o azedume de uma palavra não dita.\nO papel escorre enquanto você lê — e quem vê, sente arder.",
        custo: 1,
        efeito: "Dano ácido (1d3)",
        componente: null
    },
    {
        nome: "Sono (QUIESCAS)",
        nomeVerdadeiro: "Cântico da Pálpebra Frágil",
        descricao: "Cada linha é um sussurro que pesa nas têmporas.\nO grimório exige um fragmento do sono alheio —",
        custo: 5,
        efeito: "Sono (alvos com < 50 HP)",
        componente: "A canção de quem canta mesmo sabendo que será esmagado"
    },
    {
        nome: "Toque Chocante (FULGOR)",
        nomeVerdadeiro: "Dedos da Tempestade Guardada",
        descricao: "O conjurador não conjura — apenas empresta sua mão ao trovão.\nA página pulsa como um músculo elétrico.",
        custo: 2,
        efeito: "Dano elétrico por toque (1d8)",
        componente: null
    },
    {
        nome: "Toque Macabro (EXSANGUO)",
        nomeVerdadeiro: "Frieza que Suga a Cor",
        descricao: "O toque rouba mais do que calor — leva intenção.\nA página fica cinza por alguns segundos após o uso.",
        custo: 3,
        efeito: "Dano + enfraquecimento (1d4+1)",
        componente: null
    }
];

let paginaAtual = 0;

const contentData = {
    grimorio: () => criarGrimorio(),
    cruzar: "Cruzar animais",
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
    
    let classeEficiencia = '';
    if (eficiencia >= 80) {
        classeEficiencia = 'grimorio-alta';
    } else if (eficiencia < 30) {
        classeEficiencia = 'grimorio-muito-baixa';
    } else {
        classeEficiencia = 'grimorio-baixa';
    }
    
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
            <div class="grimorio-actions">
                <button class="action-btn" onclick="estudarMagia()">Estudar</button>
                <button class="action-btn" onclick="memorizarMagia()">Memorizar</button>
            </div>
        </div>
    `;
}



function criarPaginaMagia(index) {
    const magia = magias[index];
    
    // Aplica efeitos aleatórios baseados na eficiência
    setTimeout(() => aplicarEfeitosAleatorios(), 100);
    
    return `

        <div class="magia-page active">
            <div class="magia-titulo">${magia.nome}</div>
            <div class="magia-nome-verdadeiro">"${magia.nomeVerdadeiro}"</div>
            <div class="magia-divisor">═══════════════════════════════</div>
            <div class="magia-descricao">${magia.descricao.replace(/\n/g, '<br><br>')}</div>
            <div class="magia-stats">
                <div>📖 <span class="label">Custo:</span> <span class="valor">${magia.custo}</span></div>
                <div>🌀 <span class="label">Efeito:</span> <span class="valor">${magia.efeito}</span></div>
                <div>🕯️ <span class="label">Componente:</span> <span class="valor">${magia.componente || 'Nenhum'}</span></div>
            </div>
            <div class="magia-divisor">═══════════════════════════════</div>
        </div>
    `;
}

function mudarPagina(direcao) {
    const novaPagina = paginaAtual + direcao;
    if (novaPagina < 0 || novaPagina >= magias.length) return;

    const magiaContent = document.getElementById('magia-content');
    const paginaAtiva = magiaContent.querySelector('.magia-page');

    paginaAtiva.classList.remove('active');

    setTimeout(() => {
        paginaAtual = novaPagina;
        magiaContent.innerHTML = criarPaginaMagia(paginaAtual);
        document.querySelector('.page-number').textContent = `Página ${paginaAtual + 1}`;
        atualizarBotoes();
    }, 300);
}

function atualizarBotoes() {
    document.getElementById('prev-btn').disabled = paginaAtual === 0;
    document.getElementById('next-btn').disabled = paginaAtual === magias.length - 1;
}

function estudarMagia() {
    alert(`Estudando: ${magias[paginaAtual].nome}`);
}

function memorizarMagia() {
    alert(`Memorizando: ${magias[paginaAtual].nome}`);
}

document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const content = this.getAttribute('data-content');
        
        if (content === 'grimorio') {
            const resultado = await contentData[content]();
            document.getElementById('content-area').innerHTML = resultado;
            paginaAtual = 0;
            atualizarBotoes();
        } else {
            const resultado = typeof contentData[content] === 'function' ? contentData[content]() : contentData[content];
            document.getElementById('content-area').innerHTML = resultado;
        }
    });
});

// Torna funções acessíveis globalmente para onclick
window.mudarPagina = mudarPagina;
window.estudarMagia = estudarMagia;
window.memorizarMagia = memorizarMagia;



function aplicarEfeitosAleatorios() {
    const eficiencia = parseFloat(window.arcanumIudicium.getEficiencia());
    
    if (eficiencia >= 80) {
        // 70% chance para itálico
        if (Math.random() < 0.7) {
            const elementos = document.querySelectorAll('.magia-descricao, .magia-stats div');
            const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
            
            const texto = elementoAleatorio.innerHTML;
            const palavras = texto.split(' ');
            const palavraAleatoria = Math.floor(Math.random() * palavras.length);
            palavras[palavraAleatoria] = `<em>${palavras[palavraAleatoria]}</em>`;
            elementoAleatorio.innerHTML = palavras.join(' ');
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


