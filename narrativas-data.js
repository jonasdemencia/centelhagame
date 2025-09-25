/*
=== SISTEMA DE NARRATIVAS - GUIA PARA CRIADORES ===

ESTRUTURA BÁSICA:
- Cada narrativa tem um ID único e título
- Seções numeradas contêm texto, opções e efeitos
- Seções finais devem ter "final: true"

OPÇÕES:
- texto: Texto do botão
- secao: Próxima seção
- requer: Item necessário (opcional)
- teste: Atributo testado (opcional)
- dificuldade: Valor do teste (opcional)
- batalha: Monstros para lutar (opcional)
- vitoria/derrota: Seções pós-batalha (opcional)

EFEITOS:
- { tipo: "energia", valor: X } - Modifica energia (+/-)
- { tipo: "item", item: "id-item" } - Adiciona item ao inventário

TESTES DE ATRIBUTOS:
- "magia" - Testa atributo magic do jogador
- "habilidade" - Testa atributo skill do jogador  
- "carisma" - Testa atributo charisma do jogador
- "sorte" - Testa atributo luck do jogador
- Dificuldade: 10=fácil, 15=médio, 20=difícil

BATALHAS:
- batalha: "monstro1,monstro2" - Lista de monstros separados por vírgula
- vitoria: seção para vitória
- derrota: seção para derrota

EXEMPLO DE SEÇÃO COMPLETA:
15: {
    texto: "Descrição da situação atual",
    efeitos: [{ tipo: "energia", valor: 2 }, { tipo: "item", item: "tocha" }],
    opcoes: [
        { texto: "Opção normal", secao: 20 },
        { texto: "Opção com item", secao: 25, requer: "chave-runica" },
        { texto: "Opção com teste", secao: 30, teste: "habilidade", dificuldade: 15 },
        { texto: "Opção de batalha", batalha: "goblin,orc", vitoria: 35, derrota: 40 }
    ]
}

SEÇÃO FINAL:
101: {
    texto: "Você completou a aventura!",
    efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "tesouro-principal" }],
    final: true
}
*/

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
                    { texto: "Mergulhar para pegar o objeto brilhante", secao: 45, teste: "habilidade", dificuldade: 12 },
                    { texto: "Procurar uma vara para pescar o objeto", secao: 33 },
                    { texto: "Seguir o riacho floresta adentro", secao: 67 }
                ]
            },
            23: {
                texto: "As árvores se fecham ao seu redor como uma catedral viva. Você ouve passos que ecoam os seus. Quando para, eles param. Quando caminha, eles caminham. Algo está te seguindo.",
                opcoes: [
                    { texto: "Confrontar o que está te seguindo", secao: 78, teste: "habilidade", dificuldade: 14 },
                    { texto: "Tentar se esconder atrás de uma árvore grande", secao: 56, teste: "habilidade", dificuldade: 10 },
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
                    { texto: "Seguir o lobo discretamente", secao: 95, teste: "habilidade", dificuldade: 13 },
                    { texto: "Esperar mais um pouco antes de se mover", secao: 67 },
                    { texto: "Voltar para a trilha principal", secao: 15 }
                ]
            },
            67: {
                texto: "Você continua explorando e encontra uma clareira onde a lua brilha intensamente. No centro, há um círculo de pedras antigas. Você sente que este é um lugar de poder, mas também de perigo.",
                opcoes: [
                    { texto: "Entrar no círculo de pedras", secao: 100, teste: "magia", dificuldade: 16 },
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
                    { texto: "Observar a torre de longe primeiro", secao: 88, teste: "habilidade", dificuldade: 12 },
                    { texto: "Procurar outro caminho", secao: 67 }
                ]
            },
            99: {
                texto: "Você chegou à base da torre. Uma porta de ferro maciço bloqueia a entrada, mas há uma fechadura que parece aceitar uma chave especial. Sua jornada pela floresta te preparou para este momento.",
                opcoes: [
                    { texto: "Usar a chave rúnica se você a possui", secao: 101, requer: "chave-runica" },
                    { texto: "Tentar forçar a porta", secao: 102, teste: "habilidade", dificuldade: 18 },
                    { texto: "Procurar outra entrada", secao: 103 }
                ]
            },
            73: {
                texto: "Você tenta se comunicar com a criatura dos olhos vermelhos. Ela para de se mover e inclina a cabeça, como se estivesse ouvindo. Após um momento tenso, ela recua para as sombras e desaparece.",
                efeitos: [{ tipo: "energia", valor: 1 }],
                opcoes: [
                    { texto: "Continuar explorando com cuidado", secao: 67 },
                    { texto: "Voltar para a trilha principal", secao: 15 }
                ]
            },
            84: {
                texto: "Você sauda a figura educadamente. Ela remove o capuz, revelando ser um eremita idoso. 'Bem-vindo, jovem aventureiro', ele diz com voz rouca. 'Vejo que encontrou o anel das águas. Ele o protegerá em sua jornada.'",
                efeitos: [{ tipo: "energia", valor: 3 }],
                opcoes: [
                    { texto: "Perguntar sobre a floresta", secao: 89 },
                    { texto: "Agradecer e seguir seu caminho", secao: 67 }
                ]
            },
            76: {
                texto: "Você sai da água lentamente. A figura observa em silêncio e depois acena com a cabeça em aprovação antes de desaparecer entre as árvores como uma sombra.",
                opcoes: [
                    { texto: "Seguir a direção que a figura tomou", secao: 89 },
                    { texto: "Explorar a margem do riacho", secao: 67 }
                ]
            },
            88: {
                texto: "Observando de longe, você nota que a torre tem apenas uma entrada e nenhuma janela nos andares inferiores. A luz que brilha no topo parece pulsar como um coração.",
                opcoes: [
                    { texto: "Aproximar-se da torre", secao: 99 },
                    { texto: "Procurar outro caminho", secao: 67 }
                ]
            },
            91: {
                texto: "O amuleto brilha intensamente e cria uma barreira de luz ao seu redor. A criatura dos olhos vermelhos recua, claramente intimidada pelo poder mágico.",
                efeitos: [{ tipo: "energia", valor: 2 }],
                opcoes: [
                    { texto: "Aproveitar para fugir", secao: 67 },
                    { texto: "Tentar se comunicar agora que está protegido", secao: 73 }
                ]
            },
            94: {
                texto: "O lobo gigante se aproxima lentamente e coloca algo aos seus pés - é uma pequena chave dourada. Ele late uma vez e depois desaparece na floresta.",
                efeitos: [{ tipo: "item", item: "chave-dourada" }],
                opcoes: [
                    { texto: "Seguir o lobo", secao: 95 },
                    { texto: "Examinar a chave e continuar explorando", secao: 67 }
                ]
            },
            87: {
                texto: "Você oferece ração ao lobo. Ele come agradecido e depois o guia até uma clareira secreta onde há um baú antigo.",
                efeitos: [{ tipo: "item", item: "tesouro-lobo" }],
                opcoes: [
                    { texto: "Abrir o baú", secao: 100 },
                    { texto: "Agradecer ao lobo e partir", secao: 89 }
                ]
            },
            95: {
                texto: "Você segue o lobo por trilhas secretas até chegar a uma antiga torre de pedra. O lobo aponta com o focinho para a entrada e depois desaparece.",
                opcoes: [
                    { texto: "Entrar na torre", secao: 99 },
                    { texto: "Examinar o exterior primeiro", secao: 88 }
                ]
            },
            12: {
    texto: "Você descansa na clareira sob a luz da lua. A energia mágica do lugar restaura suas forças (+3 energia). Durante a noite, sonha com visões da torre e acorda sabendo exatamente onde deve ir.",
    efeitos: [{ tipo: "energia", valor: 3 }],
    opcoes: [
        { texto: "Seguir em direção à torre", secao: 89 }
    ]
},

            100: {
                texto: "Você entra no círculo de pedras e sente uma energia antiga fluindo através de você. Visões do passado revelam o caminho para a torre.",
                efeitos: [{ tipo: "energia", valor: 3 }, { tipo: "item", item: "conhecimento-antigo" }],
                opcoes: [
                    { texto: "Seguir as visões até a torre", secao: 99 }
                ]
            },
            102: {
                texto: "Você tenta forçar a porta mas ela é muito resistente. Seus esforços chamam a atenção de guardiões espectrais que emergem das paredes!",
                efeitos: [{ tipo: "energia", valor: -3 }],
                opcoes: [
                    { 
    texto: "Lutar contra os guardiões", 
    batalha: "guardiao-espectral,guardiao-espectral",
    vitoria: 104,
    derrota: 67
},
                    { texto: "Tentar fugir", secao: 67 }
                ]
            },
            103: {
                texto: "Você encontra uma entrada secreta na lateral da torre. Ela leva diretamente ao tesouro, mas você sente que perdeu algo importante ao não usar a entrada principal.",
                efeitos: [{ tipo: "item", item: "tesouro-menor" }],
                final: true
            },
            104: {
                texto: "Após uma batalha intensa, você derrota os guardiões espectrais. Eles se desfazem em luz e a porta se abre magicamente, reconhecendo sua coragem.",
                efeitos: [{ tipo: "energia", valor: -2 }, { tipo: "item", item: "bênção-guardioes" }],
                opcoes: [
                    { texto: "Entrar na torre", secao: 101 }
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
                    { texto: "Correr de volta para verificar a entrada", secao: 25, teste: "habilidade", dificuldade: 14 },
                    { texto: "Continuar em frente - não há volta agora", secao: 30 },
                    { texto: "Procurar por uma passagem lateral", secao: 18 }
                ]
            },
            12: {
                texto: "Examinando a entrada com cuidado, você encontra inscrições antigas nas paredes. Elas falam de tesouros guardados por criaturas ancestrais.",
                efeitos: [{ tipo: "energia", valor: 1 }],
                opcoes: [
                    { texto: "Descer para as cavernas preparado", secao: 20 },
                    { texto: "Procurar mais pistas nas inscrições", secao: 15 }
                ]
            },
            15: {
                texto: "Você encontra uma entrada alternativa, menor mas mais segura. O ar que sai dela é mais quente e carrega um cheiro metálico.",
                opcoes: [
                    { texto: "Entrar pela passagem alternativa", secao: 35 },
                    { texto: "Voltar para a entrada principal", secao: 10 }
                ]
            },
            18: {
                texto: "Você encontra uma fenda na parede que leva a uma câmara secreta. Cristais brilhantes iluminam o local com uma luz azulada.",
                efeitos: [{ tipo: "item", item: "cristal-luminoso" }],
                opcoes: [
                    { texto: "Coletar mais cristais", secao: 40 },
                    { texto: "Continuar explorando as cavernas", secao: 30 }
                ]
            },
            20: {
                texto: "Com a corda, você desce com segurança. As cavernas se abrem em uma vasta câmara subterrânea com um lago no centro.",
                opcoes: [
                    { texto: "Examinar o lago", secao: 45 },
                    { texto: "Explorar as bordas da câmara", secao: 50 },
                    { texto: "Procurar outras passagens", secao: 30 }
                ]
            },
            25: {
                texto: "Você consegue voltar a tempo! A entrada não desabou completamente, mas está bloqueada por pedras. Você terá que encontrar outra saída.",
                opcoes: [
                    { texto: "Tentar mover as pedras", secao: 26, teste: "habilidade", dificuldade: 15 },
                    { texto: "Aceitar que deve continuar em frente", secao: 30 }
                ]
            },
            26: {
                texto: "Com grande esforço, você consegue abrir uma passagem pequena. Agora pode escolher sair ou continuar explorando.",
                opcoes: [
                    { texto: "Sair das cavernas", secao: 99 },
                    { texto: "Continuar a exploração", secao: 30 }
                ]
            },
            30: {
                texto: "Você avança pelas cavernas e encontra uma bifurcação. À esquerda, você ouve o som de água gotejando. À direita, sente uma corrente de ar fresco.",
                opcoes: [
                    { texto: "Seguir o som da água (à esquerda)", secao: 45 },
                    { texto: "Seguir a corrente de ar (à direita)", secao: 60 },
                    { texto: "Acender uma tocha para ver melhor", secao: 32, requer: "tocha" }
                ]
            },
            32: {
                texto: "A luz da tocha revela pinturas rupestres nas paredes, mostrando mapas das cavernas e a localização de tesouros antigos.",
                efeitos: [{ tipo: "item", item: "mapa-cavernas" }],
                opcoes: [
                    { texto: "Seguir o mapa até o tesouro principal", secao: 80 },
                    { texto: "Explorar outras áreas primeiro", secao: 45 }
                ]
            },
            35: {
                texto: "A passagem alternativa leva a uma câmara com veios de ouro nas paredes. Você encontrou uma mina abandonada!",
                efeitos: [{ tipo: "item", item: "pepitas-ouro" }],
                opcoes: [
                    { texto: "Minerar mais ouro", secao: 36, teste: "habilidade", dificuldade: 12 },
                    { texto: "Continuar explorando", secao: 45 }
                ]
            },
            36: {
                texto: "Você consegue extrair uma boa quantidade de ouro, mas o esforço foi cansativo.",
                efeitos: [{ tipo: "item", item: "ouro-extra" }, { tipo: "energia", valor: -2 }],
                opcoes: [
                    { texto: "Descansar um pouco", secao: 37 },
                    { texto: "Continuar explorando", secao: 45 }
                ]
            },
            37: {
                texto: "Após descansar, você se sente revigorado e pronto para continuar.",
                efeitos: [{ tipo: "energia", valor: 3 }],
                opcoes: [
                    { texto: "Explorar mais a fundo", secao: 80 }
                ]
            },
            40: {
                texto: "Você coleta vários cristais luminosos. Eles serão úteis para iluminar áreas escuras.",
                efeitos: [{ tipo: "item", item: "cristais-extras" }],
                opcoes: [
                    { texto: "Usar os cristais para explorar túneis escuros", secao: 80 },
                    { texto: "Continuar pela rota principal", secao: 45 }
                ]
            },
            45: {
                texto: "Você chega a uma câmara com um lago subterrâneo. A água é cristalina e você vê algo brilhando no fundo.",
                opcoes: [
                    { texto: "Mergulhar no lago", secao: 46, teste: "habilidade", dificuldade: 13 },
                    { texto: "Procurar uma forma de drenar a água", secao: 47 },
                    { texto: "Explorar outras áreas da câmara", secao: 50 }
                ]
            },
            46: {
                texto: "Você mergulha e recupera um baú de tesouro do fundo do lago! Dentro há moedas antigas e uma gema preciosa.",
                efeitos: [{ tipo: "item", item: "tesouro-lago" }, { tipo: "energia", valor: -1 }],
                opcoes: [
                    { texto: "Continuar explorando", secao: 80 }
                ]
            },
            47: {
                texto: "Você encontra um mecanismo antigo que drena o lago, revelando uma passagem secreta no fundo.",
                opcoes: [
                    { texto: "Descer pela passagem secreta", secao: 80 },
                    { texto: "Coletar os tesouros expostos primeiro", secao: 48 }
                ]
            },
            48: {
                texto: "Com o lago drenado, você coleta vários tesouros que estavam no fundo.",
                efeitos: [{ tipo: "item", item: "tesouros-lago" }],
                opcoes: [
                    { texto: "Descer pela passagem secreta", secao: 80 }
                ]
            },
            50: {
                texto: "Explorando as bordas da câmara, você encontra esqueletos de antigos exploradores e seus equipamentos.",
                efeitos: [{ tipo: "item", item: "equipamento-antigo" }],
                opcoes: [
                    { texto: "Examinar os esqueletos mais de perto", secao: 51 },
                    { texto: "Continuar explorando", secao: 60 }
                ]
            },
            51: {
                texto: "Entre os ossos, você encontra um diário que revela a localização da câmara do tesouro principal.",
                efeitos: [{ tipo: "item", item: "diario-explorador" }],
                opcoes: [
                    { texto: "Seguir as instruções do diário", secao: 80 }
                ]
            },
            60: {
                texto: "A corrente de ar leva a uma saída natural das cavernas, mas você também vê uma passagem que desce ainda mais fundo.",
                opcoes: [
                    { texto: "Sair das cavernas", secao: 99 },
                    { texto: "Descer mais fundo", secao: 80 },
                    { texto: "Explorar a área ao redor da saída", secao: 61 }
                ]
            },
            61: {
                texto: "Perto da saída, você encontra um acampamento abandonado com suprimentos úteis.",
                efeitos: [{ tipo: "item", item: "suprimentos" }, { tipo: "energia", valor: 2 }],
                opcoes: [
                    { texto: "Descansar no acampamento", secao: 62 },
                    { texto: "Continuar explorando", secao: 80 }
                ]
            },
            62: {
                texto: "Após um bom descanso, você se sente completamente recuperado.",
                efeitos: [{ tipo: "energia", valor: 5 }],
                opcoes: [
                    { texto: "Partir para a câmara do tesouro", secao: 80 }
                ]
            },
            80: {
                texto: "Você finalmente chega à câmara do tesouro principal. Uma vasta sala repleta de ouro, gemas e artefatos antigos se estende diante de você. Você completou sua exploração das Cavernas Perdidas!",
                efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "tesouro-principal" }],
                final: true
            },
            99: {
                texto: "Você sai das cavernas com segurança, levando consigo as experiências e tesouros encontrados. Embora não tenha explorado tudo, você sobreviveu à aventura.",
                efeitos: [{ tipo: "energia", valor: 5 }],
                final: true
            }
        }
    }
};




