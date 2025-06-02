import { Room1Behavior } from './behaviors/room1.js';
import { Room2Behavior } from './behaviors/room2.js';
import { Room2Behavior } from './behaviors/room6.js';


export const RoomBehaviors = {
    'room-1': Room1Behavior,
    'room-2': Room2Behavior,
    'room-6': Room2Behavior

};

export function getRoomBehavior(roomId) {
    return RoomBehaviors[roomId] || null;
}
