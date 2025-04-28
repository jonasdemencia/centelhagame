// Importações do Firebase necessárias
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Vamos criar uma variável para armazenar a instância do db
let db;

// Função para inicializar o módulo com a instância do Firestore
function initializeModule(firestoreInstance) {
    db = firestoreInstance;
}
// Classe DiceIcon
class DiceIcon extends HTMLElement {
    constructor() {
        super();
        const sides = this.getAttribute('sides');
        const name = this.getAttribute('name');
        this.innerHTML = `
            <button class="increment">+</button>
            <div class="icon">${sides}
                <svg viewBox="0 0 12 12">
                    <use xlink:href="#d${sides}-icon"></use>
                </svg>
            </div>
            <button class="decrement" disabled>-</button>
            <div class="dice-name">${name}</div>
        `;
        
        this.setupListeners();
    }

    setupListeners() {
        const incrementBtn = this.querySelector('.increment');
        const decrementBtn = this.querySelector('.decrement');
        
        incrementBtn.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = true);
            
            decrementBtn.disabled = false;
            
            const sides = this.getAttribute('sides');
            const name = this.getAttribute('name');
            console.log(`Dado ${name} (D${sides}) selecionado`);
        });

        decrementBtn.addEventListener('click', () => {
            document.querySelectorAll('dice-icon .increment')
                .forEach(btn => btn.disabled = false);
            
            decrementBtn.disabled = true;
            console.log('Dado removido');
        });
    }
}

// Função para carregar dados equipados
async function loadEquippedDice(uid) {
    if (!db) {
        console.error("Firestore não foi inicializado. Chame initializeModule primeiro.");
        return;
    }

    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        
        if (playerSnap.exists() && playerSnap.data().diceStorage) {
            const diceState = playerSnap.data().diceStorage;
            
            if (diceState.equipped) {
                const equippedDice = Object.values(diceState.equipped)
                    .filter(dice => dice !== null);
                
                updateDiceUI(equippedDice);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados equipados:", error);
    }
}

// Função para atualizar a UI dos dados
function updateDiceUI(equippedDice) {
    const diceSection = document.getElementById('dice-section');
    const tableTop = document.getElementById('table-top');
    const controls = document.getElementById('controls');
    
    if (!controls) return;
    
    controls.innerHTML = '';
    
    equippedDice.forEach(dice => {
        if (dice && dice.type && dice.name) {
            const diceIcon = document.createElement('dice-icon');
            diceIcon.setAttribute('sides', dice.type.replace('D', ''));
            diceIcon.setAttribute('name', dice.name);
            controls.appendChild(diceIcon);
        }
    });
}

// Registra o componente personalizado
customElements.define('dice-icon', DiceIcon);

export { loadEquippedDice, updateDiceUI, initializeModule };
