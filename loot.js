// Importa os SDKs necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Configuração do Firebase
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
const db = getFirestore(app);
const auth = getAuth(app);

const itensObtidosDiv = document.getElementById("itens-obtidos");
const inventarioButton = document.getElementById("inventario-button");
let recolherTudoButton = null; // Inicialmente nulo
const mensagemDiv = document.createElement("div");
mensagemDiv.id = "mensagem";
document.body.insertBefore(mensagemDiv, inventarioButton);

// Função para obter o UID do usuário logado
function getLoggedInUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// Função para exibir os itens obtidos do Firestore
async function exibirItens() {
    itensObtidosDiv.innerHTML = ""; // Limpa a exibição anterior
    const userId = getLoggedInUserId();

    if (!userId) {
        console.error("Usuário não autenticado.");
        mensagemDiv.textContent = "Erro: Usuário não autenticado.";
        return;
    }

    const lootCollectionRef = collection(db, "users", userId, "loot");
    const lootSnapshot = await getDocs(lootCollectionRef);
    const itensObtidos = [];
    lootSnapshot.forEach(doc => {
        itensObtidos.push({ id: doc.id, ...doc.data() });
    });

    if (itensObtidos.length > 0 && !recolherTudoButton) {
        recolherTudoButton = document.createElement("button");
        recolherTudoButton.id = "recolher-tudo-button";
        recolherTudoButton.textContent = "Recolher Tudo";
        recolherTudoButton.addEventListener("click", recolherTudo);
        document.body.insertBefore(recolherTudoButton, inventarioButton);
    } else if (itensObtidos.length === 0 && recolherTudoButton) {
        removerRecolherTudoButton();
    }

    itensObtidos.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        itemDiv.setAttribute("data-item-id", item.id); // <-- ESSA LINHA FOI ADICIONADA

        itemDiv.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <p>${item.nome} (x${item.quantidade})</p>
            <button onclick="recolherItem('${item.id}')">Recolher</button>
        `;

        itensObtidosDiv.appendChild(itemDiv);
    });
}

// Função para remover o botão "Recolher Tudo"
function removerRecolherTudoButton() {
    if (recolherTudoButton) {
        recolherTudoButton.remove();
        recolherTudoButton = null;
    }
}

// Função para recolher um item individualmente do Firestore e removê-lo do DOM
async function recolherItem(itemId) {
    const userId = getLoggedInUserId();
    if (!userId) return;

    const lootItemRef = doc(db, "users", userId, "loot", itemId);
    const lootDoc = await getDoc(lootItemRef);

    if (lootDoc.exists()) {
        const itemData = lootDoc.data();
        await adicionarAoInventario(itemData);
        await deleteDoc(lootItemRef);
        exibirMensagem(`Você recolheu: ${itemData.nome}`);

        // Remove o item do DOM sem precisar recarregar toda a lista
        const itemDiv = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemDiv) {
            itemDiv.remove();
        }

        // Se não houver mais itens, remova o botão "Recolher Tudo"
        const restanteDeItens = document.querySelectorAll(".item");
        if (restanteDeItens.length === 0) {
            removerRecolherTudoButton();
        }
    }
}

// Função para recolher todos os itens do Firestore
async function recolherTudo() {
    const userId = getLoggedInUserId();
    if (!userId) return;

    const lootCollectionRef = collection(db, "users", userId, "loot");
    const lootSnapshot = await getDocs(lootCollectionRef);

    if (!lootSnapshot.empty) {
        const promises = [];
        lootSnapshot.forEach(doc => {
            const itemData = doc.data();
            promises.push(adicionarAoInventario(itemData));
            promises.push(deleteDoc(doc.ref));
        });
        await Promise.all(promises);
        exibirMensagem(`Todos os itens foram recolhidos!`);
        exibirItens();
    } else {
        exibirMensagem("Nenhum item para recolher.");
    }
}

// Função para adicionar um item ao inventário do Firestore
async function adicionarAoInventario(itemParaAdicionar) {
    const userId = getLoggedInUserId();
    if (!userId) return;

    const inventarioCollectionRef = collection(db, "users", userId, "inventory");
    const itemDocRef = doc(inventarioCollectionRef, itemParaAdicionar.nome); // Usando o nome como ID para facilitar a verificação

    const docSnap = await getDoc(itemDocRef);

    if (docSnap.exists()) {
        // Item já existe, incrementa a quantidade
        await updateDoc(itemDocRef, {
            quantidade: increment(itemParaAdicionar.quantidade)
        });
        console.log(`Quantidade de ${itemParaAdicionar.nome} aumentada no inventário.`);
    } else {
        // Item não existe, adiciona ao inventário
        await setDoc(itemDocRef, {
            nome: itemParaAdicionar.nome,
            imagem: itemParaAdicionar.imagem,
            quantidade: itemParaAdicionar.quantidade
        });
        console.log(`${itemParaAdicionar.nome} adicionado ao inventário.`);
    }
}

// Função para exibir mensagens na página
function exibirMensagem(mensagem) {
    mensagemDiv.textContent = mensagem;
    setTimeout(() => {
        mensagemDiv.textContent = "";
    }, 3000); // Limpa a mensagem após 3 segundos
}

// Evento de clique do botão "Inventário"
inventarioButton.addEventListener("click", () => {
    const userId = getLoggedInUserId();
    if (userId) {
        window.location.href = "inventory.html"; // Redireciona para a página de inventário
    } else {
        exibirMensagem("Você precisa estar logado para ver o inventário.");
    }
});

// Função para simular o recebimento de novos itens (para testes)
async function simularRecebimentoDeItens(novosItens) {
    const userId = getLoggedInUserId();
    if (!userId) return;

    for (const item of novosItens) {
        const lootCollectionRef = collection(db, "users", userId, "loot");
        await setDoc(doc(lootCollectionRef), item);
    }
    exibirItens(); // Atualiza a exibição após adicionar os itens
}

// Dados de exemplo dos itens obtidos (para simulação)
const itensDeExemplo = [
    { nome: "Poção de Vida", imagem: "pocao.png", quantidade: 2 },
    { nome: "Espada de Ferro", imagem: "espada.png", quantidade: 1 },
    { nome: "Moedas de Ouro", imagem: "moedas.png", quantidade: 10 },
];

// Simula o recebimento de itens ao carregar a página (apenas para demonstração)
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado antes de tentar exibir os itens
    onAuthStateChanged(auth, (user) => {
        if (user) {
            simularRecebimentoDeItens(itensDeExemplo);
        } else {
            mensagemDiv.textContent = "Faça login para ver os itens.";
        }
    });
});

// 🔓 Torna as funções acessíveis no escopo global (para funcionar com onclick no HTML)
window.recolherItem = recolherItem;
window.recolherTudo = recolherTudo;
