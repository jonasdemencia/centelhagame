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
        
        this.setDisabled(true);
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrement');
        
        incrementBtn?.addEventListener('click', () => {
            if (!this.hasAttribute('data-equipped')) return;
            
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            const sides = this.getAttribute('sides');
            const name = this.getAttribute('data-dice-name');
            
            if (sides === '6' && name === 'Dado de Marfim (D6)') {
                const tableTop = document.getElementById('table-top');
                if (tableTop) {
                    tableTop.innerHTML = `
                        <iframe src="dado.html" 
                                style="width: 100%; height: 100%; border: none; position: absolute;">
                        </iframe>
                    `;
                    
                    const controls = document.getElementById('controls');
                    const rollButton = document.createElement('button');
                    rollButton.id = 'roll-dice-button';
                    rollButton.textContent = 'Rolar Dado';
                    controls.appendChild(rollButton);

                    // Adiciona o estilo do botão igual ao do dado.html
                    rollButton.style.cssText = `
                        padding: 12px 25px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        background: linear-gradient(145deg, #5a5a5a, #3a3a3a);
                        border: none;
                        border-radius: 8px;
                        color: #e0e0e0;
                        text-shadow: 0px 1px 2px rgba(0,0,0,0.5);
                        box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5),
                                    inset 0px 1px 1px rgba(255,255,255,0.2);
                        transition: transform 0.15s ease, background 0.2s ease;
                    `;
                }
            }
        });

        decrementBtn?.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => {
                    const diceIcon = btn.closest('dice-icon');
                    if (diceIcon?.hasAttribute('data-equipped')) {
                        btn.disabled = false;
                    }
                });
            
            const tableTop = document.getElementById('table-top');
            if (tableTop) tableTop.innerHTML = '';
            
            const rollButton = document.getElementById('roll-dice-button');
            if (rollButton) rollButton.remove();
            
            decrementBtn.disabled = true;
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

export { loadEquippedDice, initializeModule };
