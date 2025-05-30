// room2.js -- Behavior para a Câmara de Sangue (room-2)
// Ajustado para NÃO bloquear o motor de criar o botão de sorte no altar

export const Room2Behavior = {
    // Estado inicial da sala
    initialState: {
        examined: false,
        bloodPoolExamined: false,
        altarExamined: false,
        sacrificeMade: false,
        golemTriggered: false
    },

    handlers: {
        // O motor deve procurar por shouldTriggerEnemy
        shouldTriggerEnemy(context) {
            const { room } = context;
            if (!room.explorationState) {
                room.explorationState = { ...this.initialState };
            }
            // Só ativa o inimigo se bloodPoolExamined && golemTriggered
            return !!(room.explorationState.bloodPoolExamined && room.explorationState.golemTriggered);
        },

        // Primeira visita
        async onFirstVisit({ addLogMessage }) {
            await addLogMessage("O sangue no chão começa a se mover em sua direção, formando tentáculos que tentam agarrar seus tornozelos.");
            return true;
        },

        // Examinar sala
        async onExamine({ room, addLogMessage, createPointsOfInterest }) {
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
                                            effect: { "states.sacrificeMade": true },
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
                                            effect: { "states.sacrificeMade": true },
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

        // Procurar
        async onSearch({ room, addLogMessage, applyDamage }) {
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

        // Interagir com POIs
        async onInteractWithPOI({ poi, room, addLogMessage, showEnemy }) {
            if (poi.id === "blood-pool") {
                if (!room.explorationState.bloodPoolExamined) {
                    room.explorationState.bloodPoolExamined = true;
                    await addLogMessage("A poça de sangue borbulha ameaçadoramente. Algo parece se mover nas profundezas.");
                    if (!room.explorationState.golemTriggered) {
                        room.explorationState.golemTriggered = true;
                        await addLogMessage("O sangue no centro da sala se ergue, formando um golem monstruoso que avança em sua direção!");
                        if (showEnemy) showEnemy("blood-golem");
                        // Força o motor a reavaliar a sala e exibir o botão de lutar
                        if (typeof moveToRoom === "function") {
                            moveToRoom(room.id);
                        }
                        return true;
                    }
                }
                // Mesmo que já tenha examinado, marca como true para garantir consistência
                return true;
            }
            if (poi.id === "altar") {
                if (!room.explorationState.altarExamined) {
                    room.explorationState.altarExamined = true;
                    await addLogMessage("O altar parece antigo e manchado de sangue seco. A bacia espera por um sacrifício.");
                }
                // NÃO bloqueie o fluxo padrão: deixe o motor criar o botão normalmente!
                return false;
            }
            return false;
        },

        // Coletar item
        async onCollectItem({ item, addLogMessage }) {
            if (item.id === "blood-key") {
                await addLogMessage("O cristal pulsa em suas mãos como um coração vivo, irradiando um brilho vermelho-sangue.");
                return true;
            }
            return false;
        }
    }
};
