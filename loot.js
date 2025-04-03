// Dados de exemplo dos itens obtidos
const itensObtidos = [
    { nome: "Poção de Vida", imagem: "pocao.png", quantidade: 2 },
    { nome: "Espada de Ferro", imagem: "espada.png", quantidade: 1 },
    { nome: "Moedas de Ouro", imagem: "moedas.png", quantidade: 10 },
];

const itensObtidosDiv = document.getElementById("itens-obtidos");
const inventarioButton = document.getElementById("inventario-button");

// Função para exibir os itens na página
function exibirItens() {
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

// Função para recolher um item
function recolherItem(index) {
    const item = itensObtidos[index];
    // Adicionar o item ao inventário do jogador (você precisará implementar essa parte)
    console.log(`Item "${item.nome}" recolhido!`);
    // Remover o item da lista de itens obtidos
    itensObtidos.splice(index, 1);
    // Atualizar a exibição dos itens
    itensObtidosDiv.innerHTML = "";
    exibirItens();
}

// Evento de clique do botão "Inventário"
inventarioButton.addEventListener("click", () => {
    // Redirecionar para a página de inventário (você precisará implementar essa parte)
    console.log("Abrindo inventário...");
});

// Exibir os itens na página ao carregar
exibirItens();