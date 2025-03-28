// batalha.js

// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    const lutarButton = document.getElementById("iniciar-luta");
    const rolarIniciativaButton = document.getElementById("rolar-iniciativa");
    const battleLogContent = document.getElementById("battle-log-content");
    const attackOptionsDiv = document.getElementById("attack-options");
    const monsterName = getUrlParameter('monstro');
    let currentMonster; // Declara currentMonster no escopo superior

    const monsterData = {
        "lobo": {
            nome: "Lobo Faminto",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um lobo selvagem com presas afiadas.",
            habilidade: 3,
            couraça: 12,
            pontosDeEnergia: 20
        },
        "goblin": {
            nome: "Goblin Sorrateiro",
            imagem: "https://via.placeholder.com/150",
            descricao: "Um pequeno goblin com olhos espertos.",
            habilidade: 2,
            couraça: 10,
            pontosDeEnergia: 15
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
        } else if (initiativeResult === 'monster') {
            battleLogContent.innerHTML += `<p>${currentMonster.nome} venceu a iniciativa e atacará primeiro.</p>`;
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
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
            const playerDocRef = doc(db, "players", user.uid);
            getDoc(playerDocRef)
                .then(docSnap => {
                    if (docSnap.exists()) {
                        const playerData = docSnap.data();
                        const playerAbilityValue = playerData.habilidade ? playerData.habilidade : 0;
                        const inventarioButton = document.getElementById("abrir-inventario");
                        if (inventarioButton) inventarioButton.disabled = false;
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
                                    console.log("Jogador venceu a iniciativa! initiativeWinner =", initiativeWinner); // ADICIONADO LOG
                                    sessionStorage.setItem('initiativeResult', initiativeWinner);
                                    console.log("initiativeResult salvo no Session Storage:", sessionStorage.getItem('initiativeResult')); // ADICIONADO LOG
                                } else if (monsterRoll + monsterAbilityValue > playerRoll + playerAbilityValue) {
                                    battleLogContent.innerHTML += `<p>${currentMonster.nome} venceu a iniciativa! O monstro ataca primeiro.</p>`;
                                    initiativeWinner = 'monster';
                                    if (attackOptionsDiv) attackOptionsDiv.style.display = 'none';
                                } else {
                                    battleLogContent.innerHTML += `<p>Houve um empate na iniciativa!</p>`;
                                    initiativeWinner = 'tie';
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

    // Lógica para o botão "Corpo a Corpo"
    const atacarCorpoACorpoButton = document.getElementById("atacar-corpo-a-corpo");
    if (atacarCorpoACorpoButton) {
        atacarCorpoACorpoButton.addEventListener('click', () => {
            const playerAttackRoll = Math.floor(Math.random() * 20) + 1;
            const monsterArmorClass = currentMonster.couraça; // Obtém a couraça do monstro

            battleLogContent.innerHTML += `<p>Você atacou corpo a corpo e rolou um <strong>${playerAttackRoll}</strong>.</p>`;

            if (playerAttackRoll >= monsterArmorClass) {
                battleLogContent.innerHTML += `<p>Seu ataque acertou o ${currentMonster.nome} (Couraça: ${monsterArmorClass})!</p>`;
                // No próximo passo, implementaremos a rolagem de dano aqui
            } else {
                battleLogContent.innerHTML += `<p>Seu ataque errou o ${currentMonster.nome} (Couraça: ${monsterArmorClass}).</p>`;
            }

            // Após o ataque do jogador, podemos (no futuro) iniciar o turno do monstro aqui
        });
    } else {
        console.error("Botão 'Corpo a Corpo' não encontrado (ID: atacar-corpo-a-corpo)");
    }
});
