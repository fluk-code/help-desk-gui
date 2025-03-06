import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

// import { MediaService } from './@shared/services/web-socket/media.service';
import { routes } from './app.routes';

// function appLoadFactory(mediaService: MediaService) {
//   return () => mediaService.initializeLocalStream().toPromise();
// }

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    // {
    //   provide: APP_INITIALIZER,
    //   multi: true,
    //   useFactory: appLoadFactory,
    //   deps: [MediaService],
    // },
  ],
};
