import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let db;

function initializeModule(firestoreInstance) {
    db = firestoreInstance;
}

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
        
        // Estado inicial: desabilitado
        this.setDisabled(true);
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrement');
        
        incrementBtn?.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            const sides = this.getAttribute('sides');
            const name = this.getAttribute('data-dice-name'); // Nome do dado equipado
            console.log(`Dado ${name} (D${sides}) selecionado`);
        });

        decrementBtn?.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => {
                    const diceIcon = btn.closest('dice-icon');
                    if (diceIcon?.hasAttribute('data-equipped')) {
                        btn.disabled = false;
                    }
                });
            
            decrementBtn.disabled = true;
            console.log('Dado removido');
        });
    }

    setDisabled(disabled) {
        const incrementBtn = this.querySelector('.increment');
        const icon = this.querySelector('.icon');
        
        if (disabled) {
            incrementBtn.disabled = true;
            icon.classList.add('disabled');
            this.removeAttribute('data-equipped');
            this.removeAttribute('data-dice-name');
        } else {
            incrementBtn.disabled = false;
            icon.classList.remove('disabled');
            this.setAttribute('data-equipped', 'true');
        }
    }
}

customElements.define('dice-icon', DiceIcon);

async function loadEquippedDice(uid) {
    if (!db || !uid) {
        console.error("Firestore não inicializado ou UID não fornecido");
        return;
    }

    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        
        if (!playerSnap.exists() || !playerSnap.data().diceStorage?.equipped) {
            console.log("Nenhum dado equipado encontrado");
            return;
        }

        const equippedDice = playerSnap.data().diceStorage.equipped;
        
        // Atualiza cada ícone de dado
        document.querySelectorAll('dice-icon').forEach(diceIcon => {
            const sides = diceIcon.getAttribute('sides');
            const diceType = `D${sides}`;
            const equippedDie = equippedDice[diceType];

            if (equippedDie) {
                diceIcon.setDisabled(false);
                diceIcon.setAttribute('data-dice-name', equippedDie.name);
                diceIcon.setAttribute('title', equippedDie.name);
            } else {
                diceIcon.setDisabled(true);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar dados equipados:", error);
    }
}

function setupDiceUIToggle() {
    const diceSection = document.getElementById('dice-section');
    const toggleButton = document.getElementById('toggle-dice-ui');
    
    toggleButton?.addEventListener('click', () => {
        diceSection.classList.toggle('visible');
        toggleButton.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', setupDiceUIToggle);

export { loadEquippedDice, initializeModule };
