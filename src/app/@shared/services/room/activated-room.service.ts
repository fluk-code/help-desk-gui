import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActivatedRoomService {
  private readonly activatedRoomSubject = new Subject<string>();

  get activatedRoom$(): Observable<string> {
    return this.activatedRoomSubject.asObservable();
  }

  changeActivatedRoom(roomId: string): void {
    this.activatedRoomSubject.next(roomId);
  }
}
