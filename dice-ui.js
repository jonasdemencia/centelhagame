class DiceIcon extends HTMLElement {
    constructor() {
        super();
        const sides = this.getAttribute('sides');
        this.innerHTML = `
            <button class="increment">+</button>
            <div class="icon">${sides}</div>
            <button class="decrement" disabled>-</button>
        `;
        
        this.setupListeners();
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrement');
        
        incrementBtn.addEventListener('click', () => {
            // Desabilita todos os outros botões +
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            // Aqui você pode adicionar a lógica para carregar seu dado 3D
            const sides = this.getAttribute('sides');
            console.log(`Dado D${sides} selecionado`);
        });

        decrementBtn.addEventListener('click', () => {
            // Reabilita todos os botões +
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = false);
            
            decrementBtn.disabled = true;
            
            // Aqui você pode adicionar a lógica para remover seu dado 3D
            console.log('Dado removido');
        });
    }
}

customElements.define('dice-icon', DiceIcon);