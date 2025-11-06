// monstros.js - Biblioteca centralizada de monstros para o jogo

// Exporta o objeto monsterData para ser usado em outros arquivos
export const monsterData = {
    // Animais
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

    "doberman": {
    nome: "Doberman de Guarda",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um doberman ágil e feroz, treinado para proteger seu território.",
    habilidade: 6,
    couraça: 2,
    energiaDados: "3d8",
    experiencia: 70,
    dano: "1D8", // Mantido para compatibilidade
    ataques: [
        {
            id: "mordida",
            nome: "Mordida Precisa",
            dano: "1d8",
            peso: 65,
            pesoHPBaixo: 35,
            telegrafado: false
        },
        {
            id: "investida",
            nome: "Investida Aterrorizante",
            dano: "1d10+3", 
            peso: 35,
            pesoHPBaixo: 65,
            telegrafado: true,
            mensagemTelegraf: "O doberman rosna baixo, abaixa o corpo e se prepara para saltar com velocidade impressionante..."
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

    "jaguar": {
    nome: "Jaguar da Selva",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um predador silencioso e letal, mestre da emboscada.",
    habilidade: 7,
    couraça: 3,
    energiaDados: "4d8",
    experiencia: 90,
    dano: "1D12",
    ataques: [
        {
            id: "mordida",
            nome: "Mordida na Nuca",
            dano: "1d10",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "salto",
            nome: "Salto Predatório",
            dano: "2d6+2",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "O jaguar se agacha, músculos tensionados para um salto mortal..."
        }
    ]
},

"urso": {
    nome: "Urso Pardo",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma fera massiva com garras que rasgam árvores.",
    habilidade: 8,
    couraça: 4,
    energiaDados: "5d10",
    experiencia: 150,
    dano: "2D8",
    ataques: [
        {
            id: "golpe",
            nome: "Golpe Esmagador",
            dano: "2d6",
            peso: 50,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "abraco",
            nome: "Abraço Esmagador",
            dano: "3d6+4",
            peso: 50,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "O urso se ergue sobre as patas traseiras, mostrando sua altura impressionante..."
        }
    ]
},

"serpente": {
    nome: "Serpente Constritora",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma cobra gigante que esmaga suas presas até a morte.",
    habilidade: 6,
    couraça: 2,
    energiaDados: "3d10",
    experiencia: 80,
    dano: "1D8",
    ataques: [
        {
            id: "picada",
            nome: "Picada Venenosa",
            dano: "1d6",
            peso: 40,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "constricao",
            nome: "Constrição Mortal",
            dano: "2d8+3",
            peso: 60,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "A serpente enrola seu corpo, preparando-se para envolver a presa..."
        }
    ]
},

"aguia": {
    nome: "Águia Real",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma ave de rapina com visão aguçada e garras afiadas.",
    habilidade: 7,
    couraça: 2,
    energiaDados: "3d8",
    experiencia: 75,
    dano: "1D8",
    ataques: [
        {
            id: "garrada",
            nome: "Garrada Aérea",
            dano: "1d8",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "mergulho",
            nome: "Mergulho da Morte",
            dano: "2d8+2",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "A águia ganha altitude, preparando-se para um mergulho em alta velocidade..."
        }
    ]
},

"javali": {
    nome: "Javali Enraivecido",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um animal territorial com presas afiadas e temperamento explosivo.",
    habilidade: 5,
    couraça: 3,
    energiaDados: "4d8",
    experiencia: 85,
    dano: "1D10",
    ataques: [
        {
            id: "chifrada",
            nome: "Chifrada Brutal",
            dano: "1d10",
            peso: 65,
            pesoHPBaixo: 45,
            telegrafado: false
        },
        {
            id: "carga",
            nome: "Carga Incontrolável",
            dano: "2d8+3",
            peso: 35,
            pesoHPBaixo: 55,
            telegrafado: true,
            mensagemTelegraf: "O javali raspa o chão com as patas, bufando furiosamente..."
        }
    ]
},

"escorpiao": {
    nome: "Escorpião Gigante",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um aracnídeo venenoso com uma cauda letal.",
    habilidade: 4,
    couraça: 4,
    energiaDados: "3d8",
    experiencia: 70,
    dano: "1D6",
    ataques: [
        {
            id: "ferrao",
            nome: "Ferrão Venenoso",
            dano: "1d6+2",
            peso: 50,
            pesoHPBaixo: 70,
            telegrafado: false
        },
        {
            id: "pinças",
            nome: "Aperto das Pinças",
            dano: "1d8+1",
            peso: 50,
            pesoHPBaixo: 30,
            telegrafado: true,
            mensagemTelegraf: "O escorpião ergue a cauda, o ferrão brilhando com veneno..."
        }
    ]
},

"tigre": {
    nome: "Tigre Siberiano",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um felino majestoso e extremamente perigoso.",
    habilidade: 9,
    couraça: 3,
    energiaDados: "5d10",
    experiencia: 180,
    dano: "2D8",
    ataques: [
        {
            id: "garras",
            nome: "Garras Dilacerantes",
            dano: "2d6",
            peso: 55,
            pesoHPBaixo: 35,
            telegrafado: false
        },
        {
            id: "rugido",
            nome: "Rugido Paralisante",
            dano: "1d10+4",
            peso: 45,
            pesoHPBaixo: 65,
            telegrafado: true,
            mensagemTelegraf: "O tigre enche o pulmão, preparando-se para um rugido ensurdecedor..."
        }
    ]
},

"crocodilo": {
    nome: "Crocodilo do Pântano",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um réptil ancestral com mandíbulas capazes de esmagar ossos.",
    habilidade: 6,
    couraça: 5,
    energiaDados: "4d12",
    experiencia: 120,
    dano: "2D8",
    ataques: [
        {
            id: "mordida",
            nome: "Mordida Esmagadora",
            dano: "2d8",
            peso: 70,
            pesoHPBaixo: 50,
            telegrafado: false
        },
        {
            id: "rolamento",
            nome: "Rolamento da Morte",
            dano: "3d8+4",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "O crocodilo abre suas mandíbulas enormes, preparando o rolamento mortal..."
        }
    ]
},

"lobo_alfa": {
    nome: "Lobo Alfa",
    imagem: "https://via.placeholder.com/150",
    descricao: "O líder da alcateia, maior e mais experiente que os outros.",
    habilidade: 8,
    couraça: 3,
    energiaDados: "4d10",
    experiencia: 130,
    dano: "1D12",
    ataques: [
        {
            id: "mordida_lider",
            nome: "Mordida do Alfa",
            dano: "1d12",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "uivo",
            nome: "Uivo Assustador",
            dano: "2d6+3",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "O lobo alfa levanta a cabeça, preparando-se para um uivo que convoca a alcateia..."
        }
    ]
},


// Assombrações e monstros


"goblin_guerreiro": {
    nome: "Goblin Guerreiro",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um goblin mais organizado e equipado que seus primos selvagens, usando armaduras improvisadas.",
    habilidade: 5,
    couraça: 1,
    energiaDados: "2d8",
    experiencia: 35,
    dano: "1D6",
    ataques: [
        {
            id: "golpe_espada",
            nome: "Golpe de Espada Curta",
            dano: "1d6+1",
            peso: 70,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "arremesso_adaga",
            nome: "Arremesso de Adaga",
            dano: "1d4+2",
            peso: 30,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "O goblin puxa uma adaga de sua cintura e se prepara para arremessá-la com precisão surpreendente..."
        }
    ]
},

"esqueleto_armado": {
    nome: "Esqueleto Armado",
    imagem: "https://via.placeholder.com/150",
    descricao: "Restos mortais animados por magia negra, vestindo armaduras enferrujadas e empunhando armas antigas.",
    habilidade: 4,
    couraça: 2,
    energiaDados: "2d8",
    experiencia: 25,
    dano: "1D6",
    ataques: [
        {
            id: "golpe_espada",
            nome: "Golpe de Espada Longa",
            dano: "1d6",
            peso: 80,
            pesoHPBaixo: 20,
            telegrafado: false
        },
        {
            id: "investida_ossea",
            nome: "Investida Óssea",
            dano: "1d8",
            peso: 20,
            pesoHPBaixo: 80,
            telegrafado: true,
            mensagemTelegraf: "O esqueleto ajusta sua postura, ossos rangendo, e se prepara para uma investida desesperada..."
        }
    ]
},

"morcego_vampiro": {
    nome: "Morcego Vampiro Gigante",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma espécie rara de morcego que se alimenta de sangue, com envergadura impressionante e presas afiadas.",
    habilidade: 6,
    couraça: 0,
    energiaDados: "3d6",
    experiencia: 45,
    dano: "1D4",
    ataques: [
        {
            id: "mordida_sanguinaria",
            nome: "Mordida Sanguinária",
            dano: "1d4+1",
            peso: 65,
            pesoHPBaixo: 35,
            telegrafado: false
        },
        {
            id: "voo_rapido",
            nome: "Ataque em Voo Rápido",
            dano: "1d6+2",
            peso: 35,
            pesoHPBaixo: 65,
            telegrafado: true,
            mensagemTelegraf: "O morcego ganha altitude rapidamente, preparando-se para um mergulho veloz e preciso..."
        }
    ]
},

"quimera": {
    nome: "Quimera Caótica",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma aberração com cabeça de leão, corpo de cabra e cauda de serpente, capaz de múltiplos ataques.",
    habilidade: 8,
    couraça: 3,
    energiaDados: "7d10",
    experiencia: 160,
    dano: "2D6",
    ataques: [
        {
            id: "mordida_leao",
            nome: "Mordida do Leão",
            dano: "2d6+2",
            peso: 40,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "chifres_cabra",
            nome: "Golpe de Chifres",
            dano: "1d10+3",
            peso: 30,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "picada_serpente",
            nome: "Picada Venenosa",
            dano: "1d8+2",
            peso: 30,
            pesoHPBaixo: 40,
            telegrafado: true,
            mensagemTelegraf: "A cauda de serpente da quimera se ergue, pronta para injetar seu veneno paralisante..."
        }
    ]
},

"lich_menor": {
    nome: "Lich Aprendiz",
    imagem: "https://via.placeholder.com/150",
    descricao: "Um mago que alcançou a imortalidade através de magia negra, comandando feitiços arcanos poderosos.",
    habilidade: 8,
    couraça: 2,
    energiaDados: "6d8",
    experiencia: 150,
    dano: "1D8",
    ataques: [
        {
            id: "raio_arcano",
            nome: "Raio Arcano",
            dano: "2d6+2",
            peso: 50,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "explosao_necrotique",
            nome: "Explosão Necrótica",
            dano: "3d6",
            peso: 30,
            pesoHPBaixo: 50,
            telegrafado: true,
            mensagemTelegraf: "O lich ergue suas mãos esqueléticas, reunindo energia necrótica em uma esfera crescente de poder..."
        },
        {
            id: "drenar_vida",
            nome: "Drenar Vida",
            dano: "1d10+3",
            peso: 20,
            pesoHPBaixo: 20,
            telegrafado: false
        }
    ]
},

    "espectro": {
    nome: "Espectro Sombrio",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma entidade etérea que se alimenta de energia vital, capaz de atravessar matéria sólida.",
    habilidade: 7,
    couraça: 1,
    energiaDados: "4d8",
    experiencia: 85,
    dano: "1D6",
    ataques: [
        {
            id: "toque_spectral",
            nome: "Toque Spectral",
            dano: "1d6+2",
            peso: 70,
            pesoHPBaixo: 30,
            telegrafado: false
        },
        {
            id: "drenar_energia",
            nome: "Drenar Energia Vital",
            dano: "1d8+3",
            peso: 30,
            pesoHPBaixo: 70,
            telegrafado: true,
            mensagemTelegraf: "O espectro emana uma aura fria e estende suas mãos translúcidas em sua direção..."
        }
    ]
},

"minotauro": {
    nome: "Minotauro da Masmorra",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma criatura poderosa com cabeça de touro, conhecida por sua força bruta e fúria incontrolável.",
    habilidade: 8,
    couraça: 3,
    energiaDados: "5d10",
    experiencia: 110,
    dano: "2D6",
    ataques: [
        {
            id: "machadada",
            nome: "Golpe de Machado",
            dano: "2d6+2",
            peso: 60,
            pesoHPBaixo: 40,
            telegrafado: false
        },
        {
            id: "investida_cornada",
            nome: "Investida com Cornada",
            dano: "2d8+4",
            peso: 40,
            pesoHPBaixo: 60,
            telegrafado: true,
            mensagemTelegraf: "O minotauro baixa a cabeça, bufando furiosamente enquanto prepara uma investida devastadora..."
        }
    ]
},

"aracnideo_gigante": {
    nome: "Aranha Gigante da Caverna",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma aranha do tamanho de um cavalo, capaz de tecer teias resistentes e injetar veneno paralisante.",
    habilidade: 6,
    couraça: 2,
    energiaDados: "4d10",
    experiencia: 95,
    dano: "1D8",
    ataques: [
        {
            id: "mordida_venenosa",
            nome: "Mordida Venenosa",
            dano: "1d8+1",
            peso: 55,
            pesoHPBaixo: 45,
            telegrafado: false
        },
        {
            id: "lançar_teia",
            nome: "Lançar Teia Paralisante",
            dano: "0",
            peso: 45,
            pesoHPBaixo: 55,
            telegrafado: true,
            mensagemTelegraf: "A aranha ergue seu abdômen, preparando-se para lançar uma teia grudenta e paralisante..."
        }
    ]
},

"golem_barro": {
    nome: "Golem de Barro",
    imagem: "https://via.placeholder.com/150",
    descricao: "Uma construção mágica de terra e barro, lentamente mas extremamente resistente a danos físicos.",
    habilidade: 5,
    couraça: 4,
    energiaDados: "6d8",
    experiencia: 100,
    dano: "2D6",
    ataques: [
        {
            id: "soco_esmagador",
            nome: "Soco Esmagador",
            dano: "2d6+1",
            peso: 80,
            pesoHPBaixo: 20,
            telegrafado: false
        },
        {
            id: "arremesso_lodo",
            nome: "Arremesso de Lodo",
            dano: "1d10+2",
            peso: 20,
            pesoHPBaixo: 80,
            telegrafado: true,
            mensagemTelegraf: "O golem de barro coleta uma massa de lodo de seu corpo, preparando-se para arremessá-la com força..."
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


"sombra-antiga": {
    nome: "Sombra Antiga",
    imagem: "https://via.placeholder.com/150",
    descricao: "Restos espectrais de antigos buscadores que falharam nos testes monasteriais.",
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
}
};



// Função para obter dados de um monstro pelo ID
export function getMonsterById(monsterId) {
    return monsterData[monsterId] || null;
}


