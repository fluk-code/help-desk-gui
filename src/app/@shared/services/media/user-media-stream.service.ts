import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserMediaStreamService {
  private video: MediaTrackConstraints | boolean = false;
  private audio: MediaTrackConstraints | boolean = false;

  private readonly mediaStreamSubject = new BehaviorSubject<MediaStream>(new MediaStream());

  mediaStream$(): Observable<MediaStream> {
    return this.mediaStreamSubject.asObservable();
  }

  async changeVideoDevice(deviceId: string): Promise<void> {
    this.video = { deviceId: { exact: deviceId } };
    await this.displayVideoDevice();
  }

  async disableVideo(): Promise<void> {
    this.video = false;
    await this.displayVideoDevice();
  }

  async changeAudioDevice(deviceId: string): Promise<void> {
    this.audio = { deviceId: { exact: deviceId } };
    await this.displayVideoDevice();
  }

  async disableAudio(): Promise<void> {
    this.audio = false;
    await this.displayVideoDevice();
  }

  async displayVideoDevice(): Promise<void> {
    const stream = await this.getUserMedia();
    this.mediaStreamSubject.next(stream);
  }

  private getUserMedia(): Promise<MediaStream> {
    if (this.video === false && this.audio === false) {
      return Promise.resolve(new MediaStream());
    }

    return navigator.mediaDevices.getUserMedia({
      video: this.video,
      audio: this.audio,
    });
  }
}
