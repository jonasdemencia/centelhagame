export const Room1Behavior = {
    initialState: {
        examined: false,
        skullExamined: false
    },
    handlers: {
        async onFirstVisit(context) {
            (window.addLogMessage || context.addLogMessage)(
                "Ao cruzar o portal, você ouve sussurros agonizantes. Uma voz sepulcral ecoa: 'Apenas os dignos sobreviverão às cinco provações...'"
            );
            return true;
        },

        async onExamine(context) {
            (window.addLogMessage || context.addLogMessage)(
                "Entre os ossos, você nota um crânio humano com runas gravadas e um pergaminho enrolado em suas órbitas vazias."
            );
            // Cria botão do POI usando DOM puro
            setTimeout(() => {
                const oldBtn = document.getElementById("poi-skull-btn");
                if (oldBtn) oldBtn.remove();
                const parent = document.getElementById("action-buttons") || document.body;
                const btn = document.createElement("button");
                btn.id = "poi-skull-btn";
                btn.className = "poi-btn";
                btn.textContent = "Examinar Crânio com Runas";
                btn.onclick = () => {
                    Room1Behavior.handlers.onInteractWithPOI({
                        poi: {
                            id: "skull",
                            name: "Crânio com Runas",
                            description: "Um crânio humano com runas arcanas entalhadas na testa. Um pergaminho amarelado está enfiado em uma das órbitas."
                        }
                    });
                };
                parent.appendChild(btn);
            }, 0);
            return true;
        },

        async onInteractWithPOI(context) {
            const poi = context?.poi || { id: "skull" };
            if (poi.id === "skull") {
                (window.addLogMessage || context.addLogMessage)(
                    "Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas."
                );
                // Cria botão de coletar item usando DOM puro
                setTimeout(() => {
                    const oldBtn = document.getElementById("collect-warning-scroll-btn");
                    if (oldBtn) oldBtn.remove();
                    const parent = document.getElementById("action-buttons") || document.body;
                    const btn = document.createElement("button");
                    btn.id = "collect-warning-scroll-btn";
                    btn.className = "collect-btn";
                    btn.textContent = "Recolher Pergaminho de Aviso";
                    btn.onclick = () => {
                        Room1Behavior.handlers.onCollectItem({
                            item: {
                                id: "warning-scroll",
                                content: "Pergaminho de Aviso"
                            }
                        });
                        btn.remove();
                    };
                    parent.appendChild(btn);
                }, 0);
                return true;
            }
            return false;
        },

        async onCollectItem(context) {
            (window.addLogMessage || context.addLogMessage)(
                "Você desenrola cuidadosamente o pergaminho amarelado, revelando um aviso sombrio sobre as provações que aguardam."
            );
            return true;
        }
    }
};
