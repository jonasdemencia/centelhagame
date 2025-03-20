const items = document.querySelectorAll('.item');
const slots = document.querySelectorAll('.slot');

// Permitir que os itens sejam arrastáveis
items.forEach(item => {
    item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData("text/plain", event.target.id);
    });
});

// Permitir que os slots aceitem os itens
slots.forEach(slot => {
    slot.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    slot.addEventListener('drop', (event) => {
        event.preventDefault();
        const itemId = event.dataTransfer.getData("text/plain");
        const item = document.getElementById(itemId);

        // Adiciona o item no slot apenas se ele estiver vazio
        if (slot.innerHTML === slot.dataset.default) {
            slot.innerHTML = '';
            slot.appendChild(item);
        }
    });
});
