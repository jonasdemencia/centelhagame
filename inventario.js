// Sincroniza itens do baú e equipados no Firestore
async function saveInventoryData(uid) {
    const inventoryData = {
        itemsInChest: Array.from(document.querySelectorAll('.item')).map(item => ({
            id: item.dataset.item, // ID do item
            content: item.innerHTML // Conteúdo visual do item (emoji ou texto)
        })),
        equippedItems: Array.from(document.querySelectorAll('.slot')).reduce((acc, slot) => {
            acc[slot.dataset.slot] = slot.innerHTML !== slot.dataset.slot ? slot.innerHTML : null;
            return acc;
        }, {})
    };

    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, { inventory: inventoryData }, { merge: true });
        console.log("Inventário salvo com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar o inventário:", error);
    }
}

// Recupera itens do baú e equipados do Firestore
async function loadInventoryData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists() && playerSnap.data().inventory) {
            const inventoryData = playerSnap.data().inventory;

            // Carrega itens no baú
            const chestElement = document.querySelector('.items');
            chestElement.innerHTML = ""; // Limpa o conteúdo atual
            inventoryData.itemsInChest.forEach(item => {
                const newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.item = item.id;
                newItem.innerHTML = item.content;

                chestElement.appendChild(newItem);

                // Reaplica evento de clique no item do baú
                newItem.addEventListener('click', () => {
                    clearHighlights();
                    selectedItem = newItem;
                    newItem.classList.add('selected');

                    document.querySelectorAll('.slot').forEach(slot => {
                        if (slot.dataset.slot === newItem.dataset.item) {
                            slot.classList.add('highlight');
                        }
                    });
                });
            });

            // Carrega itens equipados
            document.querySelectorAll('.slot').forEach(slot => {
                const equippedItem = inventoryData.equippedItems[slot.dataset.slot];
                slot.innerHTML = equippedItem || slot.dataset.slot;
            });

            console.log("Inventário carregado com sucesso!");
        } else {
            console.log("Nenhum inventário encontrado para este jogador.");
        }
    } catch (error) {
        console.error("Erro ao carregar o inventário:", error);
    }
}

// Adiciona sincronização ao inventário ao alterar qualquer coisa
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
            await loadInventoryData(user.uid); // Carrega o inventário ao iniciar

            // Salva automaticamente o inventário quando algo é alterado
            document.querySelector('.inventory').addEventListener('click', () => {
                saveInventoryData(user.uid);
            });
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});
