// monstros.js - Biblioteca centralizada de monstros para o jogo

// Exporta o objeto monsterData para ser usado em outros arquivos
export const monsterData = {
    // Monstros originais
    "lobo": {
        nome: "Lobo Faminto",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um lobo selvagem com presas afiadas.",
        habilidade: 5,
        couraça: 10,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 50,
        dano: "1D10",
        drops: [
            {
                id: "weapon",
                content: "Espada de madeira",
                description: "Uma espada de treinamento."
            },
            {
                id: "pocao-cura-minima",
                content: "Poção de Cura Minima",
                consumable: true,
                quantity: 2,
                effect: "heal",
                value: 2,
                description: "Uma poção que restaura uma quantidade minima de energia vital."
            }
        ]
    },
    "esqueleto": {
        nome: "Esqueleto Guerreiro",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um esqueleto animado com um velho machado enferrujado.",
        habilidade: 3,
        couraça: 4,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 60,
        dano: "1D8",
        drops: [
            {
                id: "machado-enferrujado",
                content: "Machado Enferrujado",
                description: "Um machado velho e danificado, mas ainda afiado."
            }
        ]
    },
    // ... [todos os outros monstros originais] ...
    "rato-mutante": {
        nome: "Rato Mutante",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um roedor deformado por magia corrompida.",
        habilidade: 4,
        couraça: 2,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 60,
        dano: "1D8"
    },
    
    // Monstros da Torre do Mago
    "golem-cristal": {
        nome: "Golem de Cristal",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma criatura feita de cristais mágicos que brilham com energia arcana.",
        habilidade: 3,
        couraça: 6,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 80,
        dano: "1D10",
        drops: [
            {
                id: "fragmento-cristal",
                content: "Fragmento de Cristal Mágico",
                description: "Um pedaço de cristal que ainda pulsa com energia arcana."
            }
        ]
    },
    "espectro-mago": {
        nome: "Espectro do Mago",
        imagem: "https://via.placeholder.com/150",
        descricao: "O fantasma do antigo mago que habitava esta torre, ainda realizando seus experimentos no além.",
        habilidade: 6,
        couraça: 4,
        pontosDeEnergia: 4,
        pontosDeEnergiaMax: 4,
        experiencia: 120,
        dano: "1D12",
        drops: [
            {
                id: "key-mago",
                content: "Chave do Mago",
                description: "Uma chave ornamentada com símbolos arcanos."
            },
            {
                id: "grimorio-antigo",
                content: "Grimório Antigo",
                description: "Um livro de feitiços escrito em uma língua antiga."
            }
        ]
    }
};

// Função para obter dados de um monstro pelo ID
export function getMonsterById(monsterId) {
    return monsterData[monsterId] || null;
}
