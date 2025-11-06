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

=== COMO FUNCIONAM AS BATALHAS ===

1. BATALHA EM OPÇÃO (Mais comum):
   - Jogador escolhe lutar
   - Sistema redireciona para batalha.html
   - Após vitória/derrota, retorna para seção específica

2. BATALHA AUTOMÁTICA (Implementada):
   - Seção sem propriedade "opcoes"
   - Sistema processa automaticamente

EXEMPLOS FUNCIONAIS:

// Batalha em opção (RECOMENDADO)
15: {
    texto: "Um goblin salta das sombras, rosnando ameaçadoramente!",
    opcoes: [
        { texto: "Lutar contra o goblin", batalha: "goblin", vitoria: 20, derrota: 25 },
        { texto: "Tentar fugir", secao: 30, teste: "habilidade", dificuldade: 12 }
    ]
}

// Batalha automática (sem propriedade opcoes)
16: {
    texto: "Zumbis cercam você! Não há como fugir!",
    batalha: "zumbi,zumbi,zumbi",
    vitoria: 35,
    derrota: 40
}

// Batalha após teste falhado
89: {
    texto: "O necromante desperta e se ergue furioso!",
    efeitos: [{ tipo: "item", item: "artefato-sombrio" }],
    opcoes: [
        { texto: "Enfrentar o necromante", batalha: "necromante", vitoria: 69, derrota: 37 }
    ]
}

SEÇÃO FINAL:
101: {
    texto: "Você completou a aventura!",
    efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "tesouro-principal" }],
    final: true
}
*/

/*
=== DESIGN DE SEÇÕES - REUTILIZAÇÃO VS ESPECIFICIDADE ===

TIPOS DE SEÇÕES:

1. SEÇÕES REUTILIZÁVEIS (podem ser acessadas de múltiplos pontos):
   - Texto GENÉRICO que funciona independente da origem
   - Não fazem referência específica à seção anterior
   - Exemplo: Seção 4 (praça central), Seção 10 (procurar suprimentos)

2. SEÇÕES ESPECÍFICAS (acesso único):
   - Podem referenciar diretamente a escolha anterior
   - Usadas quando há apenas um caminho para chegar até ela

EXEMPLOS:

// SEÇÃO REUTILIZÁVEL (CORRETO)
10: {
    texto: "Procurando por suprimentos na casa, você vasculha cuidadosamente os cômodos...",
    // ✅ Genérico - funciona vindo de qualquer lugar
}

// SEÇÃO ESPECÍFICA (CORRETO)
89: {
    texto: "Tentando pegar um artefato sombrio, você se move rapidamente...",
    // ✅ Específico - só vem de uma escolha de teste
}

// TRANSIÇÃO NA ORIGEM (CORRETO)
3: {
    texto: "...Você decide que seria prudente procurar por suprimentos úteis.",
    opcoes: [
        { texto: "Procurar por suprimentos na casa", secao: 10 }
        // ✅ A transição está na ESCOLHA, não na seção destino
    ]
}

REGRA: Se múltiplas seções podem levar à mesma seção destino, 
a seção destino deve ser genérica e as transições ficam nas origens.
*/

/*
=== AVISO CRÍTICO - GESTÃO DE SEÇÕES ===

NUNCA REUTILIZAR NÚMEROS DE SEÇÃO!
- SEMPRE verificar se a seção já existe antes de criar uma opção
- SEMPRE ler o conteúdo da seção de destino para confirmar que faz sentido
- Se a seção existe mas tem conteúdo diferente, usar outro número
- Manter lista de seções usadas para evitar conflitos

PROCESSO OBRIGATÓRIO:
1. Criar a opção com número de seção
2. VERIFICAR se essa seção existe
3. LER o conteúdo da seção
4. CONFIRMAR que o texto faz sentido com a escolha
5. Se não faz sentido, usar outro número ou criar nova seção

EXEMPLO DO ERRO COMUM:
Opção: "Descansar para recuperar o fôlego" → secao: 71
Seção 71: "Procurando armas..." ❌ ERRO! Conteúdo não relacionado

CORREÇÃO:
Opção: "Descansar para recuperar o fôlego" → secao: 90 (nova seção)
Seção 90: "Descansando um momento..." ✅ CORRETO!
*/

/*
=== CONTINUIDADE NARRATIVA ===

PARA SEÇÕES ESPECÍFICAS:
- Fazer referência direta à escolha anterior
- "Ao usar a corda, você..." / "Investigando o baú, você descobre..."

PARA SEÇÕES REUTILIZÁVEIS:
- Texto genérico que funciona de qualquer origem
- Transições ficam nas seções de origem e nas escolhas

PROGRESSÃO NARRATIVA:
- Evite saltos abruptos entre locais sem transição adequada
- Cada seção deve fluir naturalmente da anterior
- Reduza a quantidade de itens dados por seção (máximo 1-2 itens por descoberta)
- Crie mais seções intermediárias para ações complexas

ESTRUTURA IDEAL:
1. Avaliação se a seção será reutilizável ou específica
2. Se reutilizável: texto genérico + transições nas origens
3. Se específica: referência direta à escolha anterior
4. Consequências/descobertas da ação
5. Novas opções baseadas na situação atual

Esta estrutura é ESSENCIAL para manter a flexibilidade e imersão narrativa.
*/



// Dados das narrativas
export const NARRATIVAS = {

"condominio-tempo-perdido": {
    id: "condominio-tempo-perdido",
    titulo: "O Condomínio do tempo perdido",
    secoes: {
        1: {
            texto: "Você abre os olhos sobre mármore polido. O teto se perde em altura, sustentado por colunas de granito negro. Lustres de cristal pendem imóveis. Silêncio absoluto. Seu corpo está intacto, suas roupas limpas.",
           efeitos: [
        { tipo: "item", item: "pequenabolsaouro" },
        { tipo: "item", item: "corda" },
              { tipo: "item", item: "corda" }
    ],
            opcoes: [
                { texto: "Explorar o corredor à esquerda", secao: 2 },
                { texto: "Explorar o corredor à direita", secao: 3 },
                { texto: "Examinar as colunas de perto", secao: 4 },
                { texto: "Subir a escadaria central", secao: 5 }
            ]
        },

        2: {
            texto: "Paredes cobertas por tapeçarias de seda representando cenas de caça. O corredor se estende por trinta metros. Cheiro leve de cera de abelha.",
            opcoes: [
                { texto: "Seguir até o fim do corredor", secao: 6 },
                { texto: "Tocar as tapeçarias", secao: 7 },
                { texto: "Retornar ao hall", secao: 1 },
                { texto: "Abrir a porta à direita", secao: 8, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        3: {
            texto: "Dezenas de retratos a óleo em molduras douradas. Rostos de homens e mulheres em trajes formais, nenhum sorrindo. A luz vem de janelas altas.",
            opcoes: [
                { texto: "Examinar os retratos mais de perto", secao: 9 },
                { texto: "Seguir pela galeria", secao: 10 },
                { texto: "Tentar abrir uma janela", secao: 11 },
                { texto: "Voltar ao hall", secao: 1 }
            ]
        },

        4: {
            texto: "Granito negro com veios dourados. Frio ao toque. Cada coluna tem três metros de diâmetro. Nenhuma inscrição visível.",
            opcoes: [
                { texto: "Retornar ao hall", secao: 1 }
            ]
        },

        5: {
            texto: "Degraus de mármore branco sobem em espiral. Corrimão de mogno. Você alcança o primeiro patamar. Três portas: uma vermelha, uma branca, uma de bronze.",
            opcoes: [
                { texto: "Abrir a porta vermelha", secao: 12, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Abrir a porta branca", secao: 13, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Abrir a porta de bronze", secao: 14, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Descer ao hall", secao: 1 }
            ]
        },

        6: {
            texto: "Mesa de carvalho para cinquenta pessoas. Talheres de prata alinhados. Nenhum prato, nenhum alimento. Candelabros apagados. Temperatura amena.",
            opcoes: [
                { texto: "Procurar por comida nos armários", secao: 15 },
                { texto: "Examinar os talheres", secao: 16 },
                { texto: "Sair pela porta oposta", secao: 17, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao corredor", secao: 2 }
            ]
        },

        7: {
            texto: "Seda genuína, bordados em fio de ouro. Representam cervos sendo abatidos por arqueiros. Nenhum som além da sua respiração.",
            opcoes: [
                { texto: "Retornar ao corredor", secao: 2 }
            ]
        },

        8: {
            texto: "Estantes de mogno até o teto. Livros encadernados em couro. Cheiro de papel antigo. Uma escada de madeira apoiada na parede.",
            opcoes: [
                { texto: "Ler os títulos dos livros", secao: 18 },
                { texto: "Subir pela escada", secao: 19 },
                { texto: "Procurar por mapas ou documentos", secao: 20 },
                { texto: "Sair", secao: 2 }
            ]
        },

        9: {
            texto: "Pinceladas precisas. Olhos que parecem seguir, mas é apenas técnica. Placas douradas com nomes em idiomas que você não reconhece.",
            opcoes: [
                { texto: "Retornar à galeria", secao: 3 }
            ]
        },

        10: {
            texto: "Piano de cauda no centro. Harpas, violinos em estantes. Partitura aberta sobre o piano: notas complexas, sem título.",
            opcoes: [
                { texto: "Tocar uma tecla do piano", secao: 21 },
                { texto: "Examinar as partituras", secao: 22 },
                { texto: "Sair pela porta lateral", secao: 23, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Voltar à galeria", secao: 3 }
            ]
        },

        11: {
            texto: "Vidro grosso, sem trinco. A vista mostra jardins internos com fontes de pedra. Nenhum movimento lá fora.",
            opcoes: [
                { texto: "Retornar à galeria", secao: 3 }
            ]
        },

        12: {
            texto: "Bancos de madeira escura. Altar de mármore branco com velas apagadas. Vitrais representam figuras abstratas em azul e dourado, inscrição em latim: 'Custos qui cecidit'. Silêncio denso.",
            opcoes: [
                { texto: "Examinar o altar", secao: 24 },
                { texto: "Sentar-se nos bancos", secao: 25 },
                { texto: "Sair pela porta lateral", secao: 26, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao patamar", secao: 5 }
            ]
        },

        13: {
            texto: "Cama com dossel, lençóis de linho branco impecáveis. Armário vazio. Janela com cortinas de veludo. Nenhum objeto pessoal.",
            opcoes: [
                { texto: "Deitar na cama", secao: 27 },
                { texto: "Abrir o armário", secao: 28 },
                { texto: "Olhar pela janela", secao: 29 },
                { texto: "Sair", secao: 5 }
            ]
        },

        14: {
            texto: "Mesa de jacarandá com tinteiro seco. Arquivos de metal trancados. Telefone antigo, sem linha. Cheiro de couro e tinta.",
            opcoes: [
                { texto: "Tentar abrir os arquivos", secao: 30 },
                { texto: "Examinar os papéis sobre a mesa", secao: 31 },
                { texto: "Pegar o telefone", secao: 32 },
                { texto: "Sair", secao: 5 }
            ]
        },

        15: {
            texto: "Prateleiras com latas lacradas: conservas de frutas, vegetais, carnes. Água engarrafada em caixas. Tudo em perfeito estado.",
            efeitos: [
                { tipo: "item", item: "lata-sardinha" },
                { tipo: "item", item: "lata-sardinha" },
                { tipo: "item", item: "lata-sardinha" }
            ],
            opcoes: [
                { texto: "Retornar ao salão", secao: 6 }
            ]
        },

        16: {
            texto: "Talheres sem manchas, sem marcas de uso. Refletem seu rosto com clareza.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 6 }
            ]
        },

        17: {
            texto: "Paredes simples, piso de pedra. Portas numeradas de 1 a 8. Iluminação natural de claraboias.",
            opcoes: [
                { texto: "Abrir porta 1", secao: 33, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Abrir porta 4", secao: 34, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Abrir porta 8", secao: 35, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Seguir até o fim do corredor", secao: 36 }
            ]
        },

        18: {
            texto: "Livros em latim, grego, árabe, hebraico. Tratados de filosofia, teologia, astronomia. Nenhum em linguagem que você domine completamente.",
            opcoes: [
                { texto: "Retornar à biblioteca", secao: 8 }
            ]
        },

        19: {
            texto: "Mais livros. Uma janela circular mostra o céu: azul claro, sem nuvens, sem pássaros.",
            opcoes: [
                { texto: "Descer", secao: 8 }
            ]
        },

        20: {
            texto: "Plantas arquitetônicas do edifício. Centenas de salas. Você está na Ala Leste, Nível 1. Existem pelo menos 8 níveis.",
            opcoes: [
                { texto: "Retornar à biblioteca", secao: 8 }
            ]
        },

        21: {
            texto: "O som ressoa puro e longo. Nenhum eco responde. O silêncio retorna.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 10 }
            ]
        },

        22: {
            texto: "Composições para orquestra completa. Anotações à mão nas margens: 'Execução prevista para 14/09'. Nenhum ano indicado.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 10 }
            ]
        },

        23: {
            texto: "Fonte de pedra com água cristalina. Roseiras sem flores. Grama aparada. Céu visível, mas nenhum som de vento.",
            opcoes: [
                { texto: "Beber da fonte", secao: 37 },
                { texto: "Explorar o jardim", secao: 38 },
                { texto: "Entrar pela porta oposta", secao: 39, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao salão", secao: 10 }
            ]
        },

        24: {
            texto: "Velas de cera virgem, nunca acesas. Livro fechado com capa de couro negro. Nenhum símbolo religioso reconhecível.",
            efeitos: [{ tipo: "item", item: "pequenabolsaouro" }],
            opcoes: [
                { texto: "Abrir o livro", secao: 40 },
                { texto: "Retornar à capela", secao: 12 }
            ]
        },

        25: {
            texto: "Você senta. O banco é duro. O silêncio pressiona seus ouvidos. Nenhuma sensação de paz ou desconforto, apenas vazio.",
            opcoes: [
                { texto: "Levantar e sair", secao: 12 }
            ]
        },

        26: {
            texto: "Armários com vestes cerimoniais: brancas, douradas, púrpuras. Cálices de ouro. Incenso em caixas lacradas.",
            opcoes: [
                { texto: "Examinar as vestes", secao: 41 },
                { texto: "Sair pela porta dos fundos", secao: 42, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Retornar à capela", secao: 12 }
            ]
        },

        27: {
            texto: "Você deita. O colchão é firme. Nenhum som. Você não sente sono, mas o corpo relaxa.",
            efeitos: [{ tipo: "energia", valor: 2 }],
            opcoes: [
                { texto: "Levantar", secao: 13 }
            ]
        },

        28: {
            texto: "Cabides de madeira. Cheiro de cedro. Nenhuma roupa, nenhum objeto.",
            opcoes: [
                { texto: "Retornar ao quarto", secao: 13 }
            ]
        },

        29: {
            texto: "Jardins internos se estendem em padrões geométricos. Fontes, estátuas, caminhos de pedra. Nenhum movimento.",
            opcoes: [
                { texto: "Retornar ao quarto", secao: 13 }
            ]
        },

        30: {
            texto: "Fechaduras de combinação. Você não tem a senha. Metal frio e resistente.",
            opcoes: [
                { texto: "Retornar ao escritório", secao: 14 }
            ]
        },

        31: {
            texto: "Listas de suprimentos: 'Vinho tinto - 400 garrafas', 'Caviar - 80kg', 'Lençóis de seda - 200 jogos'. Datas ilegíveis.",
            efeitos: [{ tipo: "item", item: "bolsa-ouro-pequena" }],
            opcoes: [
                { texto: "Retornar ao escritório", secao: 14 }
            ]
        },

        32: {
            texto: "Você levanta o fone. Nenhum tom. Nenhum ruído. Plástico frio contra sua orelha.",
            opcoes: [
                { texto: "Retornar ao escritório", secao: 14 }
            ]
        },

        33: {
            texto: "Cama simples, mesa pequena, cadeira. Nenhum objeto pessoal. Limpo e vazio.",
            opcoes: [
                { texto: "Sair", secao: 17 }
            ]
        },

        34: {
            texto: "Vassouras, baldes, produtos químicos em frascos rotulados. Cheiro de cloro e lavanda.",
            opcoes: [
                { texto: "Sair", secao: 17 }
            ]
        },

        35: {
            texto: "Máquinas industriais de lavar. Cestos vazios. Cheiro de sabão neutro.",
            opcoes: [
                { texto: "Sair", secao: 17 }
            ]
        },

        36: {
            texto: "Fogões de aço inoxidável. Geladeiras desligadas, vazias. Facas penduradas em ordem de tamanho. Nenhum alimento.",
            opcoes: [
                { texto: "Examinar as geladeiras", secao: 43 },
                { texto: "Pegar uma faca", secao: 44 },
                { texto: "Sair pela porta de serviço", secao: 45, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Retornar ao corredor", secao: 17 }
            ]
        },

        37: {
            texto: "Você bebe. Fria, sem sabor. Sua sede diminui.",
            efeitos: [{ tipo: "energia", valor: 1 }],
            opcoes: [
                { texto: "Retornar ao jardim", secao: 23 }
            ]
        },

        38: {
            texto: "Estátuas de mármore: figuras humanas em poses formais. Nenhuma placa identificadora. Grama macia sob seus pés.",
            opcoes: [
                { texto: "Examinar uma estátua", secao: 46 },
                { texto: "Seguir o caminho norte", secao: 47 },
                { texto: "Seguir o caminho sul", secao: 48 },
                { texto: "Retornar", secao: 23 }
            ]
        },

        39: {
            texto: "Estrutura de vidro e ferro. Plantas tropicais em vasos imensos. Umidade no ar. Temperatura elevada.",
            opcoes: [
                { texto: "Explorar entre as plantas", secao: 49 },
                { texto: "Sair pela porta oposta", secao: 50, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao jardim", secao: 23 }
            ]
        },

        40: {
            texto: "Textos em latim. Orações, rituais, calendários. Ilustrações de santos e mártires. Nenhuma anotação pessoal.",
            opcoes: [
                { texto: "Retornar ao altar", secao: 24 }
            ]
        },

        41: {
            texto: "Tecidos pesados, bordados em ouro. Tamanhos variados. Cheiro de naftalina.",
            opcoes: [
                { texto: "Retornar à sacristia", secao: 26 }
            ]
        },

        42: {
            texto: "Cabines de madeira escura com cortinas. Silêncio absoluto.",
            opcoes: [
                { texto: "Entrar em um confessionário", secao: 51, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/passos.mp3" },
                { texto: "Seguir o corredor", secao: 52 },
                { texto: "Retornar à sacristia", secao: 26 }
            ]
        },

        43: {
            texto: "Prateleiras limpas. Nenhum resíduo. Desligadas há tempo indeterminado.",
            opcoes: [
                { texto: "Retornar à cozinha", secao: 36 }
            ]
        },

        44: {
            texto: "Lâmina de 20cm, afiada. Cabo de madeira.",
            efeitos: [{ tipo: "item", item: "faca-cozinha" }],
            opcoes: [
                { texto: "Retornar à cozinha", secao: 36 }
            ]
        },

        45: {
            texto: "Área externa coberta. Portões de metal fechados. Caminhões não há. Caixas vazias empilhadas.",
            opcoes: [
                { texto: "Tentar abrir os portões", secao: 53 },
                { texto: "Examinar as caixas", secao: 54 },
                { texto: "Entrar pela porta lateral", secao: 55, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portagaragem.mp3" },
                { texto: "Retornar à cozinha", secao: 36 }
            ]
        },

        46: {
            texto: "Homem de meia-idade, mãos cruzadas. Expressão neutra. Mármore branco sem manchas.",
            opcoes: [
                { texto: "Retornar ao jardim", secao: 38 }
            ]
        },

        47: {
            texto: "Mais fontes. Bancos de pedra. Uma pérgola coberta de hera seca.",
            opcoes: [
                { texto: "Sentar em um banco", secao: 56 },
                { texto: "Explorar a pérgola", secao: 57 },
                { texto: "Retornar", secao: 38 }
            ]
        },

        48: {
            texto: "Labirinto de arbustos baixos. Entrada visível.",
            opcoes: [
                { texto: "Entrar no labirinto", secao: 58 },
                { texto: "Contornar o labirinto", secao: 59 },
                { texto: "Retornar", secao: 38 }
            ]
        },

        49: {
            texto: "Folhas largas, úmidas. Orquídeas, samambaias gigantes. Nenhum inseto. Nenhum som de água corrente.",
            opcoes: [
                { texto: "Retornar ao conservatório", secao: 39 }
            ]
        },

        50: {
            texto: "Ferramentas penduradas: pás, tesouras, regadores. Terra em sacos. Sementes em envelopes rotulados.",
            opcoes: [
                { texto: "Pegar uma ferramenta", secao: 60 },
                { texto: "Sair pela porta externa", secao: 61, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Retornar ao conservatório", secao: 39 }
            ]
        },

        51: {
            texto: "Banco estreito. Grade de madeira. Cheiro de verniz. Você espera. Nada acontece.",
            opcoes: [
                { texto: "Sair", secao: 42 }
            ]
        },

        52: {
    texto: "Mesa oval, vinte cadeiras. Quadro branco vazio. Projetor antigo coberto por lona. Uma coruja sombria pousa sobre a mesa, seus olhos fixos em você.",
    batalha: "coruja",
    vitoria: 521,
    derrota: 320
},

521: {
    texto: "Após derrotar a coruja, você pode explorar a sala com segurança. Mesa oval, vinte cadeiras. Quadro branco vazio. Projetor antigo coberto por lona.",
    opcoes: [
        { texto: "Examinar o quadro", secao: 62 },
        { texto: "Sair pela porta dupla", secao: 63, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
        { texto: "Retornar ao corredor", secao: 42 }
    ]
},


        53: {
            texto: "Correntes grossas, cadeado industrial. Você não tem a chave. Metal frio.",
            opcoes: [
                { texto: "Retornar ao pátio", secao: 45 }
            ]
        },

        54: {
            texto: "Madeira e papelão. Etiquetas desbotadas: 'Frágil', 'Importado', 'Manter Refrigerado'.",
            opcoes: [
                { texto: "Retornar ao pátio", secao: 45 }
            ]
        },

        55: {
            texto: "Tubulações expostas. Caixas de fusíveis. Cheiro de óleo e metal.",
            opcoes: [
                { texto: "Examinar as caixas de fusíveis", secao: 64 },
                { texto: "Seguir o corredor", secao: 65 },
                { texto: "Retornar ao pátio", secao: 45 }
            ]
        },

        56: {
            texto: "Pedra fria. Você senta e observa. Nenhum pássaro, nenhum inseto. Apenas silêncio.",
            opcoes: [
                { texto: "Levantar", secao: 47 }
            ]
        },

        57: {
            texto: "Estrutura de ferro. Hera seca, mas não morta. Sombra agradável.",
            opcoes: [
                { texto: "Retornar", secao: 47 }
            ]
        },

        58: {
            texto: "Arbustos de buxo aparados. Caminhos estreitos. Você avança.",
            opcoes: [
                { texto: "Continuar", secao: 66 },
                { texto: "Retornar à entrada", secao: 48 }
            ]
        },

        59: {
            texto: "Você segue a borda externa. Leva cinco minutos. Nenhuma surpresa.",
            opcoes: [
                { texto: "Retornar", secao: 48 }
            ]
        },

        60: {
            texto: "Cabo de madeira, lâmina de metal. Ferramenta sólida.",
            efeitos: [{ tipo: "item", item: "pa-jardinagem" }],
            opcoes: [
                { texto: "Retornar à sala", secao: 50 }
            ]
        },

        61: {
            texto: "Canteiros de flores sem flores. Terra escura e úmida. Céu azul acima.",
            opcoes: [
                { texto: "Explorar os canteiros", secao: 67 },
                { texto: "Seguir o caminho de pedras", secao: 68 },
                { texto: "Retornar à sala", secao: 50 }
            ]
        },

        62: {
            texto: "Superfície limpa. Marcadores secos na bandeja. Nenhuma mensagem.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 52 }
            ]
        },

        63: {
            texto: "Pinturas abstratas em telas enormes. Cores vibrantes: vermelho, azul, dourado. Nenhuma assinatura visível.",
            opcoes: [
                { texto: "Examinar as pinturas", secao: 69 },
                { texto: "Seguir pela galeria", secao: 70 },
                { texto: "Retornar ao salão", secao: 52 }
            ]
        },

        64: {
            texto: "Disjuntores todos ligados. Sistema elétrico ativo. Etiquetas: 'Ala Norte', 'Cozinha', 'Capela'.",
            opcoes: [
                { texto: "Retornar ao corredor", secao: 55 }
            ]
        },

        65: {
            texto: "Caldeira industrial desligada. Medidores em zero. Cheiro de metal e poeira.",
            opcoes: [
                { texto: "Examinar a caldeira", secao: 71 },
                { texto: "Sair pela porta dos fundos", secao: 72, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Retornar ao corredor", secao: 55 }
            ]
        },

        66: {
            texto: "Pequena clareira circular. Banco de pedra. Nada mais.",
            opcoes: [
                { texto: "Sentar", secao: 73 },
                { texto: "Retornar", secao: 58 }
            ]
        },

        67: {
            texto: "Terra preparada, mas nenhuma planta. Umidade presente.",
            opcoes: [
                { texto: "Retornar ao jardim", secao: 61 }
            ]
        },

        68: {
            texto: "Pedras brancas polidas. O caminho leva a uma porta de vidro.",
            opcoes: [
                { texto: "Abrir a porta", secao: 74, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar", secao: 61 }
            ]
        },

        69: {
            texto: "Pinceladas largas. Formas que sugerem movimento. Nenhuma figura reconhecível.",
            opcoes: [
                { texto: "Retornar à galeria", secao: 63 }
            ]
        },

        70: {
            texto: "Esculturas de bronze e mármore. Formas humanas distorcidas, abstratas. Pedestais numerados.",
            opcoes: [
                { texto: "Examinar uma escultura", secao: 75 },
                { texto: "Sair pela porta lateral", secao: 76, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar à galeria", secao: 63 }
            ]
        },

        71: {
            texto: "Metal enferrujado em alguns pontos. Desligada há meses, talvez anos.",
            opcoes: [
                { texto: "Retornar à sala", secao: 65 }
            ]
        },

        72: {
            texto: "Pilhas de carvão. Pás encostadas na parede. Cheiro de mineral.",
            opcoes: [
                { texto: "Sair pela porta externa", secao: 77, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar à sala", secao: 65 }
            ]
        },

        73: {
            texto: "Você senta. O labirinto bloqueia a visão. Apenas céu acima. Silêncio completo.",
            opcoes: [
                { texto: "Levantar e sair", secao: 66 }
            ]
        },

        74: {
            texto: "Paredes cobertas por espelhos. Seu reflexo se multiplica infinitamente. Luz de lustres de cristal.",
            opcoes: [
                { texto: "Caminhar entre os espelhos", secao: 78 },
                { texto: "Tocar um espelho", secao: 79 },
                { texto: "Sair pela porta oposta", secao: 80, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar", secao: 68 }
            ]
        },

        75: {
            texto: "Bronze polido, detalhes de ouro. Forma que lembra um corpo curvado. Frio ao toque.",
            efeitos: [{ tipo: "item", item: "bolsa-ouro-pequena" }],
            opcoes: [
                { texto: "Retornar ao salão", secao: 70 }
            ]
        },

        76: {
            texto: "Cavaletes, telas em branco, tintas secas em tubos. Cheiro de terebintina.",
            opcoes: [
                { texto: "Examinar as telas", secao: 81 },
                { texto: "Sair pela janela para o terraço", secao: 82 },
                { texto: "Retornar ao salão", secao: 70 }
            ]
        },

        77: {
            texto: "Área aberta. Muros altos. Portão de ferro trancado. Nenhuma vegetação.",
            opcoes: [
                { texto: "Examinar o portão", secao: 83 },
                { texto: "Explorar o perímetro", secao: 84 },
                { texto: "Retornar ao depósito", secao: 72 }
            ]
        },

        78: {
            texto: "Você caminha. Seus reflexos se movem em sincronia perfeita. Nenhuma distorção.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 74 }
            ]
        },

        79: {
            texto: "Vidro liso. Seu reflexo é nítido. Nenhuma marca, nenhuma imperfeição.",
            opcoes: [
                { texto: "Retornar ao salão", secao: 74 }
            ]
        },

        80: {
            texto: "Piso de madeira encerada. Lustre central imenso. Palco pequeno ao fundo. Silêncio absoluto.",
            opcoes: [
                { texto: "Atravessar até o palco", secao: 85 },
                { texto: "Examinar o lustre", secao: 86 },
                { texto: "Sair pela porta lateral", secao: 87, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao salão", secao: 74 }
            ]
        },

        81: {
            texto: "Preparadas com gesso. Nenhuma pincelada. Prontas para uso.",
            opcoes: [
                { texto: "Retornar ao ateliê", secao: 76 }
            ]
        },

       82: {
            texto: "Pedra sob seus pés. Vista para jardins internos e telhados de outras alas. Céu azul, sem nuvens.",
            opcoes: [
                { texto: "Observar a vista", secao: 88 },
                { texto: "Entrar pela porta adjacente", secao: 89, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar ao ateliê", secao: 76 }
            ]
        },

        83: {
            texto: "Trancado. Barras grossas. Além dele, mais pátios e muros.",
            opcoes: [
                { texto: "Retornar ao pátio", secao: 77 }
            ]
        },

        84: {
            texto: "Muros de pedra, três metros de altura. Nenhuma escada, nenhuma abertura.",
            opcoes: [
                { texto: "Retornar ao pátio", secao: 77 }
            ]
        },

        85: {
            texto: "Tábuas de madeira. Cortinas vermelhas fechadas. Nenhum instrumento, nenhum cenário.",
            opcoes: [
                { texto: "Abrir as cortinas", secao: 90 },
                { texto: "Retornar à sala", secao: 80 }
            ]
        },

        86: {
            texto: "Cristais que refratam luz. Deve pesar centenas de quilos. Suspenso por correntes de bronze.",
            opcoes: [
                { texto: "Retornar à sala", secao: 80 }
            ]
        },

        87: {
            texto: "Espelhos com lâmpadas. Cadeiras estofadas. Nenhum cosmético, nenhuma roupa.",
            opcoes: [
                { texto: "Examinar os espelhos", secao: 91 },
                { texto: "Sair pela porta dos fundos", secao: 92, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar à sala", secao: 80 }
            ]
        },

        88: {
            texto: "O edifício se estende em todas as direções. Torres, cúpulas, alas inteiras. Você está em uma fração mínima.",
            opcoes: [
                { texto: "Retornar ao terraço", secao: 82 }
            ]
        },

        89: {
            texto: "Três andares de estantes. Escadas em espiral. Dezenas de milhares de livros. Silêncio denso.",
            opcoes: [
                { texto: "Explorar o primeiro andar", secao: 93 },
                { texto: "Subir para o segundo andar", secao: 94 },
                { texto: "Procurar por uma saída", secao: 95 },
                { texto: "Retornar ao terraço", secao: 82 }
            ]
        },

        90: {
            texto: "Parede de tijolos. Nenhuma porta, nenhuma janela. Apenas parede.",
            opcoes: [
                { texto: "Retornar ao palco", secao: 85 }
            ]
        },

        91: {
            texto: "Você se vê claramente. Nenhuma mudança. Nenhum detalhe estranho.",
            opcoes: [
                { texto: "Retornar ao camarim", secao: 87 }
            ]
        },

        92: {
            texto: "Estreito, mal iluminado. Portas numeradas. Cheiro de poeira.",
            opcoes: [
                { texto: "Abrir porta 3", secao: 96, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Abrir porta 7", secao: 97, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Seguir até o fim", secao: 98 },
                { texto: "Retornar ao camarim", secao: 87 }
            ]
        },

        93: {
            texto: "Platão, Aristóteles, Kant, Nietzsche. Edições antigas, encadernações de couro.",
            opcoes: [
                { texto: "Retornar à biblioteca", secao: 89 }
            ]
        },

        94: {
            texto: "Crônicas, biografias, tratados militares. Janelas altas com vista para jardins.",
            opcoes: [
                { texto: "Examinar os livros", secao: 99 },
                { texto: "Retornar ao primeiro andar", secao: 89 }
            ]
        },

        95: {
            texto: "Porta de carvalho maciço. Destrancada.",
            opcoes: [
                { texto: "Abrir e sair", secao: 100, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Retornar à biblioteca", secao: 89 }
            ]
        },

        96: {
            texto: "Máscaras teatrais, espadas falsas, coroas de papelão. Poeira espessa.",
            opcoes: [
                { texto: "Retornar ao corredor", secao: 92 }
            ]
        },

        97: {
            texto: "Equipamento antigo. Botões, alavancas, fios. Tudo desligado.",
            opcoes: [
                { texto: "Retornar ao corredor", secao: 92 }
            ]
        },

        98: {
            texto: "Degraus de concreto. Corrimão de metal. Sobe e desce.",
            opcoes: [
                { texto: "Descer", secao: 170 },
                { texto: "Retornar ao corredor", secao: 92 }
            ]
        },

        99: {
            texto: "Guerras, impérios, revoluções. Nenhum evento que você reconheça completamente. Datas que não fazem sentido.",
            opcoes: [
                { texto: "Retornar ao segundo andar", secao: 94 }
            ]
        },

        100: {
            texto: "Paredes curvas. Janelas de ambos os lados. Você vê jardins internos à esquerda, pátios à direita. O corredor continua.",
            opcoes: [
                { texto: "Seguir em frente", secao: 101 },
                { texto: "Retornar à biblioteca", secao: 89 }
            ]
        },

101: {
            texto: "Você desperta caminhando. Mármore polido, lustres de cristal, silêncio absoluto. Memória vaga de como chegou aqui.",
            opcoes: [
                { texto: "Seguir em frente", secao: 102 },
                { texto: "Examinar as paredes", secao: 103 },
                { texto: "Virar à esquerda", secao: 104 }
            ]
        },

       102: {
            texto: "Teto altíssimo com afrescos de batalhas. Escadaria dupla ao fundo. Portas laterais fechadas.",
            opcoes: [
                { texto: "Subir a escadaria", secao: 105 },
                { texto: "Tentar a porta esquerda", secao: 106, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Tentar a porta direita", secao: 107, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" }
            ]
        },

        103: {
            texto: "Relevos em ouro representam figuras encapuzadas. Frio ao toque. Nenhuma inscrição legível. Lascas de ouro se desprendem dos relevos.",
            efeitos: [{ tipo: "item", item: "bolsa-ouro-pequena" }],
            opcoes: [
                { texto: "Retornar ao corredor", secao: 101 },
                { texto: "Seguir em frente", secao: 102 }
            ]
        },

        104: {
            texto: "Janelas altas mostram céu cinza. Portas de mogno enfileiradas. Tapete vermelho gasto.",
            opcoes: [
                { texto: "Abrir primeira porta", secao: 108, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Abrir segunda porta", secao: 109, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Continuar até o fim", secao: 110 }
            ]
        },

        105: {
            texto: "Varanda circular. Três corredores se ramificam: norte, leste, oeste. Candelabros apagados.",
            opcoes: [
                { texto: "Corredor norte", secao: 111 },
                { texto: "Corredor leste", secao: 112 },
                { texto: "Corredor oeste", secao: 113 }
            ]
        },

        106: {
            texto: "Madeira maciça. Fechadura complexa. Não cede.",
            opcoes: [
                { texto: "Forçar", secao: 114, teste: "habilidade", dificuldade: 15 },
                { texto: "Retornar ao hall", secao: 102 }
            ]
        },

        107: {
            texto: "Cadeiras de veludo alinhadas. Mesa central com jarra de água cristalina. Silêncio opressivo.",
            opcoes: [
                { texto: "Beber água", secao: 115 },
                { texto: "Examinar cadeiras", secao: 116 },
                { texto: "Sair pela porta oposta", secao: 117, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        108: {
            texto: "Piano de cauda coberto por pano branco. Partituras espalhadas. Cheiro de cera.",
            opcoes: [
                { texto: "Tocar piano", secao: 118 },
                { texto: "Ler partituras", secao: 119 },
                { texto: "Sair", secao: 104 }
            ]
        },

        109: {
            texto: "Quadros de batalhas, coroações, concílios. Rostos sem expressão. Molduras douradas.",
            opcoes: [
                { texto: "Examinar quadro maior", secao: 120 },
                { texto: "Procurar assinatura", secao: 121 },
                { texto: "Sair", secao: 104 }
            ]
        },

        110: {
            texto: "Bronze trabalhado. Símbolos geométricos entrelaçados. Destrancada.",
            opcoes: [
                { texto: "Entrar", secao: 122 },
                { texto: "Retornar", secao: 104 }
            ]
        },

        111: {
            texto: "Tecidos pesados cobrem as paredes. Cenas de caça e festas. Ar abafado.",
            opcoes: [
                { texto: "Afastar tapeçaria", secao: 123 },
                { texto: "Seguir até o fim", secao: 124 },
                { texto: "Retornar", secao: 105 }
            ]
        },

        112: {
            texto: "Luz colorida filtra por vitrais imensos. Padrões geométricos e florais. Piso de mármore aquecido.",
            opcoes: [
                { texto: "Examinar vitral central", secao: 125 },
                { texto: "Continuar", secao: 126 },
                { texto: "Retornar", secao: 105 }
            ]
        },

        113: {
            texto: "Armaduras completas alinhadas. Alabardas, espadas, escudos. Metal sem ferrugem.",
            opcoes: [
                { texto: "Pegar espada", secao: 127 },
                { texto: "Examinar elmo", secao: 128 },
                { texto: "Seguir adiante", secao: 129 }
            ]
        },

        114: {
            texto: "A fechadura resiste. Seus dedos doem. Nada muda.",
            efeitos: [{ tipo: "energia", valor: -1 }],
            opcoes: [
                { texto: "Retornar", secao: 102 }
            ]
        },

        115: {
            texto: "Sabor puro. Frescor imediato.",
            efeitos: [{ tipo: "energia", valor: 2 }],
            opcoes: [
                { texto: "Encher recipiente (se tiver)", secao: 130 },
                { texto: "Sair", secao: 117 }
            ]
        },

        116: {
            texto: "Tecido intacto mas empoeirado. Nenhum objeto escondido. Tempo perdido.",
            opcoes: [
                { texto: "Retornar", secao: 107 }
            ]
        },

        117: {
            texto: "Escudos heráldicos cobrem paredes. Leões, águias, cruzes. Nenhum reconhecível.",
            opcoes: [
                { texto: "Examinar brasão central", secao: 131 },
                { texto: "Porta ao fundo", secao: 132, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar", secao: 107 }
            ]
        },

        118: {
            texto: "O piano emite som perfeito. A nota ecoa longamente. Nada mais acontece.",
            opcoes: [
                { texto: "Sair", secao: 108 }
            ]
        },

        119: {
            texto: "Notação musical estranha. Alguns símbolos que não são notas. Papel amarelado.",
            opcoes: [
                { texto: "Tocar partitura", secao: 133 },
                { texto: "Deixar", secao: 108 }
            ]
        },

        120: {
            texto: "Figura central usa coroa de espinhos dourados. Multidão ajoelhada. Céu vermelho ao fundo.",
            opcoes: [
                { texto: "Procurar placa", secao: 134 },
                { texto: "Sair", secao: 109 }
            ]
        },

        121: {
            texto: "Rabiscos em tinta preta. Nenhum nome claro. Datas estranhas.",
            opcoes: [
                { texto: "Sair", secao: 109 }
            ]
        },

        122: {
            texto: "Trono de ébano e ouro. Vazio. Tapete púrpura leva até ele. Janelas mostram jardins internos.",
            opcoes: [
                { texto: "Sentar no trono", secao: 135 },
                { texto: "Examinar janelas", secao: 136 },
                { texto: "Porta lateral", secao: 137, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Retornar", secao: 110 }
            ]
        },

        123: {
            texto: "Atrás da tapeçaria, porta estreita de pedra. Escuridão além.",
            opcoes: [
                { texto: "Entrar", secao: 138, requer: "tocha" },
                { texto: "Retornar", secao: 111 }
            ]
        },

        124: {
            texto: "Mesa oval. Doze cadeiras. Documentos empilhados. Cheiro de couro velho.",
            opcoes: [
                { texto: "Ler documentos", secao: 139 },
                { texto: "Examinar cadeiras", secao: 140 },
                { texto: "Porta oposta", secao: 141, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        125: {
            texto: "Sol dourado à esquerda, lua prateada à direita. Entrelaçados no centro. Luz quente.",
            opcoes: [
                { texto: "Tocar o vidro", secao: 142 },
                { texto: "Continuar", secao: 126 }
            ]
        },

        126: {
            texto: "Cúpula de vidro. Plantas exuberantes. Umidade densa. Flores sem perfume.",
            opcoes: [
                { texto: "Colher fruto", secao: 143 },
                { texto: "Examinar plantas", secao: 144 },
                { texto: "Sair", secao: 112 }
            ]
        },

        127: {
            texto: "Lâmina perfeita. Peso equilibrado.",
            efeitos: [{ tipo: "item", item: "espada-longa" }],
            opcoes: [
                { texto: "Continuar", secao: 113 }
            ]
        },

        128: {
            texto: "Visor baixado. Interior forrado de seda vermelha. Vazio.",
            opcoes: [
                { texto: "Vestir elmo", secao: 145 },
                { texto: "Deixar", secao: 113 }
            ]
        },

        129: {
            texto: "Prateleiras com armas brancas. Bestas, machados, maças. Tudo impecável.",
            opcoes: [
                { texto: "Pegar besta", secao: 146 },
                { texto: "Examinar flechas", secao: 147 },
                { texto: "Porta ao fundo", secao: 148, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        130: {
            texto: "Você enche seu recipiente com água cristalina.",
            efeitos: [{ tipo: "item", item: "agua-3-doses" }],
            opcoes: [
                { texto: "Sair", secao: 107 }
            ]
        },

        131: {
            texto: "Torre negra sobre campo dourado. Três estrelas acima. Lema em latim: 'Tempus Edax Rerum'.",
            opcoes: [
                { texto: "Memorizar", secao: 149 },
                { texto: "Sair", secao: 117 }
            ]
        },

        132: {
            texto: "Estantes até o teto. Escadas rolantes. Documentos encadernados em couro negro.",
            opcoes: [
                { texto: "Subir escada", secao: 150 },
                { texto: "Ler documento próximo", secao: 151 },
                { texto: "Sair", secao: 117 }
            ]
        },

        133: {
            texto: "Uma música esquisita, mas nostálgica. Barulho de clique, compartimento interno do piano aberto, no interior se encontra uma chave.",
            efeitos: [
                { tipo: "item", item: "engrenagem-prata" },
                { tipo: "item", item: "bolsa-ouro-pequena" }
            ],
            opcoes: [
                { texto: "Sair", secao: 108 }
            ]
        },

        134: {
            texto: "Apenas marcas na parede onde deveria estar. Pregos enferrujados.",
            opcoes: [
                { texto: "Sair", secao: 109 }
            ]
        },

        135: {
            texto: "Frio penetrante. Visão ampla do salão. Sensação de peso nos ombros. Nada mais.",
            opcoes: [
                { texto: "Levantar", secao: 122 }
            ]
        },

        136: {
            texto: "Pátio quadrado. Fontes secas. Árvores podadas geometricamente. Céu cinza imóvel.",
            opcoes: [
                { texto: "Procurar saída para jardim", secao: 152 },
                { texto: "Retornar", secao: 122 }
            ]
        },

        137: {
            texto: "Globos terrestres. Mapas náuticos. Continentes que não reconhece. Oceanos com nomes estranhos.",
            opcoes: [
                { texto: "Examinar globo", secao: 153 },
                { texto: "Rolar mapa", secao: 154 },
                { texto: "Sair", secao: 122 }
            ]
        },

        138: {
            texto: "Impossível avançar sem luz. Ar frio vem de dentro.",
            opcoes: [
                { texto: "Retornar", secao: 111 }
            ]
        },

        139: {
            texto: "Tratados entre nações desconhecidas. Selos de cera intactos. Idiomas misturados.",
            opcoes: [
                { texto: "Guardar documento", secao: 155 },
                { texto: "Deixar", secao: 124 }
            ]
        },

        140: {
            texto: "Madeira escura. Almofadas vermelhas. Nenhuma diferente. Nenhuma marca de uso.",
            opcoes: [
                { texto: "Sair", secao: 124 }
            ]
        },

        141: {
            texto: "Escada em espiral sobe pela torre. Instrumentos astronômicos cobertos. Cheiro de metal.",
            opcoes: [
                { texto: "Subir", secao: 156 },
                { texto: "Examinar instrumentos", secao: 157 },
                { texto: "Retornar", secao: 124 }
            ]
        },

        142: {
            texto: "Calor suave pulsa sob seus dedos. Luz intensifica brevemente. Depois normaliza.",
            opcoes: [
                { texto: "Continuar", secao: 126 }
            ]
        },

        143: {
            texto: "Aparência suculenta. Você come. Sabor amargo.",
            opcoes: [
                { texto: "Continuar", secao: 126, teste: "sorte", dificuldade: 12 }
            ]
        },

        144: {
            texto: "Folhas com dentes. Algumas abertas. Restos de insetos dentro. Você recua.",
            opcoes: [
                { texto: "Sair", secao: 126 }
            ]
        },

        145: {
            texto: "Visor estreita campo de visão. Respiração ecoa. Desconfortável.",
            opcoes: [
                { texto: "Tirar", secao: 113 }
            ]
        },

        146: {
            texto: "Besta pesada mas bem equilibrada.",
            efeitos: [{ tipo: "item", item: "besta" }],
            opcoes: [
                { texto: "Continuar", secao: 129 }
            ]
        },

        147: {
            texto: "Virotes emplumados, pontas afiadas.",
            efeitos: [{ tipo: "item", item: "virotes-10" }],
            opcoes: [
                { texto: "Continuar", secao: 129 }
            ]
        },

        148: {
            texto: "Bancadas com ferramentas. Óleos, pedras de amolar, couro. Ordem meticulosa.",
            opcoes: [
                { texto: "Pegar ferramentas", secao: 158 },
                { texto: "Examinar bancada", secao: 159 },
                { texto: "Porta lateral", secao: 160, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" }
            ]
        },

        149: {
            texto: "'O tempo devora todas as coisas.' Você sente o peso das palavras.",
            opcoes: [
                { texto: "Sair", secao: 117 }
            ]
        },

        150: {
            texto: "Documentos mais antigos. Pergaminhos frágeis. Selos reais desconhecidos.",
            opcoes: [
                { texto: "Ler pergaminho", secao: 161 },
                { texto: "Descer", secao: 132 }
            ]
        },

        151: {
            texto: "Nomes, datas, títulos. 'Papa Gregório XIX - 2087'. 'Imperador Zhao - 1823'. Impossível.",
            opcoes: [
                { texto: "Continuar lendo", secao: 162 },
                { texto: "Sair", secao: 132 }
            ]
        },

        152: {
            texto: "Trancada. Vidro grosso. Você vê o jardim mas não pode alcançá-lo.",
            opcoes: [
                { texto: "Quebrar vidro", secao: 163, teste: "habilidade", dificuldade: 16 },
                { texto: "Retornar", secao: 122 }
            ]
        },

        153: {
            texto: "Sete continentes. Nenhum corresponde ao que conhece. Oceano central chamado 'Mare Infinitum'.",
            opcoes: [
                { texto: "Girar globo", secao: 164 },
                { texto: "Sair", secao: 137 }
            ]
        },

        154: {
            texto: "Rotas comerciais. Ilhas numeradas. Escala incompreensível.",
            efeitos: [{ tipo: "item", item: "mapa-nautico" }],
            opcoes: [
                { texto: "Sair", secao: 137 }
            ]
        },

        155: {
            texto: "Você guarda o tratado cuidadosamente.",
            efeitos: [{ tipo: "item", item: "documento-diplomatico" }],
            opcoes: [
                { texto: "Sair", secao: 124 }
            ]
        },

        156: {
            texto: "Telescópio gigante aponta para cúpula fechada. Painéis de controle. Alavancas.",
            opcoes: [
                { texto: "Abrir cúpula", secao: 165 },
                { texto: "Olhar telescópio", secao: 166 },
                { texto: "Descer", secao: 141 }
            ]
        },

        157: {
            texto: "Anéis entrelaçados. Gravações em árabe e latim. Mecanismo travado.",
            opcoes: [
                { texto: "Tentar girar", secao: 167, requer: "kit-ferramentas" },
                { texto: "Deixar", secao: 141 }
            ]
        },

        158: {
            texto: "Kit completo de ferramentas de precisão.",
            efeitos: [{ tipo: "item", item: "kit-ferramentas" }],
            opcoes: [
                { texto: "Continuar", secao: 148 }
            ]
        },

        159: {
            texto: "Desenhos de mecanismos. Engrenagens, polias, contrapesos. Anotações em alemão.",
            opcoes: [
                { texto: "Guardar", secao: 168 },
                { texto: "Deixar", secao: 148 }
            ]
        },

        160: {
            texto: "Baias vazias. Feno fresco. Cheiro de cavalo ausente. Selas penduradas.",
            opcoes: [
                { texto: "Examinar selas", secao: 169 },
                { texto: "Porta oposta", secao: 170, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Retornar", secao: 148 }
            ]
        },

        161: {
            texto: "Decreto de fundação do castelo. Data: 'Ano Zero da Nova Contagem'. Assinatura ilegível.",
            opcoes: [
                { texto: "Descer", secao: 132 }
            ]
        },

        162: {
            texto: "Entradas recentes. 'Conselho Extraordinário - ontem'. 'Evacuação completa - hoje'. Tinta fresca.",
            opcoes: [
                { texto: "Procurar mais", secao: 171 },
                { texto: "Sair", secao: 132 }
            ]
        },

        163: {
            texto: "Você golpeia. Vidro racha mas não quebra. Fragmento salta e corta seu braço.",
            efeitos: [{ tipo: "energia", valor: -3 }],
            opcoes: [
                { texto: "Retornar", secao: 122 }
            ]
        },

        164: {
            texto: "Ao girar, clique suave. Gaveta se abre na base. Dentro: chave de bronze.",
            efeitos: [{ tipo: "item", item: "chave-bronze" }],
            opcoes: [
                { texto: "Sair", secao: 137 }
            ]
        },

        165: {
            texto: "Céu cinza uniforme. Sem sol, sem estrelas. Luz difusa sem fonte. Vento frio.",
            opcoes: [
                { texto: "Olhar telescópio", secao: 166 },
                { texto: "Descer", secao: 156 }
            ]
        },

        166: {
            texto: "Ampliação revela... o mesmo céu cinza. Nenhuma estrela. Nenhuma nuvem. Vazio.",
            opcoes: [
                { texto: "Descer", secao: 156 }
            ]
        },

        167: {
            texto: "O Mecanismo interno que parecia fundido, cede. Você encontra um envelope com uma senha.",
            efeitos: [{ tipo: "item", item: "envelope-senha" }],
            opcoes: [
                { texto: "Deixar", secao: 141 }
            ]
        },

        168: {
            texto: "Você guarda os projetos cuidadosamente.",
            efeitos: [{ tipo: "item", item: "projeto-mecanico" }],
            opcoes: [
                { texto: "Continuar", secao: 148 }
            ]
        },

        169: {
            texto: "Trabalho fino. Iniciais gravadas: 'V.R.', 'M.K.', 'T.S.'. Couro macio.",
            opcoes: [
                { texto: "Continuar", secao: 160 }
            ]
        },

        170: {
            texto: "Escada desce em espiral. Ar frio e úmido. Cheiro de vinho e pedra.",
            opcoes: [
                { texto: "Descer", secao: 172 },
                { texto: "Retornar para estábulos", secao: 160 },
                { texto: "Retornar para escada de serviços do teatro", secao: 98 }
            ]
        },

        171: {
            texto: "Marca de rasgo recente. Última entrada incompleta: 'O protocolo foi revisto. Todos devem—'",
            opcoes: [
                { texto: "Sair", secao: 132 }
            ]
        },

        172: {
            texto: "Barris imensos. Garrafas empoeiradas. Prateleiras infinitas. Temperatura constante. Uma caixa escondida em um canto contém moedas.",
            efeitos: [{ tipo: "item", item: "bolsa-ouro-pequena" }],
            opcoes: [
                { texto: "Abrir barril", secao: 173 },
                { texto: "Examinar garrafas", secao: 174 },
                { texto: "Porta ao fundo", secao: 175, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        173: {
            texto: "Aroma forte. Sabor encorpado.",
            efeitos: [{ tipo: "energia", valor: 2 }],
            opcoes: [
                { texto: "Continuar", secao: 172 }
            ]
        },

        174: {
            texto: "Rótulos: 'Château Cronos 2156', 'Vinho do Fim 1888'. Garrafas intactas.",
            opcoes: [
                { texto: "Pegar garrafa", secao: 176 },
                { texto: "Deixar", secao: 172 }
            ]
        },

        175: {
            texto: "Calor intenso. Fornos gigantes. Brasas ainda acesas. Carvão empilhado.",
            opcoes: [
                { texto: "Examinar fornos", secao: 177 },
                { texto: "Pegar carvão", secao: 178 },
                { texto: "Porta lateral", secao: 179, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        176: {
            texto: "Garrafa antiga e valiosa.",
            efeitos: [{ tipo: "item", item: "vinho-raro" }],
            opcoes: [
                { texto: "Continuar", secao: 172 }
            ]
        },

        177: {
            texto: "Fogo baixo mas constante. Nenhum combustível visível sendo consumido. Calor perpétuo.",
            opcoes: [
                { texto: "Investigar mecanismo", secao: 180 },
                { texto: "Sair", secao: 175 }
            ]
        },

        178: {
            texto: "Carvão mineral de boa qualidade.",
            efeitos: [{ tipo: "item", item: "carvao" }],
            opcoes: [
                { texto: "Continuar", secao: 175 }
            ]
        },

        179: {
            texto: "Poço profundo. Água cristalina no fundo. Balde e corda disponíveis.",
            opcoes: [
                { texto: "Puxar água", secao: 181 },
                { texto: "Examinar profundidade", secao: 182 },
                { texto: "Sair", secao: 175 }
            ]
        },

        180: {
            texto: "Engrenagens giram sozinhas. Calor vem de dentro da pedra. Impossível desligar.",
            opcoes: [
                { texto: "Sair", secao: 175 }
            ]
        },

        181: {
            texto: "Água pura e fresca do poço profundo.",
            efeitos: [{ tipo: "item", item: "agua-5-doses" }],
            opcoes: [
                { texto: "Continuar", secao: 179 }
            ]
        },

       182: {
            texto: "Você se inclina demais. Pedras soltas. Equilíbrio perdido.",
            opcoes: [
                { texto: "Tentar se segurar", secao: 179, teste: "habilidade", dificuldade: 14 }
            ]
        },

        183: {
            texto: "Corredor estreito. Portas de ferro. Tochas apagadas. Silêncio absoluto.",
            opcoes: [
                { texto: "Entrar", secao: 184, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Retornar", secao: 175 }
            ]
        },

        184: {
            texto: "Grades enferrujadas. Palha podre. Correntes nas paredes. Nenhum prisioneiro. Nunca houve.",
            opcoes: [
                { texto: "Examinar cela", secao: 185 },
                { texto: "Continuar", secao: 186 },
                { texto: "Retornar", secao: 183 }
            ]
        },

        185: {
            texto: "Arranhões profundos. Não são palavras. Padrões repetitivos. Contagem? Ritual?",
            opcoes: [
                { texto: "Sair", secao: 184 }
            ]
        },

        186: {
            texto: "Mesa de madeira. Instrumentos pendurados. Limpos. Nunca usados.",
            opcoes: [
                { texto: "Examinar instrumentos", secao: 187 },
                { texto: "Porta oposta", secao: 188, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Retornar", secao: 184 }
            ]
        },

        187: {
            texto: "Polidos. Afiados. Sem marcas de sangue. Decorativos? Ameaça simbólica?",
            opcoes: [
                { texto: "Sair", secao: 186 }
            ]
        },

        188: {
            texto: "Arena coberta. Bonecos de treino. Armas de madeira. Marcas de uso recente.",
            batalha: "dobermann",
            vitoria: 189,
            derrota: 320
        },

        189: {
            texto: "Você pratica golpes. Músculos respondem bem.",
            efeitos: [{ tipo: "habilidade", valor: 1 }],
            opcoes: [
                { texto: "Continuar", secao: 188 }
            ]
        },

        190: {
            texto: "Cortes precisos. Alguém treinou aqui recentemente. Palha ainda fresca no chão.",
            opcoes: [
                { texto: "Sair", secao: 188 }
            ]
        },

        191: {
            texto: "Manuais de combate. Estratégias de cerco. Mapas de batalhas. Idiomas variados.",
            opcoes: [
                { texto: "Ler manual", secao: 192 },
                { texto: "Examinar mapas", secao: 193 },
                { texto: "Escada", secao: 194 }
            ]
        },

        192: {
            texto: "Ilustrações detalhadas. Técnicas avançadas.",
            opcoes: [
                { texto: "Ler completamente", secao: 195 },
                { texto: "Deixar", secao: 191 }
            ]
        },

        193: {
            texto: "Este castelo. Visto de cima. Muralhas, torres, passagens secretas marcadas.",
            efeitos: [{ tipo: "item", item: "mapa-castelo" }],
            opcoes: [
                { texto: "Continuar", secao: 191 }
            ]
        },

        194: {
            texto: "Mezanino. Livros raros. Globos iluminados. Escrivaninhas de mármore. No final, uma porta com Mecanismos de prata trancada.",
            opcoes: [
                { texto: "Examinar livros", secao: 196 },
                { texto: "Globo iluminado", secao: 197 },
                { texto: "Abrir a porta", secao: 198, requer: "engrenagem-prata", som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" }
            ]
        },

        195: {
            texto: "Conhecimento profundo adquirido através de horas de estudo.",
            efeitos: [
                { tipo: "habilidade", valor: 1 },
                { tipo: "energia", valor: -2 }
            ],
            opcoes: [
                { texto: "Sair", secao: 191 }
            ]
        },

        196: {
            texto: "Tratados sobre tempo, realidade, percepção. Autores desconhecidos. Conceitos densos.",
            opcoes: [
                { texto: "Ler brevemente", secao: 199 },
                { texto: "Deixar", secao: 194 }
            ]
        },

        197: {
            texto: "Luz interna sem fonte. Continentes brilham em verde. Oceanos em azul profundo.",
            opcoes: [
                { texto: "Tocar", secao: 200 },
                { texto: "Deixar", secao: 194 }
            ]
        },

        198: {
            texto: "Degraus de pedra. Corrimão luxuoso de prata. Sobe para torres. Desce para subsolo.",
            opcoes: [
                { texto: "Subir", secao: 202 },
                { texto: "Descer", secao: 203 },
                { texto: "Retornar", secao: 194 }
            ]
        },

        199: {
            texto: "'Tempo é prisão voluntária.' Os tratados sugerem que o tempo não é uma linha, mas algo maleável. As frases parecem escritas para confundir mais do que esclarecer. Nada concreto.",
            opcoes: [
                { texto: "Sair", secao: 194 }
            ]
        },

        200: {
            texto: "Calor suave. Luz pulsa como batimento cardíaco. Depois estabiliza. Nada mais.",
            opcoes: [
                { texto: "Sair", secao: 194 }
            ]
        },

       202: {
            texto: "Mármore branco, lustres de cristal, portas de mogno. Silêncio absoluto.",
            opcoes: [
                { texto: "Porta à esquerda", secao: 205, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Porta à direita", secao: 206, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Escadaria em caracol ascendente", secao: 207 }
            ]
        },

        203: {
            texto: "Pedra fria, tochas apagadas, ar úmido. Escuridão à frente.",
            opcoes: [
                { texto: "Continuar no escuro", secao: 208 },
                { texto: "Retornar à escadaria", secao: 198 },
                { texto: "Procurar por luz", secao: 209 }
            ]
        },

        204: {
            texto: "Prata maciça com relevos de constelações. Frio ao toque.",
            opcoes: [
                { texto: "Subir", secao: 202 },
                { texto: "Descer", secao: 203 }
            ]
        },

        205: {
            texto: "Janelas estreitas, mesa com mapa empoeirado, armadura vazia no canto.",
            opcoes: [
                { texto: "Examinar mapa", secao: 210 },
                { texto: "Examinar armadura", secao: 211 },
                { texto: "Porta oposta", secao: 212, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        206: {
            texto: "Sacos de trigo e centeio perfeitamente preservados. Cheiro de grão fresco.",
            opcoes: [
                { texto: "Comer grãos", secao: 213 },
                { texto: "Examinar sacos", secao: 214 },
                { texto: "Porta ao fundo", secao: 215, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        207: {
            texto: "Degraus de mármore, paredes com tapeçarias. Sobe indefinidamente.",
            opcoes: [
                { texto: "Continuar subindo", secao: 216 },
                { texto: "Retornar", secao: 202 },
                { texto: "Examinar tapeçarias", secao: 217 }
            ]
        },

        208: {
            texto: "Você tropeça em degraus invisíveis.",
            opcoes: [
                { texto: "Tentar se recuperar", secao: 203, teste: "habilidade", dificuldade: 15 }
            ]
        },

        209: {
            texto: "Tocha apagada mas com óleo fresco. Precisa de fogo.",
            opcoes: [
                { texto: "Acender", secao: 218, requer: "fogo" },
                { texto: "Retornar", secao: 203 }
            ]
        },

        210: {
            texto: "Desenho arquitetônico complexo. Múltiplos andares, subsolo profundo.",
            efeitos: [{ tipo: "item", item: "mapa-torre" }],
            opcoes: [
                { texto: "Sair", secao: 205 }
            ]
        },

        211: {
            texto: "Aço polido, sem ferrugem. Interior forrado de veludo vermelho.",
            opcoes: [
                { texto: "Vestir elmo", secao: 219 },
                { texto: "Sair", secao: 205 }
            ]
        },

        212: {
            texto: "Fogão imenso, panelas de cobre, mesa de corte. Tudo limpo e organizado.",
            opcoes: [
                { texto: "Procurar comida", secao: 220 },
                { texto: "Examinar fogão", secao: 221 },
                { texto: "Porta lateral", secao: 222, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" }
            ]
        },

        213: {
            texto: "Sabor neutro mas nutritivo.",
            efeitos: [{ tipo: "energia", valor: 1 }],
            opcoes: [
                { texto: "Continuar", secao: 206 }
            ]
        },

        214: {
            texto: "Símbolos estranhos bordados. Referências sem sentido: 'Colheita De Formas'.",
            opcoes: [
                { texto: "Sair", secao: 206 }
            ]
        },

        215: {
            texto: "Mesa longa, bancos de madeira, talheres de prata. Pratos vazios perfeitamente alinhados.",
            opcoes: [
                { texto: "Sentar", secao: 223 },
                { texto: "Examinar pratos", secao: 224 },
                { texto: "Porta dupla", secao: 225, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" }
            ]
        },

        216: {
            texto: "Corredor circular com portas numeradas. Candelabros acesos sem chama visível.",
            opcoes: [
                { texto: "Porta 1", secao: 226, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Porta 2", secao: 227, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Porta 3", secao: 228, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" },
                { texto: "Continuar subindo", secao: 229 }
            ]
        },

        217: {
            texto: "Cenas de guerra, figuras sem rosto, estandartes irreconhecíveis.",
            opcoes: [
                { texto: "Afastar tapeçaria", secao: 230 },
                { texto: "Continuar", secao: 207 }
            ]
        },

        218: {
            texto: "Luz alaranjada revela escada descendente.",
            efeitos: [{ tipo: "item", item: "tocha" }],
            opcoes: [
                { texto: "Descer com luz", secao: 231 },
                { texto: "Retornar", secao: 203 }
            ]
        },

        219: {
            texto: "O elmo limita sua visão periférica. Desconfortável.",
            opcoes: [
                { texto: "Remover", secao: 205 }
            ]
        },

        220: {
            texto: "Atrás de painel falso: pães, queijos, frutas cristalizadas. Tudo fresco.",
            opcoes: [
                { texto: "Comer", secao: 232 },
                { texto: "Guardar comida", secao: 232 }
            ]
        },

        221: {
            texto: "Brasas acesas sem combustível. Calor constante. Impossível apagar.",
            opcoes: [
                { texto: "Acender tocha (se tiver)", secao: 233 },
                { texto: "Sair", secao: 212 }
            ]
        },

        222: {
            texto: "Beliches alinhados, lençóis brancos impecáveis. Nenhum sinal de uso.",
            opcoes: [
                { texto: "Descansar", secao: 234 },
                { texto: "Examinar beliches", secao: 235 },
                { texto: "Porta ao fundo", secao: 236, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        223: {
            texto: "Você senta. Silêncio opressivo. Nada acontece.",
            opcoes: [
                { texto: "Levantar", secao: 215 }
            ]
        },

        224: {
            texto: "Brasão dourado: torre negra sobre campo branco. Sem rachaduras.",
            opcoes: [
                { texto: "Sair", secao: 215 }
            ]
        },

        225: {
            texto: "Escrivaninha de carvalho, estante com livros militares, mapa na parede.",
            opcoes: [
                { texto: "Examinar escrivaninha", secao: 237 },
                { texto: "Ler livros", secao: 238 },
                { texto: "Examinar mapa", secao: 239 }
            ]
        },

        226: {
            texto: "Globo terrestre, telescópio pequeno, livros de astronomia.",
            opcoes: [
                { texto: "Examinar globo", secao: 240 },
                { texto: "Usar telescópio", secao: 241 },
                { texto: "Sair", secao: 216 }
            ]
        },

        227: {
            texto: "Cama de dossel, baú trancado, janela com vista para névoa cinza.",
            opcoes: [
                { texto: "Forçar baú", secao: 242, teste: "habilidade", dificuldade: 14 },
                { texto: "Examinar janela", secao: 243 },
                { texto: "Sair", secao: 216 }
            ]
        },

        228: {
            texto: "Máquina de costura antiga, tecidos empilhados, agulhas e linhas organizadas.",
            opcoes: [
                { texto: "Procurar itens úteis", secao: 244 },
                { texto: "Examinar tecidos", secao: 245 },
                { texto: "Sair", secao: 216 }
            ]
        },

        229: {
            texto: "Corredor mais estreito, portas de metal, ar mais frio.",
            opcoes: [
                { texto: "Porta de ferro", secao: 246, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Porta de bronze", secao: 247, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Continuar subindo", secao: 248 }
            ]
        },

        230: {
            texto: "Corredor estreito atrás da tapeçaria. Escuridão total.",
            opcoes: [
                { texto: "Entrar com luz", secao: 249, requer: "tocha" },
                { texto: "Retornar", secao: 207 }
            ]
        },

        231: {
            texto: "Pás, picaretas, martelos, serras. Tudo organizado em ganchos.",
            opcoes: [
                { texto: "Pegar pá", secao: 250 },
                { texto: "Pegar martelo", secao: 250 },
                { texto: "Porta lateral", secao: 251, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        232: {
            texto: "Você se sente revigorado.",
            efeitos: [{ tipo: "energia", valor: 2 }],
            opcoes: [
                { texto: "Sair", secao: 212 }
            ]
        },

        233: {
            texto: "Tocha acesa com sucesso.",
            efeitos: [{ tipo: "item", item: "tocha-acesa" }],
            opcoes: [
                { texto: "Sair", secao: 212 }
            ]
        },

        234: {
            texto: "Sono sem sonhos. Você acorda revigorado.",
            efeitos: [{ tipo: "energia", valor: 3 }],
            opcoes: [
                { texto: "Continuar", secao: 222 }
            ]
        },

        235: {
            texto: "Sem marcas, sem dobras. Como se nunca tivessem sido usados.",
            opcoes: [
                { texto: "Sair", secao: 222 }
            ]
        },

        236: {
            texto: "Camas com lençóis brancos, armário com frascos, cheiro de ervas medicinais.",
            opcoes: [
                { texto: "Examinar frascos", secao: 252 },
                { texto: "Examinar camas", secao: 253 },
                { texto: "Porta oposta", secao: 254, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        237: {
            texto: "Fechadura complexa. Precisa de chave específica.",
            opcoes: [
                { texto: "Abrir", secao: 255, requer: "chave-pequena" },
                { texto: "Sair", secao: 225 }
            ]
        },

        238: {
            texto: "Estratégias de defesa, formações de combate.",
            opcoes: [
                { texto: "Ler completamente", secao: 256 },
                { texto: "Sair", secao: 225 }
            ]
        },

        239: {
            texto: "Mostra a torre e arredores. Floresta densa ao redor. Nenhuma estrada visível.",
            opcoes: [
                { texto: "Memorizar", secao: 257 },
                { texto: "Sair", secao: 225 }
            ]
        },

        240: {
            texto: "Geografia impossível. Oceanos com nomes em idiomas mortos.",
            opcoes: [
                { texto: "Girar globo", secao: 258 },
                { texto: "Sair", secao: 226 }
            ]
        },

        241: {
            texto: "Aponta para janela. Você vê apenas névoa cinza uniforme.",
            opcoes: [
                { texto: "Sair", secao: 226 }
            ]
        },

        242: {
            texto: "Dentro: envelope lacrado, moedas de ouro, adaga ornamentada.",
            opcoes: [
                { texto: "Pegar envelope", secao: 259 },
                { texto: "Pegar moedas", secao: 259 },
                { texto: "Pegar adaga", secao: 259 }
            ]
        },

        243: {
            texto: "Não há horizonte. Apenas cinza uniforme. Sem sol, sem referências.",
            opcoes: [
                { texto: "Sair", secao: 227 }
            ]
        },

        244: {
            texto: "Agulhas, linha resistente, tesoura afiada.",
            efeitos: [{ tipo: "item", item: "kit-costura" }],
            opcoes: [
                { texto: "Sair", secao: 228 }
            ]
        },

        245: {
            texto: "Seda, veludo, brocado. Cores vibrantes. Perfeitamente preservados.",
            opcoes: [
                { texto: "Sair", secao: 228 }
            ]
        },

        246: {
            texto: "Tanque imenso de água cristalina. Sistema de filtragem complexo.",
            opcoes: [
                { texto: "Beber água", secao: 260 },
                { texto: "Encher recipiente", secao: 261 },
                { texto: "Examinar sistema", secao: 262 }
            ]
        },

        247: {
            texto: "Cofres de ferro, balança de precisão, livros contábeis.",
            opcoes: [
                { texto: "Examinar cofres", secao: 263 },
                { texto: "Ler livros contábeis", secao: 264 },
                { texto: "Sair", secao: 229 }
            ]
        },

        248: {
            texto: "Corredor com vitrais coloridos. Luz difusa sem fonte aparente.",
            opcoes: [
                { texto: "Examinar vitrais", secao: 265 },
                { texto: "Porta ornamentada", secao: 266, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Continuar subindo", secao: 267 }
            ]
        },

        249: {
            texto: "Leva a outra parte da torre. Paredes de pedra úmida.",
            opcoes: [
                { texto: "Seguir túnel", secao: 268 },
                { texto: "Retornar", secao: 230 }
            ]
        },

        250: {
            texto: "Ferramentas adquiridas.",
            efeitos: [{ tipo: "item", item: "ferramentas" }],
            opcoes: [
                { texto: "Continuar", secao: 231 }
            ]
        },

        251: {
            texto: "Mesa redonda, seis cadeiras, candelabro central. Documentos espalhados.",
            opcoes: [
                { texto: "Ler documentos", secao: 269 },
                { texto: "Examinar candelabro", secao: 270 },
                { texto: "Porta lateral", secao: 271, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        252: {
            texto: "Frascos rotulados: 'Cura', 'Vigor', 'Sono'. Um está sem rótulo.",
            opcoes: [
                { texto: "Beber 'Cura'", secao: 272 },
                { texto: "Beber 'Vigor'", secao: 272 },
                { texto: "Beber sem rótulo", secao: 273, teste: "sorte", dificuldade: 12 }
            ]
        },

        253: {
            texto: "Colchões firmes, travesseiros macios. Nenhuma marca de uso.",
            opcoes: [
                { texto: "Sair", secao: 236 }
            ]
        },

        254: {
            texto: "Camas menores, baús pessoais, quadro-negro com anotações.",
            opcoes: [
                { texto: "Examinar baús", secao: 274 },
                { texto: "Ler quadro-negro", secao: 275 },
                { texto: "Porta ao fundo", secao: 276, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" }
            ]
        },

        255: {
            texto: "Dentro: diário do capitão, chave de bronze, medalha militar.",
            opcoes: [
                { texto: "Ler diário", secao: 277 },
                { texto: "Pegar chave", secao: 278 },
                { texto: "Pegar medalha", secao: 278 }
            ]
        },

        256: {
            texto: "Conhecimento profundo adquirido.",
            efeitos: [{ tipo: "habilidade", valor: 1 }],
            opcoes: [
                { texto: "Sair", secao: 225 }
            ]
        },

        257: {
            texto: "Você agora conhece a disposição externa da torre.",
            opcoes: [
                { texto: "Sair", secao: 225 }
            ]
        },

        258: {
            texto: "Compartimento secreto se abre. Dentro: chave pequena de prata.",
            efeitos: [{ tipo: "item", item: "chave-pequena" }],
            opcoes: [
                { texto: "Sair", secao: 226 }
            ]
        },

        259: {
            texto: "Inventário atualizado.",
            efeitos: [
                { tipo: "item", item: "envelope-senha" },
                { tipo: "item", item: "ouro" },
                { tipo: "item", item: "adaga" }
            ],
            opcoes: [
                { texto: "Sair", secao: 227 }
            ]
        },

        260: {
            texto: "Frescor imediato.",
            efeitos: [{ tipo: "energia", valor: 1 }],
            opcoes: [
                { texto: "Sair", secao: 246 }
            ]
        },

        261: {
            texto: "Recipiente cheio de água cristalina.",
            efeitos: [{ tipo: "item", item: "agua-3-doses" }],
            opcoes: [
                { texto: "Sair", secao: 246 }
            ]
        },

        262: {
            texto: "Sistema de tubulação impossível. Água flui sem bomba visível.",
            opcoes: [
                { texto: "Sair", secao: 246 }
            ]
        },

        263: {
            texto: "Fechaduras múltiplas. Precisa de combinação específica.",
            opcoes: [
                { texto: "Abrir", secao: 280, requer: "envelope-senha" },
                { texto: "Sair", secao: 247 }
            ]
        },

        264: {
            texto: "Transações impossíveis. 'Pagamento ao Guardião da hora - 2017ac'.",
            opcoes: [
                { texto: "Continuar lendo", secao: 281 },
                { texto: "Sair", secao: 247 }
            ]
        },

        265: {
            texto: "Padrões matemáticos complexos. Luz forma sombras que não correspondem.",
            opcoes: [
                { texto: "Tocar vitral", secao: 282 },
                { texto: "Continuar", secao: 248 }
            ]
        },

        266: {
            texto: "Estantes com livros encadeados, escrivaninha com tinta fresca, pergaminhos.",
            opcoes: [
                { texto: "Examinar livros", secao: 283 },
                { texto: "Ler pergaminho", secao: 284 },
                { texto: "Porta secreta", secao: 285, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portamadeira.mp3" }
            ]
        },

        267: {
            texto: "Corredor circular, portas idênticas, eco estranho dos passos.",
            opcoes: [
                { texto: "Porta A", secao: 286, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Porta B", secao: 287, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Porta C", secao: 288, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Continuar subindo", secao: 289 }
            ]
        },

        268: {
            texto: "Você emerge em uma sala diferente da torre.",
            opcoes: [
                { texto: "Explorar sala", secao: 290 },
                { texto: "Retornar pelo túnel", secao: 249 }
            ]
        },

        269: {
            texto: "'Protocolo de Evacuação aprovado. Todos os residentes devem partir antes do Evento.'",
            opcoes: [
                { texto: "Continuar lendo", secao: 291 },
                { texto: "Sair", secao: 251 }
            ]
        },

        270: {
            texto: "Velas acesas sem consumir cera. Chama fria ao toque.",
            opcoes: [
                { texto: "Sair", secao: 251 }
            ]
        },

        271: {
            texto: "Gaiola de ferro pendurada por correntes. Vazia. Porta aberta.",
            opcoes: [
                { texto: "Entrar na gaiola", secao: 292 },
                { texto: "Examinar correntes", secao: 293 },
                { texto: "Porta oposta", secao: 294, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" }
            ]
        },

        272: {
            texto: "Efeito da poção aplicado.",
            efeitos: [{ tipo: "energia", valor: 3 }],
            opcoes: [
                { texto: "Sair", secao: 236 }
            ]
        },

        273: {
            texto: "Sabor amargo. Dor intensa. Visão escurece. Você morre.",
            efeitos: [{ tipo: "energia", valor: -10 }],
            final: true
        },

        274: {
            texto: "Roupas pequenas, livros de estudo, brinquedos de madeira.",
            opcoes: [
                { texto: "Pegar livro", secao: 295 },
                { texto: "Sair", secao: 254 }
            ]
        },

        275: {
            texto: "Diagrama de constelações. Anotação: 'O céu mudou. Ninguém sabe por quê.'",
            opcoes: [
                { texto: "Memorizar", secao: 296 },
                { texto: "Sair", secao: 254 }
            ]
        },

        276: {
            texto: "Livros ilustrados, globo pequeno, brinquedos educativos.",
            opcoes: [
                { texto: "Examinar livros", secao: 297 },
                { texto: "Sair", secao: 254 }
            ]
        },

        277: {
            texto: "'Dia 1.247: Ainda nenhum sinal de mudança. A torre permanece. Nós permanecemos.'",
            opcoes: [
                { texto: "Continuar lendo", secao: 298 },
                { texto: "Sair", secao: 225 }
            ]
        },

        278: {
            texto: "Itens guardados no inventário.",
            efeitos: [
                { tipo: "item", item: "chave-bronze" },
                { tipo: "item", item: "medalha" }
            ],
            opcoes: [
                { texto: "Sair", secao: 225 }
            ]
        },

        279: {
            texto: "Chave pequena adquirida.",
            efeitos: [{ tipo: "item", item: "chave-pequena" }],
            opcoes: [
                { texto: "Sair", secao: 226 }
            ]
        },

        280: {
            texto: "Senha correta. Dentro: garrafa de vinho raro, documento selado, joia.",
            opcoes: [
                { texto: "Pegar vinho", secao: 299 },
                { texto: "Pegar documento", secao: 299 },
                { texto: "Pegar joia", secao: 299 }
            ]
        },

        281: {
            texto: "'O Tesoureiro desapareceu. Seus livros continuam se atualizando sozinhos.'",
            opcoes: [
                { texto: "Sair", secao: 247 }
            ]
        },

        282: {
            texto: "Calor pulsa sob seus dedos. Padrão geométrico brilha brevemente.",
            opcoes: [
                { texto: "Continuar", secao: 248 }
            ]
        },

        283: {
            texto: "Títulos em latim: 'De Natura Temporis', 'Codex Aeternum'. Correntes de prata.",
            opcoes: [
                { texto: "Tentar abrir", secao: 300, requer: "chave-especial" },
                { texto: "Sair", secao: 266 }
            ]
        },

        284: {
            texto: "'Aquele que alcançar o Pináculo verá a verdade. Mas a verdade não liberta.'",
            opcoes: [
                { texto: "Sair", secao: 266 }
            ]
        },

        285: {
            texto: "Atrás de estante móvel. Escada estreita desce.",
            opcoes: [
                { texto: "Descer", secao: 203 },
                { texto: "Sair", secao: 266 }
            ]
        },

        286: {
            texto: "Cama, mesa, cadeira. Nada mais. Janela mostra névoa.",
            opcoes: [
                { texto: "Descansar", secao: 267 },
                { texto: "Sair", secao: 267 }
            ]
        },

        287: {
            texto: "Exatamente igual ao anterior. Mesma disposição. Mesma névoa.",
            opcoes: [
                { texto: "Descansar", secao: 267 },
                { texto: "Sair", secao: 267 }
            ]
        },

        288: {
            texto: "Tudo invertido. Porta à direita em vez de esquerda. Sensação de vertigem.",
            opcoes: [
                { texto: "Examinar espelho", secao: 319 },
                { texto: "Sair", secao: 267 }
            ]
        },

        289: {
            texto: "Sala circular com janelas em todas as direções. Escada termina aqui.",
            opcoes: [
                { texto: "Examinar janelas", secao: 304 },
                { texto: "Porta para terraço", secao: 303, som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/porta1.mp3" },
                { texto: "Descer", secao: 267 }
            ]
        },

        290: {
            texto: "Engrenagens gigantes, alavancas, painéis de controle. Tudo em movimento.",
            opcoes: [
                { texto: "Examinar engrenagens", secao: 317 },
                { texto: "Puxar alavanca", secao: 318 },
                { texto: "Sair", secao: 268 }
            ]
        },

        291: {
            texto: "'Todos devem partir. A torre será selada. O Guardião permanecerá.'",
            opcoes: [
                { texto: "Sair", secao: 251 }
            ]
        },

        292: {
            texto: "Porta se fecha sozinha. Correntes começam a subir.",
            opcoes: [
                { texto: "Tentar escapar", secao: 271, teste: "habilidade", dificuldade: 16 }
            ]
        },

        293: {
            texto: "Ferro negro. Mecanismo de roldana complexo. Ainda funcional.",
            opcoes: [
                { texto: "Sair", secao: 271 }
            ]
        },

        294: {
            texto: "Alavancas controlam a gaiola. Painel com instruções em latim. Há um corredor estreito que termina em uma porta de ferro.",
            opcoes: [
                { texto: "Abrir a porta", secao: 308, requer: "chave-ferro-azul", som: "https://raw.githubusercontent.com/jonasdemencia/CentelhaGame/main/sons/portametal.mp3" },
                { texto: "Acionar alavanca", secao: 316 },
                { texto: "Sair", secao: 271 }
            ]
        },

        295: {
            texto: "Livro básico coletado.",
            efeitos: [{ tipo: "item", item: "livro-basico" }],
            opcoes: [
                { texto: "Sair", secao: 254 }
            ]
        },

        296: {
            texto: "Você reconhece alguns padrões. Podem ser úteis.",
            opcoes: [
                { texto: "Sair", secao: 254 }
            ]
        },

        297: {
            texto: "Histórias sobre a torre. 'A Torre que Toca o Tempo'. 'O Guardião Eterno'.",
            opcoes: [
                { texto: "Ler completamente", secao: 314 },
                { texto: "Sair", secao: 254 }
            ]
        },

        298: {
            texto: "'Dia 2.000: parei de contar. O tempo não significa nada aqui'.",
            opcoes: [
                { texto: "Sair", secao: 225 }
            ]
        },
        299: {
            texto: "Tesouro coletado.",
            efeitos: [
                { tipo: "item", item: "vinho-raro" },
                { tipo: "item", item: "documento-selado" },
                { tipo: "item", item: "joia" }
            ],
            opcoes: [
                { texto: "Sair", secao: 247 }
            ]
        },

        300: {
            texto: "As correntes não cedem. Precisa de chave especial ou ferramenta específica.",
            opcoes: [
                { texto: "Usar ferramentas", secao: 315, requer: "ferramentas" },
                { texto: "Sair", secao: 266 }
            ]
        },

        303: {
            texto: "Pedra fria sob os pés. O vento sopra sem som. No centro, um cofre de ferro incrustado no chão.",
            opcoes: [
                { texto: "Observar o horizonte", secao: 304 },
                { texto: "Examinar o cofre", secao: 305 },
                { texto: "Retornar ao pináculo", secao: 289 }
            ]
        },

        304: {
            texto: "Não há sol, nem estrelas. Apenas um céu uniforme, imóvel.",
            opcoes: [
                { texto: "Retornar", secao: 303 },
                { texto: "Concluir aventura", secao: 313 }
            ]
        },

        305: {
            texto: "Fechadura com combinação numérica.",
            opcoes: [
                { texto: "Usar senha", secao: 306, requer: "envelope-senha" },
                { texto: "Retornar", secao: 303 }
            ]
        },

        306: {
            texto: "O mecanismo cede. Dentro, uma chave pesada de ferro azulado e um bilhete dobrado.",
            efeitos: [{ tipo: "item", item: "chave-ferro-azul" }],
            opcoes: [
                { texto: "Ler o bilhete", secao: 307 },
                { texto: "Guardar tudo e sair", secao: 303 }
            ]
        },

        307: {
            texto: "A caligrafia é irregular, como se tivesse sido escrita às pressas: 'No fundo da torre, atrás da porta acorrentada, está um Anjo. Não fale com ele. Não o olhe por muito tempo. Se precisar, toque-o — é a única forma de atravessar. Mas lembre-se: o toque não o liberta'.",
            opcoes: [
                { texto: "Guardar tudo e sair", secao: 303 }
            ]
        },

        308: {
            texto: "No centro da sala, uma mulher nua e bela o encara. Da cintura para baixo, as pernas são de cachorro — finas, tortas, incapazes de sustentar o corpo. Ela respira devagar, como se cada movimento fosse um erro da própria carne.",
            opcoes: [
                { texto: "Tentar falar com ela", secao: 309 },
                { texto: "Tocar o corpo", secao: 310 },
                { texto: "Observar em silêncio", secao: 311 }
            ]
        },

        309: {
            texto: "Você fala. A boca dela se abre, mas a resposta vem de algum modo atrasado, como se a voz tivesse ficado presa em outro tempo ou lugar. As palavras são o eco exato do que você disse, repetidas em tom mais baixo.",
            opcoes: [
                { texto: "Tocar o corpo", secao: 310 },
                { texto: "Observar em silêncio", secao: 311 }
            ]
        },

        310: {
            texto: "Você estende a mão e toca sua pele. Esperava frio, mas encontra calor. O corpo dela pulsa suave, como se embalasse você. Por um instante, sente-se protegido, como se estivesse nos braços de uma mãe.",
            opcoes: [
                { texto: "Despedir-se", secao: 312 },
                { texto: "Retornar", secao: 294 }
            ]
        },

        311: {
            texto: "Você permanece em silêncio. Ela não se move, você sente que está sendo contado de alguma forma.",
            opcoes: [
                { texto: "Retornar", secao: 294 }
            ]
        },

        312: {
            texto: "Você aproxima o rosto do dela. Ao sussurrar 'adeus', sua mão afunda no torax macio da mulher como se fosse barro quente. O corpo treme, mas não resiste. O calor maternal se desfaz em silêncio. O ar da sala pesa. Você sente que matou algo que não deveria existir — ou que sempre esteve esperando por isso.",
            final: true
        },

        313: {
            texto: "Você permanece. O silêncio não pesa mais. O céu imóvel parece acolher sua presença. Por um instante, sente que algo próximo, no interior do aposento, compartilha a mesma imobilidade. A paz é estranha, mas suficiente. Você olha para trás.",
            final: true
        },

        314: {
            texto: "'caiu do céu e se machucou. Ficou descansando no fundo da Torre. À noite, três reis desciam para vê-la. Um trazia ouro, outro silêncio, outro não trazia nada. As crianças perguntavam: — Por que ela não volta para o alto? E os Fundadores respondiam: — Porque a Torre precisa de quem nunca parta.'",
            opcoes: [
                { texto: "Sair", secao: 254 }
            ]
        },

        315: {
            texto: "Usando as ferramentas, você consegue romper as correntes.",
            efeitos: [{ tipo: "item", item: "livro-raro" }],
            opcoes: [
                { texto: "Sair", secao: 266 }
            ]
        },

        316: {
            texto: "Você aciona a alavanca. Um som metálico percorre a Torre inteira, como um grito de ferro. Algo — ou alguém — sabe que você está aqui.",
            opcoes: [
                { texto: "Retornar", secao: 294 }
            ]
        },

        317: {
            texto: "Entre os dentes metálicos em movimento, algo brilha.",
            opcoes: [
                { texto: "Retornar", secao: 290 }
            ]
        },

        318: {
            texto: "Você puxa a alavanca. As engrenagens param de repente. O chão treme, e por um instante parece que a Torre inteira se moveu. O silêncio que se segue é mais pesado que o ruído.",
            efeitos: [{ tipo: "item", item: "amuleto-desconhecido" }],
            opcoes: [
                { texto: "Retornar", secao: 290 }
            ]
        },

        319: {
            texto: "O espelho não devolve seus gestos. Em vez disso, você se vê deitado em um corredor da Torre, imóvel, como se dormisse.",
            opcoes: [
                { texto: "Sair", secao: 267 }
            ]
        },

            320: {
        texto: "Você foi derrotado em combate. Suas forças se esgotam e você cai no chão frio da arena. A escuridão toma conta de sua visão. Sua jornada termina aqui.",
        efeitos: [{ tipo: "energia", valor: -10 }],
        final: true
      },

      // === INÍCIO DA ADIÇÃO ===
      // Seção buffer estática para retorno de batalha emergente
      99999: {
        texto: "Por um momento, pareceu um sonho, mas você derrotou o que havia de ser derrotado e agora está em segurança.",
        opcoes: [
          // Esta opção será gerada dinamicamente pelo narrativas.js
        ]
      }
      // === FIM DA ADIÇÃO ===
}
},
// Fim de "condominio-tempo-perdido"


   
"vila-abandonada": {
    id: "vila-abandonada",
    titulo: "A Vila Abandonada",
    secoes: {
        1: {
            texto: "A névoa matinal se dissipa lentamente enquanto você se aproxima dos restos da Vila de Pedravale. Casas de madeira apodrecida se erguem como dentes quebrados contra o céu cinzento, suas janelas vazias observando como olhos mortos. O silêncio é opressivo - nem mesmo o canto de pássaros quebra a quietude mortal. Suas botas fazem o único som, estalando sobre folhas secas e galhos quebrados. À sua frente, três caminhos se abrem: a rua principal que corta o centro da vila, um atalho pela lateral que contorna as casas maiores, e uma trilha que leva diretamente ao cemitério no alto da colina.",
            opcoes: [
                { texto: "Seguir pela rua principal da vila", secao: 2 },
                { texto: "Tomar o atalho lateral pelas casas menores", secao: 5 },
                { texto: "Ir diretamente ao cemitério na colina", secao: 8 }
            ]
        },

        2: {
            texto: "Seguindo pela rua principal, seus passos ecoam entre as fachadas deterioradas. As casas se inclinam umas contra as outras como bêbados procurando apoio, suas madeiras escurecidas pelo tempo e pela umidade. Você nota que algumas portas estão entreabertas, balançando suavemente com a brisa que sopra entre os edifícios. O cheiro de mofo e decomposição é forte aqui. De repente, um ruído seco vem de uma das casas à sua direita - como se algo pesado tivesse caído no chão. Sua mão instintivamente se move para a arma em seu cinto.",
            opcoes: [
                { texto: "Investigar o ruído na casa à direita", secao: 3 },
                { texto: "Ignorar o som e continuar pela rua", secao: 4 },
                { texto: "Parar e escutar atentamente por mais ruídos", secao: 6 }
            ]
        },

        3: {
            texto: "Investigando o ruído, você empurra cuidadosamente a porta da casa. Ela range nos gonzos enferrujados, abrindo para revelar um interior mergulhado em sombras. O cheiro de podridão é quase insuportável aqui. Seus olhos se ajustam à escuridão e você vê móveis cobertos por teias de aranha e uma espessa camada de poeira. No chão, uma pilha de tábuas podres que deve ter caído do teto explica o ruído. Mas algo mais chama sua atenção - pegadas recentes na poeira, definitivamente humanas, levando em direção aos fundos da casa.",
            opcoes: [
                { texto: "Seguir as pegadas até os fundos da casa", secao: 9 },
                { texto: "Procurar por suprimentos na casa", secao: 10 },
                { texto: "Sair imediatamente da casa", secao: 4 }
            ]
        },

        4: {
            texto: "Você chega a rua principal. A vila parece ter sido abandonada há décadas, mas há sinais perturbadores de atividade recente - uma fogueira ainda fumegante em um dos pátios, roupas penduradas em um varal que balançam no vento. Você chega a uma praça central onde uma fonte seca se ergue, coberta de musgo e rachada. Ao redor da praça, quatro edifícios se destacam: uma igreja com sua torre desabada, uma taverna com a placa balançando, uma loja geral com as janelas tapadas, e o que parece ter sido a casa do prefeito.",
            opcoes: [
                { texto: "Explorar a igreja em ruínas", secao: 11 },
                { texto: "Investigar a taverna abandonada", secao: 14 },
                { texto: "Examinar a loja geral", secao: 17 }
            ]
        },

        5: {
            texto: "Tomando o atalho lateral, você caminha entre casas menores e mais modestas. Estas construções parecem ter resistido melhor ao tempo, suas estruturas de pedra ainda sólidas apesar do abandono. Você nota jardins selvagens onde vegetais ainda crescem sem cuidado, e poços que ainda contêm água limpa. É aqui que você ouve pela primeira vez - um gemido baixo e prolongado vindo de algum lugar próximo. O som é definitivamente humano, mas há algo errado nele, algo que faz sua pele se arrepiar.",
            opcoes: [
                { texto: "Seguir o som do gemido", secao: 12 },
                { texto: "Procurar água e suprimentos nos jardins", secao: 13 },
                { texto: "Evitar o som e contornar a área", secao: 4 }
            ]
        },

        6: {
            texto: "Parando para escutar atentamente, você fecha os olhos e aguça os ouvidos. O silêncio da vila é quebrado por sons sutis que você não havia notado antes: o ranger de madeira velha, o sussurro do vento através de janelas quebradas, e algo mais - passos lentos e arrastados vindo de algum lugar não muito distante. Os passos param quando você para, como se quem quer que seja também estivesse escutando. Um calafrio percorre sua espinha.",
            opcoes: [
                { texto: "Chamar em voz alta para identificar a presença", secao: 7 },
                { texto: "Mover-se silenciosamente em direção aos passos", secao: 15, teste: "habilidade", dificuldade: 12 },
                { texto: "Recuar lentamente para a entrada da vila", secao: 1 }
            ]
        },

        7: {
            texto: "Chamando em voz alta 'Há alguém aí?', sua voz ecoa entre os edifícios vazios. Por um momento, apenas o eco responde. Então, de várias direções ao mesmo tempo, você ouve respostas - gemidos baixos e guturais que definitivamente não são humanos normais. Sombras começam a se mover nas janelas das casas ao redor, e você percebe que cometeu um erro terrível. Você não está sozinho na vila, e o que quer que habite aqui agora sabe exatamente onde você está.",
            opcoes: [
                { texto: "Correr imediatamente para a praça central", secao: 4 },
                { texto: "Procurar abrigo na casa mais próxima", secao: 3 },
                { texto: "Ficar parado e preparar-se para o confronto", secao: 16 }
            ]
        },

        8: {
            texto: "Subindo diretamente ao cemitério na colina, você deixa a vila para trás e segue uma trilha íngreme entre árvores mortas. O cemitério de Pedravale se estende diante de você como um mar de lápides inclinadas e mausoléus desmoronados. Muitas sepulturas foram profanadas, com terra espalhada e caixões expostos. No centro do cemitério, um mausoléu maior que os outros permanece intacto, suas portas de ferro forjado ainda fechadas. Corvos observam de poleiros em cruzes quebradas, seus olhos negros seguindo cada um de seus movimentos.",
            opcoes: [
                { texto: "Examinar as sepulturas profanadas", secao: 18 },
                { texto: "Ir diretamente ao mausoléu central", secao: 21 },
                { texto: "Procurar por pistas entre as lápides", secao: 24 }
            ]
        },

        9: {
            texto: "Seguindo as pegadas até os fundos da casa, você encontra uma porta que leva a um pequeno porão. As pegadas descem os degraus de madeira apodrecida. O ar aqui embaixo é ainda mais viciado, carregado com o cheiro doce e enjoativo da carne em decomposição. Você ouve um ruído de mastigação vindo da escuridão à frente. Sua mão treme ligeiramente enquanto você considera suas opções.",
            opcoes: [
                { texto: "Descer ao porão para investigar", secao: 19 },
                { texto: "Chamar para baixo para anunciar sua presença", secao: 20 },
                { texto: "Sair silenciosamente da casa", secao: 4 }
            ]
        },

        10: {
            texto: "Procurando por suprimentos na casa, você vasculha cuidadosamente os cômodos. Na cozinha, encontra algumas latas de conserva ainda seladas, embora enferrujadas. Em um armário, descobre uma vela meio derretida e alguns fósforos em uma lata impermeável. Os suprimentos não são muito, mas podem ser úteis.",
            efeitos: [{ tipo: "item", item: "lata-sardinha" }],
            opcoes: [
                { texto: "Continuar procurando por mais suprimentos", secao: 22 },
                { texto: "Sair da casa e seguir pela rua", secao: 4 }
            ]
        },

        11: {
            texto: "Explorando a igreja em ruínas, você empurra as pesadas portas de madeira. Elas se abrem com um gemido prolongado, revelando um interior devastado. Bancos quebrados estão espalhados pelo chão, e o altar foi profanado com símbolos estranhos gravados na pedra. Vitrais coloridos jazem em cacos pelo chão, criando um mosaico macabro de cores. Mas o que mais chama sua atenção é o buraco no chão onde deveria estar o púlpito - uma abertura escura que desce para as profundezas.",
            opcoes: [
                { texto: "Descer pelo buraco no chão", secao: 25 },
                { texto: "Examinar os símbolos no altar", secao: 26 },
                { texto: "Procurar por itens úteis entre os destroços", secao: 27 }
            ]
        },

        12: {
            texto: "Seguindo o som do gemido, você se aproxima de uma pequena casa de pedra com a porta entreaberta. O gemido vem definitivamente de dentro, um som de dor e desespero que faz seu coração acelerar. Através da fresta da porta, você vê movimento - uma figura humana curvada sobre algo no chão. A figura está de costas para você, balançando lentamente para frente e para trás.",
            opcoes: [
                { texto: "Entrar na casa para ajudar", secao: 28 },
                { texto: "Bater na porta antes de entrar", secao: 29 },
                { texto: "Observar mais um pouco antes de agir", secao: 30 }
            ]
        },

        13: {
            texto: "Procurando água e suprimentos nos jardins abandonados, você encontra um poço com água ainda limpa e alguns vegetais que cresceram selvagens. Entre as plantas, você descobre uma pequena horta onde ainda crescem batatas e cenouras. É uma descoberta valiosa em um lugar tão desolado.",
            efeitos: [{ tipo: "energia", valor: 2 }],
            opcoes: [
                { texto: "Coletar mais vegetais para a jornada", secao: 31 },
                { texto: "Beber água e descansar um pouco", secao: 32 },
                { texto: "Continuar explorando a vila", secao: 4 }
            ]
        },

        14: {
            texto: "Investigando a taverna abandonada, você empurra as portas duplas que rangem nos gonzos. O interior está mergulhado em penumbra, mas você pode distinguir mesas e cadeiras viradas, garrafas quebradas espalhadas pelo chão, e um balcão coberto de poeira. Atrás do balcão, prateleiras vazias se estendem até o teto. Há um cheiro residual de álcool e algo mais - algo orgânico e desagradável.",
            opcoes: [
                { texto: "Procurar por bebidas ou comida", secao: 33 },
                { texto: "Examinar o andar superior da taverna", secao: 34 },
                { texto: "Investigar o porão da taverna", secao: 35 }
            ]
        },

        15: {
            texto: "Movendo-se silenciosamente em direção aos passos, você consegue se aproximar sem ser detectado. Espiando ao redor de uma esquina, você vê uma figura humana cambaleando pela rua. Mas há algo terrivelmente errado com ela - seus movimentos são desajeitados e não naturais, e você pode ver que partes de sua carne estão apodrecendo. É um morto-vivo, um zumbi. E ele não está sozinho - você pode ver mais figuras similares emergindo de casas próximas.",
            opcoes: [
                { texto: "Atacar o zumbi mais próximo", batalha: "zumbi", vitoria: 36, derrota: 37 },
                { texto: "Tentar contornar os zumbis silenciosamente", secao: 38, teste: "habilidade", dificuldade: 14 },
                { texto: "Recuar lentamente", secao: 1 }
            ]
        },

        16: {
            texto: "Ficando parado e preparando-se para o confronto, você saca sua arma e aguarda. Não demora muito para que as primeiras figuras apareçam - zumbis em vários estágios de decomposição, cambaleando em sua direção com fome nos olhos mortos. Você conta pelo menos três deles se aproximando de direções diferentes.",
            batalha: "zumbi,zumbi,zumbi",
            vitoria: 39,
            derrota: 37
        },

        17: {
            texto: "Examinando a loja geral, você encontra as janelas tapadas com tábuas, mas a porta está destrancada. Dentro, prateleiras vazias se estendem em fileiras ordenadas, mas o chão está coberto de produtos espalhados e estragados. No fundo da loja, você nota uma seção que parece ter sido barricada recentemente.",
            opcoes: [
                { texto: "Investigar a área barricada", secao: 40 },
                { texto: "Procurar por suprimentos úteis", secao: 41 },
                { texto: "Examinar os registros da loja", secao: 42 }
            ]
        },

        18: {
            texto: "Examinando as sepulturas profanadas, você vê que foram abertas de dentro para fora - a terra foi empurrada para cima, não escavada de cima para baixo. Isso significa que os mortos se levantaram por conta própria. Entre os caixões quebrados, você encontra alguns objetos pessoais que podem ser úteis.",
            efeitos: [{ tipo: "item", item: "corda" }],
            opcoes: [
                { texto: "Continuar examinando mais sepulturas", secao: 43 },
                { texto: "Ir ao mausoléu central", secao: 21 },
                { texto: "Descer de volta à vila", secao: 4 }
            ]
        },

        19: {
            texto: "Descendo ao porão para investigar, você encontra uma cena horrível. Uma figura humana - ou o que um dia foi humana - está devorando os restos de um animal. Quando ela percebe sua presença, vira-se lentamente, revelando um rosto em decomposição e olhos vazios. É um zumbi, e ele está entre você e a única saída.",
            batalha: "zumbi",
            vitoria: 44,
            derrota: 37
        },

        20: {
            texto: "Chamando para baixo para anunciar sua presença, você grita 'Olá, há alguém aí embaixo?'. A mastigação para imediatamente, seguida por um silêncio tenso. Então você ouve passos lentos e arrastados subindo as escadas. Uma figura emerge da escuridão - um zumbi com roupas esfarrapadas e carne apodrecendo.",
            batalha: "zumbi",
            vitoria: 44,
            derrota: 37
        },

        21: {
            texto: "Indo diretamente ao mausoléu central, você se aproxima da imponente estrutura de pedra. As portas de ferro forjado estão fechadas, mas não trancadas. Símbolos estranhos estão gravados na pedra, e você sente uma energia sinistra emanando do interior. Este lugar claramente tem importância especial.",
            opcoes: [
                { texto: "Abrir as portas e entrar no mausoléu", secao: 45 },
                { texto: "Examinar os símbolos antes de entrar", secao: 46 },
                { texto: "Procurar outra entrada", secao: 47 }
            ]
        },

        22: {
            texto: "Continuando a procurar por mais suprimentos, você encontra no sótão da casa uma pequena reserva escondida. Há mais algumas latas de comida e, surpreendentemente, munição para armas de fogo.",
            efeitos: [{ tipo: "item", item: "municao-38" }],
            opcoes: [
                { texto: "Descer e sair da casa", secao: 4 },
                { texto: "Procurar por armas também", secao: 48 }
            ]
        },

        23: {
            texto: "Procurando por armas, você encontra uma velha espingarda de caça em um armário trancado. Ela está em condições razoáveis e pode ser útil.",
            opcoes: [
                { texto: "Pegar a espingarda e sair", secao: 4 },
                { texto: "Procurar por mais munição", secao: 49 }
            ]
        },

        24: {
            texto: "Procurando por pistas entre as lápides, você encontra inscrições que contam a história da vila. Aparentemente, uma praga misteriosa atingiu Pedravale há cerca de vinte anos, matando quase todos os habitantes. As datas nas lápides confirmam que a maioria morreu em um período muito curto.",
            opcoes: [
                { texto: "Investigar mais sobre a praga", secao: 50 },
                { texto: "Ir ao mausoléu para mais respostas", secao: 21 },
                { texto: "Descer à vila", secao: 4 }
            ]
        },

        25: {
            texto: "Descendo pelo buraco no chão da igreja, você encontra uma cripta antiga. O ar aqui é frio e úmido, e você pode ouvir gotejamento de água em algum lugar na escuridão. Tochas apagadas estão presas às paredes, e você vê sarcófagos de pedra alinhados em fileiras.",
            opcoes: [
                { texto: "Acender uma das tochas", secao: 51, requer: "tocha" },
                { texto: "Examinar os sarcófagos no escuro", secao: 52 },
                { texto: "Procurar por uma saída alternativa", secao: 53 }
            ]
        },

        26: {
            texto: "Examinando os símbolos no altar, você reconhece alguns como sendo de necromancia - magia relacionada aos mortos. Os símbolos parecem formar um ritual complexo, possivelmente para ressuscitar os mortos. Isso explicaria o que aconteceu com os habitantes da vila.",
            opcoes: [
                { texto: "Tentar decifrar mais do ritual", secao: 54, teste: "magia", dificuldade: 15 },
                { texto: "Procurar por itens na igreja", secao: 27 },
                { texto: "Sair da igreja imediatamente", secao: 4 }
            ]
        },

        27: {
            texto: "Procurando por itens úteis entre os destroços da igreja, você encontra alguns objetos religiosos que podem oferecer proteção contra mortos-vivos, incluindo um pequeno crucifixo de prata.",
            efeitos: [{ tipo: "item", item: "punhal-ceremonial" }],
            opcoes: [
                { texto: "Continuar explorando a igreja", secao: 25 },
                { texto: "Sair e ir para outro local", secao: 4 }
            ]
        },

        28: {
            texto: "Entrando na casa para ajudar, você empurra a porta e chama 'Precisa de ajuda?'. A figura se vira lentamente, e você vê com horror que metade de seu rosto foi arrancada, revelando osso e músculos expostos. Não é uma pessoa ferida - é um zumbi se alimentando de um cadáver.",
            batalha: "zumbi",
            vitoria: 55,
            derrota: 37
        },

        29: {
            texto: "Batendo na porta antes de entrar, você anuncia sua presença. O gemido para, e você ouve movimento dentro da casa. A porta se abre lentamente, revelando uma figura humana em estado avançado de decomposição.",
            batalha: "zumbi",
            vitoria: 55,
            derrota: 37
        },

        30: {
            texto: "Observando mais um pouco antes de agir, você percebe que a figura está se alimentando de algo - ou alguém. Seus movimentos são mecânicos e não naturais. Definitivamente não é uma pessoa normal ferida, mas sim um morto-vivo.",
            opcoes: [
                { texto: "Atacar o zumbi de surpresa", batalha: "zumbi", vitoria: 55, derrota: 37 },
                { texto: "Tentar passar despercebido", secao: 56, teste: "habilidade", dificuldade: 13 },
                { texto: "Recuar silenciosamente", secao: 4 }
            ]
        },

        31: {
            texto: "Coletando mais vegetais para a jornada, você enche seus bolsos com batatas e cenouras. Será uma reserva valiosa de comida para os dias à frente.",
            efeitos: [{ tipo: "item", item: "lata-sardinha" }],
            opcoes: [
                { texto: "Continuar explorando a vila", secao: 4 }
            ]
        },

        32: {
            texto: "Bebendo água fresca do poço e descansando um pouco, você se sente revigorado. O breve descanso restaura suas energias.",
            efeitos: [{ tipo: "energia", valor: 3 }],
            opcoes: [
                { texto: "Continuar explorando", secao: 4 }
            ]
        },

        33: {
            texto: "Procurando por bebidas ou comida na taverna, você encontra algumas garrafas intactas de bebida alcoólica e alguns pedaços de pão duro que ainda estão comestíveis.",
            efeitos: [{ tipo: "item", item: "lata-sardinha" }],
            opcoes: [
                { texto: "Explorar o andar superior", secao: 34 },
                { texto: "Investigar o porão", secao: 35 }
            ]
        },

        34: {
            texto: "Examinando o andar superior da taverna, você encontra quartos de hóspedes abandonados. Em um deles, há sinais de luta - móveis virados e manchas escuras no chão. Em uma cômoda, você encontra algumas moedas e um mapa local.",
            opcoes: [
                { texto: "Examinar o mapa mais detalhadamente", secao: 57 },
                { texto: "Investigar os sinais de luta", secao: 58 },
                { texto: "Descer e sair da taverna", secao: 4 }
            ]
        },

        35: {
    texto: "Investigando o porão da taverna, você desce por escadas de madeira que gemem sob seu peso. O ar aqui embaixo é denso e viciado, carregado com o cheiro de cerveja azeda e algo muito pior - o odor doce e enjoativo da carne em decomposição. Barris de carvalho se alinham contra as paredes de pedra úmida, alguns rachados e vazando seu conteúdo no chão enlameado. É então que você ouve - um arrastar lento e deliberado vindo de trás dos barris maiores, acompanhado por um gemido baixo que faz sua pele se arrepiar. Algo definitivamente se move nas sombras mais profundas do porão.",
    opcoes: [
        { texto: "Investigar cautelosamente os sons", secao: 59 },
        { texto: "Subir imediatamente as escadas", secao: 34 },
        { texto: "Preparar sua arma e aguardar", secao: 60 }
    ]
},

36: {
    texto: "Após atacar o zumbi mais próximo, sua lâmina corta através da carne apodrecida com um som nauseante. A criatura desaba, mas o barulho da luta ecoa pelas ruas vazias como um sino de alarme. Quase imediatamente, você ouve respostas - gemidos guturais vindos de várias direções, o som de portas rangendo ao se abrirem, e passos arrastados se aproximando. Você despertou a atenção de outros mortos-vivos que habitam as casas ao redor. Sombras começam a se mover nas janelas quebradas, e você percebe que precisa se mover rapidamente.",
    opcoes: [
        { texto: "Correr para a praça central", secao: 4 },
        { texto: "Procurar abrigo na casa mais próxima", secao: 3 },
        { texto: "Ficar e lutar contra os que se aproximam", secao: 16 }
    ]
},

37: {
    texto: "Os zumbis o cercam como uma maré de carne podre e ossos expostos. Suas garras sujas rasgam sua roupa e depois sua pele, enquanto dentes amarelados e quebrados buscam sua garganta. Você luta desesperadamente, mas são muitos, e sua força se esvai rapidamente junto com seu sangue. Suas últimas visões são de olhos mortos e vazios observando enquanto você se torna mais uma vítima da maldição que assola a Vila de Pedravale. Sua jornada termina aqui, entre os destroços de uma civilização perdida.",
    efeitos: [{ tipo: "energia", valor: -10 }],
    final: true
},

38: {
    texto: "Tentando contornar os zumbis silenciosamente, você se move como uma sombra entre as ruínas. Seus passos são cuidadosamente calculados, evitando galhos secos e detritos que poderiam fazer ruído. Os mortos-vivos continuam sua patrulha sem propósito, cambaleando pelas ruas com movimentos mecânicos e previsíveis. Você consegue passar despercebido, usando as sombras das casas em ruínas como cobertura. Após alguns minutos tensos, você emerge na praça central sem ter sido detectado, seu coração ainda batendo acelerado pela tensão.",
    opcoes: [
        { texto: "Explorar a praça central com cuidado", secao: 4 }
    ]
},

39: {
    texto: "Após uma batalha brutal contra os três zumbis, você permanece de pé entre os corpos em decomposição que finalmente encontraram o descanso eterno. Suas roupas estão rasgadas e manchadas de sangue - tanto seu quanto das criaturas - e você respira pesadamente, exausto pelo combate. Cada golpe foi uma luta contra a náusea causada pelo cheiro e pela visão da carne apodrecida, mas sua determinação prevaleceu. O silêncio retorna às ruas, pelo menos temporariamente. Você sabe que pode haver mais zumbis na vila, mas pelo menos esta área está segura por enquanto.",
    efeitos: [{ tipo: "energia", valor: -2 }],
    opcoes: [
        { texto: "Ir para a praça central", secao: 4 },
        { texto: "Procurar suprimentos nas casas próximas", secao: 10 },
        { texto: "Descansar um momento para recuperar o fôlego", secao: 71 }
    ]
},

40: {
    texto: "Investigando a área barricada da loja, você encontra evidências de que alguém tentou desesperadamente se esconder aqui durante os primeiros dias da praga. Tábuas foram pregadas de forma apressada, criando um pequeno refúgio nos fundos da loja. Dentro deste espaço claustrofóbico, você encontra os restos de uma existência precária: cobertores sujos empilhados em um canto, latas de comida vazias espalhadas pelo chão, e uma pequena reserva de suprimentos médicos cuidadosamente organizados em uma caixa de madeira. Há também um diário com páginas rasgadas, suas últimas entradas falando de desespero crescente e sons terríveis vindos de fora.",
    efeitos: [{ tipo: "item", item: "pocao-cura-menor" }],
    opcoes: [
        { texto: "Ler o diário mais detalhadamente", secao: 85 },
        { texto: "Procurar por mais suprimentos escondidos", secao: 41 },
        { texto: "Examinar os registros da loja", secao: 42 }
    ]
},

41: {
    texto: "Procurando por suprimentos úteis na loja, você vasculha sistematicamente as prateleiras vazias e os cantos escuros. Atrás do balcão principal, você encontra um compartimento secreto que o antigo proprietário usava para guardar itens valiosos. Dentro há algumas ferramentas básicas - um martelo, pregos, e uma corda resistente - além de mais algumas latas de conserva que foram cuidadosamente escondidas quando a situação começou a se deteriorar. As latas estão enferrujadas mas ainda seladas, uma descoberta valiosa em um lugar tão desolado.",
    efeitos: [{ tipo: "item", item: "lata-sardinha" }],
    opcoes: [
        { texto: "Continuar explorando a vila", secao: 4 },
        { texto: "Examinar os registros da loja", secao: 42 }
    ]
},

42: {
    texto: "Examinando os registros da loja, você encontra um diário encadernado em couro que pertencia ao proprietário. As páginas amareladas contam uma história progressivamente mais sombria: as primeiras entradas falam de pessoas ficando doentes com uma febre estranha, depois de comportamentos erráticos e violentos. As entradas finais, escritas com caligrafia trêmula, descrevem pessoas mortas se levantando e atacando os vivos. O proprietário menciona repetidamente que tudo começou depois que 'aquela maldita coisa foi desenterrada no cemitério da colina'. A última entrada, quase ilegível, simplesmente diz: 'Eles estão batendo na porta. Que Deus nos ajude.'",
    opcoes: [
        { texto: "Ir investigar o cemitério imediatamente", secao: 8 },
        { texto: "Continuar explorando a vila primeiro", secao: 4 },
{ texto: "Procurar por mais informações na loja", secao: 76 }
    ]
},

43: {
    texto: "Continuando a examinar mais sepulturas, você caminha entre as lápides inclinadas e os mausoléus desmoronados. A evidência é consistente e perturbadora: sepultura após sepultura foi aberta de dentro para fora, com terra e pedras espalhadas como se os mortos tivessem literalmente escavado seu caminho para a superfície. Entre os destroços de um caixão particularmente ornamentado, você encontra algo inesperado - uma granada militar antiga, provavelmente da última guerra, ainda em condições de uso. Alguém deve ter sido enterrado com ela, talvez um veterano. O metal está corroído, mas o mecanismo parece funcional.",
    efeitos: [{ tipo: "item", item: "granada-mao" }],
    opcoes: [
        { texto: "Ir ao mausoléu central", secao: 21 },
        { texto: "Descer de volta à vila", secao: 4 },
        { texto: "Examinar mais sepulturas em busca de pistas", secao: 74 }
    ]
},

44: {
    texto: "Após derrotar o zumbi no porão, você permanece parado por um momento, tentando controlar sua respiração e o enjoo causado pelo combate. O corpo da criatura jaz imóvel no chão enlameado, finalmente em paz. Agora você pode explorar o porão com segurança. Entre os restos espalhados pelo chão - ossos roídos e trapos de roupa - você encontra algumas moedas antigas e uma chave de ferro ornamentada que deve ter pertencido ao zumbi quando ainda era humano. A chave é pesada e bem trabalhada, sugerindo que abria algo importante.",
    opcoes: [
        { texto: "Subir e sair da casa", secao: 4 },
        { texto: "Procurar por mais itens no porão", secao: 61 },
        { texto: "Examinar a chave mais detalhadamente", secao: 75 }
    ]
},

45: {
    texto: "Abrindo as pesadas portas de ferro forjado, você entra no mausoléu central. O interior é surpreendentemente bem preservado, com paredes de mármore polido e um teto abobadado decorado com relevos elaborados. No centro da câmara, um sarcófago de pedra negra repousa sobre uma plataforma elevada, cercado por velas há muito apagadas. Mas o que mais chama sua atenção é o objeto que repousa sobre a tampa do sarcófago - uma coroa de ferro simples, sem ornamentos ou gemas, mas que irradia uma aura de autoridade antiga. Não há magia nela, apenas o peso simbólico do poder que um dia governou esta vila condenada.",
    efeitos: [{ tipo: "item", item: "coroa-ferro" }],
    opcoes: [
        { texto: "Examinar o sarcófago cuidadosamente", secao: 62 },
        { texto: "Pegar a coroa e sair imediatamente", secao: 63 },
        { texto: "Procurar por outras pistas na câmara", secao: 64 }
    ]
},

46: {
    texto: "Examinando os símbolos gravados na pedra antes de entrar, você reconhece uma mistura de avisos e proteções. Alguns símbolos são claramente avisos contra profanação, gravados em latim antigo com ameaças de maldições eternas para aqueles que perturbarem o descanso dos mortos. Outros são proteções contra mortos-vivos - cruzes invertidas, círculos de sal representados em pedra, e runas que você reconhece de textos sobre necromancia. Isso sugere que quem foi enterrado aqui era não apenas importante, mas também temido. Talvez alguém que lidava com forças sombrias em vida.",
    opcoes: [
        { texto: "Entrar no mausoléu com cautela", secao: 45 },
        { texto: "Procurar outra entrada", secao: 47 },
        { texto: "Reconsiderar e explorar outras áreas", secao: 8 }
    ]
},

47: {
    texto: "Procurando outra entrada, você contorna o mausoléu e encontra uma passagem lateral parcialmente oculta por hera selvagem. Esta entrada menor parece ter sido construída para permitir acesso de manutenção, evitando a entrada principal cerimonial. A passagem é estreita e baixa, forçando você a se curvar, mas leva diretamente à câmara principal. Mais importante, ela evita qualquer armadilha ou proteção mágica que possa ter sido colocada na entrada principal. É uma rota mais segura, embora menos digna.",
    opcoes: [
        { texto: "Usar a entrada lateral", secao: 45 },
        { texto: "Voltar e usar a entrada principal", secao: 45 }
    ]
},

48: {
    texto: "Procurando por armas no sótão da casa, você encontra uma velha espingarda de caça apoiada contra uma viga de madeira. A arma está coberta de poeira, mas em condições surpreendentemente boas. Ao lado dela, uma caixa de munição meio vazia confirma que o antigo morador estava preparado para se defender. A espingarda é de calibre 12, robusta e confiável - exatamente o tipo de arma que seria útil contra mortos-vivos. Você também encontra um punhal de caça em uma bainha de couro, sua lâmina ainda afiada apesar dos anos.",
    opcoes: [
        { texto: "Pegar as armas e sair da casa", secao: 4 },
        { texto: "Procurar por mais munição", secao: 49 }
    ]
},

49: {
    texto: "Procurando por mais munição, você vasculha cuidadosamente o sótão e encontra uma lata de biscoitos que foi convertida em esconderijo. Dentro há cartuchos adicionais para a espingarda, cuidadosamente embrulhados em pano oleado para protegê-los da umidade. Há também algumas balas para pistola, sugerindo que o morador tinha mais de uma arma. É uma descoberta valiosa - munição será essencial se você encontrar mais mortos-vivos.",
    efeitos: [{ tipo: "item", item: "municao-38" }],
    opcoes: [
        { texto: "Sair da casa com seus achados", secao: 4 },
        { texto: "Procurar por mais armas escondidas", secao: 76 }
    ]
},

50: {
    texto: "Investigando mais sobre a praga através das inscrições nas lápides, você começa a montar um quadro perturbador. As datas mostram que a morte chegou em ondas: primeiro os idosos e doentes, depois os adultos saudáveis, e finalmente até mesmo as crianças. Mas há algo mais sinistro - algumas lápides têm símbolos estranhos gravados nelas, símbolos que você reconhece como sendo relacionados à necromancia. Isso não foi uma praga natural. Alguém orquestrou deliberadamente a morte de toda a vila, possivelmente para criar um exército de mortos-vivos. A pergunta que permanece é: quem, e por quê?",
    opcoes: [
        { texto: "Ir ao mausoléu para mais respostas", secao: 21 },
        { texto: "Descer à vila para procurar mais evidências", secao: 4 },
        { texto: "Examinar os símbolos necromânticos mais de perto", secao: 77 }
    ]
},

51: {
    texto: "Acendendo uma das tochas presas à parede, a cripta se ilumina com uma luz dançante que revela sua verdadeira extensão. A câmara é muito maior do que você imaginava, com fileiras de sarcófagos de pedra se estendendo nas sombras. As paredes são cobertas de símbolos necromânticos gravados na pedra, alguns ainda brilhando fracamente com energia residual. O ar é frio e úmido, carregado com o cheiro de incenso antigo e algo mais sombrio. No fundo da cripta, você vê uma passagem arqueada que desce ainda mais fundo na terra, suas profundezas perdidas na escuridão.",
    opcoes: [
        { texto: "Examinar os sarcófagos iluminados", secao: 52 },
        { texto: "Seguir a passagem mais profunda", secao: 65 },
        { texto: "Estudar os símbolos nas paredes", secao: 78 }
    ]
},

52: {
    texto: "Examinando os sarcófagos à luz da tocha, você faz uma descoberta perturbadora: muitos estão vazios, suas tampas pesadas empurradas de dentro para fora e caídas no chão de pedra. Os ocupantes claramente se levantaram e partiram, deixando apenas sudários rasgados e ossos espalhados. Em um dos sarcófagos que permanece selado, você encontra inscrições que identificam o ocupante como um alto sacerdote da vila. Dentro, junto aos ossos antigos, há alguns objetos rituais de prata que podem ser valiosos - ou úteis contra mortos-vivos.",
    opcoes: [
        { texto: "Coletar os objetos rituais", secao: 79 },
        { texto: "Continuar explorando a cripta", secao: 65 },
        { texto: "Voltar à superfície", secao: 4 }
    ]
},

53: {
    texto: "Procurando por uma saída alternativa, você explora as bordas da cripta com cuidado. Atrás de um dos sarcófagos maiores, você encontra uma passagem estreita que foi parcialmente bloqueada por pedras caídas. Com algum esforço, você consegue mover as pedras e descobrir que a passagem leva de volta à superfície, emergindo atrás da igreja através de uma entrada oculta por arbustos selvagens. É uma rota de fuga útil, caso você precise sair rapidamente.",
    opcoes: [
        { texto: "Usar a passagem para sair", secao: 4 },
        { texto: "Marcar a localização e continuar explorando", secao: 65 }
    ]
},

54: {
    texto: "Tentando decifrar mais do ritual necromântico gravado no altar, você se concentra nos símbolos complexos. Seu conhecimento de magia permite que você compreenda a verdadeira magnitude do que foi feito aqui. Este não foi um ritual simples - foi uma invocação massiva projetada para ressuscitar todos os mortos da vila simultaneamente. O ritual exigia um sacrifício enorme de energia vital, provavelmente a vida do próprio conjurador. Quem quer que tenha feito isso estava disposto a morrer para criar um exército de mortos-vivos. Mas por quê? E onde está esse necromante agora?",
    opcoes: [
        { texto: "Procurar por mais pistas na igreja", secao: 27 },
        { texto: "Ir ao cemitério investigar o local do ritual", secao: 8 },
        { texto: "Descer à cripta para procurar o necromante", secao: 25 }
    ]
},

55: {
    texto: "Após derrotar o zumbi na casa, você permanece parado por um momento, controlando sua respiração e tentando não pensar no que acabou de presenciar. A criatura estava se alimentando dos restos de alguém que provavelmente foi seu vizinho ou amigo em vida. Entre os pertences espalhados pela casa, você encontra algumas provisões que ainda estão boas - pão seco mas comestível e água limpa em uma jarra de cerâmica. Há também algumas velas e fósforos que podem ser úteis na escuridão.",
    efeitos: [{ tipo: "energia", valor: 1 }],
    opcoes: [
        { texto: "Continuar explorando a vila", secao: 4 },
        { texto: "Procurar por mais suprimentos na casa", secao: 80 }
    ]
},

56: {
    texto: "Tentando passar despercebido pelo zumbi que se alimenta, você se move com extremo cuidado. Cada passo é calculado, cada respiração controlada. A criatura está completamente absorta em sua refeição macabra, os sons de mastigação mascarando qualquer ruído pequeno que você possa fazer. Você consegue contornar a casa sem ser detectado, embora a visão e os sons do que presenciou continuem assombrando sua mente. Pelo menos agora você sabe que os zumbis podem ser distraídos quando estão se alimentando.",
    opcoes: [
        { texto: "Ir para a praça central", secao: 4 },
        { texto: "Procurar por outras casas para explorar", secao: 81 }
    ]
},

57: {
    texto: "Examinando o mapa mais detalhadamente à luz fraca que entra pela janela quebrada, você vê que ele marca cuidadosamente vários pontos importantes na vila. Há círculos vermelhos ao redor da igreja, da taverna, e de várias casas - provavelmente locais onde os moradores tentaram se barricar. Mais importante, há um X grande marcado no cemitério com a palavra 'origem' escrita ao lado em tinta vermelha. Isso confirma suas suspeitas de que tudo começou lá. O mapa também mostra túneis subterrâneos conectando vários edifícios, sugerindo que havia rotas de fuga planejadas.",
    opcoes: [
        { texto: "Ir ao cemitério investigar a 'origem'", secao: 8 },
        { texto: "Procurar pelos túneis subterrâneos", secao: 82 },
        { texto: "Continuar explorando a taverna", secao: 35 }
    ]
},

58: {
    texto: "Investigando os sinais de luta no quarto da taverna, você reconstrói mentalmente o que aconteceu aqui. Móveis foram usados como barricadas, há marcas de garras profundas nas paredes de madeira, e manchas de sangue seco formam padrões que contam uma história de desespero. Alguém lutou bravamente aqui, mas as marcas sugerem que enfrentaram múltiplos atacantes. Você encontra cartuchos de espingarda vazios no chão e buracos de bala nas paredes - quem quer que tenha estado aqui estava bem armado, mas ainda assim foi dominado.",
    opcoes: [
        { texto: "Procurar por sobreviventes no porão", secao: 35 },
        { texto: "Examinar as armas deixadas para trás", secao: 83 },
        { texto: "Sair da taverna", secao: 4 }
    ]
},

59: {
    texto: "Investigando cautelosamente os sons atrás dos barris, você se move lentamente pela penumbra do porão. O arrastar se torna mais intenso conforme você se aproxima, acompanhado por gemidos abafados. Quando você contorna o último barril grande, encontra a fonte do ruído: um zumbi em estado avançado de decomposição está preso entre dois barris pesados que caíram sobre ele. A criatura se debate fracamente, tentando se libertar, suas unhas arranhando inutilmente a madeira. Seus olhos mortos se fixam em você com uma fome terrível.",
    opcoes: [
        { texto: "Atacar o zumbi preso", batalha: "zumbi", vitoria: 66, derrota: 37 }
    ]
},


60: {
    texto: "Preparando sua arma e aguardando, você se posiciona estrategicamente perto da escada, garantindo uma rota de fuga. Não demora muito para que a fonte dos ruídos se revele: um zumbi emerge de trás dos barris de vinho, cambaleando em sua direção com movimentos desajeitados mas determinados. A criatura usa roupas que um dia foram as de um taberneiro - um avental de couro manchado e uma camisa de linho rasgada. Seus olhos vazios se fixam em você com fome primitiva, e ele acelera o passo tanto quanto sua condição permite.",
    batalha: "zumbi",
    vitoria: 66,
    derrota: 37
},

61: {
    texto: "Procurando por mais itens no porão após derrotar o zumbi, você vasculha cuidadosamente entre os barris e caixas empilhadas. Atrás de algumas caixas de vinho vazias, você encontra uma pequena reserva que alguém escondeu durante os primeiros dias da praga. Há bandagens limpas, uma pequena garrafa de álcool medicinal, e algumas ervas secas que ainda mantêm suas propriedades curativas. É uma descoberta valiosa que pode salvar sua vida se você se ferir.",
    efeitos: [{ tipo: "item", item: "pocao-cura-menor" }],
    opcoes: [
        { texto: "Subir e continuar explorando", secao: 4 },
        { texto: "Procurar por mais esconderijos", secao: 84 }
    ]
},

62: {
    texto: "Examinando o sarcófago cuidadosamente, você lê as inscrições elaboradas gravadas em sua superfície de pedra negra. Elas identificam o ocupante como Lorde Aldric Pedravale, o último governante da vila, que morreu há exatos vinte anos - coincidindo com o início da praga. As inscrições falam de um homem justo e sábio, amado por seu povo. Mas há algo estranho: símbolos necromânticos foram gravados sobre as inscrições originais, como se alguém tivesse profanado o túmulo após o enterro. Isso sugere que o próprio Lorde Aldric pode ter sido ressuscitado como morto-vivo.",
    opcoes: [
        { texto: "Abrir o sarcófago para verificar", secao: 67, teste: "habilidade", dificuldade: 15 },
        { texto: "Sair do mausoléu imediatamente", secao: 8 },
        { texto: "Procurar por mais pistas antes de abrir", secao: 64 }
    ]
},

63: {
    texto: "Pegando a coroa de ferro simples, você sente seu peso considerável em suas mãos. Embora não possua poderes mágicos, ela representa a autoridade que um dia governou esta vila próspera. O metal frio contra sua pele parece carregar o peso da história - das decisões tomadas, das vidas perdidas, e da tragédia que se abateu sobre Pedravale. Você completou sua exploração da Vila Abandonada, descobrindo seus segredos sombrios e sobrevivendo aos horrores que a habitam. A coroa será uma lembrança permanente desta jornada através da morte e da desolação.",
    efeitos: [{ tipo: "energia", valor: 5 }],
    final: true
},

64: {
    texto: "Procurando por outras pistas na câmara do mausoléu, você examina cuidadosamente cada canto da estrutura ornamentada. Atrás do sarcófago, você encontra uma pequena alcova que contém documentos antigos preservados em um baú de metal. Os pergaminhos revelam a verdade chocante sobre a praga: ela foi causada intencionalmente por um necromante chamado Morteus, que buscava vingança contra Lorde Aldric por ter banido ele da vila anos antes. O necromante usou um ritual proibido para matar todos os habitantes e ressuscitá-los como seus servos mortos-vivos.",
    opcoes: [
        { texto: "Procurar pelo necromante Morteus", secao: 68 },
        { texto: "Sair com as informações descobertas", secao: 63 },
        { texto: "Investigar se Lorde Aldric também foi ressuscitado", secao: 67 }
    ]
},

65: {
    texto: "Seguindo a passagem mais profunda da cripta, você desce por uma escadaria de pedra que se aprofunda nas entranhas da terra. O ar se torna progressivamente mais frio e carregado de energia sombria. As paredes são cobertas de símbolos necromânticos que brilham com uma luz fantasmagórica, e você pode ouvir sussurros em línguas mortas ecoando das profundezas. Finalmente, você chega a uma câmara final onde os restos do necromante Morteus ainda repousam em um altar de obsidiana. Seu corpo mumificado está cercado por artefatos sombrios, e você sente que sua presença maligna ainda contamina este lugar.",
    opcoes: [
        { texto: "Atacar o necromante imediatamente", batalha: "necromante", vitoria: 69, derrota: 37 },
        { texto: "Tentar pegar um artefato e fugir", secao: 89, teste: "habilidade", dificuldade: 15 },
        { texto: "Recuar silenciosamente", secao: 52 }
    ]
},

66: {
    texto: "Após derrotar o zumbi no porão da taverna, você se permite um momento para recuperar o fôlego. A luta foi mais difícil do que esperava - a criatura estava presa, mas isso a tornou mais desesperada e violenta. Agora você pode explorar o porão com segurança. Entre os barris de cerveja e vinho, você encontra algumas garrafas intactas de bebida forte que podem servir tanto como antisséptico quanto como combustível para tochas. Há também algumas moedas de prata espalhadas pelo chão, provavelmente caídas dos bolsos do zumbi quando ele ainda era o taberneiro.",
    opcoes: [
        { texto: "Subir e continuar explorando a vila", secao: 4 },
        { texto: "Procurar por mais itens escondidos", secao: 84 }
    ]
},

67: {
    texto: "Abrindo o sarcófago com grande esforço, as dobradiças de pedra gemem em protesto após décadas seladas. Quando a tampa pesada finalmente se move, você descobre que suas suspeitas estavam corretas: o sarcófago está vazio. Lorde Aldric também se levantou como morto-vivo, provavelmente logo após o ritual necromântico. Mas no fundo do sarcófago, há um compartimento secreto que contém os pertences pessoais do lorde - incluindo uma poção de cura poderosa e um anel com o selo da família. Estes itens podem ser valiosos, tanto monetariamente quanto para sua sobrevivência.",
    efeitos: [{ tipo: "item", item: "pocao-cura-menor" }],
    opcoes: [
        { texto: "Sair do mausoléu com os itens", secao: 63 },
{ texto: "Procurar por pistas sobre onde Lorde Aldric pode estar", secao: 68 }

    ]
},
68: {
    texto: "Procurando por pistas sobre o paradeiro de Lorde Aldric, você examina cuidadosamente o mausoléu. Nas paredes de mármore, você encontra arranhões profundos - marcas de garras que só poderiam ter sido feitas de dentro para fora. Seguindo as marcas até a entrada, você nota pegadas na poeira que levam em direção ao centro da vila. De repente, um rugido gutural ecoa da direção da praça central, seguido pelo som de pedra sendo quebrada. Algo grande e poderoso está se movendo lá embaixo.",
    opcoes: [
        { texto: "Ir à praça central enfrentar Lorde Aldric", secao: 69 },
        { texto: "Tentar contornar e fugir da vila", secao: 70 },
        { texto: "Procurar uma arma melhor antes do confronto", secao: 90 }
    ]
},

69: {
    texto: "Indo à praça central para enfrentar Lorde Aldric, você desce a colina com determinação. Na praça, uma figura imponente aguarda - o que um dia foi um nobre lorde agora é uma abominação de carne apodrecida e ossos expostos, ainda usando os restos de sua armadura cerimonial. Seus olhos brilham com uma luz sobrenatural, e ele empunha uma espada enferrujada. 'Quem ousa profanar meu domínio?' ele rosna com uma voz que ecoa do além-túmulo.",
    batalha: "lorde-aldric-zumbi",
    vitoria: 72,
    derrota: 37
},

70: {
    texto: "Tentando contornar e fugir da vila, você se move silenciosamente pelas ruas laterais, evitando a praça central onde os rugidos continuam ecoando. Sua estratégia de evitar o confronto direto se mostra sábia - você consegue chegar à entrada da vila sem ser detectado. Olhando para trás uma última vez, você vê uma figura sombria e imponente se movendo entre as ruínas. Você escapou da Vila de Pedravale com vida, mas sem resolver completamente seus mistérios.",
    efeitos: [{ tipo: "energia", valor: 2 }],
    final: true
},

71: {
    texto: "Descansando um momento para recuperar o fôlego após a batalha brutal, você se apoia contra uma parede de pedra e respira profundamente. O ar frio da vila ajuda a limpar seus pulmões do cheiro de decomposição. Alguns minutos de descanso restauram parte de suas energias e clarificam sua mente para os desafios à frente.",
    efeitos: [{ tipo: "energia", valor: 2 }],
    opcoes: [
        { texto: "Ir para a praça central", secao: 4 },
        { texto: "Procurar suprimentos nas casas próximas", secao: 10 }
    ]
},

72: {
    texto: "Após uma batalha épica contra Lorde Aldric, você permanece de pé sobre os restos finalmente em paz do antigo governante. A luta foi brutal - o lorde zumbi mantinha muito de sua habilidade marcial mesmo na morte, mas sua determinação prevaleceu. Com sua destruição, você sente uma mudança no ar da vila. Os gemidos distantes dos outros zumbis cessam gradualmente, como se a morte de seu líder os tivesse libertado de sua maldição. Você encontra entre os restos do lorde sua coroa de ferro, símbolo de sua antiga autoridade.",
    efeitos: [{ tipo: "energia", valor: -3 }, { tipo: "item", item: "coroa-ferro" }],
    opcoes: [
        { texto: "Explorar a vila agora pacificada", secao: 74 },
        { texto: "Partir imediatamente com a coroa", secao: 75 }
    ]
},

73: {
    texto: "Tentando uma emboscada nas ruas, você se posiciona estrategicamente atrás de uma casa em ruínas com sua balestra preparada. Quando Lorde Aldric emerge da praça procurando por você, você tem a vantagem da surpresa. Seu primeiro tiro acerta em cheio, mas o morto-vivo é resistente. Ele se vira em sua direção com um rugido de fúria, mas você já está recarregando para um segundo disparo. A emboscada lhe dá uma vantagem crucial no combate.",
    batalha: "lorde-aldric-zumbi",
    vitoria: 72,
    derrota: 37
},

74: {
    texto: "Explorando a vila agora pacificada após a morte de Lorde Aldric, você caminha pelas ruas que finalmente encontraram silêncio verdadeiro. Os zumbis restantes desabaram onde estavam, libertados da maldição que os prendia. Nas casas, você encontra tesouros esquecidos e suprimentos valiosos que os antigos moradores esconderam. Mais importante, você encontra um diário que revela a localização de outros tesouros da família Pedravale, incluindo uma reserva de ouro escondida no poço da praça central.",
    efeitos: [{ tipo: "item", item: "mapa-tesouro" }, { tipo: "energia", valor: 3 }],
    opcoes: [
        { texto: "Partir da vila com seus tesouros", secao: 75 }
    ]
},

75: {
    texto: "Partindo da Vila de Pedravale, você carrega consigo não apenas a coroa de ferro e os tesouros descobertos, mas também o conhecimento de que trouxe paz aos mortos inquietos. O sol nasce no horizonte, dissipando as últimas sombras da vila amaldiçoada. Atrás de você, Pedravale finalmente descansa em silêncio eterno, seus habitantes libertados de duas décadas de tormento. Sua jornada pela vila abandonada chegou ao fim, e você emerge como um herói que enfrentou os horrores do passado e prevaleceu. A estrada à frente promete novas aventuras, mas esta vitória permanecerá para sempre em sua memória.",
    efeitos: [{ tipo: "energia", valor: 5 }],
    final: true
},

76: {
    texto: "Procurando por mais informações na loja, você vasculha cuidadosamente os fundos do estabelecimento. Atrás do balcão, você encontra uma gaveta secreta contendo correspondências entre o proprietário e autoridades de cidades vizinhas. As cartas revelam que eventos similares ocorreram em outras vilas, sempre precedidos pelo desaparecimento de artefatos antigos de cemitérios locais. Uma carta menciona especificamente um 'Amuleto da Morte' que foi roubado do mausoléu de Pedravale dias antes da praga começar.",
    opcoes: [
        { texto: "Ir ao cemitério procurar pelo amuleto", secao: 8 },
        { texto: "Continuar explorando a vila", secao: 4 }
    ]
},

        83: {
    texto: "Examinando as armas deixadas para trás no quarto da taverna, você encontra uma espingarda de caça abandonada no canto, ainda carregada mas com o cano ligeiramente entortado pela luta. Ao lado dela, há um machado de lenhador com a lâmina manchada de sangue seco - tanto humano quanto de algo mais escuro e viscoso. Entre os destroços, você também encontra uma caixa de munição meio vazia e algumas facas de cozinha que foram usadas como armas improvisadas.",
    efeitos: [{ tipo: "item", item: "machado-lenhador" }],
    opcoes: [
        { texto: "Pegar as armas e sair da taverna", secao: 4 },
        { texto: "Procurar por sobreviventes no porão", secao: 35 }
    ]
},

        77: {
    texto: "Examinando os símbolos necromânticos mais de perto, você descobre que eles formam um padrão ritual complexo. Cada símbolo representa uma fase da ressurreição em massa que devastou a vila. O conhecimento é perturbador, mas pode ser útil para compreender como reverter ou prevenir tais magias no futuro.",
    efeitos: [{ tipo: "item", item: "conhecimento-necromancia" }],
    opcoes: [
        { texto: "Ir ao mausoléu com este conhecimento", secao: 21 },
        { texto: "Procurar mais evidências na vila", secao: 4 }
    ]
},

78: {
    texto: "Estudando os símbolos nas paredes da cripta, você reconhece runas de contenção e banimento. Elas foram gravadas para manter algo preso aqui embaixo. Mas muitas das runas estão rachadas ou apagadas, sugerindo que o que quer que estivesse contido pode ter escapado.",
    opcoes: [
        { texto: "Tentar reparar algumas runas", secao: 65, teste: "magia", dificuldade: 16 },
        { texto: "Continuar explorando a cripta", secao: 52 },
        { texto: "Sair imediatamente", secao: 4 }
    ]
},

79: {
    texto: "Coletando os objetos rituais de prata, você sente uma energia protetora emanar deles. São relíquias sagradas que podem oferecer proteção contra mortos-vivos e outras criaturas sombrias.",
    efeitos: [{ tipo: "item", item: "reliquia-sagrada" }],
    opcoes: [
        { texto: "Continuar explorando com proteção", secao: 65 },
        { texto: "Voltar à superfície", secao: 4 }
    ]
},

80: {
    texto: "Procurando por mais suprimentos na casa após derrotar o zumbi, você encontra uma pequena despensa escondida. Há conservas, água limpa e algumas velas que ainda podem ser úteis.",
    efeitos: [{ tipo: "item", item: "suprimentos-casa" }],
    opcoes: [
        { texto: "Continuar explorando a vila", secao: 4 }
    ]
},

81: {
    texto: "Procurando por outras casas para explorar, você encontra uma residência que parece ter sido barricada de dentro. A porta está trancada, mas você pode ouvir um som fraco vindo de dentro.",
    opcoes: [
        { texto: "Forçar a entrada", secao: 28, teste: "habilidade", dificuldade: 13 },
        { texto: "Bater na porta e anunciar presença", secao: 29 },
        { texto: "Procurar outra casa", secao: 4 }
    ]
},

82: {
    texto: "Explorando os túneis subterrâneos, você caminha por passagens estreitas de pedra que conectam os edifícios principais da vila. As paredes são úmidas e cobertas de musgo, e você pode ouvir gotejamento constante. Os túneis foram claramente construídos como rotas de fuga, mas nunca foram usados - não há sinais de passagem recente. Você encontra três ramificações: uma leva em direção ao cemitério, outra para o centro da vila, e a terceira para uma área que você ainda não explorou.",
    opcoes: [
        { texto: "Seguir o túnel para o cemitério", secao: 8 },
        { texto: "Ir para o centro da vila pelos túneis", secao: 4 },
        { texto: "Explorar a área desconhecida", secao: 86 }
    ]
},

84: {
    texto: "Procurando por mais esconderijos no porão, você encontra uma passagem secreta atrás de alguns barris. Ela leva a um túnel que conecta com outros edifícios da vila.",
    opcoes: [
        { texto: "Seguir o túnel", secao: 82 },
        { texto: "Subir e sair da taverna", secao: 4 }
    ]
},

        86: {
    texto: "Seguindo o túnel para a área desconhecida, você emerge em uma câmara subterrânea que parece ter sido usada como depósito de suprimentos de emergência. Há barris de água, caixas de comida preservada e equipamentos básicos de sobrevivência.",
    efeitos: [{ tipo: "item", item: "suprimentos-emergencia" }, { tipo: "energia", valor: 2 }],
    opcoes: [
        { texto: "Voltar pelos túneis", secao: 82 },
{ texto: "Procurar uma saída para a superfície", secao: 87 }
    ]
},

87: {
    texto: "Procurando uma saída para a superfície, você encontra uma escada de pedra que leva para cima. Ao emergir através de um alçapão oculto atrás da igreja, você se depara com um zumbi solitário que estava vagando pela área. A criatura se vira imediatamente em sua direção, atraída pelo som do alçapão se abrindo. Você está em posição vulnerável, meio saído do buraco.",
    opcoes: [
        { texto: "Atacar o zumbi rapidamente", batalha: "zumbi", vitoria: 88, derrota: 37 },
        { texto: "Tentar recuar para o túnel", secao: 86, teste: "habilidade", dificuldade: 12 },
    ]
},

88: {
    texto: "Após derrotar o zumbi que guardava a saída, você respira aliviado. A luta foi rápida mas intensa. Agora você pode se orientar com segurança e seguir em direção à praça central da vila.",
    efeitos: [{ tipo: "energia", valor: -1 }],
    opcoes: [
        { texto: "Ir para a praça central", secao: 4 }
    ]
}
,

        89: {
    texto: "Tentando pegar um artefato sombrio, você se move rapidamente em direção ao altar. Mas no momento em que seus dedos tocam um dos objetos necromânticos, os olhos do necromante se abrem com um brilho sobrenatural. 'Ladrão!' ele sibila, e sua forma mumificada começa a se erguer. Você conseguiu pegar o artefato, mas agora terá que enfrentar sua ira.",
    efeitos: [{ tipo: "item", item: "artefato-sombrio" }],
    opcoes: [
        { texto: "Lutar contra o necromante", batalha: "necromante", vitoria: 69, derrota: 37 }
    ]
},
        90: {
    texto: "Procurando uma arma melhor antes do confronto, você vasculha rapidamente as casas próximas ao cemitério. Em uma antiga casa de guarda, você encontra uma balestra militar ainda em bom estado, junto com algumas virotes de ferro. A arma é pesada mas poderosa - exatamente o que você precisa para enfrentar um morto-vivo de grande poder. Armado adequadamente, você se sente mais confiante para o confronto que se aproxima.",
    efeitos: [{ tipo: "item", item: "balestra-militar" }],
    opcoes: [
        { texto: "Ir enfrentar Lorde Aldric na praça", secao: 69 },
        { texto: "Tentar uma emboscada nas ruas", secao: 73 }
    ]
},


85: {
    texto: "Lendo o diário mais detalhadamente, você descobre entradas cada vez mais desesperadas. O autor descreve como a 'febre estranha' se espalhou rapidamente, transformando vizinhos em criaturas violentas e famintas. As últimas páginas revelam que ele viu pessoas mortas se levantando do cemitério e caminhando de volta para a vila. A entrada final, escrita com tinta tremula, diz: 'O necromante Morteus retornou para se vingar. Que Deus nos perdoe pelo que fizemos com ele anos atrás.'",
    opcoes: [
        { texto: "Ir ao cemitério procurar por Morteus", secao: 8 },
        { texto: "Procurar mais informações sobre Morteus", secao: 42 },
        { texto: "Sair da loja imediatamente", secao: 4 }
    ]
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
















