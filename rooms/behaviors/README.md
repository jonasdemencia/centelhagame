# Sistema de Behaviors de Salas

Esta pasta contém os comportamentos específicos de cada sala da masmorra.

## Estrutura
- `/behaviors`: Contém os arquivos de comportamento de cada sala
- `registry.js`: Registro central de todos os behaviors

## Como adicionar uma nova sala
1. Crie um novo arquivo em `/behaviors` (ex: room2.js)
2. Implemente os handlers necessários
3. Registre o behavior no registry.js

## Handlers disponíveis
- onExamine: Chamado quando o jogador examina a sala
- onSearch: Chamado quando o jogador procura na sala
- onFirstVisit: Chamado na primeira vez que o jogador entra na sala