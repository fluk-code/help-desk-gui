import { defer, from, fromEvent, map, Observable, of, startWith, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaDevicesService {
  constructor() {}

  audioInputDevices$(): Observable<MediaDeviceInfo[]> {
    return this.deviceChange$().pipe(
      map((devices) => devices.filter((device) => device.kind === 'audioinput'))
    );
  }

  videoDevices$(): Observable<MediaDeviceInfo[]> {
    return this.deviceChange$().pipe(
      map((devices) => devices.filter((device) => device.kind === 'videoinput'))
    );
  }

  audioOutputDevices$(): Observable<MediaDeviceInfo[]> {
    return this.deviceChange$().pipe(
      map((devices) => devices.filter((device) => device.kind === 'audiooutput'))
    );
  }

  deviceChange$(): Observable<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn('navigator.mediaDevices not supported in this browser.');
      return of([]); // Return an empty observable
    }

    try {
      const devicesChangeEvents$ = fromEvent(navigator.mediaDevices, 'devicechange').pipe();

      const enumerateDevices$ = defer(() => from(navigator.mediaDevices.enumerateDevices())).pipe();

      return devicesChangeEvents$.pipe(
        startWith(null),
        switchMap(() => enumerateDevices$)
      );
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return of([]);
    }
  }

  async requestMediaPermissions(): Promise<void> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (error) {
      console.warn('Permissão negada ou erro ao acessar mídia:', error);
    }
  }
}
