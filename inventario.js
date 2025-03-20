let selectedItem = null; // Armazena o item selecionado

// Seleciona os itens clicados
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove a seleção anterior
        document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));

        // Define o novo item selecionado
        selectedItem = item;
        item.classList.add('selected');

        // Destaca os slots compatíveis
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight');
            } else {
                slot.classList.remove('highlight');
            }
        });
    });
});

// Permite equipar ou trocar um item ao clicar no slot
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            if (slot.innerHTML !== slot.dataset.slot) {
                // Se o slot já tem um item, ele retorna para o baú
                const previousItemText = slot.innerHTML;

                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = slot.dataset.slot;
                newItem.innerHTML = previousItemText;

                document.querySelector(".items").appendChild(newItem);

                // Adiciona evento de clique ao novo item
                newItem.addEventListener('click', () => {
                    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
                    selectedItem = newItem;
                    newItem.classList.add('selected');
                });
            }

            // Equipa o novo item
            slot.innerHTML = selectedItem.innerHTML;
            selectedItem.remove(); // Remove do baú
            selectedItem = null; // Limpa a seleção

            // Remove os efeitos visuais
            document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
        }
    });
});

// Adicionando funcionalidade de descarte
document.getElementById("discard-slot").addEventListener("click", () => {
    if (selectedItem) {
        selectedItem.remove();
        selectedItem = null;
    }
});
