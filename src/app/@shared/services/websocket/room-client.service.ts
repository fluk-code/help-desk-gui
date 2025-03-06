import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export enum RoomEventOptions {
  NEW = 'NEW',
  REMOVE = 'REMOVE',
}

export type RoomEvent = {
  event: RoomEventOptions;
  room: string;
};

//TODO: ADD nas environment
export const SIGNALING_SERVER_URL = 'ws://localhost:3090/ws';

@Injectable({
  providedIn: 'root',
})
export class RoomClientService {
  private readonly wsUrl = `${SIGNALING_SERVER_URL}/room`;

  private readonly roomSubject = new Subject<RoomEvent>();

  private socket!: WebSocket;

  get rooms$(): Observable<RoomEvent> {
    return this.roomSubject.asObservable();
  }

  connect(): void {
    this.socket = new WebSocket(this.wsUrl);
    this.onMessage();
  }

  private onMessage(): void {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.roomSubject.next(data);
    };
  }

  disconnect(): void {
    this.socket.close();
  }
}
