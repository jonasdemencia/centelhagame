export const Room1Behavior = {
    initialState: {
        examined: false,
        skullExamined: false
    },
    handlers: {
        async onFirstVisit(context) {
            // Mensagem de ambientação
            (window.addLogMessage || context.addLogMessage)(
                "Ao cruzar o portal, você ouve sussurros agonizantes. Uma voz sepulcral ecoa: 'Apenas os dignos sobreviverão às cinco provações...'"
            );
            return true;
        },

        async onExamine(context) {
            // Mensagem e botão para o ponto de interesse, sempre
            (window.addLogMessage || context.addLogMessage)(
                "Entre os ossos, você nota um crânio humano com runas gravadas e um pergaminho enrolado em suas órbitas vazias."
            );
            // Cria o botão do ponto de interesse do crânio
            if (window.CentelhaPower?.addUI) {
                window.CentelhaPower.addUI({
                    id: "poi-skull-btn",
                    html: `<button class="poi-btn">Examinar Crânio com Runas</button>`,
                    parent: "#action-buttons",
                    events: {
                        click: () => {
                            // Simula clique no POI chamando onInteractWithPOI diretamente
                            Room1Behavior.handlers.onInteractWithPOI({
                                poi: {
                                    id: "skull",
                                    name: "Crânio com Runas",
                                    description: "Um crânio humano com runas arcanas entalhadas na testa. Um pergaminho amarelado está enfiado em uma das órbitas."
                                }
                            });
                        }
                    }
                });
            }
            return true;
        },

        async onInteractWithPOI(context) {
            // Sempre cria o botão de coletar o pergaminho ao clicar no crânio
            const poi = context?.poi || { id: "skull" };
            if (poi.id === "skull") {
                (window.addLogMessage || context.addLogMessage)(
                    "Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas."
                );
                // Cria botão de coletar item, independente de qualquer estado
                if (window.CentelhaPower?.addUI) {
                    window.CentelhaPower.addUI({
                        id: "collect-warning-scroll-btn",
                        html: `<button class="collect-btn">Recolher Pergaminho de Aviso</button>`,
                        parent: "#action-buttons",
                        events: {
                            click: () => {
                                Room1Behavior.handlers.onCollectItem({
                                    item: {
                                        id: "warning-scroll",
                                        content: "Pergaminho de Aviso"
                                    }
                                });
                                // Remove botão após coleta
                                window.CentelhaPower.removeUI("collect-warning-scroll-btn");
                            }
                        }
                    });
                }
                return true;
            }
            return false;
        },

        async onCollectItem(context) {
            // Mensagem ao recolher o pergaminho
            (window.addLogMessage || context.addLogMessage)(
                "Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam."
            );
            // Aqui você pode adicionar lógica para dar o item ao jogador, se desejar
            return true;
        }
    }
};
