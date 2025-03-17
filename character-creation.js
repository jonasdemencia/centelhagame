document.addEventListener("DOMContentLoaded", () => {
    const rollButtons = document.querySelectorAll(".roll-button");

    rollButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const stat = event.target.dataset.stat;
            rollDice(stat);
        });
    });
});

// Definir rolagens iniciais por atributo
const rolls = {
    forca: 3,
    destreza: 3,
    inteligencia: 3
};

function rollDice(stat) {
    if (rolls[stat] > 0) {
        const firstRoll = Math.floor(Math.random() * 6) + 1;
        const secondRoll = Math.floor(Math.random() * 6) + 1;
        const total = firstRoll + secondRoll;

        document.getElementById(stat + "1").innerText = firstRoll;
        document.getElementById(stat + "2").innerText = secondRoll;
        document.getElementById(stat + "Total").innerText = total;

        rolls[stat]--;

        console.log(`Rolagem para ${stat}: ${firstRoll} + ${secondRoll} = ${total}`);
    } else {
        console.log(`Sem rolagens restantes para ${stat}`);
    }
}
