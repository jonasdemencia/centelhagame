// emergencia.js - Sistema de Síntese Semântica Emergente - VERSÃO 2 CORRIGIDA
// Narrativas coerentes e com sentido real

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
    }

    verificarEAtivarEmergencia(secaoAtual, contextoAtual, narrativaAtual, emergenciaHabilitada = true) {
    console.log(`[EMERGÊNCIA] Verificando... Habilitada: ${emergenciaHabilitada}, Ativa: ${this.emergenciaAtiva}`);
    
    if (!emergenciaHabilitada) {
        console.log(`[EMERGÊNCIA] ❌ Desabilitada para esta narrativa`);
        return null;
    }
    
    if (this.emergenciaAtiva) {
        console.log(`[EMERGÊNCIA] ❌ Já há emergência ativa`);
        return null;
    }
    
    if (!this.deveAtivarEmergencia(secaoAtual)) {
        console.log(`[EMERGÊNCIA] ❌ Não deve ativar agora`);
        return null;
    }

    console.log(`[EMERGÊNCIA] 🎯 GERANDO SEÇÃO EMERGENTE!`);
    const secaoEmergente = this.gerarSecaoEmergente(contextoAtual, secaoAtual);
    this.emergenciaAtiva = true;
    this.secaoOrigemEmergencia = secaoAtual;
    this.profundidadeAtual = 1;

    const idEmergente = this.gerarIdEmergente();
    this.secoesEmergentes.set(idEmergente, secaoEmergente);

    console.log(`[EMERGÊNCIA] ✅ Seção emergente criada: ${idEmergente}`);
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
    console.log(`[CONTEXTO] Seção ${numeroSecao}: Ambientes: ${contexto.ambiente.join(', ') || 'nenhum'}, Objetos: ${contexto.objetos.join(', ') || 'nenhum'}`);
    this.historico.push(contexto);
    if (this.historico.length > 10) this.historico.shift();
    return contexto;
}

    extrairAmbientes(texto) { 
        return this.dicionario.ambientes.filter(amb => texto.includes(amb)); 
    }

    extrairObjetos(texto) { 
        return this.dicionario.objetos.filter(obj => texto.includes(obj)); 
    }

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
    console.log(`[EMERGÊNCIA DEBUG] Seção: ${secaoAtual}, Seções desde última: ${secoesDesdeUltima}, Emergência ativa: ${this.emergenciaAtiva}`);
    
    if (secoesDesdeUltima < 2) {
        console.log(`[EMERGÊNCIA DEBUG] Bloqueado: menos de 2 seções`);
        return false;
    }
    if (secoesDesdeUltima > 4) {
        console.log(`[EMERGÊNCIA DEBUG] ✅ ATIVANDO (garantido após 4 seções)`);
        return true;
    }
    
    const chance = Math.random();
    const resultado = chance < 0.70;
    console.log(`[EMERGÊNCIA DEBUG] Chance: ${(chance * 100).toFixed(2)}% < 70%? ${resultado}`);
    return resultado;
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

    gerarIdEmergente() { 
        return `emergente_${++this.contadorSecoes}_${Date.now()}`; 
    }

    // NOVO: Gera texto COERENTE baseado em templates narrativos
    gerarTextoEmergente(operacao, elementos, contextoAtual) {
        const narrativas = {
            espelhamento: [
                {
                    condicao: () => elementos.objeto && ['espelho', 'vidro', 'água', 'superfície'].some(o => elementos.objeto.includes(o)),
                    texto: () => `Ao se aproximar de ${this.artigo(elementos.objeto)}, você nota algo perturbador: em vez de seu reflexo, vê ${this.artigo(elementos.passado?.objeto || 'algo que não deveria estar ali')}. Por um instante, você jura que viu movimento - como se o reflexo tivesse vida própria. Quando pisca, tudo volta ao normal.`
                },
                {
                    condicao: () => elementos.objeto && elementos.passado?.objeto,
                    texto: () => `Examinando ${this.artigo(elementos.objeto)} mais de perto, você percebe que ele parece estar em dois lugares ao mesmo tempo. Aqui, diante de você. E também em ${this.artigo(elementos.passado?.ambiente || 'outro lugar')}, como se houvesse uma conexão invisível entre eles. A sensação é perturbadora.`
                }
            ],
            
            inversão: [
                {
                    condicao: () => elementos.atmosfera && elementos.ambiente,
                    texto: () => `${this.artigo(elementos.ambiente)} deveria ser ${elementos.atmosfera}, mas não é. Onde deveria haver ${elementos.atmosfera}, agora há o oposto. É como se as próprias leis da realidade tivessem se invertido neste lugar. Você sente um desconforto profundo.`
                },
                {
                    condicao: () => elementos.objeto && elementos.atmosfera,
                    texto: () => `${this.artigo(elementos.objeto)} comporta-se de forma completamente contrária ao esperado. Deveria ser ${elementos.atmosfera}, mas é exatamente o oposto. Você toca e sente a contradição em sua pele. Algo está fundamentalmente errado.`
                }
            ],
            
            fusão: [
                {
                    condicao: () => elementos.objeto && elementos.passado?.objeto,
                    texto: () => `Você nota algo impossível: ${this.artigo(elementos.objeto)} e ${this.artigo(elementos.passado?.objeto)} parecem estar se tornando uma coisa só. Não é que estejam próximos - é como se estivessem se fundindo lentamente, suas fronteiras se dissolvendo. Você consegue ver através de um para o outro.`
                },
                {
                    condicao: () => elementos.objeto && elementos.ambiente,
                    texto: () => `${this.artigo(elementos.objeto)} não parece mais separado de ${this.artigo(elementos.ambiente)}. Eles estão se tornando uma coisa só, como se o objeto estivesse sendo absorvido pelo espaço ao seu redor. É uma transformação lenta e perturbadora.`
                }
            ],
            
            manifestação: [
                {
                    condicao: () => elementos.atmosfera && elementos.objeto,
                    texto: () => `O ${elementos.atmosfera} que preenchia este lugar começa a ganhar forma. Você vê ${this.artigo(elementos.objeto)} emergindo da própria essência do ${elementos.atmosfera}, como se o intangível estivesse se tornando real. É como assistir a criação de algo que nunca deveria existir.`
                },
                {
                    condicao: () => elementos.sensorial && elementos.objeto,
                    texto: () => `Você ${elementos.sensorial} algo que não deveria ser possível. O que era apenas uma sensação, uma impressão, agora tem forma: ${this.artigo(elementos.objeto)}. Está ali, real e tangível, onde antes havia apenas vazio.`
                }
            ],
            
            eco: [
                {
                    condicao: () => elementos.passado?.objeto && elementos.objeto,
                    texto: () => `Você reconhece ${this.artigo(elementos.passado?.objeto)} aqui, neste lugar. Mas algo está diferente. Não é exatamente o mesmo - é como um eco distorcido, uma versão alterada do que você viu antes. Está aqui, mas não deveria estar. Como chegou até aqui?`
                },
                {
                    condicao: () => elementos.passado?.ambiente && elementos.ambiente,
                    texto: () => `${this.artigo(elementos.ambiente)} lembra ${this.artigo(elementos.passado?.ambiente)} de forma perturbadora. Não é o mesmo lugar, mas há ecos dele aqui - detalhes que você reconhece, padrões que se repetem. É como se o passado estivesse vazando para o presente.`
                }
            ],
            
            paradoxo: [
                {
                    condicao: () => elementos.ambiente && elementos.atmosfera,
                    texto: () => `${this.artigo(elementos.ambiente)} é e não é ao mesmo tempo. Você está aqui, mas também não está. É ${elementos.atmosfera}, mas também é o oposto. Sua mente luta para processar a contradição, mas a realidade insiste em ambas as verdades simultaneamente.`
                },
                {
                    condicao: () => elementos.objeto && elementos.sensorial,
                    texto: () => `${this.artigo(elementos.objeto)} existe em dois estados contraditórios. Você consegue ${elementos.sensorial} ambos ao mesmo tempo - o que é e o que não é. Sua percepção se divide, tentando compreender o impossível.`
                }
            ]
        };

        const narrativasOperacao = narrativas[operacao.nome] || [];
        for (const narrativa of narrativasOperacao) {
            if (narrativa.condicao()) {
                return narrativa.texto();
            }
        }
        
        return this.gerarTextoGenericoCoerente(operacao, elementos);
    }

    // Fallback genérico mas coerente
    gerarTextoGenericoCoerente(operacao, elementos) {
        const textos = {
            espelhamento: `Você percebe que ${this.artigo(elementos.objeto || 'algo')} não está refletindo a realidade corretamente. Há uma desconexão entre o que você vê e o que deveria estar ali.`,
            inversão: `${this.artigo(elementos.ambiente || 'este lugar')} comporta-se de forma contrária ao esperado. As regras normais não parecem se aplicar aqui.`,
            fusão: `${this.artigo(elementos.objeto || 'algo')} e ${this.artigo(elementos.passado?.objeto || 'algo mais')} parecem estar se tornando uma coisa só, suas fronteiras se dissolvendo.`,
            manifestação: `O que era apenas uma sensação agora ganha forma tangível. Você consegue ver e tocar o que antes era apenas uma impressão.`,
            eco: `Você reconhece ${this.artigo(elementos.passado?.objeto || 'algo')} aqui, mas está diferente - como um eco distorcido do que você viu antes.`,
            paradoxo: `Duas verdades contraditórias coexistem neste lugar. Sua mente luta para processar o impossível.`
        };
        
        return textos[operacao.nome] || 'Algo estranho acontece aqui.';
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
            espelhamento: ['Observar o reflexo mais atentamente', 'Tentar compreender a desconexão', 'Examinar a natureza do reflexo'],
            inversão: ['Investigar a inversão mais de perto', 'Tentar entender a mudança', 'Procurar a causa da anomalia'],
            fusão: ['Estudar a fusão em progresso', 'Observar como os elementos se misturam', 'Examinar a fronteira entre eles'],
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
    console.log(`[EMERGÊNCIA] Gerando continuação - Profundidade: ${secaoEmergentePai.profundidade}, Tipo: ${tipoOpcao}`);
    
    this.profundidadeAtual++;
    const profundidade = this.profundidadeAtual;

    if (profundidade >= 3) {
        console.log(`[EMERGÊNCIA] Atingiu profundidade máxima (${profundidade}), gerando convergência`);
        return this.gerarSecaoConvergencia(secaoEmergentePai);
    }

    let texto = '';

    if (tipoOpcao === 'investigar') {
        texto = this.gerarTextoContinuacaoInvestigar(secaoEmergentePai);
    } else if (tipoOpcao === 'interagir') {
        texto = this.gerarTextoContinuacaoInteragir(secaoEmergentePai);
    } else {
        console.log(`[EMERGÊNCIA] Tipo desconhecido: ${tipoOpcao}, usando investigar`);
        texto = this.gerarTextoContinuacaoInvestigar(secaoEmergentePai);
    }

    const opcoes = [
        { 
            texto: 'Aceitar o que viu e continuar', 
            secao: secaoEmergentePai.origem + 1, 
            tipo: 'convergir', 
            emergente: false 
        },
        { 
            texto: 'Explorar ainda mais profundamente', 
            secao: this.gerarIdEmergente(), 
            tipo: 'aprofundar', 
            emergente: true 
        }
    ];

    return {
        texto: texto,
        opcoes: opcoes,
        emergente: true,
        profundidade: profundidade,
        origem: secaoEmergentePai.origem,
        timestamp: Date.now(),
        elementos: secaoEmergentePai.elementos, // PASSA OS ELEMENTOS
        efeitos: this.gerarEfeitosEmergentes()
    };
}

    gerarTextoContinuacaoInvestigar(secaoPai) {
        const templates = [
            `Ao examinar mais de perto, você percebe camadas de significado que antes não notara. ${this.artigo(secaoPai.elementos.objeto || 'o fenômeno')} parece responder à sua atenção, revelando detalhes cada vez mais impossíveis. Você sente que está no limiar de uma compreensão que sua mente não consegue processar completamente.`,
            `Sua investigação revela que ${this.artigo(secaoPai.elementos.objeto || 'a anomalia')} não é estática - muda conforme você a observa. A linha entre observador e observado começa a se confundir. Quanto mais você tenta entender, mais complexo se torna.`,
            `Quanto mais você estuda ${this.artigo(secaoPai.elementos.objeto || 'o impossível')}, mais padrões você descobre. Cada padrão leva a outro, cada resposta gera mais perguntas. É como se estivesse vendo apenas a ponta de algo muito maior.`
        ];
        return this.escolherAleatorio(templates);
    }

    gerarTextoContinuacaoInteragir(secaoPai) {
        const templates = [
            `No momento em que você toca ${this.artigo(secaoPai.elementos.objeto || 'a anomalia')}, uma sensação estranha percorre seu corpo - como se estivesse tocando algo que existe em múltiplas dimensões simultaneamente. O contato deixa uma marca não física, uma memória que não é sua. Quando você retira a mão, algo fundamental mudou.`,
            `Sua interação com ${this.artigo(secaoPai.elementos.objeto || 'o fenômeno')} produz um efeito inesperado. Em vez de simplesmente tocá-lo, você sente que está sendo tocado de volta - não fisicamente, mas de uma forma que ultrapassa os sentidos convencionais. A experiência é simultaneamente fascinante e perturbadora.`,
            `Ao interferir com ${this.artigo(secaoPai.elementos.objeto || 'a manifestação')}, você desencadeia uma reação em cascata. O efeito se espalha como ondas em um lago, alterando sutilmente tudo ao redor. Por um momento, você não tem certeza de onde termina o fenômeno e onde você começa.`
        ];
        return this.escolherAleatorio(templates);
    }

    gerarSecaoConvergencia(secaoEmergente) {
    console.log(`[EMERGÊNCIA] Gerando seção de convergência`);
    console.log(`[EMERGÊNCIA] secaoEmergente:`, secaoEmergente);
    
    // Validação de segurança
    if (!secaoEmergente) {
        console.error(`[EMERGÊNCIA] ❌ secaoEmergente é undefined!`);
        secaoEmergente = { origem: 1, elementos: { ambiente: 'lugar' } };
    }
    
    if (!secaoEmergente.elementos) {
        console.warn(`[EMERGÊNCIA] ⚠️ elementos é undefined, usando fallback`);
        secaoEmergente.elementos = { ambiente: 'lugar', objeto: 'algo' };
    }

    const ambiente = secaoEmergente.elementos?.ambiente || 'o lugar';
    
    const textosConvergencia = [
        `Gradualmente, a estranheza se dissipa como névoa ao sol da manhã. ${this.artigo(ambiente)} retorna à sua forma normal - ou pelo menos, ao que você aceita como normal. O que você experimentou deixa uma impressão duradoura, uma marca na sua percepção que talvez nunca se apague completamente. Mas a jornada deve continuar.`,

        `A realidade se reassenta lentamente, como poeira após uma tempestade. O fenômeno não desapareceu exatamente - você simplesmente para de percebê-lo, como se sua mente tivesse atingido um limite de processamento. Você carrega consigo a memória do impossível, mas agora ela parece distante, quase como um sonho. É hora de seguir em frente.`,

        `Por fim, você se permite desviar o olhar. Quando olha de volta, tudo parece... comum. Será que realmente aconteceu? A dúvida é parte da experiência agora. Você decide que algumas coisas não precisam de explicação - apenas aceitação. Com um último olhar para trás, você retoma seu caminho.`
    ];

    this.emergenciaAtiva = false;
    this.ultimaEmergencia = secaoEmergente.origem || 1;

    return {
        texto: this.escolherAleatorio(textosConvergencia),
        opcoes: [{ texto: 'Continuar sua jornada', secao: (secaoEmergente.origem || 1) + 1 }],
        emergente: true,
        convergencia: true,
        origem: secaoEmergente.origem || 1,
        timestamp: Date.now(),
        elementos: secaoEmergente.elementos
    };
}

    processarOpcaoEmergente(opcao, secaoEmergentePai) {
    console.log(`[EMERGÊNCIA] Processando opção: ${opcao.tipo}`);
    
    if (opcao.tipo === 'recuar' || opcao.tipo === 'convergir') {
        console.log(`[EMERGÊNCIA] ✅ Desativando emergência (tipo: ${opcao.tipo})`);
        this.emergenciaAtiva = false;
        return null;
    }
    
    if (opcao.tipo === 'aprofundar' || opcao.tipo === 'investigar' || opcao.tipo === 'interagir') {
        console.log(`[EMERGÊNCIA] Gerando continuação (profundidade: ${this.profundidadeAtual})`);
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





