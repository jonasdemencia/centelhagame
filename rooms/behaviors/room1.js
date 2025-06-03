export const Room1Behavior = {
    initialState: {
        examined: false,
        skullExamined: false
    },

    handlers: {
        // Primeira visita à sala
        async onFirstVisit(context) {
            const { addLogMessage } = context;
            await addLogMessage(
                "Ao cruzar o portal, você ouve sussurros agonizantes. Uma voz sepulcral ecoa: 'Apenas os dignos sobreviverão às cinco provações...'"
            );
            return true;
        },

        // Examinar a sala
        async onExamine(context) {
            const { room, addLogMessage, createPointsOfInterest } = context;

            if (!room.explorationState) {
                room.explorationState = { ...this.initialState };
            }

            if (!room.explorationState.examined) {
                await addLogMessage(
                    "Entre os ossos, você nota um crânio humano com runas gravadas e um pergaminho enrolado em suas órbitas vazias."
                );
                room.explorationState.examined = true;

                // Mostra botão do ponto de interesse
                createPointsOfInterest(
                    [
                        {
                            id: "skull",
                            name: "Crânio com Runas",
                            description:
                                "Um crânio humano com runas arcanas entalhadas na testa. Um pergaminho amarelado está enfiado em uma das órbitas.",
                            // O item é referenciado aqui, mas o botão de coleta será criado no handler abaixo!
                            items: [
                                {
                                    id: "warning-scroll",
                                    content: "Pergaminho de Aviso",
                                    description:
                                        "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'",
                                    onCollect: async (context) => {
                                        await context.addLogMessage(
                                            "Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam."
                                        );
                                        return true;
                                    }
                                }
                            ]
                        }
                    ],
                    room
                );

                return true;
            }

            await addLogMessage(
                "Um portal de pedra negra manchado de sangue seco. Ossos humanos estão espalhados pelo chão e uma escada em espiral ascende para a escuridão."
            );
            return false;
        },

        // Procurar na sala (com chance de armadilha)
        async onSearch(context) {
            const { room, addLogMessage, applyDamage } = context;

            if (room.explorationState.examined) {
                const trapTriggered = Math.random() <= 0.7;
                if (trapTriggered) {
                    await addLogMessage(
                        "Ao revirar os ossos, uma armadilha é acionada! Lâminas afiadas cortam o ar!"
                    );
                    await applyDamage?.({
                        amount: "1D6",
                        message: "Lâminas afiadas cortam sua pele!"
                    });
                    return true;
                }
            }

            await addLogMessage(
                "Você procura cuidadosamente entre os ossos espalhados, mas não encontra nada de interessante."
            );
            return false;
        },

        // Interação com o ponto de interesse ("Crânio com Runas")
        async onInteractWithPOI(context) {
            const { poi, room, addLogMessage } = context;

            // Helper seguro para criar o botão (funciona mesmo que não venha no contexto)
            const createCollectButton =
                context.createCollectButton ||
                window.createCollectButton ||
                (window.CentelhaAPI && window.CentelhaAPI.createCollectButton);

            if (poi.id === "skull" && !room.explorationState.skullExamined) {
                room.explorationState.skullExamined = true;
                await addLogMessage(
                    "Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas."
                );
                if (typeof createCollectButton === "function") {
                    createCollectButton({
                        id: "warning-scroll",
                        content: "Pergaminho de Aviso",
                        description:
                            "Um pergaminho que diz: 'Cinco provações aguardam: Sangue, Fogo, Veneno, Loucura e Morte. Apenas os que superarem todas receberão o poder supremo.'",
                        onCollect: async (context) => {
                            await context.addLogMessage(
                                "Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam."
                            );
                            return true;
                        }
                    });
                }
                return true;
            }

            return false;
        },

        // Quando o jogador recolher o pergaminho
        async onCollectItem(context) {
            const { item, addLogMessage } = context;
            if (item.id === "warning-scroll") {
                await addLogMessage(
                    "Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam."
                );
                return true;
            }
            return false;
        }
    }
};
