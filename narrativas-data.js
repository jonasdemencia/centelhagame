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

/*
=== GUIA CRÍTICO PARA NARRATIVAS - CONEXÃO ENTRE ESCOLHAS E SEÇÕES ===

REGRA FUNDAMENTAL: CONTINUIDADE NARRATIVA DIRETA
- Cada seção DEVE começar fazendo referência DIRETA à escolha que levou até ela
- Se a escolha é "Usar a corda para escalar", a seção seguinte DEVE começar: "Ao usar a corda, você..."
- Se a escolha é "Investigar o baú", a seção seguinte DEVE começar: "Investigando o baú, você descobre..."
- Se a escolha é "Atacar o goblin", a seção seguinte DEVE começar: "Seu ataque contra o goblin..."

EXEMPLOS CORRETOS:
Escolha: "Examinar a porta misteriosa"
Seção seguinte: "Examinando cuidadosamente a porta, você nota entalhes estranhos..."

Escolha: "Beber a poção vermelha"  
Seção seguinte: "Ao beber a poção vermelha, um calor intenso percorre seu corpo..."

EXEMPLOS INCORRETOS:
Escolha: "Usar a chave dourada"
Seção seguinte: "Você se encontra em uma nova câmara..." ❌ (não menciona a chave)

PROGRESSÃO NARRATIVA:
- Evite saltos abruptos entre locais sem transição adequada
- Cada seção deve fluir naturalmente da anterior
- Reduza a quantidade de itens dados por seção (máximo 1-2 itens por descoberta)
- Crie mais seções intermediárias para ações complexas

ESTRUTURA IDEAL:
1. Referência direta à escolha anterior
2. Descrição da ação sendo executada  
3. Consequências/descobertas da ação
4. Novas opções baseadas na situação atual

Esta continuidade é ESSENCIAL para manter a imersão do jogador na narrativa.
*/

// Dados das narrativas
const NARRATIVAS = {

"coroa-de-ferro-epica": {
    id: "coroa-de-ferro-epica",
    titulo: "A Coroa de Ferro — Aventura Completa",
    secoes: {
      1: {
        texto: "O vento cortante das Terras Devastadas finalmente cessa quando você avista seu destino. A Fortaleza de Ferro se ergue diante de você como uma cicatriz negra contra o céu plúmbeo, suas torres quebradas apontando para os céus como dedos acusadores. Muralhas que um dia desafiaram exércitos inteiros agora jazem em ruínas, pedras milenares espalhadas como ossos de gigantes. O ar carrega o sabor metálico do ferro oxidado misturado ao pó de séculos esquecidos. No portão principal, uma única tocha desafia o tempo, sua chama dançando obstinadamente sobre algo que brilha no chão pedregoso. As lendas sussurram que aqui repousa a Coroa de Ferro, mas as ruínas guardam segredos mais sombrios que qualquer tesouro.",
        opcoes: [
          { texto: "Investigar o objeto brilhante próximo à tocha", secao: 2 },
          { texto: "Seguir direto pela ponte destruída rumo ao interior", secao: 5 },
          { texto: "Buscar abrigo entre os escombros para observar", secao: 8 }
        ]
      },

      2: {
        texto: "Seus passos ecoam no silêncio mortal enquanto você se aproxima da tocha. A chama projeta sombras dançantes sobre uma pedra peculiar, diferente de todas as outras espalhadas pelo local. Esta possui veios dourados que serpenteiam por sua superfície como raios congelados no tempo, pulsando com uma luz interior sutil. Quando seus dedos tocam a superfície fria, a pedra cede como argila macia, revelando sua natureza mágica. Com um sussurro quase inaudível, uma cavidade secreta se abre, forrada com tecido negro que parece absorver a luz. Dentro, protegidos por séculos de espera, repousam dois artefatos: um pavio de cor impossível que parece sugar a luminosidade ao redor, e um bilhete cujas bordas ainda fumegam com chamas fantasmagóricas.",
        efeitos: [{ tipo: "item", item: "pavio-negro" }, { tipo: "item", item: "bilhete-queimado" }],
        opcoes: [
          { texto: "Examinar cuidadosamente o bilhete misterioso", secao: 3 },
          { texto: "Guardar os artefatos e prosseguir pela ponte", secao: 5 }
        ]
      },

      3: {
        texto: "Suas mãos tremem ligeiramente ao desdobrar o pergaminho antigo. As palavras parecem escritas com tinta que ainda brilha fracamente: 'A Coroa espera sob pedra e cinza, onde os antigos selaram o poder. O ritual exige três elementos: a Espada que corta véus, o Medalhão que guarda memórias, e a Voz que desperta os mortos. Cuidado com aqueles que buscam apenas poder - eles encontrarão apenas destruição.' A assinatura é apenas uma letra borrada: 'S.' Você sente que este bilhete foi deixado por alguém que conhecia os segredos da Fortaleza, talvez o último a tentar reivindicar a Coroa.",
        efeitos: [{ tipo: "energia", valor: 1 }],
        opcoes: [
          { texto: "Memorizar cada palavra e seguir pela ponte", secao: 5 },
          { texto: "Procurar pelo medalhão mencionado nas proximidades", secao: 4, teste: "sorte", dificuldade: 12 }
        ]
      },

      4: {
        texto: "Sua intuição o guia através dos destroços espalhados pelo pátio. Entre pedras rachadas e metal retorcido, algo metálico captura sua atenção. É um medalhão de ferro negro, gravado com símbolos que parecem se mover quando você não está olhando diretamente. O momento em que seus dedos tocam o metal frio, uma vibração baixa percorre seu braço - o medalhão está respondendo ao pavio negro em sua posse. Os símbolos brilham momentaneamente, como se reconhecessem um antigo companheiro. Você percebe que este não é um achado casual; foi deixado aqui propositalmente, aguardando alguém com o conhecimento necessário para encontrá-lo.",
        efeitos: [{ tipo: "item", item: "medalhao-selo" }],
        opcoes: [
          { texto: "Seguir pela ponte com o medalhão pulsante", secao: 5 },
          { texto: "Tentar sondar o medalhão com magia", secao: 9, teste: "magia", dificuldade: 14 }
        ]
      },

      5: {
        texto: "A ponte de pedra range ameaçadoramente sob seus pés, suas fundações abaladas por séculos de abandono. Fissuras profundas percorrem sua extensão, e você pode ouvir o eco do vazio abaixo. No ponto central da travessia, duas figuras encapuzadas emergem das sombras como espectros materializados. Seus mantos esfarrapados ondulam sem vento, e você pode sentir o frio sobrenatural que emana de suas presenças. Eles murmuram em um dialeto antigo, palavras que fazem o ar vibrar com energia sombria. Quando percebem sua aproximação, param abruptamente. Capuzes se voltam em sua direção, revelando apenas escuridão onde deveriam estar rostos. O confronto é inevitável.",
        opcoes: [
          { texto: "Tentar estabelecer comunicação pacífica", secao: 6, teste: "carisma", dificuldade: 15 },
          { texto: "Atacar antes que possam reagir", batalha: "cultista-sombra,cultista-sombra", vitoria: 7, derrota: 30 },
          { texto: "Recuar e buscar rota alternativa", secao: 8 }
        ]
      },

      6: {
        texto: "Você ergue as mãos em gesto de paz, sua voz ecoando pela ponte: 'Não venho como inimigo. Busco a Coroa de Ferro.' As palavras causam um efeito imediato - um dos cultistas recua visivelmente, enquanto o outro emite um rosnar gutural que ecoa de forma impossível. O primeiro sussurra algo em sua língua sombria, e você capta fragmentos: '...buscador... como os outros...' Há hesitação em seus movimentos, como se estivessem divididos entre atacar e fugir. A menção da Coroa claramente os perturbou, mas a desconfiança ainda domina suas ações. Você percebe que tem uma janela de oportunidade antes que decidam agir.",
        opcoes: [
          { texto: "Pressionar com mais informações sobre a Coroa", secao: 11, teste: "carisma", dificuldade: 13 },
          { texto: "Fingir ser um enviado com oferendas", secao: 10, teste: "habilidade", dificuldade: 14 },
          { texto: "Aproveitar a hesitação para atacar", batalha: "cultista-sombra", vitoria: 7, derrota: 30 }
        ]
      },

      7: {
        texto: "O silêncio retorna à ponte após o confronto. Os corpos dos cultistas se dissolvem em fumaça negra, deixando apenas seus pertences materiais. Vasculhando os restos, você encontra um mapa parcial da Fortaleza, desenhado em pergaminho que parece feito de pele humana. As anotações estão em múltiplas línguas, algumas das quais você reconhece como dialetos arcanos. Há também um frasco de vidro escuro contendo um líquido que se move por conta própria, brilhando com uma luz sinistra. O mapa revela passagens secretas e câmaras ocultas, informações que poderiam ser vitais para navegar pelos perigos à frente.",
        efeitos: [{ tipo: "item", item: "mapa-parcial" }, { tipo: "item", item: "frasco-escuro" }],
        opcoes: [
          { texto: "Estudar o mapa e seguir pelo portão principal", secao: 12 },
          { texto: "Investigar o frasco misterioso com cautela", secao: 14, teste: "magia", dificuldade: 12 }
        ]
      },

      8: {
        texto: "Os escombros oferecem abrigo temporário do vento cortante. Entre as pedras caídas, você descobre os restos de uma antiga fogueira - três tochas cuidadosamente arranjadas, suas brasas há muito extintas, mas a madeira ainda preservada por algum encantamento. Próximo a elas, meio enterrado na terra, brilha um anel simples gravado com símbolos aquáticos que parecem fluir como água real. As tochas foram claramente preparadas por alguém que esperava retornar, mas nunca o fez. O anel pulsa com magia elemental, sugerindo que pertenceu a um mago especializado em magias aquáticas. Você se pergunta que destino teve seu antigo portador.",
        efeitos: [{ tipo: "item", item: "tochas-apagadas" }, { tipo: "item", item: "anel-aquatico" }],
        opcoes: [
          { texto: "Amarrar as tochas no cinto e prosseguir", secao: 12 },
          { texto: "Retornar à ponte principal", secao: 5 }
        ]
      },

      9: {
        texto: "Concentrando sua energia mágica no medalhão, você sente uma conexão se formar. Visões fragmentadas invadem sua mente: uma câmara circular banhada em luz dourada, uma coroa flutuando no ar, e uma figura de pedra observando tudo com olhos que brilham como estrelas. A visão é intensa demais - você sente como se sua consciência fosse puxada através do tempo e espaço. Por um momento aterrorizante, você tem certeza de que a figura de pedra - o Velho da Pedra, sussurra uma voz em sua mente - está olhando diretamente para você através da visão. A conexão se rompe abruptamente, deixando-o tonto e com uma dor de cabeça latejante.",
        efeitos: [{ tipo: "energia", valor: -1 }],
        opcoes: [
          { texto: "Prosseguir com cautela redobrada", secao: 12 },
          { texto: "Tentar usar a visão para mapear um caminho", secao: 13, teste: "magia", dificuldade: 16 }
        ]
      },

      10: {
        texto: "Sua performance é convincente. Retirando o frasco escuro, você o oferece como 'tributo aos guardiões da Fortaleza'. O cultista hesitante estende uma mão esquelética, aceitando a oferenda com algo que poderia ser gratidão. Ele sussurra palavras em sua língua sombria antes de se afastar, permitindo sua passagem. Seu companheiro o segue relutantemente. Quando estão longe, você percebe que o líquido no frasco era claramente venenoso - as bordas do vidro onde o cultista tocou agora mostram sinais de corrosão. Você evitou um confronto, mas também entregou uma arma potencial.",
        efeitos: [{ tipo: "item", item: "frasco-veneno" }],
        opcoes: [
          { texto: "Seguir rapidamente para o interior da fortaleza", secao: 12 },
          { texto: "Tentar seguir os cultistas discretamente", secao: 31 }
        ]
      },

      11: {
        texto: "Sua persistência diplomática rende frutos. O cultista mais receptivo começa a falar em um comum quebrado: 'Outros... vieram antes... todos falharam... Servos de pedra... guardam entrada... abaixo da terra...' Ele aponta para uma seção da muralha onde as pedras parecem diferentes das outras. 'Eles... temem a Coroa... como nós... Poder demais... para mortais...' Suas palavras são entrecortadas por tremores de medo. O outro cultista puxa seu companheiro, claramente desconfortável com a conversa, mas você conseguiu informações valiosas sobre uma entrada alternativa e a natureza dos guardiões que a protegem.",
        opcoes: [
          { texto: "Seguir a dica sobre a entrada subterrânea", secao: 16 },
          { texto: "Agradecer e ir pelo pátio principal", secao: 12 }
        ]
      },

      12: {
        texto: "O pátio principal da Fortaleza é um cemitério de ambições passadas. Estátuas quebradas de antigos heróis observam sua passagem com olhos de pedra rachados, suas expressões congeladas em eternos gritos silenciosos. O chão é um mosaico de pedras soltas e metal retorcido, cada passo produzindo ecos que parecem despertar memórias adormecidas. De algum lugar nas profundezas abaixo de seus pés, um som metálico ressoa - como se algo gigantesco estivesse se movendo em resposta ao medalhão em sua posse. As torres ao redor se erguem como sentinelas mortas, suas janelas vazias como órbitas oculares. Você sente que está sendo observado por forças invisíveis.",
        opcoes: [
          { texto: "Procurar a entrada subterrânea usando o mapa", secao: 16, requer: "mapa-parcial" },
          { texto: "Subir na torre mais alta para reconhecimento", secao: 18, teste: "habilidade", dificuldade: 13 },
          { texto: "Explorar as antigas celas da prisão", secao: 20 }
        ]
      },

      13: {
        texto: "Forçando sua mente através da dor residual da visão, você consegue extrair mais detalhes. As imagens se reorganizam em sua consciência: a Coroa não é apenas um objeto de poder, mas um teste. Três elementos são necessários - Força, Selo e Voz - cada um representando um aspecto da alma humana. Você vê fragmentos de rituais antigos, palavras de poder escritas em línguas mortas, e compreende que a jornada até a Coroa é tanto física quanto espiritual. A informação se cristaliza em sua mente como conhecimento arcano, mas você sente que pagou um preço por essa sabedoria prematura.",
        efeitos: [{ tipo: "item", item: "nota-selo" }],
        opcoes: [
          { texto: "Usar o conhecimento para ir direto ao subterrâneo", secao: 16 },
          { texto: "Explorar a torre para confirmar as visões", secao: 18 }
        ]
      },

      14: {
        texto: "Concentrando-se no frasco, você sente a magia sombria que permeia o líquido. Não é apenas veneno - é algo muito mais específico. O líquido foi destilado de essências corruptoras, projetado para dissolver substâncias mágicas corrompidas. Aplicado a uma lâmina, ele poderia ser devastador contra criaturas de pedra animada ou construtos mágicos. A descoberta é valiosa, mas você também percebe que o líquido é instável - usar incorretamente poderia resultar em consequências desastrosas. O frasco pulsa com uma luz sinistra, como se estivesse ansioso para cumprir seu propósito destrutivo.",
        efeitos: [{ tipo: "item", item: "oleo-corrosivo" }],
        opcoes: [
          { texto: "Guardar cuidadosamente e entrar na fortaleza", secao: 12 },
          { texto: "Testar o óleo em uma pequena amostra", secao: 21, teste: "sorte", dificuldade: 13 }
        ]
      },

      15: {
        texto: "A adega antiga exala o aroma de vinhos há muito evaporados e madeira apodrecida. No centro da câmara, um guerreiro esquelético permanece sentado em uma cadeira de pedra, ainda vestindo uma armadura que um dia foi magnífica. Suas mãos ósseas seguram uma espada cuja lâmina, apesar da ferrugem que a cobre, ainda pulsa com poder latente. Runas de restauração brilham fracamente ao longo do fio da espada, sugerindo que sua deterioração é apenas superficial. Uma placa de metal aos pés do guerreiro identifica a arma: 'Espada Ferrugem - Que desperta quando a necessidade é grande.' Você sente que esta lâmina tem uma história própria, aguardando o momento certo para revelar seu verdadeiro poder.",
        efeitos: [{ tipo: "item", item: "espada-ferrugem" }],
        opcoes: [
          { texto: "Empunhar a espada com respeito", secao: 17 },
          { texto: "Levar a espada mas manter distância", secao: 20 }
        ]
      },

      16: {
        texto: "A entrada subterrânea se abre como uma boca faminta nas profundezas da terra. Degraus de pedra negra descem em espiral, desaparecendo na escuridão absoluta. O ar que sobe das profundezas é gelado e carrega o cheiro de terra antiga e algo mais - uma presença viva que respira nas sombras. Quando você coloca o pé no primeiro degrau, ecos distantes respondem, como se algo gigantesco tivesse despertado lá embaixo. Três formas começam a se materializar na escuridão: servos de pedra corrompidos, seus olhos brilhando com luz malévola. Eles se movem com propósito mortal, bloqueando sua descida. A batalha nas escadas será perigosa - um passo em falso poderia significar uma queda fatal.",
        opcoes: [
          { texto: "Enfrentar os servos na escada estreita", batalha: "servo-pedra,servo-pedra", vitoria: 19, derrota: 30 },
          { texto: "Aplicar óleo corrosivo na lâmina primeiro", secao: 19, requer: "oleo-corrosivo" },
          { texto: "Recuar e buscar outra entrada", secao: 12 }
        ]
      },

      17: {
        texto: "No momento em que seus dedos se fecham ao redor do punho da Espada Ferrugem, uma transformação ocorre. A ferrugem se desprende como escamas mortas, revelando uma lâmina de aço puro que brilha com luz própria. Poder flui através de seus braços, e você sente sua força física aumentar temporariamente. A espada vibra em harmonia com o medalhão, como se fossem partes de um conjunto maior. Runas antigas aparecem na lâmina, pulsando com energia restauradora. Você compreende instintivamente que esta não é apenas uma arma, mas uma chave - uma das três necessárias para alcançar a Coroa. O guerreiro morto parece sorrir em aprovação.",
        efeitos: [{ tipo: "energia", valor: 2 }, { tipo: "item", item: "espada-ferrugem" }],
        opcoes: [
          { texto: "Testar a espada em um manequim de treino", secao: 22, teste: "habilidade", dificuldade: 12 },
          { texto: "Seguir imediatamente para o subterrâneo", secao: 16 }
        ]
      },

      18: {
        texto: "A subida pela torre é traiçoeira, com degraus quebrados e cordas podres, mas a vista do topo vale o risco. A Fortaleza se revela em toda sua complexidade: um labirinto de pátios conectados, câmaras ocultas, e no centro, um salão principal dominado por cinco pilares massivos. Uma abertura circular no chão do salão principal leva às catacumbas - claramente o caminho para os níveis mais profundos. Ao sul, você nota movimento: figuras encapuzadas patrulhando uma área que o mapa não mostrava. Há mais cultistas aqui do que você imaginava, e eles parecem estar protegendo algo específico. A informação estratégica que você ganhou pode ser crucial para evitar emboscadas.",
        opcoes: [
          { texto: "Descer e ir direto para a escada subterrânea", secao: 16 },
          { texto: "Tentar contornar os patrulheiros furtivamente", secao: 24, teste: "habilidade", dificuldade: 14 }
        ]
      },

      19: {
        texto: "A batalha contra os servos de pedra é brutal mas vitoriosa. Seus golpes, potencializados pelo óleo corrosivo ou pela determinação pura, racham suas formas rochosas até que se desfazem em cascalho. No silêncio que se segue, você nota algo que os servos estavam guardando: um pequeno pergaminho enrolado, selado com cera negra. Quando quebra o selo, palavras em uma língua antiga começam a sussurrar no ar ao redor, como se o próprio pergaminho estivesse vivo. As palavras são hipnóticas, quase sedutoras, prometendo conhecimento proibido para aqueles corajosos o suficiente para escutar. Você sente que este pergaminho contém segredos que poderiam ser tanto uma bênção quanto uma maldição.",
        efeitos: [{ tipo: "item", item: "pergaminho-sussurro" }],
        opcoes: [
          { texto: "Tentar decifrar o pergaminho imediatamente", secao: 23, teste: "magia", dificuldade: 14 },
          { texto: "Guardar o pergaminho e continuar descendo", secao: 25 }
        ]
      },

      20: {
        texto: "As antigas celas da prisão contam histórias silenciosas de sofrimento e desespero. A maioria contém apenas ossos e trapos apodrecidos, mas uma cela no final do corredor revela um tesouro inesperado. Alguém - talvez um prisioneiro com conhecimento arcano - escondeu uma bolsa de couro contendo moedas de ouro antigo e um mapa detalhado do subsolo da torre. As moedas são de uma época anterior à construção da Fortaleza, sugerindo que este lugar tem uma história muito mais longa do que aparenta. O mapa mostra câmaras secretas e passagens ocultas, incluindo o que parece ser uma rota direta para o coração da Fortaleza. Você se pergunta que prisioneiro possuía tal conhecimento.",
        efeitos: [{ tipo: "item", item: "moedas-antigas" }, { tipo: "item", item: "mapa-torre" }],
        opcoes: [
          { texto: "Usar o mapa para navegar ao subterrâneo", secao: 16 },
          { texto: "Investigar mais profundamente as celas", secao: 21, teste: "sorte", dificuldade: 12 }
        ]
      },

      21: {
        texto: "Sua persistência em explorar é recompensada com uma descoberta extraordinária. Em uma cela aparentemente vazia, você encontra inscrições gravadas na parede de pedra - não com ferramentas, mas com magia pura. As palavras brilham fracamente quando tocadas, revelando uma profecia sobre a Coroa: 'Três chaves abrem o caminho: a Espada que corta ilusões, o Medalhão que preserva memórias, e a Voz que desperta os adormecidos. Somente quando unidos em propósito puro, o guardião final se revelará.' A inscrição é assinada com um símbolo que você reconhece dos textos arcanos - a marca de um mago de grande poder. Este conhecimento pode ser a diferença entre sucesso e fracasso em sua busca.",
        efeitos: [{ tipo: "item", item: "inscricao-provacoes" }],
        opcoes: [
          { texto: "Memorizar cada palavra e prosseguir", secao: 25 },
          { texto: "Procurar mais pistas sobre a 'Voz' na torre", secao: 18 }
        ]
      },

      22: {
        texto: "Testando a Espada Ferrugem contra um manequim de treino abandonado, você fica impressionado com sua resposta. A lâmina corta o ar com um som musical, e quando atinge o alvo, runas brilham ao longo de seu fio. Você sente uma conexão crescente com a arma, como se ela estivesse aprendendo seu estilo de luta. Na guarda da espada, símbolos que você não havia notado antes começam a aparecer - uma inscrição em língua élfica antiga que pulsa com luz própria. Sua confiança com a arma aumenta significativamente, e você percebe que dominar esta espada pode ser crucial para os desafios à frente. A lâmina parece ansiosa por ação real.",
        efeitos: [{ tipo: "energia", valor: 1 }, { tipo: "item", item: "guarda-runa" }],
        opcoes: [
          { texto: "Tentar decifrar a runa élfica", secao: 23, teste: "magia", dificuldade: 13 },
          { texto: "Seguir confiante para as catacumbas", secao: 25 }
        ]
      },

      23: {
        texto: "Concentrando sua energia mágica no pergaminho ou na runa, palavras antigas começam a se formar em sua mente. Uma voz sussurra diretamente em sua consciência, falando uma única palavra de poder: 'Serafim.' O nome ressoa através de seu ser como um sino de bronze, carregando peso e autoridade que transcendem a compreensão mortal. Você sente que esta palavra é mais que um nome - é uma chave, um comando, uma invocação. Mas com o conhecimento vem uma sensação crescente de que você está sendo observado. Algo nas profundezas da Fortaleza despertou para sua presença, atraído pelo poder que você acabou de despertar. O ar ao redor parece vibrar com expectativa.",
        efeitos: [{ tipo: "item", item: "palavra-serafim" }],
        opcoes: [
          { texto: "Guardar a palavra e prosseguir com cautela", secao: 25 },
          { texto: "Testar o poder da palavra imediatamente", secao: 26, teste: "carisma", dificuldade: 16 }
        ]
      },

      24: {
        texto: "Sua tentativa de movimento furtivo quase funciona. Você consegue evitar a maioria dos patrulheiros, deslizando entre as sombras como um fantasma. Mas no último momento, um fragmento de pedra solta se desprende sob seu pé, criando um eco que ressoa pelo pátio silencioso. Um vigia encapuzado ergue a cabeça, seus sentidos aguçados detectando a perturbação. Ele emite um chamado gutural que desperta dois guardiões de pedra adormecidos. Estas criaturas são diferentes dos servos que você enfrentou antes - maiores, mais elaboradamente esculpidas, com runas de poder brilhando em suas superfícies rochosas. Eles se movem com propósito letal, bloqueando qualquer rota de fuga.",
        batalha: "guardiao-pedra,guardiao-pedra",
        vitoria: 19,
        derrota: 30
      },

      25: {
        texto: "As profundezas da Fortaleza revelam sua verdadeira natureza labiríntica. Você se encontra em uma antecâmara circular, iluminada por cristais que brilham com luz fria e azulada. Três portas se erguem diante de você, cada uma marcada com símbolos distintos e exalando uma aura diferente. A Porta de Ferro pulsa com energia bruta, suas dobradiças gemendo com poder contido. A Porta de Argila sussurra com inteligência antiga, coberta de enigmas e símbolos matemáticos. A Porta das Sombras parece absorver a luz ao redor, prometendo segredos ocultos para aqueles corajosos o suficiente para abraçar a escuridão. Você sente que cada porta testará um aspecto diferente de sua alma, e a escolha que fizer determinará não apenas seu caminho, mas sua transformação.",
        opcoes: [
          { texto: "Escolher a Porta de Ferro - o caminho da força", secao: 27 },
          { texto: "Escolher a Porta de Argila - o caminho da sabedoria", secao: 28 },
          { texto: "Escolher a Porta das Sombras - o caminho do mistério", secao: 29 }
        ]
      },

      26: {
        texto: "Impulsionado pela curiosidade e confiança, você pronuncia a palavra 'Serafim' em voz alta. O efeito é imediato e aterrorizante. Sua voz ecoa através das câmaras com poder amplificado, e em resposta, uma figura angelical de pedra - que você não havia notado antes - abre olhos que brilham como estrelas. A estátua se move com graça fluida, recuando de você com algo que poderia ser medo ou respeito. Mas o poder que você invocou é instável, selvagem. Energia crua percorre seu corpo, queimando seus nervos e deixando-o temporariamente enfraquecido. Você compreende que pronunciar nomes de poder sem compreender completamente suas implicações é extremamente perigoso.",
        efeitos: [{ tipo: "energia", valor: -2 }],
        opcoes: [
          { texto: "Aproveitar o recuo da estátua para avançar", secao: 25 },
          { texto: "Recuar e repensar sua abordagem", secao: 12 }
        ]
      },

      27: {
        texto: "A Porta de Ferro se abre para uma câmara que testa os limites da resistência física e mental. No centro da sala, uma alavanca massiva de ferro negro se ergue do chão, conectada a um mecanismo complexo de engrenagens e contrapesos. Runas de força brilham ao longo de sua superfície, pulsando em ritmo com seu batimento cardíaco. O ar é denso com o peso da expectativa - você sente que esta não é apenas uma prova de força bruta, mas de determinação e vontade. A alavanca parece impossível de mover por meios normais, mas você percebe que há mais neste teste do que aparenta. Coragem e criatividade podem ser tão importantes quanto músculos.",
        opcoes: [
          { texto: "Aplicar força bruta pura na alavanca", secao: 32, teste: "habilidade", dificuldade: 15 },
          { texto: "Procurar por contrapesos ou mecanismos ocultos", secao: 33, teste: "sorte", dificuldade: 13 },
          { texto: "Reconsiderar e escolher outra porta", secao: 25 }
        ]
      },

      28: {
        texto: "A Porta de Argila revela um salão de maravilhas intelectuais e armadilhas engenhosas. As paredes são cobertas com diagramas matemáticos, fórmulas alquímicas e quebra-cabeças mecânicos que se movem e se reconfiguram constantemente. O chão é um tabuleiro gigante de xadrez, onde cada movimento errado pode ativar uma armadilha mortal. Engrenagens douradas giram no teto, criando padrões hipnóticos que desafiam a mente a encontrar ordem no caos. O ar vibra com energia intelectual, e você sente que resolver os enigmas desta câmara exigirá não apenas inteligência, mas intuição e criatividade. Cada puzzle resolvido parece desbloquear o próximo nível de complexidade.",
        opcoes: [
          { texto: "Tentar desarmar as armadilhas metodicamente", secao: 32, teste: "habilidade", dificuldade: 14 },
          { texto: "Usar o pergaminho-sussurro para revelar padrões", secao: 31, teste: "magia", dificuldade: 13 },
          { texto: "Retornar e escolher uma porta diferente", secao: 25 }
        ]
      },

      29: {
        texto: "A Porta das Sombras conduz a corredores onde a própria escuridão parece viva e malévola. Suas tochas se apagam inexplicavelmente, e você é forçado a navegar por instinto e tato. Ecos distorcidos confundem seus sentidos - passos que não são seus, sussurros em línguas mortas, risos que vêm de todas as direções ao mesmo tempo. A escuridão não é apenas ausência de luz, mas uma presença ativa que tenta desorientá-lo e quebrá-lo psicologicamente. Então, sem aviso, formas sombrias se materializam ao seu redor - sombras errantes que se alimentam de medo e desespero. Elas se movem como fumaça líquida, atacando não apenas seu corpo, mas sua própria essência espiritual.",
        batalha: "sombra-errante,sombra-errante",
        vitoria: 31,
        derrota: 30
      },

      30: {
        texto: "A escuridão o consome completamente. Seja pelas lâminas dos cultistas, pelos punhos esmagadores dos guardiões de pedra, ou pela essência vampírica das sombras errantes, sua força vital se esvai como areia entre os dedos. Suas últimas visões são das ruínas da Fortaleza de Ferro se fechando ao seu redor como uma tumba. A Coroa permanecerá selada, aguardando outro buscador mais preparado ou mais afortunado. Sua jornada termina nas cinzas de ambições antigas, mais uma alma perdida nos corredores do poder. As pedras guardarão o segredo de seu fracasso por toda a eternidade.",
        efeitos: [{ tipo: "energia", valor: -10 }],
        final: true
      },

      31: {
        texto: "Após superar os desafios através de combate, astúcia ou magia, você descobre uma câmara secreta oculta atrás de uma parede falsa. Esta sala circular é claramente um santuário, preservado por séculos de magia protetora. Cinco pedestais de mármore branco se erguem do chão, cada um sustentando um artefato diferente: um medalhão que brilha com luz interior, um pergaminho que se desenrola sozinho revelando mapas em constante mudança, um mapa gravado em metal que mostra passagens secretas, um fragmento de espada que vibra com poder latente, e um amuleto em forma de urna que pulsa com energia protetora. Você sente que estes itens foram deixados aqui propositalmente, aguardando alguém digno de encontrá-los.",
        efeitos: [
          { tipo: "item", item: "medalhao-antigo" },
          { tipo: "item", item: "pergaminho-guia" },
          { tipo: "item", item: "mapa-secreto" },
          { tipo: "item", item: "fragmento-espada" },
          { tipo: "item", item: "amuleto-urna" }
        ],
        opcoes: [
          { texto: "Coletar todos os itens e retornar", secao: 25 },
          { texto: "Estudar os itens magicamente antes de tocá-los", secao: 34, teste: "magia", dificuldade: 15 }
        ]
      },

      32: {
        texto: "Sua abordagem metódica e determinada supera o desafio mecânico. Seja através de força pura, engenhosidade técnica, ou pura persistência, você consegue ativar o mecanismo antigo. Engrenagens rangem de volta à vida após séculos de dormência, e uma câmara secreta se abre com um suspiro de ar antigo. Dentro, sobre um altar de obsidiana, repousa um pergaminho único - o Pergaminho de Comando. Mesmo sem tocá-lo, você pode ouvir sussurros emanando do pergaminho, instruções em múltiplas línguas que parecem se adaptar ao seu entendimento. Este artefato claramente possui inteligência própria e poder para influenciar o mundo ao redor.",
        efeitos: [{ tipo: "item", item: "pergaminho-comando" }],
        opcoes: [
          { texto: "Guardar cuidadosamente o pergaminho", secao: 25 },
          { texto: "Tentar ativar o pergaminho imediatamente", secao: 34, teste: "magia", dificuldade: 14 }
        ]
      },

      33: {
        texto: "Sua intuição o guia para descobrir um mecanismo oculto - um contrapeso secreto escondido atrás de uma pedra solta na parede. Quando acionado, o sistema de alavancas se reequilibra, tornando a tarefa impossível subitamente manejável. A alavanca se move com facilidade surpreendente, revelando que a verdadeira prova não era de força bruta, mas de sabedoria para encontrar soluções elegantes. Uma passagem secreta se abre, levando a uma antecâmara menor onde inscrições sobre a 'Voz' cobrem as paredes. Estas inscrições brilham com poder latente, sussurrando segredos sobre o terceiro elemento necessário para alcançar a Coroa de Ferro.",
        efeitos: [{ tipo: "item", item: "inscricao-voz" }],
        opcoes: [
          { texto: "Estudar as inscrições sobre a Voz", secao: 34, teste: "magia", dificuldade: 13 },
          { texto: "Memorizar as inscrições e continuar", secao: 29 }
        ]
      },


      34: {
  texto: "Combinando todos os artefatos e conhecimentos coletados, uma revelação se forma em sua mente como peças de um quebra-cabeça cósmico. Os itens ressoam entre si, criando uma sinfonia de poder que revela a verdade sobre a Coroa de Ferro: ela não é meramente um objeto de poder, mas um teste definitivo da alma. Três elementos são necessários - a Espada que representa Força, o Medalhão que simboliza Memória, e a Voz que encarna Vontade. Mas além disso, você compreende que a jornada em si é a verdadeira transformação. Cada desafio superado, cada escolha feita, moldou você para este momento. O ritual final aguarda, mas você sente que algo antigo e poderoso começou a despertar nas profundezas mais baixas da Fortaleza.",
  opcoes: [
    { texto: "Preparar-se mentalmente e buscar a câmara final", secao: 35 },
    { texto: "Retornar à superfície para se reagrupar", secao: 12 }
  ]
},

35: {
  texto: "No coração mais profundo da Fortaleza, você encontra uma porta diferente de todas as outras. Feita de metal negro que parece absorver luz, ela possui um entalhe circular no centro - claramente projetado para receber um dos artefatos em sua posse. Runas de poder percorrem sua superfície como veias de fogo frio, pulsando em ritmo com seu batimento cardíaco. Quando você se aproxima, a porta ressoa com um eco profundo que parece vir das próprias fundações da realidade. Algo imenso e antigo se move além desta barreira, aguardando sua decisão. Você sente que inserir qualquer item no entalhe será irreversível - o verdadeiro teste da Coroa de Ferro está prestes a começar.",
  efeitos: [{ tipo: "energia", valor: -1 }],
  opcoes: [
    { texto: "Inserir o medalhão no entalhe", secao: 36 },
    { texto: "Inserir a espada no entalhe", secao: 36 },
    { texto: "Recuar e considerar outras opções", secao: 12 }
  ]
},

36: {
  texto: "O momento em que o artefato toca o entalhe, a porta ressoa com um eco que parece atravessar dimensões. Ela se abre lentamente, revelando uma câmara circular de proporções majestosas, iluminada por uma luz dourada que emana das próprias pedras. Cinco altares de diferentes materiais se erguem em círculo perfeito: mármore branco, obsidiana negra, ouro puro, prata lunar e cristal transparente. No centro, uma figura imponente desperta de seu sono milenar - o Velho da Pedra. Seus olhos se abrem como estrelas nascendo, e quando ele se ergue, você sente o peso de eras incontáveis em seu olhar. Sua voz ecoa como montanhas falando: 'Finalmente, outro buscador chega ao coração da verdade. Mas a Coroa não se entrega facilmente - ela deve reconhecer a dignidade em sua alma.'",
  opcoes: [
    { texto: "Aproximar-se com respeito e humildade", secao: 37, teste: "carisma", dificuldade: 14 },
    { texto: "Empunhar a Espada Ferrugem defensivamente", secao: 38 },
    { texto: "Pronunciar a palavra 'Serafim' como saudação", secao: 39, requer: "palavra-serafim" }
  ]
},

37: {
  texto: "Sua postura respeitosa e humilde toca algo profundo no coração do Velho da Pedra. Ele inclina sua cabeça massiva em reconhecimento, e você sente uma onda de aprovação emanar de sua presença antiga. 'Há muito não vejo um buscador que compreende que a verdadeira força vem da humildade', sua voz ressoa com aprovação calorosa. 'A Coroa de Ferro aguarda há séculos por alguém digno, mas primeiro você deve provar seu valor através de cinco provações sagradas.' Ele gesticula para os altares ao redor. 'Cada altar testará um aspecto de sua alma. Falhe em três, e a Coroa permanecerá selada para sempre. Mas demonstre sabedoria, coragem, força, sacrifício e verdade, e ela reconhecerá sua dignidade.'",
  efeitos: [{ tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Perguntar sobre a natureza das provações", secao: 40 },
    { texto: "Examinar os cinco altares cuidadosamente", secao: 41 },
    { texto: "Expressar gratidão pela orientação", secao: 42 }
  ]
},

38: {
  texto: "A Espada Ferrugem brilha com luz renovada quando empunhada na presença do Velho da Pedra. Ele observa a lâmina com olhos que viram o nascimento de impérios, e um sorriso antigo cruza suas feições rochosas. 'Ah, a Ferrugem desperta novamente. Você carrega uma das três chaves sagradas, jovem buscador.' Sua voz carrega o peso de montanhas, mas também uma calorosa aprovação. 'Esta lâmina serviu a muitos heróis ao longo dos séculos, mas poucos a fizeram brilhar com tal intensidade. Ela reconhece em você um espírito guerreiro, mas a Coroa exige mais que força de braço. Você está preparado para os testes que virão?'",
  opcoes: [
    { texto: "Baixar a espada em sinal de respeito", secao: 37 },
    { texto: "Manter posição defensiva por precaução", secao: 43, teste: "habilidade", dificuldade: 15 },
    { texto: "Perguntar sobre as outras duas chaves", secao: 44 }
  ]
},

39: {
  texto: "A palavra 'Serafim' ecoa pela câmara com poder que faz as próprias pedras vibrarem. O Velho da Pedra recua ligeiramente, seus olhos se alargando com algo entre surpresa e cautela. 'Você conhece os nomes de poder... isso é tanto impressionante quanto perigoso, jovem buscador.' Sua voz carrega uma nota de advertência. 'Serafim foi um dos primeiros guardiões desta fortaleza, e seu nome ainda ressoa com autoridade divina. Mas cuidado - nem todos os nomes antigos devem ser pronunciados levianamente. Alguns carregam consequências que transcendem a compreensão mortal.' O ar ao redor vibra com energia residual, e você sente que despertou algo nas profundezas da fortaleza.",
  efeitos: [{ tipo: "energia", valor: -1 }],
  opcoes: [
    { texto: "Pedir desculpas pela imprudência", secao: 37 },
    { texto: "Perguntar sobre outros nomes de poder", secao: 45, teste: "magia", dificuldade: 16 },
    { texto: "Mostrar que pode controlar tal poder", secao: 46, teste: "carisma", dificuldade: 17 }
  ]
},

40: {
  texto: "O Velho da Pedra gesticula majestosamente para os cinco altares, cada um pulsando com uma energia distinta. 'Cada altar representa uma virtude fundamental que todo verdadeiro líder deve possuir', explica com voz que ecoa através dos séculos. 'O Altar da Força testará sua determinação física e mental. O da Sabedoria desafiará seu intelecto e intuição. O da Coragem medirá sua bravura diante do impossível. O do Sacrifício avaliará sua disposição para colocar outros antes de si mesmo. E finalmente, o da Verdade examinará a pureza de suas intenções.' Seus olhos brilham como estrelas antigas. 'Você deve conquistar pelo menos três para que a Coroa reconheça sua dignidade. Escolha sabiamente por onde começar.'",
  efeitos: [{ tipo: "item", item: "conhecimento-altares" }],
  opcoes: [
    { texto: "Começar pelo Altar da Força", secao: 47 },
    { texto: "Começar pelo Altar da Sabedoria", secao: 50 },
    { texto: "Começar pelo Altar da Coragem", secao: 53 }
  ]
},

41: {
  texto: "Cada altar irradia uma presença única e poderosa. O Altar da Força, esculpido em mármore branco, pulsa com energia vermelha que faz seus músculos formigarem. O da Sabedoria, feito de obsidiana negra polida, brilha com luz azul que sussurra segredos antigos. O da Coragem, moldado em ouro puro, emite uma luz dourada que aquece seu coração com determinação. O do Sacrifício, talhado em prata lunar, reflete uma luz prateada que toca sua alma com compaixão. E o da Verdade, cristalizado em quartzo transparente, irradia luz branca pura que parece ver através de todas as máscaras e pretensões. Você sente que cada escolha moldará não apenas seu destino, mas sua própria essência.",
  opcoes: [
    { texto: "Tocar o Altar da Força primeiro", secao: 47 },
    { texto: "Tocar o Altar da Sabedoria primeiro", secao: 50 },
    { texto: "Tocar o Altar do Sacrifício primeiro", secao: 56 },
    { texto: "Meditar antes de escolher", secao: 48 }
  ]
},

42: {
  texto: "Sua gratidão genuína ressoa pela câmara como música celestial. O Velho da Pedra sorri com uma calorosa aprovação que você sente até os ossos. 'Poucos buscadores reconhecem a sabedoria de aceitar orientação', ele observa com satisfação. 'Esta humildade já fala bem de seu caráter.' Ele ergue uma mão massiva em bênção. 'Permita-me oferecer um conselho que pode salvar sua vida: a Coroa não busca perfeição, mas autenticidade. Seja verdadeiro consigo mesmo em cada teste, pois ela pode sentir falsidade como um lobo sente medo.' Uma energia reconfortante flui através de você, fortalecendo tanto seu corpo quanto seu espírito para os desafios vindouros.",
  efeitos: [{ tipo: "item", item: "bencao-guardiao" }, { tipo: "energia", valor: 3 }],
  opcoes: [
    { texto: "Partir para os altares com a bênção", secao: 40 },
    { texto: "Perguntar sobre buscadores anteriores", secao: 49 }
  ]
},

43: {
  texto: "Sua postura defensiva desperta algo sombrio no Velho da Pedra. Seus olhos se estreitam, e a temperatura da câmara despenca vários graus. 'Desconfiança e paranoia não são virtudes que a Coroa valoriza', sua voz ecoa com desaprovação que faz as pedras tremerem. 'Se você não pode confiar no guardião que protege este lugar há milênios, como pode esperar que a Coroa confie em você?' Ele bate seu cajado no chão com força suficiente para rachar a pedra, e guardiões de pedra começam a emergir das paredes como pesadelos ganhando vida. 'Prove sua força através do combate, já que escolheu o caminho da violência!'",
  batalha: "guardiao-antigo,guardiao-antigo",
  vitoria: 51,
  derrota: 65
},

44: {
  texto: "O interesse do Velho da Pedra se acende como uma forja antiga ganhando vida. 'Ah, você busca compreender o mistério completo', ele murmura com aprovação crescente. 'As três chaves são: a Espada que corta através de ilusões e mentiras, revelando a verdade oculta; o Medalhão que preserva as memórias dos justos e dos caídos, lembrando-nos das lições do passado; e a Voz que desperta os adormecidos e comanda o respeito dos antigos.' Seus olhos brilham com sabedoria milenar. 'Você já possui a primeira. O segundo pode estar mais próximo do que imagina. Mas a terceira... ah, a Voz deve ser conquistada através da provação, não encontrada.' Ele aponta para os altares. 'Comece sua jornada, e talvez a Voz se revele.'",
  efeitos: [{ tipo: "item", item: "conhecimento-chaves" }],
  opcoes: [
    { texto: "Começar as provações com novo entendimento", secao: 40 },
    { texto: "Examinar o medalhão em sua posse", secao: 52 }
  ]
},

45: {
  texto: "O Velho da Pedra hesita, como se pesando cuidadosamente suas palavras. Finalmente, ele sussurra nomes que fazem o próprio ar vibrar com poder: 'Malachar, o Ambicioso, que falhou no teste final e se tornou parte da fortaleza. Vorthak, o Destruidor, cujo nome ainda desperta pesadelos nas pedras. E Serafim, o Primeiro Guardião, cuja pureza ainda protege este lugar.' Cada nome carrega peso sobrenatural, e você sente conhecimento perigoso se infiltrando em sua mente. 'Use estes nomes com extrema cautela, jovem buscador. Palavras de poder podem tanto elevar quanto destruir aqueles que as pronunciam sem sabedoria.'",
  efeitos: [{ tipo: "item", item: "nomes-poder" }],
  opcoes: [
    { texto: "Agradecer pela confiança e prosseguir", secao: 40 },
    { texto: "Perguntar especificamente sobre Malachar", secao: 54, teste: "carisma", dificuldade: 17 }
  ]
},

46: {
  texto: "Sua demonstração de controle sobre forças arcanas impressiona profundamente o Velho da Pedra. Energia mágica dança ao redor de seus dedos como chamas domesticadas, e você pronuncia palavras de poder com precisão que ecoa através das eras. 'Impressionante', ele admite com respeito genuíno. 'Poucos mortais conseguem canalizar tais forças sem serem consumidos por elas. Você possui não apenas poder, mas a disciplina para controlá-lo.' Sua aprovação se manifesta como uma aura dourada que o envolve. 'Esta demonstração conta como uma vitória parcial no Altar da Sabedoria. Você compreende que verdadeiro poder vem do autocontrole.'",
  efeitos: [{ tipo: "item", item: "demonstracao-poder" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Usar esta vantagem nos testes vindouros", secao: 40 },
    { texto: "Mostrar humildade apesar do elogio", secao: 42 }
  ]
},

47: {
  texto: "O Altar da Força se ergue diante de você como um monumento à determinação humana. Quando você se aproxima, uma pedra colossal se materializa - um bloco de granito negro que deve pesar várias toneladas. Runas de poder percorrem sua superfície, pulsando com energia vermelha que sincroniza com seu batimento cardíaco. 'A força verdadeira', ecoa a voz do Velho da Pedra, 'não reside apenas nos músculos, mas na vontade inquebrantável de perseverar quando tudo parece impossível.' O desafio é claro: mover esta pedra que desafia as leis da física. Mas você sente que há múltiplas formas de demonstrar força - física, mental, e espiritual.",
  opcoes: [
    { texto: "Aplicar força física bruta", secao: 58, teste: "habilidade", dificuldade: 16 },
    { texto: "Usar a Espada Ferrugem como alavanca", secao: 59, requer: "espada-ferrugem" },
    { texto: "Procurar por mecanismos ocultos", secao: 60, teste: "sorte", dificuldade: 14 },
    { texto: "Tentar mover com força de vontade pura", secao: 61, teste: "carisma", dificuldade: 18 }
  ]
},

48: {
  texto: "Você se senta em posição de lótus no centro da câmara, fechando os olhos e permitindo que sua consciência se expanda. A meditação revela camadas de significado ocultas nos altares - cada um não é apenas um teste, mas uma oportunidade de crescimento espiritual. Você vê visões de buscadores anteriores: alguns que falharam por arrogância, outros por covardia, e poucos que triunfaram através da autenticidade genuína. A Coroa de Ferro se revela não como um prêmio a ser conquistado, mas como uma responsabilidade a ser aceita. Quando abre os olhos, você sente uma clareza mental que não possuía antes, e uma compreensão mais profunda do que realmente está em jogo.",
  efeitos: [{ tipo: "item", item: "sabedoria-meditacao" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Começar pelos altares com nova perspectiva", secao: 40 },
    { texto: "Compartilhar suas visões com o Velho", secao: 55 }
  ]
},

49: {
  texto: "Os olhos do Velho da Pedra se tornam distantes, como se estivesse vendo através de séculos de memórias. 'Muitos vieram antes de você', ele começa com voz carregada de melancolia. 'Guerreiros orgulhosos que acreditavam que força bruta bastaria. Magos arrogantes que pensavam que conhecimento arcano era suficiente. Nobres que esperavam que linhagem os tornasse dignos.' Ele aponta para estátuas que você não havia notado antes - figuras de pedra espalhadas pela câmara. 'Todos falharam porque buscavam a Coroa para si mesmos, não para servir outros. Malachar foi o mais próximo do sucesso, mas sua ambição final o condenou.' Suas palavras carregam o peso de tragédias incontáveis.",
  efeitos: [{ tipo: "item", item: "historia-buscadores" }],
  opcoes: [
    { texto: "Prometer ser diferente dos anteriores", secao: 40 },
    { texto: "Perguntar sobre o destino de Malachar", secao: 54 }
  ]
},

50: {
  texto: "O Altar da Sabedoria pulsa com energia azul hipnótica quando você se aproxima. Símbolos matemáticos e filosóficos começam a aparecer no ar ao redor, formando equações que desafiam a compreensão mortal. Uma voz etérea sussurra um enigma que ecoa através das dimensões: 'Eu sou o que cresce quando dividido, diminuo quando somado, e permaneço inalterado quando multiplicado por qualquer número. Sou mais poderoso nas mãos dos humildes e mais fraco nas garras dos arrogantes. O que sou?' As palavras vibram com poder arcano, e você sente que a resposta correta não virá apenas do intelecto, mas da compreensão profunda da natureza da existência.",
  opcoes: [
    { texto: "Responder 'Conhecimento'", secao: 62 },
    { texto: "Responder 'Sabedoria'", secao: 63 },
    { texto: "Responder 'Humildade'", secao: 64 },
    { texto: "Usar o pergaminho-sussurro para ajuda", secao: 57, requer: "pergaminho-sussurro" }
  ]
},

51: {
  texto: "Após derrotar os guardiões através de pura habilidade marcial, você permanece ofegante mas vitorioso no centro da câmara. O Velho da Pedra observa com uma mistura de aprovação e tristeza. 'Você provou sua força através do combate', ele reconhece com um aceno solene. 'Mas lembre-se - a violência deve sempre ser o último recurso, não o primeiro.' Apesar de suas palavras de cautela, você sente que passou no primeiro teste. O Altar da Força se ilumina com luz vermelha brilhante, reconhecendo sua vitória. 'Um altar conquistado', murmura o guardião. 'Mas os próximos testes exigirão mais que força de braço.'",
  efeitos: [{ tipo: "item", item: "selo-forca" }, { tipo: "energia", valor: -2 }],
  opcoes: [
    { texto: "Prosseguir ao Altar da Sabedoria", secao: 50 },
    { texto: "Descansar antes do próximo teste", secao: 56 },
    { texto: "Pedir orientação sobre os próximos desafios", secao: 40 }
  ]
},

52: {
  texto: "Examinando o medalhão em sua posse com nova compreensão, você percebe detalhes que havia perdido antes. Os símbolos gravados em sua superfície não são meramente decorativos - eles contam uma história. Imagens de heróis antigos, batalhas épicas, e sacrifícios nobres se revelam quando você traça os padrões com o dedo. O medalhão pulsa com energia crescente, como se estivesse respondendo ao seu reconhecimento. Memórias que não são suas começam a fluir através de sua consciência - fragmentos de vidas vividas por portadores anteriores do medalhão. Você compreende que este artefato não apenas preserva memórias, mas as compartilha com aqueles dignos de carregá-las.",
  efeitos: [{ tipo: "item", item: "memorias-medalhao" }, { tipo: "energia", valor: 1 }],
  opcoes: [
    { texto: "Usar as memórias para guiar suas escolhas", secao: 40 },
    { texto: "Tentar comunicar com os espíritos do medalhão", secao: 53, teste: "magia", dificuldade: 15 }
  ]
},

53: {
  texto: "Concentrando sua energia mágica no medalhão, você estabelece uma conexão com as consciências adormecidas dentro dele. Vozes sussurram em sua mente - não ameaçadoras, mas orientadoras. 'Jovem buscador', fala uma voz feminina carregada de sabedoria, 'nós que viemos antes oferecemos nosso conselho. A Coroa não pode ser conquistada - apenas aceita. Demonstre não que você é forte, mas que é digno.' Outras vozes se juntam ao coro: 'Coragem não é ausência de medo, mas ação apesar dele.' 'Sabedoria é saber quando não saber é suficiente.' 'Sacrifício verdadeiro não busca reconhecimento.' As vozes se desvanecem, deixando você com uma compreensão mais profunda dos testes à frente.",
  efeitos: [{ tipo: "item", item: "conselhos-antigos" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Seguir os conselhos dos antigos", secao: 40 },
    { texto: "Agradecer aos espíritos e prosseguir", secao: 47 }
  ]
},

54: {
  texto: "O semblante do Velho da Pedra se ensombrece quando você menciona Malachar. Ele aponta para uma estátua que você não havia notado - uma figura orgulhosa em armadura elaborada, mas com expressão de desespero eterno gravada em pedra. 'Malachar, o Ambicioso', ele sussurra com tristeza profunda. 'Ele chegou mais perto da Coroa que qualquer outro em mil anos. Passou em quatro dos cinco testes com brilhantismo. Mas no teste final da Verdade, quando perguntado por que buscava a Coroa, ele respondeu com honestidade brutal: para governar e ser adorado.' O Velho balança a cabeça. 'A Coroa o transformou em pedra no mesmo instante. Ele permanece aqui como advertência - poder sem humildade é destruição certa.'",
  efeitos: [{ tipo: "item", item: "historia-malachar" }],
  opcoes: [
    { texto: "Examinar a estátua de Malachar", secao: 67, teste: "magia", dificuldade: 15 },
    { texto: "Aprender com o erro de Malachar", secao: 40 },
    { texto: "Prometer não repetir seus erros", secao: 42 }
  ]
},

55: {
  texto: "Suas visões meditativas fascinam profundamente o Velho da Pedra. Ele se inclina para frente, seus olhos brilhando com interesse genuíno. 'Poucos conseguem ver além do véu da realidade física', ele observa com admiração crescente. 'Suas visões revelam uma verdade fundamental - a Coroa de Ferro não é um objeto, mas um estado de ser. Ela representa a harmonia perfeita entre poder e responsabilidade, força e compaixão, liderança e serviço.' Ele gesticula para os altares. 'Cada teste não busca medir suas habilidades, mas revelar seu caráter verdadeiro. Continue com esta sabedoria, e você pode ser o primeiro em séculos a verdadeiramente compreender o propósito da Coroa.'",
  efeitos: [{ tipo: "item", item: "compreensao-coroa" }, { tipo: "energia", valor: 3 }],
  opcoes: [
    { texto: "Abordar os testes com nova compreensão", secao: 40 },
    { texto: "Perguntar sobre o verdadeiro propósito da Coroa", secao: 68 }
  ]
},

56: {
  texto: "O Altar do Sacrifício irradia uma energia prateada que toca sua alma com uma mistura de melancolia e esperança. Quando você se aproxima, uma visão se forma no ar - imagens de heróis ao longo da história fazendo escolhas impossíveis, colocando o bem de outros acima de suas próprias necessidades. A voz do altar sussurra diretamente em sua consciência: 'Verdadeiro sacrifício não é perda, mas transformação. O que você está disposto a entregar para que outros possam prosperar?' Vários de seus pertences começam a brilhar com luz prateada, respondendo ao poder do altar. Você sente que a escolha que fizer aqui revelará a profundidade de seu caráter mais que qualquer outro teste.",
  opcoes: [
    { texto: "Sacrificar o medalhão-selo", secao: 69, requer: "medalhao-selo" },
    { texto: "Sacrificar as moedas antigas", secao: 70, requer: "moedas-antigas" },
    { texto: "Sacrificar parte de sua energia vital", secao: 71, teste: "carisma", dificuldade: 16 },
    { texto: "Oferecer suas memórias mais preciosas", secao: 72, teste: "magia", dificuldade: 17 }
  ]
},

57: {
  texto: "O pergaminho-sussurro se desenrola em suas mãos, revelando palavras que dançam e se reorganizam diante de seus olhos. Vozes antigas sussurram a resposta diretamente em sua mente, mas junto com o conhecimento vem uma sensação de que você trapaceou ligeiramente. O altar pulsa com luz azul, reconhecendo a resposta correta, mas a intensidade é menor que deveria ser. O Velho da Pedra observa com uma expressão neutra. 'Conhecimento obtido através de atalhos tem menos valor que sabedoria conquistada através de reflexão', ele comenta suavemente. 'O altar aceita sua resposta, mas registra a fonte de seu conhecimento.'",
  efeitos: [{ tipo: "item", item: "selo-sabedoria-parcial" }],
  opcoes: [
    { texto: "Aceitar a vitória parcial e continuar", secao: 53 },
    { texto: "Confessar que usou ajuda externa", secao: 73, teste: "carisma", dificuldade: 14 },
    { texto: "Tentar resolver outro enigma sem ajuda", secao: 74 }
  ]
},

58: {
  texto: "Você se posiciona diante da pedra colossal, músculos tensionando enquanto canaliza toda sua força física. Suas mãos encontram pontos de apoio na superfície rugosa, e você empurra com tudo que tem. Por um momento aterrorizante, nada acontece - a pedra permanece imóvel como uma montanha. Mas então, lentamente, quase imperceptivelmente, ela começa a se mover. Centímetro por centímetro, sua determinação pura supera a impossibilidade física. Suor escorre por seu rosto, músculos queimam como fogo, mas você persiste. Finalmente, com um rugido de triunfo, a pedra se desloca completamente. O Altar da Força explode em luz vermelha brilhante, reconhecendo sua vitória através de pura determinação.",
  efeitos: [{ tipo: "item", item: "selo-forca" }, { tipo: "energia", valor: -3 }],
  opcoes: [
    { texto: "Descansar após o esforço hercúleo", secao: 56 },
    { texto: "Continuar imediatamente ao próximo teste", secao: 50 },
    { texto: "Celebrar a vitória com o Velho da Pedra", secao: 75 }
  ]
},

59: {
  texto: "A Espada Ferrugem vibra com poder crescente quando você a posiciona como alavanca contra a pedra colossal. No momento em que a lâmina toca a superfície rochosa, runas de força se acendem ao longo de seu fio, e você sente a arma canalizar e amplificar sua própria força. Com a espada como extensão de sua vontade, a pedra impossível se move com surpreendente facilidade. Mais que isso - a própria espada se transforma no processo, sua lâmina brilhando com nova intensidade e poder. Você compreende que a verdadeira força não vem apenas de músculos, mas da harmonia entre guerreiro e arma, vontade e ferramenta.",
  efeitos: [{ tipo: "item", item: "selo-forca" }, { tipo: "item", item: "espada-desperta" }],
  opcoes: [
    { texto: "Examinar as mudanças na espada", secao: 76 },
    { texto: "Continuar aos próximos testes", secao: 50 },
    { texto: "Agradecer à espada pela parceria", secao: 77 }
  ]
},

60: {
  texto: "Sua intuição o guia para examinar a base da pedra colossal, onde você descobre um mecanismo engenhoso oculto por séculos de poeira e negligência. Runas de ativação brilham fracamente quando tocadas na sequência correta, revelando que a verdadeira prova não era de força bruta, mas de sabedoria para encontrar soluções elegantes. Quando o mecanismo se ativa, a pedra se move sozinha, flutuando graciosamente para o lado como se não pesasse nada. O Altar da Força brilha com aprovação, reconhecendo que você demonstrou a forma mais elevada de força - a inteligência para superar obstáculos impossíveis através de compreensão em vez de violência.",
  efeitos: [{ tipo: "item", item: "selo-forca" }, { tipo: "energia", valor: 1 }],
  opcoes: [
    { texto: "Memorizar o padrão das runas", secao: 78 },
    { texto: "Procurar mecanismos similares em outros altares", secao: 79 },
    { texto: "Prosseguir confiante ao próximo teste", secao: 50 }
  ]
},

61: {
  texto: "Fechando os olhos e concentrando toda sua força de vontade, você estende as mãos em direção à pedra colossal sem tocá-la fisicamente. Energia pura flui através de seu ser, manifestando-se como poder telecinético que desafia as leis da física. A pedra começa a tremer, depois a levitar, respondendo não à força muscular, mas à pura determinação de sua alma. É o teste mais difícil que você já enfrentou - manter tal concentração enquanto move um objeto de várias toneladas através de força de vontade pura. Quando finalmente consegue, você sente que transcendeu limitações mortais normais.",
  efeitos: [{ tipo: "item", item: "selo-forca" }, { tipo: "item", item: "despertar-psiquico" }, { tipo: "energia", valor: -1 }],
  opcoes: [
    { texto: "Explorar seus novos poderes psíquicos", secao: 80 },
    { texto: "Manter humildade apesar do poder", secao: 42 },
    { texto: "Continuar aos próximos testes", secao: 50 }
  ]
},

62: {
  texto: "Sua resposta 'Conhecimento' faz o altar pulsar com luz azul, mas não da forma triunfante que você esperava. Em vez disso, a luz vacila, como se o altar estivesse considerando sua resposta. A voz etérea sussurra novamente: 'Conhecimento pode crescer quando compartilhado, mas também pode diminuir quando mal usado. Você está próximo da verdade, mas não a alcançou completamente.' O teste não falhou, mas também não foi um sucesso completo. Você sente que há uma resposta mais profunda, mais fundamental, que captura a essência verdadeira do enigma.",
  opcoes: [
    { texto: "Tentar novamente com 'Sabedoria'", secao: 63 },
    { texto: "Tentar novamente com 'Humildade'", secao: 64 },
    { texto: "Aceitar a resposta parcial e continuar", secao: 81 },
    { texto: "Meditar sobre o significado mais profundo", secao: 82, teste: "magia", dificuldade: 15 }
  ]
},

63: {
  texto: "A palavra 'Sabedoria' ressoa através da câmara com poder crescente. O Altar da Sabedoria explode em luz azul brilhante, reconhecendo a verdade em sua resposta. 'Correto!', ecoa a voz etérea com aprovação calorosa. 'Sabedoria cresce quando compartilhada, diminui quando guardada egoisticamente, e permanece constante quando aplicada com humildade. É o mais poderoso nas mãos daqueles que reconhecem suas próprias limitações.' Conhecimento arcano flui através de sua mente, expandindo sua compreensão não apenas de magia, mas da natureza fundamental da existência. Você sente que passou no teste não apenas através de intelecto, mas através de compreensão genuína.",
  efeitos: [{ tipo: "item", item: "selo-sabedoria" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Prosseguir ao Altar da Coragem", secao: 83 },
    { texto: "Tentar o Altar da Verdade", secao: 84 },
    { texto: "Compartilhar a sabedoria com o Velho", secao: 85 }
  ]
},

64: {
  texto: "Sua resposta 'Humildade' faz o altar brilhar com uma luz azul suave e calorosa. A voz etérea sussurra com aprovação profunda: 'Uma resposta sábia, jovem buscador. Humildade é verdadeiramente o que cresce quando dividida, diminui quando acumulada, e permanece pura quando multiplicada por qualquer experiência.' O altar reconhece não apenas a correção de sua resposta, mas a sabedoria de coração que a inspirou. 'Você compreende que verdadeira sabedoria começa com o reconhecimento de nossa própria ignorância.' Energia serena flui através de você, trazendo não apenas conhecimento, mas paz interior.",
  efeitos: [{ tipo: "item", item: "selo-sabedoria" }, { tipo: "item", item: "coracao-humilde" }, { tipo: "energia", valor: 3 }],
  opcoes: [
    { texto: "Continuar com humildade renovada", secao: 83 },
    { texto: "Agradecer pela lição", secao: 42 },
    { texto: "Meditar sobre o significado da humildade", secao: 86 }
  ]
},

65: {
  texto: "A escuridão o consome completamente, seja através das lâminas dos guardiões antigos, da exaustão total de suas forças, ou da rejeição final da própria Coroa de Ferro. Sua última visão é do Velho da Pedra balançando a cabeça com tristeza infinita. 'Nem todos estão destinados a carregar tal fardo', sua voz ecoa como um lamento através das dimensões. 'Que sua alma encontre paz no além, e que outro mais preparado venha em seu lugar.' As pedras da Fortaleza de Ferro se fecham ao seu redor como uma tumba eterna, guardando o segredo de mais um buscador que ousou sonhar com poder além de sua capacidade. A Coroa permanece selada, aguardando alguém verdadeiramente digno de sua responsabilidade cósmica.",
  efeitos: [{ tipo: "energia", valor: -10 }],
  final: true
},

66: {
  texto: "As moedas antigas se dissolvem no altar como açúcar na chuva, cada uma liberando memórias de épocas passadas - reis justos, comerciantes honestos, e heróis esquecidos que as carregaram. Você sente que ofereceu não apenas riqueza material, mas a história e o legado de gerações inteiras. O Altar do Sacrifício pulsa com luz prateada crescente, reconhecendo que você compreende o verdadeiro valor do que entregou. 'Riqueza material é transitória', sussurra uma voz antiga, 'mas o sacrifício feito com propósito nobre ecoa através da eternidade.' Você sente uma leveza espiritual, como se um peso invisível tivesse sido removido de seus ombros.",
  efeitos: [{ tipo: "item", item: "selo-sacrificio" }],
  opcoes: [
    { texto: "Continuar ao último altar", secao: 69 },
    { texto: "Refletir sobre o significado do sacrifício", secao: 73 }
  ]
},

67: {
  texto: "Você coloca as mãos sobre seu coração e oferece parte de sua própria força vital ao altar. Dor intensa percorre seu corpo como fogo líquido, mas junto com ela vem uma compreensão profunda - você está literalmente dando parte de si mesmo para que outros possam prosperar. O Altar do Sacrifício brilha com luz prateada cegante, reconhecendo o verdadeiro sacrifício. Sua determinação impressiona até mesmo o Velho da Pedra, que observa com respeito renovado. 'Poucos têm coragem para oferecer sua própria essência', ele murmura com admiração. 'Este é o sacrifício mais puro - dar de si mesmo sem expectativa de retorno.'",
  efeitos: [{ tipo: "item", item: "selo-sacrificio" }, { tipo: "energia", valor: -3 }],
  opcoes: [
    { texto: "Continuar apesar da fraqueza", secao: 69 },
    { texto: "Pedir ajuda ao Velho", secao: 74 }
  ]
},

68: {
  texto: "O Velho da Pedra se inclina para frente, seus olhos brilhando com uma luz que parece vir de estrelas distantes. 'A Coroa de Ferro não foi criada para conceder poder, mas para testá-lo', ele revela com voz carregada de séculos de sabedoria. 'Ela é um espelho da alma, refletindo a verdadeira natureza daqueles que a buscam. Aqueles movidos por ambição encontram apenas destruição. Mas aqueles guiados por compaixão e senso de dever... eles descobrem que a Coroa não é um fardo, mas uma extensão de quem já são.' Ele gesticula para a câmara ao redor. 'Este lugar inteiro é um teste - cada escolha, cada ação, cada pensamento é avaliado. A Coroa já sabe se você é digno; os testes apenas revelam essa verdade para você mesmo.'",
  efeitos: [{ tipo: "item", item: "proposito-coroa" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Abordar os testes finais com nova compreensão", secao: 40 },
    { texto: "Perguntar sobre sua própria dignidade", secao: 87 }
  ]
},

69: {
  texto: "Ao sacrificar o medalhão-selo, você sente como se estivesse entregando uma parte de sua própria história. O artefato se dissolve em luz prateada que é absorvida pelo altar, e com ele vão as memórias e conexões que havia formado. Mas em troca, você sente uma conexão profunda e inexplicável com a própria Coroa de Ferro, como se ela reconhecesse seu sacrifício e o aprovasse. O Altar do Sacrifício pulsa com energia crescente, e você compreende que abrir mão de algo precioso para um bem maior é a essência do verdadeiro sacrifício. O Velho da Pedra observa com aprovação silenciosa, reconhecendo a profundidade de sua escolha.",
  efeitos: [{ tipo: "item", item: "selo-sacrificio" }],
  opcoes: [
    { texto: "Sentir a perda mas continuar com determinação", secao: 84 },
    { texto: "Questionar se foi a escolha certa", secao: 72 }
  ]
},

70: {
  texto: "O Velho da Pedra observa sua confissão com olhos que brilham de aprovação. 'A honestidade é uma virtude rara entre os buscadores de poder', ele comenta com uma voz calorosa que ecoa pela câmara. 'Muitos tentariam esconder o uso de ajuda externa, mas você escolheu a verdade sobre a aparência de sucesso.' Ele ergue uma mão em bênção. 'Esta honestidade vale mais que qualquer vitória obtida através de engano. O altar reconhece não apenas sua resposta correta, mas a integridade com que a obteve.' Uma luz dourada o envolve, e você sente que ganhou algo muito mais valioso que um simples selo - ganhou respeito genuíno.",
  efeitos: [{ tipo: "item", item: "selo-sabedoria" }, { tipo: "item", item: "bencao-honestidade" }],
  opcoes: [
    { texto: "Agradecer e continuar humildemente", secao: 83 },
    { texto: "Prometer ser sempre honesto daqui em diante", secao: 84 }
  ]
},


71: {
  texto: "O Velho revela a verdade: 'A Coroa não é um objeto de poder, mas um teste de caráter. Ela escolhe aqueles dignos de proteger este mundo.' Uma passagem secreta se abre.",
  efeitos: [{ tipo: "item", item: "verdade-coroa" }],
  opcoes: [
    { texto: "Entrar na passagem com todos os selos", secao: 79, requer: "selo-forca" },
    { texto: "Questionar o Velho sobre sua identidade", secao: 80 },
    { texto: "Recusar a responsabilidade e partir", secao: 81 }
  ]
},

72: {
  texto: "Suas dúvidas fazem o altar tremer. 'Sacrifício sem convicção não tem valor', ecoa uma voz. Você deve escolher novamente.",
  opcoes: [
    { texto: "Reafirmar sua escolha com determinação", secao: 65 },
    { texto: "Tentar um sacrifício diferente", secao: 67 },
    { texto: "Abandonar este altar", secao: 69 }
  ]
},

73: {
  texto: "Você compreende que riqueza material é ilusória comparada ao crescimento espiritual. Esta sabedoria ressoa através da câmara.",
  efeitos: [{ tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Aplicar esta lição ao altar final", secao: 69 },
    { texto: "Compartilhar insight com o Velho", secao: 64 }
  ]
},

74: {
  texto: "O Velho toca seu ombro. Energia vital flui de volta. 'Aqueles que sacrificam por outros merecem compaixão.' Você se sente renovado.",
  efeitos: [{ tipo: "energia", valor: 5 }],
  opcoes: [
    { texto: "Agradecer e continuar fortalecido", secao: 69 },
    { texto: "Perguntar sobre a natureza da compaixão", secao: 82 }
  ]
},

75: {
  texto: "Sua arrogância desperta algo sombrio. Sombras de antigos fracassados emergem das paredes, sussurrando sobre poder corrompido.",
  batalha: "sombra-malachar,sombra-antiga,sombra-antiga",
  vitoria: 83,
  derrota: 84
},

76: {
  texto: "Sua resposta faz o altar pulsar vermelho sangue. 'Poder sem sabedoria é destruição.' A Coroa rejeita você violentamente.",
  efeitos: [{ tipo: "energia", valor: -5 }],
  opcoes: [
    { texto: "Tentar novamente com humildade", secao: 77 },
    { texto: "Insistir que merece poder", secao: 85, teste: "carisma", dificuldade: 20 },
    { texto: "Aceitar a rejeição e partir", secao: 86 }
  ]
},

77: {
  texto: "O altar brilha dourado. 'Proteção dos inocentes é nobre, mas você está preparado para o peso desta responsabilidade?' A Coroa se materializa.",
  efeitos: [{ tipo: "item", item: "selo-verdade" }],
  opcoes: [
    { texto: "Aceitar a responsabilidade completamente", secao: 87 },
    { texto: "Admitir incerteza mas disposição para aprender", secao: 88 },
    { texto: "Pedir tempo para considerar", secao: 89 }
  ]
},

78: {
  texto: "Sua honestidade sobre buscar compreensão ressoa profundamente. 'Conhecer a si mesmo é o primeiro passo para a sabedoria.' O altar aceita.",
  efeitos: [{ tipo: "item", item: "selo-verdade" }, { tipo: "energia", valor: 3 }],
  opcoes: [
    { texto: "Aproximar-se da Coroa com humildade", secao: 87 },
    { texto: "Meditar sobre o significado", secao: 90 }
  ]
},

79: {
  texto: "Com todos os cinco selos, você entra na Câmara da Coroa. Ela flutua no centro, irradiando poder antigo. Três caminhos se abrem diante dela.",
  opcoes: [
    { texto: "Caminho da Força - tomar a Coroa diretamente", secao: 91 },
    { texto: "Caminho da Sabedoria - estudar a Coroa primeiro", secao: 92 },
    { texto: "Caminho da Humildade - ajoelhar-se diante dela", secao: 93 }
  ]
},

80: {
  texto: "O Velho sorri e sua forma muda. 'Eu sou o primeiro guardião, aquele que passou no teste há mil anos. Agora guio outros.' Sua verdadeira natureza se revela.",
  efeitos: [{ tipo: "item", item: "identidade-guardiao" }],
  opcoes: [
    { texto: "Perguntar sobre outros guardiões", secao: 94 },
    { texto: "Pedir orientação para o teste final", secao: 95 },
    { texto: "Expressar gratidão por sua orientação", secao: 96 }
  ]
},

81: {
  texto: "Você escolhe partir. O Velho assente tristemente. 'Nem todos estão prontos. A Fortaleza permanecerá até que alguém digno apareça.' Você sai em paz.",
  efeitos: [{ tipo: "energia", valor: 5 }],
  final: true
},

82: {
  texto: "O Velho explica: 'Compaixão é força que cura, não destrói. A Coroa amplifica o que há em seu coração.' Você compreende a responsabilidade.",
  efeitos: [{ tipo: "item", item: "licao-compaixao" }],
  opcoes: [
    { texto: "Levar esta lição ao teste final", secao: 69 },
    { texto: "Praticar compaixão com os derrotados", secao: 97 }
  ]
},

83: {
  texto: "Após derrotar as sombras do passado, você compreende que o orgulho pode ser superado. As sombras sussurram perdão antes de se desfazerem.",
  efeitos: [{ tipo: "item", item: "perdao-sombras" }, { tipo: "energia", valor: -2 }],
  opcoes: [
    { texto: "Aprender humildade com a experiência", secao: 69 },
    { texto: "Continuar confiante mas cauteloso", secao: 98 }
  ]
},

84: {
  texto: "As sombras o consomem. Você se torna mais uma advertência para futuros buscadores. Sua arrogância selou seu destino.",
  efeitos: [{ tipo: "energia", valor: -10 }],
  final: true
},

85: {
  texto: "Sua insistência desperta a ira da Coroa. Energia destrutiva o atinge. Você sobrevive, mas aprende uma lição dolorosa sobre humildade.",
  efeitos: [{ tipo: "energia", valor: -7 }],
  opcoes: [
    { texto: "Aceitar a lição e tentar novamente", secao: 77 },
    { texto: "Partir derrotado mas vivo", secao: 86 }
  ]
},

86: {
  texto: "Você aceita que não está pronto. A Fortaleza o liberta, mas você carrega a marca do fracasso. Talvez um dia retorne mais sábio.",
  efeitos: [{ tipo: "item", item: "marca-fracasso" }],
  final: true
},

87: {
  texto: "Ao aceitar completamente, a Coroa desce até você. Ela é pesada, mas você sente que pode carregá-la. Poder e responsabilidade fluem através de você.",
  efeitos: [{ tipo: "item", item: "coroa-ferro" }, { tipo: "energia", valor: 10 }],
  opcoes: [
    { texto: "Usar o poder para proteger o mundo", secao: 99 },
    { texto: "Buscar outros para dividir a responsabilidade", secao: 100 },
    { texto: "Estabelecer-se como novo guardião", secao: 101 }
  ]
},

88: {
  texto: "Sua honestidade sobre incerteza impressiona a Coroa. 'Sabedoria é saber que não se sabe tudo.' Ela aceita você como aprendiz.",
  efeitos: [{ tipo: "item", item: "coroa-aprendiz" }, { tipo: "energia", valor: 7 }],
  opcoes: [
    { texto: "Começar jornada de aprendizado", secao: 102 },
    { texto: "Pedir orientação ao Velho", secao: 103 },
    { texto: "Explorar seus novos poderes", secao: 104 }
  ]
},

89: {
  texto: "A Coroa aguarda pacientemente. 'Tempo é luxo que poucos têm, mas sabedoria que muitos precisam.' Você tem um momento para refletir.",
  opcoes: [
    { texto: "Decidir aceitar após reflexão", secao: 87 },
    { texto: "Decidir que precisa de mais experiência", secao: 105 },
    { texto: "Pedir um sinal de orientação", secao: 106, teste: "magia", dificuldade: 16 }
  ]
},

90: {
  texto: "Em meditação, você vê visões do futuro: guerras, paz, sofrimento, alegria. Tudo dependendo das escolhas de quem porta a Coroa.",
  efeitos: [{ tipo: "item", item: "visoes-futuro" }],
  opcoes: [
    { texto: "Aceitar o fardo das escolhas", secao: 87 },
    { texto: "Buscar forma de dividir o peso", secao: 107 }
  ]
},

91: {
  texto: "Você tenta tomar a Coroa pela força. Ela queima suas mãos e o repele. 'Força sem sabedoria é destruição', ecoa uma voz antiga.",
  efeitos: [{ tipo: "energia", valor: -4 }],
  opcoes: [
    { texto: "Tentar abordagem mais sábia", secao: 92 },
    { texto: "Mostrar humildade", secao: 93 },
    { texto: "Insistir com mais força", secao: 108, teste: "habilidade", dificuldade: 18 }
  ]
},

92: {
  texto: "Você estuda a Coroa cuidadosamente. Runas revelam sua história: criada para proteger, não dominar. Compreensão flui através de você.",
  efeitos: [{ tipo: "item", item: "conhecimento-coroa" }, { tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Aproximar-se com nova compreensão", secao: 93 },
    { texto: "Compartilhar conhecimento com o Velho", secao: 109 }
  ]
},

93: {
  texto: "Sua humildade ressoa através da câmara. A Coroa desce gentilmente, reconhecendo um coração puro. Você sente sua aceitação.",
  efeitos: [{ tipo: "energia", valor: 5 }],
  opcoes: [
    { texto: "Aceitar a Coroa com gratidão", secao: 87 },
    { texto: "Perguntar se você é verdadeiramente digno", secao: 110 }
  ]
},

94: {
  texto: "O Guardião explica: 'Há outros como eu espalhados pelo mundo, protegendo segredos antigos. Você pode se juntar a nós ou seguir seu próprio caminho.'",
  efeitos: [{ tipo: "item", item: "conhecimento-guardioes" }],
  opcoes: [
    { texto: "Escolher juntar-se aos Guardiões", secao: 111 },
    { texto: "Seguir caminho independente", secao: 87 },
    { texto: "Pedir tempo para decidir", secao: 112 }
  ]
},

95: {
  texto: "O Guardião oferece conselho final: 'A Coroa testará não apenas sua força, mas sua alma. Seja verdadeiro consigo mesmo.'",
  efeitos: [{ tipo: "item", item: "conselho-final" }],
  opcoes: [
    { texto: "Seguir o conselho ao enfrentar a Coroa", secao: 79 },
    { texto: "Agradecer e confiar em si mesmo", secao: 113 }
  ]
},

96: {
  texto: "Sua gratidão toca o Guardião. 'Poucos reconhecem a ajuda recebida. Isso fala bem de seu caráter.' Ele abençoa sua jornada.",
  efeitos: [{ tipo: "item", item: "bencao-guardiao" }, { tipo: "energia", valor: 3 }],
  opcoes: [
    { texto: "Partir para o teste final abençoado", secao: 79 },
    { texto: "Pedir uma última orientação", secao: 95 }
  ]
},

97: {
  texto: "Você mostra compaixão pelas sombras derrotadas, oferecendo palavras de paz. Elas sussurram gratidão antes de encontrar descanso.",
  efeitos: [{ tipo: "item", item: "paz-sombras" }, { tipo: "energia", valor: 4 }],
  opcoes: [
    { texto: "Levar esta compaixão ao teste final", secao: 69 },
    { texto: "Meditar sobre o poder da compaixão", secao: 114 }
  ]
},

98: {
  texto: "Equilibrando confiança e cautela, você se aproxima do teste final. Esta experiência o amadureceu significativamente.",
  efeitos: [{ tipo: "energia", valor: 2 }],
  opcoes: [
    { texto: "Enfrentar a Coroa com equilíbrio", secao: 79 },
    { texto: "Refletir mais sobre as lições aprendidas", secao: 115 }
  ]
},

99: {
  texto: "Com a Coroa, você se torna um protetor do mundo. Sua primeira missão: selar a Fortaleza para que outros não sejam tentados pelo poder. FINAL HEROICO.",
  efeitos: [{ tipo: "energia", valor: 15 }, { tipo: "item", item: "titulo-protetor" }],
  final: true
},

100: {
  texto: "Você busca outros dignos para compartilhar a responsabilidade. A Coroa se divide em fragmentos, cada um escolhendo um guardião. FINAL COLABORATIVO.",
  efeitos: [{ tipo: "energia", valor: 12 }, { tipo: "item", item: "fragmento-coroa" }],
  final: true
},

101: {
  texto: "Você se torna o novo Guardião da Fortaleza, guiando futuros buscadores como o Velho fez com você. O ciclo continua. FINAL GUARDIÃO.",
  efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "cajado-guardiao" }],
  final: true
},

102: {
  texto: "Como aprendiz da Coroa, você inicia uma jornada de descoberta. Há muito a aprender sobre responsabilidade e poder. FINAL APRENDIZ.",
  efeitos: [{ tipo: "energia", valor: 8 }, { tipo: "item", item: "manual-aprendiz" }],
  final: true
},

103: {
  texto: "O Velho se torna seu mentor permanente. Juntos, vocês protegem o mundo das sombras. Uma parceria poderosa nasce. FINAL MENTOR.",
  efeitos: [{ tipo: "energia", valor: 9 }, { tipo: "item", item: "alianca-mentor" }],
  final: true
},

104: {
  texto: "Explorando seus poderes, você descobre habilidades além da imaginação. Mas com grande poder vem grande responsabilidade. FINAL EXPLORADOR.",
  efeitos: [{ tipo: "energia", valor: 11 }, { tipo: "item", item: "grimorio-poder" }],
  final: true
},

105: {
  texto: "Reconhecendo que precisa de mais experiência, você parte para aventuras menores. A Coroa aguardará seu retorno maduro. FINAL SÁBIO.",
  efeitos: [{ tipo: "energia", valor: 7 }, { tipo: "item", item: "promessa-retorno" }],
  final: true
},

106: {
  texto: "Um sinal divino aparece: uma luz dourada que aponta para a Coroa. Os céus aprovam sua escolha. Você aceita com confiança renovada.",
  efeitos: [{ tipo: "item", item: "sinal-divino" }],
  opcoes: [
    { texto: "Aceitar a Coroa com bênção divina", secao: 87 }
  ]
},

107: {
  texto: "Você cria um conselho de sábios para dividir as decisões. A Coroa aceita esta sabedoria coletiva. FINAL CONSELHO.",
  efeitos: [{ tipo: "energia", valor: 13 }, { tipo: "item", item: "selo-conselho" }],
  final: true
},

108: {
  texto: "Sua insistência na força quebra algo dentro de você. A Coroa o rejeita permanentemente. Você parte ferido mas vivo. FINAL REJEITADO.",
  efeitos: [{ tipo: "energia", valor: -8 }, { tipo: "item", item: "cicatriz-rejeicao" }],
  final: true
},

109: {
  texto: "Compartilhar conhecimento com o Guardião cria uma nova tradição de sabedoria. Vocês se tornam co-guardiões. FINAL SABEDORIA.",
  efeitos: [{ tipo: "energia", valor: 14 }, { tipo: "item", item: "tomo-sabedoria" }],
  final: true
},

110: {
  texto: "Sua humildade final convence a Coroa de sua dignidade. 'Aqueles que questionam sua própria dignidade são os mais dignos.' FINAL HUMILDE.",
  efeitos: [{ tipo: "energia", valor: 16 }, { tipo: "item", item: "coroa-humildade" }],
  final: true
},

111: {
  texto: "Você se junta à ordem secreta dos Guardiões. Sua primeira missão: encontrar o próximo candidato digno. FINAL ORDEM SECRETA.",
  efeitos: [{ tipo: "energia", valor: 12 }, { tipo: "item", item: "manto-guardiao" }],
  final: true
},

112: {
  texto: "Tempo para decidir se torna uma jornada de autodescoberta. Você retorna anos depois, mais sábio e pronto. FINAL JORNADA.",
  efeitos: [{ tipo: "energia", valor: 10 }, { tipo: "item", item: "diario-jornada" }],
  final: true
},

113: {
  texto: "Confiando em si mesmo, você enfrenta a Coroa sem medo. Sua autoconfiança equilibrada impressiona até os antigos. FINAL AUTOCONFIANÇA.",
  efeitos: [{ tipo: "energia", valor: 15 }, { tipo: "item", item: "aura-confianca" }],
  final: true
},

114: {
  texto: "Meditando sobre compaixão, você compreende que este é o maior poder. A Coroa reconhece um coração verdadeiramente nobre. FINAL COMPASSIVO.",
  efeitos: [{ tipo: "energia", valor: 17 }, { tipo: "item", item: "coracao-compassivo" }],
  final: true
},

115: {
  texto: "Suas reflexões finais revelam que a verdadeira vitória foi a jornada de crescimento pessoal. A Coroa é apenas um símbolo. FINAL CRESCIMENTO.",
  efeitos: [{ tipo: "energia", valor: 18 }, { tipo: "item", item: "sabedoria-interior" }],
  final: true
}

    }
  },


    
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











