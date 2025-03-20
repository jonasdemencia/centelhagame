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
    const slotName = slot.innerText; // Guarda o nome original do slot

    slot.addEventListener('click', () => {
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            const existingItem = slot.querySelector('.equipped-item');

            if (existingItem) {
                // Se já houver um item equipado, devolve ao baú
                const newItem = document.createElement("div");
                newItem.classList.add("item");
                newItem.dataset.item = existingItem.dataset.item;
                newItem.innerHTML = existingItem.innerHTML;

                document.querySelector(".items").appendChild(newItem);

                // Adiciona evento de clique ao novo item
                newItem.addEventListener('click', () => {
                    document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
                    selectedItem = newItem;
                    newItem.classList.add('selected');
                });

                // Remove o item anterior do slot
                existingItem.remove();
            }

            // Equipa o novo item dentro do slot
            const equippedItem = document.createElement("div");
            equippedItem.classList.add("equipped-item");
            equippedItem.dataset.item = selectedItem.dataset.item;
            equippedItem.innerHTML = selectedItem.innerHTML;

            slot.innerText = ""; // Remove o nome do slot ao equipar
            slot.appendChild(equippedItem);
            selectedItem.remove(); // Remove do baú
            selectedItem = null; // Limpa a seleção

            // Remove os efeitos visuais
            document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
        }
    });

    // Permite desequipar um item ao clicar no slot
    slot.addEventListener('click', () => {
        const equippedItem = slot.querySelector('.equipped-item');

        if (equippedItem) {
            // Cria um novo item no baú
            const newItem = document.createElement("div");
            newItem.classList.add("item");
            newItem.dataset.item = equippedItem.dataset.item;
            newItem.innerHTML = equippedItem.innerHTML;

            document.querySelector(".items").appendChild(newItem);

            // Adiciona evento de clique ao novo item
            newItem.addEventListener('click', () => {
                document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
                selectedItem = newItem;
                newItem.classList.add('selected');
            });

            // Remove o item do slot e retorna o nome original do slot
            equippedItem.remove();
            slot.innerText = slotName; // Restaura o nome do slot
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
