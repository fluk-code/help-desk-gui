import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  private readonly isActiveWindow = new BehaviorSubject<boolean>(true);

  constructor(private readonly ngZone: NgZone) {}

  initZone() {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('visibilitychange', () => {
        this.ngZone.run(() => {
          this.isActiveWindow.next(!document.hidden);
        });
      });
    });
  }

  isActiveWindow$(): Observable<boolean> {
    return this.isActiveWindow.asObservable();
  }
}
