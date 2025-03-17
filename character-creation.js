// Inicializa os contadores para rolagens e resets por atributo
let rolls = JSON.parse(localStorage.getItem("rolls")) || { health: 3, strength: 3, dexterity: 3, intelligence: 3, luck: 3 }; // Persistência de rolagens
let resets = JSON.parse(localStorage.getItem("resets")) || { health: 2, strength: 2, dexterity: 2, intelligence: 2, luck: 2 }; // Persistência de resets

// Atualiza os valores no localStorage após qualquer mudança
function updateLocalStorage() {
    localStorage.setItem("rolls", JSON.stringify(rolls));
    localStorage.setItem("resets", JSON.stringify(resets));
}

// Função para rolar os dados
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Função para obter modificadores raciais com base na raça escolhida
function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { health: 0, strength: 0, dexterity: 0, intelligence: 0, luck: 0 };
    switch (race) {
        case "Anão":
            modifiers.health += 12;
            modifiers.intelligence += 3;
            modifiers.strength += 6;
            modifiers.dexterity += 4;
            break;
        case "Elfo":
            modifiers.health += 8;
            modifiers.intelligence += 4;
            modifiers.dexterity += 6;
            modifiers.strength += 4;
            break;
        case "Humano":
            modifiers.health += 10;
            modifiers.intelligence += 6;
            modifiers.dexterity += 4;
            modifiers.strength += 4;
            break;
    }
    return modifiers;
}

// Função para rolar o atributo
function rollStat(stat, button) {
    if (rolls[stat] > 0) {
        let firstRoll = document.getElementById(stat + "1");
        let secondRoll = document.getElementById(stat + "2");
        let totalRoll = document.getElementById(stat + "Total");
        let modifierDisplay = document.getElementById(stat + "Modifier");

        if (firstRoll.innerText === "-") {
            firstRoll.innerText = rollDice(6);
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);
            let rollValue = parseInt(firstRoll.innerText) + parseInt(secondRoll.innerText);
            const racialModifiers = getRacialModifiers();
            const modifierValue = racialModifiers[stat];
            if (modifierValue !== 0) {
                modifierDisplay.innerText = ` (+${modifierValue})`;
            } else {
                modifierDisplay.innerText = "";
            }
            rollValue += modifierValue;
            totalRoll.innerText = rollValue;
            rolls[stat]--; // Reduz o contador de rolagens para o atributo
            updateLocalStorage(); // Salva o novo estado no localStorage
            if (rolls[stat] === 0) disableButton(button); // Desabilita o botão "🎲" quando atingir o limite
        }
    } else {
        alert("Você já usou todas as 3 rolagens permitidas para este atributo!");
    }
}

// Função para zerar os atributos
function resetStat(stat, button) {
    if (resets[stat] > 0) {
        document.getElementById(stat + "1").innerText = "-";
        document.getElementById(stat + "2").innerText = "-";
        document.getElementById(stat + "Total").innerText = "-";
        document.getElementById(stat + "Modifier").innerText = ""; // Limpa o modificador
        resets[stat]--; // Reduz o contador de resets para o atributo
        updateLocalStorage(); // Salva o novo estado no localStorage
        if (resets[stat] === 0) disableButton(button); // Desabilita o botão "Zerar" quando atingir o limite
    } else {
        alert("Você já zerou este atributo 2 vezes!"); // Mensagem ao ultrapassar o limite
    }
}

// Função para desabilitar um botão específico
function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
}

// Atualizar os modificadores raciais com base na raça escolhida
function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();
    for (const stat in racialModifiers) {
        const modifierDisplay = document.getElementById(stat + "Modifier");
        const modifierValue = racialModifiers[stat];
        if (modifierValue !== 0) {
            modifierDisplay.innerText = ` (+${modifierValue})`;
        } else {
            modifierDisplay.innerText = "";
        }
    }
}

// Adicionar evento ao campo de raça
document.getElementById("race").addEventListener("change", updateRacialModifiersDisplay);

// Verificar se os botões devem ser desativados ao carregar a página
function checkButtonStates() {
    for (const stat in rolls) {
        const rollButton = document.querySelector(`#${stat} .button:first-child`); // Botão de rolar
        const resetButton = document.querySelector(`#${stat} .button:last-child`); // Botão de zerar
        if (rolls[stat] === 0) disableButton(rollButton);
        if (resets[stat] === 0) disableButton(resetButton);
    }
}
checkButtonStates(); // Checa os estados ao carregar
