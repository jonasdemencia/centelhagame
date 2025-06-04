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
