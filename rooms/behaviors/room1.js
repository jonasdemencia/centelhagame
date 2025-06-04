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
            // NÃO CRIE BOTÃO MANUAL. O engine fará isso ao clicar no POI.
            return true;
        },
        async onInteractWithPOI(context) {
            // Apenas log extra (opcional), mas NÃO consome o evento:
            if (context?.poi?.id === "skull") {
                (window.addLogMessage || context.addLogMessage)(
                    "Você remove cuidadosamente o pergaminho da órbita do crânio. As runas parecem pulsar levemente à luz das tochas."
                );
            }
            // Return false para deixar o engine seguir o fluxo normal!
            return false;
        }
        // NÃO precisa de onCollectItem, engine já faz.
    }
};
