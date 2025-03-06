import { Injectable } from '@angular/core';

import { RoomId, SelfId } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class SelfIdService {
  ids = new Map<RoomId, SelfId>();

  setSelfId(room: RoomId, id: SelfId): void {
    this.ids.set(room, id);
  }

  getSelfId(room: RoomId): SelfId | undefined {
    return this.ids.get(room);
  }

  deleteSelfId(room: RoomId): void {
    this.ids.delete(room);
  }
}
