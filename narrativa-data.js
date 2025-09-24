// Dados das narrativas
const NARRATIVAS = {
    "floresta-sombria": {
        id: "floresta-sombria",
        titulo: "A Floresta Sombria",
        secoes: {
            1: {
                texto: "Você se encontra na entrada de uma floresta densa e misteriosa. As árvores antigas parecem sussurrar segredos há muito esquecidos. Ao longe, você ouve o som suave de água corrente. O ar está carregado de magia e perigo.",
                opcoes: [
                    { texto: "Seguir em direção ao som da água", secao: 15 },
                    { texto: "Explorar as árvores mais densas à esquerda", secao: 23 },
                    { texto: "Acender uma tocha antes de prosseguir", secao: 8, requer: "tocha" }
                ]
            },
            8: {
                texto: "A luz da tocha revela símbolos antigos gravados nas árvores próximas. Você sente uma presença observando seus movimentos. De repente, um brilho dourado chama sua atenção entre as folhas.",
                efeitos: [{ tipo: "item", item: "amuleto-proteção" }],
                opcoes: [
                    { texto: "Investigar o brilho dourado", secao: 42 },
                    { texto: "Ignorar e continuar pela trilha principal", secao: 15 }
                ]
            },
            15: {
                texto: "Você encontra um riacho cristalino que serpenteia pela floresta. A água é tão clara que você pode ver algo brilhante no fundo. Peixes dourados nadam em círculos, como se protegessem o objeto.",
                efeitos: [{ tipo: "energia", valor: 2 }],
                opcoes: [
                    { texto: "Mergulhar para pegar o objeto brilhante", secao: 45, teste: "agilidade", dificuldade: 12 },
                    { texto: "Procurar uma vara para pescar o objeto", secao: 33 },
                    { texto: "Seguir o riacho floresta adentro", secao: 67 }
                ]
            },
            23: {
                texto: "As árvores se fecham ao seu redor como uma catedral viva. Você ouve passos que ecoam os seus. Quando para, eles param. Quando caminha, eles caminham. Algo está te seguindo.",
                opcoes: [
                    { texto: "Confrontar o que está te seguindo", secao: 78, teste: "força", dificuldade: 14 },
                    { texto: "Tentar se esconder atrás de uma árvore grande", secao: 56, teste: "agilidade", dificuldade: 10 },
                    { texto: "Correr de volta para a entrada", secao: 1 }
                ]
            },
            33: {
                texto: "Você encontra um galho perfeito e consegue pescar o objeto. É uma chave de prata com runas brilhantes. No momento em que a toca, visões de uma torre distante invadem sua mente.",
                efeitos: [{ tipo: "item", item: "chave-runica" }],
                opcoes: [
                    { texto: "Seguir a visão em direção à torre", secao: 89 },
                    { texto: "Guardar a chave e explorar mais a floresta", secao: 67 }
                ]
            },
            42: {
                texto: "O amuleto pulsa com energia mágica em suas mãos. Você sente sua força vital aumentar, mas também percebe que despertou algo na floresta. Olhos vermelhos brilham na escuridão.",
                efeitos: [{ tipo: "energia", valor: 5 }],
                opcoes: [
                    { texto: "Usar o amuleto para se proteger", secao: 91, requer: "amuleto-proteção" },
                    { texto: "Tentar dialogar com a criatura", secao: 73, teste: "carisma", dificuldade: 15 },
                    { texto: "Fugir imediatamente", secao: 15 }
                ]
            },
            45: {
                texto: "A água está gelada, mas você consegue alcançar o objeto. É um anel mágico! Porém, ao emergir, você percebe que não está mais sozinho. Uma figura encapuzada observa da margem.",
                efeitos: [{ tipo: "item", item: "anel-aquático" }, { tipo: "energia", valor: -1 }],
                opcoes: [
                    { texto: "Saudar a figura educadamente", secao: 84 },
                    { texto: "Sair da água lentamente sem fazer movimentos bruscos", secao: 76 },
                    { texto: "Mergulhar novamente e nadar para longe", secao: 67 }
                ]
            },
            56: {
                texto: "Você se esconde com sucesso. A criatura que te seguia passa por você - é um lobo gigante com pelos prateados. Ele fareja o ar, mas não consegue te detectar. Após alguns minutos, ele se afasta.",
                opcoes: [
                    { texto: "Seguir o lobo discretamente", secao: 95, teste: "agilidade", dificuldade: 13 },
                    { texto: "Esperar mais um pouco antes de se mover", secao: 67 },
                    { texto: "Voltar para a trilha principal", secao: 15 }
                ]
            },
            67: {
                texto: "Você continua explorando e encontra uma clareira onde a lua brilha intensamente. No centro, há um círculo de pedras antigas. Você sente que este é um lugar de poder, mas também de perigo.",
                opcoes: [
                    { texto: "Entrar no círculo de pedras", secao: 100, teste: "inteligência", dificuldade: 16 },
                    { texto: "Contornar a clareira cuidadosamente", secao: 89 },
                    { texto: "Acampar aqui para descansar", secao: 12 }
                ]
            },
            78: {
                texto: "Você se vira corajosamente e grita 'Quem está aí?'. O lobo gigante emerge das sombras, mas em vez de atacar, ele inclina a cabeça respeitosamente. Parece que sua coragem o impressionou.",
                efeitos: [{ tipo: "energia", valor: 3 }],
                opcoes: [
                    { texto: "Tentar se comunicar com o lobo", secao: 94 },
                    { texto: "Oferecer comida se você tiver", secao: 87, requer: "ração" },
                    { texto: "Seguir o lobo se ele te guiar", secao: 95 }
                ]
            },
            89: {
                texto: "Você avista uma torre de pedra negra no horizonte. Ela parece antiga e abandonada, mas uma luz fraca brilha em sua janela mais alta. Este pode ser seu destino final.",
                opcoes: [
                    { texto: "Aproximar-se da torre", secao: 99 },
                    { texto: "Observar a torre de longe primeiro", secao: 88, teste: "inteligência", dificuldade: 12 },
                    { texto: "Procurar outro caminho", secao: 67 }
                ]
            },
            99: {
                texto: "Você chegou à base da torre. Uma porta de ferro maciço bloqueia a entrada, mas há uma fechadura que parece aceitar uma chave especial. Sua jornada pela floresta te preparou para este momento.",
                opcoes: [
                    { texto: "Usar a chave rúnica se você a possui", secao: 101, requer: "chave-runica" },
                    { texto: "Tentar forçar a porta", secao: 102, teste: "força", dificuldade: 18 },
                    { texto: "Procurar outra entrada", secao: 103 }
                ]
            },
            101: {
                texto: "A chave se encaixa perfeitamente! A porta se abre com um rangido ancestral. Você completou sua primeira aventura na Floresta Sombria e descobriu segredos que poucos conhecem. Parabéns, aventureiro!",
                efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "pergaminho-sabedoria" }],
                final: true
            }
        }
    },
    
    "cavernas-perdidas": {
        id: "cavernas-perdidas",
        titulo: "As Cavernas Perdidas",
        secoes: {
            1: {
                texto: "Você está diante da entrada de cavernas antigas, escavadas há milênios por uma civilização perdida. O ar que sai das profundezas é frio e carrega o cheiro de minerais e mistério. Sua tocha tremula na corrente de ar.",
                opcoes: [
                    { texto: "Entrar imediatamente nas cavernas", secao: 10 },
                    { texto: "Preparar equipamentos antes de entrar", secao: 5, requer: "corda" },
                    { texto: "Procurar por outras entradas", secao: 15 }
                ]
            },
            5: {
                texto: "Você amarra sua corda na entrada e verifica seus equipamentos. Esta preparação extra pode salvar sua vida nas profundezas. Você se sente mais confiante para enfrentar os perigos à frente.",
                efeitos: [{ tipo: "energia", valor: 2 }],
                opcoes: [
                    { texto: "Descer para as cavernas com a corda", secao: 20 },
                    { texto: "Explorar a entrada mais cuidadosamente", secao: 12 }
                ]
            },
            10: {
                texto: "As cavernas são mais profundas do que você imaginava. Ecos distantes sugerem câmaras vastas à frente. De repente, você ouve o som de pedras caindo atrás de você. A entrada pode ter desabado!",
                efeitos: [{ tipo: "energia", valor: -1 }],
                opcoes: [
                    { texto: "Correr de volta para verificar a entrada", secao: 25, teste: "agilidade", dificuldade: 14 },
                    { texto: "Continuar em frente - não há volta agora", secao: 30 },
                    { texto: "Procurar por uma passagem lateral", secao: 18 }
                ]
            }
        }
    }
};
