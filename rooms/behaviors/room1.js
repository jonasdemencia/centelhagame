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
                
                // Remove botão existente
                const existingButton = document.getElementById('collect-item-button');
                if (existingButton) existingButton.remove();
                
                // Cria o botão
                const collectButton = document.createElement('button');
                collectButton.id = 'collect-item-button';
                collectButton.textContent = 'Recolher Item';
                collectButton.classList.add('action-btn', 'collect-btn');
                
                // Adiciona evento de clique usando a função global do window
                collectButton.addEventListener('click', async () => {
                    try {
                        // Usa a função global através do objeto window
                        await window.addItemToInventory(scrollItem);
                        
                        // Adiciona mensagem ao log
                        window.startNewLogBlock("Item Recolhido");
                        await window.addLogMessage(`Você recolheu: ${scrollItem.content}`, 800);
                        
                        // Remove o botão
                        collectButton.remove();
                    } catch (error) {
                        console.error("Erro ao adicionar item:", error);
                    }
                });
                
                // Adiciona o botão à interface
                const actionButtons = document.getElementById('action-buttons');
                if (actionButtons) {
                    actionButtons.appendChild(collectButton);
                }
                
                return true;
            }

            return false;
        }
    }
};
