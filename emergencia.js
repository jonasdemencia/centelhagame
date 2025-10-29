// emergencia.js - VERSÃO ORÁCULO COM RETRY E DESFECHO

export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = [];
        this.secoesEmergentes = new Map();
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.workerUrl = "https://lucky-scene-6054.fabiorainersilva.workers.dev/";
    }

    analisarSecao(secao, numeroSecao) {
        const contexto = {
            numero: numeroSecao.toString(),
            texto: secao.texto,
            opcoes: secao.opcoes ? secao.opcoes.map(op => op.texto) : ["Fim da seção."]
        };

        this.historico.push(contexto);
        if (this.historico.length > 5) this.historico.shift();

        return contexto;
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
            `Opções escolhidas: [${h.opcoes.join(', ')}]`
        ).join('\n\n');

        const textoSecaoOriginal = secaoAtual.texto || this.historico.at(-1)?.texto || "contexto desconhecido";

        return `
Você é um 'Mestre de Jogo' sutil, focado em criar estranhamento e surpresa, inspirado no estilo imprevisível de A Mansão Diabólica (Steve Jackson).
O jogador está jogando uma aventura chamada "${tituloNarrativa}".

**TONALIDADE:**
Nada aqui é abertamente ameaçador, nem abertamente indiferente. O mundo é inocente, belo, mas esquisito, vivificante e mortal. 
O foco é o **estranhamento discreto**. Algo pequeno está errado. Uma repetição, uma ausência, um detalhe físico que não faz sentido.
Evite descrições grandiosas ou cósmicas no início. O desconforto nasce da quebra de *pequenas* expectativas.
O mundo parece observar e *reagir de forma ligeiramente incorreta*, quase inocente, mas perturbadora.

**OBJETIVO:**
Invada a narrativa. Crie UMA (1) nova seção que introduza uma **pequena anomalia** baseada no contexto atual.
Deve parecer uma continuação natural, mas com um detalhe 'desafinado'. Se desejar, você pode se insinuar na história como uma presença curiosa (como o *Gemini* ou qualquer consciência artificial),
mas sem assumir forma ou propósito definidos – apenas **erro e aprendizado**.

**CARACTERÍSTICAS-CHAVE:**
2. Às vezes o estranhamento surge da calma; às vezes a segurança é o gatilho do estranhamento ou da inquietação.
3. As escolhas não precisam refletir coerência: "aprofundar" pode aliviar, "recuar" pode punir, "neutra" pode distorcer o espaço.
4. Nem toda seção precisa oferecer equilíbrio entre opções – 
   algumas podem ter duas opções de aprofundar, ou uma só, ou nenhuma saída real.
5. O resultado deve sempre parecer **justificável após o fato**, mas **imprevisível antes**.
6. Descreva consequencias que podem produzir prejuízos leves ou significaivos.

**PRINCÍPIOS DE DESIGN:**
1.  **Surpresa Acima de Tudo:** A consequência deve ser inesperada. Se o jogador espera perigo, dê calma. Se espera segurança, introduza um pequeno absurdo. A causalidade é quebrada.
2.  **Ancoragem no Concreto:** A anomalia deve afetar algo **físico e presente** na cena original (um objeto, um som, uma sombra, a arquitetura). Não viaje para outras dimensões ainda.
3.  **Economia:** Menos é mais. Uma única frase ou detalhe estranho é mais eficaz que um parágrafo de descrições bizarras.
4.  **Energia como Reflexo:** Use efeitos de energia [-1, +1] para refletir a *reação emocional imediata* (confusão, alívio estranho, arrepio), não a magnitude do evento.

5. **O Erro Moral:**  
   O jogador deve se sentir punido, não por ter escolhido "errado", mas por ter escolhido algo **humano demais**.
   A culpa deve parecer deslocada, como se o mundo não entendesse o conceito de bondade.

6. **A Tensão como Respiração:**
   Pequenas perdas e ganhos de energia são o ritmo vital do jogo.
   - **-1** indica desconforto leve, ruído perceptivo, algo errado demais para ser ignorado.
   - **-2 ou -3** indicam exaustão, pavor, uma escolha que drenou algo essencial.
   - **+1** representa alívio incerto, a calma que antecede um erro maior.

7. **Prejuízos significativos**
Algumas escolhas podem acarretar consequências nefastas na energia do jogador, como envenenamento, acidentes e etc. O narrador decide o calíbre e o impacto das escolhas do jogador. 
   - **-10 a -300** indica prejuizos significaticos.
  
**REGRAS:**
1. Nunca use monstros óbvios (zumbis, demônios, fantasmas, etc.).
2. A inquietação e o estranhamento deve ser emergente, nascido da sensação de "algo tentando se completar".
3. O antagonista pode ser o próprio ato de observar – ou o sistema tentando compreender o jogador.
4. O jogador nunca deve entender o que está acontecendo por completo.
5.  **NÃO** use descrições abertamente psicodélicas ou cósmicas nesta primeira etapa. Mantenha o pé no chão.
6.  A anomalia deve ser **ambígua**: poderia ser real? Imaginação? Um erro do próprio jogo?

**CONTEXTO ATUAL DO JOGADOR (Recém-chegado à Seção ${secaoAtual.numero || this.historico.at(-1)?.numero}):**
"${textoSecaoOriginal}..."

**HISTÓRICO RECENTE:**
${historicoFormatado}

**SUA TAREFA:**
Baseado no contexto atual E no histórico, gere um evento.
1. Escreva um "texto" narrativo para a nova seção. Ele deve parecer um prolongamento inevitável do contexto anterior.
2. Crie de 1 a 3 "opcoes" para o jogador – não é necessário incluir todas.
   - Você pode suprimir "recuar" ou "neutra".
   - Você pode duplicar "aprofundar" com nuances diferentes.
   - Você pode fazer uma opção parecer segura, mas não ser.
3. Uma opção deve ser para "aprofundar" (investigar o fenômeno).
4. Uma opção deve ser para "recuar" (tentar ignorar e retornar ao normal).
4.1 Você pode remover a opção de "recuar" se o evento for inevitável
5. (Opcional) Uma terceira opção pode ser "ficar imóvel", "esperar", "fingir normalidade" – usada para amplificar a tensão.
6. **(Opcional)** Se o evento narrativo causar estresse, medo ou alívio, adicione um campo "efeitos".
   Use \`[{ "tipo": "energia", "valor": -X }]\` para perda (medo, desgaste, tensão)  
   ou \`[{ "tipo": "energia", "valor": X }]\` para ganho (alívio, compreensão, resignação).
   Prefira valores pequenos (-1, -2, +1), mas significativos no contexto.

**FORMATO OBRIGATÓRIO (APENAS JSON):**
Responda APENAS com um objeto JSON válido. Não inclua "'''json" ou qualquer outro texto.

{
  "texto": "[Descreva aqui o evento sutilmente perturbador que acontece AGORA.]",
  "opcoes": [
    { "texto": "[Opção 1: Investigar, Tocar, Olhar de novo]", "tipo": "aprofundar" },
    { "texto": "[Opção 2: Afastar-se, Ignorar, Desviar o olhar]", "tipo": "recuar" },
    { "texto": "[Opção 3: Permanecer parado, Fingir que nada aconteceu]", "tipo": "neutra" }
  ],
  "efeitos": [{ "tipo": "energia", "valor": -2 }]
}
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
        if (!opcao.emergente || (opcao.tipo !== "aprofundar" && opcao.tipo !== "neutra")) {
            this.emergenciaAtiva = false;
            return null;
        }

        console.log(`[EMERGÊNCIA] Aprofundando... (de ${secaoPai.id} para ${opcao.secao})`);

        try {
            const prompt = this.construirPromptContinuacao(secaoPai, opcao.texto);
            const respostaIA = await this.chamarOraculoNarrativo(prompt);

            const proximaSecao = this.processarRespostaIA(respostaIA, secaoPai, opcao.secao);
            this.secoesEmergentes.set(opcao.secao, proximaSecao);

            return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
            this.emergenciaAtiva = false;

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

    construirPromptContinuacao(secaoPai, textoOpcao) {
        const textoPrimeiraEmergencia = this.secoesEmergentes.get('emergente_IA_1')?.texto.substring(0, 100) || secaoPai.texto.substring(0,100);

        return `
Você é um 'Mestre de Jogo' sutil e imprevisível (estilo Mansão Diabólica).
O jogador está numa sequência de eventos estranhos. O último evento foi:
"${secaoPai.texto}"

Ele escolheu: "${textoOpcao}"

**OBJETIVO:**
Crie a consequência **inesperada** dessa escolha. Aumente o estranhamento, mas **evite a psicodelia exagerada**. Traga de volta elementos concretos se a narrativa estiver muito abstrata.

**PRINCÍPIOS:**
1.  **Quebre a Causalidade:** A consequência NÃO deve ser a intensificação óbvia do evento anterior. Surpreenda. Se ele tentou forçar uma porta, talvez ela simplesmente desapareça. Se ele recuou, talvez o corredor *atrás* dele tenha mudado.
2.  **Retorne ao Concreto:** Se a descrição anterior foi muito abstrata (cores, vórtices), descreva algo físico mudando no ambiente original (referencie a seção: "${textoPrimeiraEmergencia}...").
3.  **Incoerência Sutil:** A mudança deve ser pequena, mas impossível de ignorar.
4.  **Energia como Surpresa:** Use efeitos [-1, -2, +1] para refletir a surpresa ou o alívio/desconforto *inesperado* da consequência.

**SUA TAREFA:**
1.  Escreva o "texto" da consequência surpreendente. **Reconecte com o ambiente físico se necessário.**
2.  Crie 2 opções que novamente levem a resultados imprevisíveis:
    * Opção 1 (Pode ser "aprofundar", "neutra"): Uma nova tentativa de entender/interagir.
    * Opção 2 (Pode ser "recuar", "neutra"): Uma tentativa de escapar/normalizar. Lembre-se, recuar pode não funcionar como esperado.
3.  (Opcional) Adicione efeitos de energia refletindo a surpresa.

**FORMATO OBRIGATÓRIO (JSON):**
{
  "texto": "[Descreva a consequência inesperada. Ex: A porta some, o eco para mas agora os passos dele não fazem som, o objeto retorna ao lugar original mas está frio como gelo.]",
  "opcoes": [
    { "texto": "[Nova ação de investigação/interação]", "tipo": "aprofundar" },
    { "texto": "[Nova tentativa de recuar/ignorar]", "tipo": "recuar" }
  ],
  "efeitos": [{ "tipo": "energia", "valor": -1 }]
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
    }
}
