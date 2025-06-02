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
            // Só ativa o boss se estiver pronto para lutar e não finalizou a batalha
            if (room.explorationState?.readyToFight && !room.explorationState?.finalBattleComplete) {
                const boss = room.enemies?.find(e => e.id === "senhor-da-morte");
                if (boss) {
                    await addLogMessage("O Senhor da Morte se ergue do trono, sua foice cortando o ar em um arco mortal!");
                    createFightButton(boss);
                    return true;
                }
            }
            // NÃO cria o boss por padrão, impede trigger precoce
            return false;
        }
    }
};
