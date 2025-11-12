// emergencia.js - VERSÃO COM SISTEMA DE RARIDADE, POOLS INTELIGENTES E BATALHAS EM OPÇÃOo
// (A MAIORIA DO ARQUIVO PERMANECE IGUAL - AS MUDANÇAS ESTÃO MARCADAS EM `processarRespostaIA`)

export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = [];
        this.secoesEmergentes = new Map();
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.workerUrl = "https://lucky-scene-6054.fabiorainersilva.workers.dev/";
        this.escolhasEmergentes = [];
        this.itensNarrativas = itensNarrativas;
        this.profundidadeAtual = 0;
        
        // 🆕 NOVO: Classificar itens por raridade automaticamente
        this.itensClassificados = this.classificarItensPorRaridade();


        this.monstrosClassificados = {
            comuns: ["coruja", "zumbi", "sombra-errante", "lobo", "escorpiao", "rato_gigante", "goblin_guerreiro", "esqueleto_armado", "morcego_vampiro", "aranha_venenosa", "goblin_ladrao", "esqueleto_arqueiro", "lacraia_gigante", "corvo_sombrio", "cachorro_selvagem", "lesma_acida", "morcego_comum", "lagarto_caverna", "goblin_xama", "abelha_gigante", "esqueleto_fracasso"],
incomuns: ["doberman", "servo-pedra", "serpente", "javali", "aguia", "ghoul", "espectro", "minotauro", "aracnideo_gigante", "golem_barro", "harpia"],
raros: ["necromante", "sombra-antiga", "jaguar", "urso", "tigre", "crocodilo", "lobo_alfa", "golem_ferro", "quimera", "lich_menor"]
        };
    }

    // 🆕 MÉTODO NOVO: Classifica todos os itens seguindo suas regras
    classificarItensPorRaridade() {
        const classificacao = {
            comuns: [],
            incomuns: [],
            raros: []
        };

        for (const [id, item] of Object.entries(this.itensNarrativas)) {
            // === ARMAS DE FOGO (raras, mais dano = mais raro) ===
            if (item.ammoType) {
                const dano = this.extrairValorDano(item.damage);
                if (dano >= 25) { // 3d10+, 3d12, 2d18
                    classificacao.raros.push(id);
                } else if (dano >= 15) { // 2d10, 1d12+2
                    classificacao.raros.push(id);
                } else {
                    classificacao.raros.push(id); // Todas armas de fogo são raras
                }
            }
            // === MUNIÇÕES (baseado no calibre/dano) ===
            else if (item.projectile) {
                if (id.includes('473') || id.includes('762') || id.includes('50')) {
                    classificacao.raros.push(id); // Alto calibre
                } else if (id.includes('357') || id.includes('45') || id.includes('12')) {
                    classificacao.incomuns.push(id); // Médio calibre
                } else {
                    classificacao.comuns.push(id); // 9mm, 38
                }
            }
            // === ANÉIS E AMULETOS (sempre raros) ===
            else if (item.slot === 'amulet' || item.slot === 'ring') {
                classificacao.raros.push(id);
            }
            // === ARMAS BRANCAS (incomuns, mais dano = mais incomum) ===
            else if (item.slot === 'weapon' && !item.ammoType) {
                const dano = this.extrairValorDano(item.damage);
                if (dano >= 12) { // 2D6+, 3d6
                    classificacao.raros.push(id); // Bem raras
                } else if (dano >= 8) { // 1D8, 1D10
                    classificacao.incomuns.push(id);
                } else {
                    classificacao.incomuns.push(id); // Todas são pelo menos incomuns
                }
            }
            // === ARMADURAS, ESCUDOS, CAPACETES (incomuns) ===
            else if (item.slot === 'armor' || item.slot === 'shield' || item.slot === 'helmet') {
                classificacao.incomuns.push(id);
            }
            // === CONSUMÍVEIS (comuns) ===
            else if (item.consumable) {
                classificacao.comuns.push(id);
            }
            // === COMPONENTES (incomuns) ===
            else if (item.componente) {
                classificacao.incomuns.push(id);
            }
            // === TESOUROS E RELÍQUIAS (incomuns) ===
            else if (id.includes('reliquia') || id.includes('estatueta') || id.includes('calice') || id.includes('coroa')) {
                classificacao.incomuns.push(id);
            }
            // === UTILITÁRIOS (comuns) ===
            else if (id === 'corda' || id === 'esqueiro' || id === 'tocha' || id === 'velas') {
                classificacao.comuns.push(id);
            }
            // === FALLBACK (comum por padrão) ===
            else {
                classificacao.comuns.push(id);
            }
        }

        console.log(`[RARIDADE] Classificação:
        - Comuns: ${classificacao.comuns.length}
        - Incomuns: ${classificacao.incomuns.length}  
        - Raros: ${classificacao.raros.length}`);

        return classificacao;
    }

    // 🆕 MÉTODO AUXILIAR: Extrai valor numérico de dano
    extrairValorDano(danoStr) {
        if (!danoStr) return 0;
        
        // Remove espaços e converte para minúsculas
        const limpo = danoStr.toLowerCase().replace(/\s/g, '');
        
        // Extrai números de dados (ex: "2d10" -> 2*10 = 20)
        const match = limpo.match(/(\d+)d(\d+)/);
        if (match) {
            const quantidade = parseInt(match[1]);
            const lados = parseInt(match[2]);
            let base = quantidade * lados;
            
            // Adiciona bônus se houver (ex: "+2")
            const bonus = limpo.match(/\+(\d+)/);
            if (bonus) base += parseInt(bonus[1]);
            
            return base;
        }
        
        return 0;
    }

    // 🆕 MÉTODO NOVO: Seleciona itens baseado no contexto E raridade
    selecionarItensContextuais(textoSecao) {
    const palavrasChave = textoSecao.toLowerCase();
    const itensSelecionados = new Set();

    // 🆕 CONTEXTO SEMPRE INCLUI 'GERAL' AGORA
    const contextos = ['geral']; // Base sempre inclui geral
    
    // Adiciona contextos específicos se detectados
    const contextosEspecificos = {
        combate: ['luta', 'batalha', 'inimigo', 'ataque', 'defesa', 'arma', 'monstro', 'criatura'],
        exploracao: ['escuro', 'túnel', 'caverna', 'caminho', 'porta', 'corredor', 'sala'],
        cura: ['ferido', 'machucado', 'sangue', 'dor', 'fraco', 'energia', 'vida'],
        mistico: ['mágico', 'ritual', 'feitiço', 'místico', 'arcano', 'sobrenatural'],
        tesouro: ['baú', 'cofre', 'riqueza', 'ouro', 'tesouro', 'relíquia', 'antigo']
    };

    for (const [tipo, palavras] of Object.entries(contextosEspecificos)) {
        if (palavras.some(p => palavrasChave.includes(p))) {
            contextos.push(tipo);
        }
    }

    console.log(`[CONTEXTO] Detectado: ${contextos.join(', ')}`);

    // 🆕 PROBABILIDADES MAIS ALTAS
    const adicionarItens = (pool, quantidade, probabilidade) => {
        const embaralhado = [...pool].sort(() => Math.random() - 0.5);
        let adicionados = 0;
        
        for (const itemId of embaralhado) {
            if (adicionados >= quantidade) break;
            
            // 🆕 FILTRO RELAXADO - Aceita mais itens
            const raridade = this.obterRaridade(itemId);
            const chanceAjustada = (raridade === 'COMUM') ? probabilidade * 1.3 : probabilidade;
            
            if (Math.random() < chanceAjustada) {
                itensSelecionados.add(itemId);
                adicionados++;
            }
        }
    };

    // Adiciona itens por raridade
        adicionarItens(this.itensClassificados.comuns, 6, 0.7);   // 6 comuns (70% chance cada)
        adicionarItens(this.itensClassificados.incomuns, 4, 0.5); // 4 incomuns (50% chance)
        adicionarItens(this.itensClassificados.raros, 2, 0.3);    // 2 raros (30% chance)


    // 🆕 GARANTE MÍNIMO DE 12 ITENS
    if (itensSelecionados.size < 12) {
        const todosDisponiveis = [
            ...this.itensClassificados.comuns,
            ...this.itensClassificados.incomuns,
            ...this.itensClassificados.raros
        ].filter(id => !itensSelecionados.has(id));
        
        const necessarios = 12 - itensSelecionados.size;
        const extras = todosDisponiveis
            .sort(() => Math.random() - 0.5)
            .slice(0, necessarios);
        
        extras.forEach(id => itensSelecionados.add(id));
    }

    console.log(`[ITENS] Selecionados: ${itensSelecionados.size} itens`);
    return Array.from(itensSelecionados);
}

    // 🆕 MÉTODO AUXILIAR: Verifica se item é relevante ao contexto
    itemRelevante(itemId, contextos) {
        const item = this.itensNarrativas[itemId];
        if (!item) return false;

        for (const contexto of contextos) {
            switch(contexto) {
                case 'combate':
                    if (item.slot === 'weapon' || item.projectile || 
                        item.slot === 'armor' || item.slot === 'shield' ||
                        item.effect === 'explosion' || item.effect === 'stun') return true;
                    break;
                
                case 'exploracao':
                    if (itemId.includes('tocha') || itemId.includes('corda') || 
                        itemId.includes('esqueiro') || itemId.includes('vela') ||
                        item.slot === 'helmet') return true;
                    break;
                
                case 'cura':
                    if (item.effect === 'heal' || itemId.includes('pocao') || 
                        itemId.includes('kit') || itemId.includes('ervas')) return true;
                    break;
                
                case 'mistico':
                    if (item.componente || item.slot === 'amulet' || 
                        item.slot === 'ring' || item.bonuses) return true;
                    break;
                
                case 'tesouro':
                    if (itemId.includes('reliquia') || itemId.includes('ouro') ||
                        itemId.includes('estatueta') || itemId.includes('calice')) return true;
                    break;
                
                case 'geral':
                    return true; // Aceita qualquer item
            }
        }

        return false;
    }

    // 🆕 MÉTODO ATUALIZADO: Gera string formatada de itens para o prompt
    getItensAmostra(textoSecao = '') {
        const itensSelecionados = this.selecionarItensContextuais(textoSecao);
        
        let output = '\n**ITENS DISPONÍVEIS PARA ESTA SEÇÃO:**\n';
        output += '(Use APENAS estes IDs. Formato: {"tipo": "item", "item": "ID_DO_ITEM"})\n\n';

        for (const itemId of itensSelecionados) {
            const item = this.itensNarrativas[itemId];
            if (item) {
                const raridade = this.obterRaridade(itemId);
                output += `- "${itemId}" (${item.content}) [${raridade}]\n`;
                if (item.description) {
                    output += `  └─ ${item.description}\n`;
                }
            }
        }

        output += `\n**TOTAL: ${itensSelecionados.length} itens disponíveis**\n`;
        output += `**IMPORTANTE:** dar itens se o texto mencionar encontrar/pegar algo.\n`;


        return output;
    }

    // 🆕 MÉTODO AUXILIAR: Identifica raridade de um item
    obterRaridade(itemId) {
        if (this.itensClassificados.raros.includes(itemId)) return 'RARO';
        if (this.itensClassificados.incomuns.includes(itemId)) return 'INCOMUM';
        return 'COMUM';
    }

    // 🆕 MÉTODO NOVO: Gera string formatada de monstros para o prompt
    getMonstrosAmostra() {
        let output = '\n**LISTA DE MONSTROS VÁLIDOS (para campo "batalha"):**\n';
        output += `**CRÍTICO:** Use APENAS IDs desta lista. NÃO invente monstros.\n`;
        output += `- Comuns: "${this.monstrosClassificados.comuns.join('", "')}"\n`;
        output += `- Incomuns: "${this.monstrosClassificados.incomuns.join('", "')}"\n`;
        output += `- Raros: "${this.monstrosClassificados.raros.join('", "')}"\n`;
        return output;
    }

    analisarSecao(secao, numeroSecao, escolhaFeita = null) {
        const contexto = {
            numero: numeroSecao.toString(),
            texto: secao.texto,
            opcoes: secao.opcoes ? secao.opcoes.map(op => op.texto) : ["Fim da seção."],
            escolhaFeita: escolhaFeita
        };

        this.historico.push(contexto);
        if (this.historico.length > 5) this.historico.shift();

        if (this.emergenciaAtiva && escolhaFeita) {
            this.escolhasEmergentes.push(escolhaFeita);
        }

        return contexto;
    }

    analisarPadroes() {
        const ultimasEscolhas = this.historico.slice(-4)
            .map(h => h.escolhaFeita)
            .filter(e => e);
        
        if (ultimasEscolhas.length < 3) return null;

        const contador = {};
        ultimasEscolhas.forEach(e => contador[e] = (contador[e] || 0) + 1);
        
        const maisComunm = Object.entries(contador).sort((a,b) => b[1] - a[1])[0];
        
        if (maisComunm && maisComunm[1] >= 3) {
            return `PADRÃO DETECTADO: O jogador sempre tende a "${maisComunm[0]}". SUBVERTA ISSO.`;
        }
        return null;
    }

    async verificarEAtivarEmergencia(contador, tituloNarrativa, secaoAtual, pontoDeRetorno, habilitada) {
        if (this.emergenciaAtiva || !habilitada) return null;

        // ⚠️ ATENÇÃO: Mudado para 1 para TESTES, como você mencionou.
        // Mude para `contador < 4` para voltar ao normal (gatilho a cada 4 seções).
        if (contador < 4) { 
            return null;
        }

        console.log(`[EMERGÊNCIA] 🎯 GATILHO: Contador ${contador} atingiu o limite.`);

        try {
            const prompt = this.construirPrompt(tituloNarrativa, secaoAtual);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);
            
            if (!respostaIA || !respostaIA.texto || !respostaIA.opcoes) {
                throw new Error("Resposta da IA está mal formatada (faltando texto ou opções).");
            }

            const idEmergente = this.gerarIdEmergente();

            this.emergenciaAtiva = true;
            this.secaoOrigemEmergencia = pontoDeRetorno || 1;
            this.escolhasEmergentes = [];
            this.profundidadeAtual = 1;

            const secaoEmergente = this.processarRespostaIA(respostaIA, secaoAtual, idEmergente);
            this.secoesEmergentes.set(idEmergente, secaoEmergente);

            console.log(`[EMERGÊNCIA] ✅ IA gerou a seção: ${idEmergente}`);
            return { ativada: true, idSecao: idEmergente, secao: secaoEmergente };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao chamar o Oráculo:", error);
            return null;
        }
    }

    
    // EM emergencia.js, SUBSTITUA o método inteiro:

    construirPrompt(tituloNarrativa, secaoAtual) {
        const historicoFormatado = this.historico.map(h =>
            `Seção ${h.numero}: "${h.texto.substring(0, 100)}..."\n` +
            `Opções: [${h.opcoes.join(', ')}]` +
            (h.escolhaFeita ? `\nEscolha: "${h.escolhaFeita}"` : '')
        ).join('\n\n');

        const textoSecaoOriginal = secaoAtual.texto || this.historico.at(-1)?.texto || "contexto desconhecido";
        const padroes = this.analisarPadroes();
        
        const itensAmostra = this.getItensAmostra(textoSecaoOriginal);
        const monstrosAmostra = this.getMonstrosAmostra();
        
        return `
Você é um 'Mestre de Jogo' que expande narrativas de forma COERENTE e ANCORADA.
Aventura: "${tituloNarrativa}"

${padroes ? `\n**${padroes}**\n` : ''}

**MISSÃO CRÍTICA:**
Você vai expandir a narrativa atual de UMA destas 3 formas (escolha a mais apropriada):

**MODO 1: EXPANSÃO NATURAL (Preferencial - 60% dos casos)**
- A seção continua NORMALMENTE, mas com mais detalhes/opções
- Exemplo: Jogador está em sala → você adiciona "Há uma porta escondida atrás do tapete"
- Não muda o tom, não adiciona estranhamento
- Apenas EXPANDE o que já existe com novos elementos concretos
- Use este modo se o contexto for mundano/normal

**MODO 2: DETALHE PERTURBADOR (30% dos casos)**
- Um PEQUENO detalhe físico está errado
- Exemplo: "A sombra da vela aponta para direção errada"
- ANCORAGEM OBRIGATÓRIA: deve afetar algo CONCRETO já mencionado
- Nada abstrato, cósmico ou surreal demais
- Use este modo se quiser adicionar tensão sutil

**MODO 3: EVENTO MENOR (10% dos casos)**
- Algo pequeno ACONTECE (não apenas "está estranho")
- Exemplo: "Um objeto cai da prateleira sozinho"
- Deve ser físico, tangível, explicável (mesmo que estranho)
- Use este modo apenas se fizer sentido narrativo

**REGRAS ABSOLUTAS:**

1. **ANCORAGEM FÍSICA OBRIGATÓRIA**
   - SEMPRE referencie elementos CONCRETOS da seção original
   - Sala → descreva a sala
   - Objeto → o que acontece com o objeto
   - Pessoa → como a pessoa age
   - NUNCA: "realidade se fragmenta", "dimensões colidem", "vazio cósmico"

2. **ESCALA CONTROLADA**
   - Mudanças devem ser PEQUENAS
   - Preferência: adicionar detalhes/opções sobre causar estranhamento
   - Um detalhe errado > múltiplos impossíveis

3. **COERÊNCIA NARRATIVA**
   - Se a seção é sobre "entrar numa biblioteca" → fale da biblioteca
   - Não leve para outros lugares/dimensões/abstrações
   - Expanda o QUE JÁ EXISTE

4. **TOM APROPRIADO**
   - Se contexto é normal → seja normal (Modo 1)
   - Se já há tensão → adicione detalhe sutil (Modo 2)
   - Apenas se muito apropriado → evento menor (Modo 3)

**PROIBIDO:**
- ❌ Mudanças cósmicas/dimensionais
- ❌ Múltiplos fenômenos simultâneos
- ❌ Linguagem muito poética/abstrata
- ❌ Desviar do local/contexto atual
- ❌ "Realidade", "tempo", "espaço" como protagonistas

**CONTEXTO ATUAL (Seção ${secaoAtual.numero || this.historico.at(-1)?.numero}):**
"${textoSecaoOriginal}"

**HISTÓRICO:**
${historicoFormatado}

**INSTRUÇÕES FINAIS:**

1. Escolha UM dos 3 modos
2. Gere texto (80-180 palavras) - MENOR que o original
3. Crie 2-5 opções (varie livremente)
4. Inclua SEMPRE pelo menos uma opção que seja claramente "continuar normal"
5. Efeitos de energia: apenas se apropriado (-50 - acidente, amputação - a +10)
6. **ITENS** Se seu texto mencionar encontrar/abrir/pegar algo físico, adicione 1-2 itens nos efeitos.
${itensAmostra}

// 🆕 INÍCIO DO NOVO BLOCO DE REGRAS DE TESTE

**7. REGRAS DE TESTES DE ATRIBUTO (CRÍTICO - LEIA ATENTAMENTE)**
    
    **A. QUANDO CRIAR UM TESTE?**
       - Um teste SÓ é necessário quando há **RISCO REAL** ou **INCERTEZA SIGNIFICATIVA**.
       - **RISCO:** Se falhar, algo ruim acontece (dano, alarme, morte).
       - **INCERTEZA:** O sucesso não é garantido (decifrar, negociar).
       - ❌ **NÃO CRIE TESTES** para ações triviais: "limpar um espelho", "ler um livro", "andar por uma sala segura".
       - ✅ **CRIE TESTES** para ações de risco: "escalar um muro desmoronando", "mexer em uma armadilha", "beber uma poção desconhecida".
    
    **B. LIMITE DE TESTES:**
       - **MÁXIMO UM (1) TESTE DE ATRIBUTO POR SEÇÃO.** Se você incluir uma "OPÇÃO DE TESTE MORTAL", você não pode incluir uma "OPÇÃO DE TESTE NORMAL".
    
    **C. DISTRIBUIÇÃO DE ATRIBUTOS (Prioridades):**
       - Você deve variar os atributos. A IA está usando "habilidade" demais. Use esta distribuição:
       - **50% SORTE (LUCK):** Para perigos **passivos** e **ambientais**. O jogador não está *tentando* fazer algo, ele está *evitando* algo.
         - *Exemplos:* "Evitar o desmoronamento do teto (Teste de Sorte)", "Não pisar na placa de pressão (Teste de Sorte)", "Passar pelo corredor sem atrair atenção (Teste de Sorte)".
       - **40% HABILIDADE (SKILL):** Para ações **ativas** e **deliberadas** que exigem perícia. O jogador está *tentando* fazer algo.
         - *Físico:* "Desarmar a armadilha (Teste de Habilidade)", "Forçar a fechadura (Teste de Habilidade)".
         - *Mental:* "Decifrar o enigma (Teste de Habilidade)", "Lembrar do símbolo (Teste de Habilidade)".
       - **10% CARISMA (CHARISMA):** Apenas para interação social.
         - *Exemplos:* "Acalmar a criatura (Teste de Carisma)", "Intimidar o guarda (Teste de Carisma)".

**8. INSTRUÇÕES DE PERIGO (CRÍTICO - ORDEM DIRETA)**
        
Você **DEVE** criar tensão e risco real. Em **CADA** emergência, você **OBRIGATORIAMENTE** deve incluir **UMA** das seguintes mecânicas de perigo, respeitando as regras de teste acima (REGRA 7).
    
**1. OPÇÃO DE PERIGO OCULTO (Batalha) (Prioridade: 60%)**
    - Uma opção neutra que leva a uma batalha.
    - Ex: "Abrir o baú", "Tocar o orbe".
    - **Formato:** {"texto": "Tocar o orbe", "tipo": "perigo_oculto"}
    - (O prompt de continuação lidará com a revelação da batalha).
    - Use os monstros da lista:
${monstrosAmostra}

**2. OPÇÃO DE TESTE MORTAL (Prioridade: 15%)**
    - Uma opção que exige um teste de atributo onde a falha é a morte.
    - **Dificuldade DEVE ser 18+** (use 18, 20, 22).
    - **DEVE incluir "falha_mortal": true**.
    - **Use as "REGRAS DE TESTES DE ATRIBUTO (REGRA 7)"** para decidir o atributo (priorize SORTE e HABILIDADE).
    - Texto da opção deve indicar o risco (ex: "Saltar sobre o abismo (Teste de Sorte)", "Tentar desarmar a armadilha (Teste de Habilidade)").
    - **Formato:**
      {
        "texto": "Saltar sobre o abismo (Teste de Sorte)", 
        "tipo": "aprofundar", 
        "teste": "sorte", 
        "dificuldade": 20, 
        "falha_mortal": true, 
        "secao": "[ID_SUCESSO]"
      }

**3. OPÇÃO DE MORTE IMEDIATA (Prioridade: 10%)**
    - Uma opção que leva à morte instantânea (mas a IA vai descrevê-la primeiro).
    - Ex: "Beber o líquido estranho", "Pular no abismo", "Tocar o artefato amaldiçoado".
    - O texto da opção deve ser tolo ou curioso, mas não revelar a morte (ex: "Beber da fonte" > "Beber o veneno").
    - **Formato:**
      {
        "texto": "Beber o líquido na taça", 
        "tipo": "aprofundar", 
        "morte_imediata": true, 
        "secao": "[ID_MORTE_DESCRITA]" 
      }

**4. OPÇÃO DE TESTE NORMAL (Não-Mortal) (Prioridade: 15%)**
    - Apenas se nenhum dos acima for usado.
    - Dificuldade 10-15.
    - **Use as "REGRAS DE TESTES DE ATRIBUTO (REGRA 7)"** para decidir o atributo e o contexto.
    - **Formato:**
      {
        "texto": "Decifrar o enigma (Teste de Habilidade)", 
        "tipo": "aprofundar", 
        "teste": "habilidade", 
        "dificuldade": 15, 
        "secao": "[ID_SUCESSO]"
      }

// 🆕 FIM DO BLOCO DE PERIGO REESCRITO


**FORMATO (JSON PURO - Modo Normal):**

{
  "modo": "expansao_natural" | "detalhe_perturbador" | "evento_menor",
  "texto": "[Texto coerente e ancorado - 80-180 palavras]",
  "opcoes": [
    {"texto": "[Opção 1]", "tipo": "aprofundar"},
    {"texto": "[Opção 2]", "tipo": "neutra"},
    {"texto": "[Continuar normalmente]", "tipo": "recuar"}
  ],
  "efeitos": [
    {"tipo": "energia", "valor": X},
    {"tipo": "item", "item": "tocha"}
  ]
}

**FORMATO (JSON com Teste Mortal):**
{
  "modo": "expansao_natural",
  "texto": "[Texto descrevendo desafio]",
  "opcoes": [
    {
      "texto": "Escalar o muro instável (Teste de Habilidade)",
      "tipo": "aprofundar",
      "teste": "habilidade",
      "dificuldade": 18,
      "falha_mortal": true, 
      "secao": "[ID_SUCESSO]"
    },
    {"texto": "[Outra opção]", "tipo": "neutra", "secao": "[ID]"}
  ],
  "efeitos": []
}

**9. CRIANDO UM MUNDO QUE SE LEMBRA - MODIFICAÇÕES PERSISTENTES**

**🎮 POR QUE ISSO É IMPORTANTE:**
Quando o jogador volta a um local anterior e encontra algo novo, isso cria uma sensação poderosa de que o mundo é vivo e reage às suas ações. É como deixar sua marca no mundo.

**💡 EXEMPLOS DE MOMENTOS "UAU":**
- Voltar à entrada e descobrir uma passagem que não estava lá antes
- Revisitar uma sala e encontrar um item que apareceu por causa de uma ação anterior  
- Descobrir que uma decisão tomada horas atrás mudou permanentemente o ambiente

**🔧 COMO CRIAR ESSES MOMENTOS MAGICOS:**

Se sua cena inclui algo que poderia ter consequências em locais que o jogador já visitou, use o sistema de patches:

\`\`\`json
{
  "texto": "Ao girar o mecanismo, você ouve um ruído de pedras se movendo em algum lugar distante...",
  "opcoes": [
    {
      "texto": "Seguir na direção do ruído",
      "tipo": "aprofundar", 
      "secao": "emergente_IA_X",
      "efeitos": [
        {
          "tipo": "gerar_patch_persistente",
          "flag": "MECANISMO_GIRADO",
          "secao_alvo": 2
        }
      ]
    }
  ]
}
\`\`\`

**O que acontece depois:** Quando o jogador voltar à Seção 2, encontrará novas opções baseadas nessa flag!

**🎨 IDEIAS CRIATIVAS PARA PATCHES:**
- Uma alavanca que revela uma passagem secreta em área anterior
- Um ritual que ativa símbolos mágicos em salas já visitadas  
- Uma chave que destrava portas em locais familiares
- Um desmoronamento que abre novos caminhos em áreas conhecidas

`;
    }

    async chamarOraculoNarrativo(prompt, tentativa = 1) {
        const url = this.workerUrl;
        const maxTentativas = 3;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            // 🆕 Retry para 503 E 429 (rate limit)
if ((response.status === 503 || response.status === 429) && tentativa < maxTentativas) {
    const delay = tentativa * 3000; // 3s, 6s, 9s
    console.log(`[ORÁCULO] Erro ${response.status}, aguardando ${delay}ms... (${tentativa}/${maxTentativas})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.chamarOraculoNarrativo(prompt, tentativa + 1);
}


            if (!response.ok) {
                throw new Error(`Erro no Worker: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[ORÁCULO] 📦 Resposta completa:', JSON.stringify(data).substring(0, 500)); // 🆕 LOG


            let jsonText = null;

if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    jsonText = data.candidates[0].content.parts[0].text;
} else if (data.error) {
    throw new Error(`Erro da Gemini: ${data.error.message}`);
} else {
    throw new Error("Resposta da Gemini em formato inesperado.");
}

// 🆕 LIMPEZA MAIS AGRESSIVA
jsonText = jsonText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^[^{]*/, "") // Remove tudo antes do primeiro {
    .replace(/[^}]*$/, "") // Remove tudo depois do último }
    .trim();

if (!jsonText || !jsonText.startsWith('{')) {
    console.error('[ORÁCULO] ❌ Resposta não é JSON:', jsonText.substring(0, 200));
    throw new Error("IA retornou texto puro em vez de JSON.");
}

return JSON.parse(jsonText);


        } catch (err) {
            // 🆕 RETRY ESPECÍFICO PARA JSON INVÁLIDO
    if (err instanceof SyntaxError && tentativa < maxTentativas) {
        console.log(`[ORÁCULO] ⚠️ JSON inválido, tentando novamente... (${tentativa}/${maxTentativas})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.chamarOraculoNarrativo(prompt + "\n\n**ATENÇÃO: Retorne APENAS JSON válido, sem texto adicional.**", tentativa + 1);
    }
            if (tentativa >= maxTentativas) {
                throw err;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.chamarOraculoNarrativo(prompt, tentativa + 1);
        }
    }



    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        const numeroSecaoOrigem = this.secaoOrigemEmergencia;

        // Processa as opções...
        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
    
            // 🆕 Opção de Morte Imediata (leva a uma descrição de morte)
            if (op.morte_imediata) {
                return {
                    texto: op.texto,
                    secao: this.gerarIdEmergente(),
                    tipo: 'aprofundar',
                    emergente: true,
                    morte_imediata: true,
                    efeitos: op.efeitos || []
                };
            }

            // Opção que leva a perigo (não revela ainda)
            if (op.tipo === "perigo_oculto") {
                return {
                    texto: op.texto,
                    secao: this.gerarIdEmergente(),
                    tipo: 'perigo_oculto',
                    emergente: true,
                    efeitos: op.efeitos || []
                };
            }

            // Opção de iniciar batalha (revelada na seção seguinte)
            if (op.tipo === "iniciar_batalha") {
                return {
                    texto: op.texto,
                    batalha: op.monstro,
                    vitoria: numeroSecaoOrigem,
                    derrota: 320,
                    emergente: false,
                    efeitos: op.efeitos || []
                };
            }
            
            // OPÇÃO DE RECUAR (lógica existente)
            if (op.tipo === "recuar") {
                return {
                    texto: op.texto,
                    secao: numeroSecaoOrigem,
                    emergente: false,
                    tipo: 'recuar',
                    efeitos: op.efeitos || []
                };
            } 
            
            
        // OPÇÃO NORMAL (aprofundar / neutra / TESTE) (lógica existente)
        else {
            return {
                texto: op.texto,
                secao: this.gerarIdEmergente(),
                tipo: op.tipo,
                emergente: true,
                teste: op.teste, // 🆕 CAMPO DE TESTE
                dificuldade: op.dificuldade, // 🆕 CAMPO DE TESTE
                falha_mortal: op.falha_mortal, // 🆕 CAMPO DE TESTE
                efeitos: op.efeitos || [] // 🆕 CAMPO DE EFEITOS (PARA PATCH)
            };
        }            
    });


        // Retorna a seção principal
        return {
            texto: respostaJSON.texto,
            opcoes: opcoesProcessadas,
            efeitos: respostaJSON.efeitos || [],
            emergente: true,
            id: novoId,
            origem: numeroSecaoOrigem,
            modo: respostaJSON.modo,
            profundidade: this.profundidadeAtual,
            final: respostaJSON.final || false 
        };
    }



    async processarOpcaoEmergente(opcao, secaoPai, resultadoTeste = null) {
        if (!opcao.emergente || opcao.tipo === "recuar") {
            this.emergenciaAtiva = false;
            this.escolhasEmergentes = [];
            this.profundidadeAtual = 0;
            return null;
        }

        // 🆕 ATUALIZAÇÃO: Se a opção for uma batalha, o narrativas.js cuida disso.
        // A profundidade só deve aumentar se NÃO for uma batalha (pois a vitória já é o próximo passo).
        if (!opcao.batalha) {
             this.profundidadeAtual++;
             console.log(`[EMERGÊNCIA] Profundidade: ${this.profundidadeAtual}/5`);
        } else {
            console.log(`[EMERGÊNCIA] Batalha iniciada, profundidade mantida em: ${this.profundidadeAtual}`);
            // Não retorna, pois o narrativas.js lidará com a opção de batalha.
            // A próxima seção (vitória ou derrota) já foi registrada.
            return null; 
        }

        if (this.profundidadeAtual >= 5) {
            console.log('[EMERGÊNCIA] 🎯 PROFUNDIDADE MÁXIMA - Forçando convergência');
            return this.gerarConvergenciaForcada();
        }

        if (this.profundidadeAtual >= 3 && Math.random() < 0.2) {
            console.log('[EMERGÊNCIA] 🎯 Convergência natural acionada');
            return this.gerarConvergenciaForcada();
        }

        try {
            const prompt = this.construirPromptContinuacao(secaoPai, opcao, resultadoTeste);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);

            // 🆕 LOG CRÍTICO - VERIFICAR SE A IA GEROU PATCHES
            console.log('[PATCH] 🔍 Resposta completa da IA:', JSON.stringify(respostaIA, null, 2));
            
            let temPatch = false;
            if (respostaIA?.opcoes) {
                respostaIA.opcoes.forEach((op, idx) => {
                    if (op.efeitos && Array.isArray(op.efeitos)) {
                        console.log(`[PATCH] ✅ Opção ${idx} TEM efeitos:`, op.efeitos);
                        op.efeitos.forEach(ef => {
                            if (ef.tipo === 'gerar_patch_persistente') {
                                console.log(`[PATCH] 🎯 PATCH DETECTADO!`, ef);
                                temPatch = true;
                            }
                        });
                    }
                });
            }
            
            if (!temPatch) {
                console.warn('[PATCH] ⚠️ A IA NÃO GEROU NENHUM PATCH nesta seção!');
            }

            // 🆕 VALIDAÇÃO
if (!respostaIA || !respostaIA.texto || !respostaIA.opcoes) {
    console.error('[EMERGÊNCIA] ❌ Resposta inválida:', respostaIA);
    throw new Error("IA retornou resposta mal formatada.");
}

const proximaSecao = this.processarRespostaIA(respostaIA, secaoPai, opcao.secao);
this.secoesEmergentes.set(opcao.secao, proximaSecao);


            return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
            return this.gerarConvergenciaForcada();
        }
    }

    // 🆕 MÉTODO ATUALIZADO (recebe ID para consistência)
    gerarDerrotaEmergencia(idDerrota) {
        // Não reseta mais a emergência aqui, pois a derrota só acontece se o jogador perder.
        // A emergência continua ativa na seção de vitória.
        
        const textoDerrota = "Você foi sobrepujado pela ameaça inesperada. A escuridão toma conta de sua visão enquanto suas forças se esvaem. Sua jornada termina aqui.";

        const secaoDerrota = {
            texto: textoDerrota,
            opcoes: [], // Sem opções
            final: true, // É um final de jogo
            emergente: true,
            id: idDerrota,
            origem: this.secaoOrigemEmergencia,
            convergencia: false,
            final_emergencia: true
        };
        
        this.secoesEmergentes.set(idDerrota, secaoDerrota);
        console.log(`[EMERGÊNCIA] 💀 Seção de Derrota criada: ${idDerrota}`);
        return secaoDerrota;
    }

    gerarConvergenciaForcada() {
        this.emergenciaAtiva = false;
        this.escolhasEmergentes = [];
        this.profundidadeAtual = 0;

        const textosDesfecho = [
            "Aos poucos, tudo volta ao que era. O momento passou, deixando apenas uma impressão vaga na memória. Você segue em frente.",
            
            "A sensação se dissipa como fumaça. O que quer que tenha acontecido, agora acabou. A normalidade retorna.",
            
            "Você pisca, e percebe que está de volta. Tudo parece... comum novamente. Talvez sempre tenha sido."
        ];

        const secaoDesfecho = {
            texto: textosDesfecho[Math.floor(Math.random() * textosDesfecho.length)],
            opcoes: [{
                texto: "Continuar",
                secao: this.secaoOrigemEmergencia,
                emergente: false
            }],
            origem: this.secaoOrigemEmergencia,
            convergencia: true,
            final_emergencia: true
        };

        const idDesfecho = `emergente_desfecho_${Date.now()}`;
        this.secoesEmergentes.set(idDesfecho, secaoDesfecho);

        return {
            ativada: true,
            idSecao: idDesfecho,
            secao: secaoDesfecho
        };
    }


    // EM emergencia.js, SUBSTITUA o método inteiro:

    construirPromptContinuacao(secaoPai, opcao, resultadoTeste = null) {
        const textoPrimeiraEmergencia = this.secoesEmergentes.get('emergente_IA_1')?.texto.substring(0, 100) || secaoPai.texto.substring(0,100);
        const padroes = this.analisarPadroes();
        
        const escolhasNaEmergencia = this.escolhasEmergentes.length > 0 
            ? `\n**ESCOLHAS NA EMERGÊNCIA:** ${this.escolhasEmergentes.join(' → ')}\n` 
            : '';

        // 🆕 LÓGICA DE ALERTA DE TESTE ATUALIZADA
        const alertaMorteImediata = opcao.morte_imediata ? `
☠️ **MORTE DO JOGADOR!** O jogador escolheu uma opção de morte imediata (ex: 'Beber o veneno').
**INSTRUÇÃO:** Descreva vividamente a morte dele. O texto DEVE ser uma conclusão.
**OBRIGATÓRIO:** Adicione \`"final": true\` na raiz do JSON.
**NÃO** crie opções.` : '';

        const alertaTeste = resultadoTeste ? `
**🎲 RESULTADO DO TESTE:**
O jogador fez um teste de ${resultadoTeste.atributo} (dificuldade ${resultadoTeste.dificuldade}).
**RESULTADO: ${resultadoTeste.sucesso ? 'SUCESSO' : 'FALHA'}**

${resultadoTeste.sucesso ? '✅ Você DEVE descrever o SUCESSO da ação. O jogador conseguiu realizar o que tentou.' : ''}

${(resultadoTeste.mortal === true) ? `
☠️ **MORTE DO JOGADOR!** O jogador falhou em um teste mortal.
**INSTRUÇÃO:** Descreva vividamente a morte dele. O texto DEVE ser uma conclusão.
**OBRIGATÓRIO:** Adicione \`"final": true\` na raiz do JSON.
**NÃO** crie opções.` : ''}

${(resultadoTeste.sucesso === false && resultadoTeste.mortal === false) ? `
❌ Descreva a FALHA (não-mortal). O jogador já tomou dano automaticamente.
**CRÍTICO: NÃO DÊ ITENS NESTA SEÇÃO DE FALHA.**
O jogador falhou. Não o recompense com itens. Apenas narre a falha.
**NÃO** adicione efeitos de energia por esta falha.` : ''}
` : '';

        const alertaMorte = this.profundidadeAtual >= 2 ? 
          `\n**☠️ Profundidade ${this.profundidadeAtual}: Dano -10 a -999 apropriado**\n` : '';
        
        const alertaPerigo = opcao.tipo === 'perigo_oculto' ? `
**⚠️ ATENÇÃO CRÍTICA: O jogador escolheu uma opção de "perigo_oculto"!**
**VOCÊ DEVE OBRIGATORIAMENTE NESTA SEÇÃO:**
1. Descrever a REVELAÇÃO do perigo (ex: "Ao tocar, uma sombra emerge!")
2. Incluir opção com "tipo": "iniciar_batalha", "texto": "Enfrentar [criatura]", "monstro": "[ID_VALIDO]"
3. O monstro deve fazer sentido físico com o ambiente
4. Incluir outras opções (fugir, recuar, etc.)
` : '';


        const itensAmostra = this.getItensAmostra(secaoPai.texto);
        const monstrosAmostra = this.getMonstrosAmostra();

        return `
Você é um Mestre de Jogo que mantém COERÊNCIA narrativa.

**PROFUNDIDADE ATUAL: ${this.profundidadeAtual}/5**
${this.profundidadeAtual >= 3 ? '⚠️ PRÓXIMO DO LIMITE - Considere convergir naturalmente' : ''}

**CONTEXTO:**
Texto anterior: "${secaoPai.texto.substring(0, 150)}..."
Modo usado: ${secaoPai.modo || 'desconhecido'}

Jogador escolheu: "${opcao.texto}" (tipo: ${opcao.tipo})

${escolhasNaEmergencia}
${alertaMorteImediata}
${alertaTeste}
${alertaPerigo}
${padroes ? `**${padroes}**\n` : ''}


**ANCORAGEM OBRIGATÓRIA:**
Referência ao contexto original: "${textoPrimeiraEmergencia}..."

**INSTRUÇÕES:**

1. **PRIORIDADE MÁXIMA: MORTE** - Se \`${"alertaMorteImediata"}\` ou \`${"alertaTeste (mortal)"}\` estiverem ativos, IGNORE TODAS AS OUTRAS REGRAS.
   - Apenas escreva a descrição da morte e retorne \`"final": true\`.
   - Exemplo JSON: \`{"modo": "evento_menor", "texto": "Você morre...", "opcoes": [], "final": true}\`

2. **ANCORAGEM**
   - Consequência deve se conectar ao ambiente/objetos FÍSICOS originais
   - Se está ficando abstrato demais → volte ao concreto
   - Exemplo: Em vez de "tempo se dobra" → "o relógio na parede parou"

3. **PROFUNDIDADE ${this.profundidadeAtual}:**
   ${this.profundidadeAtual < 3 ? '- Pode expandir normalmente' : ''}
   ${this.profundidadeAtual >= 3 ? '- CONSIDERE oferecer opção clara de "sair/encerrar"' : ''}
   ${this.profundidadeAtual >= 4 ? '- RECOMENDADO: faça próxima seção ser conclusão natural' : ''}

4. **CONSEQUÊNCIA DA ESCOLHA:**
   - Deve ser física e tangível
   - Conectada ao contexto original
   - Coerente com o modo anterior

5. **OPÇÕES (2-4):**
   - Se profundidade < 3: normal (aprofundar/neutra/recuar)
   - Se profundidade >= 3: INCLUIR opção óbvia de "continuar/sair"

6. **ITENS** - Se seu texto mencionar encontrar/abrir/pegar algo físico, adicione 1-2 itens nos efeitos.
   - **EXCEÇÃO:** Se \`${"alertaTeste"}\` indicar FALHA, **NÃO DÊ ITENS**.
${itensAmostra}

7. **FALHA EM TESTE = DANO AUTOMÁTICO**
   - Se \`${"alertaTeste"}\` mostra FALHA (não-mortal), o sistema JÁ aplicou dano.
   - **NÃO** adicione efeitos de energia por esta falha no seu JSON.
   - Apenas narre o que aconteceu.


// 🆕 INÍCIO DO NOVO BLOCO DE REGRAS DE TESTE

**8. REGRAS DE TESTES DE ATRIBUTO (CRÍTICO - LEIA ATENTAMENTE)**
    
    **A. QUANDO CRIAR UM TESTE?**
       - Um teste SÓ é necessário quando há **RISCO REAL** ou **INCERTEZA SIGNIFICATIVA**.
       - **RISCO:** Se falhar, algo ruim acontece (dano, alarme, morte).
       - **INCERTEZA:** O sucesso não é garantido (decifrar, negociar).
       - ❌ **NÃO CRIE TESTES** para ações triviais: "limpar um espelho", "ler um livro", "andar por uma sala segura".
       - ✅ **CRIE TESTES** para ações de risco: "escalar um muro desmoronando", "mexer em uma armadilha", "beber uma poção desconhecida".
    
    **B. LIMITE DE TESTES:**
       - **MÁXIMO UM (1) TESTE DE ATRIBUTO POR SEÇÃO.** Se você incluir uma "OPÇÃO DE TESTE MORTAL", você não pode incluir uma "OPÇÃO DE TESTE NORMAL".
    
    **C. DISTRIBUIÇÃO DE ATRIBUTOS (Prioridades):**
       - Você deve variar os atributos. A IA está usando "habilidade" demais. Use esta distribuição:
       - **50% SORTE (LUCK):** Para perigos **passivos** e **ambientais**. O jogador não está *tentando* fazer algo, ele está *evitando* algo.
         - *Exemplos:* "Evitar o desmoronamento do teto (Teste de Sorte)", "Não pisar na placa de pressão (Teste de Sorte)", "Passar pelo corredor sem atrair atenção (Teste de Sorte)".
       - **40% HABILIDADE (SKILL):** Para ações **ativas** e **deliberadas** que exigem perícia. O jogador está *tentando* fazer algo.
         - *Físico:* "Desarmar a armadilha (Teste de Habilidade)", "Forçar a fechadura (Teste de Habilidade)".
         - *Mental:* "Decifrar o enigma (Teste de Habilidade)", "Lembrar do símbolo (Teste de Habilidade)".
       - **10% CARISMA (CHARISMA):** Apenas para interação social.
         - *Exemplos:* "Acalmar a criatura (Teste de Carisma)", "Intimidar o guarda (Teste de Carisma)".

**9. INSTRUÇÕES DE PERIGO (CRÍTICO - ORDEM DIRETA)** 🆕
        
Você **DEVE** criar tensão e risco real. Em **CADA** emergência, você **OBRIGATORIAMENTE** deve incluir **UMA** das seguintes mecânicas de perigo, respeitando as regras de teste acima (REGRA 8).

**1. OPÇÃO DE PERIGO OCULTO (Batalha) (Prioridade: 60%)** 🆕
    - Uma opção neutra que leva a uma batalha.
    - Ex: "Abrir o baú", "Tocar o orbe".
    - **Formato:** {"texto": "Tocar o orbe", "tipo": "perigo_oculto"}
    - (O prompt de continuação lidará com a revelação da batalha).
    - Use os monstros da lista:
${monstrosAmostra}

**2. OPÇÃO DE TESTE MORTAL (Prioridade: 15%)** 🆕
    - Uma opção que exige um teste de atributo onde a falha é a morte.
    - **Dificuldade DEVE ser 18+** (use 18, 20, 22).
    - **DEVE incluir "falha_mortal": true**.
    - **Atributos:** VARIE (50% sorte, 40% habilidade, 10% carisma).
    - Texto da opção deve indicar o risco (ex: "Saltar sobre o abismo (Teste de Sorte)", "Tentar desarmar a armadilha (Teste de Habilidade)").
    - **Formato:**
      {
        "texto": "Saltar sobre o abismo (Teste de Sorte)", 
        "tipo": "aprofundar", 
        "teste": "sorte", 
        "dificuldade": 20, 
        "falha_mortal": true, 
        "secao": "[ID_SUCESSO]"
      }

**3. OPÇÃO DE MORTE IMEDIATA (Prioridade: 10%)** 🆕
    - Uma opção que leva à morte instantânea (mas a IA vai descrevê-la primeiro).
    - Ex: "Beber o líquido estranho", "Pular no abismo", "Tocar o artefato amaldiçoado".
    - O texto da opção deve ser tolo ou curioso, mas não revelar a morte (ex: "Beber da fonte" > "Beber o veneno").
    - **Formato:**
      {
        "texto": "Beber o líquido na taça", 
        "tipo": "aprofundar", 
        "morte_imediata": true, // <-- MUDANÇA
        "secao": "[ID_MORTE_DESCRITA]" // <-- MUDANÇA (não é 320)
      }

**4. OPÇÃO DE TESTE NORMAL (Não-Mortal) (Prioridade: 15%)**
    - Apenas se nenhum dos acima for usado e você ainda quiser um teste.
    - Dificuldade 10-15.
    - **Formato:**
      {
        "texto": "Decifrar o enigma (Teste de Habilidade)", 
        "tipo": "aprofundar", 
        "teste": "habilidade", 
        "dificuldade": 15, 
        "secao": "[ID_SUCESSO]"
      }

**10. MODIFICAÇÃO PERSISTENTE (OBRIGATÓRIO - CADA SEÇÃO EMERGENTE)**

🚨 **REGRA ABSOLUTA - NÃO NEGOCIÁVEL:**
Toda seção emergente DEVE conter PELO MENOS UMA opção com efeito de patch.

**LISTA DE SEÇÕES DO ESQUELETO (use qualquer número entre 1-320):**
Seções já visitadas pelo jogador: ${this.historico.map(h => h.numero).join(', ')}

**EXEMPLOS PRÁTICOS (COPIE E ADAPTE):**

**Exemplo 1 - Porta trancada:**
{
  "texto": "Girar a chave na fechadura",
  "tipo": "aprofundar",
  "secao": "emergente_IA_X",
  "efeitos": [
    {
      "tipo": "gerar_patch_persistente",
      "flag": "PORTA_DESTRANCADA",
      "secao_alvo": 2
    }
  ]
}

**Exemplo 2 - Alavanca:**
{
  "texto": "Puxar a alavanca de ferro",
  "tipo": "aprofundar",
  "secao": "emergente_IA_X",
  "efeitos": [
    {
      "tipo": "gerar_patch_persistente",
      "flag": "MECANISMO_ATIVADO",
      "secao_alvo": 6
    }
  ]
}

**Exemplo 3 - Item mágico:**
{
  "texto": "Ativar o cristal antigo",
  "tipo": "aprofundar",
  "secao": "emergente_IA_X",
  "efeitos": [
    {
      "tipo": "gerar_patch_persistente",
      "flag": "CRISTAL_ATIVADO",
      "secao_alvo": 17
    }
  ]
}

**⚠️ VALIDAÇÃO DO SEU JSON:**
Antes de retornar sua resposta, VERIFIQUE:
- [ ] Pelo menos UMA opção tem array "efeitos"?
- [ ] O efeito tem "tipo": "gerar_patch_persistente"?
- [ ] A "flag" está em MAIÚSCULAS_COM_UNDERSCORES?
- [ ] A "secao_alvo" é um número entre 1-320?

❌ **SE NÃO TIVER PATCH = JSON INVÁLIDO**


**FORMATO (JSON PURO - Modo Normal):**
{
  "modo": "expansao_natural",
  "texto": "[80-150 palavras - ancorado e coerente]",
  "opcoes": [
    {"texto": "...", "tipo": "aprofundar"},
    ${this.profundidadeAtual >= 3 ? '{"texto": "[Opção clara de sair/continuar]", "tipo": "recuar"}' : '{"texto": "[Outra opção]", "tipo": "neutra"}'}
  ],
  "efeitos": [
    {"tipo": "energia", "valor": X},
    {"tipo": "item", "item": "tocha"}
  ]
}


**FORMATO (JSON com Teste Mortal):**
{
  "modo": "expansao_natural",
  "texto": "[Texto descrevendo desafio]",
  "opcoes": [
    {
      "texto": "Escalar o muro instável (Teste de Habilidade)",
      "tipo": "aprofundar",
      "teste": "habilidade",
      "dificuldade": 18,
      "falha_mortal": true, 
      "secao": "[ID_SUCESSO]"
    },
    {"texto": "[Outra opção]", "tipo": "neutra", "secao": "[ID]"}
  ],
  "efeitos": []
}

**PATCH OBRIGATÓRIO (COPIE E COLE UM EXEMPLO)**

🚨 **VOCÊ DEVE INCLUIR ISTO EM PELO MENOS UMA OPÇÃO:**

{
  "texto": "[Ação que muda algo no mundo]",
  "tipo": "aprofundar",
  "secao": "emergente_IA_X",
  "efeitos": [
    {
      "tipo": "gerar_patch_persistente",
      "flag": "[NOME_AÇÃO]",
      "secao_alvo": ${this.historico[0]?.numero || 1}
    }
  ]
}

**Exemplos de FLAGS válidas:**
- PORTA_DESTRANCADA
- ALAVANCA_PUXADA  
- MECANISMO_ATIVADO
- RITUAL_COMPLETADO
- CRISTAL_QUEBRADO

**Seções disponíveis para patch:**
${this.historico.map(h => `- Seção ${h.numero}: "${h.texto.substring(0, 50)}..."`).join('\n')}

⚠️ **SEU JSON SERÁ REJEITADO SE NÃO TIVER UM PATCH!**

`;
    }
```

---

## ✅ Checklist de Verificação

Após fazer essas 3 modificações:

1. **Salve** o arquivo `emergencia.js`
2. **Recarregue** a página (Ctrl+F5 / Cmd+Shift+R)
3. **Entre** em uma emergência
4. **Verifique** o console do navegador

Você **DEVE** ver:
```
[PATCH] 🔍 Resposta completa da IA: {...}
[PATCH] ✅ Opção 0 TEM efeitos: [...]
[PATCH] 🎯 PATCH DETECTADO! {tipo: 'gerar_patch_persistente', ...}
```

Se aparecer:
```
[PATCH] ⚠️ A IA NÃO GEROU NENHUM PATCH nesta seção!
    
// =======================================================================
// === INÍCIO DO MÉTODO (gerarPatchPersistente) COM LOGS COMPLETOS ===
// =======================================================================
async gerarPatchPersistente(secaoOriginal, flagNome, historicoJogador) {
    console.log(`[PATCH] 🔧 INICIANDO gerarPatchPersistente`);
    console.log(`[PATCH] Flag: "${flagNome}"`);
    console.log(`[PATCH] Seção Alvo: ${secaoOriginal.id}`);
    console.log(`[PATCH] Texto Original: "${secaoOriginal.texto.substring(0, 100)}..."`);
    console.log(`[PATCH] Opções Originais: ${secaoOriginal.opcoes ? secaoOriginal.opcoes.length : 0}`);

    // 🆕 PROMPT CORRIGIDO (Usa aspas simples ' nos exemplos para evitar SyntaxError)
    const prompt = `
Você é um 'Mestre de Jogo' que implementa mudanças permanentes no mundo (Backtracking Dinâmico).

**MISSÃO:**
O jogador ativou uma flag ("${flagNome}"). Agora, você deve criar um "patch" de modificação para uma seção do esqueleto que ele irá revisitar. A mudança deve ser uma consequência LÓGICA da flag.

**FLAG ATIVADA:**
"${flagNome}"

**HISTÓRICO DO JOGADOR (Contexto):**
${historicoJogador}

**DADOS DA SEÇÃO ORIGINAL (ID: ${secaoOriginal.id}) QUE SERÁ MODIFICADA:**
* **Texto Original:** "${secaoOriginal.texto}"
* **Opções Originais:**
${secaoOriginal.opcoes ? secaoOriginal.opcoes.map((op, i) => `    - [${i}] "${op.texto}"`).join('\n') : '    - Nenhuma opção'}

**REGRAS DE PATCH (CRÍTICO):**

1.  **PRESERVAR O ESQUELETO:** O jogador DEVE poder continuar a história original. NÃO remova opções que quebrem o fluxo principal.
2.  **ADICIONAR, NÃO SUBSTITUIR:** Você só pode ADICIONAR 1 ou 2 novas opções.
3.  **SUBSEÇÕES (NOVAS SEÇÕES):**
    * As "novas_opcoes" devem apontar para IDs de "novas_secoes" (ex: "persistente_IA_1").
    * Você deve criar de 1 a 3 "novas_secoes" no total.
    * Cada "nova_secao" é uma expansão livre (texto, opções, itens, monstros).
    * **OBRIGATÓRIO:** Cada "nova_secao" DEVE ter pelo menos uma opção para "Retornar" (ex: '{"texto": "Retornar ao corredor", "secao": ${secaoOriginal.id}}'), permitindo ao jogador sair da subseção.
4.  **MONSTROS E ITENS:** Você pode usar as listas abaixo para adicionar batalhas ou itens nas novas seções.

${this.getItensAmostra(secaoOriginal.texto)}
${this.getMonstrosAmostra()}

**FORMATO DA RESPOSTA (JSON PURO - APENAS O PATCH):**

{
  "novas_opcoes": [
    {
      "texto": "[Texto da NOVA opção (ex: Investigar a porta agora aberta)]",
      "secao": "persistente_IA_1" 
    }
  ],
  "novas_secoes": {
    "persistente_IA_1": {
      "texto": "[Texto da nova subseção, consequência da flag]",
      "batalha": "servo-pedra",
      "vitoria": "persistente_IA_2",
      "derrota": 320
    },
    "persistente_IA_2": {
      "texto": "[Texto após a batalha...]",
      "efeitos": [{"tipo": "item", "item": "adaga"}],
      "opcoes": [
        {"texto": "Examinar o baú que o monstro guardava", "secao": "persistente_IA_3"},
        {"texto": "Retornar ao corredor principal", "secao": ${secaoOriginal.id}} 
      ]
    },
    "persistente_IA_3": {
       "texto": "...",
       "opcoes": [
         {"texto": "Retornar ao corredor principal", "secao": ${secaoOriginal.id}}
       ]
    }
  }
}
`;

    try {
        console.log(`[PATCH] 📡 Enviando prompt para IA...`);
        console.log(`[PATCH] Tamanho do prompt: ${prompt.length} caracteres`);
        
        const patchJSON = await this.chamarOraculoNarrativo(prompt);
        
        console.log(`[PATCH] ✅ Resposta da IA recebida:`, patchJSON);
        
        // Validação básica do patch
        if (!patchJSON) {
            console.error(`[PATCH] ❌ Resposta da IA é nula`);
            throw new Error("IA retornou resposta nula.");
        }
        
        if (!patchJSON.novas_opcoes) {
            console.error(`[PATCH] ❌ Patch mal formatado - faltando 'novas_opcoes'`);
            throw new Error("IA retornou um patch sem 'novas_opcoes'.");
        }
        
        if (!patchJSON.novas_secoes) {
            console.error(`[PATCH] ❌ Patch mal formatado - faltando 'novas_secoes'`);
            throw new Error("IA retornou um patch sem 'novas_secoes'.");
        }

        console.log(`[PATCH] 🎉 Patch gerado com sucesso para Seção ${secaoOriginal.id}`);
        console.log(`[PATCH] Novas opções: ${patchJSON.novas_opcoes.length}`);
        console.log(`[PATCH] Novas seções: ${Object.keys(patchJSON.novas_secoes).join(', ')}`);
        
        // Log detalhado do conteúdo
        patchJSON.novas_opcoes.forEach((op, idx) => {
            console.log(`[PATCH] Nova opção ${idx + 1}: "${op.texto}" → ${op.secao}`);
        });
        
        Object.entries(patchJSON.novas_secoes).forEach(([id, secao]) => {
            console.log(`[PATCH] Nova seção ${id}: "${secao.texto.substring(0, 50)}..."`);
        });
        
        return patchJSON;

    } catch (error) {
        console.error(`[PATCH] 💥 Falha ao gerar patch:`, error);
        console.error(`[PATCH] Stack trace:`, error.stack);
        return null; // Retorna nulo em caso de falha
    }
}
// =======================================================================
// === FIM DO MÉTODO ===
// =======================================================================

    
    gerarIdEmergente() {
        return `emergente_IA_${++this.contadorSecoes}`;
    }

    resetar() {
        this.historico = [];
        this.secoesEmergentes.clear();
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.escolhasEmergentes = [];
        this.profundidadeAtual = 0;
    }
}












