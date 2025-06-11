// ai-narrator.js - Abordagem híbrida com banco de respostas pré-geradas

// Banco de respostas narrativas organizadas por contexto
const narrativeResponses = {
    // Comandos de movimento
    movement: {
        north: [
            "Você avança cautelosamente para o norte, atento a qualquer perigo.",
            "Com passos decididos, você segue pelo caminho norte.",
            "Você se move silenciosamente em direção ao norte, mantendo-se alerta."
        ],
        south: [
            "Você retorna pelo caminho sul, mantendo-se vigilante.",
            "Decidindo voltar, você segue para o sul.",
            "Você se dirige ao sul, com a mão na empunhadura de sua arma."
        ],
        east: [
            "Você segue para o leste, onde a passagem se estende na penumbra.",
            "Virando à direita, você caminha para o leste com cautela.",
            "O caminho leste parece promissor, e você decide explorá-lo."
        ],
        west: [
            "Você se move para o oeste, onde as sombras parecem mais densas.",
            "Virando à esquerda, você segue pelo corredor oeste.",
            "Você escolhe a passagem oeste, avançando com cuidado."
        ]
    },
    
    // Ações de exploração
    exploration: {
        examine: [
            "Você examina cuidadosamente a sala. As paredes de pedra antiga estão cobertas de musgo e umidade.",
            "Seus olhos percorrem cada detalhe do ambiente. O ar está pesado com o cheiro de terra e tempo.",
            "Você observa atentamente o local. Sombras dançam nas paredes à luz fraca das tochas."
        ],
        search: [
            "Você procura minuciosamente por itens ou pistas ocultas.",
            "Seus dedos experientes tateiam cada fresta e recanto em busca de segredos.",
            "Você vasculha o local, esperando encontrar algo de valor ou interesse."
        ]
    },
    
    // Interações com objetos
    interaction: {
        door: [
            "Você se aproxima da porta, examinando-a antes de tentar abri-la.",
            "A porta chama sua atenção, e você decide verificar se está trancada.",
            "Você caminha até a porta, preparando-se para o que possa estar além dela."
        ],
        item: [
            "Você examina o objeto com cuidado antes de pegá-lo.",
            "O item chama sua atenção, e você se aproxima para examiná-lo melhor.",
            "Você encontra algo interessante e decide investigar mais de perto."
        ]
    },
    
    // Ações de combate
    combat: {
        attack: [
            "Você empunha sua arma, preparando-se para o combate.",
            "Com um movimento rápido, você se coloca em posição de ataque.",
            "Você avalia seu oponente, buscando o melhor momento para atacar."
        ],
        defend: [
            "Você assume uma postura defensiva, pronto para reagir.",
            "Mantendo-se cauteloso, você se prepara para defender-se.",
            "Você recua um passo, avaliando a situação antes de agir."
        ]
    },
    
    // Descanso e recuperação
    rest: [
        "Você encontra um local seguro para descansar e recuperar suas forças.",
        "Decidindo que precisa de um momento de pausa, você se senta para descansar.",
        "O cansaço pesa em seus músculos, e você decide fazer uma breve pausa."
    ],
    
    // Respostas genéricas
    default: [
        "Você considera suas opções enquanto observa o ambiente ao seu redor.",
        "O silêncio da masmorra é quebrado apenas pelo som de sua respiração enquanto você pondera seu próximo movimento.",
        "Você permanece alerta, avaliando a situação com cuidado."
    ]
};

// Função para obter uma resposta aleatória de uma categoria
function getRandomResponse(category) {
    if (Array.isArray(category)) {
        return category[Math.floor(Math.random() * category.length)];
    }
    return narrativeResponses.default[Math.floor(Math.random() * narrativeResponses.default.length)];
}

// Função para analisar o comando e selecionar a resposta apropriada
function processCommand(text) {
    text = text.toLowerCase();
    
    // Comandos de movimento
    if (text.includes("norte")) {
        return getRandomResponse(narrativeResponses.movement.north) + " [MOVE:north]";
    } else if (text.includes("sul")) {
        return getRandomResponse(narrativeResponses.movement.south) + " [MOVE:south]";
    } else if (text.includes("leste")) {
        return getRandomResponse(narrativeResponses.movement.east) + " [MOVE:east]";
    } else if (text.includes("oeste")) {
        return getRandomResponse(narrativeResponses.movement.west) + " [MOVE:west]";
    }
    
    // Ações de exploração
    else if (text.includes("examinar") || text.includes("olhar")) {
        return getRandomResponse(narrativeResponses.exploration.examine) + " [EXAMINE]";
    } else if (text.includes("procurar") || text.includes("buscar")) {
        return getRandomResponse(narrativeResponses.exploration.search) + " [SEARCH]";
    }
    
    // Interações com objetos
    else if (text.includes("porta") || text.includes("abrir")) {
        return getRandomResponse(narrativeResponses.interaction.door) + " [OPEN_DOOR]";
    } else if (text.includes("pegar") || text.includes("coletar") || text.includes("recolher")) {
        return getRandomResponse(narrativeResponses.interaction.item) + " [COLLECT]";
    }
    
    // Descanso
    else if (text.includes("descansar") || text.includes("sentar") || text.includes("pausa")) {
        return getRandomResponse(narrativeResponses.rest) + " [REST]";
    }
    
    // Resposta padrão
    return getRandomResponse(narrativeResponses.default);
}

// Função para extrair comandos de uma resposta
function extractCommands(response) {
    const commandRegex = /\[([A-Z_]+)(?::([^\]]+))?\]/g;
    const commands = [];
    
    let match;
    while ((match = commandRegex.exec(response)) !== null) {
        commands.push({
            command: match[1],
            argument: match[2] || null
        });
    }
    
    const cleanText = response.replace(commandRegex, '').trim();
    return { text: cleanText, commands };
}

// Função para executar comandos
async function executeCommand(command, addLogMessageFn) {
    console.log("Executando comando:", command);
    
    switch (command.command) {
        case "MOVE":
            const dirBtn = document.getElementById(`go-${command.argument?.toLowerCase()}`);
            if (dirBtn && !dirBtn.disabled) dirBtn.click();
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
            if (openDoorBtn) openDoorBtn.click();
            break;
            
        case "REST":
            const restBtn = document.getElementById("rest");
            if (restBtn) restBtn.click();
            break;
            
        case "COLLECT":
            const collectBtn = document.getElementById('collect-item-button');
            if (collectBtn) collectBtn.click();
            break;
    }
}

// Função principal para processar comandos de voz
async function processNaturalLanguage(text, addLogMessageFn) {
    try {
        // Processa o comando e obtém uma resposta narrativa
        const response = processCommand(text);
        
        // Extrai comandos e texto limpo
        const { text: narrativeText, commands } = extractCommands(response);
        
        // Exibe a narrativa
        await addLogMessageFn(narrativeText, 1000);
        
        // Executa os comandos extraídos
        for (const cmd of commands) {
            await executeCommand(cmd, addLogMessageFn);
        }
        
        return true;
    } catch (error) {
        console.error("Erro ao processar linguagem natural:", error);
        await addLogMessageFn("Desculpe, não consegui entender seu comando.", 1000);
        return false;
    }
}

// Expõe a função para o escopo global
window.processNaturalLanguage = processNaturalLanguage;

// Ativa o processamento de linguagem natural por padrão
window.aiModeEnabled = true;
