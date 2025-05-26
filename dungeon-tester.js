// dungeon-tester.js
class DungeonTester {
  static async testAllDungeons(dungeonsList) {
    console.log("🧪 Iniciando testes de todas as masmorras...");
    const results = {
      passed: [],
      failed: []
    };

    for (const dungeonInfo of dungeonsList) {
      console.log(`\n🔍 Testando masmorra: ${dungeonInfo.name} (${dungeonInfo.id})`);
      const dungeonData = await this.loadDungeon(dungeonInfo.id);
      
      if (!dungeonData) {
        results.failed.push({id: dungeonInfo.id, name: dungeonInfo.name, errors: ["Falha ao carregar masmorra"]});
        continue;
      }
      
      const testResult = this.testDungeon(dungeonData);
      
      if (testResult.valid) {
        console.log(`✅ Masmorra ${dungeonInfo.name} passou em todos os testes!`);
        results.passed.push(dungeonInfo.id);
      } else {
        console.error(`❌ Masmorra ${dungeonInfo.name} falhou nos testes:`);
        testResult.errors.forEach(error => console.error(`  - ${error}`));
        results.failed.push({
          id: dungeonInfo.id, 
          name: dungeonInfo.name, 
          errors: testResult.errors
        });
      }
    }
    
    this.showSummary(results);
    return results;
  }
  
  static async loadDungeon(dungeonId) {
    try {
      const response = await fetch(`./dungeons/${dungeonId}.json`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao carregar masmorra ${dungeonId}:`, error);
      return null;
    }
  }
  
  static testDungeon(dungeonData) {
    const errors = [];
    
    // Teste 1: Verificação básica da estrutura
    if (!this.validateStructure(dungeonData, errors)) {
      return { valid: false, errors };
    }
    
    // Teste 2: Verificação de acessibilidade das salas
    this.validateAccessibility(dungeonData, errors);
    
    // Teste 3: Verificação de chaves e portas trancadas
    this.validateKeys(dungeonData, errors);
    
    // Teste 4: Verificação de eventos e interações
    this.validateEvents(dungeonData, errors);
    
    // Teste 5: Verificação de inimigos
    this.validateEnemies(dungeonData, errors);
    
    // Teste 6: Verificação de NPCs e diálogos
    this.validateNPCs(dungeonData, errors);
    
    // Teste 7: Verificação de pontos de interesse
    this.validatePointsOfInterest(dungeonData, errors);
    
    // Teste 8: Verificação de itens
    this.validateItems(dungeonData, errors);
    
    // Teste 9: Verificação de testes de atributos
    this.validateAttributeTests(dungeonData, errors);
    
    // Teste 10: Verificação de blocos decorativos
    this.validateDecorativeBlocks(dungeonData, errors);
    
    // Teste 11: Verificação de consistência visual
    this.validateVisualConsistency(dungeonData, errors);
    
    // Teste 12: Verificação de condições e efeitos
    this.validateConditionsAndEffects(dungeonData, errors);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static validateStructure(dungeonData, errors) {
    // Verifica campos obrigatórios da masmorra
    if (!dungeonData.name) errors.push("Masmorra sem nome");
    if (!dungeonData.description) errors.push("Masmorra sem descrição");
    if (!dungeonData.entrance) errors.push("Masmorra sem entrada");
    if (!dungeonData.rooms || Object.keys(dungeonData.rooms).length === 0) {
      errors.push("Masmorra sem salas");
      return false;
    }
    
    // Verifica se a entrada existe
    if (!dungeonData.rooms[dungeonData.entrance]) {
      errors.push(`Entrada da masmorra (${dungeonData.entrance}) não existe`);
    }
    
    // Verifica cada sala
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Verifica campos obrigatórios
      if (!room.id) errors.push(`Sala ${roomId}: sem ID`);
      if (room.id !== roomId) errors.push(`Sala ${roomId}: ID interno (${room.id}) não corresponde à chave`);
      if (!room.name) errors.push(`Sala ${roomId}: sem nome`);
      if (!room.description) errors.push(`Sala ${roomId}: sem descrição`);
      if (!room.type) errors.push(`Sala ${roomId}: sem tipo`);
      if (!["room", "corridor"].includes(room.type)) errors.push(`Sala ${roomId}: tipo inválido (${room.type})`);
      
      // Verifica coordenadas
      if (room.gridX === undefined) errors.push(`Sala ${roomId}: sem gridX`);
      if (room.gridY === undefined) errors.push(`Sala ${roomId}: sem gridY`);
      if (room.gridWidth === undefined) errors.push(`Sala ${roomId}: sem gridWidth`);
      if (room.gridHeight === undefined) errors.push(`Sala ${roomId}: sem gridHeight`);
      
      // Verifica saídas
      if (!room.exits || room.exits.length === 0) {
        errors.push(`Sala ${roomId}: sem saídas definidas`);
      }
    }
    
    return true;
  }
  
  static validateAccessibility(dungeonData, errors) {
    const visited = new Set();
    const toVisit = [dungeonData.entrance];
    const lockedDoors = new Map(); // Mapa de salas trancadas: roomId -> [saídas trancadas]
    
    // Simula navegação para verificar acessibilidade
    while (toVisit.length > 0) {
      const roomId = toVisit.shift();
      if (visited.has(roomId)) continue;
      
      visited.add(roomId);
      const room = dungeonData.rooms[roomId];
      
      if (!room) {
        errors.push(`Sala ${roomId} referenciada mas não existe`);
        continue;
      }
      
      if (room.exits) {
        room.exits.forEach(exit => {
          if (!exit.direction) {
            errors.push(`Sala ${roomId}: saída sem direção`);
          }
          
          if (!["north", "south", "east", "west"].includes(exit.direction)) {
            errors.push(`Sala ${roomId}: direção de saída inválida (${exit.direction})`);
          }
          
          if (!exit.leadsTo) {
            errors.push(`Sala ${roomId}: saída sem destino`);
          } else if (!dungeonData.rooms[exit.leadsTo]) {
            errors.push(`Sala ${roomId}: saída para sala inexistente ${exit.leadsTo}`);
          } else if (!exit.locked) {
            toVisit.push(exit.leadsTo);
          } else {
            // Registra porta trancada para verificação posterior
            if (!lockedDoors.has(roomId)) {
              lockedDoors.set(roomId, []);
            }
            lockedDoors.get(roomId).push(exit);
          }
          
          // Verifica se o tipo de saída é válido
          if (!exit.type) {
            errors.push(`Sala ${roomId}: saída sem tipo`);
          } else if (!["door", "stairs", "portal", "passage"].includes(exit.type)) {
            errors.push(`Sala ${roomId}: tipo de saída inválido (${exit.type})`);
          }
          
          // Verifica se há saída bidirecional
          const destRoom = dungeonData.rooms[exit.leadsTo];
          if (destRoom && destRoom.exits) {
            const oppositeDirection = {
              "north": "south",
              "south": "north",
              "east": "west",
              "west": "east"
            };
            
            const hasReturnExit = destRoom.exits.some(e => 
              e.direction === oppositeDirection[exit.direction] && e.leadsTo === roomId
            );
            
            if (!hasReturnExit) {
              errors.push(`Sala ${roomId}: saída para ${exit.leadsTo} não tem saída de retorno`);
            }
          }
        });
      }
    }
    
    // Verifica se todas as salas são acessíveis
    const allRooms = Object.keys(dungeonData.rooms);
    const unreachable = allRooms.filter(roomId => !visited.has(roomId));
    
    if (unreachable.length > 0) {
      errors.push(`Salas inacessíveis: ${unreachable.join(', ')}`);
      
      // Verifica se as salas inacessíveis têm saídas para salas acessíveis
      unreachable.forEach(roomId => {
        const room = dungeonData.rooms[roomId];
        if (room && room.exits) {
          room.exits.forEach(exit => {
            if (visited.has(exit.leadsTo)) {
              errors.push(`Sala ${roomId}: inacessível mas tem saída para sala acessível ${exit.leadsTo}`);
            }
          });
        }
      });
    }
    
    // Verifica ciclos de portas trancadas
    this.checkLockedDoorCycles(dungeonData, lockedDoors, errors);
  }
  
  static checkLockedDoorCycles(dungeonData, lockedDoors, errors) {
    // Implementa verificação de ciclos de portas trancadas
    // Um ciclo ocorre quando você precisa de uma chave que está em uma sala que só é acessível com essa mesma chave
    const keyLocations = this.findAllKeyLocations(dungeonData);
    
    for (const [roomId, exits] of lockedDoors.entries()) {
      for (const exit of exits) {
        if (!exit.keyId) continue;
        
        const keyId = exit.keyId;
        const keyRooms = keyLocations.get(keyId) || [];
        
        // Verifica se a chave só está disponível em salas que precisam dessa mesma chave para serem acessadas
        if (keyRooms.length > 0) {
          const keyAccessible = keyRooms.some(keyRoom => 
            this.isRoomAccessibleWithoutKey(dungeonData, keyRoom, keyId)
          );
          
          if (!keyAccessible) {
            errors.push(`Ciclo de chave detectado: chave ${keyId} só está disponível em salas que precisam dessa mesma chave`);
          }
        }
      }
    }
  }
  
  static isRoomAccessibleWithoutKey(dungeonData, targetRoom, keyToIgnore) {
    // Verifica se uma sala é acessível sem usar uma determinada chave
    const visited = new Set();
    const toVisit = [dungeonData.entrance];
    
    while (toVisit.length > 0) {
      const roomId = toVisit.shift();
      if (visited.has(roomId)) continue;
      
      visited.add(roomId);
      if (roomId === targetRoom) return true;
      
      const room = dungeonData.rooms[roomId];
      if (!room || !room.exits) continue;
      
      for (const exit of room.exits) {
        if (!exit.locked || (exit.locked && exit.keyId !== keyToIgnore)) {
          toVisit.push(exit.leadsTo);
        }
      }
    }
    
    return false;
  }
  
  static findAllKeyLocations(dungeonData) {
    // Retorna um mapa de keyId -> [salas onde a chave está disponível]
    const keyLocations = new Map();
    
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Chaves em itens normais
      if (room.items) {
        room.items.forEach(item => {
          if (item.id) {
            if (!keyLocations.has(item.id)) {
              keyLocations.set(item.id, []);
            }
            keyLocations.get(item.id).push(roomId);
          }
        });
      }
      
      // Chaves em itens escondidos
      if (room.hiddenItems) {
        room.hiddenItems.forEach(item => {
          if (item.id) {
            if (!keyLocations.has(item.id)) {
              keyLocations.set(item.id, []);
            }
            keyLocations.get(item.id).push(roomId);
          }
        });
      }
      
      // Chaves em pontos de interesse
      this.findKeysInRoom(room, roomId, keyLocations);
    }
    
    return keyLocations;
  }
  
  static findKeysInRoom(room, roomId, keyLocations) {
    // Procura chaves em todos os lugares possíveis de uma sala
    if (!room.exploration) return;
    
    // Chaves em eventos de exame
    if (room.exploration.examine) {
      room.exploration.examine.forEach(examine => {
        if (examine.pointsOfInterest) {
          examine.pointsOfInterest.forEach(poi => {
            // Chaves em itens de pontos de interesse
            if (poi.items) {
              poi.items.forEach(item => {
                if (item.id) {
                  if (!keyLocations.has(item.id)) {
                    keyLocations.set(item.id, []);
                  }
                  keyLocations.get(item.id).push(roomId);
                }
              });
            }
            
            // Chaves em interações
            if (poi.interactions) {
              poi.interactions.forEach(interaction => {
                this.findKeysInInteraction(interaction, roomId, keyLocations);
              });
            }
          });
        }
      });
    }
    
    // Chaves em eventos de busca
    if (room.exploration.search) {
      room.exploration.search.forEach(search => {
        if (search.items) {
          search.items.forEach(item => {
            if (item.id) {
              if (!keyLocations.has(item.id)) {
                keyLocations.set(item.id, []);
              }
              keyLocations.get(item.id).push(roomId);
            }
          });
        }
        
        // Chaves em testes de atributos
        this.findKeysInAttributeTests(search, roomId, keyLocations);
      });
    }
    
    // Chaves em NPCs
    if (room.npcs) {
      room.npcs.forEach(npc => {
        if (npc.dialogues) {
          for (const dialogueId in npc.dialogues) {
            const dialogue = npc.dialogues[dialogueId];
            if (dialogue.options) {
              dialogue.options.forEach(option => {
                if (option.items) {
                  option.items.forEach(item => {
                    if (item.id) {
                      if (!keyLocations.has(item.id)) {
                        keyLocations.set(item.id, []);
                      }
                      keyLocations.get(item.id).push(roomId);
                    }
                  });
                }
              });
            }
          }
        }
      });
    }
  }
  
  static findKeysInInteraction(interaction, roomId, keyLocations) {
    if (!interaction.result) return;
    
    // Chaves em testes de atributos
    if (interaction.result.action === "testLuck" && interaction.result.luckTest) {
      this.findKeysInTestResult(interaction.result.luckTest.success, roomId, keyLocations);
      this.findKeysInTestResult(interaction.result.luckTest.failure, roomId, keyLocations);
    }
    
    if (interaction.result.action === "testSkill" && interaction.result.skillTest) {
      this.findKeysInTestResult(interaction.result.skillTest.success, roomId, keyLocations);
      this.findKeysInTestResult(interaction.result.skillTest.failure, roomId, keyLocations);
    }
    
    if (interaction.result.action === "testCharisma" && interaction.result.charismaTest) {
      this.findKeysInTestResult(interaction.result.charismaTest.success, roomId, keyLocations);
      this.findKeysInTestResult(interaction.result.charismaTest.failure, roomId, keyLocations);
    }
  }
  
  static findKeysInAttributeTests(obj, roomId, keyLocations) {
    // Procura chaves em testes de atributos
    if (obj.luckTest) {
      this.findKeysInTestResult(obj.luckTest.success, roomId, keyLocations);
      this.findKeysInTestResult(obj.luckTest.failure, roomId, keyLocations);
    }
    
    if (obj.skillTest) {
      this.findKeysInTestResult(obj.skillTest.success, roomId, keyLocations);
      this.findKeysInTestResult(obj.skillTest.failure, roomId, keyLocations);
    }
    
    if (obj.charismaTest) {
      this.findKeysInTestResult(obj.charismaTest.success, roomId, keyLocations);
      this.findKeysInTestResult(obj.charismaTest.failure, roomId, keyLocations);
    }
  }
  
  static findKeysInTestResult(result, roomId, keyLocations) {
    if (!result || !result.items) return;
    
    result.items.forEach(item => {
      if (item.id) {
        if (!keyLocations.has(item.id)) {
          keyLocations.set(item.id, []);
        }
        keyLocations.get(item.id).push(roomId);
      }
    });
  }
  
  static validateKeys(dungeonData, errors) {
    const requiredKeys = new Map(); // Mapa de keyId -> salas que precisam
    const availableKeys = new Set();
    
    // Coleta todas as chaves necessárias
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      if (room.exits) {
        room.exits.forEach(exit => {
          if (exit.locked && exit.keyId) {
            if (!requiredKeys.has(exit.keyId)) {
              requiredKeys.set(exit.keyId, []);
            }
            requiredKeys.get(exit.keyId).push(`${roomId} -> ${exit.leadsTo}`);
          } else if (exit.locked && !exit.keyId) {
            errors.push(`Sala ${roomId}: saída trancada sem keyId`);
          }
        });
      }
    }
    
    // Coleta todas as chaves disponíveis usando o método findAllKeyLocations
    const keyLocations = this.findAllKeyLocations(dungeonData);
    for (const keyId of keyLocations.keys()) {
      availableKeys.add(keyId);
    }
    
    // Verifica se todas as chaves necessárias estão disponíveis
    for (const [keyId, locations] of requiredKeys.entries()) {
      if (!availableKeys.has(keyId)) {
        errors.push(`Chave necessária não encontrada: ${keyId} (usada em: ${locations.join(', ')})`);
      }
    }
    
    // Verifica chaves sem uso
    for (const keyId of availableKeys) {
      if (!requiredKeys.has(keyId) && keyId.includes('key')) {
        errors.push(`Chave sem uso: ${keyId}`);
      }
    }
  }
  
  static validateEvents(dungeonData, errors) {
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Verifica eventos de primeira visita
      if (room.events) {
        const firstVisitEvents = room.events.filter(e => e.type === 'first-visit');
        if (firstVisitEvents.length === 0) {
          errors.push(`Sala ${roomId}: tem eventos mas nenhum de primeira visita`);
        }
        
        room.events.forEach((event, index) => {
          if (!event.type) {
            errors.push(`Sala ${roomId}: evento ${index} sem tipo`);
          }
          if (!event.text) {
            errors.push(`Sala ${roomId}: evento ${index} sem texto`);
          }
        });
      } else {
        errors.push(`Sala ${roomId}: sem eventos de primeira visita`);
      }
      
      // Verifica estados de exploração
      if (room.exploration) {
        if (!room.exploration.states || !room.exploration.states.initial) {
          errors.push(`Sala ${roomId}: tem exploração mas sem estados iniciais`);
        }
        
        // Verifica eventos de exame
        if (room.exploration.examine) {
          room.exploration.examine.forEach((examine, index) => {
            if (!examine.text) {
              errors.push(`Sala ${roomId}: evento de exame ${index} sem texto`);
            }
            
            // Verifica condições
            if (examine.condition) {
              this.validateCondition(examine.condition, room, roomId, `evento de exame ${index}`, errors);
            }
            
            // Verifica efeitos
            if (examine.effect) {
              this.validateEffect(examine.effect, room, roomId, `evento de exame ${index}`, errors);
            }
          });
        } else {
          errors.push(`Sala ${roomId}: sem eventos de exame`);
        }
        
        // Verifica eventos de busca
        if (room.exploration.search) {
          room.exploration.search.forEach((search, index) => {
            if (!search.text) {
              errors.push(`Sala ${roomId}: evento de busca ${index} sem texto`);
            }
            
            // Verifica condições
            if (search.condition) {
              this.validateCondition(search.condition, room, roomId, `evento de busca ${index}`, errors);
            }
            
            // Verifica efeitos
            if (search.effect) {
              this.validateEffect(search.effect, room, roomId, `evento de busca ${index}`, errors);
            }
            
            // Verifica chance
            if (search.chance !== undefined && (search.chance < 0 || search.chance > 1)) {
              errors.push(`Sala ${roomId}: evento de busca ${index} com chance inválida (${search.chance})`);
            }
          });
        } else {
          errors.push(`Sala ${roomId}: sem eventos de busca`);
        }
      } else {
        errors.push(`Sala ${roomId}: sem configurações de exploração`);
      }
    }
  }
  
  static validateCondition(condition, room, roomId, context, errors) {
    if (typeof condition !== 'string') {
      errors.push(`Sala ${roomId}: ${context} com condição inválida (não é string)`);
      return;
    }
    
    // Verifica referências a estados
    const stateRefs = condition.match(/states\.(\w+)/g) || [];
    for (const stateRef of stateRefs) {
      const stateName = stateRef.replace('states.', '');
      
      // Verifica se o estado está definido nos estados iniciais
      if (room.exploration && room.exploration.states && room.exploration.states.initial) {
        if (room.exploration.states.initial[stateName] === undefined) {
          errors.push(`Sala ${roomId}: ${context} referencia estado não definido (${stateName})`);
        }
      }
    }
    
    // Verifica operadores lógicos
    const validOperators = ['&&', '||', '!'];
    let hasInvalidOperator = false;
    
    for (const op of validOperators) {
      if (condition.includes(op)) {
        // Verifica se há espaços ao redor dos operadores
        if (!condition.includes(` ${op} `) && op !== '!') {
          errors.push(`Sala ${roomId}: ${context} tem operador ${op} sem espaços`);
        }
      }
    }
    
    // Verifica sintaxe básica
    try {
      // Substitui referências a estados por valores booleanos para teste
      let testCondition = condition.replace(/states\.\w+/g, 'true');
      Function('"use strict"; return (' + testCondition + ')')();
    } catch (error) {
      errors.push(`Sala ${roomId}: ${context} tem condição com sintaxe inválida: ${error.message}`);
    }
  }
  
  static validateEffect(effect, room, roomId, context, errors) {
    for (const [key, value] of Object.entries(effect)) {
      if (key.startsWith('states.')) {
        const stateName = key.replace('states.', '');
        
        // Verifica se o estado está definido nos estados iniciais
        if (room.exploration && room.exploration.states && room.exploration.states.initial) {
          if (room.exploration.states.initial[stateName] === undefined) {
            errors.push(`Sala ${roomId}: ${context} modifica estado não definido (${stateName})`);
          }
        }
        
        // Verifica se o valor é do tipo correto
        if (room.exploration && room.exploration.states && room.exploration.states.initial) {
          const initialValue = room.exploration.states.initial[stateName];
          if (initialValue !== undefined && typeof initialValue !== typeof value) {
            errors.push(`Sala ${roomId}: ${context} modifica estado ${stateName} com tipo diferente (${typeof initialValue} -> ${typeof value})`);
          }
        }
      } else if (key === 'addExit') {
        // Verifica se a saída adicionada é válida
        if (!value.direction || !value.leadsTo || !value.type) {
          errors.push(`Sala ${roomId}: ${context} adiciona saída inválida`);
        }
      } else if (key === 'removeItem') {
        // Verifica se o item existe
        // Não é possível verificar completamente sem conhecer o inventário do jogador
      } else if (key === 'unlockExit') {
        // Verifica se a direção da saída existe
        const hasExit = room.exits && room.exits.some(exit => exit.direction === value);
        if (!hasExit) {
          errors.push(`Sala ${roomId}: ${context} desbloqueia saída inexistente (${value})`);
        }
      } else {
        errors.push(`Sala ${roomId}: ${context} tem efeito desconhecido (${key})`);
      }
    }
  }
  
  static validateEnemies(dungeonData, errors) {
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Verifica inimigo único
      if (room.enemy) {
        if (!room.enemy.id) {
          errors.push(`Sala ${roomId}: inimigo sem ID`);
        }
        if (!room.enemy.name) {
          errors.push(`Sala ${roomId}: inimigo sem nome`);
        }
        if (!room.enemy.description) {
          errors.push(`Sala ${roomId}: inimigo sem descrição`);
        }
        
        // Verifica atributos do inimigo
        this.validateEnemyAttributes(room.enemy, roomId, errors);
      }
      
      // Verifica múltiplos inimigos
      if (room.enemies) {
        if (room.enemy) {
          errors.push(`Sala ${roomId}: tem tanto 'enemy' quanto 'enemies'`);
        }
        
        room.enemies.forEach((enemy, index) => {
          if (!enemy.id) {
            errors.push(`Sala ${roomId}: inimigo ${index} sem ID`);
          }
          if (!enemy.name) {
            errors.push(`Sala ${roomId}: inimigo ${index} sem nome`);
          }
          if (!enemy.description) {
            errors.push(`Sala ${roomId}: inimigo ${index} sem descrição`);
          }
          
          // Verifica trigger
          if (enemy.trigger) {
            if (!enemy.trigger.message) {
              errors.push(`Sala ${roomId}: inimigo ${enemy.id || index} tem trigger sem mensagem`);
            }
            if (!enemy.trigger.condition) {
              errors.push(`Sala ${roomId}: inimigo ${enemy.id || index} tem trigger sem condição`);
            } else {
              this.validateCondition(enemy.trigger.condition, room, roomId, `trigger do inimigo ${enemy.id || index}`, errors);
            }
          }
          
          // Verifica atributos do inimigo
          this.validateEnemyAttributes(enemy, roomId, errors);
        });
      }
    }
  }
  
  static validateEnemyAttributes(enemy, roomId, errors) {
    // Verifica atributos mínimos necessários para combate
    if (enemy.habilidade === undefined && enemy.couraça === undefined && 
        enemy.pontosDeEnergia === undefined && enemy.dano === undefined) {
      errors.push(`Sala ${roomId}: inimigo ${enemy.id} sem atributos de combate`);
    }
    
    // Verifica formato do dano
    if (enemy.dano && typeof enemy.dano === 'string') {
      const danoPattern = /^\d+D\d+$/i;
      if (!danoPattern.test(enemy.dano)) {
        errors.push(`Sala ${roomId}: inimigo ${enemy.id} com formato de dano inválido (${enemy.dano})`);
      }
    }
    
    // Verifica drops
    if (enemy.drops && Array.isArray(enemy.drops)) {
      enemy.drops.forEach((drop, index) => {
        if (!drop.id) {
          errors.push(`Sala ${roomId}: inimigo ${enemy.id} tem drop ${index} sem ID`);
        }
        if (!drop.name && !drop.content) {
          errors.push(`Sala ${roomId}: inimigo ${enemy.id} tem drop ${index} sem nome/content`);
        }
      });
    }
  }

  static validateNPCs(dungeonData, errors) {
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      if (room.npcs) {
        room.npcs.forEach((npc, index) => {
          // Verifica campos básicos
          if (!npc.id) errors.push(`Sala ${roomId}: NPC ${index} sem ID`);
          if (!npc.name) errors.push(`Sala ${roomId}: NPC ${index} sem nome`);
          if (!npc.description) errors.push(`Sala ${roomId}: NPC ${index} sem descrição`);
          
          // Verifica diálogos
          if (!npc.dialogues) {
            errors.push(`Sala ${roomId}: NPC ${npc.name || index} sem diálogos`);
          } else {
            // Verifica se existe o diálogo inicial
            if (!npc.dialogues.initial) {
              errors.push(`Sala ${roomId}: NPC ${npc.name || index} sem diálogo inicial`);
            }
            
            // Verifica cada diálogo
            for (const dialogueId in npc.dialogues) {
              const dialogue = npc.dialogues[dialogueId];
              
              if (!dialogue.text) {
                errors.push(`Sala ${roomId}: NPC ${npc.name || index}, diálogo ${dialogueId} sem texto`);
              }
              
              // Verifica opções de resposta
              if (dialogue.options) {
                dialogue.options.forEach((option, optIndex) => {
                  if (!option.text) {
                    errors.push(`Sala ${roomId}: NPC ${npc.name || index}, diálogo ${dialogueId}, opção ${optIndex} sem texto`);
                  }
                  
                  // Verifica referências a outros diálogos
                  if (option.next && !npc.dialogues[option.next]) {
                    errors.push(`Sala ${roomId}: NPC ${npc.name || index}, diálogo ${dialogueId}, opção ${optIndex} referencia diálogo inexistente ${option.next}`);
                  }
                  
                  // Verifica efeitos
                  if (option.effect) {
                    this.validateEffect(option.effect, room, roomId, `NPC ${npc.name || index}, diálogo ${dialogueId}, opção ${optIndex}`, errors);
                  }
                  
                  // Verifica itens
                  if (option.items) {
                    option.items.forEach((item, itemIndex) => {
                      if (!item.id) errors.push(`Sala ${roomId}: NPC ${npc.name || index}, diálogo ${dialogueId}, opção ${optIndex}, item ${itemIndex} sem ID`);
                      if (!item.content) errors.push(`Sala ${roomId}: NPC ${npc.name || index}, diálogo ${dialogueId}, opção ${optIndex}, item ${itemIndex} sem content`);
                    });
                  }
                });
              }
            }
          }
          
          // Verifica condição de aparecimento
          if (npc.condition) {
            this.validateCondition(npc.condition, room, roomId, `condição do NPC ${npc.name || index}`, errors);
          }
        });
      }
    }
  }
  
  static validatePointsOfInterest(dungeonData, errors) {
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Verifica pontos de interesse diretos na sala
      if (room.pointsOfInterest) {
        this.validatePOIArray(room.pointsOfInterest, room, roomId, "sala", errors);
      }
      
      // Verifica pontos de interesse em eventos de exame
      if (room.exploration && room.exploration.examine) {
        room.exploration.examine.forEach((examine, examineIndex) => {
          if (examine.pointsOfInterest) {
            this.validatePOIArray(examine.pointsOfInterest, room, roomId, `evento de exame ${examineIndex}`, errors);
          }
        });
      }
    }
  }
  
  static validatePOIArray(poiArray, room, roomId, context, errors) {
    poiArray.forEach((poi, index) => {
      // Verifica campos básicos
      if (!poi.id) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${index} sem ID`);
      if (!poi.name) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${index} sem nome`);
      if (!poi.description) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${index} sem descrição`);
      
      // Verifica condição
      if (poi.condition) {
        this.validateCondition(poi.condition, room, roomId, `${context}, ponto de interesse ${poi.name || index}`, errors);
      }
      
      // Verifica efeito
      if (poi.effect) {
        this.validateEffect(poi.effect, room, roomId, `${context}, ponto de interesse ${poi.name || index}`, errors);
      }
      
      // Verifica itens
      if (poi.items) {
        poi.items.forEach((item, itemIndex) => {
          if (!item.id) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, item ${itemIndex} sem ID`);
          if (!item.content && !item.name) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, item ${itemIndex} sem nome/content`);
        });
      }
      
      // Verifica interações
      if (poi.interactions) {
        poi.interactions.forEach((interaction, intIndex) => {
          if (!interaction.id) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, interação ${intIndex} sem ID`);
          if (!interaction.name) errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, interação ${intIndex} sem nome`);
          
          // Verifica condição da interação
          if (interaction.condition) {
            this.validateCondition(interaction.condition, room, roomId, `${context}, ponto de interesse ${poi.name || index}, interação ${interaction.name || intIndex}`, errors);
          }
          
          // Verifica resultado da interação
          if (!interaction.result) {
            errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, interação ${interaction.name || intIndex} sem resultado`);
          } else if (!interaction.result.action) {
            errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, interação ${interaction.name || intIndex} sem ação definida`);
          } else {
            // Verifica tipo de ação
            const validActions = ["testLuck", "testSkill", "testCharisma", "dialogue"];
            if (!validActions.includes(interaction.result.action)) {
              errors.push(`Sala ${roomId}: ${context}, ponto de interesse ${poi.name || index}, interação ${interaction.name || intIndex} com ação inválida (${interaction.result.action})`);
            }
            
            // Verifica testes de atributos
            this.validateInteractionTests(interaction, room, roomId, `${context}, ponto de interesse ${poi.name || index}`, errors);
          }
        });
      }
      
      // Verifica testes de atributos diretos
      this.validatePOITests(poi, room, roomId, context, errors);
    });
  }
  
  static validateInteractionTests(interaction, room, roomId, context, errors) {
    if (!interaction.result) return;
    
    // Verifica teste de sorte
    if (interaction.result.action === "testLuck" && interaction.result.luckTest) {
      this.validateLuckTest(interaction.result.luckTest, room, roomId, `${context}, interação ${interaction.name || ""}`, errors);
    }
    
    // Verifica teste de habilidade
    if (interaction.result.action === "testSkill" && interaction.result.skillTest) {
      this.validateSkillTest(interaction.result.skillTest, room, roomId, `${context}, interação ${interaction.name || ""}`, errors);
    }
    
    // Verifica teste de carisma
    if (interaction.result.action === "testCharisma" && interaction.result.charismaTest) {
      this.validateCharismaTest(interaction.result.charismaTest, room, roomId, `${context}, interação ${interaction.name || ""}`, errors);
    }
  }
  
  static validatePOITests(poi, room, roomId, context, errors) {
    // Verifica teste de sorte
    if (poi.luckTest) {
      this.validateLuckTest(poi.luckTest, room, roomId, `${context}, ponto de interesse ${poi.name || ""}`, errors);
    }
    
    // Verifica teste de habilidade
    if (poi.skillTest) {
      this.validateSkillTest(poi.skillTest, room, roomId, `${context}, ponto de interesse ${poi.name || ""}`, errors);
    }
    
    // Verifica teste de carisma
    if (poi.charismaTest) {
      this.validateCharismaTest(poi.charismaTest, room, roomId, `${context}, ponto de interesse ${poi.name || ""}`, errors);
    }
  }
  
  static validateLuckTest(luckTest, room, roomId, context, errors) {
    if (!luckTest.description) errors.push(`Sala ${roomId}: ${context}, teste de sorte sem descrição`);
    
    // Verifica resultado de sucesso
    if (!luckTest.success) {
      errors.push(`Sala ${roomId}: ${context}, teste de sorte sem resultado de sucesso`);
    } else {
      if (!luckTest.success.text) errors.push(`Sala ${roomId}: ${context}, teste de sorte, sucesso sem texto`);
      
      // Verifica efeito de sucesso
      if (luckTest.success.effect) {
        this.validateEffect(luckTest.success.effect, room, roomId, `${context}, teste de sorte, sucesso`, errors);
      }
    }
    
    // Verifica resultado de falha
    if (!luckTest.failure) {
      errors.push(`Sala ${roomId}: ${context}, teste de sorte sem resultado de falha`);
    } else {
      if (!luckTest.failure.text) errors.push(`Sala ${roomId}: ${context}, teste de sorte, falha sem texto`);
      
      // Verifica efeito de falha
      if (luckTest.failure.effect) {
        this.validateEffect(luckTest.failure.effect, room, roomId, `${context}, teste de sorte, falha`, errors);
      }
      
      // Verifica dano de falha
      if (luckTest.failure.damage && !luckTest.failure.damage.amount) {
        errors.push(`Sala ${roomId}: ${context}, teste de sorte, falha com dano sem quantidade`);
      }
    }
  }
  
  static validateSkillTest(skillTest, room, roomId, context, errors) {
    if (!skillTest.description) errors.push(`Sala ${roomId}: ${context}, teste de habilidade sem descrição`);
    if (skillTest.difficulty === undefined) errors.push(`Sala ${roomId}: ${context}, teste de habilidade sem dificuldade`);
    
    // Verifica resultado de sucesso
    if (!skillTest.success) {
      errors.push(`Sala ${roomId}: ${context}, teste de habilidade sem resultado de sucesso`);
    } else {
      if (!skillTest.success.text) errors.push(`Sala ${roomId}: ${context}, teste de habilidade, sucesso sem texto`);
      
      // Verifica efeito de sucesso
      if (skillTest.success.effect) {
        this.validateEffect(skillTest.success.effect, room, roomId, `${context}, teste de habilidade, sucesso`, errors);
      }
    }
    
    // Verifica resultado de falha
    if (!skillTest.failure) {
      errors.push(`Sala ${roomId}: ${context}, teste de habilidade sem resultado de falha`);
    } else {
      if (!skillTest.failure.text) errors.push(`Sala ${roomId}: ${context}, teste de habilidade, falha sem texto`);
      
      // Verifica efeito de falha
      if (skillTest.failure.effect) {
        this.validateEffect(skillTest.failure.effect, room, roomId, `${context}, teste de habilidade, falha`, errors);
      }
      
      // Verifica dano de falha
      if (skillTest.failure.damage && !skillTest.failure.damage.amount) {
        errors.push(`Sala ${roomId}: ${context}, teste de habilidade, falha com dano sem quantidade`);
      }
    }
  }
  
  static validateCharismaTest(charismaTest, room, roomId, context, errors) {
    if (!charismaTest.description) errors.push(`Sala ${roomId}: ${context}, teste de carisma sem descrição`);
    if (charismaTest.difficulty === undefined) errors.push(`Sala ${roomId}: ${context}, teste de carisma sem dificuldade`);
    
    // Verifica resultado de sucesso
    if (!charismaTest.success) {
      errors.push(`Sala ${roomId}: ${context}, teste de carisma sem resultado de sucesso`);
    } else {
      if (!charismaTest.success.text) errors.push(`Sala ${roomId}: ${context}, teste de carisma, sucesso sem texto`);
      
      // Verifica efeito de sucesso
      if (charismaTest.success.effect) {
        this.validateEffect(charismaTest.success.effect, room, roomId, `${context}, teste de carisma, sucesso`, errors);
      }
    }
    
    // Verifica resultado de falha
    if (!charismaTest.failure) {
      errors.push(`Sala ${roomId}: ${context}, teste de carisma sem resultado de falha`);
    } else {
      if (!charismaTest.failure.text) errors.push(`Sala ${roomId}: ${context}, teste de carisma, falha sem texto`);
      
      // Verifica efeito de falha
      if (charismaTest.failure.effect) {
        this.validateEffect(charismaTest.failure.effect, room, roomId, `${context}, teste de carisma, falha`, errors);
      }
      
      // Verifica dano de falha
      if (charismaTest.failure.damage && !charismaTest.failure.damage.amount) {
        errors.push(`Sala ${roomId}: ${context}, teste de carisma, falha com dano sem quantidade`);
      }
    }
  }
  
  static validateItems(dungeonData, errors) {
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Verifica itens normais
      if (room.items) {
        room.items.forEach((item, index) => {
          if (!item.id) errors.push(`Sala ${roomId}: item ${index} sem ID`);
          if (!item.name && !item.content) errors.push(`Sala ${roomId}: item ${index} sem nome/content`);
          if (!item.description) errors.push(`Sala ${roomId}: item ${index} sem descrição`);
          
          // Verifica quantidade
          if (item.quantity !== undefined && (!Number.isInteger(item.quantity) || item.quantity < 1)) {
            errors.push(`Sala ${roomId}: item ${item.name || item.content || index} com quantidade inválida (${item.quantity})`);
          }
        });
      }
      
      // Verifica itens escondidos
      if (room.hiddenItems) {
        room.hiddenItems.forEach((item, index) => {
          if (!item.id) errors.push(`Sala ${roomId}: item escondido ${index} sem ID`);
          if (!item.content) errors.push(`Sala ${roomId}: item escondido ${index} sem content`);
          if (!item.description) errors.push(`Sala ${roomId}: item escondido ${index} sem descrição`);
        });
      }
    }
  }
  
  static validateAttributeTests(dungeonData, errors) {
    // Esta função já está coberta pelas validações de pontos de interesse e interações
    // Mantida para consistência com a lista de testes
  }
  
  static validateDecorativeBlocks(dungeonData, errors) {
    if (!dungeonData.decorativeBlocks) return;
    
    dungeonData.decorativeBlocks.forEach((block, index) => {
      // Verifica campos básicos
      if (!block.type) errors.push(`Bloco decorativo ${index}: sem tipo`);
      if (block.gridX === undefined) errors.push(`Bloco decorativo ${index}: sem gridX`);
      if (block.gridY === undefined) errors.push(`Bloco decorativo ${index}: sem gridY`);
      if (block.gridWidth === undefined) errors.push(`Bloco decorativo ${index}: sem gridWidth`);
      if (block.gridHeight === undefined) errors.push(`Bloco decorativo ${index}: sem gridHeight`);
      
      // Verifica conexões
      if (block.connects) {
        if (!Array.isArray(block.connects)) {
          errors.push(`Bloco decorativo ${index}: connects não é um array`);
        } else {
          block.connects.forEach((roomId, connIndex) => {
            if (!dungeonData.rooms[roomId]) {
              errors.push(`Bloco decorativo ${index}: conecta com sala inexistente ${roomId}`);
            }
          });
        }
      }
      
      // Verifica sobreposições com salas
      for (const roomId in dungeonData.rooms) {
        const room = dungeonData.rooms[roomId];
        
        if (this.checkOverlap(
          block.gridX, block.gridY, block.gridWidth || 1, block.gridHeight || 1,
          room.gridX, room.gridY, room.gridWidth, room.gridHeight
        )) {
          errors.push(`Bloco decorativo ${index} sobrepõe sala ${roomId}`);
        }
      }
      
      // Verifica sobreposições com outros blocos decorativos
      for (let i = 0; i < index; i++) {
        const otherBlock = dungeonData.decorativeBlocks[i];
        
        if (this.checkOverlap(
          block.gridX, block.gridY, block.gridWidth || 1, block.gridHeight || 1,
          otherBlock.gridX, otherBlock.gridY, otherBlock.gridWidth || 1, otherBlock.gridHeight || 1
        )) {
          errors.push(`Bloco decorativo ${index} sobrepõe bloco decorativo ${i}`);
        }
      }
    });
  }
  
  static checkOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
  
  static validateVisualConsistency(dungeonData, errors) {
    // Verifica se as salas estão muito próximas
    const rooms = Object.values(dungeonData.rooms);
    
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const room1 = rooms[i];
        const room2 = rooms[j];
        
        // Verifica se as salas estão adjacentes mas não conectadas
        const isAdjacent = (
          (Math.abs(room1.gridX + room1.gridWidth - room2.gridX) <= 1 && 
           this.hasVerticalOverlap(room1, room2)) ||
          (Math.abs(room1.gridY + room1.gridHeight - room2.gridY) <= 1 && 
           this.hasHorizontalOverlap(room1, room2)) ||
          (Math.abs(room2.gridX + room2.gridWidth - room1.gridX) <= 1 && 
           this.hasVerticalOverlap(room1, room2)) ||
          (Math.abs(room2.gridY + room2.gridHeight - room1.gridY) <= 1 && 
           this.hasHorizontalOverlap(room1, room2))
        );
        
        const isConnected = room1.exits && room1.exits.some(exit => exit.leadsTo === room2.id) ||
                           room2.exits && room2.exits.some(exit => exit.leadsTo === room1.id);
        
        if (isAdjacent && !isConnected) {
          errors.push(`Salas ${room1.id} e ${room2.id} estão adjacentes mas não conectadas`);
        }
      }
    }
  }
  
  static hasHorizontalOverlap(room1, room2) {
    return room1.gridX < room2.gridX + room2.gridWidth && room1.gridX + room1.gridWidth > room2.gridX;
  }
  
  static hasVerticalOverlap(room1, room2) {
    return room1.gridY < room2.gridY + room2.gridHeight && room1.gridY + room1.gridHeight > room2.gridY;
  }
  
  static validateConditionsAndEffects(dungeonData, errors) {
    // Esta função já está coberta pelas validações de condições e efeitos em outros métodos
    // Mantida para consistência com a lista de testes
  }
  
  static showSummary(results) {
    console.log("\n📊 RESUMO DOS TESTES:");
    console.log(`✅ Masmorras aprovadas: ${results.passed.length}`);
    console.log(`❌ Masmorras com falhas: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log("\n❌ MASMORRAS COM FALHAS:");
      results.failed.forEach(failure => {
        console.log(`\n${failure.name} (${failure.id}):`);
        failure.errors.forEach(error => console.log(`  - ${error}`));
      });
    }
  }
}

export { DungeonTester };
