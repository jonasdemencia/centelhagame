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


// final dos monstros para A Coroa de Ferro 


"guardiao-espectral": {
    nome: "Guardião Espectral",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um guardião poderoso que protege os segredos antigos.",
    habilidade: 8,
    couraça: 5,
    energiaDados: "1d4+2",
    experiencia: 200,
    dano: "1d4+2"
},

    
    "blood-golem": {
    id: "blood-golem",
    nome: "Golem de Sangue",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma criatura humanoide feita inteiramente de sangue coagulado, com olhos vermelhos brilhantes e garras afiadas.",
    habilidade: 6,
    couraça: 2,
    pontosDeEnergia: 3,
    pontosDeEnergiaMax: 3,
    experiencia: 250,
    dano: "2D6",
    drops: [
        {
            id: "blood-core",
            content: "Núcleo de Sangue",
            description: "Um cristal pulsante retirado do peito do golem."
        }
    ]
},

    "esqueleto-guardiao": {
    nome: "Esqueleto Guardião",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um esqueleto guerreiro empunhando uma espada enferrujada.",
    habilidade: 5,
    couraça: 6,
    pontosDeEnergia: 3,
    pontosDeEnergiaMax: 3,
    experiencia: 80,
    dano: "1D8",
    drops: [
        {
            id: "espada-enferrujada",
            content: "Espada Enferrujada",
            description: "Uma espada antiga e enferrujada, mas ainda utilizável."
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


    "senhor-da-morte": {
    nome: "Senhor da Morte",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma entidade esquelética com vestes negras e uma foice de energia cósmica. Seus olhos são estrelas brilhantes em órbitas vazias.",
    habilidade: 12,
    couraça: 15,
    pontosDeEnergia: 24,
    pontosDeEnergiaMax: 24,
    experiencia: 1000,
    dano: "3D6",
    efeito_especial: {
        nome: "Dreno Vital",
        descricao: "Cada ataque bem sucedido drena 2 pontos extras de energia vital",
        dano_adicional: 2
    },
    drops: [
        {
            id: "death-power",
            content: "Poder da Morte",
            description: "O poder absoluto sobre a vida e a morte. Você se torna um novo Senhor da Morte."
        },
        {
            id: "soul-reaper",
            content: "Foice Ceifadora de Almas",
            description: "Uma foice de energia cósmica que drena a força vital dos inimigos.",
            weapon: true,
            damage: "2D6",
            special: "drain"
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










