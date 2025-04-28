let db;
let equippedDice = null;

function initializeModule(firestoreInstance) {
    db = firestoreInstance;
}

function setupDiceUIToggle() {
    const diceSection = document.getElementById('dice-section');
    const toggleButton = document.getElementById('toggle-dice-ui');
    
    toggleButton?.addEventListener('click', () => {
        diceSection.classList.toggle('visible');
        toggleButton.classList.toggle('active');
    });
}

class DiceIcon extends HTMLElement {
    constructor() {
        super();
        this.setupElement();
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

        this.updateState();
        this.setupListeners();
    }

    updateState() {
        if (!equippedDice) return;

        const sides = this.getAttribute('sides');
        const diceType = `D${sides}`;
        const diceEquipped = equippedDice[diceType];

        const incrementBtn = this.querySelector('.increment');
        const icon = this.querySelector('.icon');

        if (!diceEquipped) {
            // Dado não equipado
            incrementBtn.disabled = true;
            icon.classList.add('disabled');
        } else {
            // Dado equipado
            incrementBtn.disabled = false;
            icon.classList.remove('disabled');
            // Adiciona o nome do dado como título
            this.setAttribute('title', diceEquipped.name);
        }
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrementet');
        
        incrementBtn?.addEventListener('click', () => {
            if (!this.isEnabled()) return;

            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            const sides = this.getAttribute('sides');
            const diceType = `D${sides}`;
            const diceData = equippedDice[diceType];
            
            console.log(`Dado ${diceData.name} (D${sides}) selecionado`);
            // Aqui você pode adicionar a lógica para carregar o dado 3D
        });

        decrementBtn?.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => {
                    // Só reabilita os botões de dados equipados
                    const diceIcon = btn.closest('dice-icon');
                    const sides = diceIcon.getAttribute('sides');
                    const diceType = `D${sides}`;
                    if (equippedDice[diceType]) {
                        btn.disabled = false;
                    }
                });
            
            decrementBtn.disabled = true;
            console.log('Dado removido');
            // Aqui você pode adicionar a lógica para remover o dado 3D
        });
    }

    isEnabled() {
        const sides = this.getAttribute('sides');
        const diceType = `D${sides}`;
        return equippedDice && equippedDice[diceType];
    }
}

// Registra o componente
customElements.define('dice-icon', DiceIcon);

// Função para carregar dados equipados
async function loadEquippedDice(uid) {
    if (!db || !uid) return;

    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        
        if (playerSnap.exists() && playerSnap.data().diceStorage?.equipped) {
            equippedDice = playerSnap.data().diceStorage.equipped;
            
            // Atualiza todos os ícones de dados
            document.querySelectorAll('dice-icon').forEach(icon => {
                icon.updateState();
            });
        }
    } catch (error) {
        console.error("Erro ao carregar dados equipados:", error);
    }
}

document.addEventListener('DOMContentLoaded', setupDiceUIToggle);

export { loadEquippedDice, initializeModule };
