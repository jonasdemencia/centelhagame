const magias = [
    {
        nome: "Armadura Arcana",
        nomeVerdadeiro: "Vestes de Recusa",
        descricao: "O conjurador se cobre de memória sólida, de palavras que nunca deixaram o papel.\nA página se dobra, formando um molde invisível ao redor do corpo.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: "pedaco-couro → retalho da pele de quem já sobreviveu a mais de uma sentença"
    },
    {
        nome: "Causar Medo",
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
        nome: "Cura Menor",
        nomeVerdadeiro: "Murmúrio do Sangue Quieto",
        descricao: "Uma prece curta inscrita nas margens da página, ativada por compaixão ou temor.\nO grimório sussurra memórias de infância, quando dor era cuidada com mãos e lágrimas.",
        custo: 2,
        efeito: "Cura leve (1d8)",
        componente: null
    },
    {
        nome: "Dardos Místicos",
        nomeVerdadeiro: "Olhar Afiado do Inominado",
        descricao: "As linhas saltam da página como farpas etéreas. Cada letra se torna uma lança de pensamento puro.\nNão mira a carne, mas a hesitação entre as costelas.",
        custo: 1,
        efeito: "Dano (1d4)",
        componente: null
    },
    {
        nome: "Escudo Arcano",
        nomeVerdadeiro: "Círculo do Não-Tocar",
        descricao: "Linhas em espiral giram na página como se gravadas à unha.\nProtege não com força, mas com intenção perfeita.",
        custo: 3,
        efeito: "+4 Couraça",
        componente: null
    },
    {
        nome: "Luz",
        nomeVerdadeiro: "Vislumbre da Aurora que Queima",
        descricao: "A tinta brilha no escuro da página, irradiando luz branca.\nNão ilumina o caminho — apenas o erro dos olhos alheios.",
        custo: 2,
        efeito: "Ofuscamento (precisão -3)",
        componente: null
    },
    {
        nome: "Pasmar",
        nomeVerdadeiro: "Silêncio do Instante Rachado",
        descricao: "Ao pronunciar essa palavra, o tempo hesita.\nO inimigo sente que algo o observava antes dele existir.",
        custo: 3,
        efeito: "Perda de turno (alvos com < 50 HP)",
        componente: "la → o resíduo de uma nota que foi tocada para ninguém ouvir"
    },
    {
        nome: "Raio de Ácido",
        nomeVerdadeiro: "Chuva da Boca Amarga",
        descricao: "Cada gota conjurada contém o azedume de uma palavra não dita.\nO papel escorre enquanto você lê — e quem vê, sente arder.",
        custo: 1,
        efeito: "Dano ácido (1d3)",
        componente: null
    },
    {
        nome: "Sono",
        nomeVerdadeiro: "Cântico da Pálpebra Frágil",
        descricao: "Cada linha é um sussurro que pesa nas têmporas.\nO grimório exige um fragmento do sono alheio —",
        custo: 5,
        efeito: "Sono (alvos com < 50 HP)",
        componente: "grilo → a canção de quem canta mesmo sabendo que será esmagado"
    },
    {
        nome: "Toque Chocante",
        nomeVerdadeiro: "Dedos da Tempestade Guardada",
        descricao: "O conjurador não conjura — apenas empresta sua mão ao trovão.\nA página pulsa como um músculo elétrico.",
        custo: 2,
        efeito: "Dano elétrico por toque (1d8)",
        componente: null
    },
    {
        nome: "Toque Macabro",
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

function criarGrimorio() {
    return `
        <div class="grimorio-container">
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
    return `
        <div class="magia-page active">
            <div class="magia-titulo">✴️ ${magia.nome}</div>
            <div class="magia-nome-verdadeiro">"${magia.nomeVerdadeiro}"</div>
            <div class="magia-divisor">═══════════════════════════════</div>
            <div class="magia-descricao">${magia.descricao.replace(/\n/g, '<br><br>')}</div>
            <div class="magia-stats">
                <div>📖 Custo: ${magia.custo}</div>
                <div>🌀 Efeito: ${magia.efeito}</div>
                ${magia.componente ? `<div>🕯️ Componente: ${magia.componente}</div>` : '<div>🕯️ Componente: Nenhum</div>'}
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
    button.addEventListener('click', function() {
        const content = this.getAttribute('data-content');
        const resultado = typeof contentData[content] === 'function' ? contentData[content]() : contentData[content];
        document.getElementById('content-area').innerHTML = resultado;
        
        if (content === 'grimorio') {
            paginaAtual = 0;
            atualizarBotoes();
        }
    });
});
