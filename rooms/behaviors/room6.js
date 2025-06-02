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

        async onDialogueOption({ option, applyDamageToPlayer, addLogMessage }) {
    console.log("[DEBUG BEHAVIOR] Entrou no handler onDialogueOption");
    if (option.text.trim() === "Tentar fugir") {
        console.log("[DEBUG BEHAVIOR] Opção é Tentar fugir, vai aplicar dano!");
        await addLogMessage("'COVARDIA É MORTE.' A foice da morte corta seu corpo e alma simultaneamente.", 800);
        await applyDamageToPlayer({ amount: "2D6", message: "A foice da morte fere profundamente sua alma!" });
        return true;
    }
    return false;
}
    }
};
