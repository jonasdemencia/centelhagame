let selectedItem = null; // Armazena o item selecionado

// Adiciona evento de clique para selecionar um item do baú
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove seleção anterior
        document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));

        // Define o novo item selecionado
        selectedItem = item;
        item.classList.add('selected');

        // Destaca o slot compatível
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight'); // Aplica efeito visual
            }
        });
    });
});

// Adiciona evento de clique para equipar/desequipar um item ao clicar no slot compatível
document.querySelectorAll('.slot').forEach(slot => {
    const slotName = slot.innerText; // Guarda o nome original do slot

    slot.addEventListener('click', () => {
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            const equippedItem = slot.querySelector('.equipped-item');

            if (equippedItem) {
                // Se já houver um item equipado, ele volta para o baú
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

                // Remove o item anterior do slot
                equippedItem.remove();
            }

            // Equipa o novo item no slot
            const equippedItem = document.createElement("div");
            equippedItem.classList.add("equipped-item");
            equippedItem.dataset.item = selectedItem.dataset.item;
            equippedItem.innerHTML = selectedItem.innerHTML;

            slot.innerHTML = ""; // Remove o nome do slot
            slot.appendChild(equippedItem);
            selectedItem.remove(); // Remove do baú
            selectedItem = null; // Limpa a seleção

            // Remove os efeitos visuais
            document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
        } else if (!selectedItem) {
            // Desequipar o item se não houver item selecionado no baú
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

                // Remove o item do slot e restaura o nome original do slot
                equippedItem.remove();
                slot.innerText = slotName;
            }
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
