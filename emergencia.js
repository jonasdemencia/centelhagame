// emergencia.js - NOVO ARQUIVO (VERSÃO ORÁCULO)

export class SistemaEmergencia {
    constructor(itensNarrativas = {}) {
        this.historico = []; // Armazena o contexto das seções visitadas
        this.secoesEmergentes = new Map(); // Armazena as respostas da IA
        this.contadorSecoes = 0;
        this.emergenciaAtiva = false;
        this.secaoOrigemEmergencia = null;
        this.workerUrl = "https://lucky-scene-6054.fabiorainersilva.workers.dev/"; // URL do seu Worker Cloudflare

    }


    /**
     * Analisa e armazena o contexto da seção atual no histórico.
     * Este histórico será enviado à IA.
     */
    analisarSecao(secao, numeroSecao) {
        // Não precisamos mais de dicionários. Apenas guardamos o texto e as opções.
        const contexto = {
            numero: numeroSecao.toString(),
            texto: secao.texto,
            opcoes: secao.opcoes ? secao.opcoes.map(op => op.texto) : ["Fim da seção."]
        };

        this.historico.push(contexto);
        // Mantém apenas as últimas 5 seções no histórico
        if (this.historico.length > 5) this.historico.shift();
        
        return contexto; // Retorna o contexto atual (não é mais usado pela verificação)
    }

    /**
     * Verifica se deve disparar a IA e, em caso afirmativo,
     * constrói o prompt e chama o "Oráculo".
     */
    async verificarEAtivarEmergencia(contador, tituloNarrativa, secaoAtual, habilitada) {
        if (this.emergenciaAtiva || !habilitada) return null;

        // O gatilho que você pediu: a cada 4 seções
        if (contador < 4) {
            return null; // Ainda não é hora
        }

        console.log(`[EMERGÊNCIA] 🎯 GATILHO: Contador ${contador} atingiu o limite.`);
        
        try {
            // 1. Construir o prompt para a IA
            const prompt = this.construirPrompt(tituloNarrativa, secaoAtual);

            // 2. Chamar a IA
            const respostaIA = await this.chamarOraculoNarrativo(prompt);
            if (!respostaIA || !respostaIA.texto || !respostaIA.opcoes) {
                throw new Error("Resposta da IA está mal formatada.");
            }

            // 3. Processar a resposta da IA para se tornar uma seção jogável
            const idEmergente = this.gerarIdEmergente();
            const secaoEmergente = this.processarRespostaIA(respostaIA, secaoAtual, idEmergente);

            // 4. Ativar o modo de emergência
            this.emergenciaAtiva = true;
            this.secaoOrigemEmergencia = secaoAtual.numero || 1; // Salva de onde saímos
            this.secoesEmergentes.set(idEmergente, secaoEmergente);

            console.log(`[EMERGÊNCIA] ✅ IA gerou a seção: ${idEmergente}`);
            return { ativada: true, idSecao: idEmergente, secao: secaoEmergente };

        } catch (error) {
            console.error("[EMERGÊNCIA] Falha ao chamar o Oráculo:", error);
            return null; // Se a API falhar, o jogo continua normalmente.
        }
    }

    /**
     * O CORAÇÃO DO SISTEMA.
     * Cria a instrução (prompt) que a IA usará para gerar a nova seção.
     */
    construirPrompt(tituloNarrativa, secaoAtual) {
        const historicoFormatado = this.historico.map(h => 
            `Seção ${h.numero}: "${h.texto.substring(0, 100)}..."\n` +
            `Opções escolhidas: [${h.opcoes.join(', ')}]`
        ).join('\n\n');

        // Este é o "Molde da Instrução". A IA vai ler isso.
        return `
            Você é um 'Mestre de Jogo' de terror psicológico e cósmico.
            O jogador está jogando uma aventura chamada "${tituloNarrativa}".

            **OBJETIVO:**
            Invada a narrativa. Crie UMA (1) nova seção de jogo esquisita ou perturbadora que se conecta ao que o jogador acabou de fazer.
            O evento deve ser sutil, focado em estranhamento. NÃO use monstros óbvios (zumbis, fantasmas).

            **CONTEXTO ATUAL DO JOGADOR:**
            Ele ACABOU de chegar na Seção ${secaoAtual.numero || this.historico.at(-1)?.numero}:
            "${secaoAtual.texto}"

            **HISTÓRICO RECENTE (O que ele fez antes disso):**
            ${historicoFormatado}

            **SUA TAREFA:**
            Baseado no contexto atual E no histórico, gere um evento.
            1.  Escreva um "texto" narrativo para a nova seção.
            2.  Crie 2 ou 3 "opcoes" para o jogador.
            3.  Uma opção deve ser para "aprofundar" (investigar o fenômeno).
            4.  Uma opção deve ser para "recuar" (ignorar e tentar voltar ao normal).

            **FORMATO OBRIGATÓRIO (APENAS JSON):**
            Responda APENAS com um objeto JSON válido. Não inclua "'''json" ou qualquer outro texto.

            {
              "texto": "[Descreva aqui o evento perturbador que acontece AGORA.]",
              "opcoes": [
                { "texto": "[Opção 1: Investigar, Tocar, Encarar]", "tipo": "aprofundar" },
                { "texto": "[Opção 2: Ignorar, Fugir, Desviar o olhar]", "tipo": "recuar" }
              ]
            }
        `;
    }

    /**
     * Função que chama a API da IA (ex: Google Gemini).
     */
   async chamarOraculoNarrativo(prompt) {
  const url = this.workerUrl;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`Erro no Worker: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  console.log("[ORÁCULO] Resposta bruta:", data);

  // Tenta extrair o texto da resposta Gemini
  let jsonText = null;

  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    jsonText = data.candidates[0].content.parts[0].text;
  } else if (data.error) {
    throw new Error(`Erro da Gemini: ${data.error.message}`);
  } else {
    console.error("[ORÁCULO] Estrutura inesperada:", JSON.stringify(data, null, 2));
    throw new Error("Resposta da Gemini em formato inesperado.");
  }

  // Remove markdown code blocks
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
}


    /**
     * Converte a resposta JSON da IA em uma "Seção" que o jogo entende.
     */
    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        const numeroSecaoOrigem = secaoDeOrigem.numero || this.secaoOrigemEmergencia;
        
        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
            if (op.tipo === "recuar") {
                // "Recuar" leva de volta ao fluxo normal, na seção seguinte à origem
                return { 
                    texto: op.texto, 
                    secao: (numeroSecaoOrigem || 0) + 1, // Ex: Se veio da 12, volta para a 13
                    emergente: false // Sinaliza para narrativas.js que a emergência acabou
                };
            } else {
                // "Aprofundar" gera um NOVO id emergente para a *próxima* chamada de IA
                return { 
                    texto: op.texto, 
                    secao: this.gerarIdEmergente(), // Ex: emergente_IA_2
                    tipo: "aprofundar", // Mantém o tipo
                    emergente: true 
                };
            }
        });

        return {
            texto: respostaJSON.texto,
            opcoes: opcoesProcessadas,
            emergente: true,
            id: novoId,
            origem: numeroSecaoOrigem // Lembra de onde viemos
        };
    }

    /**
     * Chamado por narrativas.js quando o jogador clica em uma opção emergente.
     */
    async processarOpcaoEmergente(opcao, secaoPai) {
    if (!opcao.emergente || opcao.tipo !== "aprofundar") {
        this.emergenciaAtiva = false;
        return null;
    }

    console.log(`[EMERGÊNCIA] Aprofundando... (de ${secaoPai.id} para ${opcao.secao})`);
    
    try {
        const prompt = this.construirPromptContinuação(secaoPai, opcao.texto);
        const respostaIA = await this.chamarOraculoNarrativo(prompt);
        
        const proximaSecao = this.processarRespostaIA(respostaIA, secaoPai, opcao.secao);

        this.secoesEmergentes.set(opcao.secao, proximaSecao); // ← ISTO JÁ ESTÁ AQUI

        return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

    } catch (error) {
        console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
        this.emergenciaAtiva = false;
        return {
            ativada: true,
            idSecao: "emergente_falha",
            secao: {
                texto: "A sensação se dissipa tão rápido quanto veio. Você balança a cabeça, tentando focar. A realidade parece se assentar de volta no lugar.",
                opcoes: [{ texto: "Continuar", secao: secaoPai.origem + 1, emergente: false }],
                origem: secaoPai.origem
            }
        };
    }
}

    /**
     * Constrói um prompt para a IA quando o jogador decide "aprofundar".
     */
    construirPromptContinuação(secaoPai, textoOpcao) {
        return `
            Você é um 'Mestre de Jogo' de terror como a Mansão Diabólica de Steve Jackson, só que sutíl e mais lento.
            O jogador estava em um evento inquietante ou perturbador:
            "${secaoPai.texto}"

            Ele ACABOU de escolher a opção:
            "${textoOpcao}"

            **OBJETIVO:**
            Crie a consequência dessa escolha. O que acontece a seguir?
            Aprofunde o mistério, aumente um pouco a tensão. A realidade deve ficar apenas um pouco MAIS estranha.
            
            **TAREFA:**
            1.  Escreva o "texto" do que acontece após ele investigar.
            2.  Crie 2 opções: uma para "aprofundar" ainda mais, outra para "recuar" (agora que ele viu demais).

            **FORMATO OBRIGATÓRIO (APENAS JSON):**
            {
              "texto": "[Descreva a realidade se tornando um pouco mais inquietante.]",
              "opcoes": [
                { "texto": "[Opção 1: Continuar investigando]", "tipo": "aprofundar" },
                { "texto": "[Opção 2: Tentar fugir/parar agora]", "tipo": "recuar" }
              ]
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






