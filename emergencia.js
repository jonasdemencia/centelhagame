// emergencia.js - VERSÃO COM SISTEMA DE RARIDADE, POOLS INTELIGENTES E BATALHAS EM OPÇÃO
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

        // 🆕 NOVO: Classificar monstros por raridade (baseado em monstros.js)
        this.monstrosClassificados = {
            comuns: ["coruja", "zumbi", "sombra-errante"],
            incomuns: ["lobo", "servo-pedra"],
            raros: ["necromante", "sombra-antiga"]
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

    // 🆕 PROMPT ATUALIZADO (lógica de batalha em OPÇÃO)
    construirPrompt(tituloNarrativa, secaoAtual) {
        const historicoFormatado = this.historico.map(h =>
            `Seção ${h.numero}: "${h.texto.substring(0, 100)}..."\n` +
            `Opções: [${h.opcoes.join(', ')}]` +
            (h.escolhaFeita ? `\nEscolha: "${h.escolhaFeita}"` : '')
        ).join('\n\n');

        const textoSecaoOriginal = secaoAtual.texto || this.historico.at(-1)?.texto || "contexto desconhecido";
        const padroes = this.analisarPadroes();
        
        // 🆕 ATUALIZADO: Passa o texto da seção para seleção contextual
        const itensAmostra = this.getItensAmostra(textoSecaoOriginal);
        // 🆕 NOVO: Adiciona lista de monstros
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
5. Efeitos de energia: apenas se apropriado (-2 a +2, raramente maior)
6. **ITENS** Se seu texto mencionar encontrar/abrir/pegar algo físico, adicione 1-2 itens nos efeitos.
${itensAmostra}


// 🆕 INÍCIO DA ADIÇÃO (REGRA 7 + FORMATO DE BATALHA)
7.(90% chance) OPÇÃO QUE LEVA A PERIGO:**
   - Em 90% dos casos, crie UMA opção neutra/curiosa (ex: "Tocar o objeto", "Abrir a gaveta")
   - Esta opção deve ter: "tipo": "perigo_oculto"
   - NÃO spoile a consequência no texto da opção
   - A IA vai gerar automaticamente a próxima seção com a revelação do perigo
   - ❌ ERRADO: "Tocar a ampulheta e enfrentar a Sombra Errante"
   - ✅ CERTO: "Tocar a ampulheta"
   - A opção deve ser curiosa/tentadora, mas SEM revelar o perigo
   
  8. **(APENAS SE SEÇÃO ANTERIOR TINHA "perigo_oculto") REVELAR BATALHA:**
   - Se o jogador escolheu uma opção "perigo_oculto", ESTA seção DEVE:
     * Descrever o que aconteceu (ex: "Ao tocar, uma sombra surge!")
     * **OBRIGATÓRIO:** Incluir opção com "tipo": "iniciar_batalha"
     * Formato da opção de batalha:
       {
         "tipo": "iniciar_batalha",
         "texto": "Enfrentar a criatura",
         "monstro": "[ID_MONSTRO_VALIDO]"
       }
     * Incluir outras opções (fugir, recuar, etc.)
   - **COERÊNCIA FÍSICA:** Criatura deve caber no ambiente (não coloque coruja saindo de gaveta)
   - **CRÍTICO:** Use APENAS IDs desta lista. NÃO invente monstros.
${monstrosAmostra}

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


**FORMATO (JSON PURO - Com Armadilha de Batalha - 30%):**
{
  "modo": "expansao_natural",
  "texto": "[Texto normal, ex: 'Você vê uma ampulheta brilhante sobre a mesa...']",
  "opcoes": [
    {
      "tipo": "armadilha_batalha",
      "texto": "[Opção NEUTRA sem spoiler, ex: 'Tocar a ampulheta']",
      "monstroOculto": "[ID_MONSTRO_VALIDO]"
    },
    {"texto": "[Examinar de longe]", "tipo": "neutra"},
    {"texto": "[Sair da sala]", "tipo": "recuar"}
  ],
  "efeitos": []
}

// 🆕 FIM DA ADIÇÃO

**LEMBRE-SE:** Expansão natural > Detalhe perturbador > Evento menor (em ordem de preferência)
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

            if (response.status === 503 && tentativa < maxTentativas) {
                console.log(`[ORÁCULO] Erro 503, tentando novamente em 2s... (${tentativa}/${maxTentativas})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.chamarOraculoNarrativo(prompt, tentativa + 1);
            }

            if (!response.ok) {
                throw new Error(`Erro no Worker: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            let jsonText = null;

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                jsonText = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                throw new Error(`Erro da Gemini: ${data.error.message}`);
            } else {
                throw new Error("Resposta da Gemini em formato inesperado.");
            }

            jsonText = jsonText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            if (!jsonText) {
                throw new Error("Resposta vazia após extração.");
            }

            return JSON.parse(jsonText);

        } catch (err) {
            if (tentativa >= maxTentativas) {
                throw err;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.chamarOraculoNarrativo(prompt, tentativa + 1);
        }
    }

    // =======================================================================
    // === INÍCIO DA MODIFICAÇÃO ===
    // =======================================================================
    // 🆕 MÉTODO ATUALIZADO (lógica de batalha em OPÇÃO)
    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        const numeroSecaoOrigem = this.secaoOrigemEmergencia;

        // Processa as opções...
        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
    
    // Opção que leva a perigo (não revela ainda)
    if (op.tipo === "perigo_oculto") {
        return {
            texto: op.texto,
            secao: this.gerarIdEmergente(),
            tipo: 'perigo_oculto',
            emergente: true
        };
    }

    // Opção de iniciar batalha (revelada na seção seguinte)
    if (op.tipo === "iniciar_batalha") {
        return {
            texto: op.texto,
            batalha: op.monstro,
            vitoria: numeroSecaoOrigem,
            derrota: 320,
            emergente: false
        };
    }
    
    // OPÇÃO DE RECUAR (lógica existente)
    if (op.tipo === "recuar") {
        return {
            texto: op.texto,
            secao: numeroSecaoOrigem,
            emergente: false,
            tipo: 'recuar'
        };
    } 
    
    // OPÇÃO NORMAL (aprofundar / neutra) (lógica existente)
    else {
        return {
            texto: op.texto,
            secao: this.gerarIdEmergente(),
            tipo: op.tipo,
            emergente: true
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
            profundidade: this.profundidadeAtual
        };
    }
    // =======================================================================
    // === FIM DA MODIFICAÇÃO ===
    // =======================================================================


    async processarOpcaoEmergente(opcao, secaoPai) {
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
            const prompt = this.construirPromptContinuacao(secaoPai, opcao);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);

            // 🆕 ATUALIZAÇÃO: A resposta da IA (próxima seção) será processada
            // e registrada com o ID que esta opção (opcao.secao) já carrega.
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

    // 🆕 PROMPT DE CONTINUAÇÃO ATUALIZADO (sem resumir)
    construirPromptContinuacao(secaoPai, opcao) {
        const textoPrimeiraEmergencia = this.secoesEmergentes.get('emergente_IA_1')?.texto.substring(0, 100) || secaoPai.texto.substring(0,100);
        const padroes = this.analisarPadroes();
        
        const escolhasNaEmergencia = this.escolhasEmergentes.length > 0 
            ? `\n**ESCOLHAS NA EMERGÊNCIA:** ${this.escolhasEmergentes.join(' → ')}\n` 
            : '';
        const alertaPerigo = opcao.tipo === 'perigo_oculto' ? `
**⚠️ ATENÇÃO CRÍTICA: O jogador escolheu uma opção de "perigo_oculto"!**
**VOCÊ DEVE OBRIGATORIAMENTE NESTA SEÇÃO:**
1. Descrever a REVELAÇÃO do perigo (ex: "Ao tocar, uma sombra emerge!")
2. Incluir opção com "tipo": "iniciar_batalha", "texto": "Enfrentar [criatura]", "monstro": "[ID_VALIDO]"
3. O monstro deve fazer sentido físico com o ambiente
4. Incluir outras opções (fugir, recuar, etc.)
` : '';


        // 🆕 ATUALIZADO: Itens e monstros contextuais também na continuação
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
${alertaPerigo}
${padroes ? `**${padroes}**\n` : ''}

**ANCORAGEM OBRIGATÓRIA:**
Referência ao contexto original: "${textoPrimeiraEmergencia}..."

**INSTRUÇÕES:**

1. **PRIORIDADE MÁXIMA: ANCORAGEM**
   - Consequência deve se conectar ao ambiente/objetos FÍSICOS originais
   - Se está ficando abstrato demais → volte ao concreto
   - Exemplo: Em vez de "tempo se dobra" → "o relógio na parede parou"

2. **PROFUNDIDADE ${this.profundidadeAtual}:**
   ${this.profundidadeAtual < 3 ? '- Pode expandir normalmente' : ''}
   ${this.profundidadeAtual >= 3 ? '- CONSIDERE oferecer opção clara de "sair/encerrar"' : ''}
   ${this.profundidadeAtual >= 4 ? '- RECOMENDADO: faça próxima seção ser conclusão natural' : ''}

3. **CONSEQUÊNCIA DA ESCOLHA:**
   - Deve ser física e tangível
   - Conectada ao contexto original
   - Coerente com o modo anterior

4. **OPÇÕES (2-4):**
   - Se profundidade < 3: normal (aprofundar/neutra/recuar)
   - Se profundidade >= 3: INCLUIR opção óbvia de "continuar/sair"

5. **ITENS** Se seu texto mencionar encontrar/abrir/pegar algo físico, adicione 1-2 itens nos efeitos.
${itensAmostra}

// 🆕 INÍCIO DA ADIÇÃO (REGRA 6 + FORMATO DE BATALHA)
6. (90% chance) OPÇÃO QUE LEVA A PERIGO:**
   - Em 90% dos casos, crie UMA opção neutra/curiosa (ex: "Tocar o objeto", "Abrir a gaveta")
   - Esta opção deve ter: "tipo": "perigo_oculto"
   - NÃO spoile a consequência no texto da opção
   - A IA vai gerar automaticamente a próxima seção com a revelação do perigo
   - ❌ ERRADO: "Tocar a ampulheta e enfrentar a Sombra Errante"
   - ✅ CERTO: "Tocar a ampulheta"
   - A opção deve ser curiosa/tentadora, mas SEM revelar o perigo
   
  7. **(APENAS SE SEÇÃO ANTERIOR TINHA "perigo_oculto") REVELAR BATALHA:**
   - Se o jogador escolheu uma opção "perigo_oculto", ESTA seção DEVE:
     * Descrever o que aconteceu (ex: "Ao tocar, uma sombra surge!")
     * **OBRIGATÓRIO:** Incluir opção com "tipo": "iniciar_batalha"
     * Formato da opção de batalha:
       {
         "tipo": "iniciar_batalha",
         "texto": "Enfrentar a criatura",
         "monstro": "[ID_MONSTRO_VALIDO]"
       }
     * Incluir outras opções (fugir, recuar, etc.)
   - **COERÊNCIA FÍSICA:** Criatura deve caber no ambiente (não coloque coruja saindo de gaveta)
   - **CRÍTICO:** Use APENAS IDs desta lista. NÃO invente monstros.
${monstrosAmostra}

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

**FORMATO (JSON PURO - Com Armadilha de Batalha - 30%):**
{
  "modo": "expansao_natural",
  "texto": "[Texto normal, ex: 'Você vê uma ampulheta brilhante sobre a mesa...']",
  "opcoes": [
    {
      "tipo": "armadilha_batalha",
      "texto": "[Opção NEUTRA sem spoiler, ex: 'Tocar a ampulheta']",
      "monstroOculto": "[ID_MONSTRO_VALIDO]"
    },
    {"texto": "[Examinar de longe]", "tipo": "neutra"},
    {"texto": "[Sair da sala]", "tipo": "recuar"}
  ],
  "efeitos": []
}

// 🆕 FIM DA ADIÇÃO
`;
    }


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












