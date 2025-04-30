import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let db;

// Configurações do Dado
const DICE_CONFIG = {
    ROLL_STEP_SIZE: 90,
    MOVEMENT_PER_ROTATION: 100,
    MIN_VELOCITY: 3.5,
    ROTATION_SPEED: 2,
    PRECISE_ROTATION_ANGLE: 90,
    FRICTION: 0.98,
    WALL_BOUNCE_DAMPENING: 0.5,
    EDGE_BOUNCE_MULTIPLIER: 1.0,
    REBOUND_FORCE: 1.5,
    MAX_VELOCITY: 25,
    COLLISION_COOLDOWN: 300,
    MAX_PRESS_DURATION: 4000,
    DICE_SIZE: 50,
    INITIAL_FORCE_MULTIPLIER: 35,
    LATERAL_FORCE_RANGE: 8,
    ROTATION_CHANGE_ANGLE: 45,
    SCALE: {
        MIN: 0.8,
        MAX: 2.0,
        FLIGHT: 1.5,
        BOUNCE: 1.3
    }
};

// Estado global do dado
let diceState = {
    isRolling: false,
    pressStartTime: 0,
    currentRotation: { x: 0, y: 0, z: 0 },
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,
    targetScale: 1.0,
    currentScale: 1.0,
    phase: 'ready',
    flightTime: 0,
    bounceCount: 0,
    rollAngle: 0,
    rotationDirection: 1,
    lastCollisionTime: 0,
    faceSequence: [1, 2, 6, 5],
    currentFaceSequence: [1, 2, 6, 5]
};

// Funções auxiliares do dado
function getTopFaceFromRotation(x, y, z) {
    // Código da função original
}

function determineRotationAxis() {
    return Math.random() < 0.5 ? 'z' : 'x';
}

function changeRotationOnCollision(isVerticalCollision) {
    // Código da função original
}

function updateDiceVisual(diceContainer, diceElement) {
    // Código adaptado da função original
    diceContainer.style.left = `${diceState.posX}px`;
    diceContainer.style.top = `${diceState.posY}px`;
    
    diceState.currentScale += (diceState.targetScale - diceState.currentScale) * 0.2;
    
    const { x, y, z } = diceState.currentRotation;
    diceElement.style.transform = `
        scale(${diceState.currentScale})
        rotateX(${x}deg)
        rotateY(${y}deg)
        rotateZ(${z}deg)
    `;
}

function simulateHeight(time, initialVelocity) {
    const height = Math.sin(time * Math.PI) * initialVelocity;
    return Math.max(0, height);
}

function rollDiceWithPhysics(diceContainer, diceElement, rollButton, resultDisplay = null) {
    if (diceState.isRolling) return;

    rollButton.disabled = true;
    rollButton.style.transform = '';

    const pressDuration = Math.min(Date.now() - diceState.pressStartTime, DICE_CONFIG.MAX_PRESS_DURATION);
    const forceFactor = pressDuration / DICE_CONFIG.MAX_PRESS_DURATION;

    diceState.isRolling = true;
    diceState.phase = 'throwing';

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.4;
    const dirX = centerX - window.innerWidth / 2;
    const dirY = centerY - (window.innerHeight - 50);

    const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedX = (dirX / magnitude) + (Math.random() - 0.5) * 0.3;
    const normalizedY = (dirY / magnitude);

    const force = DICE_CONFIG.INITIAL_FORCE_MULTIPLIER * (0.5 + forceFactor * 0.5);
    diceState.velocityX = normalizedX * force;
    diceState.velocityY = normalizedY * force;

    diceState.posX = window.innerWidth / 2;
    diceState.posY = window.innerHeight - 50;
    diceState.currentRotation = { x: 0, y: 0, z: 0 };
    diceState.flightTime = 0;
    diceState.currentScale = DICE_CONFIG.SCALE.MIN;
    diceState.targetScale = DICE_CONFIG.SCALE.FLIGHT;
    diceState.rotationDirection = 1;
    diceState.currentFaceSequence = [...diceState.faceSequence];

    requestAnimationFrame(() =>
        animateDice(diceContainer, diceElement, resultDisplay, rollButton)
    );
}


function animateDice(diceContainer, diceElement, resultDisplay, rollButton) {
    if (!diceState.isRolling) return;

    switch (diceState.phase) {
        case 'throwing':
            diceState.posX += diceState.velocityX;
            diceState.posY += diceState.velocityY;

            diceState.flightTime += 0.05;
            const height = simulateHeight(diceState.flightTime, 1);
            diceState.targetScale = DICE_CONFIG.SCALE.MIN + (height * (DICE_CONFIG.SCALE.MAX - DICE_CONFIG.SCALE.MIN));

            diceState.currentRotation.x += diceState.velocityX * DICE_CONFIG.ROTATION_SPEED * diceState.rotationDirection;
            diceState.currentRotation.y += diceState.velocityY * DICE_CONFIG.ROTATION_SPEED * diceState.rotationDirection;

            if (diceState.posX <= 0 || diceState.posX >= window.innerWidth - DICE_CONFIG.DICE_SIZE) {
                diceState.posX = diceState.posX <= 0 ? 0 : window.innerWidth - DICE_CONFIG.DICE_SIZE;
                changeRotationOnCollision(false);
            }

            if (diceState.posY <= 0 || diceState.posY >= window.innerHeight - DICE_CONFIG.DICE_SIZE) {
                diceState.posY = diceState.posY <= 0 ? 0 : window.innerHeight - DICE_CONFIG.DICE_SIZE;
                changeRotationOnCollision(true);
            }

            if (diceState.flightTime >= 1) {
                diceState.phase = 'bouncing';
                diceState.bounceCount = Math.floor(Math.abs(diceState.velocityX) * 2) + 3;
                diceState.flightTime = 0;
            }
            break;

        case 'bouncing':
            diceState.posX += diceState.velocityX;
            diceState.posY += diceState.velocityY;
            diceState.velocityX *= DICE_CONFIG.FRICTION;
            diceState.velocityY *= DICE_CONFIG.FRICTION;

            diceState.flightTime += 0.1;
            const bounceHeight = Math.sin(diceState.flightTime * Math.PI) * (DICE_CONFIG.SCALE.BOUNCE / (diceState.bounceCount + 1));
            diceState.targetScale = DICE_CONFIG.SCALE.MIN + bounceHeight;

            if (diceState.posX <= 0 || diceState.posX >= window.innerWidth - DICE_CONFIG.DICE_SIZE) {
                diceState.posX = diceState.posX <= 0 ? 0 : window.innerWidth - DICE_CONFIG.DICE_SIZE;
                changeRotationOnCollision(false);
            }

            if (diceState.posY <= 0 || diceState.posY >= window.innerHeight - DICE_CONFIG.DICE_SIZE) {
                diceState.posY = diceState.posY <= 0 ? 0 : window.innerHeight - DICE_CONFIG.DICE_SIZE;
                changeRotationOnCollision(true);
            }

            if (diceState.flightTime >= 1) {
                diceState.bounceCount--;
                diceState.flightTime = 0;
                diceState.currentRotation.x += 90 * diceState.rotationDirection;

                if (diceState.bounceCount <= 0) {
                    diceState.phase = 'rolling';
                    diceState.rollAngle = diceState.currentRotation.x;
                    diceState.velocityX *= 2;
                }
            }
            break;

        case 'rolling':
            diceState.posX += diceState.velocityX;
            diceState.velocityX *= DICE_CONFIG.FRICTION;

            const distanceMoved = Math.abs(diceState.velocityX);
            const rotationProgress = (distanceMoved / DICE_CONFIG.MOVEMENT_PER_ROTATION) * DICE_CONFIG.ROLL_STEP_SIZE;
            diceState.rollAngle += rotationProgress * diceState.rotationDirection;
            diceState.currentRotation.x = Math.round(diceState.rollAngle / DICE_CONFIG.ROLL_STEP_SIZE) * DICE_CONFIG.ROLL_STEP_SIZE;

            if (diceState.posY > window.innerHeight - DICE_CONFIG.DICE_SIZE) {
                diceState.posY = window.innerHeight - DICE_CONFIG.DICE_SIZE;
            }

            diceState.targetScale = DICE_CONFIG.SCALE.MIN;

            if (diceState.posX <= 0 || diceState.posX >= window.innerWidth - DICE_CONFIG.DICE_SIZE) {
                diceState.posX = diceState.posX <= 0 ? 0 : window.innerWidth - DICE_CONFIG.DICE_SIZE;

                if (Math.abs(diceState.velocityX) > DICE_CONFIG.MIN_VELOCITY * 2) {
                    changeRotationOnCollision(false);
                    diceState.velocityX *= DICE_CONFIG.WALL_BOUNCE_DAMPENING;
                } else {
                    diceState.velocityX = 0;
                    diceState.phase = 'stopped';
                    diceState.isRolling = false;
                }
            }

            diceState.velocityX = Math.sign(diceState.velocityX) *
                Math.min(Math.abs(diceState.velocityX), DICE_CONFIG.MAX_VELOCITY);

            if (Math.abs(diceState.velocityX) < DICE_CONFIG.MIN_VELOCITY) {
                const misalignedX = diceState.currentRotation.x % 90;
                const misalignedY = diceState.currentRotation.y % 90;
                const misalignedZ = diceState.currentRotation.z % 90;

                const isMisaligned = (
                    (misalignedX > 2 && misalignedX < 88) ||
                    (misalignedY > 2 && misalignedY < 88) ||
                    (misalignedZ > 2 && misalignedZ < 88)
                );

                if (isMisaligned) {
                    diceState.bounceCount = 1;
                    diceState.velocityX = DICE_CONFIG.MIN_VELOCITY * (Math.random() < 0.5 ? 1 : -1);
                    diceState.velocityY = -DICE_CONFIG.MIN_VELOCITY * 0.5;
                    diceState.flightTime = 0;
                    diceState.phase = 'bouncing';
                    return;
                }

                const finalX = Math.round(diceState.currentRotation.x / DICE_CONFIG.ROLL_STEP_SIZE) * DICE_CONFIG.ROLL_STEP_SIZE;
                const finalY = Math.round(diceState.currentRotation.y / DICE_CONFIG.ROLL_STEP_SIZE) * DICE_CONFIG.ROLL_STEP_SIZE;
                const finalZ = Math.round(diceState.currentRotation.z / DICE_CONFIG.ROLL_STEP_SIZE) * DICE_CONFIG.ROLL_STEP_SIZE;

                diceState.currentRotation.x = finalX;
                diceState.currentRotation.y = finalY;
                diceState.currentRotation.z = finalZ;

                diceState.velocityX = 0;
                diceState.phase = 'stopped';
                diceState.isRolling = false;

                const finalResult = getTopFaceFromRotation(finalX, finalY, finalZ);
                if (resultDisplay) {
                    resultDisplay.textContent = `Resultado: ${finalResult}`;
                }
                if (rollButton) {
                    rollButton.disabled = false;
                }

                console.log(`ANGULOS FINAIS -> X: ${finalX}, Y: ${finalY}, Z: ${finalZ} --- RESULTADO CALCULADO: ${finalResult}`);
            }
            break;
    }

    updateDiceVisual(diceContainer, diceElement);

    if (diceState.isRolling) {
        requestAnimationFrame(() =>
            animateDice(diceContainer, diceElement, resultDisplay, rollButton)
        );
    }
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
                // Criar container do dado na página
                const diceContainer = document.createElement('div');
                diceContainer.id = 'simulation-container';
                diceContainer.innerHTML = `
                    <div class="dice-perspective-container" id="dice-visual-container">
                        <div class="dice" id="dice">
                            <div class="face front">1</div>
                            <div class="face back">6</div>
                            <div class="face right">4</div>
                            <div class="face left">3</div>
                            <div class="face top">5</div>
                            <div class="face bottom">2</div>
                        </div>
                    </div>
                `;

                // Adicionar estilos do dado
                const styleElement = document.createElement('style');
                styleElement.setAttribute('data-dice-styles', '');
                styleElement.textContent = `
                    #simulation-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1000;
}

                    
                    .dice-perspective-container {
                        perspective: 1200px;
                        width: 50px;
                        height: 50px;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    
                    .dice {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        transform-style: preserve-3d;
                        transition: transform 0.4s ease-out;
                    }
                    
                    .face {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border-radius: 10px;
                        border: 1px solid rgba(0, 0, 0, 0.2);
                        box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3),
                                   0px 8px 15px rgba(0, 0, 0, 0.3);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-family: "Eagle Lake", cursive;
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: rgba(0, 0, 0, 0.6);
                        text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3),
                                   -1px -1px 1px rgba(0, 0, 0, 0.4);
                        background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.15)),
                                  #6a7a7a;
                        backface-visibility: hidden;
                    }
                    
                    .face.front  { transform: rotateY(  0deg) translateZ(25px); }
                    .face.back   { transform: rotateX(180deg) translateZ(25px); }
                    .face.right  { transform: rotateY( 90deg) translateZ(25px); }
                    .face.left   { transform: rotateY(-90deg) translateZ(25px); }
                    .face.top    { transform: rotateX( 90deg) translateZ(25px); }
                    .face.bottom { transform: rotateX(-90deg) translateZ(25px); }
                `;
                
                document.head.appendChild(styleElement);
                document.body.appendChild(diceContainer);
                
                // Adicionar botão no UI
                const rollButton = document.createElement('button');
rollButton.id = 'roll-dice-button';
rollButton.textContent = 'Rolar Dado';
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

// Verifica se o container existe, senão cria
let controls = document.querySelector('.controls');
if (!controls) {
    console.warn('Elemento ".controls" não encontrado. Criando um automaticamente.');
    controls = document.createElement('div');
    controls.className = 'controls';
    controls.style.position = 'fixed';
    controls.style.bottom = '20px';
    controls.style.left = '50%';
    controls.style.transform = 'translateX(-50%)';
    controls.style.zIndex = '1001';
    document.body.appendChild(controls);
}

// Agora sim, adiciona o botão ao container garantido
controls.appendChild(rollButton);



                // Configurar eventos do dado
                const diceElement = diceContainer.querySelector('#dice');
                const diceVisualContainer = diceContainer.querySelector('#dice-visual-container');
                
                // Resetar estado do dado
                Object.assign(diceState, {
                    isRolling: false,
                    pressStartTime: 0,
                    currentRotation: { x: 0, y: 0, z: 0 },
                    posX: window.innerWidth / 2,
                    posY: window.innerHeight / 2,
                    velocityX: 0,
                    velocityY: 0,
                    targetScale: 1.0,
                    currentScale: 1.0,
                    phase: 'ready',
                    flightTime: 0,
                    bounceCount: 0,
                    rollAngle: 0,
                    rotationDirection: 1
                });

                // Configurar eventos do botão
                rollButton.addEventListener('mousedown', () => {
                    if (diceState.isRolling) return;
                    diceState.pressStartTime = Date.now();
                    rollButton.style.transform = 'scale(0.95)';
                });

                rollButton.addEventListener('mouseup', () => {
    if (diceState.isRolling) return;
    rollDiceWithPhysics(diceVisualContainer, diceElement, rollButton);
});

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
            
            // Remove o dado e seus elementos
            const diceContainer = document.getElementById('simulation-container');
            if (diceContainer) diceContainer.remove();
            
            const diceStyles = document.querySelector('style[data-dice-styles]');
            if (diceStyles) diceStyles.remove();
            
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

// Resto do código (loadEquippedDice, setupDiceUIToggle, etc.) permanece o mesmo


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


// ADICIONE ESTA FUNÇÃO AQUI
function setupDiceUIToggle() {
    const diceSection = document.getElementById('dice-section');
    const toggleButton = document.getElementById('toggle-dice-ui');
    
    if (diceSection && toggleButton) {
        toggleButton.addEventListener('click', () => {
            console.log("Toggle clicked"); // Para debug
            diceSection.classList.toggle('visible');
            toggleButton.classList.toggle('active');
        });
    } else {
        console.error("Elementos não encontrados:", {
            diceSection: !!diceSection,
            toggleButton: !!toggleButton
        });
    }
}

// ADICIONE ESTE EVENT LISTENER
document.addEventListener('DOMContentLoaded', setupDiceUIToggle);

function initializeModule(firebaseDb) {
    db = firebaseDb; // isso resolve o problema
}

export { loadEquippedDice, initializeModule, setupDiceUIToggle };
