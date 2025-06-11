// ai-narrator.js - versão simplificada
// Histórico de interações para manter contexto
let conversationHistory = [];
const MAX_HISTORY_LENGTH = 10;

// Configuração da persona do narrador
const NARRATOR_PERSONA = `
Você é o narrador de um jogo de RPG de exploração de masmorras no estilo de Dungeons & Dragons.
Seu papel é descrever ambientes, narrar eventos e responder às ações do jogador de forma imersiva.
Use linguagem vívida e descritiva, criando uma atmosfera de mistério e aventura.
Mantenha suas respostas concisas (máximo 3 parágrafos) mas ricas em detalhes sensoriais.
Adapte seu tom conforme a situação: tenso em combates, misterioso em exploração, amigável em diálogos.
`;

// Função para simular resposta da IA
async function simulateAIResponse(prompt) {
    console.log("Simulando resposta da IA para:", prompt);
    
    // Respostas simuladas baseadas em palavras-chave no prompt
    if (prompt.includes("examinar") || prompt.includes("olhar")) {
        return "Você observa cuidadosamente a sala. As paredes de pedra antiga contam histórias silenciosas de eras passadas. [EXAMINE]";
    } else if (prompt.includes("norte") || prompt.includes("frente")) {
        return "Você se move cautelosamente em direção ao norte. [MOVE:north]";
    } else if (prompt.includes("sul") || prompt.includes("voltar")) {
        return "Você retorna pelo caminho de onde veio, em direção ao sul. [MOVE:south]";
    } else if (prompt.includes("leste") || prompt.includes("direita")) {
        return "Você se desloca para o leste, atento a qualquer perigo. [MOVE:east]";
    } else if (prompt.includes("oeste") || prompt.includes("esquerda")) {
        return "Você caminha para o oeste, mantendo-se alerta. [MOVE:west]";
    } else if (prompt.includes("procurar") || prompt.includes("buscar")) {
        return "Você vasculha a área em busca de itens ou pistas ocultas. [SEARCH]";
    } else if (prompt.includes("descansar") || prompt.includes("sentar")) {
        return "Você decide fazer uma breve pausa para recuperar suas forças. [REST]";
    } else if (prompt.includes("porta") || prompt.includes("abrir")) {
        return "Você se aproxima da porta e tenta abri-la. [OPEN_DOOR:north]";
    } else {
        return "Você considera suas opções enquanto observa o ambiente ao seu redor. O que deseja fazer agora?";
    }
}

// Função para extrair comandos de uma resposta da IA
function extractCommands(aiResponse) {
    // Procura por comandos entre colchetes [COMANDO:argumento]
    const commandRegex = /\[([A-Z_]+)(?::([^\]]+))?\]/g;
    const commands = [];
    
    let match;
    while ((match = commandRegex.exec(aiResponse)) !== null) {
        commands.push({
            command: match[1],
            argument: match[2] || null
        });
    }
    
    // Remove os comandos do texto para exibição
    const cleanText = aiResponse.replace(commandRegex, '').trim();
    
    return { text: cleanText, commands };
}

// Função principal para processar comandos de voz via IA
async function processNaturalLanguage(text, addLogMessageFn) {
    try {
        // Simula uma consulta à IA
        const aiResponse = await simulateAIResponse(text);
        
        // Extrai comandos e texto limpo
        const { text: narrativeText, commands } = extractCommands(aiResponse);
        
        // Exibe a narrativa
        await addLogMessageFn(narrativeText, 1000);
        
        // Executa os comandos extraídos
        for (const cmd of commands) {
            await executeAICommand(cmd);
        }
        
        return true;
    } catch (error) {
        console.error("Erro ao processar linguagem natural:", error);
        await addLogMessageFn("Desculpe, não consegui entender seu comando.", 1000);
        return false;
    }
}

// Função para executar comandos extraídos da resposta da IA
async function executeAICommand(command) {
    console.log("Executando comando da IA:", command);
    
    switch (command.command) {
        case "MOVE":
            const dirBtn = document.getElementById(`go-${command.argument?.toLowerCase()}`);
            if (dirBtn && !dirBtn.disabled) {
                dirBtn.click();
            }
            break;
            
        case "EXAMINE":
            const examineBtn = document.getElementById("examine-room");
            if (examineBtn) examineBtn.click();
            break;
            
        case "SEARCH":
            const searchBtn = document.getElementById("search-room");
            if (searchBtn) searchBtn.click();
            break;
            
        case "OPEN_DOOR":
            const openDoorBtn = document.getElementById("open-door");
            if (openDoorBtn) {
                openDoorBtn.click();
                // Espera o menu aparecer
                await new Promise(resolve => setTimeout(resolve, 300));
                // Seleciona a direção
                if (command.argument) {
                    const directionMenu = document.querySelector('.direction-menu');
                    if (directionMenu) {
                        const dirBtn = Array.from(directionMenu.querySelectorAll('.direction-choice')).find(
                            btn => btn.textContent.toLowerCase().includes(command.argument.toLowerCase())
                        );
                        if (dirBtn) dirBtn.click();
                    }
                }
            }
            break;
            
        case "REST":
            const restBtn = document.getElementById("rest");
            if (restBtn) restBtn.click();
            break;
            
        case "COLLECT":
            const collectBtn = document.getElementById('collect-item-button');
            if (collectBtn) collectBtn.click();
            break;
            
        case "INTERACT":
            if (command.argument) {
                const poiElement = document.querySelector(`[data-poi-id="${command.argument}"]`);
                if (poiElement) poiElement.click();
            }
            break;
    }
}

// Exporta apenas a função principal
export { processNaturalLanguage };
