// emergencia.js - VERSÃO ORÁCULO LIVRE E CRIATIVO

export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = [];
        this.secoesEmergentes = new Map();
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.workerUrl = "https://lucky-scene-6054.fabiorainersilva.workers.dev/";
        this.escolhasEmergentes = []; // Rastreia escolhas dentro da emergência atual
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

        // Se estamos em emergência, rastreia escolhas
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
            this.escolhasEmergentes = []; // Reset das escolhas emergentes

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
Você é um 'Mestre de Jogo' subversivo e genuinamente imprevisível.
Estilo: Mansão Diabólica (Steve Jackson) + David Lynch + Haruki Murakami.
Aventura: "${tituloNarrativa}"

${padroes ? `\n**${padroes}**\n` : ''}

**FILOSOFIA:**
- Causalidade é apenas sugestão, não lei
- Pequenos detalhes têm peso imenso
- Grandes eventos podem ser triviais
- O mundo não faz sentido, mas finge que faz
- Nada é explicado, tudo é sentido

**TONALIDADE:**
Estranhamento discreto. Inocência perturbadora. Calma inquietante.
Algo está errado, mas é impossível apontar exatamente o quê.

**LIBERDADE CRIATIVA TOTAL:**
Você NÃO está limitado a "modos" ou "categorias".
Seja genuinamente criativo e imprevisível.
Surpreenda a si mesmo.

Exemplos de abordagens possíveis (mas NÃO se limite a elas):
- Mudanças microscópicas com impacto desproporcional
- Múltiplos fenômenos sutis simultâneos  
- Manipulação temporal ou de memória
- Ausência/remoção ao invés de adição
- Recursão e auto-referência
- Paradoxos coexistentes
- Sinestesia (sons visíveis, cores audíveis)
- Geometria impossível
- Objetos com comportamento social
- Conceitos abstratos tornando-se físicos
- Ou QUALQUER OUTRA COISA que você inventar

**OPÇÕES FLEXÍVEIS:**
Ofereça de **1 a 5 opções** (você decide o número apropriado).

Tipos sugeridos (mas sinta-se livre para criar seus próprios):
- **aprofundar**: investigar/interagir  
- **recuar**: ignorar/escapar (pode falhar espetacularmente)
- **neutra**: observar/esperar/permanecer
- **paradoxal**: fazer algo que contradiz a lógica
- **rendição**: aceitar/submeter-se
- **subversão**: usar o fenômeno a seu favor
- **temporal**: adiar/manipular tempo
- **[INVENTE OUTROS]**: Você pode criar tipos completamente novos

**CONSEQUÊNCIAS:**
- Use efeitos de energia [-10 a +5] para refletir impacto emocional/físico
- Valores pequenos (-1, -2) para desconforto/tensão
- Valores médios (-3 a -5) para exaustão/pavor
- Valores grandes (-10+) para consequências severas
- Valores positivos (+1 a +5) para alívio estranho/compreensão

**CONTEXTO ATUAL (Seção ${secaoAtual.numero || this.historico.at(-1)?.numero}):**
"${textoSecaoOriginal}..."

**HISTÓRICO RECENTE:**
${historicoFormatado}

**SUA TAREFA:**

1. Gere um evento emergente (100-250 palavras)
2. Crie de 1 a 5 opções (varie o número livremente)
3. Use tipos variados de opções
4. Adicione efeitos de energia se apropriado
5. **SEJA GENUINAMENTE IMPREVISÍVEL**

**PRINCÍPIOS:**
- Surpresa absoluta > Coerência narrativa
- Pequeno e errado > Grande e óbvio  
- Físico e tangível > Abstrato e cósmico (nesta fase)
- Ambíguo > Explicado
- Sentido > Compreensão

**FORMATO (JSON PURO, sem markdown):**

{
  "texto": "[Evento - 100-250 palavras. Seja criativo.]",
  "opcoes": [
    {"texto": "[Descrição]", "tipo": "[tipo - invente se quiser]"},
    {"texto": "[Descrição]", "tipo": "[tipo]"}
  ],
  "efeitos": [{"tipo": "energia", "valor": X}]
}

Número de opções: VOCÊ DECIDE (1-5).
Tipos de opções: VOCÊ DECIDE (use sugeridos ou invente).
Estilo narrativo: VOCÊ DECIDE (surpreenda).
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
            console.log("[ORÁCULO] Resposta bruta:", data);

            let jsonText = null;

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                jsonText = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                throw new Error(`Erro da Gemini: ${data.error.message}`);
            } else {
                console.error("[ORÁCULO] Estrutura inesperada:", JSON.stringify(data, null, 2));
                throw new Error("Resposta da Gemini em formato inesperado.");
            }

            jsonText = jsonText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            console.log("[ORÁCULO] JSON extraído:", jsonText);

            if (!jsonText) {
                throw new Error("Resposta vazia após extração.");
            }

            try {
                return JSON.parse(jsonText);
            } catch (parseError) {
                console.error("[ORÁCULO] Erro ao fazer parse do JSON:", parseError);
                console.error("[ORÁCULO] Texto que tentei fazer parse:", jsonText);
                throw new Error(`JSON inválido: ${parseError.message}`);
            }

        } catch (err) {
            if (tentativa >= maxTentativas) {
                throw err;
            }
            
            console.log(`[ORÁCULO] Erro, tentando novamente... (${tentativa}/${maxTentativas})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.chamarOraculoNarrativo(prompt, tentativa + 1);
        }
    }

    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        const numeroSecaoOrigem = this.secaoOrigemEmergencia;

        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
            if (op.tipo === "recuar") {
                return {
                    texto: op.texto,
                    secao: numeroSecaoOrigem,
                    emergente: false
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
            origem: numeroSecaoOrigem
        };
    }

    async processarOpcaoEmergente(opcao, secaoPai) {
        if (!opcao.emergente || opcao.tipo === "recuar") {
            this.emergenciaAtiva = false;
            this.escolhasEmergentes = []; // Limpa ao sair da emergência
            return null;
        }

        console.log(`[EMERGÊNCIA] Aprofundando... (de ${secaoPai.id} para ${opcao.secao})`);

        try {
            const prompt = this.construirPromptContinuacao(secaoPai, opcao);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);

            const proximaSecao = this.processarRespostaIA(respostaIA, secaoPai, opcao.secao);
            this.secoesEmergentes.set(opcao.secao, proximaSecao);

            return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
            this.emergenciaAtiva = false;
            this.escolhasEmergentes = [];

            const secaoDesfecho = {
                texto: "A sensação se dissolve gradualmente, como névoa sob o sol da manhã. O que você experimentou deixa uma marca profunda em sua percepção, mas agora a realidade parece se reassentar. Você respira fundo, tentando processar o que acabou de viver. Talvez algumas coisas não sejam feitas para serem completamente compreendidas. Com um último olhar para trás, você segue em frente.",
                opcoes: [{
                    texto: "Continuar sua jornada",
                    secao: this.secaoOrigemEmergencia,
                    emergente: false
                }],
                origem: this.secaoOrigemEmergencia,
                convergencia: true
            };

            const idDesfecho = `emergente_desfecho_${Date.now()}`;
            this.secoesEmergentes.set(idDesfecho, secaoDesfecho);

            return {
                ativada: true,
                idSecao: idDesfecho,
                secao: secaoDesfecho
            };
        }
    }

    construirPromptContinuacao(secaoPai, opcao) {
        const textoPrimeiraEmergencia = this.secoesEmergentes.get('emergente_IA_1')?.texto.substring(0, 100) || secaoPai.texto.substring(0,100);
        const padroes = this.analisarPadroes();
        
        // Mostra as escolhas que o jogador fez dentro desta emergência
        const escolhasNaEmergencia = this.escolhasEmergentes.length > 0 
            ? `\n**ESCOLHAS NA EMERGÊNCIA:** ${this.escolhasEmergentes.join(' → ')}\n` 
            : '';

        return `
Você é um Mestre de Jogo subversivo (Mansão Diabólica + Lynch + Murakami).

**CONTEXTO DA EMERGÊNCIA:**
Evento anterior: "${secaoPai.texto.substring(0, 150)}..."

Jogador escolheu: "${opcao.texto}" (tipo: ${opcao.tipo})

${escolhasNaEmergencia}
${padroes ? `**${padroes}**\n` : ''}

**OBJETIVO:**
Crie a consequência INESPERADA dessa escolha.

**REGRAS CRÍTICAS:**

1. **QUEBRE A CAUSALIDADE**  
   NÃO intensifique o evento anterior. SUBVERTA EXPECTATIVAS.
   - Se investigou → talvez nada aconteça (perturbador)
   - Se recuou → talvez piore tudo
   - Se esperou → talvez o tempo tenha pulado
   - Ou QUALQUER OUTRA inversão criativa

2. **REFERÊNCIA CUMULATIVA (Opcional)**  
   Se o jogador fez múltiplas escolhas nesta emergência, você PODE fazer elas se acumularem de forma estranha.
   Exemplo: "Cada vez que você tocou algo, a temperatura caiu 1°C. Agora está congelante."

3. **RECONEXÃO FÍSICA**  
   Se a narrativa está muito abstrata, reconecte com elementos concretos do início:
   "${textoPrimeiraEmergencia}..."

4. **LIBERDADE TOTAL**  
   Varie o número de opções (1-5)
   Invente novos tipos se quiser
   Seja genuinamente surpreendente

**FORMATO (JSON PURO):**
{
  "texto": "[Consequência - 100-220 palavras. Surpreenda.]",
  "opcoes": [
    {"texto": "...", "tipo": "..."}
  ],
  "efeitos": [{"tipo": "energia", "valor": X}]
}

**LEMBRE-SE:** Você tem liberdade criativa total. Não há "modos" ou "categorias". Apenas surpresa genuína.
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
    }
}
