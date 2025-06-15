Arquitetura do Sistema de Masmorras
Parte 1: Engine (masmorra.js)
O engine é o núcleo do sistema de masmorras, responsável por gerenciar toda a lógica de jogo, interação com o usuário e persistência de dados.

Componentes Principais:
Integração com Firebase

Autenticação de usuários

Armazenamento de dados do jogador (inventário, energia, atributos)

Persistência do estado da masmorra

Sistema de Estado

playerState: Controla posição, salas descobertas, inventário e saúde

dungeon: Define a estrutura da masmorra (salas, corredores, inimigos)

Estados de exploração por sala (explorationState)

Sistema de Renderização

Mapa SVG com grade, salas, corredores e portas

Log de exploração com mensagens animadas

Interface de botões dinâmicos

Sistemas de Interação

Movimentação entre salas (moveToRoom)

Exploração (examineRoom, searchRoom)

Combate (createFightButton)

Interação com objetos (handlePointOfInterestClick)

Testes de atributos (testSkill, testLuck, testCharisma)

Sistema de Carregamento Dinâmico

Carrega masmorras de arquivos JSON (loadDungeonFromJSON)

Associa behaviors a salas (getRoomBehavior)

Funções de Utilidade

Rolagem de dados (rollDice)

Avaliação de condições (evaluateCondition)

Aplicação de efeitos (applyEffects)

Parte 2: Estrutura JSON
Os arquivos JSON definem a estrutura estática das masmorras e suas regras de interação.

Elementos Principais:
Metadados da Masmorra

Nome, descrição, sala inicial

Definição de Salas

Propriedades básicas: id, nome, descrição, tipo

Posicionamento: gridX, gridY, gridWidth, gridHeight

Saídas: direção, destino, estado de bloqueio

Elementos de Interação

Pontos de interesse (pointsOfInterest)

Itens coletáveis (items)

Inimigos (enemy, enemies)

NPCs (npcs)

Sistema de Eventos

Eventos de primeira visita

Eventos de exploração condicionais

Testes de atributos (sorte, habilidade, carisma)

Sistema de Estados

Estados iniciais (initial)

Condições baseadas em estados (condition)

Efeitos que modificam estados (effect)

Parte 3: Behaviors/Handlers
Os behaviors são módulos JavaScript que estendem a funcionalidade das salas com lógica personalizada.

Características Principais:
Estrutura do Behavior

initialState: Define estados iniciais da sala

handlers: Funções que respondem a eventos específicos

Handlers Disponíveis

onExamine: Chamado quando o jogador examina a sala

onSearch: Chamado quando o jogador procura na sala

onInteractWithPOI: Chamado quando o jogador interage com um ponto de interesse

onFirstVisit: Chamado na primeira visita à sala

onBossTrigger: Controle especial para encontros com chefes

onDialogueOption: Chamado quando o jogador escolhe uma opção de diálogo

Contexto Fornecido aos Handlers

Referência à sala atual (room)

Estado do jogador (playerState)

Funções de utilidade (addLogMessage, createCollectButton, etc.)

Dados específicos do evento (ponto de interesse, opção de diálogo, etc.)

Integração com o Engine

Os behaviors são carregados pelo getRoomBehavior

O engine chama os handlers apropriados em momentos específicos

Os handlers podem retornar true para indicar que trataram o evento completamente




Guia Completo do Sistema de Masmorras
1. Padrões de Comunicação e Fluxo de Dados
Ciclo de Vida dos Eventos
Sequência de Processamento:

Evento UI (clique em botão) → Engine (masmorra.js) → Behavior (se existir) → Estado (atualização) → UI (feedback visual)

Ordem de Prioridade:

Behaviors têm prioridade sobre lógica JSON

Handlers retornam true quando tratam completamente um evento

Quando um handler retorna false ou não existe, o engine usa a lógica padrão

Propagação de Estado:

Alterações de estado são salvas em room.explorationState

Estados são persistidos no Firestore via savePlayerState()

Estados controlam condições em JSON via evaluateCondition()

2. Pontos de Falha Comuns
Problemas de Escopo em Behaviors:

Funções não disponíveis no contexto passado aos handlers

Tentativas de acessar funções globais como addItemToInventory sem passar pelo contexto

Uso de window para acessar funções que não estão expostas globalmente

Erros de Sincronização:

Descompasso entre estado local e Firestore

Tentativas de usar playerData antes de carregado completamente

Modificações de DOM antes dos elementos estarem prontos

Conflitos entre JSON e Behaviors:

Behaviors e JSON tentando controlar o mesmo aspecto da sala

Condições em JSON não refletindo mudanças feitas por behaviors

Problemas com Itens e Inventário:

Inconsistências entre item.name e item.content

Chaves não reconhecidas por diferenças de formato (key-1 vs key_1)

3. Convenções de Nomenclatura
IDs e Referências:

Salas: room-1, room-2, etc.

Itens: kebab-case (iron-key, healing-potion)

Estados: camelCase (examined, doorUnlocked)

Handlers de Behavior:

onExamine: Chamado quando o jogador examina a sala

onSearch: Chamado quando o jogador procura na sala

onInteractWithPOI: Chamado quando o jogador interage com um ponto de interesse

onFirstVisit: Chamado na primeira visita à sala

onBossTrigger: Controle especial para encontros com chefes

onDialogueOption: Chamado quando o jogador escolhe uma opção de diálogo

Parâmetros de Contexto:

room: Referência à sala atual

poi: Ponto de interesse (em onInteractWithPOI)

addLogMessage: Função para adicionar mensagens ao log

createCollectButton: Função para criar botão de coleta de item

evaluateCondition: Função para avaliar condições

applyEffects: Função para aplicar efeitos

4. Dependências Implícitas
Funções Frequentemente Acessadas:

addItemToInventory: Adiciona item ao inventário do jogador

createCollectButton: Cria botão para coletar item

addLogMessage: Adiciona mensagem ao log de exploração

moveToRoom: Move o jogador para outra sala

applyDamageToPlayer: Aplica dano ao jogador

Elementos DOM Assumidos:

#action-buttons: Container para botões de ação

#exploration-log-content: Container para mensagens de log

#player-health-bar: Barra de energia do jogador

#dungeon-map: SVG do mapa da masmorra

Estados Globais Críticos:

playerState: Estado atual do jogador

playerData: Dados do jogador do Firestore

dungeon: Definição da masmorra atual

userId: ID do usuário autenticado


Parte 5: Sistema de Comandos de Voz
O sistema de comandos de voz permite interação por fala com o jogo, criando uma experiência mais imersiva e acessível.

Componentes Principais:
Inicialização e Controle
iniciarReconhecimentoVoz(): Configura e gerencia o ciclo de vida do reconhecimento de voz

Utiliza a Web Speech API (SpeechRecognition)

Implementa modo contínuo para escuta permanente

Gerencia estados de ativação/desativação

Processamento de Comandos
processarComandoVoz(texto): Interpreta o texto reconhecido e executa ações correspondentes

Detecta palavras-chave para acionar comportamentos específicos

Manipula diferentes contextos de interface (menus, diálogos)

Fornece feedback visual e textual ao jogador

Fluxo de Processamento:
Captura de áudio → Conversão para texto

Filtragem por palavra-chave de ativação ("jogo")

Extração do comando principal

Detecção de contexto da interface (menu aberto, diálogo ativo)

Mapeamento para ação correspondente

Execução da ação via simulação de clique

Feedback ao usuário

Limitações Atuais:
Reconhecimento baseado em palavras-chave simples

Sem compreensão de linguagem natural complexa

Sem memória de contexto conversacional

Respostas pré-definidas e mecânicas

Sem adaptação ao estilo de fala do jogador

Oportunidades de Melhoria:
Integração com IA generativa para processamento de linguagem natural

Narração dinâmica e contextual

Memória de interações anteriores

Diálogos mais naturais e variados

Personalização da experiência baseada no jogador

Dependências Técnicas:
Web Speech API do navegador

Estrutura DOM do jogo para manipulação de elementos

Sistema de log para feedback textual

Mapeamento entre comandos de voz e elementos de interface



Resumo Completo do Arquivo batalha.js
1. Importação e Inicialização
Importa SDKs do Firebase (app, auth, firestore).
Importa módulos do jogo: dice-ui.js (dados de dados, módulo visual de dados), monstros.js (dados e funções de monstros).
Inicializa o Firebase com as credenciais do projeto CentelhaGame.
Inicializa Firestore e autenticação.
Chama initializeModule(db) para integração do módulo de dados.
2. Utilidades e Funções Globais
a. Funções auxiliares
getUrlParameter: extrai parâmetros da URL (ex: qual monstro está sendo enfrentado).
rollDice: interpreta strings de dados (“1d6”, “2d4”, etc) e retorna resultado aleatório da rolagem.
atualizarBarraHP: atualiza visualmente (e em cor) as barras de HP do jogador e do monstro na UI.
addLogMessage e startNewTurnBlock: adicionam mensagens animadas ao log e organizam os turnos em blocos visuais.
b. Funções de persistência
updatePlayerEnergyInFirestore: atualiza a energia do jogador no Firestore.
updatePlayerExperience: atualiza a experiência (XP) do jogador no Firestore.
saveBattleState / loadBattleState: salvam/carregam o estado da batalha (HP de jogador e monstro).
markMonsterAsDefeated: marca o monstro como derrotado no Firestore, para que não retorne.
salvarDropsNoLoot: salva os itens de loot conquistados no Firestore na coleção do jogador.
3. Carregamento Inicial (DOMContentLoaded)
Limpa informações de batalha antigas do sessionStorage.
Carrega os dados do monstro a partir do sessionStorage (prioridade) ou via função (fallback).
Atualiza a interface: nome, descrição, imagem do monstro.
Inicializa variáveis de controle: HPs, turnos, blocos de turno, etc.
Prepara botões: inventário, luta, rolar iniciativa, atacar, rolar localização/dano, loot, etc.
4. Fluxo da Batalha
a. Iniciativa
Usuário clica em “Lutar”, depois “Rolar Iniciativa”.
Rolagens de d20 + habilidade para jogador e monstro.
Quem vencer começa atacando.
Empate: rola novamente.
b. Turnos
Turno do jogador:
Pode atacar corpo a corpo.
Se rolar 20 natural, ativa modo SIFER (acerto crítico): rola localização e depois bônus de dano.
Se ataque acerta (total ≥ couraça do monstro), pode rolar dano.
Após ataque, verifica se monstro morreu; se não, passa turno ao monstro.
Turno do monstro:
Monstro rola ataque contra defesa do jogador.
Aplica dano se acerta.
Atualiza HP na barra e Firestore.
Verifica morte/inconsciência do jogador.
Passa turno de volta ao jogador se ambos ainda estiverem vivos.
c. Sistema SIFER
Em acerto crítico (20 natural):
Rola localização (d20), determina bônus (metade, total, dobro do dano).
Rola dano base, depois bônus, soma e aplica ao monstro.
Mensagens detalhadas orientam o jogador.
5. Pós-Batalha (handlePostBattle)
Se monstro foi derrotado:
Calcula XP conforme o monstro.
Atualiza XP do jogador no Firestore e mostra feedback no log.
Marca monstro como derrotado no Firestore.
Determina loot (customizado ou padrão), salva no Firestore e sessionStorage.
Exibe botão para coletar loot e voltar ao mapa.
6. Sincronização e Persistência
Tudo é salvo no Firestore: HPs, XP, loot, monstros derrotados.
Estados importantes também ficam no sessionStorage para continuidade entre páginas ou recarregamentos.
7. Interface e Botões
Gerencia estados dos botões: exibe/esconde/habilita/desabilita conforme turno, morte, fim de batalha, etc.
Botões principais: Lutar, Rolar Iniciativa, Atacar Corpo a Corpo, Rolar Localização (crítico), Rolar Dano, Loot, Inventário.
8. Segurança e Fluxo de Usuário
Só permite jogar se estiver autenticado.
Se não estiver logado, redireciona para login e depois retorna para a batalha.
Se não houver personagem criado, redireciona para criação.
9. Logs
Extenso uso de console.log para facilitar debug e acompanhamento do fluxo nos consoles dos desenvolvedores.
Resumo Final para AI
O batalha.js é um módulo de combate RPG turn-based para a web, com:

Controle de combate por turnos (jogador vs monstro, com sistema de iniciativa).
Persistência de estado (HP, XP, loot, monstros derrotados) via Firestore.
Sistema de ataques críticos (SIFER) com rolagens adicionais.
Interface dinâmica: update visual, logs animados, controle de botões e estados.
Recompensas pós-batalha: XP, loot, controle de progresso.
Sincronização de dados para continuidade entre sessões e dispositivos.
Proteção por autenticação e verificação de personagem.
O código é altamente modular e orientado a eventos, fácil de expandir para novas mecânicas, monstros ou tipos de combate.
