import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let rolls = { energy: 3, skill: 3, charisma: 3, magic: 3, luck: 3 };
let resets = { energy: 2, skill: 2, charisma: 2, magic: 2, luck: 2 };

let defeitos = [];
let defeitoSelecionado1 = null;
let defeitoSelecionado2 = null;
let defeitoCentralFinal = null;
let selecoesDefeito = 0;
let primeiroDefeitoIndex = -1;
let segundoDefeitoIndex = -1;

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { energy: 0, skill: 0, charisma: 0, magic: 0, luck: 0 };

    switch (race) {
        case "Anão":
            modifiers.energy += 2;  // Energia +2
            modifiers.charisma -= 2; // Carisma -2
            break;
        case "Elfo":
            modifiers.skill += 2;  // Habilidade +2
            modifiers.energy -= 2; // Energia -2
            break;
        case "Humano":
            // Humanos não têm modificadores
            break;
    }
    return modifiers;
}

function rollStat(stat, button) {
    // ... (Código da função rollStat permanece o mesmo) ...
}

function resetStat(stat, button) {
    // ... (Código da função resetStat permanece o mesmo) ...
}

function disableButton(button) {
    // ... (Código da função disableButton permanece o mesmo) ...
}

function updateRacialModifiersDisplay() {
    // ... (Código da função updateRacialModifiersDisplay permanece o mesmo) ...
}

document.getElementById("race").addEventListener("change", () => {
    // ... (Código do evento de change para raça permanece o mesmo) ...
});

// ... (Event listeners para outros campos permanecem os mesmos) ...

document.getElementById("submit").addEventListener("click", async () => {
    // ... (Código do evento de click para submit permanece o mesmo) ...
});

let saveTimeout;
function debounceSave(uid, data) {
    // ... (Código da função debounceSave permanece o mesmo) ...
}

async function savePlayerData(uid, data) {
    // ... (Código da função savePlayerData permanece o mesmo) ...
}

async function getPlayerData(uid) {
    // ... (Código da função getPlayerData permanece o mesmo) ...
}

function getPlayerStats() {
    const racialModifiers = getRacialModifiers();

    return {
        name: document.getElementById("name").value,
        race: document.getElementById("race").value,
        alignment: document.getElementById("alignment").value,
        class: document.getElementById("class").value,
        maoDominante: document.getElementById("mao dominante").value,
        hemisferioDominante: document.getElementById("hemisfério dominante").value,
        idade: document.getElementById("idade").value,
        defeitoCentral: defeitoCentralFinal,
        primeiroDefeitoIndex: primeiroDefeitoIndex,
        segundoDefeitoIndex: segundoDefeitoIndex,
        energy: {
            firstRoll: getStat("energy1"),
            secondRoll: getStat("energy2"),
            total: getStat("energyTotal"),
            rolls: rolls.energy,
            resets: resets.energy,
            modifier: racialModifiers.energy
        },
        skill: {
            firstRoll: getStat("skill1"),
            secondRoll: getStat("skill2"),
            total: getStat("skillTotal"),
            rolls: rolls.skill,
            resets: resets.skill,
            modifier: racialModifiers.skill
        },
        charisma: {
            firstRoll: getStat("charisma1"),
            secondRoll: getStat("charisma2"),
            total: getStat("charismaTotal"),
            rolls: rolls.charisma,
            resets: resets.charisma,
            modifier: racialModifiers.charisma
        },
        magic: {
            firstRoll: getStat("magic1"),
            secondRoll: getStat("magic2"),
            total: getStat("magicTotal"),
            rolls: rolls.magic,
            resets: resets.magic,
            modifier: racialModifiers.magic
        },
        luck: {
            firstRoll: getStat("luck1"),
            secondRoll: getStat("luck2"),
            total: getStat("luckTotal"),
            rolls: rolls.luck,
            resets: resets.luck,
            modifier: racialModifiers.luck
        }
    };
}

function getStat(id) {
    return document.getElementById(id).innerText !== "-" ? parseInt(document.getElementById(id).innerText) : 0;
}

function isFichaCompleta(playerData) {
    // ... (Código da função isFichaCompleta permanece o mesmo) ...
}

document.addEventListener("DOMContentLoaded", () => {
    // Accordion functionality
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accordionContent = button.nextElementSibling;
            button.classList.toggle('active');
            accordionContent.style.maxHeight = accordionContent.style.maxHeight ? null : accordionContent.scrollHeight + "px";
        });
    });

    // Defeito Central functionality
    const defeitosListaElement = document.getElementById("defeitos-lista");
    const listaDeDefeitos = defeitosListaElement.querySelectorAll("li");
    const selecionarDefeitoButton = document.getElementById("selecionar-defeito");
    const escolhaDefeitoDiv = document.getElementById("escolha-defeito");
    const escolherDefeito1Button = document.getElementById("escolher-defeito-1");
    const escolherDefeito2Button = document.getElementById("escolher-defeito-2");
    const defeitoCentralFinalDiv = document.getElementById("defeito-central-final");
    const defeitoCentralFinalSpan = defeitoCentralFinalDiv.querySelector("span");
    const descricaoDefeitosSelecionadosDiv = document.getElementById("descricao-defeitos-selecionados");

    listaDeDefeitos.forEach((li, index) => {
        defeitos.push(li.textContent);
        li.textContent = `${index + 1}. ${li.textContent}`; // Adiciona a numeração
    });

    if (selecionarDefeitoButton) {
        selecionarDefeitoButton.addEventListener("click", () => {
            if (selecoesDefeito < 2) {
                let randomIndex = Math.floor(Math.random() * defeitos.length);

                if (selecoesDefeito === 0) {
                    primeiroDefeitoIndex = randomIndex;
                    selecoesDefeito++;
                } else if (selecoesDefeito === 1) {
                    segundoDefeitoIndex = randomIndex;
                    selecoesDefeito++;
                    escolhaDefeitoDiv.style.display = "block";
                }

                // Exibe as opções para escolha e suas descrições
                if (selecoesDefeito === 2) {
                    const primeiroDefeitoNome = defeitos[primeiroDefeitoIndex].split('. ')[1];
                    const segundoDefeitoNome = defeitos[segundoDefeitoIndex].split('. ')[1];
                    const primeiroDefeitoElement = listaDeDefeitos[primeiroDefeitoIndex];
                    const segundoDefeitoElement = listaDeDefeitos[segundoDefeitoIndex];

                    escolherDefeito1Button.textContent = `Escolher: ${primeiroDefeitoNome}`;
                    escolherDefeito2Button.textContent = `Escolher: ${segundoDefeitoNome}`;

                    const descricao1 = primeiroDefeitoElement.dataset.descricao;
                    const descricao2 = segundoDefeitoElement.dataset.descricao;

                    descricaoDefeitosSelecionadosDiv.innerHTML = `<p><strong>Opção 1:</strong> ${primeiroDefeitoNome} - ${descricao1}</p><p><strong>Opção 2:</strong> ${segundoDefeitoNome} - ${descricao2}</p>`;
                }
            } else {
                alert("Você já selecionou dois defeitos. Escolha um deles.");
            }
        });
    }

    if (escolherDefeito1Button) {
        escolherDefeito1Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitos[primeiroDefeitoIndex].split('. ')[1];
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            selecoesDefeito = 2; // Impede novas seleções
            if (selecionarDefeitoButton) {
                selecionarDefeitoButton.disabled = true;
                selecionarDefeitoButton.style.opacity = "0.5";
                selecionarDefeitoButton.style.cursor = "not-allowed";
            }
            descricaoDefeitosSelecionadosDiv.innerHTML = ""; // Limpa as descrições

            listaDeDefeitos.forEach((li, index) => {
                if (index === primeiroDefeitoIndex) {
                    li.classList.add("defeito-selecionado");
                } else if (index === segundoDefeitoIndex) {
                    li.classList.add("defeito-nao-selecionado");
                } else {
                    li.classList.remove("defeito-selecionado");
                    li.classList.remove("defeito-nao-selecionado");
                }
            });
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        });
    }

    if (escolherDefeito2Button) {
        escolherDefeito2Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitos[segundoDefeitoIndex].split('. ')[1];
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            selecoesDefeito = 2; // Impede novas seleções
            if (selecionarDefeitoButton) {
                selecionarDefeitoButton.disabled = true;
                selecionarDefeitoButton.style.opacity = "0.5";
                selecionarDefeitoButton.style.cursor = "not-allowed";
            }
            descricaoDefeitosSelecionadosDiv.innerHTML = ""; // Limpa as descrições

            listaDeDefeitos.forEach((li, index) => {
                if (index === segundoDefeitoIndex) {
                    li.classList.add("defeito-selecionado");
                } else if (index === primeiroDefeitoIndex) {
                    li.classList.add("defeito-nao-selecionado");
                } else {
                    li.classList.remove("defeito-selecionado");
                    li.classList.remove("defeito-nao-selecionado");
                }
            });
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        });
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.uid);
            const playerData = await getPlayerData(user.uid);

            // 🔹 Verifica se a ficha está completa, incluindo as rolagens e os atributos
            if (playerData && playerData.fichaCompleta) {
                console.log("Ficha já criada e completa. Redirecionando para o inventário...");
                window.location.href = "inventario.html";
                return; // Impede o restante do fluxo
            }

            // 🔹 Exibe a página de criação de ficha se incompleta
            console.log("Ficha incompleta. Removendo a classe 'hidden' para exibir a página.");
            document.body.classList.remove("hidden");

            // 🔹 Preenche os campos com dados salvos, se existirem
            if (playerData) {
                // ... (Restauração de outros campos permanece a mesma) ...

                // 🔹 Restaura o estado do Defeito Central
                if (playerData.defeitoCentral && playerData.primeiroDefeitoIndex !== undefined && playerData.segundoDefeitoIndex !== undefined) {
                    defeitoCentralFinal = playerData.defeitoCentral;
                    primeiroDefeitoIndex = playerData.primeiroDefeitoIndex;
                    segundoDefeitoIndex = playerData.segundoDefeitoIndex;
                    defeitoCentralFinalDiv.style.display = "block";
                    defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
                    selecoesDefeito = 2; // Simula que as duas seleções já foram feitas
                    escolhaDefeitoDiv.style.display = "none";
                    if (selecionarDefeitoButton) {
                        selecionarDefeitoButton.disabled = true;
                        selecionarDefeitoButton.style.opacity = "0.5";
                        selecionarDefeitoButton.style.cursor = "not-allowed";
                    }

                    // Restaura a visualização dos defeitos na lista
                    listaDeDefeitos.forEach((li, index) => {
                        if (index === primeiroDefeitoIndex && li.textContent.includes(defeitoCentralFinal)) {
                            li.classList.add("defeito-selecionado");
                        } else if (index === segundoDefeitoIndex && !li.textContent.includes(defeitoCentralFinal)) {
                            li.classList.add("defeito-nao-selecionado");
                        } else if (index === segundoDefeitoIndex && li.textContent.includes(defeitoCentralFinal)) {
                            li.classList.add("defeito-selecionado");
                        } else if (index === primeiroDefeitoIndex && !li.textContent.includes(defeitoCentralFinal)) {
                            li.classList.add("defeito-nao-selecionado");
                        }
                    });
                } else {
                    selecoesDefeito = 0;
                    primeiroDefeitoIndex = -1;
                    segundoDefeitoIndex = -1;
                    defeitoCentralFinal = null;
                    escolhaDefeitoDiv.style.display = "none";
                    defeitoCentralFinalDiv.style.display = "none";
                    descricaoDefeitosSelecionadosDiv.innerHTML = "";
                    listaDeDefeitos.forEach(li => {
                        li.classList.remove("defeito-selecionado");
                        li.classList.remove("defeito-nao-selecionado");
                    });
                    if (selecionarDefeitoButton) {
                        selecionarDefeitoButton.disabled = false;
                        selecionarDefeitoButton.style.opacity = "1";
                        selecionarDefeitoButton.style.cursor = "pointer";
                    }
                }

                // 🔹 Atualiza os modificadores raciais
                updateRacialModifiersDisplay();
            }
        } else {
            console.log("Nenhum usuário autenticado. Redirecionando para a página inicial...");
            window.location.href = "index.html";
        }
    });
});

// 🔹 Mantendo os métodos utilitários necessários
window.rollStat = rollStat;
window.resetStat = resetStat;
