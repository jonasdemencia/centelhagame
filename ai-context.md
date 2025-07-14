Arquitetura do Sistema de Masmorras  
Parte 1: Engine (masmorra.js)  
O engine é o núcleo do sistema de masmorras, responsável por gerenciar toda a lógica de jogo, interação com o usuário e persistência de dados.

Componentes Principais:
- Integração com Firebase
  - Autenticação de usuários
  - Armazenamento de dados do jogador (inventário, energia, atributos)
  - Persistência do estado da masmorra
- Sistema de Estado
  - playerState: Controla posição, salas descobertas, inventário e saúde
  - dungeon: Define a estrutura da masmorra (salas, corredores, inimigos)
  - Estados de exploração por sala (explorationState)
- Sistema de Renderização
  - Mapa SVG com grade, salas, corredores e portas
  - Log de exploração com mensagens animadas
  - Interface de botões dinâmicos
- Sistemas de Interação
  - Movimentação entre salas (moveToRoom)
  - Exploração (examineRoom, searchRoom)
  - Combate (createFightButton)
  - Interação com objetos (handlePointOfInterestClick)
  - Testes de atributos (testSkill, testLuck, testCharisma)
- Sistema de Carregamento Dinâmico
  - Carrega masmorras de arquivos JSON (loadDungeonFromJSON)
  - Associa behaviors a salas (getRoomBehavior)
- Funções de Utilidade
  - Rolagem de dados (rollDice)
  - Avaliação de condições (evaluateCondition)
  - Aplicação de efeitos (applyEffects)

Parte 2: Estrutura JSON  
Os arquivos JSON definem a estrutura estática das masmorras e suas regras de interação.

Elementos Principais:
- Metadados da Masmorra (nome, descrição, sala inicial)
- Definição de Salas: id, nome, descrição, tipo, gridX, gridY, gridWidth, gridHeight, saídas (direção, destino, estado de bloqueio)
- Elementos de Interação: pontos de interesse (pointsOfInterest), itens coletáveis (items), inimigos (enemy, enemies), NPCs (npcs)
- Sistema de Eventos:
  - Eventos de primeira visita
  - Eventos de exploração condicionais
  - Testes de atributos (sorte, habilidade, carisma)
- Sistema de Estados:
  - Estados iniciais (initial)
  - Condições baseadas em estados (condition)
  - Efeitos que modificam estados (effect)

Parte 3: Behaviors/Handlers  
Os behaviors são módulos JavaScript que estendem a funcionalidade das salas com lógica personalizada.

Características Principais:
- Estrutura do Behavior
  - initialState: Define estados iniciais da sala
  - handlers: Funções que respondem a eventos específicos
- Handlers Disponíveis
  - onExamine: Chamado quando o jogador examina a sala
  - onSearch: Chamado quando o jogador procura na sala
  - onInteractWithPOI: Chamado quando o jogador interage com um ponto de interesse
  - onFirstVisit: Chamado na primeira visita à sala
  - onBossTrigger: Controle especial para encontros com chefes
  - onDialogueOption: Chamado quando o jogador escolhe uma opção de diálogo
- Contexto Fornecido aos Handlers
  - Referência à sala atual (room)
  - Estado do jogador (playerState)
  - Funções de utilidade (addLogMessage, createCollectButton, etc.)
  - Dados específicos do evento (ponto de interesse, opção de diálogo, etc.)
- Integração com o Engine
  - Os behaviors são carregados pelo getRoomBehavior
  - O engine chama os handlers apropriados em momentos específicos
  - Os handlers podem retornar true para indicar que trataram o evento completamente

Guia Completo do Sistema de Masmorras  
1. Padrões de Comunicação e Fluxo de Dados
   - Ciclo de Vida dos Eventos  
     Evento UI (clique em botão) → Engine (masmorra.js) → Behavior (se existir) → Estado (atualização) → UI (feedback visual)
   - Ordem de Prioridade  
     Behaviors têm prioridade sobre lógica JSON  
     Handlers retornam true quando tratam completamente um evento  
     Quando um handler retorna false ou não existe, o engine usa a lógica padrão
   - Propagação de Estado  
     Alterações de estado são salvas em room.explorationState  
     Estados são persistidos no Firestore via savePlayerState()  
     Estados controlam condições em JSON via evaluateCondition()
2. Pontos de Falha Comuns
   - Problemas de Escopo em Behaviors
     - Funções não disponíveis no contexto passado aos handlers
     - Tentativas de acessar funções globais como addItemToInventory sem passar pelo contexto
     - Uso de window para acessar funções que não estão expostas globalmente
   - Erros de Sincronização
     - Descompasso entre estado local e Firestore
     - Tentativas de usar playerData antes de carregado completamente
     - Modificações de DOM antes dos elementos estarem prontos
   - Conflitos entre JSON e Behaviors
     - Behaviors e JSON tentando controlar o mesmo aspecto da sala
     - Condições em JSON não refletindo mudanças feitas por behaviors
   - Problemas com Itens e Inventário
     - Inconsistências entre item.name e item.content
     - Chaves não reconhecidas por diferenças de formato (key-1 vs key_1)
3. Convenções de Nomenclatura
   - IDs e Referências:
     - Salas: room-1, room-2, etc.
     - Itens: kebab-case (iron-key, healing-potion)
     - Estados: camelCase (examined, doorUnlocked)
   - Handlers de Behavior:
     - onExamine, onSearch, onInteractWithPOI, onFirstVisit, onBossTrigger, onDialogueOption
   - Parâmetros de Contexto:
     - room: Referência à sala atual
     - poi: Ponto de interesse (em onInteractWithPOI)
     - addLogMessage: Função para adicionar mensagens ao log
     - createCollectButton: Função para criar botão de coleta de item
     - evaluateCondition: Função para avaliar condições
     - applyEffects: Função para aplicar efeitos
4. Dependências Implícitas
   - Funções Frequentemente Acessadas:
     - addItemToInventory: Adiciona item ao inventário do jogador
     - createCollectButton: Cria botão para coletar item
     - addLogMessage: Adiciona mensagem ao log de exploração
     - moveToRoom: Move o jogador para outra sala
     - applyDamageToPlayer: Aplica dano ao jogador
   - Elementos DOM Assumidos:
     - #action-buttons: Container para botões de ação
     - #exploration-log-content: Container para mensagens de log
     - #player-health-bar: Barra de energia do jogador
     - #dungeon-map: SVG do mapa da masmorra
   - Estados Globais Críticos:
     - playerState: Estado atual do jogador
     - playerData: Dados do jogador do Firestore
     - dungeon: Definição da masmorra atual
     - userId: ID do usuário autenticado



### Detalhamento Completo do batalha.js – Funções, Elementos, Fluxos e Convenções

#### 1. Variáveis e Estado Global

- **Variáveis globais**:
  - `window.isPlayerTurn`: booleano indicando se é o turno do jogador.
  - `window.battleStarted`: indica se a batalha já começou.
  - `escapeAttempts`: contador de tentativas de fuga do jogador.
  - `nextTelegraphedAttack`: objeto do próximo ataque telegrafado do monstro (para mecânicas de antecipação de ataques).
  - `activeBuffs`: lista de buffs atualmente ativos no jogador, cada um com duração, tipo e nome.
  - `activeMonsterDebuffs`: lista de debuffs ativos no monstro (precisão, redução de dano etc).

- **Falhas críticas**:
  - Array de falhas críticas para rolagem 1 no dado de ataque, com mensagens e efeitos diferenciados.

- **Magias Disponíveis**:
  - Array de magias disponíveis com id, nome, descrição, custo em PM, efeito, valor associado, incluindo magias de cura, ataque, escudo, debuff e toque.

#### 2. Configuração e Inicialização do Firebase

- Importação dos SDKs necessários do Firebase (app, auth, firestore).
- Inicialização do Firebase com as credenciais do CentelhaGame.
- Inicialização do módulo de dados de dados/dados visuais (`initializeModule(db)`).

#### 3. Utilidades e Funções Globais

- **getUrlParameter**: extrai parâmetros da URL (ex: qual monstro está sendo enfrentado).
- **rollDice**: interpreta strings de dados (“1d6”, “2d4”, etc) e retorna resultado aleatório da rolagem.
- **atualizarBarraHP**: atualiza visualmente (e em cor) as barras de HP do jogador e do monstro na UI.
- **atualizarBarraMagia**: atualiza a barra de magia (PM) do jogador na interface.
- **updateBuffsDisplay**: atualiza o painel visual de buffs do jogador.
- **updateMonsterDebuffsDisplay**: atualiza o painel visual de debuffs do monstro.

#### 4. Sincronização/Persistência (Firestore)

- **updatePlayerEnergyInFirestore**: atualiza a energia do jogador no Firestore.
- **updatePlayerMagicInFirestore**: atualiza a magia do jogador no Firestore.
- **updatePlayerExperience**: atualiza a experiência (XP) do jogador no Firestore, somando valor ao XP anterior.
- **saveBattleState / loadBattleState / clearBattleState**: salva, carrega e limpa o estado da batalha atual no Firestore, incluindo HPs, buffs, debuffs, iniciativa, turno atual, etc.
- **markMonsterAsDefeated**: marca o monstro como derrotado no Firestore, para não retornar.
- **salvarDropsNoLoot**: salva os itens de loot conquistados no Firestore, na coleção do jogador.

#### 5. Carregamento Inicial

- Limpeza de informações de batalha antigas do sessionStorage.
- Carregamento do monstro do sessionStorage (prioridade) ou via função de busca.
- Atualização da interface: nome, descrição, imagem do monstro.
- Inicialização de variáveis de controle: HPs, turnos, buffs, debuffs, blocos de turno, etc.
- Preparação dos botões de inventário, luta, rolar iniciativa, atacar, rolar localização/dano, loot, magias, fuga, etc.

#### 6. Fluxo de Batalha

- **Iniciativa**:
  - O usuário clica em “Lutar”, depois “Rolar Iniciativa”.
  - São rolados d20 + habilidade para jogador e monstro.
  - Quem vencer começa atacando.
  - Em caso de empate, rola novamente.

- **Turnos (Loop Principal)**:
  - **Turno do jogador**:
    - Pode atacar corpo a corpo, usar magia, item ou ato de classe.
    - Se rolar 20 natural, ativa modo SIFER (acerto crítico): rola localização e depois bônus de dano.
    - Se ataque acerta (total ≥ couraça do monstro), pode rolar dano.
    - Após ataque, verifica se monstro morreu; se não, passa turno ao monstro.
  - **Turno do monstro**:
    - Monstro rola ataque contra defesa do jogador.
    - Aplica dano se acerta, com possibilidade de crítico.
    - Atualiza HP na barra e Firestore.
    - Verifica morte/inconsciência do jogador.
    - Passa turno de volta ao jogador se ambos ainda estiverem vivos.

#### 7. Sistema SIFER (Crítico):

- Em acerto crítico (20 natural no ataque):
  - Rola localização (d20), determina bônus (metade, total, dobro do dano).
  - Rola dano base, depois bônus, soma e aplica ao monstro.
  - Mensagens detalhadas orientam o jogador.
  - Contexto SIFER é mantido entre etapas para garantir fluxo correto.

#### 8. Pós-Batalha (handlePostBattle):

- Se monstro foi derrotado:
  - Calcula XP conforme o monstro.
  - Atualiza XP do jogador no Firestore e mostra feedback no log.
  - Marca monstro como derrotado no Firestore.
  - Determina loot (customizado ou padrão), salva no Firestore e sessionStorage.
  - Exibe botão para coletar loot e voltar ao mapa.
  - Limpa estado da batalha no Firestore e sessionStorage.
  - Reativa botões de inventário e loot.

#### 9. Interface e Botões

- Gerenciamento total dos estados dos botões:
  - Exibe, esconde, habilita e desabilita cada botão principal conforme o contexto da batalha (turno, morte, pós-luta, etc).
  - Botões principais: Lutar, Rolar Iniciativa, Atacar Corpo a Corpo, Rolar Localização (crítico), Rolar Dano, Loot, Inventário, Fuga, Magia, Itens/Ferramentas, Atos de Classe.
- Listagem detalhada de botões e painéis:
  - `#iniciar-luta`: inicia a batalha
  - `#rolar-iniciativa`: rola iniciativa
  - `#attack-options`: container de botões de ação durante o turno do jogador
  - `#atacar-corpo-a-corpo`: ataque físico
  - `#rolar-localizacao`: ativa etapa de localização do SIFER
  - `#rolar-dano`: rola dano (normal, crítico ou mágico)
  - `#loot-button`: coleta o loot após vitória
  - `#abrir-inventario`: acessa o inventário do jogador
  - `#correr-batalha`: tenta fugir da batalha
  - `#atacar-a-distancia`: abre painel de magias
  - `#itens-ferramentas`: abre painel de itens consumíveis
  - `#ato-classe`: ativa painel de atos de classe
  - `#painel-atos`, `#lista-atos`, `#fechar-painel-atos`: painel/modal de atos de classe
  - `#magias-modal`, `#magias-container`, `#usar-magia-btn`: painel/modal de magias
  - `#itens-modal`, `#itens-container`, `#usar-item-btn`: painel/modal de itens

#### 10. Sistema de Itens Consumíveis

- Carregamento dos itens consumíveis do inventário do jogador a partir do Firestore (itens no baú).
- Filtro para apenas itens consumíveis e com quantidade > 0.
- Seleção de item pelo usuário, exibição de detalhes, ativação de botão para uso.
- Ao usar item:
  - Efeito aplicado (cura, dano, efeito especial).
  - Quantidade reduzida (item removido se zerar).
  - Efeitos imediatamente aplicados na interface e atualizados no Firestore.
  - Monstro faz ataque de oportunidade após uso de item.
  - Turno passa para o monstro.

#### 11. Sistema de Magias

- Modal de seleção de magias disponíveis, cada uma com custo, efeito e nome.
- Magias implementadas:
  - Cura Menor (heal): recupera energia.
  - Dardos Místicos (damage): causa dano direto.
  - Luz (dazzle): reduz precisão do inimigo.
  - Toque Chocante (touch_attack): dano elétrico por ataque de toque.
  - Toque Macabro (touch_debuff): dano e debuff de redução de dano do monstro.
  - Escudo Arcano (shield): aumenta couraça do jogador por alguns turnos.
- Lógica de uso:
  - Checagem de PM suficiente antes de lançar magia.
  - Aplicação imediata ou por etapas (algumas magias requerem rolagem de ataque/touch).
  - Teste de resistência do monstro para magias que não sejam de toque.
  - Magias de escudo/buff/debuff são aplicadas imediatamente e controladas por duração.
  - Magias de dano e toque requerem rolagem adicional de dano/aplicação de bônus.
  - Atualização da barra de PM e persistência no Firestore.

#### 12. Sistema de Buffs e Debuffs

- Buffs aplicados ao jogador (ex: escudo arcano) aumentam defesa, têm duração em turnos e desaparecem automaticamente.
- Debuffs aplicados ao monstro (ex: luz, toque macabro) reduzem precisão ou dano, também com duração.
- Ambos são exibidos na interface, com nome e turnos restantes.
- São processados automaticamente no início de cada turno do respectivo lado (processBuffs/processMonsterDebuffs).

#### 13. Sistema de Fuga

- Botão dedicado para tentar fuga.
- Cada tentativa aumenta a dificuldade do teste.
- Teste: rolagem de d20 + habilidade do jogador vs dificuldade (25 + habilidade do monstro + penalidade por tentativas).
- Sucesso leva o jogador de volta para a masmorra.
- Falha: monstro faz ataque de oportunidade com dano reduzido.
- Estado de tentativa é controlado para evitar múltiplos cliques simultâneos.

#### 14. Sincronização e Persistência

- Todo o estado relevante da batalha (HP, buffs, debuffs, turno, habilidades, iniciativa) é salvo no Firestore e sessionStorage.
- Garantia de continuidade da batalha após recarregar página ou trocar de dispositivo.
- Loot, monstros derrotados e experiência também persistidos no Firestore.

#### 15. Pós-Batalha e Loot

- Quando o monstro é derrotado:
  - XP concedida ao jogador (valor fixo por monstro, customizável).
  - Loot pode ser customizado (via sessionStorage) ou padrão do monstro; salvo no sessionStorage para tela de loot e no Firestore.
  - Monstro marcado como derrotado na coleção do usuário.
  - Estado da batalha removido do Firestore.
  - Botões para coletar loot e voltar ao mapa exibidos.
  - Inventário desbloqueado.

#### 16. Logs e Mensagens Animadas

- Todas as ações importantes são registradas no log visual, com efeito de digitação (máquina de escrever).
- Logs aparecem em blocos por turno, com títulos (“Turno do Jogador”, “Turno do [Monstro]”, “Resultado”, etc).
- Logs detalham cada rolagem, efeito, dano, cura, ativação de buff/debuff, uso de itens/magias, etc.
- Mensagens de erro, falha crítica, acerto crítico, sucesso/falha em testes, etc, também são exibidas de forma animada.

#### 17. Segurança e Fluxo de Usuário

- Só permite jogar se estiver autenticado.
- Se não estiver logado, redireciona para login e depois retorna para a batalha.
- Se não houver personagem criado, redireciona para tela de criação.
- Checagem e inicialização dos listeners e elementos do DOM garantida após carregamento.

#### 18. Convenções Específicas do Combate

- Todas as rolagens usam `rollDice`, aceitando formatos tipo “1d6”, “2d4”, “1d8+2”, etc.
- Todos os botões são habilitados/desabilitados conforme estado do turno.
- SIFER (acerto crítico) é tratado como fluxo especial, com contexto próprio e rolagens sequenciais (localização, bônus, dano).
- Fluxo de magias de toque e debuff tem contexto próprio, aguardando ataque do jogador para aplicar efeito.
- Todas as mudanças de estado (energia, magia, buffs, debuffs, loot, XP) são sincronizadas entre interface, sessionStorage e Firestore.

#### 19. Pontos de Falha Específicos do Combate

- Sincronização de buffs/debuffs pode falhar se não processar duração corretamente após recarregamento.
- Listeners de botões devem ser reinicializados se o DOM for reconstruído.
- Sessões longas podem causar divergência entre estado local e remoto.
- Contextos especiais (SIFER, magias de toque) devem ser limpos corretamente para evitar bugs no fluxo de batalha.

---

### Exemplo de Fluxo Completo de Combate

1. Usuário acessa batalha.html com parâmetro do monstro.
2. Verificação de autenticação e carregamento do personagem.
3. Carregamento do monstro (sessionStorage ou função).
4. Exibição da interface do monstro, HP, botões iniciais.
5. Usuário clica em “Lutar”; botão de iniciativa aparece.
6. Iniciativa rolada (d20 + habilidade para ambos).
7. Vencedor da iniciativa começa o turno.
8. Turno do jogador: pode atacar, lançar magia, usar item, ato de classe ou fugir.
   - Se atacar e tirar 20: ativa SIFER, rola localização, rola bônus, aplica dano.
   - Se atacar e tirar 1: falha crítica, efeito especial, passa turno.
   - Se usar magia: checagem de PM, resistência do monstro (exceto magias de toque/escudo), aplicação do efeito, atualização de buffs/debuffs.
   - Se usar item: aplica efeito, monstro faz ataque de oportunidade, passa turno.
   - Se fugir: rola teste, pode escapar ou sofrer ataque de oportunidade.
9. Turno do monstro: escolhe ataque (baseado em HP e pesos), pode telegrafar próximo ataque, rola para acertar, aplica dano, verifica morte/inconsciência.
10. Processo de buffs e debuffs no início dos respectivos turnos.
11. Ao derrotar o monstro: experiência ganha, loot gerado, estado salvo, monstro marcado como derrotado.
12. Botões de loot e inventário ativados.
13. Estado da batalha limpo ao sair.
14. Jogador pode retornar ao mapa ou coletar loot.

---

### Notas Técnicas Finais

- Toda a lógica de combate é modular e orientada a eventos.
- Fácil de expandir para novos tipos de monstros, magias, efeitos, fluxos ou mecânicas.
- Mantém separação clara entre lógica de estado, interface e persistência.
- Suporta continuidade entre sessões, dispositivos e recarregamentos.
- Integra-se perfeitamente com o engine da masmorra e o restante do jogo.
- O arquivo batalha.js serve como referência central para toda a lógica de combate e integração de magias, buffs, debuffs, loot, XP e interface do jogador.

---

Sistema Arcanum Verbis — Condições Ambientais Globais Sincronizadas
Visão Geral:
Sistema de condições ambientais globalmente sincronizadas e dinamicamente aceleradas que mantém consistência entre todas as páginas do jogo (batalha, conjuração, ofertar descendência). Utiliza Firestore para persistência e sincronização temporal.

Arquivos do Sistema:
1. arcanum-conditions.js - Motor Global Principal

Função principal: getArcanumConditions() - sistema acelerado com cache inteligente

Persistência: Salva no Firestore com chave temporal "Data - Hora:Minuto"

Velocidades de mudança:

Período: A cada hora | Vento: A cada 30min | Clima: A cada 1h

Pressão: A cada 2h | Energia/Temperatura: A cada 1 dia

Lua: A cada 2 dias | Estação: A cada 5 dias

Cálculos: Baseados em horas/meias-horas/dias desde 01/01/2024

Exportação: window.ArcanumConditions.getConditions()

2. arcanum-ui.js - Interface Visual

Painel flutuante: Exibe condições com ícones e modificadores de conjuração

Atualização: A cada 30 segundos para capturar mudanças rápidas

Função principal: getCurrentConditions() usa sistema global

Exportação: window.ArcanumUI.initPanel()

3. batalha.js - Integração com Combate

Painel sincronizado: Inicializado via window.ArcanumUI.initPanel()

Conjuração: setupArcanumConjurationModal() usa window.ArcanumConditions.getConditions()

Modificadores: Sistema de palavras mágicas baseado nas condições

4. arcanum-spells.js - Sistema de Conjuração

Modal de conjuração: createArcanumConjurationModal() usa await getArcanumConditions()

Modificadores: Aplicação automática baseada nas condições globais

Validação: Sistema de detecção de modificadores aplicados pelo jogador

5. atrasdaultimaporta.js - Ofertar Descendência

Função global: getArcanumConditions() com sistema acelerado idêntico

Interface: criarCruzarAnimais() usa await getArcanumConditions()

Sincronização: Condições idênticas às outras páginas

Características Técnicas:
Sincronização Global:

Todas as páginas consultam a mesma fonte de dados

Cache inteligente evita recálculos desnecessários

Chave temporal garante consistência entre usuários

Performance:

Verificação de cache antes de calcular novas condições

Atualização automática apenas quando necessário

Persistência otimizada no Firestore

Integração:

Sistema de modificadores para conjuração de magias

Ícones visuais para cada condição

Interface responsiva e atualização em tempo real

Fluxo de Funcionamento:
Sistema verifica chave temporal atual (Data - Hora:Minuto)

Consulta Firestore para dados existentes da chave

Se dados existem e são atuais → retorna dados salvos

Se não existem ou expiraram → calcula novas condições

Salva novas condições no Firestore com chave temporal

Retorna condições para interface

Todas as páginas usam os mesmos dados sincronizados

Status: ✅ TOTALMENTE FUNCIONAL E SINCRONIZADO

Convenções:

Todas as funções que usam condições devem usar await getArcanumConditions()

Interfaces devem atualizar a cada 30 segundos para mudanças rápidas

Modificadores de conjuração são aplicados automaticamente baseados nas condições

Sistema é independente de backend (exceto para sincronização via Firestore)
