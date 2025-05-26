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
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static validateStructure(dungeonData, errors) {
    // Verifica campos obrigatórios da masmorra
    if (!dungeonData.name) errors.push("Masmorra sem nome");
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
      
      // Verifica coordenadas
      if (room.gridX === undefined) errors.push(`Sala ${roomId}: sem gridX`);
      if (room.gridY === undefined) errors.push(`Sala ${roomId}: sem gridY`);
      if (room.gridWidth === undefined) errors.push(`Sala ${roomId}: sem gridWidth`);
      if (room.gridHeight === undefined) errors.push(`Sala ${roomId}: sem gridHeight`);
    }
    
    return true;
  }
  
  static validateAccessibility(dungeonData, errors) {
    const visited = new Set();
    const toVisit = [dungeonData.entrance];
    
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
          
          if (!exit.leadsTo) {
            errors.push(`Sala ${roomId}: saída sem destino`);
          } else if (!dungeonData.rooms[exit.leadsTo]) {
            errors.push(`Sala ${roomId}: saída para sala inexistente ${exit.leadsTo}`);
          } else if (!exit.locked) {
            toVisit.push(exit.leadsTo);
          }
        });
      } else {
        errors.push(`Sala ${roomId}: sem saídas definidas`);
      }
    }
    
    // Verifica se todas as salas são acessíveis
    const allRooms = Object.keys(dungeonData.rooms);
    const unreachable = allRooms.filter(roomId => !visited.has(roomId));
    
    if (unreachable.length > 0) {
      errors.push(`Salas inacessíveis: ${unreachable.join(', ')}`);
    }
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
    
    // Coleta todas as chaves disponíveis
    for (const roomId in dungeonData.rooms) {
      const room = dungeonData.rooms[roomId];
      
      // Chaves em itens normais
      if (room.items) {
        room.items.forEach(item => {
          if (item.id) availableKeys.add(item.id);
        });
      }
      
      // Chaves em itens escondidos
      if (room.hiddenItems) {
        room.hiddenItems.forEach(item => {
          if (item.id) availableKeys.add(item.id);
        });
      }
      
      // Chaves em pontos de interesse
      if (room.exploration && room.exploration.examine) {
        room.exploration.examine.forEach(examine => {
          if (examine.pointsOfInterest) {
            examine.pointsOfInterest.forEach(poi => {
              if (poi.items) {
                poi.items.forEach(item => {
                  if (item.id) availableKeys.add(item.id);
                });
              }
            });
          }
        });
      }
    }
    
    // Verifica se todas as chaves necessárias estão disponíveis
    for (const [keyId, locations] of requiredKeys.entries()) {
      if (!availableKeys.has(keyId)) {
        errors.push(`Chave necessária não encontrada: ${keyId} (usada em: ${locations.join(', ')})`);
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
          });
        }
        
        // Verifica eventos de busca
        if (room.exploration.search) {
          room.exploration.search.forEach((search, index) => {
            if (!search.text) {
              errors.push(`Sala ${roomId}: evento de busca ${index} sem texto`);
            }
          });
        }
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
      }
      
      // Verifica múltiplos inimigos
      if (room.enemies) {
        room.enemies.forEach((enemy, index) => {
          if (!enemy.id) {
            errors.push(`Sala ${roomId}: inimigo ${index} sem ID`);
          }
          if (!enemy.name) {
            errors.push(`Sala ${roomId}: inimigo ${index} sem nome`);
          }
          
          // Verifica trigger
          if (enemy.trigger && !enemy.trigger.message) {
            errors.push(`Sala ${roomId}: inimigo ${enemy.id || index} tem trigger sem mensagem`);
          }
        });
      }
    }
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
