// Comportamento da Sala 1 - Portal Sangrento
export const Room1Behavior = {
    // Estado inicial da sala
    initialState: {
        examined: false,
        skullExamined: false
    },

    // Handlers para eventos da sala
    handlers: {
        // Outros handlers permanecem iguais...

        // Manipula interação com pontos de interesse
        async onInteractWithPOI(context) {
            const { poi, room, addLogMessage } = context;
            
            if (poi.id === "skull") {
                if (!room.explorationState.skullExamined) {
                    room.explorationState.skullExamined = true;
                    await addLogMessage("Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas.");
                }
                
                // Força a criação do botão de recolher item diretamente
                setTimeout(() => {
                    const item = {
                        id: "warning-scroll",
                        content: "Pergaminho de Aviso",
                        description: "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'"
                    };
                    
                    // Remove qualquer botão existente primeiro
                    const existingButton = document.getElementById('collect-item-button');
                    if (existingButton) existingButton.remove();
                    
                    // Cria o botão
                    const collectButton = document.createElement('button');
                    collectButton.id = 'collect-item-button';
                    collectButton.textContent = 'Recolher Item';
                    collectButton.classList.add('action-btn', 'collect-btn');
                    
                    // Adiciona o evento de clique
                    collectButton.addEventListener('click', async () => {
                        // Adiciona o item ao inventário
                        if (typeof addItemToInventory === 'function') {
                            await addItemToInventory(item);
                        }
                        
                        // Adiciona mensagem ao log
                        if (typeof startNewLogBlock === 'function') {
                            startNewLogBlock("Item Recolhido");
                        }
                        await addLogMessage(`Você recolheu: ${item.content}`, 800);
                        
                        // Remove o botão
                        collectButton.remove();
                    });
                    
                    // Adiciona o botão à interface
                    const actionButtons = document.getElementById('action-buttons');
                    if (actionButtons) {
                        actionButtons.appendChild(collectButton);
                    }
                }, 100);
                
                // Ainda retorna o item para compatibilidade
                return {
                    item: {
                        id: "warning-scroll",
                        content: "Pergaminho de Aviso",
                        description: "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'"
                    }
                };
            }

            return false;
        }
    }
};
