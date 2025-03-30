// batalha.js

// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuração do Firebase (substitua com suas próprias configurações)
const firebaseConfig = {
    apiKey: "AIzaSyC0XfvjonW2gd1eGAZX7NBYfPGMwI2siJw",
    authDomain: "centelhagame-9d511.firebaseapp.com",
    projectId: "centelhagame-9d511",
    storageBucket: "centelhagame-9d511.appspot.com",
    messagingSenderId: "700809803145",
    appId: "1:700809803145:web:bff4c6a751ec9389919d58"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para rolar dados (ex: "1D6", "2D4")
function rollDice(diceString) {
    const parts = diceString.toUpperCase().split('D');
    if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        // Se for apenas um número, retorna esse número
        return parseInt(parts[0]);
    } else if (parts.length === 2) {
        const numDice = parseInt(parts[0]);
        const numSides = parseInt(parts[1]);
        if (isNaN(numDice) || isNaN(numSides) || numDice <= 0 || numSides <= 0) {
            console.error("Valores de dado inválidos:", diceString);
            return 0;
        }
        let totalRoll = 0;
        for (let i = 0; i < numDice; i++) {
            totalRoll += Math.floor(Math.random() * numSides) + 1;
        }
        return totalRoll;
    } else {
        console.error("Formato de dado inválido:", diceString);
        return 0;
    }
}

// Função para atualizar a energia do jogador na ficha do Firestore
function updatePlayerEnergyInFirestore(userId, newEnergy) {
    const playerDocRef = doc(db, "players", userId);
    return setDoc(playerDocRef, { energia: newEnergy }, { merge: true }) // Atualiza o campo "energia"
        .then(() => {
            console.log("Energia do jogador atualizada na ficha:", newEnergy);
        })
        .catch((error) => {
            console.error("Erro ao atualizar a energia do jogador na ficha:", error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const lutarButton = document.getElementById("iniciar-luta");
    const rolarIniciativaButton = document.getElementById("rolar-iniciativa");
    const battleLogContent = document.getElementById("battle-log-content");
    const attackOptionsDiv = document.getElementById("attack-options");
    const monsterName = getUrlParameter('monstro');
    let currentMonster; // Declara currentMonster no escopo superior
    let playerData; // Para armazenar os dados do jogador
    let playerHealth = 0; // Adiciona a vida do jogador (agora representando a energia)
    let isPlayerTurn = false; // Variável para controlar o turno

    const monsterData = {
        "lobo": {
            nome: "Lobo Faminto",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um lobo selvagem com presas afiadas.",
            habilidade: 3,
            couraça: 12,
            pontosDeEnergia: 20,
            dano: "1D6" // Adiciona o dano do monstro
        },
        "goblin": {
            nome: "Goblin Sorrateiro",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um pequeno goblin com olhos espertos.",
            habilidade: 2,
            couraça: 10,
            pontosDeEnergia: 15,
            dano: "1D4" // Adiciona o dano do monstro
        }
    };
    currentMonster = monsterData[monsterName]; // Atribui o valor de currentMonster aqui

    if (currentMonster) {
        console.log("Dados do monstro (carregamento inicial):", currentMonster);
        document.getElementById("monster-name").innerText = currentMonster.nome;
        document.getElementById("monster-description").innerText = currentMonster.descricao;
        const monsterImageElement = document.getElementById("monster-image");
        if (monsterImageElement) {
            monsterImageElement.src = currentMonster.imagem;
        } else {
            console.error("Elemento de imagem do monstro não encontrado (ID: monster-image)");
        }
    } else {
        console.error("Monstro não encontrado:", monsterName);
        document.getElementById("monster-name").innerText = "Monstro não encontrado";
        document.getElementById("monster-description").innerText = "O monstro especificado na URL não foi encontrado.";
    }

    // Função para salvar o estado da batalha no Firestore
    function saveBattleState(userId, monsterName, monsterHealth, playerHealth) {
        const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
        setDoc(battleDocRef, { monsterHealth: monsterHealth, playerHealth: playerHealth }, { merge: true })
            .then(() => {
                console.log("Estado da batalha salvo no Firestore.");
            })
            .catch((error) => {
                console.error("Erro ao salvar o estado da batalha:", error);
            });
    }

    // Função para carregar o estado da batalha do Firestore
    function loadBattleState(userId, monsterName) {
        const battleDocRef = doc(db, "battles", `${userId}_${monsterName}`);
        return getDoc(battleDocRef)
            .then(docSnap => {
                if (docSnap.exists()) {
                    console.log("Estado da batalha carregado do Firestore:", docSnap.data());
                    return docSnap.data();
                } else {
                    console.log("Nenhum estado de batalha encontrado para este monstro.");
                    return null;
                }
            })
            .catch((error) => {
                console.error("Erro ao carregar o estado da batalha:", error);
                return null;
            });
    }

    // Função para o ataque do monstro
    function monsterAttack() {
        if (!currentMonster || playerHealth <= 0) return; // Se o monstro não existir ou o jogador estiver derrotado, não ataca

        battleLogContent.innerHTML += `<hr><p><strong>Turno do ${currentMonster.nome}</strong></p>`;

        // Rola o ataque do monstro (1D20 + habilidade do monstro)
        const monsterAttackRoll = Math.floor(Math.random() * 20) + 1 + currentMonster.habilidade;
        battleLogContent.innerHTML += `<p>${currentMonster.nome} rolou <strong>${monsterAttackRoll}</strong> para atacar.</p>`;

        // Compara com a defesa do jogador (vamos assumir que o jogador tem uma defesa base por enquanto)
        const playerDefense = playerData?.defesa ? parseInt(playerData.defesa) : 10; // Pega a defesa do jogador ou usa 10 como base
        battleLogContent.innerHTML += `<p>Sua Defesa é <strong>${playerDefense}</strong>.</p>`;

        if (monsterAttackRoll >= playerDefense) {
            battleLogContent.innerHTML += `<p>O ataque do ${currentMonster.nome} acertou!</p>`;

            // Rola o dano do monstro
            const monsterDamageRoll = rollDice(currentMonster.dano);
            console.log("Dano rolado pelo monstro:", monsterDamageRoll); // ADICIONADO LOG
            console.log("Energia do jogador antes do dano:", playerHealth); // ADICIONADO LOG
            playerHealth -= monsterDamageRoll;
            battleLogContent.innerHTML += `<p>${currentMonster.nome} causou <strong>${monsterDamageRoll}</strong> de dano.</p>`;
            battleLogContent.innerHTML += `<p>Sua energia restante: <strong>${playerHealth}</strong>.</p>`; // Atualiza a mensagem para "energia"
            console.log("Energia do jogador depois do dano:", playerHealth); // ADICIONADO LOG

            // Atualiza a energia do jogador na ficha e salva o estado da batalha
            const user = auth.currentUser;
            if (user) {
                updatePlayerEnergyInFirestore(user.uid, playerHealth);
                saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
            }

            // Verifica se o jogador foi derrotado
            if (playerHealth <= 0) {
                battleLogContent.innerHTML += `<p><strong style="color: red;">Você foi derrotado!</strong></p>`;
                // Lógica adicional de fim de batalha pode ser adicionada aqui
            }
        } else {
            battleLogContent.innerHTML += `<p>O ataque do ${currentMonster.nome} errou.</p>`;
        }

        // Após o ataque do monstro, é o turno do jogador novamente (se o jogador não foi derrotado)
        console.log("Energia do jogador antes de exibir opções:", playerHealth); // ADICIONADO LOG
        console.log("Elemento attackOptionsDiv:", attackOptionsDiv); // ADICIONADO LOG
        if (playerHealth > 0) {
            attackOptionsDiv.style.display = 'block';
            isPlayerTurn = true; // ADICIONEI ESTA LINHA AQUI!!!
        }
    }

    // Verifica o estado da batalha no Session Storage
    const initiativeResult = sessionStorage.getItem('initiativeResult');
    const playerInitiativeRoll = sessionStorage.getItem('playerInitiativeRoll');
    const monsterInitiativeRoll = sessionStorage.getItem('monsterInitiativeRoll');
    const playerAbilityStored = sessionStorage.getItem('playerAbility');
    const monsterAbilityStored = sessionStorage.getItem('monsterAbility');
    const luteButtonClicked = sessionStorage.getItem('luteButtonClicked') === 'true';

    console.log("DOMContentLoaded: initiativeResult =", initiativeResult);

    if (initiativeResult && currentMonster) { // Garante que currentMonster esteja definido
        console.log("DOMContentLoaded: initiativeResult encontrado:", initiativeResult);
        if (lutarButton) lutarButton.style.display = 'none';
        if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'none';
        battleLogContent.innerHTML = ""; // Limpa o log para reconstruir
        if (playerInitiativeRoll && monsterInitiativeRoll && playerAbilityStored !== null && monsterAbilityStored !== null) {
            battleLogContent.innerHTML += `<p>Você rolou ${playerInitiativeRoll} + ${playerAbilityStored} (Habilidade) = <strong>${parseInt(playerInitiativeRoll) + parseInt(playerAbilityStored)}</strong> para iniciativa.</p>`;
            battleLogContent.innerHTML += `<p>${currentMonster.nome} rolou ${monsterInitiativeRoll} + ${monsterAbilityStored} (Habilidade) = <strong>${parseInt(monsterInitiativeRoll) + parseInt(monsterAbilityStored)}</strong> para iniciativa.</p>`;
        }
        if (initiativeResult === 'player') {
            battleLogContent.innerHTML += `<p>Você venceu a iniciativa e atacará primeiro.</p>`;
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'block';
            isPlayerTurn = true;
        } else if (initiativeResult === 'monster') {
            battleLogContent.innerHTML += `<p>${currentMonster.nome} venceu a iniciativa e atacará primeiro.</p>`;
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
            isPlayerTurn = false;
            monsterAttack(); // Monstro ataca primeiro
        } else if (initiativeResult === 'tie') {
            battleLogContent.innerHTML += `<p>Houve um empate na iniciativa!</p>`;
            if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'block'; // Permitir rolar novamente em caso de empate
        }
    } else if (luteButtonClicked) {
        console.log("DOMContentLoaded: luteButtonClicked é true, iniciativa não rolada.");
        if (lutarButton) lutarButton.style.display = 'none';
        if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'block';
    } else {
        console.log("DOMContentLoaded: Estado inicial.");
        if (lutarButton) lutarButton.style.display = 'block';
        if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'none';
        if (attackOptionsDiv) attackOptionsDiv.style.display = 'none'; // Garante que as opções de ataque estejam escondidas inicialmente
        battleLogContent.innerHTML = ""; // Limpa o log no estado inicial
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado!
            const userId = user.uid;
            console.log("ID do usuário logado:", userId); // ADICIONEI ESTE LOG
            const monsterName = getUrlParameter('monstro');

            // Carregar o estado da batalha ao carregar a página
            if (currentMonster) {
                loadBattleState(userId, monsterName)
                    .then(savedState => {
                        if (savedState) {
                            currentMonster.pontosDeEnergia = savedState.monsterHealth;
                            playerHealth = savedState.playerHealth;
                            console.log("Estado da batalha carregado do Firestore:", savedState);
                            console.log("Pontos de Energia do monstro carregados:", currentMonster.pontosDeEnergia);
                            console.log("Energia do jogador carregada:", playerHealth); // Atualiza a mensagem para "energia"
                            // Atualizar a interface com a energia do jogador (se houver um elemento para isso)
                            const playerHealthDisplay = document.getElementById("player-health");
                            if (playerHealthDisplay) {
                                playerHealthDisplay.innerText = playerHealth;
                            }
                            // Se a vida do monstro for <= 0 ou a vida do jogador for <= 0, a batalha acabou
                            if (currentMonster.pontosDeEnergia <= 0) {
                                battleLogContent.innerHTML += `<p><strong style="color: green;">${currentMonster.nome} foi derrotado!</strong></p>`;
                                attackOptionsDiv.style.display = 'none';
                            } else if (playerHealth <= 0) {
                                battleLogContent.innerHTML += `<p><strong style="color: red;">Você foi derrotado!</strong></p>`;
                                attackOptionsDiv.style.display = 'none';
                            }
                        } else {
                            // Se não houver estado salvo, usa os pontos de energia iniciais e define a energia do jogador
                            console.log("Usando pontos de energia iniciais do monstro e definindo energia inicial do jogador.");
                            // Defina a energia inicial do jogador com base nos dados do personagem (a ser carregado)
                        }
                        document.getElementById("monster-name").innerText = currentMonster.nome;
                        // A descrição e a imagem já foram carregadas inicialmente
                    });
            }

            const playerDocRef = doc(db, "players", user.uid);
            getDoc(playerDocRef)
                .then(docSnap => {
                    if (docSnap.exists()) {
                        playerData = docSnap.data();
                        const playerAbilityValue = playerData.habilidade ? playerData.habilidade : 0;
                        playerHealth = playerData.energia ? parseInt(playerData.energia) : 8; // Retornando ao fallback de 8
                        const inventarioButton = document.getElementById("abrir-inventario");
                        const playerHealthDisplay = document.getElementById("player-health");
                        if (inventarioButton) inventarioButton.disabled = false;
                        if (playerHealthDisplay) playerHealthDisplay.innerText = playerHealth; // Exibe a energia inicial do jogador

                        if (lutarButton) {
                            lutarButton.disabled = false;
                            lutarButton.addEventListener('click', () => {
                                lutarButton.style.display = 'none';
                                if (rolarIniciativaButton) {
                                    rolarIniciativaButton.style.display = 'block';
                                    sessionStorage.setItem('luteButtonClicked', 'true');
                                } else {
                                    console.error("Botão 'Rolar Iniciativa' não encontrado (ID: rolar-iniciativa)");
                                }
                            });
                        }

                        // Event listener para o botão "Rolar Iniciativa"
                        if (rolarIniciativaButton) {
                            rolarIniciativaButton.addEventListener('click', () => {
                                const playerRoll = Math.floor(Math.random() * 20) + 1;
                                const monsterRoll = Math.floor(Math.random() * 20) + 1;
                                const monsterAbilityValue = currentMonster.habilidade;

                                battleLogContent.innerHTML += `<p>Você rolou ${playerRoll} + ${playerAbilityValue} (Habilidade) = <strong>${playerRoll + playerAbilityValue}</strong> para iniciativa.</p>`;
                                battleLogContent.innerHTML += `<p>${currentMonster.nome} rolou ${monsterRoll} + ${monsterAbilityValue} (Habilidade) = <strong>${monsterRoll + monsterAbilityValue}</strong> para iniciativa.</p>`;

                                let initiativeWinner = '';
                                if (playerRoll + playerAbilityValue > monsterRoll + monsterAbilityValue) {
                                    battleLogContent.innerHTML += `<p>Você venceu a iniciativa! Você ataca primeiro.</p>`;
                                    if (attackOptionsDiv) {
                                        attackOptionsDiv.style.display = 'block';
                                    }
                                    initiativeWinner = 'player';
                                    isPlayerTurn = true;
                                    console.log("Jogador venceu a iniciativa! initiativeWinner =", initiativeWinner); // ADICIONADO LOG
                                    sessionStorage.setItem('initiativeResult', initiativeWinner);
                                    console.log("initiativeResult salvo no Session Storage:", sessionStorage.getItem('initiativeResult')); // ADICIONADO LOG
                                } else if (monsterRoll + monsterAbilityValue > playerRoll + playerAbilityValue) {
                                    battleLogContent.innerHTML += `<p>${currentMonster.nome} venceu a iniciativa! O monstro ataca primeiro.</p>`;
                                    initiativeWinner = 'monster';
                                    isPlayerTurn = false;
                                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
                                    monsterAttack(); // Monstro ataca primeiro
                                } else {
                                    battleLogContent.innerHTML += `<p>Houve um empate na iniciativa!</p>`;
                                    initiativeWinner = 'tie';
                                    isPlayerTurn = false;
                                    if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'block';
                                }

                                sessionStorage.setItem('playerInitiativeRoll', playerRoll.toString());
                                sessionStorage.setItem('monsterInitiativeRoll', monsterRoll.toString());
                                sessionStorage.setItem('playerAbility', playerAbilityValue.toString());
                                sessionStorage.setItem('monsterAbility', monsterAbilityValue.toString());

                                rolarIniciativaButton.style.display = 'none';
                                sessionStorage.removeItem('luteButtonClicked');
                            });
                        } else {
                            console.error("Botão 'Rolar Iniciativa' não encontrado (ID: rolar-iniciativa)");
                        }

                        // Lógica para o botão "Corpo a Corpo"
                        const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
                        const rolarDanoButton = document.getElementById("rolar-dano");

                        if (atacarCorpoACorpoButton) {
                            atacarCorpoACorpoButton.addEventListener('click', () => {
                                if (!isPlayerTurn) {
                                    battleLogContent.innerHTML += `<p>Não é seu turno!</p>`;
                                    return;
                                }
                                const playerAttackRoll = Math.floor(Math.random() * 20) + 1 + playerAbilityValue; // Adiciona a habilidade ao ataque
                                const monsterArmorClass = currentMonster.couraça; // Obtém a couraça do monstro

                                battleLogContent.innerHTML += `<p>Você atacou corpo a corpo e rolou um <strong>${playerAttackRoll}</strong> (1D20 + ${playerAbilityValue} de Habilidade).</p>`;

                                if (playerAttackRoll >= monsterArmorClass) {
                                    battleLogContent.innerHTML += `<p>Seu ataque acertou o ${currentMonster.nome} (Couraça: ${monsterArmorClass})!</p>`;
                                    atacarCorpoACorpoButton.style.display = 'none';
                                    if (rolarDanoButton) {
                                        rolarDanoButton.style.display = 'block';
                                    }
                                } else {
                                    battleLogContent.innerHTML += `<p>Seu ataque errou o ${currentMonster.nome} (Couraça: ${monsterArmorClass}).</p>`;
                                    attackOptionsDiv.style.display = 'none'; // Fim do turno do jogador
                                    isPlayerTurn = false;
                                    monsterAttack(); // Turno do monstro
                                }
                            });
                        } else {
                            console.error("Botão 'Corpo a Corpo' não encontrado (ID: atacar-corpo-a-corpo)");
                        }

                        // Event listener para o botão "DANO"
                        if (rolarDanoButton) {
                            rolarDanoButton.addEventListener('click', () => {
                                if (!isPlayerTurn) {
                                    battleLogContent.innerHTML += `<p>Não é seu turno!</p>`;
                                    return;
                                }
                                let playerDamage;
                                if (playerData && playerData.dano) {
                                    playerDamage = playerData.dano;
                                } else {
                                    playerDamage = "1"; // Define o dano padrão como "1"
                                }
                                const damageRollResult = rollDice(playerDamage);
                                currentMonster.pontosDeEnergia -= damageRollResult;
                                battleLogContent.innerHTML += `<p>Você rolou <strong>${damageRollResult}</strong> de dano (${playerDamage})!</p>`;
                                battleLogContent.innerHTML += `<p>${currentMonster.nome} sofreu ${damageRollResult} de dano. Pontos de Energia restantes: ${currentMonster.pontosDeEnergia}.</p>`;
                                rolarDanoButton.style.display = 'none';
                                attackOptionsDiv.style.display = 'none'; // Fim do turno do jogador
                                isPlayerTurn = false;

                                // Salvar o estado da batalha no Firestore
                                if (currentMonster && user) {
                                    saveBattleState(user.uid, monsterName, currentMonster.pontosDeEnergia, playerHealth);
                                }

                                // Verifica se o monstro foi derrotado
                                if (currentMonster.pontosDeEnergia <= 0) {
                                    battleLogContent.innerHTML += `<p><strong style="color: green;">${currentMonster.nome} foi derrotado!</strong></p>`;
                                    // Aqui você pode adicionar lógica para recompensar o jogador e, opcionalmente, restaurar parte da energia.
                                } else {
                                    monsterAttack(); // Turno do monstro se o monstro ainda estiver vivo
                                }
                            });
                        } else {
                            console.error("Botão 'DANO' não encontrado (ID: rolar-dano)");
                        }

                    } else {
                        console.log("Nenhum documento encontrado para o jogador:", user.uid);
                        alert("Dados do jogador não encontrados. Por favor, crie seu personagem.");
                        window.location.href = "character-creation.html";
                    }
                })
                .catch(error => {
                    console.error("Erro ao buscar dados do jogador:", error);
                });
        } else {
            // Nenhum usuário está logado. Redirecionar para a página de login.
            const currentPageUrl = window.location.href;
            window.location.href = `index.html?redirect=${encodeURIComponent(currentPageUrl)}`;
        }
    });
});
