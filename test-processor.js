// test-processor.js
import { RoomProcessor } from './room-processor.js';

async function testProcessor() {
    const processor = new RoomProcessor();
    const testRoom = {
        // Conteúdo do test-room.json
    };

    const context = {
        playerState: {
            health: 100,
            inventory: []
        },
        visitedRooms: [],
        discoveredRooms: ['test-room-1']
    };

    try {
        const result = await processor.processRoom(testRoom, context);
        console.log('Resultado do processamento:', result);
    } catch (error) {
        console.error('Erro ao processar sala:', error);
    }
}

testProcessor();