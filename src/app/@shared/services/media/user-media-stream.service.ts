import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { RoomId } from '../../types/type';

type RoomMediaStream = {
  video: MediaTrackConstraints | boolean;
  audio: MediaTrackConstraints | boolean;
  mediaStreamSubject: BehaviorSubject<MediaStream>;
};

@Injectable({
  providedIn: 'root',
})
export class UserMediaStreamService {
  private readonly rooms = new Map<RoomId, RoomMediaStream>();

  mediaStream$(room: RoomId): Observable<MediaStream> {
    let roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      const mediaStreamSubject = new BehaviorSubject<MediaStream>(this.createEmptyMedia());
      roomMediaStream = {
        video: false,
        audio: false,
        mediaStreamSubject,
      };
      this.rooms.set(room, roomMediaStream);
    }

    return roomMediaStream.mediaStreamSubject.asObservable();
  }

  async changeVideoDevice(room: RoomId, deviceId: string): Promise<void> {
    const roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      return;
    }

    roomMediaStream.video = { deviceId: { exact: deviceId } };
    await this.displayVideoDevice(room);

    // this.video = { deviceId: { exact: deviceId } };
    // await this.displayVideoDevice('');
  }

  async disableVideo(room: RoomId): Promise<void> {
    const roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      return;
    }

    roomMediaStream.video = false;
    await this.displayVideoDevice(room);

    // this.video = false;
    // await this.displayVideoDevice('');
  }

  async changeAudioDevice(room: RoomId, deviceId: string): Promise<void> {
    const roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      return;
    }

    roomMediaStream.audio = { deviceId: { exact: deviceId } };
    await this.displayVideoDevice(room);

    // this.audio = { deviceId: { exact: deviceId } };
    // await this.displayVideoDevice();
  }

  async disableAudio(room: RoomId): Promise<void> {
    const roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      return;
    }

    roomMediaStream.audio = false;
    await this.displayVideoDevice(room);

    // this.audio = false;
    // await this.displayVideoDevice();
  }

  async displayVideoDevice(room: RoomId): Promise<void> {
    const roomMediaStream = this.rooms.get(room);

    if (!roomMediaStream) {
      return;
    }

    const stream = await this.getUserMedia(roomMediaStream);
    roomMediaStream.mediaStreamSubject.next(stream);
  }

  private getUserMedia(roomMediaStream: RoomMediaStream): Promise<MediaStream> {
    if (roomMediaStream.video === false && roomMediaStream.audio === false) {
      return Promise.resolve(this.createEmptyMedia());
    }

    return navigator.mediaDevices.getUserMedia({
      video: roomMediaStream.video,
      audio: roomMediaStream.audio,
    });
  }

  createEmptyMedia(width = 640, height = 480): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context not found');
    }

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    const stream = canvas.captureStream();
    return new MediaStream(stream.getVideoTracks());
  }
}
