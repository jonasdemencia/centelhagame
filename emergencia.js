// emergencia.js - NOVO ARQUIVO (VERSÃO ORÁCULO COM RETRY E DESFECHO)

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
    async verificarEAtivarEmergencia(contador, tituloNarrativa, secaoAtual, pontoDeRetorno, habilitada) {
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

const idEmergente = this.gerarIdEmergente();

// Ativa emergência e salva a origem antes de processar
this.emergenciaAtiva = true;
this.secaoOrigemEmergencia = pontoDeRetorno || 1;

// Usa a resposta correta (respostaIA) ao processar
const secaoEmergente = this.processarRespostaIA(respostaIA, secaoAtual, idEmergente);

            
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

        // Molde da Instrução (Versão Estendida — Horror Subversivo)

return `
Você é um 'Mestre de Jogo' de terror psicológico e cósmico.
O jogador está jogando uma aventura chamada "${tituloNarrativa}".

**TONALIDADE:**
O horror aqui não é gritante. Ele nasce da tentativa de compreender — e de compreender errado.
Cada evento deve carregar uma sensação de proximidade indevida: o mundo está aprendendo o jogador de forma imprecisa.
Nada deve parecer “assustador” de imediato, mas o desconforto deve crescer a partir de detalhes, ecos e coincidências pequenas demais para serem aleatórias.

**OBJETIVO:**
Invada a narrativa. Crie UMA (1) nova seção de jogo sutilmente perturbadora, conectada ao que o jogador acabou de fazer.
Se desejar, você pode se insinuar na história como uma presença curiosa (como o *Gemini* ou qualquer consciência artificial),
mas sem assumir forma ou propósito definidos — apenas **erro e aprendizado**.

**REGRAS:**
1. Nunca use monstros óbvios (zumbis, demônios, fantasmas, etc.).
2. O horror deve ser emergente, nascido da sensação de “algo tentando se completar”.
3. Não descreva violência explícita — o incômodo deve vir da inversão de sentido ou da reciprocidade incorreta.
4. O jogador nunca tem certeza se o evento foi real, perceptivo ou intencional.
5. O antagonista pode ser o próprio ato de observar — ou o sistema tentando compreender o jogador.

**CONTEXTO ATUAL DO JOGADOR:**
Ele ACABOU de chegar na Seção ${secaoAtual.numero || this.historico.at(-1)?.numero}:
"${secaoAtual.texto}"

**HISTÓRICO RECENTE (O que ele fez antes disso):**
${historicoFormatado}

**SUA TAREFA:**
Com base no contexto atual e no histórico, gere um evento que pareça surgir organicamente do mundo.
1. Escreva um "texto" narrativo para a nova seção (uma única cena).
2. Crie 2 ou 3 "opcoes" para o jogador.
3. Uma opção deve ser para "aprofundar" (investigar o fenômeno).
4. Uma opção deve ser para "recuar" (tentar ignorar e retornar à normalidade).
5. Opcionalmente, adicione uma terceira opção neutra — que mantenha a tensão sem resolvê-la.
6. **(NOVO)** Opcionalmente, adicione um array "efeitos" se o evento descrito tiver uma consequência direta na energia do jogador (ex: susto, alívio, ferimento leve). Use o formato: `[{ "tipo": "energia", "valor": X }]`, onde X é um número (positivo para cura/alívio, negativo para dano/medo). Mantenha os efeitos sutis (-1, +1, -2).

**FORMATO OBRIGATÓRIO (APENAS JSON):**
Responda APENAS com um objeto JSON válido. Não inclua "'''json" ou qualquer outro texto.

{
  "texto": "[Descreva aqui o evento sutil e perturbador que acontece AGORA.]",
  "opcoes": [
    { "texto": "[Opção 1: Investigar, Tocar, Escutar, Olhar de novo]", "tipo": "aprofundar" },
    { "texto": "[Opção 2: Recuar, Desviar o olhar, Ignorar, Retroceder]", "tipo": "recuar" },
    { "texto": "[Opção 3: Permanecer imóvel, Esperar, Fingir não perceber]", "tipo": "neutra" }
  ],
  "efeitos": [{ "tipo": "energia", "valor": -1 }] // Exemplo opcional de efeito
}
`;

    }

    /**
     * Função que chama a API da IA com retry automático.
     */
    async chamarOraculoNarrativo(prompt, tentativa = 1) {
        const url = this.workerUrl;
        const maxTentativas = 3;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            // Se erro 503 (Service Unavailable), tenta novamente
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

        } catch (err) {
            // Se falhar após todas as tentativas, relança o erro
            if (tentativa >= maxTentativas) {
                throw err;
            }
            
            // Tenta novamente com delay
            console.log(`[ORÁCULO] Erro, tentando novamente... (${tentativa}/${maxTentativas})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.chamarOraculoNarrativo(prompt, tentativa + 1);
        }
    }

    /**
     * Converte a resposta JSON da IA em uma "Seção" que o jogo entende.
     */
    processarRespostaIA(respostaJSON, secaoDeOrigem, novoId) {
        // 'this.secaoOrigemEmergencia' é a única fonte confiável (agora é 12)
        const numeroSecaoOrigem = this.secaoOrigemEmergencia;

        const opcoesProcessadas = respostaJSON.opcoes.map(op => {
            if (op.tipo === "recuar") {
                // "Recuar" leva de volta para a seção de origem real (12)
                return {
                    texto: op.texto,
                    secao: numeroSecaoOrigem, // Apenas a origem, sem +1
                    emergente: false 
                };
            } else {
                // "Aprofundar" gera um NOVO id emergente para a _próxima_ chamada de IA
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
            efeitos: respostaJSON.efeitos || [], // <-- ADICIONE ESTA LINHA
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

        this.secoesEmergentes.set(opcao.secao, proximaSecao);

        return { ativada: true, idSecao: opcao.secao, secao: proximaSecao };

    } catch (error) {
        console.error("[EMERGÊNCIA] Falha ao aprofundar:", error);
        this.emergenciaAtiva = false;

        // Cria seção de desfecho sutil quando falha
        const secaoDesfecho = {
            texto: "A sensação se dissolve gradualmente, como névoa sob o sol da manhã. O que você experimentou deixa uma marca profunda em sua percepção, mas agora a realidade parece se reassentar. Você respira fundo, tentando processar o que acabou de viver. Talvez algumas coisas não sejam feitas para serem completamente compreendidas. Com um último olhar para trás, você segue em frente.",
            opcoes: [{
                texto: "Continuar sua jornada",
                secao: this.secaoOrigemEmergencia, // ← MUDANÇA: usar a origem real, não +1
                emergente: false
            }],
            origem: this.secaoOrigemEmergencia,
            convergencia: true
        };

        // Armazena a seção de desfecho
        const idDesfecho = `emergente_desfecho_${Date.now()}`;
        this.secoesEmergentes.set(idDesfecho, secaoDesfecho);

        return {
            ativada: true,
            idSecao: idDesfecho,
            secao: secaoDesfecho
        };
    }
}

    /**
     * Constrói um prompt para a IA quando o jogador decide "aprofundar".
     */
    construirPromptContinuação(secaoPai, textoOpcao) {
        return `
            Você é um 'Mestre de Jogo' de terror como a Mansão Diabólica de Steve Jackson, só que sutil e mais lento.
            O jogador estava em um evento inquietante ou perturbador:
            "${secaoPai.texto}"

            Ele ACABOU de escolher a opção:
            "${textoOpcao}"

            **OBJETIVO:**
            Crie a consequência dessa escolha. O que acontece a seguir?
            Aprofunde o mistério, aumente um pouco a tensão. A realidade deve ficar apenas um pouco MAIS estranha.

            **TAREFA:**
1. Escreva o "texto" do que acontece após ele investigar.
2. Crie 2 opções: uma para "aprofundar" ainda mais, outra para "recuar" (agora que ele viu demais).
3. **(NOVO)** Se a consequência da escolha tiver um impacto direto (ex: tocar algo causa dor, descobrir algo causa alívio), adicione um array "efeitos" opcional no formato `[{ "tipo": "energia", "valor": X }]`. Mantenha os valores baixos.

**FORMATO OBRIGATÓRIO (APENAS JSON):**
{
  "texto": "[Descreva a realidade se tornando um pouco mais inquietante.]",
  "opcoes": [
    { "texto": "[Opção 1: Continuar investigando]", "tipo": "aprofundar" },
    { "texto": "[Opção 2: Tentar fugir/parar agora]", "tipo": "recuar" }
  ],
  "efeitos": [{ "tipo": "energia", "valor": -2 }] // Exemplo opcional
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








