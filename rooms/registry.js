import { Room1Behavior } from './behaviors/room1.js';
import { Room2Behavior } from './behaviors/room2.js';
import { Room3Behavior } from './behaviors/room3.js';
import { Room6Behavior } from './behaviors/room6.js'; // <--- Corrigido aqui

export const RoomBehaviors = {
    'room-1': Room1Behavior,
    'room-3': Room3Behavior,
    'room-2': Room2Behavior,
    'room-6': Room6Behavior // <--- Corrigido aqui
};

export function getRoomBehavior(roomId) {
    return RoomBehaviors[roomId] || null;
}
