// room-processor.js

export class RoomProcessor {
    static TYPES = {
        BASIC: 'basic',
        COMBAT: 'combat',
        PUZZLE: 'puzzle',
        DIALOGUE: 'dialogue',
        MIXED: 'mixed'
    };

    constructor() {
        this.processors = new Map();
        this.initializeProcessors();
    }

    initializeProcessors() {
        // Registra os processadores básicos
        this.registerProcessor(RoomProcessor.TYPES.BASIC, new BasicRoomProcessor());
        this.registerProcessor(RoomProcessor.TYPES.COMBAT, new CombatRoomProcessor());
        this.registerProcessor(RoomProcessor.TYPES.PUZZLE, new PuzzleRoomProcessor());
        this.registerProcessor(RoomProcessor.TYPES.DIALOGUE, new DialogueRoomProcessor());
    }

    registerProcessor(type, processor) {
        this.processors.set(type, processor);
    }

    async processRoom(room, context) {
        // Contexto contém estado do jogador, inventário, etc
        const roomTypes = room.types || [RoomProcessor.TYPES.BASIC];
        const results = [];

        for (const type of roomTypes) {
            const processor = this.processors.get(type);
            if (processor) {
                const result = await processor.process(room, context);
                results.push(result);
            }
        }

        return results;
    }
}

// Processador Base
class BaseProcessor {
    async process(room, context) {
        throw new Error('Método process deve ser implementado');
    }

    async validateState(room) {
        if (!room.states) {
            room.states = { initial: {} };
        }
        if (!room.explorationState) {
            room.explorationState = { ...room.states.initial };
        }
    }
}

// Processador Básico
class BasicRoomProcessor extends BaseProcessor {
    async process(room, context) {
        await this.validateState(room);
        
        return {
            type: RoomProcessor.TYPES.BASIC,
            description: room.description,
            events: await this.processEvents(room, context),
            exits: this.processExits(room)
        };
    }

    async processEvents(room, context) {
        const events = [];
        if (room.events) {
            for (const event of room.events) {
                if (event.type === 'first-visit' && !context.visitedRooms.includes(room.id)) {
                    events.push(event);
                }
            }
        }
        return events;
    }

    processExits(room) {
        return room.exits || [];
    }
}