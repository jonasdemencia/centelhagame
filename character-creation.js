import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gdleGAZX7NBYPGMwI2siJw",
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
let descricoesDefeitos = {}; // Objeto para armazenar as descrições
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
            modifiers.energy += 2; // Energia +2
            modifiers.charisma -= 2; // Carisma -2
            break;
        case "Elfo":
            modifiers.skill += 2; // Habilidade +2
            modifiers.energy -= 2; // Energia -2
            break;
        case "Humano":
            // Humanos não tem modificadores
            break;
    }
    return modifiers;
}

function rollStat(stat, button) {
    const firstRollId = `${stat}1`;
    const secondRollId = `${stat}2`;
    const totalId = `${stat}Total`;
    const modifierId = `${stat}Modifier`;

    if (rolls[stat] > 0) {
        const roll1 = rollDice(6);
        const roll2 = rollDice(6);
        document.getElementById(firstRollId).innerText = roll1;
        document.getElementById(secondRollId).innerText = roll2;

        const racialModifiers = getRacialModifiers();
        const modifierValue = racialModifiers[stat] || 0;
        document.getElementById(modifierId).innerText = modifierValue > 0 ? `+${modifierValue}` : (modifierValue < 0 ? modifierValue : '');

        const total = roll1 + roll2 + modifierValue;
        document.getElementById(totalId).innerText = total;
        rolls[stat]--;
        if (rolls[stat] === 0) {
            disableButton(button);
        }
    }
}

function resetStat(stat, button) {
    const firstRollId = `${stat}1`;
    const secondRollId = `${stat}2`;
    const totalId = `${stat}Total`;
    const modifierId = `${stat}Modifier`;

    if (resets[stat] > 0) {
        document.getElementById(firstRollId).innerText = '-';
        document.getElementById(secondRollId).innerText = '-';
        document.getElementById(totalId).innerText = '-';
        document.getElementById(modifierId).innerText = '';
        rolls[stat] = 3;
        resets[stat]--;
        const rollButton = button.previousElementSibling;
        rollButton.disabled = false;
    }
}

function disableButton(button) {
    button.disabled = true;
}

function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();
    document.getElementById('energyModifier').innerText = racialModifiers.energy > 0 ? `+${racialModifiers.energy}` : (racialModifiers.energy < 0 ? racialModifiers.energy : '');
    document.getElementById('skillModifier').innerText = racialModifiers.skill > 0 ? `+${racialModifiers.skill}` : (racialModifiers.skill < 0 ? racialModifiers.skill : '');
    document.getElementById('charismaModifier').innerText = racialModifiers.charisma > 0 ? `+${racialModifiers.charisma}` : (racialModifiers.charisma < 0 ? racialModifiers.charisma : '');
    document.getElementById('magicModifier').innerText = racialModifiers.magic > 0 ? `+${racialModifiers.magic}` : (racialModifiers.magic < 0 ? racialModifiers.magic : '');
    document.getElementById('luckModifier').innerText = racialModifiers.luck > 0 ? `+${racialModifiers.luck}` : (racialModifiers.luck < 0 ? racialModifiers.luck : '');
}

document.getElementById("race").addEventListener("change", () => {
    rolls = { energy: 3, skill: 3, charisma: 3, magic: 3, luck: 3 };
    resets = { energy: 2, skill: 2, charisma: 2, magic: 2, luck: 2 };
    const statContainers = document.querySelectorAll('.stat-box');
    statContainers.forEach(container => {
        const rollButton = container.querySelector('.stat-buttons-inline button:first-child');
        const resetButton = container.querySelector('.stat-buttons-inline button:last-child');
        if (rollButton) rollButton.disabled = false;
        if (resetButton) resetButton.click(); // Simulate click to reset values
    });
    updateRacialModifiersDisplay();
});

document.getElementById("submit").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;
        const playerData = getPlayerStats();
        if (isFichaCompleta(playerData)) {
            await savePlayerData(uid, playerData);
            alert('Ficha salva!');
        } else {
            alert('Preencha todos os campos obrigatórios.');
        }
    } else {
        alert('Usuário não autenticado.');
    }
});

let saveTimeout;
function debounceSave(uid, data) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => savePlayerData(uid, data), 1000);
}

async function savePlayerData(uid, data) {
    try {
        const playerDoc = doc(db, "players", uid);
        await setDoc(playerDoc, data);
        console.log("Dados do jogador salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados do jogador:", error);
    }
}

async function getPlayerData(uid) {
    try {
        const playerDoc = doc(db, "players", uid);
        const docSnap = await getDoc(playerDoc);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("Nenhum documento encontrado para este usuário.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar os dados do jogador:", error);
        return null;
    }
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
        energy: { firstRoll: getStat("energy1"), secondRoll: getStat("energy2"), total: getStat("energyTotal"), rolls: rolls.energy, resets: resets.energy, modifier: racialModifiers.energy },
        skill: { firstRoll: getStat("skill1"), secondRoll: getStat("skill2"), total: getStat("skillTotal"), rolls: rolls.skill, resets: resets.skill, modifier: racialModifiers.skill },
        charisma: { firstRoll: getStat("charisma1"), secondRoll: getStat("charisma2"), total: getStat("charismaTotal"), rolls: rolls.charisma, resets: resets.charisma, modifier: racialModifiers.charisma },
        magic: { firstRoll: getStat("magic1"), secondRoll: getStat("magic2"), total: getStat("magicTotal"), rolls: rolls.magic, resets: resets.magic, modifier: racialModifiers.magic },
        luck: { firstRoll: getStat("luck1"), secondRoll: getStat("luck2"), total: getStat("luckTotal"), rolls: rolls.luck, resets: resets.luck, modifier: racialModifiers.luck }
    };
}

function getStat(id) {
    return document.getElementById(id).innerText !== "-" ? parseInt(document.getElementById(id).innerText) : 0;
}

function isFichaCompleta(playerData) {
    return playerData.name && playerData.race && playerData.alignment && playerData.class && playerData.maoDominante && playerData.hemisferioDominante && playerData.idade && playerData.defeitoCentral;
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

    listaDeDefeitos.forEach((li, index) => {
        const textoCompleto = li.textContent;
        const partes = textoCompleto.split(':');
        const nomeDefeito = partes[0].trim();
        const descricaoDefeito = partes[1] ? partes[1].trim() : "";
        defeitos.push(nomeDefeito);
        descricoesDefeitos[nomeDefeito] = descricaoDefeito;
        li.textContent = `${index + 1}. ${nomeDefeito}`; // Remove a descrição e adiciona a numeração
    });

    // Aplicando o layout de três em três usando CSS (adicionado aqui para garantir que seja aplicado após a manipulação da lista)
    const ul = defeitosListaElement.querySelector("ul");
    if (ul) {
        ul.style.display = "grid";
        ul.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))"; // Ajuste o minmax conforme necessário
        ul.style.gap = "5px";
    }
    listaDeDefeitos.forEach(li => {
        li.style.whiteSpace = "nowrap";
        li.style.overflow = "hidden";
        li.style.textOverflow = "ellipsis";
    });

    if (selecionarDefeitoButton) selecionarDefeitoButton.addEventListener("click", () => {
        if (selecoesDefeito < 2) {
            let randomIndex = Math.floor(Math.random() * defeitos.length);
            if (selecoesDefeito === 0) primeiroDefeitoIndex = randomIndex;
            else if (selecoesDefeito === 1) segundoDefeitoIndex = randomIndex;
            selecoesDefeito++;
            escolhaDefeitoDiv.style.display = "block"; // Exibe as opções para escolha e suas descrições

            if (selecoesDefeito === 2) {
                const primeiroDefeitoNome = defeitos[primeiroDefeitoIndex];
                const segundoDefeitoNome = defeitos[segundoDefeitoIndex];
                const descricao1 = descricoesDefeitos[primeiroDefeitoNome];
                const descricao2 = descricoesDefeitos[segundoDefeitoNome];
                escolherDefeito1Button.textContent = `Opção 1: ${primeiroDefeitoNome}`;
                escolherDefeito2Button.textContent = `Opção 2: ${segundoDefeitoNome}`;

                // Exibe as descrições abaixo dos botões de escolha
                const descricaoContainer = document.createElement('div');
                descricaoContainer.id = 'descricao-defeitos-selecionados';
                descricaoContainer.innerHTML = `
                    <p><strong>Opção 1:</strong> ${primeiroDefeitoNome}<br>${descricao1}</p>
                    <p><strong>Opção 2:</strong> ${segundoDefeitoNome}<br>${descricao2}</p>
                `;
                escolhaDefeitoDiv.appendChild(descricaoContainer);
            }
        } else {
            alert("Você já selecionou dois defeitos. Escolha um deles.");
        }
    });

    if (escolherDefeito1Button) {
        escolherDefeito1Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitos[primeiroDefeitoIndex];
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            selecoesDefeito = 0; // Reseta para futuras seleções, se necessário
            const accordionButton = document.querySelector('.accordion-button:contains("D e f e i t o\u00a0c e n t r a l")');
            if (accordionButton) {
                const selectedOptionSpan = accordionButton.querySelector('.selected-option');
                if (selectedOptionSpan) {
                    selectedOptionSpan.textContent = defeitoCentralFinal;
                }
            }
        });
    }

    if (escolherDefeito2Button) {
        escolherDefeito2Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitos[segundoDefeitoIndex];
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            selecoesDefeito = 0; // Reseta para futuras seleções, se necessário
            const accordionButton = document.querySelector('.accordion-button:contains("D e f e i t o\u00a0c e n t r a l")');
            if (accordionButton) {
                const selectedOptionSpan = accordionButton.querySelector('.selected-option');
                if (selectedOptionSpan) {
                    selectedOptionSpan.textContent = defeitoCentralFinal;
                }
            }
        });
    }

    // Atualização dos headers dos acordeões com a opção selecionada
    accordionButtons.forEach(button => {
        const accordionContent = button.nextElementSibling;
        const selectElements = accordionContent.querySelectorAll('select.select-field'); // Seletor mais específico para seus selects

        selectElements.forEach(select => {
            select.addEventListener('change', (event) => {
                const selectedOption = event.target.value;
                const originalText = button.textContent.split(':')[0];
                const selectedOptionSpan = button.querySelector('.selected-option'); // Seleciona o span onde a opção será exibida
                if (selectedOptionSpan) {
                    selectedOptionSpan.textContent = selectedOption.trim();
                } else {
                    button.textContent = `${originalText}: ${selectedOption.trim()}`; // Fallback caso o span não exista (mas ele existe no seu HTML)
                }
            });
        });
    });
});
