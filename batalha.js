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

    // Verifica o estado da batalha no Session Storage
    const initiativeResult = sessionStorage.getItem('initiativeResult');
    const luteButtonClicked = sessionStorage.getItem('luteButtonClicked') === 'true';

    console.log("DOMContentLoaded: initiativeResult =", initiativeResult);

    if (initiativeResult) {
        console.log("DOMContentLoaded: initiativeResult encontrado:", initiativeResult);
        if (lutarButton) lutarButton.style.display = 'none';
        if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'none';
        battleLogContent.innerHTML = ""; // Limpa o log antes de adicionar a mensagem persistida
        if (initiativeResult === 'player') {
            battleLogContent.innerHTML += `<p>Você venceu a iniciativa e atacará primeiro.</p>`;
            if (attackOptionsDiv) attackOptionsDiv.style.display = 'block';
        } else if (initiativeResult === 'monster') {
            battleLogContent.innerHTML += `<p>O monstro venceu a iniciativa e atacará primeiro.</p>`;
            // Aqui, no futuro, implementaremos a ação do monstro
        } else if (initiativeResult === 'tie') {
            battleLogContent.innerHTML += `<p>Houve um empate na iniciativa!</p>`;
            // Lógica de desempate, se houver
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
            const monsterName = getUrlParameter('monstro');
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
            const currentMonster = monsterData[monsterName];

            if (currentMonster) {
                console.log("Dados do monstro:", currentMonster);
                document.getElementById("monster-name").innerText = currentMonster.nome;
                document.getElementById("monster-description").innerText = currentMonster.descricao;
                const monsterImageElement = document.getElementById("monster-image");
                if (monsterImageElement) {
                    monsterImageElement.src = currentMonster.imagem;
                } else {
                    console.error("Elemento de imagem do monstro não encontrado (ID: monster-image)");
                }

                const playerDocRef = doc(db, "players", user.uid);
                getDoc(playerDocRef)
                    .then(docSnap => {
                        if (docSnap.exists()) {
                            const playerData = docSnap.data();
                            console.log("Dados do jogador:", playerData);
                            const playerAbility = playerData.habilidade ? playerData.habilidade : 0;
                            const playerAttackBonus = 0;

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
                                    const playerTotalInitiative = playerRoll + playerAbility;
                                    const monsterTotalInitiative = monsterRoll + currentMonster.habilidade;

                                    battleLogContent.innerHTML += `<p>Você rolou ${playerRoll} + ${playerAbility} (Habilidade) = <strong>${playerTotalInitiative}</strong> para iniciativa.</p>`;
                                    battleLogContent.innerHTML += `<p>${currentMonster.nome} rolou ${monsterRoll} + ${currentMonster.habilidade} (Habilidade) = <strong>${monsterTotalInitiative}</strong> para iniciativa.</p>`;

                                    let initiativeWinner = '';
                                    if (playerTotalInitiative > monsterTotalInitiative) {
                                        battleLogContent.innerHTML += `<p>Você venceu a iniciativa! Você ataca primeiro.</p>`;
                                        if (attackOptionsDiv) {
                                            attackOptionsDiv.style.display = 'block';
                                        }
                                        initiativeWinner = 'player';
                                        console.log("Iniciativa ganha pelo jogador, initiativeWinner =", initiativeWinner);
                                    } else if (monsterTotalInitiative > playerTotalInitiative) {
                                        battleLogContent.innerHTML += `<p>${currentMonster.nome} venceu a iniciativa! O monstro ataca primeiro.</p>`;
                                        initiativeWinner = 'monster';
                                        console.log("Iniciativa ganha pelo monstro, initiativeWinner =", initiativeWinner);
                                        // Aqui, no futuro, implementaremos a ação do monstro
                                    } else {
                                        battleLogContent.innerHTML += `<p>Houve um empate na iniciativa!</p>`;
                                        initiativeWinner = 'tie';
                                        console.log("Empate na iniciativa, initiativeWinner =", initiativeWinner);
                                        // Podemos adicionar uma lógica de desempate aqui, se necessário
                                        if (rolarIniciativaButton) rolarIniciativaButton.style.display = 'block';
                                    }

                                    sessionStorage.setItem('initiativeResult', initiativeWinner); // Salva o resultado
                                    console.log("initiativeResult salvo no Session Storage:", initiativeWinner);
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
                console.error("Monstro não encontrado:", monsterName);
                document.getElementById("monster-name").innerText = "Monstro não encontrado";
                document.getElementById("monster-description").innerText = "O monstro especificado na URL não foi encontrado.";
            }
        } else {
            // Nenhum usuário está logado. Redirecionar para a página de login.
            const currentPageUrl = window.location.href;
            window.location.href = `index.html?redirect=${encodeURIComponent(currentPageUrl)}`;
        }
    });
});
