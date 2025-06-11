// ai-narrator.js
import { narrate } from './speech.js';

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

// Função para enviar requisição para a API de IA
async function queryAI(prompt, systemMessage = NARRATOR_PERSONA) {
    try {
        const response = await fetch('https://sua-api-de-ia/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY' // Substitua por sua chave de API
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // ou outro modelo de sua preferência
                messages: [
                    { role: "system", content: systemMessage },
                    ...conversationHistory,
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            const aiResponse = data.choices[0].message.content;
            
            // Atualiza o histórico de conversação
            conversationHistory.push({ role: "user", content: prompt });
            conversationHistory.push({ role: "assistant", content: aiResponse });
            
            // Limita o tamanho do histórico
            if (conversationHistory.length > MAX_HISTORY_LENGTH * 2) {
                conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH * 2);
            }
            
            return aiResponse;
        } else {
            console.error("Resposta da IA não contém escolhas:", data);
            return "Não consigo processar sua solicitação no momento.";
        }
    } catch (error) {
        console.error("Erro ao consultar a IA:", error);
        return "Ocorreu um erro ao processar sua solicitação.";
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
async function processNaturalLanguage(text, gameContext) {
    // Prepara o contexto do jogo para a IA
    const contextPrompt = `
CONTEXTO DO JOGO:
Sala atual: ${gameContext.currentRoom.name}
Descrição: ${gameContext.currentRoom.description}
Saúde do jogador: ${gameContext.playerHealth}/100
Inventário: ${gameContext.inventory.map(item => item.content).join(', ')}

O jogador disse: "${text}"

Responda como narrador e inclua comandos entre colchetes se necessário:
[MOVE:direção] - Para mover o jogador (norte, sul, leste, oeste)
[EXAMINE] - Para examinar a sala
[SEARCH] - Para procurar por itens
[OPEN_DOOR:direção] - Para abrir uma porta
[REST] - Para descansar
[COLLECT:itemId] - Para coletar um item
[INTERACT:poiId] - Para interagir com um ponto de interesse

Exemplo: "Você caminha cautelosamente pelo corredor escuro. [MOVE:norte]"
`;

    // Consulta a IA
    const aiResponse = await queryAI(contextPrompt);
    
    // Extrai comandos e texto limpo
    const { text: narrativeText, commands } = extractCommands(aiResponse);
    
    // Exibe a narrativa
    await addLogMessage(narrativeText, 1000);
    
    // Executa os comandos extraídos
    for (const cmd of commands) {
        await executeAICommand(cmd, gameContext);
    }
    
    return true;
}

// Função para executar comandos extraídos da resposta da IA
async function executeAICommand(command, gameContext) {
    console.log("Executando comando da IA:", command);
    
    switch (command.command) {
        case "MOVE":
            const dirBtn = document.getElementById(`go-${command.argument.toLowerCase()}`);
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

// Função para obter o contexto atual do jogo
function getCurrentGameContext() {
    const currentRoom = dungeon.rooms[playerState.currentRoom];
    
    // Prepara o inventário para o contexto
    let inventory = [];
    if (playerData && playerData.inventory && playerData.inventory.itemsInChest) {
        inventory = playerData.inventory.itemsInChest;
    }
    
    return {
        currentRoom,
        playerHealth: playerState.health,
        inventory,
        visitedRooms: playerState.visitedRooms,
        discoveredRooms: playerState.discoveredRooms
    };
}

// Exporta as funções principais
export { processNaturalLanguage, getCurrentGameContext };
