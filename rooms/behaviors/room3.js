// Crie um arquivo em rooms/room-3.js
export const Room3Behavior = {
    // Estado inicial da sala
    initialState: {
        examined: false,
        forgeExamined: false,
        fireColumnsExamined: false,
        puzzleSolved: false,
        currentItem: null // Para armazenar o item atual
    },

    // Handlers para eventos da sala
    handlers: {
        // Manipula interação com pontos de interesse
        async onInteractWithPOI(context) {
            const { poi, room } = context;
            
            // Salva o item no estado da sala se existir
            if (poi.items && poi.items.length > 0) {
                room.explorationState.currentItem = poi.items[0];
                console.log("Item salvo no estado da sala:", room.explorationState.currentItem);
            }
            
            // Retorna false para continuar com o comportamento padrão
            return false;
        },
        
        // Adiciona um handler para preservar o botão de coleta
        preserveCollectButton(context) {
            const { room, createCollectButton } = context;
            
            // Verifica se há um item salvo e se o botão de coleta não existe
            if (room.explorationState.currentItem && !document.getElementById('collect-item-button')) {
                console.log("Restaurando botão de coleta para item:", room.explorationState.currentItem);
                createCollectButton(room.explorationState.currentItem);
                return true;
            }
            
            return false;
        }
    }
};

export default Room3Behavior;
