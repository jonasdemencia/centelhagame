let selectedItem = null; // Armazena o item selecionado 

// Seleciona os itens clicados
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove a seleção anterior
        clearHighlights();

        // Define o novo item selecionado
        selectedItem = item;
        item.classList.add('selected');

        // Destaca os slots compatíveis
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight'); // Adiciona classe de destaque
            }
        });
    });
});

// Permite equipar ou desequipar itens ao clicar nos slots
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            // Caso o slot esteja vazio: equipa o item
            if (slot.innerHTML === slot.dataset.slot) {
                slot.innerHTML = selectedItem.innerHTML; // Equipa o item
                selectedItem.remove(); // Remove do baú
                selectedItem = null; // Limpa a seleção
                clearHighlights();
            }
        } else if (slot.innerHTML !== slot.dataset.slot) {
            // Caso o slot já tenha um item: desequipa e devolve ao baú
            const itemText = slot.innerHTML; // Recupera o texto do item equipado
            slot.innerHTML = slot.dataset.slot; // Reseta o slot ao estado original

            // Cria um novo item no baú
            const newItem = document.createElement("div");
            newItem.classList.add("item");
            newItem.dataset.item = slot.dataset.slot;
            newItem.innerHTML = itemText;

            document.querySelector(".items").appendChild(newItem); // Adiciona ao baú

            // Adiciona evento de clique ao novo item
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
