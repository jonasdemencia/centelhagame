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

    "rato-gigante": {
        nome: "Rato Gigante",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma criatura nojenta, do tamanho de um cão.",
        habilidade: 1,
        couraça: 1,
        pontosDeEnergia: 1,
        pontosDeEnergiaMax: 1,
        experiencia: 20,
        dano: "1D4"
    },
    "ogro": {
        nome: "Ogro Brutamontes",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma fera enorme e brutal com um porrete improvisado.",
        habilidade: 4,
        couraça: 8,
        pontosDeEnergia: 5,
        pontosDeEnergiaMax: 5,
        experiencia: 150,
        dano: "2D6",
        drops: [
            {
                id: "pocao-cura-media",
                content: "Poção de Cura Média",
                consumable: true,
                quantity: 1,
                effect: "heal",
                value: 5,
                description: "Restaura uma boa quantidade de energia vital."
            }
        ]
    },
    "aranha-venenosa": {
        nome: "Aranha Venenosa",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma aranha de tamanho médio, com presas repletas de veneno.",
        habilidade: 4,
        couraça: 3,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 55,
        dano: "1D6"
    },
    "zumbi": {
        nome: "Zumbi Cambaleante",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um morto-vivo lento, mas persistente.",
        habilidade: 1,
        couraça: 1,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 70,
        dano: "1D8"
    },
    "harpia": {
        nome: "Harpia Cruel",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma criatura alada com garras afiadas e um grito ensurdecedor.",
        habilidade: 6,
        couraça: 4,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 80,
        dano: "1D10"
    },
    "verme-da-terra": {
        nome: "Verme Gigante da Terra",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um verme colossal que surge do subsolo sem aviso.",
        habilidade: 2,
        couraça: 5,
        pontosDeEnergia: 4,
        pontosDeEnergiaMax: 4,
        experiencia: 90,
        dano: "2D4"
    },
    "bandido": {
        nome: "Bandido de Estrada",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um ladrão armado à espreita nas estradas.",
        habilidade: 3,
        couraça: 3,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 60,
        dano: "1D8"
    },
    "morcego-sanguessuga": {
        nome: "Morcego Sanguessuga",
        imagem: "https://via.placeholder.com/150",
        descricao: "Ataca com mordidas que drenam vitalidade.",
        habilidade: 5,
        couraça: 1,
        pontosDeEnergia: 1,
        pontosDeEnergiaMax: 1,
        experiencia: 35,
        dano: "1D4"
    },
    "elemental-fogo": {
        nome: "Elemental de Fogo",
        imagem: "https://via.placeholder.com/150",
        descricao: "Chamas vivas que atacam com calor incandescente.",
        habilidade: 6,
        couraça: 5,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 100,
        dano: "1D12"
    },
    "espectro": {
        nome: "Espectro Sombrio",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma alma penada que atravessa paredes.",
        habilidade: 7,
        couraça: 2,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 90,
        dano: "1D10"
    },
    "mimico": {
        nome: "Mímico",
        imagem: "https://via.placeholder.com/150",
        descricao: "Parece um baú, mas esconde uma criatura faminta.",
        habilidade: 3,
        couraça: 6,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 120,
        dano: "2D6",
        drops: [
            {
                id: "ouro",
                content: "Moedas de Ouro",
                quantity: 25,
                description: "Uma pequena fortuna escondida no baú."
            }
        ]
    },
    "lobo-alfa": {
        nome: "Lobo Alfa",
        imagem: "https://via.placeholder.com/150",
        descricao: "O líder da matilha, feroz e dominante.",
        habilidade: 6,
        couraça: 5,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 80,
        dano: "1D10"
    },
    "escaravelho-explosivo": {
        nome: "Escaravelho Explosivo",
        imagem: "https://via.placeholder.com/150",
        descricao: "Explode ao contato, causando dano em área.",
        habilidade: 4,
        couraça: 1,
        pontosDeEnergia: 1,
        pontosDeEnergiaMax: 1,
        experiencia: 45,
        dano: "1D8"
    },
    "necromante-aprendiz": {
        nome: "Necromante Aprendiz",
        imagem: "https://via.placeholder.com/150",
        descricao: "Um jovem feiticeiro treinando com magia sombria.",
        habilidade: 5,
        couraça: 2,
        pontosDeEnergia: 3,
        pontosDeEnergiaMax: 3,
        experiencia: 110,
        dano: "1D10"
    },
    "golem-de-pedra": {
        nome: "Golem de Pedra",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma criatura massiva feita de rocha sólida.",
        habilidade: 2,
        couraça: 10,
        pontosDeEnergia: 5,
        pontosDeEnergiaMax: 5,
        experiencia: 150,
        dano: "2D8"
    },
    "serpente-do-pantano": {
        nome: "Serpente do Pântano",
        imagem: "https://via.placeholder.com/150",
        descricao: "Reptil sorrateiro com veneno paralisante.",
        habilidade: 6,
        couraça: 3,
        pontosDeEnergia: 2,
        pontosDeEnergiaMax: 2,
        experiencia: 70,
        dano: "1D6"
    },
    "arvore-viva": {
        nome: "Árvore Viva",
        imagem: "https://via.placeholder.com/150",
        descricao: "Uma árvore mágica que ganha vida e protege a floresta.",
        habilidade: 2,
        couraça: 9,
        pontosDeEnergia: 4,
        pontosDeEnergiaMax: 4,
        experiencia: 130,
        dano: "2D4"
    },

    
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
