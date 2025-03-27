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
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado!
            const monsterName = getUrlParameter('monstro');
            const monsterData = {
                "lobo": {
                    nome: "Lobo Faminto",
                    imagem: "https://github.com/jonasdemencia/centelhagame/blob/main/piclumen-1741478059758.png?raw=true", // Substitua pela URL real
                    descricao: "Um lobo selvagem com presas afiadas.",
                    habilidade: 3,
                    couraça: 12,
                    pontosDeEnergia: 20
                },
                "goblin": {
                    nome: "Goblin Sorrateiro",
                    imagem: "https://github.com/jonasdemencia/centelhagame/blob/main/piclumen-1737155146344.png?raw=true", // Substitua pela URL real
                    descricao: "Um pequeno goblin com olhos espertos.",
                    habilidade: 2,
                    couraça: 10,
                    pontosDeEnergia: 15
                },
                // Adicione outros monstros conforme necessário
            };
            const currentMonster = monsterData[monsterName];

            if (currentMonster) {
                console.log("Dados do monstro:", currentMonster);
                // Atualizar a interface com as informações do monstro
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
                            // Armazenar os dados do jogador em variáveis para uso posterior
                            const playerAbility = playerData.dexterity ? playerData.dexterity.total : 0; // Exemplo: usando destreza como habilidade, com fallback para 0
                            const playerAttackBonus = 0; // Inicialmente 0

                            // Habilitar os botões "Inventário" e "Lute"
                            const inventarioButton = document.getElementById("abrir-inventario");
                            const lutarButton = document.getElementById("iniciar-luta");

                            if (inventarioButton) inventarioButton.disabled = false;
                            if (lutarButton) lutarButton.disabled = false;

                        } else {
                            console.log("Nenhum documento encontrado para o jogador:", user.uid);
                            // Lógica para lidar com a ausência de dados do jogador
                            alert("Dados do jogador não encontrados. Por favor, crie seu personagem.");
                            window.location.href = "character-creation.html"; // Redirecionar para a criação de personagem
                        }
                    })
                    .catch(error => {
                        console.error("Erro ao buscar dados do jogador:", error);
                    });
            } else {
                console.error("Monstro não encontrado:", monsterName);
                // Exibir mensagem de erro na página
                document.getElementById("monster-name").innerText = "Monstro não encontrado";
                document.getElementById("monster-description").innerText = "O monstro especificado na URL não foi encontrado.";
            }
        } else {
            // Nenhum usuário está logado. Redirecionar para a página de login.
            const currentPageUrl = window.location.href;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPageUrl)}`;
        }
    });
});
