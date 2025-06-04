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
            const { poi, room, addLogMessage, createCollectButton } = context;
            
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
                
                // Usa createCollectButton diretamente
                createCollectButton(scrollItem);
                
                return true;
            }

            return false;
        }
    }
};

// Removendo o código de evento que não é necessário
