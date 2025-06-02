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
        },

        // Novo handler: aplica dano se o jogador tenta fugir do Senhor da Morte
        async onDialogueOption({ option, applyDamageToPlayer, addLogMessage }) {
            if (option.text === "Tentar fugir") {
                // Mensagem customizada (opcional)
                await addLogMessage("A foice da morte fere profundamente sua alma!", 800);
                // Aplica o dano de 2D6
                await applyDamageToPlayer({ amount: "2D6", message: null });
            }
        }
    }
};
