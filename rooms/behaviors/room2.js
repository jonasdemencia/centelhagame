export const Room2Behavior = {
    // Estado inicial da sala permanece igual
    initialState: {
        examined: false,
        bloodPoolExamined: false,
        altarExamined: false,
        sacrificeMade: false,
        golemTriggered: false
    },

    handlers: {
        // Handler ajustado para controlar a visibilidade do inimigo
        shouldShowEnemy(context) {
            const { room } = context;
            if (!room.explorationState) {
                room.explorationState = { ...this.initialState };
            }
            // Mostra o inimigo apenas se a poça foi examinada E o golem foi ativado
            return room.explorationState.bloodPoolExamined && room.explorationState.golemTriggered;
        },

        // Todo o resto do código permanece EXATAMENTE igual
        async onFirstVisit(context) {
            const { addLogMessage } = context;
            await addLogMessage("O sangue no chão começa a se mover em sua direção, formando tentáculos que tentam agarrar seus tornozelos.");
            return true;
        },

        async onExamine(context) {
            const { room, addLogMessage, createPointsOfInterest } = context;

            if (!room.explorationState) {
                room.explorationState = { ...this.initialState };
            }

            if (!room.explorationState.examined) {
                await addLogMessage("Você examina a Câmara de Sangue com cuidado. A sala tem um teto alto e paredes de pedra antiga que pulsam como veias.");
                room.explorationState.examined = true;

                createPointsOfInterest([
                    {
                        id: "blood-pool",
                        name: "Poça de Sangue",
                        description: "No centro da sala há uma poça de sangue mais profunda, borbulhando como se estivesse viva."
                    },
                    {
                        id: "altar",
                        name: "Altar de Sangue",
                        description: "Na parede norte há um altar com uma bacia vazia e uma inscrição: 'Apenas o sangue do corajoso abrirá o caminho.'",
                        interactions: [
                            {
                                id: "blood-sacrifice",
                                condition: "!states.sacrificeMade",
                                name: "Fazer Sacrifício de Sangue",
                                result: {
                                    action: "testLuck",
                                    luckTest: {
                                        description: "O sacrifício de sangue é perigoso. Você precisa de sorte para não perder muito sangue.",
                                        success: {
                                            text: "Você consegue estancar o sangramento rapidamente. A chave de cristal vermelho está agora em suas mãos.",
                                            effect: {"states.sacrificeMade": true},
                                            items: [
                                                {
                                                    id: "blood-key",
                                                    content: "Chave de Sangue",
                                                    description: "Uma chave feita de cristal vermelho que pulsa como um coração."
                                                }
                                            ]
                                        },
                                        failure: {
                                            text: "O corte é mais profundo do que você pretendia! O sangramento é intenso e você se sente fraco.",
                                            effect: {"states.sacrificeMade": true},
                                            damage: {
                                                amount: "2D6",
                                                message: "Você perde muito sangue no sacrifício!"
                                            },
                                            items: [
                                                {
                                                    id: "blood-key",
                                                    content: "Chave de Sangue",
                                                    description: "Uma chave feita de cristal vermelho que pulsa como um coração."
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ], room);

                return true;
            }

            return false;
        },

        async onSearch(context) {
            const { room, addLogMessage, applyDamage } = context;

            if (!room.explorationState.sacrificeMade) {
                await addLogMessage("Ao procurar pela sala, os tentáculos de sangue se enrolam em seus tornozelos, causando dor!");
                await applyDamage({
                    amount: "1D4",
                    message: "Os tentáculos de sangue queimam sua pele!"
                });
                return true;
            }

            await addLogMessage("Você procura pela sala, mas o sangue permanece calmo após o sacrifício.");
            return false;
        },

        async onInteractWithPOI(context) {
            const { poi, room, addLogMessage, showEnemy } = context;
            
            if (poi.id === "blood-pool") {
                if (!room.explorationState.bloodPoolExamined) {
                    room.explorationState.bloodPoolExamined = true;
                    await addLogMessage("A poça de sangue borbulha ameaçadoramente. Algo parece se mover nas profundezas.");
                    
                    if (!room.explorationState.golemTriggered) {
                        room.explorationState.golemTriggered = true;
                        await addLogMessage("O sangue no centro da sala se ergue, formando um golem monstruoso que avança em sua direção!");
                        if (showEnemy) {
                            showEnemy("blood-golem");
                        }
                        return true;
                    }
                }
                return true;
            }

            if (poi.id === "altar") {
                if (!room.explorationState.altarExamined) {
                    room.explorationState.altarExamined = true;
                    await addLogMessage("O altar parece antigo e manchado de sangue seco. A bacia espera por um sacrifício.");
                }
                return true;
            }

            return false;
        },

        async onCollectItem(context) {
            const { item, addLogMessage } = context;
            
            if (item.id === "blood-key") {
                await addLogMessage("O cristal pulsa em suas mãos como um coração vivo, irradiando um brilho vermelho-sangue.");
                return true;
            }

            return false;
        }
    }
};
