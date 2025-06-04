// Comportamento da Sala 1 - Portal Sangrento
export const Room1Behavior = {
    // Estado inicial da sala
    initialState: {
        examined: false,
        skullExamined: false
    },

    // Handlers para eventos da sala
    handlers: {
        // Manipula primeira visita
        async onFirstVisit(context) {
            const { addLogMessage } = context;
            await addLogMessage("Ao cruzar o portal, você ouve sussurros agonizantes. Uma voz sepulcral ecoa: 'Apenas os dignos sobreviverão às cinco provações...'");
            return true;
        },

        // Manipula ação de examinar
        async onExamine(context) {
            const { room, addLogMessage, createPointsOfInterest } = context;

            if (!room.explorationState) {
                room.explorationState = { ...this.initialState };
            }

            if (!room.explorationState.examined) {
                await addLogMessage("Entre os ossos, você nota um crânio humano com runas gravadas e um pergaminho enrolado em suas órbitas vazias.");
                room.explorationState.examined = true;

                createPointsOfInterest([
                    {
                        id: "skull",
                        name: "Crânio com Runas",
                        description: "Um crânio humano com runas arcanas entalhadas na testa. Um pergaminho amarelado está enfiado em uma das órbitas.",
                        items: [{
                            id: "warning-scroll",
                            content: "Pergaminho de Aviso",
                            description: "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'"
                        }]
                    }
                ], room);

                return true;
            }

            await addLogMessage("Um portal de pedra negra manchado de sangue seco. Ossos humanos estão espalhados pelo chão e uma escada em espiral ascende para a escuridão.");
            return false;
        },

        // Manipula ação de procurar
        async onSearch(context) {
            const { room, addLogMessage, applyDamage } = context;

            if (room.explorationState.examined) {
                const trapTriggered = Math.random() <= 0.7;
                if (trapTriggered) {
                    await addLogMessage("Ao revirar os ossos, uma armadilha é acionada! Lâminas afiadas cortam o ar!");
                    await applyDamage({
                        amount: "1D6",
                        message: "Lâminas afiadas cortam sua pele!"
                    });
                    return true;
                }
            }

            await addLogMessage("Você procura cuidadosamente entre os ossos espalhados, mas não encontra nada de interessante.");
            return false;
        },

        // Manipula interação com pontos de interesse
        async onInteractWithPOI(context) {
            const { poi, room, addLogMessage } = context;
            
            if (poi.id === "skull") {
                if (!room.explorationState.skullExamined) {
                    room.explorationState.skullExamined = true;
                    await addLogMessage("Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas.");
                }
                
                // Retorna o item diretamente do POI
                if (poi.items && poi.items.length > 0) {
                    return poi.items[0];
                }
            }

            return false;
        },

        // Manipula coleta de itens
        async onCollectItem(context) {
            const { item, addLogMessage } = context;
            
            if (item.id === "warning-scroll") {
                await addLogMessage("Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam.");
                return true;
            }

            return false;
        }
    }
};
