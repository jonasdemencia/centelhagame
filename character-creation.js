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
let generatedAge = null; // <--- ADICIONE ESTA LINHA

// Função auxiliar para gerar um número inteiro aleatório entre min e max (inclusive)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function getRacialModifiers() {
    const race = document.getElementById("race").value;
    let modifiers = { energy: 0, skill: 0, charisma: 0, magic: 0, luck: 0 };

    switch (race) {
        case "Anão":
            modifiers.energy += 200;  // Energia +200
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
    if (rolls[stat] > 0) {
        console.log(`Rolando atributo: ${stat}`);
        let firstRoll = document.getElementById(stat + "1");
        let secondRoll = document.getElementById(stat + "2");
        let totalRoll = document.getElementById(stat + "Total");
        let modifierDisplay = document.getElementById(stat + "Modifier");

        if (!firstRoll || !secondRoll || !totalRoll || !modifierDisplay) {
            console.error(`Elementos DOM para ${stat} não encontrados.`);
            return;
        }

        if (firstRoll.innerText === "-") {
            firstRoll.innerText = rollDice(6);
            console.log(`Primeira rolagem (${stat}): ${firstRoll.innerText}`);
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        } else if (secondRoll.innerText === "-") {
            secondRoll.innerText = rollDice(6);
            console.log(`Segunda rolagem (${stat}): ${secondRoll.innerText}`);

            let rollValue = parseInt(firstRoll.innerText) + parseInt(secondRoll.innerText);
            const racialModifiers = getRacialModifiers();
            const modifierValue = racialModifiers[stat];

            modifierDisplay.innerText = modifierValue !== 0 ? ` (${modifierValue})` : "";
            modifierDisplay.className = 'racial-modifier'; // Resetando classes
            if (modifierValue > 0) {
                modifierDisplay.classList.add('positive');
            } else if (modifierValue < 0) {
                modifierDisplay.classList.add('negative');
            }

            rollValue += modifierValue;
            totalRoll.innerText = rollValue;
            rolls[stat]--;

            console.log(`Total (${stat}): ${rollValue}`);
            if (rolls[stat] === 0) disableButton(button);
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        }
    } else {
        alert("Você já usou todas as 3 rolagens permitidas para este atributo!");
    }
}

function resetStat(stat, button) {
    if (resets[stat] > 0) {
        document.getElementById(stat + "1").innerText = "-";
        document.getElementById(stat + "2").innerText = "-";
        document.getElementById(stat + "Total").innerText = "-";
        document.getElementById(stat + "Modifier").innerText = "";
        document.getElementById(stat + "Modifier").className = 'racial-modifier'; // Resetando classes
        resets[stat]--;
        savePlayerData(auth.currentUser.uid, getPlayerStats());
        if (resets[stat] === 0) disableButton(button);
    } else {
        alert("Você já zerou este atributo 2 vezes!");
    }
}

function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
}

function updateRacialModifiersDisplay() {
    const racialModifiers = getRacialModifiers();

    for (const stat in racialModifiers) {
        const modifierDisplay = document.getElementById(stat + "Modifier");
        const totalRoll = document.getElementById(stat + "Total");
        const firstRoll = document.getElementById(stat + "1");
        const secondRoll = document.getElementById(stat + "2");

        if (modifierDisplay && totalRoll && firstRoll && secondRoll) {
            let modifierValue = racialModifiers[stat];

            modifierDisplay.innerText = modifierValue !== 0 ? ` (${modifierValue})` : "";
            modifierDisplay.className = 'racial-modifier'; // Resetando classes
            if (modifierValue > 0) {
                modifierDisplay.classList.add('positive');
            } else if (modifierValue < 0) {
                modifierDisplay.classList.add('negative');
            }

            let firstValue = parseInt(firstRoll.innerText) || 0;
            let secondValue = parseInt(secondRoll.innerText) || 0;
            let newTotal = firstValue + secondValue + modifierValue;

            if (firstValue > 0 && secondValue > 0) {
                totalRoll.innerText = newTotal;
            }
        }
    }
}

document.getElementById("race").addEventListener("change", () => {
    updateRacialModifiersDisplay();  // Atualiza os modificadores e recalcula os totais
    savePlayerData(auth.currentUser.uid, getPlayerStats());  // Salva os novos valores no Firestore
});

document.getElementById("alignment").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("class").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("mao dominante").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("hemisfério dominante").addEventListener("change", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("name").addEventListener("input", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("idade").addEventListener("input", () => {
    savePlayerData(auth.currentUser.uid, getPlayerStats());
});

document.getElementById("submit").addEventListener("click", async () => {
    const data = getPlayerStats();
    const completionStatus = isFichaCompleta(data);

    if (completionStatus === true) {
        data.fichaCompleta = true;
        await savePlayerData(auth.currentUser.uid, data);
        console.log("Ficha marcada como completa. Redirecionando para o inventário...");
        window.location.href = "inventario.html";
    } else {
        let message = "Por favor, preencha todos os campos e finalize todas as rolagens antes de prosseguir!\n\n";
        if (completionStatus.missingFields.length > 0) {
            message += "Campos faltando: " + completionStatus.missingFields.join(", ") + "\n";
        }
        if (completionStatus.unrolledStats.length > 0) {
            message += "Atributos a serem rolados: " + completionStatus.unrolledStats.join(", ") + "\n";
        }
        if (completionStatus.missingDefeitoCentral) {
            message += "Selecione seu Defeito Central!\n";
        }
        alert(message);
    }
});

let saveTimeout;
function debounceSave(uid, data) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        savePlayerData(uid, data);
    }, 300);
}

async function savePlayerData(uid, data) {
    try {
        const playerRef = doc(db, "players", uid);
        await setDoc(playerRef, data, { merge: true });
        console.log("Dados salvos com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

async function getPlayerData(uid) {
    try {
        const playerRef = doc(db, "players", uid);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
            console.log("Dados do jogador recuperados:", playerSnap.data());
            return playerSnap.data();
        } else {
            console.log("Nenhum dado encontrado para este jogador.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao recuperar os dados:", error);
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
        idade: generatedAge, // Salva a idade gerada
        defeitoCentral: defeitoCentralFinal,
        energy: {
            firstRoll: getStat("energy1"),
            secondRoll: getStat("energy2"),
            total: getStat("energyTotal"),
            rolls: rolls.energy,
            resets: resets.energy,
            modifier: racialModifiers.energy  // Salva o modificador no Firestore
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
    const missingFields = [];
    const unrolledStats = [];
    const stats = ["energy", "skill", "charisma", "magic", "luck"];
    let missingDefeitoCentral = false;

    if (!playerData.name) missingFields.push("Nome do heroi");
    if (!playerData.race) missingFields.push("Raça");
    if (!playerData.alignment) missingFields.push("Alinhamento");
    if (!playerData.class) missingFields.push("Classe");
    if (!playerData.maoDominante) missingFields.push("Mão Dominante");
    if (!playerData.hemisferioDominante) missingFields.push("Hemisfério Dominante");
    if (!playerData.idade) missingFields.push("Idade");
    if (!playerData.defeitoCentral) missingDefeitoCentral = true;

    stats.forEach(stat => {
        if (!playerData[stat] || playerData[stat].firstRoll === 0 || playerData[stat].secondRoll === 0 || playerData[stat].total === 0) {
            unrolledStats.push(stat.charAt(0).toUpperCase() + stat.slice(1)); // Capitaliza o nome do atributo
        }
    });

    if (missingFields.length > 0 || unrolledStats.length > 0 || missingDefeitoCentral) {
        return { missingFields, unrolledStats, missingDefeitoCentral };
    }
    return true;
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
    if (defeitosListaElement) {
        const liElements = defeitosListaElement.querySelectorAll("li");
        liElements.forEach(li => {
            defeitos.push(li.textContent);
        });
    }

    const selecionarDefeitoButton = document.getElementById("selecionar-defeito");
    const defeitoSelecionado1Div = document.getElementById("defeito-selecionado-1");
    const defeitoSelecionado2Div = document.getElementById("defeito-selecionado-2");
    const escolhaDefeitoDiv = document.getElementById("escolha-defeito");
    const escolherDefeito1Button = document.getElementById("escolher-defeito-1");
    const escolherDefeito2Button = document.getElementById("escolher-defeito-2");
    const defeitoCentralFinalDiv = document.getElementById("defeito-central-final");
    const defeitoCentralFinalSpan = defeitoCentralFinalDiv.querySelector("span");

    if (selecionarDefeitoButton) {
        selecionarDefeitoButton.addEventListener("click", () => {
            if (selecoesDefeito < 2) {
                const randomIndex = Math.floor(Math.random() * defeitos.length);
                const defeito = defeitos[randomIndex];
                if (selecoesDefeito === 0) {
                    defeitoSelecionado1 = defeito;
                    defeitoSelecionado1Div.style.display = "block";
                    defeitoSelecionado1Div.querySelector("span").textContent = defeito;
                } else if (selecoesDefeito === 1) {
                    defeitoSelecionado2 = defeito;
                    defeitoSelecionado2Div.style.display = "block";
                    defeitoSelecionado2Div.querySelector("span").textContent = defeito;
                    escolhaDefeitoDiv.style.display = "block";
                }
                selecoesDefeito++;
            } else {
                alert("Você já selecionou dois defeitos. Escolha um deles.");
            }
        });
    }

    if (escolherDefeito1Button) {
        escolherDefeito1Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitoSelecionado1;
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        });
    }

    if (escolherDefeito2Button) {
        escolherDefeito2Button.addEventListener("click", () => {
            defeitoCentralFinal = defeitoSelecionado2;
            escolhaDefeitoDiv.style.display = "none";
            defeitoCentralFinalDiv.style.display = "block";
            defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        });
    }

    
    // --- INÍCIO DO BLOCO DE CÓDIGO DA IDADE ---
    const idadeSelect = document.getElementById("idade");
    if (idadeSelect) {
        idadeSelect.addEventListener("change", () => {
            const selectedAgeRange = idadeSelect.value;
            let minAge, maxAge;

            switch (selectedAgeRange) {
                case "Neófito (18-25 anos)":
                    minAge = 18;
                    maxAge = 25;
                    break;
                case "Confessor (28-40 anos)":
                    minAge = 28;
                    maxAge = 40;
                    break;
                case "Adepto (45-60 anos)":
                    minAge = 45;
                    maxAge = 60;
                    break;
                default:
                    generatedAge = null;
                    return;
            }
            generatedAge = getRandomInt(minAge, maxAge);
            console.log(`Idade aleatória gerada: ${generatedAge} anos`);
            // Salva os dados imediatamente após gerar a idade
            savePlayerData(auth.currentUser.uid, getPlayerStats());
        });
    }
    // --- FIM DO BLOCO DE CÓDIGO DA IDADE ---

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
                if (playerData.name) document.getElementById("name").value = playerData.name;
                if (playerData.race) document.getElementById("race").value = playerData.race;
                if (playerData.alignment) document.getElementById("alignment").value = playerData.alignment;
                if (playerData.class) document.getElementById("class").value = playerData.class;
                if (playerData.maoDominante) document.getElementById("mao dominante").value = playerData.maoDominante;
                if (playerData.hemisferioDominante) document.getElementById("hemisfério dominante").value = playerData.hemisferioDominante;

                // 🔹 Corrige a restauração da idade
                if (playerData.idade) {
    generatedAge = playerData.idade; // Restaura a idade gerada
    
    // Determina qual faixa etária corresponde à idade salva
    let ageRange = "";
    if (playerData.idade >= 18 && playerData.idade <= 25) {
        ageRange = "Neófito (18-25 anos)";
    } else if (playerData.idade >= 28 && playerData.idade <= 40) {
        ageRange = "Confessor (28-40 anos)";
    } else if (playerData.idade >= 45 && playerData.idade <= 60) {
        ageRange = "Adepto (45-60 anos)";
    }
    
    if (ageRange) {
        document.getElementById("idade").value = ageRange;
    }
    console.log("Idade restaurada:", playerData.idade);
}


                // 🔹 Preenche os atributos com dados salvos
                const stats = ["energy", "skill", "charisma", "magic", "luck"];
                stats.forEach(stat => {
                    if (playerData[stat]) {
                        document.getElementById(stat + "1").innerText = playerData[stat].firstRoll || "-";
                        document.getElementById(stat + "2").innerText = playerData[stat].secondRoll || "-";
                        document.getElementById(stat + "Total").innerText = playerData[stat].total || "-";
                        document.getElementById(stat + "Modifier").innerText = playerData[stat].modifier ? ` (${playerData[stat].modifier})` : "";
                        document.getElementById(stat + "Modifier").className = 'racial-modifier';
                        if (playerData[stat].modifier > 0) {
                            document.getElementById(stat + "Modifier").classList.add('positive');
                        } else if (playerData[stat].modifier < 0) {
                            document.getElementById(stat + "Modifier").classList.add('negative');
                        }
                        rolls[stat] = playerData[stat].rolls !== undefined ? playerData[stat].rolls : 3;
                        resets[stat] = playerData[stat].resets !== undefined ? playerData[stat].resets : 2;
                    }
                });

                // 🔹 Restaura o estado do Defeito Central
                if (playerData.defeitoCentral) {
                    defeitoCentralFinal = playerData.defeitoCentral;
                    defeitoCentralFinalDiv.style.display = "block";
                    defeitoCentralFinalSpan.textContent = defeitoCentralFinal;
                    selecoesDefeito = 2; // Simula que as duas seleções já foram feitas
                    escolhaDefeitoDiv.style.display = "none";
                    if (selecionarDefeitoButton) {
                        selecionarDefeitoButton.disabled = true;
                        selecionarDefeitoButton.style.opacity = "0.5";
                        selecionarDefeitoButton.style.cursor = "not-allowed";
                    }
                } else {
                    selecoesDefeito = 0;
                    defeitoSelecionado1 = null;
                    defeitoSelecionado2 = null;
                    defeitoCentralFinal = null;
                    defeitoSelecionado1Div.style.display = "none";
                    defeitoSelecionado2Div.style.display = "none";
                    escolhaDefeitoDiv.style.display = "none";
                    defeitoCentralFinalDiv.style.display = "none";
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





