import { Room1Behavior } from './behaviors/room1.js';

export const RoomBehaviors = {
    'room-1': Room1Behavior,
    // Outras salas serão adicionadas aqui
};

// Função auxiliar para obter o comportamento de uma sala
export function getRoomBehavior(roomId) {
    return RoomBehaviors[roomId] || null;
}