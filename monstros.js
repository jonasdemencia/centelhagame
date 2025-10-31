// monstros.js - Biblioteca centralizada de monstros para o jogo

// Exporta o objeto monsterData para ser usado em outros arquivos
export const monsterData = {
    // Monstros originais
    "lobo": {
    nome: "Lobo Faminto",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um lobo selvagem com presas afiadas.",
    habilidade: 5,
    couraça: 1,
    energiaDados: "3d8",
    experiencia: 50,
    dano: "1D10", // Mantido para compatibilidade
    ataques: [
        {
            id: "mordida",
            nome: "Mordida Rápida",
            dano: "1d6",
            peso: 70,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "investida",
            nome: "Investida Devastadora",
            dano: "1d10+2", 
            peso: 30,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "O lobo recua e seus olhos brilham com fúria selvagem..."
        }
    ],
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

    "coruja": {
    nome: "Coruja Sombria",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma coruja de olhos penetrantes que guarda os segredos da sala de reuniões.",
    habilidade: 4,
    couraça: 2,
    energiaDados: "2d6",
    experiencia: 40,
    dano: "1D6",
    ataques: [
        {
            id: "bicada",
            nome: "Bicada Afiada",
            dano: "1d4",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "garras",
            nome: "Garras Dilacerantes",
            dano: "1d6+1",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "A coruja abre suas asas e suas garras brilham ameaçadoramente..."
        }
    ]
},


"zumbi": {
    nome: "Zumbi Putrefato",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um morto-vivo em decomposição com movimentos lentos mas persistentes.",
    habilidade: 3,
    couraça: 2,
    energiaDados: "2d8",
    experiencia: 30,
    dano: "1D6",
    ataques: [
        {
            id: "garra",
            nome: "Garra Podre",
            dano: "1d4",
            peso: 80,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "mordida",
            nome: "Mordida Infecta",
            dano: "1d6+1",
            peso: 20,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "O zumbi abre a boca revelando dentes podres..."
        }
    ]
},

"lorde-aldric-zumbi": {
    nome: "Lorde Aldric Morto-Vivo",
    imagem: "https://via.placeholder.com/150",
    descricao: "O antigo governante da vila, agora uma abominação de carne apodrecida em armadura cerimonial.",
    habilidade: 8,
    couraça: 4,
    energiaDados: "6d8+10",
    experiencia: 200,
    dano: "2D6",
    ataques: [
        {
            id: "espada",
            nome: "Golpe de Espada",
            dano: "1d8+2",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "investida",
            nome: "Investida Real",
            dano: "2d6+3",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "Lorde Aldric ergue sua espada e avança com fúria ancestral..."
        }
    ]
},

"necromante": {
    nome: "Morteus, o Necromante",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um feiticeiro das trevas mumificado, cercado por energia sombria.",
    habilidade: 10,
    couraça: 2,
    energiaDados: "5d8+5",
    experiencia: 150,
    dano: "1D8",
    ataques: [
        {
            id: "raio-sombrio",
            nome: "Raio das Trevas",
            dano: "1d6+1",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "drenar-vida",
            nome: "Drenar Vida",
            dano: "1d10+2",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "Morteus estende as mãos e energia sombria se acumula..."
        }
    ]
},


    
    // Novos monstros para A Coroa de Ferro - estrutura completa como o lobo

"cultista-sombra": {
    nome: "Cultista das Sombras",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um seguidor encapuzado de forças sombrias, murmurando encantamentos.",
    habilidade: 4,
    couraça: 2,
    energiaDados: "2d6",
    experiencia: 60,
    dano: "1D8",
    ataques: [
        {
            id: "adaga-sombria",
            nome: "Adaga Sombria",
            dano: "1d6",
            peso: 60,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "maldicao",
            nome: "Maldição das Trevas",
            dano: "1d8+1",
            peso: 40,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "O cultista ergue as mãos e sombras se agitam ao seu redor..."
        }
    ]
},

"servo-pedra": {
    nome: "Servo de Pedra",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma criatura humanóide esculpida em pedra, animada por magia antiga.",
    habilidade: 3,
    couraça: 6,
    energiaDados: "3d6",
    experiencia: 80,
    dano: "1D10",
    ataques: [
        {
            id: "punho-pedra",
            nome: "Punho de Pedra",
            dano: "1d8",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "esmagamento",
            nome: "Esmagamento Brutal",
            dano: "1d10+3",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "O servo ergue ambos os punhos acima da cabeça..."
        }
    ]
},

"guardiao-pedra": {
    nome: "Guardião de Pedra",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um guardião maior e mais poderoso, com runas brilhantes gravadas no corpo.",
    habilidade: 5,
    couraça: 8,
    energiaDados: "4d6",
    experiencia: 120,
    dano: "2D6",
    ataques: [
        {
            id: "martelo-pedra",
            nome: "Martelo de Pedra",
            dano: "1d10",
            peso: 50,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "terremoto",
            nome: "Terremoto Localizado",
            dano: "2d6+2",
            peso: 50,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "O guardião bate o punho no chão e a terra treme..."
        }
    ]
},

"sombra-errante": {
    nome: "Sombra Errante",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma forma sombria que se move pelos corredores, sussurrando lamentos.",
    habilidade: 6,
    couraça: 1,
    energiaDados: "2d4",
    experiencia: 70,
    dano: "1D6",
    ataques: [
        {
            id: "toque-gelo",
            nome: "Toque Gélido",
            dano: "1d4",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "dreno-vida",
            nome: "Dreno de Vida",
            dano: "1d6+2",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "A sombra se expande e escurece ao seu redor..."
        }
    ]
},

"guardiao-antigo": {
    nome: "Guardião Antigo",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um guardião ancestral de pedra, despertado para proteger os altares sagrados.",
    habilidade: 7,
    couraça: 10,
    energiaDados: "5d6",
    experiencia: 200,
    dano: "2D8",
    ataques: [
        {
            id: "lanca-antiga",
            nome: "Lança Ancestral",
            dano: "1d12",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "furia-antiga",
            nome: "Fúria dos Ancestrais",
            dano: "2d8+3",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "Runas antigas brilham no corpo do guardião enquanto ele ruge..."
        }
    ]
},

"sombra-malachar": {
    nome: "Sombra de Malachar",
    imagem: "https://via.placeholder.com/150",
    descricao: "O espírito corrompido do antigo buscador da Coroa, agora uma sombra vingativa.",
    habilidade: 8,
    couraça: 4,
    energiaDados: "4d8",
    experiencia: 300,
    dano: "2D10",
    ataques: [
        {
            id: "espada-sombria",
            nome: "Espada das Sombras",
            dano: "1d10+2",
            peso: 50,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "maldicao-fracasso",
            nome: "Maldição do Fracasso",
            dano: "2d10+4",
            peso: 50,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "Malachar grita sobre seu fracasso e poder sombrio o envolve..."
        }
    ]
},

"sombra-antiga": {
    nome: "Sombra Antiga",
    imagem: "https://via.placeholder.com/150",
    descricao: "Restos espectrais de antigos buscadores que falharam nos testes da Coroa.",
    habilidade: 6,
    couraça: 2,
    energiaDados: "3d6",
    experiencia: 150,
    dano: "1D12",
    ataques: [
        {
            id: "lamento",
            nome: "Lamento dos Perdidos",
            dano: "1d8",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "desespero",
            nome: "Desespero Eterno",
            dano: "1d12+3",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "A sombra sussurra sobre fracassos eternos..."
        }
    ]
},




// Função para obter dados de um monstro pelo ID
export function getMonsterById(monsterId) {
    return monsterData[monsterId] || null;
}











