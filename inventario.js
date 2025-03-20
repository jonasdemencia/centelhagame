let selectedItem = null; // Armazena o item selecionado 

// Seleciona os itens clicados no baú
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        // Limpa seleção anterior
        clearHighlights();

        // Define o novo item selecionado
        selectedItem = item;
        item.classList.add('selected');

        // Destaca os slots compatíveis
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight'); // Adiciona o destaque
            }
        });
    });
});

// Gerencia o clique nos slots
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
        // Verifica se há um item selecionado no baú
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            // Verifica se o slot já está ocupado
            if (slot.innerHTML !== slot.dataset.slot) {
                // Desequipa o item atual e devolve ao baú
                const equippedItemText = slot.innerHTML;

                const newItem = document.createElement("div"); // Cria novo item no baú
                newItem.classList.add("item");
                newItem.dataset.item = slot.dataset.slot;
                newItem.innerHTML = equippedItemText;

                document.querySelector(".items").appendChild(newItem); // Adiciona ao baú

                // Reaplica evento de clique ao novo item no baú
                newItem.addEventListener('click', () => {
                    clearHighlights();
                    selectedItem = newItem;
                    newItem.classList.add('selected');

                    document.querySelectorAll('.slot').forEach(s => {
                        if (s.dataset.slot === newItem.dataset.item) {
                            s.classList.add('highlight'); // Destaca os slots compatíveis
                        }
                    });
                });
            }

            // Equipa o novo item no slot
            slot.innerHTML = selectedItem.innerHTML; // Substitui o item
            selectedItem.remove(); // Remove o item do baú
            selectedItem = null; // Limpa a seleção
            clearHighlights();
        } else if (selectedItem === null && slot.innerHTML !== slot.dataset.slot) {
            // Caso o jogador deseje apenas desequipar manualmente sem nenhum item selecionado
            const itemText = slot.innerHTML;
            slot.innerHTML = slot.dataset.slot; // Reseta o slot ao estado original

            // Cria novo item no baú
            const newItem = document.createElement("div");
            newItem.classList.add("item");
            newItem.dataset.item = slot.dataset.slot;
            newItem.innerHTML = itemText;

            document.querySelector(".items").appendChild(newItem); // Adiciona ao baú

            // Reaplica evento de clique ao novo item
            newItem.addEventListener('click', () => {
                clearHighlights();
                selectedItem = newItem;
                newItem.classList.add('selected');

                document.querySelectorAll('.slot').forEach(s => {
                    if (s.dataset.slot === newItem.dataset.item) {
                        s.classList.add('highlight'); // Destaca slots compatíveis
                    }
                });
            });
        }
    });
});

// Adiciona funcionalidade ao botão de descarte
document.getElementById("discard-slot").addEventListener("click", () => {
    if (selectedItem) {
        selectedItem.remove(); // Remove o item selecionado
        selectedItem = null; // Limpa a seleção
        clearHighlights(); // Remove qualquer destaque residual
    }
});

// Função para limpar destaques visuais
function clearHighlights() {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
}
