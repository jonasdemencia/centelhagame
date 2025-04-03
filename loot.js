// Dados de exemplo dos itens obtidos
const itensObtidos = [
    { nome: "Poção de Vida", imagem: "pocao.png", quantidade: 2 },
    { nome: "Espada de Ferro", imagem: "espada.png", quantidade: 1 },
    { nome: "Moedas de Ouro", imagem: "moedas.png", quantidade: 10 },
];

// Dados de exemplo do inventário do jogador (inicialmente vazio)
const inventario = [];

const itensObtidosDiv = document.getElementById("itens-obtidos");
const inventarioButton = document.getElementById("inventario-button");
let recolherTudoButton = null; // Inicialmente nulo
const mensagemDiv = document.createElement("div");
mensagemDiv.id = "mensagem";
document.body.insertBefore(mensagemDiv, inventarioButton);

// Função para exibir os itens na página
function exibirItens() {
    itensObtidosDiv.innerHTML = ""; // Limpa a exibição anterior

    if (itensObtidos.length > 0 && !recolherTudoButton) {
        recolherTudoButton = document.createElement("button");
        recolherTudoButton.id = "recolher-tudo-button";
        recolherTudoButton.textContent = "Recolher Tudo";
        recolherTudoButton.addEventListener("click", recolherTudo);
        document.body.insertBefore(recolherTudoButton, inventarioButton);
    } else if (itensObtidos.length === 0 && recolherTudoButton) {
        removerRecolherTudoButton();
    }

    itensObtidos.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        itemDiv.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <p>${item.nome} (x${item.quantidade})</p>
            <button onclick="recolherItem(${index})">Recolher</button>
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

// Função para recolher um item individualmente
function recolherItem(index) {
    if (index >= 0 && index < itensObtidos.length) {
        const item = itensObtidos[index];
        adicionarAoInventario(item);
        exibirMensagem(`Você recolheu: ${item.nome}`);
        itensObtidos.splice(index, 1);
        exibirItens();
    }
}

// Função para recolher todos os itens
function recolherTudo() {
    if (itensObtidos.length > 0) {
        itensObtidos.forEach(item => {
            adicionarAoInventario(item);
        });
        exibirMensagem(`Todos os itens foram recolhidos!`);
        itensObtidos.length = 0; // Limpa o array de itens obtidos
        exibirItens();
    } else {
        exibirMensagem("Nenhum item para recolher.");
    }
}

// Função para adicionar um item ao inventário
function adicionarAoInventario(itemParaAdicionar) {
    const itemExistente = inventario.find(item => item.nome === itemParaAdicionar.nome);
    if (itemExistente) {
        itemExistente.quantidade += itemParaAdicionar.quantidade;
    } else {
        inventario.push({ ...itemParaAdicionar }); // Adiciona uma cópia do item
    }
    console.log("Inventário atualizado:", inventario); // Para depuração
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
    // Redirecionar para a página de inventário (você precisará implementar essa parte)
    console.log("Abrindo inventário...");
    // Aqui você pode usar window.location.href = "pagina_do_inventario.html";
    // Se você tiver uma página de inventário separada.
    exibirMensagem("Abrindo inventário (funcionalidade não implementada na demonstração).");
});

// Exibir os itens na página ao carregar
exibirItens();
