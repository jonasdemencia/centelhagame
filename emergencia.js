// emergencia.js - VERSÃO ANCORADA E COM DESFECHOS

export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = [];
        this.secoesEmergentes = new Map();
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.workerUrl = "https://lucky-scene-6054.fabiorainersilva.workers.dev/";
        this.escolhasEmergentes = [];
        this.profundidadeAtual = 0; // Rastreia profundidade da emergência
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

        if (contador < 4) {
            return null;
        }

        console.log(`[EMERGÊNCIA] 🎯 GATILHO: Contador ${contador} atingiu o limite.`);

        try {
            const prompt = this.construirPrompt(tituloNarrativa, secaoAtual);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);
            
            if (!respostaIA || !respostaIA.texto || !respostaIA.opcoes) {
                throw new Error("Resposta da IA está mal formatada.");
            }

            const idEmergente = this.gerarIdEmergente();

            this.emergenciaAtiva = true;
            this.secaoOrigemEmergencia = pontoDeRetorno || 1;
            this.escolhasEmergentes = [];
            this.profundidadeAtual = 1; // Reset profundidade

            const secaoEmergente = this.processarRespostaIA(respostaIA, secaoAtual, idEmergente);
            this.secoesEmergentes.set(idEmergente, secaoEmergente);

            console.log(`[EMERGÊNCIA] ✅ IA gerou a seção: ${idEmergente}`);
            return { ativada: true, idSecao: idEmergente, secao: secaoEmergente };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao chamar o Oráculo:", error);
            return null;
        }
    }

    construirPrompt(tituloNarrativa, secaoAtual) {
        const historicoFormatado = this.historico.map(h =>
            `Seção ${h.numero}: "${h.texto.substring(0, 100)}..."\n` +
            `Opções: [${h.opcoes.join(', ')}]` +
            (h.escolhaFeita ? `\nEscolha: "${h.escolhaFeita}"` : '')
        ).join('\n\n');

        const textoSecaoOriginal = secaoAtual.texto || this.historico.at(-1)?.texto || "contexto desconhecido";
        const padroes = this.analisarPadroes();

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

**FORMATO (JSON PURO):**

{
  "modo": "expansao_natural" | "detalhe_perturbador" | "evento_menor",
  "texto": "[Texto coerente e ancorado - 80-180 palavras]",
  "opcoes": [
    {"texto": "[Opção 1]", "tipo": "aprofundar"},
    {"texto": "[Opção 2]", "tipo": "neutra"},
    {"texto": "[Continuar normalmente]", "tipo": "recuar"}
  ],
  "efeitos": [{"tipo": "energia", "valor": X}]
}

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

    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        const numeroSecaoOrigem = this.secaoOrigemEmergencia;

        // CÓDIGO CORRIGIDO
        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
            if (op.tipo === "recuar") {
                return {
                    texto: op.texto,
                    secao: numeroSecaoOrigem,
                    emergente: false,
                    tipo: 'recuar' // 👈 ADICIONE ESTA LINHA
                };
            } else {
                return {
                    texto: op.texto,
                    secao: this.gerarIdEmergente(),
                    tipo: op.tipo,
                    emergente: true
                };
            }
        });

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

    async processarOpcaoEmergente(opcao, secaoPai) {
    if (!opcao.emergente || opcao.tipo === "recuar") {
        this.emergenciaAtiva = false;
        this.escolhasEmergentes = [];
        this.profundidadeAtual = 0;
        // 🔹 IMPORTANTE: Não retorna aqui, para que narrativas.js possa resetar contador
        return null;
    }

        this.profundidadeAtual++;
        console.log(`[EMERGÊNCIA] Profundidade: ${this.profundidadeAtual}/5`);

        // FORÇAR CONVERGÊNCIA após 3-5 seções
        if (this.profundidadeAtual >= 5) {
            console.log('[EMERGÊNCIA] 🎯 PROFUNDIDADE MÁXIMA - Forçando convergência');
            return this.gerarConvergenciaForcada();
        }

        // Entre 3-4 seções, aumentar chance de convergência
        if (this.profundidadeAtual >= 3 && Math.random() < 0.4) {
            console.log('[EMERGÊNCIA] 🎯 Convergência natural acionada');
            return this.gerarConvergenciaForcada();
        }

        try {
            const prompt = this.construirPromptContinuacao(secaoPai, opcao);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);

            const proximaSecao = this.processarRespostaIA(respostaIA, secaoPai, opcao.secao);
            this.secoesEmergentes.set(opcao.secao, proximaSecao);

            return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
            return this.gerarConvergenciaForcada();
        }
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

    construirPromptContinuacao(secaoPai, opcao) {
        const textoPrimeiraEmergencia = this.secoesEmergentes.get('emergente_IA_1')?.texto.substring(0, 100) || secaoPai.texto.substring(0,100);
        const padroes = this.analisarPadroes();
        
        const escolhasNaEmergencia = this.escolhasEmergentes.length > 0 
            ? `\n**ESCOLHAS NA EMERGÊNCIA:** ${this.escolhasEmergentes.join(' → ')}\n` 
            : '';

        return `
Você é um Mestre de Jogo que mantém COERÊNCIA narrativa.

**PROFUNDIDADE ATUAL: ${this.profundidadeAtual}/5**
${this.profundidadeAtual >= 3 ? '⚠️ PRÓXIMO DO LIMITE - Considere convergir naturalmente' : ''}

**CONTEXTO:**
Texto anterior: "${secaoPai.texto.substring(0, 150)}..."
Modo usado: ${secaoPai.modo || 'desconhecido'}

Jogador escolheu: "${opcao.texto}" (tipo: ${opcao.tipo})

${escolhasNaEmergencia}
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

**FORMATO (JSON PURO):**
{
  "modo": "expansao_natural" | "detalhe_perturbador" | "evento_menor",
  "texto": "[80-150 palavras - ancorado e coerente]",
  "opcoes": [
    {"texto": "...", "tipo": "..."},
    ${this.profundidadeAtual >= 3 ? '{"texto": "[Opção clara de sair/continuar]", "tipo": "recuar"},' : ''}
  ],
  "efeitos": [{"tipo": "energia", "valor": X}]
}
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


