// emergencia.js - Sistema de Síntese Semântica Emergente - ETAPA 3
export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = [];
        this.secoesEmergentes = new Map();
        this.contadorSecoes = 0;
        this.ultimaEmergencia = 0;
        this.profundidadeAtual = 0;
        this.itensNarrativas = itensNarrativas;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        
        this.dicionario = {
            ambientes: ['sala', 'corredor', 'câmara', 'salão', 'jardim', 'pátio', 'igreja', 'capela', 'biblioteca', 'cozinha', 'quarto', 'torre', 'porão', 'cripta', 'mausoléu', 'terraço', 'caverna', 'floresta', 'rio', 'montanha', 'castelo', 'ruína'],
            objetos: ['porta', 'janela', 'mesa', 'cadeira', 'livro', 'espelho', 'vela', 'tocha', 'sino', 'relógio', 'pintura', 'estátua', 'caixa', 'baú', 'chave', 'mapa', 'documento', 'arma', 'escada', 'corrente', 'corredor', 'portal', 'altar'],
            atmosfera: {
                frio: ['frio', 'gélido', 'gelado', 'congelante', 'gelo'],
                silencioso: ['silêncio', 'quieto', 'mudo', 'calado', 'tranquilo'],
                escuro: ['escuro', 'sombrio', 'penumbra', 'trevas', 'noite'],
                opressivo: ['opressivo', 'pesado', 'denso', 'sufocante', 'asfixiante'],
                vazio: ['vazio', 'abandonado', 'deserto', 'desolado', 'vácuo']
            },
            sensorial: {
                visual: ['ver', 'observar', 'olhar', 'enxergar', 'notar', 'vislumbrar'],
                auditivo: ['ouvir', 'escutar', 'som', 'barulho', 'eco', 'sussurro'],
                tátil: ['tocar', 'sentir', 'apalpar', 'textura', 'contato'],
                olfativo: ['cheiro', 'odor', 'aroma', 'perfume', 'fedor', 'fragrância']
            }
        };

        this.operacoes = {
            espelhamento: { nome: 'espelhamento', peso: 1.2 },
            inversão: { nome: 'inversão', peso: 1.0 },
            fusão: { nome: 'fusão', peso: 1.1 },
            manifestação: { nome: 'manifestação', peso: 1.3 },
            eco: { nome: 'eco', peso: 1.4 },
            paradoxo: { nome: 'paradoxo', peso: 0.9 }
        };

        this.templates = {
            abertura: [
                'Ao {acao}, você percebe algo que não deveria estar ali',
                'Examinando {elemento1} mais de perto, uma impossibilidade se revela',
                'Sua atenção é atraída para {elemento1} - algo está errado',
                'No momento em que você {acao}, a realidade parece tremer'
            ],
            sensorial: [
                'Um {sentido} impossível invade seus sentidos',
                'Você {sentido}, embora saiba que isso não deveria ser possível',
                'Seus sentidos captam algo que a lógica rejeita',
                'A percepção se distorce: você {sentido}'
            ]
        };

        this.complementos = {
            consequencia: [
                'A sensação persiste mesmo quando você desvia o olhar',
                'Algo fundamental mudou, embora você não saiba exatamente o quê',
                'O momento passa, mas deixa uma marca na sua percepção',
                'Você sente que testemunhou algo significativo'
            ],
            duvida: [
                'Mas quando você pisca, tudo parece normal novamente',
                'Seria apenas cansaço? Ou algo mais?',
                'Você questiona se realmente viu o que pensa ter visto',
                'A memória já começa a se tornar nebulosa'
            ],
            intensificacao: [
                'E não é a única coisa estranha que você nota',
                'O fenômeno parece se intensificar',
                'Outras anomalias começam a se manifestar',
                'A realidade ao redor continua se distorcendo'
            ]
        };
    }

    verificarEAtivarEmergencia(secaoAtual, contextoAtual, narrativaAtual, emergenciaHabilitada = true) {
        if (!emergenciaHabilitada || this.emergenciaAtiva) return null;
        if (!this.deveAtivarEmergencia(secaoAtual)) return null;

        const secaoEmergente = this.gerarSecaoEmergente(contextoAtual, secaoAtual);
        this.emergenciaAtiva = true;
        this.secaoOrigemEmergencia = secaoAtual;
        this.profundidadeAtual = 1;

        const idEmergente = this.gerarIdEmergente();
        this.secoesEmergentes.set(idEmergente, secaoEmergente);

        return { ativada: true, idSecao: idEmergente, secao: secaoEmergente, profundidade: 1 };
    }

    analisarSecao(secao, numeroSecao) {
        const texto = secao.texto.toLowerCase();
        const contexto = {
            numero: numeroSecao,
            timestamp: Date.now(),
            ambiente: this.extrairAmbientes(texto),
            objetos: this.extrairObjetos(texto),
            atmosfera: this.extrairAtmosfera(texto),
            sensorial: this.extrairSensorial(texto),
            acoes: this.extrairAcoes(secao),
            itensColetados: this.extrairItens(secao)
        };
        this.historico.push(contexto);
        if (this.historico.length > 10) this.historico.shift();
        return contexto;
    }

    extrairAmbientes(texto) { return this.dicionario.ambientes.filter(amb => texto.includes(amb)); }
    extrairObjetos(texto) { return this.dicionario.objetos.filter(obj => texto.includes(obj)); }
    extrairAtmosfera(texto) {
        const atmosferas = [];
        for (const [tipo, palavras] of Object.entries(this.dicionario.atmosfera)) {
            if (palavras.some(palavra => texto.includes(palavra))) atmosferas.push(tipo);
        }
        return atmosferas;
    }
    extrairSensorial(texto) {
        const sensoriais = [];
        for (const [sentido, palavras] of Object.entries(this.dicionario.sensorial)) {
            if (palavras.some(palavra => texto.includes(palavra))) sensoriais.push(sentido);
        }
        return sensoriais;
    }
    extrairAcoes(secao) {
        if (!secao.opcoes) return [];
        const verbos = ['abrir', 'fechar', 'examinar', 'tocar', 'pegar', 'entrar', 'sair', 'subir', 'descer', 'procurar', 'ler', 'escutar', 'observar', 'beber', 'comer'];
        const acoes = [];
        secao.opcoes.forEach(opcao => {
            const textoOpcao = opcao.texto.toLowerCase();
            verbos.forEach(verbo => { if (textoOpcao.includes(verbo)) acoes.push(verbo); });
        });
        return [...new Set(acoes)];
    }
    extrairItens(secao) {
        if (!secao.efeitos) return [];
        return secao.efeitos.filter(efeito => efeito.tipo === 'item').map(efeito => efeito.item);
    }

    deveAtivarEmergencia(secaoAtual) {
        const secoesDesdeUltima = secaoAtual - this.ultimaEmergencia;
        if (secoesDesdeUltima < 5) return false;
        if (secoesDesdeUltima > 8) return true;
        return Math.random() < 0.20;
    }

    selecionarElementosContexto(contextoAtual) {
        const elementos = {
            ambiente: this.escolherAleatorio(contextoAtual.ambiente),
            objeto: this.escolherAleatorio(contextoAtual.objetos),
            atmosfera: this.escolherAleatorio(contextoAtual.atmosfera),
            sensorial: this.escolherAleatorio(contextoAtual.sensorial)
        };
        if (this.historico.length > 1) {
            const secaoPassada = this.escolherAleatorio(this.historico.slice(0, -1));
            elementos.passado = {
                ambiente: this.escolherAleatorio(secaoPassada.ambiente),
                objeto: this.escolherAleatorio(secaoPassada.objetos),
                itens: this.escolherAleatorio(secaoPassada.itensColetados)
            };
        }
        return elementos;
    }

    escolherAleatorio(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    selecionarOperacao(elementos) {
        const operacoesDisponiveis = [];
        if (elementos.objeto && elementos.passado?.objeto) operacoesDisponiveis.push('espelhamento', 'eco');
        if (elementos.ambiente && elementos.atmosfera) operacoesDisponiveis.push('inversão', 'paradoxo');
        if (elementos.objeto && elementos.passado?.itens) operacoesDisponiveis.push('fusão', 'manifestação');
        if (operacoesDisponiveis.length === 0) operacoesDisponiveis.push(...Object.keys(this.operacoes));
        const operacaoNome = this.escolherAleatorio(operacoesDisponiveis);
        return this.operacoes[operacaoNome];
    }

    gerarIdEmergente() { return `emergente_${++this.contadorSecoes}_${Date.now()}`; }

    gerarTextoEmergente(operacao, elementos, contextoAtual) {
        let texto = '';
        texto += this.gerarAbertura(elementos, contextoAtual) + ' ';
        texto += this.gerarEventoPrincipal(operacao, elementos) + ' ';
        texto += this.gerarDetalheSensorial(elementos, contextoAtual) + ' ';
        texto += this.escolherAleatorio(this.complementos[this.escolherTipoComplemento()]);
        return texto;
    }

    gerarAbertura(elementos, contextoAtual) {
        const estrutura = this.escolherAleatorio(this.templates.abertura);
        const acao = this.escolherAleatorio(contextoAtual.acoes) || 'observar ao redor';
        const elemento1 = elementos.objeto || elementos.ambiente || 'o ambiente';
        return estrutura.replace('{acao}', acao).replace('{elemento1}', this.artigo(elemento1));
    }

    gerarEventoPrincipal(operacao, elementos) {
        switch(operacao.nome) {
            case 'espelhamento': return this.gerarEspelhamento(elementos);
            case 'inversão': return this.gerarInversao(elementos);
            case 'fusão': return this.gerarFusao(elementos);
            case 'manifestação': return this.gerarManifestacao(elementos);
            case 'eco': return this.gerarEco(elementos);
            case 'paradoxo': return this.gerarParadoxo(elementos);
            default: return this.gerarGenerico(elementos);
        }
    }

    gerarEspelhamento(elementos) {
        const templates = [
            `${this.artigo(elementos.objeto)} reflete não você, mas ${this.artigo(elementos.passado?.objeto || 'algo impossível')}`,
            `Ao observar ${this.artigo(elementos.objeto)}, você vê a cena de ${this.artigo(elementos.passado?.ambiente || 'outro lugar')} espelhada de forma distorcida`,
            `${this.artigo(elementos.objeto)} e ${this.artigo(elementos.passado?.objeto || 'suas memórias')} se espelham em uma geometria impossível`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarInversao(elementos) {
        const propriedades = { frio: 'quente', escuro: 'luminoso', silencioso: 'barulhento', vazio: 'preenchido' };
        const atmosfera = elementos.atmosfera || 'normal';
        const invertido = propriedades[atmosfera] || 'diferente';
        const templates = [
            `O que deveria ser ${atmosfera} agora é inexplicavelmente ${invertido}`,
            `${this.artigo(elementos.ambiente)} comporta-se ao contrário do esperado`,
            `A natureza de ${this.artigo(elementos.ambiente)} se inverte`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarFusao(elementos) {
        const elemento1 = elementos.objeto || elementos.ambiente;
        const elemento2 = elementos.passado?.objeto || elementos.passado?.ambiente || 'algo do passado';
        const templates = [
            `${this.artigo(elemento1)} e ${this.artigo(elemento2)} começam a se fundir de forma antinatural`,
            `A fronteira entre ${this.artigo(elemento1)} e ${this.artigo(elemento2)} se dissolve gradualmente`,
            `${this.artigo(elemento1)} contém impossíveis fragmentos de ${this.artigo(elemento2)}`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarManifestacao(elementos) {
        const abstrato = elementos.atmosfera || 'o silêncio';
        const concreto = elementos.objeto || elementos.ambiente;
        const templates = [
            `${this.artigo(abstrato)} ganha substância física, materializando-se como ${this.artigo(concreto)}`,
            `Você vê ${this.artigo(abstrato)} tomar forma tangível`,
            `O que era apenas ${abstrato} agora existe concretamente`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarEco(elementos) {
        const passado = elementos.passado?.objeto || elementos.passado?.ambiente || 'algo familiar';
        const templates = [
            `Um eco de ${this.artigo(passado)} ressurge aqui, mas distorcido`,
            `${this.artigo(passado)} retorna, mas transformado`,
            `Você reconhece ${this.artigo(passado)}, mas algo mudou`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarParadoxo(elementos) {
        const elemento1 = elementos.ambiente || 'este lugar';
        const estado1 = elementos.atmosfera || 'presente';
        const estado2 = this.escolherEstadoOposto(estado1);
        const templates = [
            `${this.artigo(elemento1)} existe e não existe simultaneamente`,
            `Você está em ${this.artigo(elemento1)}, mas também não está`,
            `${this.artigo(elemento1)} é ao mesmo tempo ${estado1} e ${estado2}`
        ];
        return this.escolherAleatorio(templates) + '.';
    }

    gerarGenerico(elementos) {
        const elemento = elementos.objeto || elementos.ambiente || 'algo indefinível';
        return `${this.artigo(elemento)} se comporta de forma impossível.`;
    }

    gerarDetalheSensorial(elementos, contextoAtual) {
        const sensoriais = contextoAtual.sensorial || [];
        const detalhes = {
            visual: ['A luz parece se dobrar de forma estranha', 'Sombras se movem onde não deveriam', 'Suas bordas tremulam como miragem'],
            auditivo: ['Um som fantasma ecoa no ar', 'Você ouve algo que parece vir de muito longe', 'O silêncio se torna quase audível'],
            tátil: ['O ar ao redor parece diferente', 'Uma sensação estranha percorre sua espinha', 'A temperatura flutua de forma inexplicável'],
            olfativo: ['Um cheiro que não deveria estar aqui', 'O ar carrega um odor impossível', 'Fragrâncias de outro lugar se misturam']
        };
        const sentido = this.escolherAleatorio(sensoriais) || 'visual';
        return this.escolherAleatorio(detalhes[sentido] || detalhes.visual);
    }

    escolherTipoComplemento() {
        const rand = Math.random();
        if (rand < 0.35) return 'consequencia';
        if (rand < 0.55) return 'duvida';
        return 'intensificacao';
    }

    artigo(substantivo) {
        if (!substantivo) return 'algo';
        const vogais = ['a', 'e', 'i', 'o', 'u'];
        const primeiraLetra = substantivo[0].toLowerCase();
        const femininas = ['porta', 'janela', 'mesa', 'cadeira', 'sala', 'torre', 'luz', 'sombra', 'água'];
        if (femininas.includes(substantivo)) return vogais.includes(primeiraLetra) ? `a ${substantivo}` : `a ${substantivo}`;
        return vogais.includes(primeiraLetra) ? `o ${substantivo}` : `o ${substantivo}`;
    }

    escolherEstadoOposto(estado) {
        const opostos = { 'frio': 'quente', 'silencioso': 'barulhento', 'escuro': 'iluminado', 'vazio': 'preenchido', 'presente': 'ausente' };
        return opostos[estado] || 'diferente';
    }

    gerarOpcoesEmergentes(operacao, elementos, contextoAtual, secaoOrigem) {
        const opcoes = [];
        opcoes.push({
            texto: this.gerarOpcaoInvestigar(operacao, elementos),
            secao: this.gerarIdEmergente(),
            tipo: 'investigar',
            emergente: true
        });
        opcoes.push({
            texto: this.gerarOpcaoInteragir(operacao, elementos),
            secao: this.gerarIdEmergente(),
            tipo: 'interagir',
            emergente: true
        });
        opcoes.push({
            texto: this.gerarOpcaoRecuar(elementos),
            secao: secaoOrigem + 1,
            tipo: 'recuar',
            emergente: false
        });
        return opcoes;
    }

    gerarOpcaoInvestigar(operacao, elementos) {
        const templates = {
            espelhamento: ['Observar o reflexo mais atentamente', 'Tentar compreender o espelhamento', 'Examinar a natureza do reflexo'],
            inversão: ['Investigar a inversão mais de perto', 'Tentar entender a mudança', 'Procurar a causa da anomalia'],
            fusão: ['Estudar a fusão em progresso', 'Observar como os elementos se misturam', 'Examinar a fronteira entre os elementos'],
            manifestação: ['Investigar a manifestação física', 'Tentar tocar o que se materializou', 'Compreender a natureza do fenômeno'],
            eco: ['Procurar pela origem do eco', 'Tentar lembrar do original', 'Comparar com suas memórias'],
            paradoxo: ['Tentar resolver o paradoxo', 'Aceitar ambas as realidades', 'Procurar uma explicação lógica']
        };
        const opcoesPossiveis = templates[operacao.nome] || templates.fusão;
        return this.escolherAleatorio(opcoesPossiveis);
    }

    gerarOpcaoInteragir(operacao, elementos) {
        const elemento = elementos.objeto || elementos.ambiente || 'a anomalia';
        const acoes = [`Tocar ${this.artigo(elemento)}`, `Tentar modificar ${this.artigo(elemento)}`, `Interromper o processo`, `Aproximar-se cuidadosamente`];
        return this.escolherAleatorio(acoes);
    }

    gerarOpcaoRecuar(elementos) {
        const opcoes = ['Recuar e ignorar o fenômeno', 'Afastar-se lentamente', 'Decidir não interferir', 'Continuar seu caminho', 'Desviar o olhar e seguir em frente'];
        return this.escolherAleatorio(opcoes);
    }

    gerarSecaoEmergente(contextoAtual, secaoOrigem) {
        const elementos = this.selecionarElementosContexto(contextoAtual);
        const operacao = this.selecionarOperacao(elementos);
        const texto = this.gerarTextoEmergente(operacao, elementos, contextoAtual);
        const opcoes = this.gerarOpcoesEmergentes(operacao, elementos, contextoAtual, secaoOrigem);

        return {
            texto: texto,
            opcoes: opcoes,
            emergente: true,
            operacao: operacao.nome,
            elementos: elementos,
            timestamp: Date.now(),
            origem: secaoOrigem,
            profundidade: 1,
            efeitos: this.gerarEfeitosEmergentes()
        };
    }

    gerarEfeitosEmergentes() {
        const efeitos = [];
        if (Math.random() < 0.30) {
            const itensDisponiveis = Object.keys(this.itensNarrativas).filter(
                id => !this.itensNarrativas[id].large && !this.itensNarrativas[id].twoHanded && this.itensNarrativas[id].content
            );
            if (itensDisponiveis.length > 0) {
                const itemAleatorio = itensDisponiveis[Math.floor(Math.random() * itensDisponiveis.length)];
                efeitos.push({ tipo: 'item', item: itemAleatorio });
            }
        }
        if (Math.random() < 0.20) {
            const modificacao = Math.random() < 0.5 ? -1 : 1;
            efeitos.push({ tipo: 'energia', valor: modificacao });
        }
        return efeitos;
    }

    gerarContinuacaoEmergente(secaoEmergentePai, tipoOpcao) {
        this.profundidadeAtual++;
        const profundidade = this.profundidadeAtual;

        if (profundidade >= 3) {
            return this.gerarSecaoConvergencia(secaoEmergentePai);
        }

        let texto = '';
        if (tipoOpcao === 'investigar') {
            texto = this.gerarTextoContinuacaoInvestigar(secaoEmergentePai);
        } else if (tipoOpcao === 'interagir') {
            texto = this.gerarTextoContinuacaoInteragir(secaoEmergentePai);
        }

        const opcoes = [
            { texto: 'Aceitar o que viu e continuar', secao: secaoEmergentePai.origem + 1, tipo: 'convergir', emergente: false },
            { texto: 'Explorar ainda mais profundamente', secao: this.gerarIdEmergente(), tipo: 'aprofundar', emergente: true }
        ];

        return {
            texto: texto,
            opcoes: opcoes,
            emergente: true,
            profundidade: profundidade,
            origem: secaoEmergentePai.origem,
            timestamp: Date.now(),
            efeitos: this.gerarEfeitosEmergentes()
        };
    }

    gerarTextoContinuacaoInvestigar(secaoPai) {
        const templates = [
            `Ao examinar mais de perto, você percebe camadas de significado que antes não notara. ${this.artigo(secaoPai.elementos.objeto || 'o fenômeno')} parece responder à sua atenção, revelando detalhes cada vez mais impossíveis.`,
            `Sua investigação revela que ${this.artigo(secaoPai.elementos.objeto || 'a anomalia')} não é estática - muda conforme você a observa. A linha entre observador e observado começa a se confundir.`,
            `Quanto mais você estuda ${this.artigo(secaoPai.elementos.objeto || 'o impossível')}, mais complexo se torna. Padrões dentro de padrões emergem.`
        ];
        return this.escolherAleatorio(templates);
    }

    gerarTextoContinuacaoInteragir(secaoPai) {
        const templates = [
            `No momento em que você toca ${this.artigo(secaoPai.elementos.objeto || 'a anomalia')}, uma sensação estranha percorre seu corpo. O contato deixa uma marca não física.`,
            `Sua interação com ${this.artigo(secaoPai.elementos.objeto || 'o fenômeno')} produz um efeito inesperado. Você sente que está sendo tocado de volta.`,
            `Ao interferir com ${this.artigo(secaoPai.elementos.objeto || 'a manifestação')}, você desencadeia uma reação em cascata que altera tudo ao redor.`
        ];
        return this.escolherAleatorio(templates);
    }

    gerarSecaoConvergencia(secaoEmergente) {
        const textosConvergencia = [
            `Gradualmente, a estranheza se dissipa como névoa ao sol da manhã. ${this.artigo(secaoEmergente.elementos.ambiente || 'o lugar')} retorna à sua forma normal. O que você experimentou deixa uma impressão duradoura. Mas a jornada deve continuar.`,
            `A realidade se reassenta lentamente, como poeira após uma tempestade. Você carrega consigo a memória do impossível, mas agora ela parece distante, quase como um sonho. É hora de seguir em frente.`,
            `Por fim, você se permite desviar o olhar. Quando olha de volta, tudo parece... comum. Será que realmente aconteceu? Você decide que algumas coisas não precisam de explicação. Com um último olhar para trás, você retoma seu caminho.`
        ];

        this.emergenciaAtiva = false;
        this.ultimaEmergencia = secaoEmergente.origem;

        return {
            texto: this.escolherAleatorio(textosConvergencia),
            opcoes: [{ texto: 'Continuar sua jornada', secao: secaoEmergente.origem + 1 }],
            emergente: true,
            convergencia: true,
            origem: secaoEmergente.origem,
            timestamp: Date.now()
        };
    }

    processarOpcaoEmergente(opcao, secaoEmergentePai) {
        if (opcao.tipo === 'recuar' || opcao.tipo === 'convergir') {
            this.emergenciaAtiva = false;
            return null;
        }

        if (opcao.tipo === 'aprofundar' || opcao.tipo === 'investigar' || opcao.tipo === 'interagir') {
            const continuacao = this.gerarContinuacaoEmergente(secaoEmergentePai, opcao.tipo);
            const idEmergente = opcao.secao;
            this.secoesEmergentes.set(idEmergente, continuacao);
            
            return {
                ativada: true,
                idSecao: idEmergente,
                secao: continuacao,
                profundidade: this.profundidadeAtual
            };
        }

        return null;
    }

    obterSecao(id, narrativaAtual) {
        if (typeof id === 'number' || !id.startsWith('emergente_')) {
            return narrativaAtual.secoes[id];
        }
        return this.secoesEmergentes.get(id);
    }

    resetar() {
        this.historico = [];
        this.secoesEmergentes.clear();
        this.contadorSecoes = 0;
        this.ultimaEmergencia = 0;
        this.profundidadeAtual = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
    }
}

export const sistemaEmergencia = new SistemaEmergencia();