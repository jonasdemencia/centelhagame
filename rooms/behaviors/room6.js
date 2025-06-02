export const Room6Behavior = {
    initialState: {
        examined: false,
        throneExamined: false,
        readyToFight: false,
        finalBattleComplete: false
    },

    handlers: {
        // Handler chamado pelo engine para decidir se o boss aparece
        async onBossTrigger(context) {
            const { room, createFightButton, addLogMessage } = context;
            if (room.explorationState?.readyToFight && !room.explorationState?.finalBattleComplete) {
                const boss = room.enemies?.find(e => e.id === "senhor-da-morte");
                if (boss) {
                    await addLogMessage("O Senhor da Morte se ergue do trono, sua foice cortando o ar em um arco mortal!");
                    createFightButton(boss);
                    return true;
                }
            }
            return false;
        },

        // Handler de opção de diálogo, retorna TRUE se tratar tudo (impede engine de seguir)
        async onDialogueOption({ option, applyDamageToPlayer, addLogMessage }) {
            if (option.text === "Tentar fugir") {
                await addLogMessage("'COVARDIA É MORTE.' A foice da morte corta seu corpo e alma simultaneamente.", 800);
                await applyDamageToPlayer({ amount: "2D6", message: "A foice da morte fere profundamente sua alma!" });
                return true; // Impede o engine de executar efeitos/itens/etc para essa opção
            }
            return false; // Permite o engine seguir normalmente para outras opções
        }
    }
};
