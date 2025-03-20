let selectedItem = null; // Armazena o item selecionado 

// Seleciona os itens clicados
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove a seleção anterior
        document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight')); // Remove o highlight dos slots

        // Define o novo item selecionado
        selectedItem = item;
        item.classList.add('selected');

        // Destaca os slots compatíveis (muda a cor para azul)
        document.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.slot === item.dataset.item) {
                slot.classList.add('highlight'); // Adiciona classe de destaque
            }
        });
    });
});

// Permite equipar um item clicando em um slot
document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
        if (selectedItem && slot.dataset.slot === selectedItem.dataset.item) {
            slot.innerHTML = selectedItem.innerHTML; // Equipa o item
            selectedItem.remove(); // Remove do baú
            selectedItem = null; // Limpa a seleção
            
            // Remove os efeitos visuais
            document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
        } else if (slot.innerHTML !== slot.dataset.slot) {
            // Desequipa e devolve para o baú
            const itemText = slot.innerHTML;
            slot.innerHTML = slot.dataset.slot;

            // Cria um novo item no baú
            const newItem = document.createElement("div");
            newItem.classList.add("item");
            newItem.dataset.item = slot.dataset.slot;
            newItem.innerHTML = itemText;
            
            document.querySelector(".items").appendChild(newItem);
            
            // Adiciona o evento de clique novamente ao novo item
            newItem.addEventListener('click', () => {
                document.querySelectorAll('.item').forEach(i => i.classList.remove('selected'));
                selectedItem = newItem;
                newItem.classList.add('selected');
            });
        }
    });
});

// Adicionando funcionalidade de descarte
document.getElementById("discard-slot").addEventListener("click", () => {
    if (selectedItem) {
        selectedItem.remove();
        selectedItem = null;
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight')); // Remove o highlight ao descartar
    }
});
