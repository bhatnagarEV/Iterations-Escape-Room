import type { RoomSession } from '../types';

const STORAGE_KEY = 'ap-csa-iterations-active-room-v1';

export function loadSavedRoom(): RoomSession | null {
  const savedRoom = window.localStorage.getItem(STORAGE_KEY);

  if (!savedRoom) {
    return null;
  }

  try {
    return JSON.parse(savedRoom) as RoomSession;
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
