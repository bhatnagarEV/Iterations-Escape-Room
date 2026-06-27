import type { RoomSession } from '../types';
import { ROOM_VERSION } from './roomVersion';

const STORAGE_KEY = 'ap-csa-iterations-active-room-v2';

export function loadSavedRoom(): RoomSession | null {
  const savedRoom = window.localStorage.getItem(STORAGE_KEY);

  if (!savedRoom) {
    return null;
  }

  try {
    const parsedRoom = JSON.parse(savedRoom) as RoomSession;

    if (parsedRoom.roomVersion !== ROOM_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedRoom;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveRoom(room: RoomSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(room));
}

export function clearSavedRoom(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
