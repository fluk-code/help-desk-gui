import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

type MediaStreamSubject = {
  room: string;
  mediaStream: MediaStream;
  isScreenShared: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class DisplayMediaStreamService {
  private readonly mediaStreamSubject = new Map<string, BehaviorSubject<MediaStreamSubject>>();

  constructor() {}

  mediaStream$(room: string): Observable<MediaStreamSubject> {
    let subject = this.mediaStreamSubject.get(room);

    if (!subject) {
      subject = new BehaviorSubject<MediaStreamSubject>({
        room,
        mediaStream: new MediaStream(),
        isScreenShared: false,
      });

      this.mediaStreamSubject.set(room, subject);
    }

    return subject.asObservable();
  }

  async activateDisplayMediaStream(room: string): Promise<void> {
    const mediaStreamSubject = this.mediaStreamSubject.get(room);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      mediaStreamSubject?.next({
        room,
        mediaStream: stream,
        isScreenShared: true,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        mediaStreamSubject?.next({
          room,
          mediaStream: new MediaStream(),
          isScreenShared: false,
        });
      } else {
        alert('Ocorreu um erro ao compartilhar a tela. Por favor, tente novamente.');
      }
    }
  }

  deactivateDisplayMediaStream(room: string): void {
    const mediaStreamSubject = this.mediaStreamSubject.get(room);

    mediaStreamSubject?.next({
      room,
      mediaStream: new MediaStream(),
      isScreenShared: false,
    });
  }
}
