class DiceIcon extends HTMLElement {
    constructor() {
        super();
        this.setupElement();
        this.setupListeners();
    }

    setupElement() {
        const sides = this.getAttribute('sides');
        this.innerHTML = `
            <button class="increment">+</button>
            <div class="icon">${sides}
                <svg viewBox="0 0 12 12">
                    <use xlink:href="#d${sides}-icon"></use>
                </svg>
            </div>
            <button class="decrement" disabled>-</button>
        `;
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrement');
        
        incrementBtn.addEventListener('click', () => {
            // Desabilita todos os outros botões +
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            // Aqui você poderá adicionar a lógica para carregar seu dado 3D
            const sides = this.getAttribute('sides');
            console.log(`Dado D${sides} selecionado`);
        });

        decrementBtn.addEventListener('click', () => {
            // Reabilita todos os botões +
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = false);
            
            decrementBtn.disabled = true;
            
            // Aqui você poderá adicionar a lógica para remover seu dado 3D
            console.log('Dado removido');
        });
    }
}

customElements.define('dice-icon', DiceIcon);
