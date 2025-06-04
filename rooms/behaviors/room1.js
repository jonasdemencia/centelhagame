// Comportamento da Sala 1 - Portal Sangrento
export const Room1Behavior = {
    // Estado inicial da sala
    initialState: {
        examined: false,
        skullExamined: false
    },

    // Handlers para eventos da sala
    handlers: {
        // Manipula interação com pontos de interesse
        async onInteractWithPOI(context) {
            const { poi, room, addLogMessage } = context;
            
            console.log("Room1Behavior.onInteractWithPOI chamado com:", poi.id);
            
            if (poi.id === "skull") {
                if (!room.explorationState.skullExamined) {
                    room.explorationState.skullExamined = true;
                    await addLogMessage("Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas.");
                }
                
                // Cria o botão de recolher item
                const scrollItem = {
                    id: "warning-scroll",
                    content: "Pergaminho de Aviso",
                    description: "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'"
                };
                
                // Não cria o botão diretamente, mas usa a função global
                // Primeiro, verifica se a função addItemToInventory está disponível
                console.log("Verificando se addItemToInventory está disponível:", typeof window.addItemToInventory);
                
                // Adiciona o item diretamente ao inventário sem usar o botão
                try {
                    // Tenta acessar a função no escopo global
                    if (typeof window.addItemToInventory === 'function') {
                        console.log("Usando window.addItemToInventory");
                        await window.addItemToInventory(scrollItem);
                    } else {
                        // Tenta acessar a função no escopo do módulo
                        console.log("Tentando acessar addItemToInventory do escopo do módulo");
                        
                        // Cria um evento customizado para ser capturado pelo código principal
                        const event = new CustomEvent('add-item-to-inventory', {
                            detail: scrollItem,
                            bubbles: true
                        });
                        document.dispatchEvent(event);
                        
                        console.log("Evento add-item-to-inventory disparado");
                    }
                    
                    // Adiciona mensagem ao log
                    await addLogMessage("Você recolheu: " + scrollItem.content, 800);
                } catch (error) {
                    console.error("Erro ao adicionar item:", error);
                    
                    // Fallback: cria o botão manualmente
                    const actionButtons = document.getElementById('action-buttons');
                    if (actionButtons) {
                        // Remove botão existente
                        const existingButton = document.getElementById('collect-item-button');
                        if (existingButton) existingButton.remove();
                        
                        // Cria o botão
                        const collectButton = document.createElement('button');
                        collectButton.id = 'collect-item-button';
                        collectButton.textContent = 'Recolher Item';
                        collectButton.classList.add('action-btn', 'collect-btn');
                        
                        // Adiciona evento de clique
                        collectButton.addEventListener('click', async () => {
                            // Adiciona o item ao inventário usando o objeto global
                            const addItemFn = window.addItemToInventory || 
                                             window.parent.addItemToInventory || 
                                             parent.addItemToInventory;
                            
                            if (addItemFn) {
                                await addItemFn(scrollItem);
                                await addLogMessage("Você recolheu: " + scrollItem.content, 800);
                                collectButton.remove();
                            } else {
                                console.error("Não foi possível encontrar a função addItemToInventory");
                            }
                        });
                        
                        actionButtons.appendChild(collectButton);
                    }
                }
                
                return true;
            }

            return false;
        }
    }
};

// Adiciona um listener para o evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona um listener para o evento customizado
    document.addEventListener('add-item-to-inventory', async (e) => {
        console.log("Evento add-item-to-inventory capturado", e.detail);
        
        // Tenta encontrar a função addItemToInventory no escopo global
        const addItemFn = window.addItemToInventory || parent.addItemToInventory;
        
        if (addItemFn) {
            await addItemFn(e.detail);
        } else {
            console.error("Função addItemToInventory não encontrada no escopo global");
        }
    });
});
